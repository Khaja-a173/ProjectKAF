import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const UpdateKitchenStateSchema = z.object({
  kitchen_state: z.enum(['queued', 'preparing', 'ready', 'served', 'cancelled'])
});

export default async function kdsRoutes(app: FastifyInstance) {
  // GET /kds/orders - Get orders for kitchen display
  app.get('/kds/orders', {
    preHandler: [app.requireAuth, async (req, reply) => {
      await app.requireRole(req, reply, ['kitchen', 'manager', 'admin']);
    }]
  }, async (req, reply) => {
    const query = z.object({
      state: z.enum(['queued', 'preparing', 'ready']).optional()
    }).parse(req.query);

    const tenantIds = req.auth?.tenantIds || [];
    if (tenantIds.length === 0) {
      return reply.code(403).send({ error: 'no_tenant_access' });
    }

    try {
      let queryBuilder = app.supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            menu_items (
              name,
              preparation_time,
              image_url
            )
          ),
          restaurant_tables (table_number)
        `)
        .in('tenant_id', tenantIds)
        .not('status', 'in', '(cancelled,paid)')
        .order('created_at');

      if (query.state) {
        queryBuilder = queryBuilder.eq('kitchen_state', query.state);
      } else {
        // Default: show active kitchen states
        queryBuilder = queryBuilder.in('kitchen_state', ['queued', 'preparing', 'ready']);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;

      // Group by kitchen state
      const grouped = {
        queued: (data || []).filter(o => o.kitchen_state === 'queued'),
        preparing: (data || []).filter(o => o.kitchen_state === 'preparing'),
        ready: (data || []).filter(o => o.kitchen_state === 'ready')
      };

      return reply.send({ orders: grouped });
    } catch (err: any) {
      app.log.error(err, 'Failed to fetch KDS orders');
      return reply.code(500).send({ error: 'failed_to_fetch_kds_orders' });
    }
  });

  // PATCH /kds/orders/:id/state - Update kitchen state
  app.patch('/kds/orders/:id/state', {
    preHandler: [app.requireAuth, async (req, reply) => {
      await app.requireRole(req, reply, ['kitchen', 'manager', 'staff']);
    }]
  }, async (req, reply) => {
    const params = z.object({
      id: z.string().uuid()
    }).parse(req.params);

    const body = UpdateKitchenStateSchema.parse(req.body);
    const tenantIds = req.auth?.tenantIds || [];

    if (tenantIds.length === 0) {
      return reply.code(403).send({ error: 'no_tenant_access' });
    }

    try {
      const updates: any = {
        kitchen_state: body.kitchen_state
      };

      // Update order status based on kitchen state
      if (body.kitchen_state === 'ready') {
        updates.status = 'ready';
        updates.ready_at = new Date().toISOString();
      } else if (body.kitchen_state === 'served') {
        updates.status = 'served';
        updates.served_at = new Date().toISOString();
      } else if (body.kitchen_state === 'preparing') {
        updates.status = 'preparing';
      }

      const { data, error } = await app.supabase
        .from('orders')
        .update(updates)
        .eq('id', params.id)
        .in('tenant_id', tenantIds)
        .select(`
          *,
          order_items (
            *,
            menu_items (name)
          ),
          restaurant_tables (table_number)
        `)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return reply.code(404).send({ error: 'order_not_found' });
        }
        throw error;
      }

      return reply.send({ order: data });
    } catch (err: any) {
      app.log.error(err, 'Failed to update kitchen state');
      return reply.code(500).send({ error: 'failed_to_update_kitchen_state' });
    }
  });
}