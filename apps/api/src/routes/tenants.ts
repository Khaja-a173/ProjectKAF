import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const tenantSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  settings: z.record(z.any()).optional()
});

export const tenantRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all tenants (admin only)
  fastify.get('/', {
    preHandler: [fastify.authenticate, fastify.requireRole(['super_admin'])]
  }, async () => {
    const tenants = await fastify.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return { tenants };
  });

  // Get current tenant
  fastify.get('/current', {
    preHandler: [fastify.authenticate, fastify.requireTenant]
  }, async (request) => {
    const tenant = await fastify.prisma.tenant.findUnique({
      where: { id: request.user.tenantId }
    });

    return { tenant };
  });

  // Create tenant (super admin only)
  fastify.post('/', {
    preHandler: [fastify.authenticate, fastify.requireRole(['super_admin'])]
  }, async (request, reply) => {
    try {
      const data = tenantSchema.parse(request.body);
      
      const existingTenant = await fastify.prisma.tenant.findUnique({
        where: { slug: data.slug }
      });

      if (existingTenant) {
        return reply.code(409).send({ error: 'Tenant slug already exists' });
      }

      const tenant = await fastify.prisma.tenant.create({
        data
      });

      return { tenant };
    } catch (error) {
      return reply.code(400).send({ error: 'Invalid request data' });
    }
  });

  // Update tenant
  fastify.put('/:id', {
    preHandler: [fastify.authenticate, fastify.requireRole(['super_admin', 'admin'])]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = tenantSchema.partial().parse(request.body);
      
      // Non-super admins can only update their own tenant
      if (!request.user.roles.includes('super_admin') && id !== request.user.tenantId) {
        return reply.code(403).send({ error: 'Insufficient permissions' });
      }

      const tenant = await fastify.prisma.tenant.update({
        where: { id },
        data
      });

      return { tenant };
    } catch (error) {
      return reply.code(400).send({ error: 'Invalid request data' });
    }
  });

  // Delete tenant (super admin only)
  fastify.delete('/:id', {
    preHandler: [fastify.authenticate, fastify.requireRole(['super_admin'])]
  }, async (request) => {
    const { id } = request.params as { id: string };
    
    await fastify.prisma.tenant.delete({
      where: { id }
    });

    return { success: true };
  });
};