// server/src/routes/auth.ts
import type { FastifyInstance } from 'fastify';

export default async function authRoutes(app: FastifyInstance) {
  const handler = async (req: any, reply: any) => {
    const a = (req as any).auth ?? {};
    reply.header('Content-Type', 'application/json; charset=utf-8');

    if (!a?.userId) {
      return reply.send({
        authenticated: false,
        user: null,
        memberships: [],
        tenant_ids: [],
        primary_tenant_id: null,
        reason: 'no_token'
      });
    }

    try {
      const { data: memberships, error } = await app.supabase
        .from('staff')
        .select('tenant_id, role')
        .eq('user_id', a.userId);

      if (error) {
        app.log.error({ error }, '[auth] failed to fetch memberships');
        return reply.send({ authenticated: false, user: null, memberships: [], tenant_ids: [], primary_tenant_id: null, reason: 'db_error' });
      }

      const tenantIds = memberships?.map((m: any) => m.tenant_id) || [];
      const primaryTenantId = a.primaryTenantId ?? memberships?.[0]?.tenant_id ?? null;

      // ✅ Ensure trial subscription exists for current tenant context
      if (primaryTenantId) {
        try {
          await app.pg.pool.query(
            'select public.ensure_trial_subscription_for_tenant($1)',
            [primaryTenantId]
          );
        } catch (trialErr) {
          app.log.error({ trialErr }, '[auth] failed to ensure trial subscription');
        }
      }

      const role = memberships?.[0]?.role || null;
      const tenantId = memberships?.[0]?.tenant_id || null;

      return reply.send({
        authenticated: true,
        user: {
          id: a.userId,
          email: a.email ?? null,
          role,
          tenantId,
          entitlements: a.entitlements ?? [],
          subscriptionStatus: a.subscriptionStatus ?? null,
          subscriptionPlan: a.subscriptionPlan ?? null,
        },
        memberships: memberships || [],
        tenant_ids: tenantIds,
        primary_tenant_id: primaryTenantId,
      });
    } catch (err: any) {
      app.log.error({ err }, '[auth] unexpected error');
      return reply.send({ authenticated: false, user: null, memberships: [], tenant_ids: [], primary_tenant_id: null, reason: 'server_error' });
    }
  };

  app.get('/auth/whoami', handler);
  app.get('/auth/me', handler);
  app.get('/auth/session', handler);
}