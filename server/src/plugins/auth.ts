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
  }
}

export default fp(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (req) => {
    const h = req.headers.authorization;
    if (!h?.startsWith('Bearer ')) return;

    const token = h.slice('Bearer '.length).trim();
    if (!token) return;

    // 1) Validate token
    const { data, error } = await app.supabase.auth.getUser(token);
    if (error || !data?.user) {
      app.log.warn({ error }, 'auth.getUser failed');
      return;
    }

    // 2) Seed auth object
    req.auth = {
      userId: data.user.id,
      email: data.user.email ?? null,
      memberships: [],
      tenantIds: [],
      primaryTenantId: null,
    };

    // 3) Load memberships
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

  // ---- Guards ----

  // A) Keep existing reply-level guard (backward compatible)
  app.decorateReply('requireAuth', function (this: any, req: FastifyRequest) {
    if (!req.auth?.userId) throw this.httpErrors?.unauthorized?.('Unauthorized') ?? new Error('Unauthorized');
  });

  // B) Add instance-level guard for route preHandlers: [app.requireAuth]
  app.decorate('requireAuth', async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.auth?.userId) return reply.code(401).send({ authenticated: false, reason: 'no_token' });
  });
});