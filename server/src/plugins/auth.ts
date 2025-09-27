import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const DEV_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isUuid(s?: string): s is string { return !!s && UUID_RE.test(s); }

type StaffMembership = {
  tenant_id: string;
  role: 'admin' | 'manager' | 'staff' | 'kitchen' | 'cashier';
};

declare module 'fastify' {
  interface FastifyRequest {
    auth?: {
      userId: string;
      email?: string | null;
      memberships: StaffMembership[];
      tenantIds: string[];
      primaryTenantId?: string | null;
    }
    tenantId?: string;
  }
  interface FastifyInstance {
    requireAuth: (req: FastifyRequest, reply: FastifyReply) => void | Promise<void>;
    requireRole: (req: FastifyRequest, reply: FastifyReply, roles: string[]) => void | Promise<void>;
    requireTenant: (req: FastifyRequest, reply: FastifyReply) => void | Promise<void>;
  }
}

export default fp(async (app: FastifyInstance) => {
  // Lightweight CORS (no external deps). Handles preflight and sets CORS headers for all responses.
  app.addHook('onRequest', async (req, reply) => {
    const origin = (req.headers.origin as string) || '';
    const allow = !origin || origin === DEV_ORIGIN;

    if (allow) {
      reply.header('Access-Control-Allow-Origin', origin || DEV_ORIGIN);
      reply.header('Vary', 'Origin');
      reply.header('Access-Control-Allow-Credentials', 'true');
      reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      reply.header('Access-Control-Allow-Headers', 'Authorization,Content-Type,X-Tenant-Id,X-User-Id,X-Supabase-Auth');
    }

    // Preflight short-circuit
    if (req.method === 'OPTIONS') {
      return reply.code(204).send();
    }
  });
  // Extract Supabase JWT from Authorization header, cookie, or x-supabase-auth
  function extractToken(req: FastifyRequest): string | null {
    const h = req.headers.authorization;
    if (h && h.startsWith('Bearer ')) {
      return h.slice('Bearer '.length).trim();
    }

    const x = req.headers['x-supabase-auth'];
    if (typeof x === 'string' && x.trim().length > 0) {
      return x.trim();
    }

    // Try cookie header (works even without @fastify/cookie)
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
      const parts = cookieHeader.split(';').map(s => s.trim());
      for (const p of parts) {
        if (p.startsWith('sb-access-token=')) {
          try {
            return decodeURIComponent(p.substring('sb-access-token='.length));
          } catch {
            return p.substring('sb-access-token='.length);
          }
        }
      }
    }

    const parsed = (req as any).cookies?.['sb-access-token'];
    if (typeof parsed === 'string' && parsed.length > 0) return parsed;

    // If @fastify/cookie is registered, prefer parsed cookies
    const anyReq = req as any;
    const fromCookie = anyReq.cookies?.['sb-access-token'];
    if (typeof fromCookie === 'string' && fromCookie.length > 0) {
      return fromCookie;
    }

    return null;
  }

  // --- Keep existing auth parsing & membership load unchanged ---
  app.addHook('preHandler', async (req) => {
    req.tenantId = undefined;

    let token = extractToken(req);
    // If token is still missing, fallback to Supabase session cookie (safe fallback)
    if (!token && typeof req.headers['cookie'] === 'string') {
      const m = req.headers['cookie'].match(/sb-access-token=([^;]+)/);
      if (m && m[1]) {
        try {
          token = decodeURIComponent(m[1]);
        } catch {
          token = m[1];
        }
      }
    }
    if (!token) return;

    const { data, error } = await app.supabase.auth.getUser(token);
    if (!data || typeof data !== 'object' || typeof data.user !== 'object') {
      app.log.error({ data }, 'Invalid response from auth.getUser');
      req.auth = {
        userId: '',
        email: null,
        memberships: [],
        tenantIds: [],
        primaryTenantId: null,
      };
      return;
    }
    if (error || !data?.user) {
      app.log.warn({ error }, 'auth.getUser failed');
      req.auth = {
        userId: '',
        email: null,
        memberships: [],
        tenantIds: [],
        primaryTenantId: null,
      };
      return;
    }

    req.auth = {
      userId: data.user.id,
      email: data.user.email ?? null,
      memberships: [],
      tenantIds: [],
      primaryTenantId: null,
    };

    const { data: staff, error: staffErr } = await app.supabase
      .from('staff')
      .select('tenant_id, role')
      .eq('user_id', data.user.id);

    if (staffErr) {
      app.log.warn({ staffErr }, 'staff lookup failed; continuing');
      return;
    }

    const memberships = (staff ?? []) as StaffMembership[];
    req.auth.memberships = memberships;
    req.auth.tenantIds = memberships.map(m => m.tenant_id);
    req.auth.primaryTenantId = memberships[0]?.tenant_id ?? null;

    // Fallback 1: derive tenant from users table if available
    if (!req.auth.primaryTenantId) {
      const { data: userRow, error: userErr } = await app.supabase
        .from('users')
        .select('tenant_id')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!userErr && userRow?.tenant_id) {
        req.auth.primaryTenantId = userRow.tenant_id;
        if (!req.auth.tenantIds.includes(userRow.tenant_id)) {
          req.auth.tenantIds.push(userRow.tenant_id);
        }
      }
    }

    // Fallback 2: use configured DEV_TENANT_ID (configuration-level default)
    if (!req.auth.primaryTenantId) {
      const cfgTenant = process.env.DEV_TENANT_ID;
      if (cfgTenant && cfgTenant.length > 0) {
        req.auth.primaryTenantId = cfgTenant;
        if (!req.auth.tenantIds.includes(cfgTenant)) {
          req.auth.tenantIds.push(cfgTenant);
        }
      }
    }

    // Pick per-request tenantId
    const headerTid = (typeof req.headers['x-tenant-id'] === 'string' ? (req.headers['x-tenant-id'] as string) : null) || null;
    if (req.auth?.userId) {
      if (headerTid && isUuid(headerTid) && req.auth.tenantIds.includes(headerTid)) {
        req.tenantId = headerTid;
      } else if (req.auth.primaryTenantId) {
        req.tenantId = req.auth.primaryTenantId;
      }
    } else {
      if (headerTid && isUuid(headerTid)) {
        req.tenantId = headerTid;
      }
    }
    if (req.tenantId && !isUuid(headerTid || undefined)) {
      (req.headers as any)['x-tenant-id'] = req.tenantId;
    }

    // Default tenant header if client did not provide one and tenantId is set
    const hasTenantHeader = typeof req.headers['x-tenant-id'] === 'string' && (req.headers['x-tenant-id'] as string).length > 0;
    if (!hasTenantHeader && req.tenantId) {
      (req.headers as any)['x-tenant-id'] = req.tenantId;
    }

    // Debug context (safe): who/which-tenant is this request for?
    app.log.debug({ tenantId: req.tenantId ?? null, userId: req.auth?.userId ?? null }, 'auth.derived_context');
  });

  // ---- Guards (now idempotent) ----

  // A) Reply-level guard for handlers using reply.requireAuth()
  if (!app.hasReplyDecorator('requireAuth')) {
    app.decorateReply('requireAuth', function (this: any, req: FastifyRequest) {
      if (!req.auth?.userId) {
        throw this.httpErrors?.unauthorized?.('Unauthorized') ?? new Error('Unauthorized');
      }
    });
  }

  // B) Instance-level guard for route preHandlers: [app.requireAuth]
  if (!(app as any).requireAuth) {
    app.decorate('requireAuth', async (req: FastifyRequest, reply: FastifyReply) => {
      if (!req.auth?.userId) {
        return reply.code(401).send({ authenticated: false, reason: 'no_token' });
      }
    });
  }

  // C) Role-based guard for route preHandlers
  if (!(app as any).requireRole) {
    app.decorate('requireRole', async (req: FastifyRequest, reply: FastifyReply, roles: string[]) => {
      const ok = !!req.auth?.memberships?.some(m => roles.includes(m.role));
      if (!ok) return reply.code(403).send({ error: 'forbidden' });
    });
  }

  // D) Tenant guard for routes that require a tenant (cart/menu/etc.)
  if (!(app as any).requireTenant) {
    app.decorate('requireTenant', async (req: FastifyRequest, reply: FastifyReply) => {
      const headerTid = typeof req.headers['x-tenant-id'] === 'string' ? (req.headers['x-tenant-id'] as string) : null;
      const tid = req.tenantId || headerTid;
      if (!tid || !isUuid(tid)) {
        return reply.code(400).send({ error: 'missing_or_invalid_tenant' });
      }
    });
  }
}, { name: 'auth-plugin' }); // meta name helps debugging duplicate loads

// --- Added (non-invasive): helper to build per-request Supabase client ---

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
export function buildPerRequestSupabase(url: string, anon: string, bearer?: string) {
  try {
    if (!bearer) return null
    return createSupabaseClient(url, anon, { global: { headers: { Authorization: `Bearer ${bearer}` } } })
  } catch { return null }
}
