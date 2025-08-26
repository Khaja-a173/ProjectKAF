import type { FastifyInstance } from 'fastify';

export default async function authRoutes(app: FastifyInstance) {
  // Returns the authenticated user + memberships (if token provided)
  app.get('/auth/whoami', async (req, reply) => {
    if (!req.auth?.userId) {
      return reply.code(200).send({ authenticated: false });
    }

    return reply.send({
      authenticated: true,
      user_id: req.auth.userId,
      email: req.auth.email,
      memberships: req.auth.memberships,
      tenant_ids: req.auth.tenantIds,
      primary_tenant_id: req.auth.primaryTenantId,
    });
  });
}