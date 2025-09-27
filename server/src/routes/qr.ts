import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import crypto from 'node:crypto';
import { getRedisClient, buildRedisKey } from '../plugins/redis';

const QrResolveSchema = z.object({
  // Accept tenant code or slug (longer than 10 for slugs like "demo-restaurant")
  code: z.string().min(1).max(64),
  table: z.string().regex(/^T\d{2}$/)
});

const b64u = {
  encode: (buf: Buffer) =>
    buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, ''),
  decode: (str: string) =>
    Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
};

function hmacSign(data: string, secret: string) {
  return b64u.encode(crypto.createHmac('sha256', secret).update(data).digest());
}

function signToken(payload: Record<string, any>, secret: string) {
  const header = { alg: 'HS256', typ: 'KAFQR' };
  const pStr = JSON.stringify(payload);
  const hStr = JSON.stringify(header);
  const b64h = b64u.encode(Buffer.from(hStr));
  const b64p = b64u.encode(Buffer.from(pStr));
  const sig = hmacSign(`${b64h}.${b64p}`, secret);
  return `${b64h}.${b64p}.${sig}`;
}

function verifyToken(token: string, secret: string) {
  const parts = token.split('.');
  if (parts.length !== 3) return { ok: false as const, error: 'malformed' };
  const [b64h, b64p, sig] = parts;
  const expected = hmacSign(`${b64h}.${b64p}`, secret);
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return { ok: false as const, error: 'bad_signature' };
  }
  const payload = JSON.parse(b64u.decode(b64p).toString('utf8'));
  if (payload.exp && Date.now() > Number(payload.exp)) {
    return { ok: false as const, error: 'expired' };
  }
  return { ok: true as const, payload };
}

const QrSignSchema = z.object({
  tenant_id: z.string().uuid(),
  table_id: z.string().uuid(),
  table_number: z.string().min(1).max(10).optional(),
  expires_in: z.number().int().min(60).max(60 * 60 * 24 * 30).optional() // 1m to 30d
});

const QrVerifySchema = z.object({
  token: z.string().min(10)
});

export default async function qrRoutes(app: FastifyInstance) {
  const redis = getRedisClient(app) as import('ioredis').Redis | undefined;

  // --------------------------------------------------------------------------
  // POST /qr/sign  (Admin only) -> returns signed token for (tenant, table)
  // Body: { tenant_id, table_id, table_number?, expires_in? }
  // --------------------------------------------------------------------------
  app.post('/qr/sign', {
    // Require auth if helper exists; otherwise allow (for local bootstrap)
    preHandler: [
      (req, reply) => {
        if (typeof (app as any).kafRequireAuth === 'function') {
          return (app as any).kafRequireAuth(req, reply);
        }
      }
    ]
  }, async (req, reply) => {
    const parsed = QrSignSchema.safeParse((req as any).body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
    }
    const { tenant_id, table_id, table_number, expires_in } = parsed.data;

    // If we have auth context, enforce membership to this tenant
    const auth = (req as any).auth;
    if (auth?.memberships && Array.isArray(auth.memberships)) {
      const member = auth.memberships.find((m: any) => m.tenant_id === tenant_id);
      if (!member) return reply.code(403).send({ error: 'forbidden', reason: 'not_a_member_of_tenant' });
    }

    // Validate table belongs to tenant
    const { data: table, error: tErr } = await app.supabase
      .from('restaurant_tables')
      .select('id, table_number, tenant_id')
      .eq('id', table_id)
      .eq('tenant_id', tenant_id)
      .maybeSingle();

    if (tErr) {
      app.log.error({ err: tErr }, 'qr_sign_table_lookup_failed');
      return reply.code(500).send({ error: 'table_lookup_failed' });
    }
    if (!table) {
      return reply.code(404).send({ error: 'table_not_found' });
    }

    const ttlMs = (expires_in ?? 60 * 60 * 24) * 1000; // default 24h
    const payload = {
      t: tenant_id,
      tb: table_id,
      n: table_number || table.table_number,
      exp: Date.now() + ttlMs,
      v: 1
    };

    const secret = process.env.QR_SIGNING_SECRET || process.env.SUPABASE_SERVICE_ROLE || '';
    if (!secret) return reply.code(500).send({ error: 'signing_secret_missing' });

    const token = signToken(payload, secret);
    return reply.send({
      token,
      qr: `kaf://qr?token=${token}`,
      payload
    });
  });

  // --------------------------------------------------------------------------
  // GET /qr/verify?token=...  (Public) -> verifies token and returns details
  // --------------------------------------------------------------------------
  app.get('/qr/verify', async (req, reply) => {
    const query = QrVerifySchema.safeParse((req as any).query);
    if (!query.success) {
      return reply.code(400).send({ error: 'invalid_query', details: query.error.flatten() });
    }
    const { token } = query.data;

    const secret = process.env.QR_SIGNING_SECRET || process.env.SUPABASE_SERVICE_ROLE || '';
    if (!secret) return reply.code(500).send({ error: 'signing_secret_missing' });

    const v = verifyToken(token, secret);
    if (!v.ok) return reply.code(400).send({ error: 'invalid_token', reason: v.error });

    // Optionally enrich with tenant/table metadata
    const { t: tenantId, tb: tableId, n: num } = v.payload as { t: string; tb: string; n?: string };
    const [{ data: tenant }, { data: table }] = await Promise.all([
      app.supabase.from('tenants').select('id, name, code, slug').eq('id', tenantId).maybeSingle(),
      app.supabase.from('restaurant_tables').select('id, table_number, section, capacity').eq('id', tableId).maybeSingle()
    ]);

    return reply.send({
      ok: true,
      tenant_id: tenantId,
      table_id: tableId,
      table_number: num ?? table?.table_number ?? null,
      tenant: tenant || null,
      table: table || null
    });
  });

  // --------------------------------------------------------------------------
  // GET /qr/resolve?code=<tenantCode>&table=<tableNumber>  (ProjectKAF enriched)
  // --------------------------------------------------------------------------
  app.get('/qr/resolve', async (req, reply) => {
    const query = QrResolveSchema.safeParse((req as any).query);
    if (!query.success) {
      return reply.code(400).send({ error: 'invalid_query', details: query.error.flatten() });
    }
    const { code, table } = query.data;

    try {
      // Lookup tenant by code (case-insensitive) OR by slug (case-insensitive).
      // Do NOT require an `is_active` column (not present in your schema).
      let tenant: any | null = null;

      // 1) Try code (case-insensitive)
      {
        const { data, error } = await app.supabase
          .from('tenants')
          .select('id, name, slug, code')
          .ilike('code', code)
          .maybeSingle();
        if (error) app.log.warn({ err: error }, 'qr_resolve_tenant_code_lookup_failed');
        if (data) tenant = data;
      }

      // 2) Fallback to slug (case-insensitive)
      if (!tenant) {
        const { data, error } = await app.supabase
          .from('tenants')
          .select('id, name, slug, code')
          .ilike('slug', code)
          .maybeSingle();
        if (error) app.log.warn({ err: error }, 'qr_resolve_tenant_slug_lookup_failed');
        if (data) tenant = data;
      }

      if (!tenant) {
        return reply.code(404).send({ error: 'tenant_not_found' });
      }

      // Tenant-scoped cache key and early read
      const cacheKey = buildRedisKey('qr', 'resolve', tenant.id, table);
      if (redis) {
        try {
          const cached = await redis.get(cacheKey);
          if (cached) {
            reply.header('X-Cache', 'HIT');
            return reply.send(JSON.parse(cached));
          }
        } catch (e: any) {
          app.log.warn({ err: e }, 'qr_resolve_cache_error');
        }
      }

      // Canonical source: admin-managed tables (public.tables).
      // Be robust: try table_number first, then code. Select only guaranteed columns.
      let legacy: any = null;
      let legacyErr: any = null;

      {
        const { data, error } = await app.supabase
          .from('tables')
          .select('id, table_number, code, seats, status')
          .eq('tenant_id', tenant.id)
          .eq('table_number', table)
          .maybeSingle();
        if (error) {
          legacyErr = error;
          app.log.warn({ err: error }, 'qr_resolve_tables_lookup_by_table_number_failed');
        }
        if (data) legacy = data;
      }

      if (!legacy) {
        const { data, error } = await app.supabase
          .from('tables')
          .select('id, table_number, code, seats, status')
          .eq('tenant_id', tenant.id)
          .eq('code', table)
          .maybeSingle();
        if (error) {
          legacyErr = error;
          app.log.warn({ err: error }, 'qr_resolve_tables_lookup_by_code_failed');
        }
        if (data) legacy = data;
      }

      if (!legacy) {
        return reply.code(404).send({ error: 'table_not_found' });
      }

      const tableData = {
        id: legacy.id,
        table_number: legacy.table_number ?? legacy.code,
        section: null as any, // section may not exist in legacy schema
        capacity: legacy.seats,
        status: legacy.status ?? 'available'
      };

      // Get branding (safe fallback if missing)
      const { data: branding } = await app.supabase
        .from('tenant_branding')
        .select('theme, logo_url, hero_video_url')
        .eq('tenant_id', tenant.id)
        .maybeSingle();

      // Get menu categories
      const { data: categories } = await app.supabase
        .from('categories')
        .select('id, name, description, sort_order')
        .eq('tenant_id', tenant.id)
        .eq('is_active', true)
        .order('sort_order');

      // Get menu items
      const { data: items } = await app.supabase
        .from('menu_items')
        .select('id, name, description, price, image_url, is_available, preparation_time, calories, allergens, dietary_info, is_featured, sort_order')
        .eq('tenant_id', tenant.id)
        .eq('is_available', true)
        .order('sort_order');

      const responsePayload = {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          code: tenant.code
        },
        table: {
          id: tableData.id,
          table_number: tableData.table_number,
          section: tableData.section,
          status: tableData.status,
          capacity: tableData.capacity
        },
        branding: branding || { theme: {}, logo_url: null, hero_video_url: null },
        menu_bootstrap: {
          categories: categories || [],
          items: items || []
        }
      };

      if (redis) {
        try {
          await redis.setex(cacheKey, 60, JSON.stringify(responsePayload));
        } catch (e: any) {
          app.log.warn({ err: e }, 'qr_resolve_cache_set_failed');
        }
      }
      reply.header('X-Cache', 'MISS');
      return reply.send(responsePayload);
    } catch (err: any) {
      app.log.error({ err }, 'qr_resolve_failed');
      return reply.code(500).send({ error: 'qr_resolve_failed' });
    }
  });

  // --------------------------------------------------------------------------
  // GET /qr/:tenantCode/:tableNumber  (Part2 compatibility, simpler payload)
  // --------------------------------------------------------------------------
  app.get<{
    Params: { tenantCode: string; tableNumber: string }
  }>('/qr/:tenantCode/:tableNumber', async (req, reply) => {
    const { tenantCode, tableNumber } = req.params;

    try {
      // Find tenant by code
      const { data: tenant, error: tErr } = await app.supabase
        .from('tenants')
        .select('id, name, code')
        .ilike('code', tenantCode)
        .maybeSingle();
      if (tErr) throw tErr;
      if (!tenant) return reply.code(404).send({ error: 'tenant_not_found' });

      const cacheKey = buildRedisKey('qr', 'simple', tenant.id, tableNumber);
      if (redis) {
        try {
          const cached = await redis.get(cacheKey);
          if (cached) {
            reply.header('X-Cache', 'HIT');
            return reply.send(JSON.parse(cached));
          }
        } catch (e: any) {
          app.log.warn({ err: e }, 'qr_simple_cache_error');
        }
      }

      let legacy: any = null;

      {
        const { data, error } = await app.supabase
          .from('tables')
          .select('id, table_number, code, seats')
          .eq('tenant_id', tenant.id)
          .eq('table_number', tableNumber)
          .maybeSingle();
        if (error) app.log.warn({ err: error }, 'qr_simple_tables_lookup_by_table_number_failed');
        if (data) legacy = data;
      }

      if (!legacy) {
        const { data, error } = await app.supabase
          .from('tables')
          .select('id, table_number, code, seats')
          .eq('tenant_id', tenant.id)
          .eq('code', tableNumber)
          .maybeSingle();
        if (error) app.log.warn({ err: error }, 'qr_simple_tables_lookup_by_code_failed');
        if (data) legacy = data;
      }

      if (!legacy) return reply.code(404).send({ error: 'table_not_found' });

      const responsePayload = {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          code: tenant.code
        },
        table: {
          id: legacy.id,
          number: legacy.table_number ?? legacy.code,
          section: null as any,
          capacity: legacy.seats
        }
      };

      if (redis) {
        try {
          await redis.setex(cacheKey, 60, JSON.stringify(responsePayload));
        } catch (e: any) {
          app.log.warn({ err: e }, 'qr_simple_cache_set_failed');
        }
      }
      reply.header('X-Cache', 'MISS');
      return reply.send(responsePayload);
    } catch (err: any) {
      app.log.error({ err }, 'qr_simple_failed');
      return reply.code(500).send({ error: 'qr_simple_failed' });
    }
  });
}