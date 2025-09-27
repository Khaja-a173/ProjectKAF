// server/src/routes/reservations.ts
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { svc } from '../utils/supabase';
import { getRedisClient, buildRedisKey } from '../plugins/redis';

/**
 * Utility: read tenantId that auth plugin should have attached.
 */
function getTenantId(req: FastifyRequest): string {
  const t = (req as any).tenantId as string | undefined;
  if (!t) {
    throw Object.assign(new Error('tenant_not_resolved'), { statusCode: 400 });
  }
  return t;
}

/**
 * Simple time window in minutes to consider a table "occupied" around a reservation.
 * You can tune this from env later if needed.
 */
const RES_WINDOW_MIN = 120;

/**
 * Returns ISO string rounded to minutes, ensuring correct format for Supabase queries.
 */
function toIso(v: unknown): string {
  if (typeof v === 'string') return new Date(v).toISOString();
  if (v instanceof Date) return v.toISOString();
  throw Object.assign(new Error('invalid_datetime'), { statusCode: 400 });
}

export default async function reservationsRoutes(app: FastifyInstance) {
  const redis = await getRedisClient(app);

  // Require auth for mutating endpoints; read endpoints can be public if you want.
  // Here we keep GETs tenant-scoped but not strictly authenticated.
  const requireAuth = (req: FastifyRequest, reply: any) => app.kafRequireAuth(req, reply);

  /**
   * GET /reservations
   * List reservations for current tenant.
   * Optional query:
   *   - at: ISO date/time to filter a specific timeslot window
   *   - table_id: UUID
   *   - status: reserved|cancelled|completed
   */
  app.get('/reservations', async (req, reply) => {
    try {
      const tenantId = getTenantId(req);

      const cacheKey = buildRedisKey('reservations', tenantId, 'list');
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          reply.header('X-Cache', 'HIT');
          return reply.send(JSON.parse(cached));
        }
      }

      const q = req.query as { at?: string; table_id?: string; status?: string };

      let query = svc
        .from('reservations')
        .select('id, tenant_id, table_id, customer_name, guest_count, reservation_time, status, created_at, updated_at')
        .eq('tenant_id', tenantId)
        .order('reservation_time', { ascending: true });

      if (q.table_id) query = query.eq('table_id', q.table_id);
      if (q.status) query = query.eq('status', q.status);

      if (q.at) {
        const atIso = toIso(q.at);
        // window [at-RES_WINDOW_MIN, at+RES_WINDOW_MIN]
        const start = new Date(atIso);
        const end = new Date(atIso);
        start.setMinutes(start.getMinutes() - RES_WINDOW_MIN);
        end.setMinutes(end.getMinutes() + RES_WINDOW_MIN);
        query = query.gte('reservation_time', start.toISOString()).lte('reservation_time', end.toISOString());
      }

      const { data, error } = await query;
      if (error) throw Object.assign(new Error('list_failed'), { statusCode: 500, cause: error });

      if (redis) {
        try { await redis.setex(cacheKey, 60, JSON.stringify({ ok: true, data: data ?? [] })); } catch {}
      }

      return reply.send({ ok: true, data: data ?? [] });
    } catch (e: any) {
      app.log.error({ err: e, route: 'GET /reservations' });
      return reply.status(e.statusCode || 500).send({ ok: false, error: e.message, detail: e.cause });
    }
  });

  /**
   * GET /reservations/:id
   */
  app.get('/reservations/:id', async (req, reply) => {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params as { id: string };

      const cacheKey = buildRedisKey('reservations', tenantId, id);
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          reply.header('X-Cache', 'HIT');
          return reply.send(JSON.parse(cached));
        }
      }

      const { data, error } = await svc
        .from('reservations')
        .select('id, tenant_id, table_id, customer_name, guest_count, reservation_time, status, created_at, updated_at')
        .eq('tenant_id', tenantId)
        .eq('id', id)
        .single();
      if (error) throw Object.assign(new Error('not_found'), { statusCode: 404, cause: error });

      if (redis) {
        try { await redis.setex(cacheKey, 60, JSON.stringify({ ok: true, data })); } catch {}
      }

      return reply.send({ ok: true, data });
    } catch (e: any) {
      app.log.error({ err: e, route: 'GET /reservations/:id' });
      return reply.status(e.statusCode || 500).send({ ok: false, error: e.message, detail: e.cause });
    }
  });

  /**
   * GET /reservations/availability?at=ISO&amp;guests=2
   * Returns list of tables with availability flag for the given slot.
   */
  app.get('/reservations/availability', async (req, reply) => {
    try {
      const tenantId = getTenantId(req);
      const q = req.query as { at?: string; guests?: string | number };

      if (!q.at) throw Object.assign(new Error('missing_at'), { statusCode: 400 });
      const atIso = toIso(q.at);
      const guests = typeof q.guests === 'string' ? parseInt(q.guests, 10) : (q.guests as number | undefined);

      // Load all tables for tenant (optionally filter capacity/seats if your schema has it)
      const { data: tables, error: tErr } = await svc
        .from('tables')
        .select('id, tenant_id, code, label, seats, status')
        .eq('tenant_id', tenantId);

      if (tErr) throw Object.assign(new Error('tables_fetch_failed'), { statusCode: 500, cause: tErr });

      // Fetch overlapping reservations in the time window
      const start = new Date(atIso);
      const end = new Date(atIso);
      start.setMinutes(start.getMinutes() - RES_WINDOW_MIN);
      end.setMinutes(end.getMinutes() + RES_WINDOW_MIN);

      const { data: overlaps, error: rErr } = await svc
        .from('reservations')
        .select('id, table_id, reservation_time, status')
        .eq('tenant_id', tenantId)
        .eq('status', 'reserved')
        .gte('reservation_time', start.toISOString())
        .lte('reservation_time', end.toISOString());

      if (rErr) throw Object.assign(new Error('overlap_fetch_failed'), { statusCode: 500, cause: rErr });

      const reservedSet = new Set(overlaps?.map((r) => r.table_id));
      const items = (tables ?? [])
        .filter(t => !guests || !t.seats || (t.seats >= guests)) // if seats column exists
        .map(t => ({
          table_id: t.id,
          code: t.code,
          label: t.label,
          seats: t.seats ?? null,
          currently_reserved: reservedSet.has(t.id),
          status: t.status ?? null,
        }));

      return reply.send({ ok: true, data: items });
    } catch (e: any) {
      app.log.error({ err: e, route: 'GET /reservations/availability' });
      return reply.status(e.statusCode || 500).send({ ok: false, error: e.message, detail: e.cause });
    }
  });

  /**
   * GET /reservations/available?starts_at=&ends_at=&party_size=
   * Returns the list of FREE tables for the given tenant and time range.
   * Works with both schemas:
   *  - window rows (starts_at/ends_at)
   *  - legacy rows (reservation_time point-in-time) within the window.
   */
  app.get('/reservations/available', async (req, reply) => {
    try {
      const tenantId = getTenantId(req);
      const q = req.query as { starts_at?: string; ends_at?: string; party_size?: string | number };

      if (!q.starts_at || !q.ends_at) {
        throw Object.assign(new Error('missing_range'), { statusCode: 400 });
      }

      let startIso = toIso(q.starts_at);
      let endIso = toIso(q.ends_at);
      if (new Date(startIso) > new Date(endIso)) {
        const tmp = startIso; startIso = endIso; endIso = tmp;
      }
      const partySize = typeof q.party_size === 'string' ? parseInt(q.party_size, 10) : (q.party_size as number | undefined);

      // Load all tables for tenant
      const { data: tables, error: tErr } = await svc
        .from('tables')
        .select('id, tenant_id, code, label, seats, status')
        .eq('tenant_id', tenantId);

      if (tErr) throw Object.assign(new Error('tables_fetch_failed'), { statusCode: 500, cause: tErr });

      // Build OR expression for overlap covering both schemas
      const enc = (s: string) => encodeURIComponent(s);
      const orExpr =
        `and(lte(starts_at,.${enc(endIso)}),gte(ends_at,.${enc(startIso)}))` +
        `,and(gte(reservation_time,.${enc(startIso)}),lte(reservation_time,.${enc(endIso)}))`;

      const { data: overlaps, error: rErr } = await svc
        .from('reservations')
        .select('id, table_id')
        .eq('tenant_id', tenantId)
        .eq('status', 'reserved')
        .or(orExpr);

      if (rErr) throw Object.assign(new Error('overlap_fetch_failed'), { statusCode: 500, cause: rErr });

      const reservedSet = new Set(overlaps?.map(r => r.table_id));
      const free = (tables ?? [])
        .filter(t => !partySize || !t.seats || t.seats >= partySize)
        .filter(t => !reservedSet.has(t.id))
        .map(t => ({
          table_id: t.id,
          code: t.code,
          label: t.label,
          seats: t.seats ?? null,
          status: t.status ?? null,
        }));

      return reply.send({ ok: true, data: free });
    } catch (e: any) {
      app.log.error({ err: e, route: 'GET /reservations/available' });
      return reply.status(e.statusCode || 500).send({ ok: false, error: e.message, detail: e.cause });
    }
  });

  /**
   * POST /reservations
   * Body: { table_id, customer_name, guest_count, reservation_time }
   */
  app.post('/reservations', { preHandler: [requireAuth] }, async (req, reply) => {
    try {
      const tenantId = getTenantId(req);
      const body = (req.body || {}) as Record<string, any>;
      const { table_id, customer_name, guest_count } = body;
      const starts_at_raw = body.starts_at;
      const ends_at_raw = body.ends_at;
      const reservation_time_raw = body.reservation_time;

      if (!table_id || !customer_name || !guest_count || (!starts_at_raw && !reservation_time_raw)) {
        throw Object.assign(new Error('missing_fields'), { statusCode: 400 });
      }

      // Normalize time window
      let startIso: string;
      let endIso: string;
      let legacyPointOnly = false;

      if (starts_at_raw && ends_at_raw) {
        startIso = toIso(starts_at_raw);
        endIso = toIso(ends_at_raw);
        if (new Date(startIso) > new Date(endIso)) {
          const tmp = startIso; startIso = endIso; endIso = tmp;
        }
      } else {
        const atIso = toIso(reservation_time_raw);
        const start = new Date(atIso);
        const end = new Date(atIso);
        start.setMinutes(start.getMinutes() - RES_WINDOW_MIN);
        end.setMinutes(end.getMinutes() + RES_WINDOW_MIN);
        startIso = start.toISOString();
        endIso = end.toISOString();
        legacyPointOnly = true;
      }

      // Check table belongs to tenant
      const { data: table, error: tErr } = await svc
        .from('tables')
        .select('id, tenant_id, seats, status')
        .eq('tenant_id', tenantId)
        .eq('id', table_id)
        .single();
      if (tErr || !table) throw Object.assign(new Error('table_not_found'), { statusCode: 404, cause: tErr });

      // Overlap check (cover both schemas)
      const enc = (s: string) => encodeURIComponent(s);
      const orExpr =
        `and(lte(starts_at,.${enc(endIso)}),gte(ends_at,.${enc(startIso)}))` +
        `,and(gte(reservation_time,.${enc(startIso)}),lte(reservation_time,.${enc(endIso)}))`;

      const { data: overlapping, error: oErr } = await svc
        .from('reservations')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('table_id', table_id)
        .eq('status', 'reserved')
        .or(orExpr);

      if (oErr) throw Object.assign(new Error('overlap_check_failed'), { statusCode: 500, cause: oErr });
      if ((overlapping?.length ?? 0) > 0) {
        return reply.status(409).send({ ok: false, error: 'table_unavailable' });
      }

      // Insert
      const insertPayload: any = {
        tenant_id: tenantId,
        table_id,
        customer_name,
        guest_count,
        status: 'reserved',
      };
      if (legacyPointOnly) {
        // keep legacy column filled for compatibility
        insertPayload.reservation_time = new Date(startIso).toISOString();
      } else {
        insertPayload.starts_at = startIso;
        insertPayload.ends_at = endIso;
        // also set reservation_time for easier reporting
        insertPayload.reservation_time = startIso;
      }

      const { data: created, error: cErr } = await svc
        .from('reservations')
        .insert([insertPayload])
        .select('id, tenant_id, table_id, customer_name, guest_count, reservation_time, starts_at, ends_at, status')
        .single();

      if (cErr) throw Object.assign(new Error('create_failed'), { statusCode: 500, cause: cErr });

      if (redis) {
        const pattern = buildRedisKey('reservations', tenantId, '*');
        let cursor = '0';
        do {
          const [next, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
          cursor = next;
          if (keys.length) await redis.del(...keys);
        } while (cursor !== '0');
      }

      return reply.status(201).send({ ok: true, data: created });
    } catch (e: any) {
      app.log.error({ err: e, route: 'POST /reservations' });
      return reply.status(e.statusCode || 500).send({ ok: false, error: e.message, detail: e.cause });
    }
  });

  /**
   * DELETE /reservations/:id
   * Cancels a reservation (soft cancel).
   */
  app.delete('/reservations/:id', { preHandler: [requireAuth] }, async (req, reply) => {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params as { id: string };

      // Only update rows that belong to tenant
      const { data, error } = await svc
        .from('reservations')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('tenant_id', tenantId)
        .eq('id', id)
        .select('id, status')
        .single();

      if (error) throw Object.assign(new Error('cancel_failed'), { statusCode: 500, cause: error });
      if (!data) return reply.status(404).send({ ok: false, error: 'not_found' });

      if (redis) {
        const pattern = buildRedisKey('reservations', tenantId, '*');
        let cursor = '0';
        do {
          const [next, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
          cursor = next;
          if (keys.length) await redis.del(...keys);
        } while (cursor !== '0');
      }

      return reply.send({ ok: true, data });
    } catch (e: any) {
      app.log.error({ err: e, route: 'DELETE /reservations/:id' });
      return reply.status(e.statusCode || 500).send({ ok: false, error: e.message, detail: e.cause });
    }
  });
}
