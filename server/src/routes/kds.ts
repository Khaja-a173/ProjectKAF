import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const UpdateKdsStatusSchema = z.object({
  status: z.enum(['preparing', 'ready', 'served'])
});

export default async function kdsRoutes(app: FastifyInstance) {
  // POST /kds/orders/:orderId/advance - Advance order status from KDS
  app.post('/kds/orders/:orderId/advance', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const params = z.object({
      orderId: z.string().uuid()
    }).parse(req.params);

    const body = z.object({
      to_status: z.enum(['preparing', 'ready', 'served'])
    }).parse(req.body);

    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    // Verify user has kitchen role
    const userRole = req.auth?.memberships?.[0]?.role;
    if (!['kitchen', 'staff', 'manager', 'admin'].includes(userRole || '')) {
      return reply.code(403).send({ error: 'insufficient_role' });
    }

    try {
      // Update order status
      const updates: any = { status: body.to_status };
      
      // Set timestamps based on status
      if (body.to_status === 'ready') updates.ready_at = new Date().toISOString();
      if (body.to_status === 'served') updates.served_at = new Date().toISOString();

      const { data: order, error: updateError } = await app.supabase
        .from('orders')
        .update(updates)
        .eq('id', params.orderId)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (updateError) {
        if (updateError.code === 'PGRST116') {
          return reply.code(404).send({ error: 'order_not_found' });
        }
        throw updateError;
      }

      app.log.info(`KDS: Order ${params.orderId} advanced to ${body.to_status}`);

      return reply.send({ order });

    } catch (err: any) {
      app.log.error(err, 'Failed to advance order status');
      return reply.code(500).send({ error: 'failed_to_advance_order' });
    }
  });

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

  // PATCH /kds/orders/:id/status - Update order status from KDS
  app.patch('/kds/orders/:id/status', {
    preHandler: [app.requireAuth, async (req, reply) => {
      await app.requireRole(req, reply, ['kitchen', 'manager', 'staff']);
    }]
  }, async (req, reply) => {
    const params = z.object({
      id: z.string().uuid()
    }).parse(req.params);

    const body = UpdateKdsStatusSchema.parse(req.body);
    const tenantIds = req.auth?.tenantIds || [];

    if (tenantIds.length === 0) {
      return reply.code(403).send({ error: 'no_tenant_access' });
    }

    try {
      const updates: any = { status: body.status };

      // Set timestamps based on status
      if (body.status === 'ready') updates.ready_at = new Date().toISOString();
      if (body.status === 'served') updates.served_at = new Date().toISOString();

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

      // Create status event
      await app.supabase
        .from('order_status_events')
        .insert({
          tenant_id: req.auth?.primaryTenantId,
          order_id: params.id,
          status: body.status,
          created_by: req.auth?.userId || 'kitchen'
        });

      return reply.send({ order: data });
    } catch (err: any) {
      app.log.error(err, 'Failed to update KDS order status');
      return reply.code(500).send({ error: 'failed_to_update_kds_status' });
    }
  });

  // GET /kds/orders - Kitchen display with lane filtering
  app.get('/kds/orders', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const query = z.object({
      lane: z.enum(['queued', 'preparing', 'ready']).optional(),
      limit: z.coerce.number().int().positive().max(100).default(50)
    }).parse(req.query);

    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
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
        .eq('tenant_id', tenantId)
        .not('status', 'in', '(cancelled,paid)')
        .order('created_at');

      if (query.lane) {
        // Map lane to order status
        const statusMap = {
          'queued': 'pending',
          'preparing': 'preparing', 
          'ready': 'ready'
        };
        queryBuilder = queryBuilder.eq('status', statusMap[query.lane]);
      } else {
        // Default: show active kitchen states
        queryBuilder = queryBuilder.in('status', ['pending', 'preparing', 'ready']);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;

      // Group by status for KDS lanes
      const grouped = {
        queued: (data || []).filter(o => o.status === 'pending'),
        preparing: (data || []).filter(o => o.status === 'preparing'),
        ready: (data || []).filter(o => o.status === 'ready')
      };

      return reply.send({ orders: grouped });
    } catch (err: any) {
      app.log.error(err, 'Failed to fetch KDS orders');
      return reply.code(500).send({ error: 'failed_to_fetch_kds_orders' });
    }
  });
}