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
  app.addHook('preHandler', async (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return;

    const accessToken = authHeader.slice('Bearer '.length);

    // 1) Validate token
    const { data: { user }, error: authErr } = await app.supabase.auth.getUser(accessToken);
    if (authErr || !user) {
      app.log.warn({ authErr }, 'Token validation failed');
      return; // unauthenticated
    }

    // 2) Mark authenticated EARLY
    req.auth = {
      userId: user.id,
      email: user.email ?? null,
      memberships: [],
      tenantIds: [],
      primaryTenantId: null,
    };

    // 3) Best-effort memberships WITHOUT joins
    const { data: staffRows, error: staffErr } = await app.supabase
      .from('staff')
      .select('tenant_id, role')
      .eq('user_id', user.id);

    if (staffErr) {
      app.log.warn({ staffErr }, 'Staff membership load failed; continuing as authenticated with no memberships');
      return;
    }

    const memberships: StaffMembership[] = (staffRows ?? []).map((r: any) => ({
      tenant_id: r.tenant_id,
      role: r.role,
      tenant_code: null,
    }));

    req.auth.memberships = memberships;
    req.auth.tenantIds = memberships.map(m => m.tenant_id);
    req.auth.primaryTenantId = memberships[0]?.tenant_id ?? null;
  });

  // Guards
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