import fp from 'fastify-plugin';
import type { FastifyRequest } from 'fastify';

type StaffMembership = {
  tenant_id: string;
  role: 'admin' | 'manager' | 'staff' | 'kitchen' | 'cashier';
  tenant_code?: string | null;
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
  // PreHandler to authenticate and enrich request with staff memberships
  app.addHook('preHandler', async (req) => {
    // Only guard when Authorization header present; public routes still work
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return;

    const accessToken = authHeader.slice('Bearer '.length);

    // Validate token via Supabase Admin client (service role)
    const { data: { user }, error: authErr } = await app.supabase.auth.getUser(accessToken);
    if (authErr || !user) {
      // leave unauthenticated; don't throw globally, specific routes can require
      return;
    }

    // Fetch staff memberships for this user (multi-tenant)
    const { data: staffRows, error: staffErr } = await app.supabase
      .from('staff')
      .select('tenant_id, role, tenants!inner(code)')
      .eq('user_id', user.id);

    if (staffErr) {
      app.log.error(staffErr, 'Failed to load staff memberships');
      return;
    }

    const memberships: StaffMembership[] = (staffRows ?? []).map((r: any) => ({
      tenant_id: r.tenant_id,
      role: r.role,
      tenant_code: r.tenants?.code ?? null,
    }));

    req.auth = {
      userId: user.id,
      email: user.email ?? null,
      memberships,
      tenantIds: memberships.map(m => m.tenant_id),
      primaryTenantId: memberships[0]?.tenant_id ?? null,
    };
  });

  // Decorate simple guards
  app.decorateReply('requireAuth', function (this: any, req: FastifyRequest) {
    if (!req.auth?.userId) {
      throw this.httpErrors?.unauthorized?.('Missing/invalid token') ?? new Error('Unauthorized');
    }
  });

  app.decorateReply('requireRole', function (this: any, req: FastifyRequest, roles: string[]) {
    if (!req.auth?.userId) {
      throw this.httpErrors?.unauthorized?.('Unauthorized') ?? new Error('Unauthorized');
    }
    const has = req.auth.memberships.some(m => roles.includes(m.role));
    if (!has) {
      throw this.httpErrors?.forbidden?.('Insufficient role') ?? new Error('Forbidden');
    }
  });

  app.decorateReply('requireTenantCtx', function (this: any, req: FastifyRequest, tenantId?: string) {
    if (!req.auth?.userId) {
      throw this.httpErrors?.unauthorized?.('Unauthorized') ?? new Error('Unauthorized');
    }
    const tid = tenantId ?? req.auth.primaryTenantId;
    if (!tid || !req.auth.tenantIds.includes(tid)) {
      throw this.httpErrors?.forbidden?.('No tenant access') ?? new Error('Forbidden');
    }
  });
});