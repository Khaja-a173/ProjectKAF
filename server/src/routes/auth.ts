// server/src/routes/auth.ts
import type { FastifyInstance } from 'fastify';

export default async function authRoutes(app: FastifyInstance) {
  app.get('/auth/whoami', async (req) => {
    const a = req.auth;
    if (!a?.userId) return { authenticated: false };

    return {
      authenticated: true,
      user_id: a.userId,
      email: a.email ?? null,
      memberships: a.memberships,
      tenant_ids: a.tenantIds,
      primary_tenant_id: a.primaryTenantId ?? null,
    };
  });
}