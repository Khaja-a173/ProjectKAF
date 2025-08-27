import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const AdvanceOrderSchema = z.object({
  to: z.enum(['preparing', 'ready', 'served'])
});

export default async function kdsRoutes(app: FastifyInstance) {
  /**
   * GET /kds/orders
   * Returns orders grouped by kitchen lanes
   */
  app.get('/kds/orders', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    try {
      const tenantId = req.auth.primaryTenantId;
      if (!tenantId) {
        return reply.code(401).send({ error: 'No tenant access' });
      }

      const lanes = {
        queued: [],
        preparing: [],
        ready: []
      };

      try {
        // Try to use v_orders_latest_status view if it exists
        let ordersData = null;
        try {
          const { data } = await app.supabase
            .from('v_orders_latest_status')
            .select('*')
            .eq('tenant_id', tenantId)
            .in('latest_status', ['new', 'accepted', 'preparing', 'ready']);
          
          ordersData = data;
        } catch (err: any) {
          if (err.code === '42P01') {
            // View doesn't exist, fall back to manual computation
            app.log.debug('v_orders_latest_status view not found, using fallback');
            
            // Get orders with basic info
            const { data: orders } = await app.supabase
              .from('orders')
              .select(`
                id,
                order_number,
                status,
                created_at,
                table_id,
                restaurant_tables (table_number)
              `)
              .eq('tenant_id', tenantId)
              .in('status', ['pending', 'confirmed', 'preparing', 'ready']);

            // Get latest status from order_status_events if table exists
            if (orders) {
              for (const order of orders) {
                try {
                  const { data: statusEvents } = await app.supabase
                    .from('order_status_events')
                    .select('to_status, created_at')
                    .eq('order_id', order.id)
                    .order('created_at', { ascending: false })
                    .limit(1);

                  const latestStatus = statusEvents?.[0]?.to_status || order.status;
                  (order as any).latest_status = latestStatus;
                } catch (statusErr: any) {
                  if (statusErr.code === '42P01') {
                    // order_status_events table doesn't exist, use order.status
                    (order as any).latest_status = order.status;
                  }
                }
              }
            }

            ordersData = orders;
          } else {
            throw err;
          }
        }

        if (ordersData) {
          for (const order of ordersData) {
            // Get order items
            let orderItems = [];
            try {
              const { data: items } = await app.supabase
                .from('order_items')
                .select(`
                  quantity,
                  menu_items (name)
                `)
                .eq('order_id', order.id);
              
              orderItems = items || [];
            } catch (err: any) {
              if (err.code !== '42P01') {
                app.log.warn('Failed to get order items:', err);
              }
            }

            const orderData = {
              order_id: order.id,
              number: order.order_number,
              age_sec: Math.floor((Date.now() - new Date(order.created_at).getTime()) / 1000),
              table_number: order.restaurant_tables?.table_number || null,
              items: orderItems.map(item => ({
                name: item.menu_items?.name || 'Unknown Item',
                qty: item.quantity
              }))
            };

            // Map status to lanes
            const status = order.latest_status || order.status;
            if (status === 'new' || status === 'accepted' || status === 'pending' || status === 'confirmed') {
              lanes.queued.push(orderData);
            } else if (status === 'preparing') {
              lanes.preparing.push(orderData);
            } else if (status === 'ready') {
              lanes.ready.push(orderData);
            }
          }
        }

      } catch (err: any) {
        if (err.code === '42P01') {
          app.log.warn('Orders table not found, returning empty lanes');
        } else {
          throw err;
        }
      }

      return reply.send(lanes);
    } catch (err) {
      app.log.error('Failed to get KDS orders:', err);
      return reply.code(500).send({ error: 'Failed to get KDS orders' });
    }
  });

  /**
   * POST /kds/orders/:id/advance
   * Advance order status in kitchen
   */
  app.post('/kds/orders/:id/advance', {
    preHandler: [app.requireAuth],
    schema: {
      body: AdvanceOrderSchema
    }
  }, async (req, reply) => {
    try {
      const tenantId = req.auth.primaryTenantId;
      if (!tenantId) {
        return reply.code(401).send({ error: 'No tenant access' });
      }

      const orderId = (req.params as any).id;
      const { to } = AdvanceOrderSchema.parse(req.body);

      // Verify order belongs to tenant
      try {
        const { data: order, error } = await app.supabase
          .from('orders')
          .select('id, status')
          .eq('id', orderId)
          .eq('tenant_id', tenantId)
          .single();

        if (error) {
          if (error.code === '42P01') {
            return reply.send({ success: true, mock: true });
          }
          if (error.code === 'PGRST116') {
            return reply.code(404).send({ error: 'Order not found' });
          }
          throw error;
        }

        // Insert status event
        try {
          await app.supabase
            .from('order_status_events')
            .insert({
              order_id: orderId,
              from_status: order.status,
              to_status: to,
              changed_by: req.auth.userId
            });
        } catch (statusErr: any) {
          if (statusErr.code === '42P01') {
            app.log.warn('order_status_events table not found');
          } else {
            throw statusErr;
          }
        }

        return reply.send({
          order_id: orderId,
          new_status: to,
          success: true
        });

      } catch (err: any) {
        if (err.code === '42P01') {
          return reply.send({ success: true, mock: true });
        }
        throw err;
      }

    } catch (err) {
      app.log.error('Failed to advance order:', err);
      return reply.code(500).send({ error: 'Failed to advance order' });
    }
  });
}