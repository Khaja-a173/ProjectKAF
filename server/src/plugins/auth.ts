// server/src/plugins/auth.ts
import fp from 'fastify-plugin';
import type { FastifyRequest } from 'fastify';

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
}

export default fp(async (app) => {
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

    // 2) Mark authenticated immediately
    req.auth = {
      userId: data.user.id,
      email: data.user.email ?? null,
      memberships: [],
      tenantIds: [],
      primaryTenantId: null,
    };

    // 3) Best-effort membership load (no joins)
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

  // Guards
  app.decorateReply('requireAuth', function (this: any, req: FastifyRequest) {
    if (!req.auth?.userId) throw this.httpErrors?.unauthorized?.('Unauthorized') ?? new Error('Unauthorized');
  });
});