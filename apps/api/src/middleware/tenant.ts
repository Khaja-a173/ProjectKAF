import { FastifyPluginAsync } from 'fastify';

export const tenantMiddleware: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', async (request, reply) => {
    // Skip tenant validation for auth routes and health check
    if (request.url.startsWith('/api/auth') || request.url === '/health') {
      return;
    }

    // Extract tenant from header or token
    const tenantHeader = request.headers['x-tenant-id'] as string;
    const userTenant = request.user?.tenantId;

    if (userTenant && tenantHeader && userTenant !== tenantHeader) {
      reply.code(403).send({ error: 'Tenant mismatch' });
    }
  });
};