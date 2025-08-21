import { FastifyPluginAsync } from 'fastify';

export const auditRoutes: FastifyPluginAsync = async (fastify) => {
  // Get audit logs
  fastify.get('/', {
    preHandler: [fastify.authenticate, fastify.requireTenant, fastify.requireRole(['admin', 'manager'])]
  }, async (request) => {
    const { limit = 100, offset = 0 } = request.query as { limit?: number; offset?: number };
    
    const logs = await fastify.prisma.auditLog.findMany({
      where: { tenantId: request.user.tenantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset)
    });

    const total = await fastify.prisma.auditLog.count({
      where: { tenantId: request.user.tenantId }
    });

    return { logs, total, limit: Number(limit), offset: Number(offset) };
  });

  // Get audit log by ID
  fastify.get('/:id', {
    preHandler: [fastify.authenticate, fastify.requireTenant, fastify.requireRole(['admin', 'manager'])]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const log = await fastify.prisma.auditLog.findFirst({
      where: {
        id,
        tenantId: request.user.tenantId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!log) {
      return reply.code(404).send({ error: 'Audit log not found' });
    }

    return { log };
  });
};