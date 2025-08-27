import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

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
  }
  interface FastifyInstance {
    requireAuth: (req: FastifyRequest, reply: FastifyReply) => void | Promise<void>;
    requireRole: (req: FastifyRequest, reply: FastifyReply, roles: string[]) => void | Promise<void>;
  }
}

export default fp(async (app: FastifyInstance) => {
  // --- Keep existing auth parsing & membership load unchanged ---
  app.addHook('preHandler', async (req) => {
    const h = req.headers.authorization;
    if (!h?.startsWith('Bearer ')) return;

    const token = h.slice('Bearer '.length).trim();
    if (!token) return;

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

    const memberships = (staff ?? []) as StaffMembership[];
    req.auth.memberships = memberships;
    req.auth.tenantIds = memberships.map(m => m.tenant_id);
    req.auth.primaryTenantId = memberships[0]?.tenant_id ?? null;
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
}, { name: 'auth-plugin' }); // meta name helps debugging duplicate loads