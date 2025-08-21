import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const orderItemSchema = z.object({
  menuItemId: z.string(),
  quantity: z.number().positive(),
  notes: z.string().optional()
});

const orderSchema = z.object({
  tableNumber: z.string().optional(),
  customerName: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
  notes: z.string().optional()
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'])
});

export const orderRoutes: FastifyPluginAsync = async (fastify) => {
  // Get orders
  fastify.get('/', {
    preHandler: [fastify.authenticate, fastify.requireTenant]
  }, async (request) => {
    const { status, limit = 50 } = request.query as { status?: string; limit?: number };
    
    const orders = await fastify.prisma.order.findMany({
      where: {
        tenantId: request.user.tenantId,
        ...(status && { status })
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    });

    return { orders };
  });

  // Create order
  fastify.post('/', {
    preHandler: [fastify.authenticate, fastify.requireTenant]
  }, async (request, reply) => {
    try {
      const data = orderSchema.parse(request.body);
      
      // Calculate total
      const menuItems = await fastify.prisma.menuItem.findMany({
        where: {
          id: { in: data.items.map(item => item.menuItemId) },
          tenantId: request.user.tenantId
        }
      });

      const total = data.items.reduce((sum, orderItem) => {
        const menuItem = menuItems.find(mi => mi.id === orderItem.menuItemId);
        return sum + (menuItem?.price || 0) * orderItem.quantity;
      }, 0);

      const order = await fastify.prisma.order.create({
        data: {
          tenantId: request.user.tenantId,
          tableNumber: data.tableNumber,
          customerName: data.customerName,
          notes: data.notes,
          total,
          status: 'pending',
          items: {
            create: data.items.map(item => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              notes: item.notes,
              price: menuItems.find(mi => mi.id === item.menuItemId)?.price || 0
            }))
          }
        },
        include: {
          items: {
            include: {
              menuItem: true
            }
          }
        }
      });

      // Broadcast to WebSocket clients
      fastify.websocketServer.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'new_order',
            data: order
          }));
        }
      });

      return { order };
    } catch (error) {
      return reply.code(400).send({ error: 'Invalid request data' });
    }
  });

  // Update order status
  fastify.put('/:id/status', {
    preHandler: [fastify.authenticate, fastify.requireTenant, fastify.requireRole(['admin', 'manager', 'staff'])]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { status } = updateOrderStatusSchema.parse(request.body);
      
      const order = await fastify.prisma.order.update({
        where: {
          id,
          tenantId: request.user.tenantId
        },
        data: { status },
        include: {
          items: {
            include: {
              menuItem: true
            }
          }
        }
      });

      // Broadcast status update
      fastify.websocketServer.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'order_status_update',
            data: order
          }));
        }
      });

      return { order };
    } catch (error) {
      return reply.code(400).send({ error: 'Invalid request data' });
    }
  });

  // Get order by ID
  fastify.get('/:id', {
    preHandler: [fastify.authenticate, fastify.requireTenant]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const order = await fastify.prisma.order.findFirst({
      where: {
        id,
        tenantId: request.user.tenantId
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    if (!order) {
      return reply.code(404).send({ error: 'Order not found' });
    }

    return { order };
  });
};