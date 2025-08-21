import { FastifyPluginAsync } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      userId: string;
      tenantId: string;
      email: string;
      roles: string[];
    };
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireTenant: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (roles: string[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export const authMiddleware: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('authenticate', async (request, reply) => {
    try {
      const token = await request.jwtVerify();
      request.user = token as any;
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  fastify.decorate('requireTenant', async (request, reply) => {
    if (!request.user?.tenantId) {
      reply.code(403).send({ error: 'Tenant required' });
    }
  });

  fastify.decorate('requireRole', (requiredRoles: string[]) => {
    return async (request, reply) => {
      const userRoles = request.user?.roles || [];
      const hasRole = requiredRoles.some(role => userRoles.includes(role));
      
      if (!hasRole) {
        reply.code(403).send({ error: 'Insufficient permissions' });
      }
    };
  });
};