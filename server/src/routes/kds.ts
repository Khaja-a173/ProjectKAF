import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const AdvanceOrderSchema = z.object({
  to: z.enum(['preparing', 'ready', 'served'])
});

export default async function kdsRoutes(app: FastifyInstance) {
  // GET /kds/orders - Get orders grouped by lanes
  app.get('/kds/orders', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const query = z.object({
      lane: z.enum(['queued', 'preparing', 'ready']).optional()
    }).parse(req.query);

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
      // Try to use latest status view first
      let orders: any[] = [];
      
      try {
        const { data: latestOrders, error: viewError } = await app.supabase
          .from('v_orders_latest_status')
          .select('order_id, status, last_changed_at')
          .eq('tenant_id', tenantId);

        if (!viewError && latestOrders) {
          // Get full order details for orders with active statuses
          const activeOrderIds = latestOrders
            .filter(o => ['new', 'preparing', 'ready'].includes(o.status))
            .map(o => o.order_id);

          if (activeOrderIds.length > 0) {
            const { data: fullOrders } = await app.supabase
              .from('orders')
              .select(`
                *,
                order_items (
                  *,
                  menu_items (name, preparation_time, image_url)
                ),
                restaurant_tables (table_number)
              `)
              .in('id', activeOrderIds)
              .eq('tenant_id', tenantId);

            orders = fullOrders || [];
          }
        }
      } catch (viewErr) {
        app.log.warn('v_orders_latest_status view not available, using fallback');
      }

      // Fallback: query orders directly
      if (orders.length === 0) {
        const { data: fallbackOrders } = await app.supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              menu_items (name, preparation_time, image_url)
            ),
            restaurant_tables (table_number)
          `)
          .eq('tenant_id', tenantId)
          .not('status', 'in', '(cancelled,paid)')
          .order('created_at');

        orders = fallbackOrders || [];
      }

      // Group by lanes
      const lanes = {
        queued: orders.filter(o => ['new', 'pending'].includes(o.status)),
        preparing: orders.filter(o => o.status === 'preparing'),
        ready: orders.filter(o => o.status === 'ready')
      };

      // If specific lane requested, return only that lane
      if (query.lane) {
        return reply.send({ [query.lane]: lanes[query.lane] });
      }

      return reply.send(lanes);

    } catch (err: any) {
      app.log.error(err, 'Failed to fetch KDS orders');
      return reply.code(500).send({ error: 'failed_to_fetch_kds_orders' });
    }
  });

  // POST /kds/orders/:id/advance - Advance order status
  app.post('/kds/orders/:id/advance', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const params = z.object({
      id: z.string().uuid()
    }).parse(req.params);

    const body = AdvanceOrderSchema.parse(req.body);
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
      // Get current order
      const { data: order, error: orderError } = await app.supabase
        .from('orders')
        .select('id, status')
        .eq('id', params.id)
        .eq('tenant_id', tenantId)
        .single();

      if (orderError || !order) {
        return reply.code(404).send({ error: 'order_not_found' });
      }

      // Update order status
      const updates: any = { status: body.to };
      if (body.to === 'ready') updates.ready_at = new Date().toISOString();
      if (body.to === 'served') updates.served_at = new Date().toISOString();

      const { data: updatedOrder, error: updateError } = await app.supabase
        .from('orders')
        .update(updates)
        .eq('id', params.id)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Try to insert status event
      try {
        await app.supabase
          .from('order_status_events')
          .insert({
            tenant_id: tenantId,
            order_id: params.id,
            from_status: order.status,
            to_status: body.to,
            created_by: req.auth?.userId || 'kitchen'
          });
      } catch (statusErr) {
        app.log.warn('order_status_events table not available, skipping event');
      }

      app.log.info(`KDS: Order ${params.id} advanced from ${order.status} to ${body.to}`);

      return reply.send({ order: updatedOrder });

    } catch (err: any) {
      app.log.error(err, 'Failed to advance order status');
      return reply.code(500).send({ error: 'failed_to_advance_order' });
    }
  });

  // GET /kds/lanes - Get lane counts from view
  app.get('/kds/lanes', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      // Try to query the KDS lane counts view
      const { data, error } = await app.supabase
        .from('v_kds_lane_counts')
        .select('*')
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (error) {
        app.log.warn('v_kds_lane_counts view not available, returning zeros');
        // Return zeros if view doesn't exist
        return reply.send({
          tenant_id: tenantId,
          queued: 0,
          preparing: 0,
          ready: 0
        });
      }

      // Return the counts or zeros if no data
      return reply.send({
        tenant_id: tenantId,
        queued: data?.queued || 0,
        preparing: data?.preparing || 0,
        ready: data?.ready || 0
      });

    } catch (err: any) {
      app.log.error(err, 'Failed to fetch KDS lanes');
      return reply.code(500).send({ error: 'failed_to_fetch_kds_lanes' });
    }
  });

  // GET /kds/latest - Get latest order statuses
  app.get('/kds/latest', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      // Try to query the latest status view
      const { data, error } = await app.supabase
        .from('v_orders_latest_status')
        .select('order_id, status, last_changed_at')
        .eq('tenant_id', tenantId)
        .order('last_changed_at', { ascending: false });

      if (error) {
        app.log.warn('v_orders_latest_status view not available, returning empty array');
        return reply.send([]);
      }

      return reply.send(data || []);

    } catch (err: any) {
      app.log.error(err, 'Failed to fetch latest statuses');
      return reply.code(500).send({ error: 'failed_to_fetch_latest_statuses' });
    }
  });
}