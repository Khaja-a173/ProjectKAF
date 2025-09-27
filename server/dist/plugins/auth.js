import fp from 'fastify-plugin';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isUuid(s) { return !!s && UUID_RE.test(s); }
export default fp(async (app) => {
    // Extract Supabase JWT from Authorization header, cookie, or x-supabase-auth
    function extractToken(req) {
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
                    }
                    catch {
                        return p.substring('sb-access-token='.length);
                    }
                }
            }
        }
        // If @fastify/cookie is registered, prefer parsed cookies
        const anyReq = req;
        const fromCookie = anyReq.cookies?.['sb-access-token'];
        if (typeof fromCookie === 'string' && fromCookie.length > 0) {
            return fromCookie;
        }
        return null;
    }
    // --- Keep existing auth parsing & membership load unchanged ---
    app.addHook('preHandler', async (req) => {
        req.tenantId = undefined;
        const token = extractToken(req);
        if (!token)
            return;
        const { data, error } = await app.supabase.auth.getUser(token);
        if (error || !data?.user) {
            app.log.warn({ error }, 'auth.getUser failed');
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
        const memberships = (staff ?? []);
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
        const headerTid = (typeof req.headers['x-tenant-id'] === 'string' ? req.headers['x-tenant-id'] : null) || null;
        if (req.auth?.userId) {
            if (headerTid && isUuid(headerTid) && req.auth.tenantIds.includes(headerTid)) {
                req.tenantId = headerTid;
            }
            else if (req.auth.primaryTenantId) {
                req.tenantId = req.auth.primaryTenantId;
            }
        }
        else {
            if (headerTid && isUuid(headerTid)) {
                req.tenantId = headerTid;
            }
        }
        if (req.tenantId && !isUuid(headerTid || undefined)) {
            req.headers['x-tenant-id'] = req.tenantId;
        }
        // Default tenant header if client did not provide one and tenantId is set
        const hasTenantHeader = typeof req.headers['x-tenant-id'] === 'string' && req.headers['x-tenant-id'].length > 0;
        if (!hasTenantHeader && req.tenantId) {
            req.headers['x-tenant-id'] = req.tenantId;
        }
        // Debug context (safe): who/which-tenant is this request for?
        app.log.debug({ tenantId: req.tenantId ?? null, userId: req.auth?.userId ?? null }, 'auth.derived_context');
    });
    // ---- Guards (now idempotent) ----
    // A) Reply-level guard for handlers using reply.requireAuth()
    if (!app.hasReplyDecorator('requireAuth')) {
        app.decorateReply('requireAuth', function (req) {
            if (!req.auth?.userId) {
                throw this.httpErrors?.unauthorized?.('Unauthorized') ?? new Error('Unauthorized');
            }
        });
    }
    // B) Instance-level guard for route preHandlers: [app.requireAuth]
    if (!app.requireAuth) {
        app.decorate('requireAuth', async (req, reply) => {
            if (!req.auth?.userId) {
                return reply.code(401).send({ authenticated: false, reason: 'no_token' });
            }
        });
    }
    // C) Role-based guard for route preHandlers
    if (!app.requireRole) {
        app.decorate('requireRole', async (req, reply, roles) => {
            const ok = !!req.auth?.memberships?.some(m => roles.includes(m.role));
            if (!ok)
                return reply.code(403).send({ error: 'forbidden' });
        });
    }
    // D) Tenant guard for routes that require a tenant (cart/menu/etc.)
    if (!app.requireTenant) {
        app.decorate('requireTenant', async (req, reply) => {
            const headerTid = typeof req.headers['x-tenant-id'] === 'string' ? req.headers['x-tenant-id'] : null;
            const tid = req.tenantId || headerTid;
            if (!tid || !isUuid(tid)) {
                return reply.code(400).send({ error: 'missing_or_invalid_tenant' });
            }
        });
    }
}, { name: 'auth-plugin' }); // meta name helps debugging duplicate loads
// --- Added (non-invasive): helper to build per-request Supabase client ---
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
export function buildPerRequestSupabase(url, anon, bearer) {
    try {
        if (!bearer)
            return null;
        return createSupabaseClient(url, anon, { global: { headers: { Authorization: `Bearer ${bearer}` } } });
    }
    catch {
        return null;
    }
}
