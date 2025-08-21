import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6).optional(),
  roles: z.array(z.string()).optional()
});

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  // Get users
  fastify.get('/', {
    preHandler: [fastify.authenticate, fastify.requireTenant, fastify.requireRole(['admin', 'manager'])]
  }, async (request) => {
    const users = await fastify.prisma.user.findMany({
      where: { tenantId: request.user.tenantId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        roles: {
          include: {
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { users };
  });

  // Create user
  fastify.post('/', {
    preHandler: [fastify.authenticate, fastify.requireTenant, fastify.requireRole(['admin'])]
  }, async (request, reply) => {
    try {
      const { password, roles, ...userData } = userSchema.parse(request.body);
      
      const existingUser = await fastify.prisma.user.findFirst({
        where: {
          email: userData.email,
          tenantId: request.user.tenantId
        }
      });

      if (existingUser) {
        return reply.code(409).send({ error: 'User already exists' });
      }

      const hashedPassword = password ? await bcrypt.hash(password, 10) : await bcrypt.hash('defaultpass123', 10);
      
      const user = await fastify.prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          tenantId: request.user.tenantId
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        }
      });

      // Assign roles if provided
      if (roles && roles.length > 0) {
        const roleRecords = await fastify.prisma.role.findMany({
          where: {
            name: { in: roles },
            tenantId: request.user.tenantId
          }
        });

        await fastify.prisma.userRole.createMany({
          data: roleRecords.map(role => ({
            userId: user.id,
            roleId: role.id
          }))
        });
      }

      return { user };
    } catch (error) {
      return reply.code(400).send({ error: 'Invalid request data' });
    }
  });

  // Update user
  fastify.put('/:id', {
    preHandler: [fastify.authenticate, fastify.requireTenant, fastify.requireRole(['admin'])]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { password, roles, ...userData } = userSchema.partial().parse(request.body);
      
      const updateData: any = userData;
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const user = await fastify.prisma.user.update({
        where: {
          id,
          tenantId: request.user.tenantId
        },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        }
      });

      // Update roles if provided
      if (roles) {
        await fastify.prisma.userRole.deleteMany({
          where: { userId: id }
        });

        if (roles.length > 0) {
          const roleRecords = await fastify.prisma.role.findMany({
            where: {
              name: { in: roles },
              tenantId: request.user.tenantId
            }
          });

          await fastify.prisma.userRole.createMany({
            data: roleRecords.map(role => ({
              userId: id,
              roleId: role.id
            }))
          });
        }
      }

      return { user };
    } catch (error) {
      return reply.code(400).send({ error: 'Invalid request data' });
    }
  });

  // Delete user
  fastify.delete('/:id', {
    preHandler: [fastify.authenticate, fastify.requireTenant, fastify.requireRole(['admin'])]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    
    if (id === request.user.userId) {
      return reply.code(400).send({ error: 'Cannot delete yourself' });
    }

    await fastify.prisma.user.delete({
      where: {
        id,
        tenantId: request.user.tenantId
      }
    });

    return { success: true };
  });
};