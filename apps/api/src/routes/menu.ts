import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const menuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  categoryId: z.string(),
  available: z.boolean().default(true),
  image: z.string().url().optional()
});

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  sortOrder: z.number().default(0)
});

export const menuRoutes: FastifyPluginAsync = async (fastify) => {
  // Get menu items
  fastify.get('/items', {
    preHandler: [fastify.authenticate, fastify.requireTenant]
  }, async (request) => {
    const items = await fastify.prisma.menuItem.findMany({
      where: { tenantId: request.user.tenantId },
      include: {
        category: true
      },
      orderBy: [
        { category: { sortOrder: 'asc' } },
        { name: 'asc' }
      ]
    });

    return { items };
  });

  // Create menu item
  fastify.post('/items', {
    preHandler: [fastify.authenticate, fastify.requireTenant, fastify.requireRole(['admin', 'manager'])]
  }, async (request, reply) => {
    try {
      const data = menuItemSchema.parse(request.body);
      
      const item = await fastify.prisma.menuItem.create({
        data: {
          ...data,
          tenantId: request.user.tenantId
        },
        include: {
          category: true
        }
      });

      return { item };
    } catch (error) {
      return reply.code(400).send({ error: 'Invalid request data' });
    }
  });

  // Update menu item
  fastify.put('/items/:id', {
    preHandler: [fastify.authenticate, fastify.requireTenant, fastify.requireRole(['admin', 'manager'])]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = menuItemSchema.partial().parse(request.body);
      
      const item = await fastify.prisma.menuItem.update({
        where: {
          id,
          tenantId: request.user.tenantId
        },
        data,
        include: {
          category: true
        }
      });

      return { item };
    } catch (error) {
      return reply.code(400).send({ error: 'Invalid request data' });
    }
  });

  // Delete menu item
  fastify.delete('/items/:id', {
    preHandler: [fastify.authenticate, fastify.requireTenant, fastify.requireRole(['admin', 'manager'])]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    
    await fastify.prisma.menuItem.delete({
      where: {
        id,
        tenantId: request.user.tenantId
      }
    });

    return { success: true };
  });

  // Get categories
  fastify.get('/categories', {
    preHandler: [fastify.authenticate, fastify.requireTenant]
  }, async (request) => {
    const categories = await fastify.prisma.category.findMany({
      where: { tenantId: request.user.tenantId },
      orderBy: { sortOrder: 'asc' }
    });

    return { categories };
  });

  // Create category
  fastify.post('/categories', {
    preHandler: [fastify.authenticate, fastify.requireTenant, fastify.requireRole(['admin', 'manager'])]
  }, async (request, reply) => {
    try {
      const data = categorySchema.parse(request.body);
      
      const category = await fastify.prisma.category.create({
        data: {
          ...data,
          tenantId: request.user.tenantId
        }
      });

      return { category };
    } catch (error) {
      return reply.code(400).send({ error: 'Invalid request data' });
    }
  });
};