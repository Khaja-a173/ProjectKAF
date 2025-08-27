import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Helper to get Supabase client with service role
function getServiceSupabase() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !serviceKey) throw new Error('Supabase URL or Service Role Key missing');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export default fp(async function ordersRoutes(app: FastifyInstance) {
  // GET /orders - List orders with filtering
  app.get('/orders', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const query = z.object({ // TODO: Use v_orders_latest_status view for filtering
      status: z.string().optional(),
      page: z.coerce.number().int().positive().default(1),
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
            menu_items (name, price)
          ),
          restaurant_tables (table_number),
          customers (first_name, last_name)
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (query.status) {
        queryBuilder = queryBuilder.eq('status', query.status);
      }

      const offset = (query.page - 1) * query.limit;
      queryBuilder = queryBuilder.range(offset, offset + query.limit - 1);

      const { data, error } = await queryBuilder;

      if (error) throw error;

      return reply.send({
        orders: data || [],
        page: query.page,
        limit: query.limit
      });

    } catch (err: any) {
      app.log.error(err, 'Failed to fetch orders');
      return reply.code(500).send({ error: 'failed_to_fetch_orders' });
    }
  });

  // POST /orders/:orderId/status - Update order status
  app.post('/orders/:orderId/status', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const params = z.object({
      orderId: z.string().uuid()
    }).parse(req.params);

    const body = z.object({
      to_status: z.enum(['preparing', 'ready', 'served', 'paid', 'voided'])
    }).parse(req.body);

    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      // Get current order
      const { data: order, error: orderError } = await app.supabase
        .from('orders')
        .select('id, status')
        .eq('id', params.orderId)
        .eq('tenant_id', tenantId)
        .single();

      if (orderError || !order) {
        return reply.code(404).send({ error: 'order_not_found' });
      }

      // Update order status
      const updates: any = { status: body.to_status };
      
      // Set timestamps based on status
      if (body.to_status === 'ready') updates.ready_at = new Date().toISOString();
      if (body.to_status === 'served') updates.served_at = new Date().toISOString();

      const { data: updatedOrder, error: updateError } = await app.supabase
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

      // Try to insert status event
      try {
        const sb = getServiceSupabase(); // Use service role for RLS bypass
        await sb
          .from('order_status_events')
          .insert({
            tenant_id: tenantId,
            order_id: params.orderId,
            from_status: order.status,
            to_status: body.to_status,
            created_by: req.auth?.userId || 'staff'
          });
      } catch (statusErr) {
        app.log.warn('order_status_events table not available, skipping event');
      }

      app.log.info(`Order ${params.orderId} status updated to ${body.to_status}`);

      return reply.send({ order: updatedOrder });

    } catch (err: any) {
      app.log.error(err, 'Failed to update order status');
      return reply.code(500).send({ error: 'failed_to_update_order_status' });
    }
  });

  // GET /orders/:id/status - Get order status timeline
  app.get('/orders/:id/status', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const params = z.object({
      id: z.string().uuid()
    }).parse(req.params);

    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      // Get order
      const { data: order, error: orderError } = await app.supabase
        .from('orders')
        .select('id, status')
        .eq('id', params.id)
        .eq('tenant_id', tenantId)
        .single();

      if (orderError || !order) {
        return reply.code(404).send({ error: 'order_not_found' });
      }

      // Try to get status timeline
      try {
        const { data: events, error: eventsError } = await app.supabase
          .from('order_status_events')
          .select('*')
          .eq('order_id', params.id)
          .eq('tenant_id', tenantId)
          .order('created_at');

        if (eventsError) {
          // Table doesn't exist - return basic status
          return reply.send({
            order_id: params.id,
            current: order.status || 'new',
            timeline: []
          });
        }

        const timeline = (events || []).map(event => ({
          at: event.created_at,
          from: event.from_status,
          to: event.to_status
        }));

        return reply.send({
          order_id: params.id,
          current: order.status || 'new',
          timeline
        });

      } catch (timelineErr) {
        // Fallback to basic status
        return reply.send({
          order_id: params.id,
          current: order.status || 'new',
          timeline: []
        });
      }

    } catch (err: any) {
      app.log.error(err, 'Failed to get order status');
      return reply.code(500).send({ error: 'failed_to_get_order_status' });
    }
  });
}
)