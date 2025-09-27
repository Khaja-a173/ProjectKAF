// server/src/routes/tables.ts
import type { FastifyPluginCallback, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import type { Redis } from 'ioredis';
import crypto from 'crypto';

const StatusEnum = z.enum(['available', 'held', 'occupied', 'cleaning', 'out-of-service']);

const TableRow = z.object({
  code: z.string().min(1, 'code required'),
  label: z.string().min(1).optional(),        // default to code
  seats: z.number().int().positive('seats must be > 0'),
  status: StatusEnum.default('available'),
  zone: z.string().min(1, 'zone required'),
});

type TableRowT = z.infer<typeof TableRow>;

const BulkBodyUnion = z.union([
  z.object({ rows: z.array(TableRow).min(1) }),
  z.object({ tables: z.array(TableRow).min(1) }),
  z.array(TableRow).min(1),
]);

const normalizeBulk = (body: unknown): TableRowT[] => {
  const parsed = BulkBodyUnion.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.flatten();
    const msg = (details.fieldErrors && Object.entries(details.fieldErrors)
      .map(([k, v]) => `${k}: ${v?.join(', ')}`).join(' | ')) || 'Invalid payload';
    const err = new Error(msg) as any;
    err._zod = details;
    throw err;
  }
  if (Array.isArray(parsed.data)) return parsed.data;
  if ('rows' in parsed.data) return parsed.data.rows;
  return (parsed.data as any).tables;
};

// Table hold/promote/release schemas
const HoldBody = z.object({
  table_id: z.string().uuid().optional(),
  table_code: z.string().min(1).optional(),
  ttl_seconds: z.number().int().positive().max(60 * 60).default(300).optional(),
}).refine(v => !!(v.table_id || v.table_code), { message: 'table_id or table_code required' });

const PromoteBody = z.object({
  table_id: z.string().uuid().optional(),
  table_code: z.string().min(1).optional(),
  order_id: z.string().optional(),
}).refine(v => !!(v.table_id || v.table_code), { message: 'table_id or table_code required' });

const ReleaseBody = z.object({
  table_id: z.string().uuid().optional(),
  table_code: z.string().min(1).optional(),
}).refine(v => !!(v.table_id || v.table_code), { message: 'table_id or table_code required' });

const SearchAvailBody = z.object({
  starts_at: z.string().datetime().optional(),
  ends_at: z.string().datetime().optional(),
  party_size: z.number().int().positive().optional(),
  zone: z.string().optional(),
});

const tablesRoutes: FastifyPluginCallback = (fastify, _opts, done) => {
  const supabase = (fastify as any).supabase as import('@supabase/supabase-js').SupabaseClient;
  const redis = (fastify as any).redis as Redis | undefined;

  const requireTenant = (req: FastifyRequest, rep: FastifyReply): string | null => {
    const hdr = req.headers['x-tenant-id'];
    const tenantId = typeof hdr === 'string' ? hdr : Array.isArray(hdr) ? hdr[0] : undefined;
    if (!tenantId) { rep.code(400).send({ error: 'Missing X-Tenant-Id' }); return null; }
    return tenantId;
  };

  const invalidateTablesCache = async (tenantId: string) => {
    if (!redis) return;
    const ns = process.env.REDIS_NAMESPACE || 'pkaf';
    const tablesKey = `${ns}:tables:${tenantId}`;

    // 1) Invalidate tables list cache
    try {
      await redis.del(tablesKey);
    } catch (e) {
      fastify.log.warn({ err: e }, 'tables cache invalidate failed');
    }

    // 2) Invalidate QR caches for this tenant (resolve + simple)
    const patterns = [
      `${ns}:qr:resolve:${tenantId}:*`,
      `${ns}:qr:simple:${tenantId}:*`,
    ];

    for (const pattern of patterns) {
      try {
        let cursor = '0';
        do {
          const [next, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
          cursor = next;
          if (keys && keys.length) {
            await redis.del(...keys);
          }
        } while (cursor !== '0');
      } catch (e) {
        fastify.log.warn({ err: e, pattern }, 'qr cache invalidate failed');
      }
    }
  };

  // GET /api/tables
  fastify.get('/', async (req, rep) => {
    const tenantId = requireTenant(req, rep); if (!tenantId) return;
    const cacheKey = `${process.env.REDIS_NAMESPACE || 'pkaf'}:tables:${tenantId}`;

    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          const parsedCache = JSON.parse(cached);
          const etag = parsedCache.etag; // already quoted below when we store
          const ifNone = (req.headers['if-none-match'] as string | undefined) || undefined;
          rep.header('Cache-Control', 'public, max-age=60');
          rep.header('Vary', 'Origin, X-Tenant-Id');
          rep.header('X-Cache', 'HIT');
          rep.header('ETag', etag);
          if (ifNone) {
            const list = ifNone.split(',').map(s => s.trim());
            const match = list.some(tag => tag === etag || tag === `W/${etag}`);
            if (match) {
              return rep.code(304).send();
            }
          }
          return rep.send(parsedCache.data);
        }
      } catch (e) {
        fastify.log.warn({ err: e }, 'redis get failed');
      }
    }

    const { data, error } = await supabase
      .from('tables')
      .select('id,tenant_id,code,label,seats,status,zone,is_locked,created_at,updated_at')
      .eq('tenant_id', tenantId)
      .order('code', { ascending: true });

    if (error) {
      fastify.log.error({ err: error }, 'tables list failed');
      return rep.code(500).send({ error: 'tables list failed', details: error.message });
    }

    const respData = data ?? [];
    const bodyStr = JSON.stringify(respData);
    const etag = '"' + crypto.createHash('sha1').update(bodyStr).digest('hex') + '"';

    const ifNone = (req.headers['if-none-match'] as string | undefined) || undefined;
    rep.header('Cache-Control', 'public, max-age=60');
    rep.header('Vary', 'Origin, X-Tenant-Id');
    rep.header('X-Cache', 'MISS');
    rep.header('ETag', etag);

    if (ifNone) {
      const list = ifNone.split(',').map(s => s.trim());
      const match = list.some(tag => tag === etag || tag === `W/${etag}`);
      if (match) {
        return rep.code(304).send();
      }
    }

    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify({ etag, data: respData }), 'EX', 60);
      } catch (e) {
        fastify.log.warn({ err: e }, 'redis set failed');
      }
    }

    return rep.send(respData);
  });

  // POST /api/tables/bulk
  fastify.post('/bulk', async (req, rep) => {
    const tenantId = requireTenant(req, rep); if (!tenantId) return;

    let rows: TableRowT[];
    try {
      rows = normalizeBulk(req.body);
    } catch (e: any) {
      return rep.code(400).send({ error: 'invalid_body', message: e.message, zod: e._zod });
    }

    // sanitize / defaults
    const upserts = rows.map(r => ({
      tenant_id: tenantId,
      code: r.code,
      label: r.label ?? r.code,
      seats: Number.isFinite(r.seats) ? r.seats : 4,
      status: r.status,
      zone: r.zone,
      is_locked: false,
    }));

    const { data, error } = await supabase
      .from('tables')
      // onConflict composite is (tenant_id, code) to keep codes unique per tenant
      .upsert(upserts, { onConflict: 'tenant_id,code' })
      .select('id,tenant_id,code,label,seats,status,zone,is_locked,created_at,updated_at');

    if (error) {
      fastify.log.error({ err: error }, 'tables bulk upsert failed');
      return rep.code(500).send({ error: 'tables bulk upsert failed', details: error.message });
    }

    await invalidateTablesCache(tenantId);
    return rep.send(data ?? []);
  });

  // POST /api/tables/delete-bulk
  fastify.post('/delete-bulk', async (req, rep) => {
    const tenantId = requireTenant(req, rep); if (!tenantId) return;

    const parsed = z.object({ ids: z.array(z.string().min(1)).min(1) }).safeParse(req.body);
    if (!parsed.success) {
      return rep.code(400).send({ error: 'invalid_body', message: parsed.error.message, zod: parsed.error.flatten() });
    }

    const { error, count } = await supabase
      .from('tables')
      .delete({ count: 'exact' })
      .eq('tenant_id', tenantId)
      .in('id', parsed.data.ids);

    if (error) {
      fastify.log.error({ err: error }, 'tables delete-bulk failed');
      return rep.code(500).send({ error: 'tables delete-bulk failed', details: error.message });
    }

    await invalidateTablesCache(tenantId);
    return rep.send({ deleted: count ?? 0 });
  });

  // DELETE /api/tables/:id
  fastify.delete('/:id', async (req, rep) => {
    const tenantId = requireTenant(req, rep); if (!tenantId) return;
    const id = (req.params as any)?.id as string;
    if (!id) return rep.code(400).send({ error: 'missing table id' });

    const { error, count } = await supabase
      .from('tables')
      .delete({ count: 'exact' })
      .eq('tenant_id', tenantId)
      .eq('id', id);

    if (error) {
      fastify.log.error({ err: error }, 'table delete failed');
      return rep.code(500).send({ error: 'table delete failed', details: error.message });
    }

    await invalidateTablesCache(tenantId);
    return rep.send({ deleted: count ?? 0 });
  });

  // POST /api/tables/hold – create a short hold session and set table to held
  fastify.post('/hold', async (req, rep) => {
    const tenantId = requireTenant(req, rep); if (!tenantId) return;
    const parsed = HoldBody.safeParse(req.body);
    if (!parsed.success) return rep.code(400).send({ error: 'invalid_body', message: parsed.error.message, zod: parsed.error.flatten() });
    const { table_id, table_code } = parsed.data;
    const ttl = parsed.data.ttl_seconds ?? 300;

    // 1) Resolve table
    const tblQuery = supabase
      .from('tables')
      .select('id,tenant_id,code,status,zone,label,seats,is_locked,created_at,updated_at')
      .eq('tenant_id', tenantId)
      .limit(1);
    const { data: tableRows, error: tErr } = table_id
      ? await tblQuery.eq('id', table_id)
      : await tblQuery.eq('code', table_code as string);
    if (tErr) { fastify.log.error({ err: tErr }, 'tables hold: fetch table failed'); return rep.code(500).send({ error: 'tables hold failed' }); }
    const table = tableRows?.[0];
    if (!table) return rep.code(404).send({ error: 'table_not_found' });

    // 2) Precondition: only available can be held
    if (table.status !== 'available') return rep.code(409).send({ error: 'table_not_available', status: table.status });

    // 3) Update table status optimistically (guarded by status)
    const { error: uErr } = await supabase
      .from('tables')
      .update({ status: 'held' })
      .eq('tenant_id', tenantId)
      .eq('id', table.id)
      .eq('status', 'available');
    if (uErr) {
      fastify.log.error({ err: uErr }, 'tables hold: update status failed');
      return rep.code(500).send({ error: 'tables hold failed', details: uErr.message });
    }

    // 4) Create/refresh a hold session (latest only)
    const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
    const { error: sErr } = await supabase
      .from('table_sessions')
      .insert({
        tenant_id: tenantId,
        table_id: table.id,
        status: 'hold',
        expires_at: expiresAt,
      });
    if (sErr) {
      fastify.log.error({ err: sErr }, 'tables hold: create session failed');
      return rep.code(500).send({ error: 'tables hold failed', details: sErr.message });
    }

    // 5) Return fresh table
    const { data: fresh, error: fErr } = await supabase
      .from('tables')
      .select('id,tenant_id,code,label,seats,status,zone,is_locked,created_at,updated_at')
      .eq('tenant_id', tenantId)
      .eq('id', table.id)
      .limit(1);
    if (fErr) {
      fastify.log.error({ err: fErr }, 'tables hold: fetch fresh failed');
      return rep.code(500).send({ error: 'tables hold failed', details: fErr.message });
    }
    await invalidateTablesCache(tenantId);
    return rep.send(fresh?.[0] ?? table);
  });

  // POST /api/tables/promote – promote a hold to occupied when order starts
  fastify.post('/promote', async (req, rep) => {
    const tenantId = requireTenant(req, rep); if (!tenantId) return;
    const parsed = PromoteBody.safeParse(req.body);
    if (!parsed.success) return rep.code(400).send({ error: 'invalid_body', message: parsed.error.message, zod: parsed.error.flatten() });
    const { table_id, table_code, order_id } = parsed.data;

    // Resolve table
    const tblQuery = supabase
      .from('tables')
      .select('id,tenant_id,code,status')
      .eq('tenant_id', tenantId)
      .limit(1);
    const { data: tableRows, error: tErr } = table_id
      ? await tblQuery.eq('id', table_id)
      : await tblQuery.eq('code', table_code as string);
    if (tErr) { fastify.log.error({ err: tErr }, 'tables promote: fetch table failed'); return rep.code(500).send({ error: 'tables promote failed' }); }
    const table = tableRows?.[0];
    if (!table) return rep.code(404).send({ error: 'table_not_found' });

    // Precondition
    if (table.status !== 'held' && table.status !== 'available') {
      return rep.code(409).send({ error: 'table_not_in_holdable_state', status: table.status });
    }

    // Update table → occupied
    const { error: uErr } = await supabase
      .from('tables')
      .update({ status: 'occupied' })
      .eq('tenant_id', tenantId)
      .eq('id', table.id)
      .in('status', ['held','available']);
    if (uErr) { fastify.log.error({ err: uErr }, 'tables promote: update status failed'); return rep.code(500).send({ error: 'tables promote failed' }); }

    // Mark latest hold session active (best-effort)
    const { data: sessions, error: sErr } = await supabase
      .from('table_sessions')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('table_id', table.id)
      .order('created_at', { ascending: false })
      .limit(1);
    if (!sErr && sessions?.[0]?.id) {
      await supabase
        .from('table_sessions')
        .update({ status: 'active', order_id: order_id ?? null })
        .eq('tenant_id', tenantId)
        .eq('id', sessions[0].id);
    }

    const { data: fresh } = await supabase
      .from('tables')
      .select('id,tenant_id,code,label,seats,status,zone,is_locked,created_at,updated_at')
      .eq('tenant_id', tenantId)
      .eq('id', table.id)
      .limit(1);
    await invalidateTablesCache(tenantId);
    return rep.send(fresh?.[0] ?? table);
  });

  // POST /api/tables/release – close session and free the table
  fastify.post('/release', async (req, rep) => {
    const tenantId = requireTenant(req, rep); if (!tenantId) return;
    const parsed = ReleaseBody.safeParse(req.body);
    if (!parsed.success) return rep.code(400).send({ error: 'invalid_body', message: parsed.error.message, zod: parsed.error.flatten() });
    const { table_id, table_code } = parsed.data;

    // Resolve table
    const tblQuery = supabase
      .from('tables')
      .select('id,tenant_id,code,status')
      .eq('tenant_id', tenantId)
      .limit(1);
    const { data: tableRows, error: tErr } = table_id
      ? await tblQuery.eq('id', table_id)
      : await tblQuery.eq('code', table_code as string);
    if (tErr) { fastify.log.error({ err: tErr }, 'tables release: fetch table failed'); return rep.code(500).send({ error: 'tables release failed' }); }
    const table = tableRows?.[0];
    if (!table) return rep.code(404).send({ error: 'table_not_found' });

    // Update table → available (from occupied/held)
    const { error: uErr } = await supabase
      .from('tables')
      .update({ status: 'available', is_locked: false })
      .eq('tenant_id', tenantId)
      .eq('id', table.id)
      .in('status', ['occupied','held']);
    if (uErr) { fastify.log.error({ err: uErr }, 'tables release: update status failed'); return rep.code(500).send({ error: 'tables release failed' }); }

    // Close latest active/hold session (best-effort)
    const { data: sessions } = await supabase
      .from('table_sessions')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('table_id', table.id)
      .order('created_at', { ascending: false })
      .limit(1);
    if (sessions?.[0]?.id) {
      await supabase
        .from('table_sessions')
        .update({ status: 'closed' })
        .eq('tenant_id', tenantId)
        .eq('id', sessions[0].id);
    }

    const { data: fresh } = await supabase
      .from('tables')
      .select('id,tenant_id,code,label,seats,status,zone,is_locked,created_at,updated_at')
      .eq('tenant_id', tenantId)
      .eq('id', table.id)
      .limit(1);
    await invalidateTablesCache(tenantId);
    return rep.send(fresh?.[0] ?? table);
  });

  // POST /api/tables/search-available – list currently available tables (optionally filter by zone)
  fastify.post('/search-available', async (req, rep) => {
    const tenantId = requireTenant(req, rep); if (!tenantId) return;
    const parsed = SearchAvailBody.safeParse(req.body);
    if (!parsed.success) {
      return rep.code(400).send({ error: 'invalid_body', message: parsed.error.message, zod: parsed.error.flatten() });
    }

    const q = supabase
      .from('tables')
      .select('id,tenant_id,code,label,seats,status,zone,is_locked,created_at,updated_at')
      .eq('tenant_id', tenantId)
      .eq('status', 'available')
      .order('code', { ascending: true });

    if (parsed.data.zone) {
      (q as any).eq('zone', parsed.data.zone);
    }

    const { data, error } = await q;
    if (error) {
      fastify.log.error({ err: error }, 'tables search-available failed');
      return rep.code(500).send({ error: 'tables search-available failed', details: error.message });
    }

    return rep.send({ available: data ?? [] });
  });

  done();
};

export default tablesRoutes;