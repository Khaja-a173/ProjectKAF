import { FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  tenantId: z.string().optional()
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  tenantId: z.string().optional()
});

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Login
  fastify.post('/login', async (request, reply) => {
    try {
      const { email, password, tenantId } = loginSchema.parse(request.body);
      
      const user = await fastify.prisma.user.findFirst({
        where: {
          email,
          ...(tenantId && { tenantId })
        },
        include: {
          tenant: true,
          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!user || !await bcrypt.compare(password, user.password)) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      const token = fastify.jwt.sign({
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        roles: user.roles.map(ur => ur.role.name)
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: user.tenantId,
          tenant: user.tenant,
          roles: user.roles.map(ur => ur.role.name)
        }
      };
    } catch (error) {
      return reply.code(400).send({ error: 'Invalid request data' });
    }
  });

  // Register
  fastify.post('/register', async (request, reply) => {
    try {
      const { email, password, name, tenantId } = registerSchema.parse(request.body);
      
      const existingUser = await fastify.prisma.user.findFirst({
        where: { email, tenantId }
      });

      if (existingUser) {
        return reply.code(409).send({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await fastify.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          tenantId
        }
      });

      const token = fastify.jwt.sign({
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        roles: []
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: user.tenantId
        }
      };
    } catch (error) {
      return reply.code(400).send({ error: 'Invalid request data' });
    }
  });

  // Verify token
  fastify.get('/verify', {
    preHandler: [fastify.authenticate]
  }, async (request) => {
    return { user: request.user };
  });
};