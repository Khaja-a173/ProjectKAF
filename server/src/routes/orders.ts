import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

export default fp(async function ordersRoutes(app: FastifyInstance) {
  // do NOT define /healthz here; it's defined in server/index.ts

  // GET /orders - List orders with filtering
  app.get('/orders', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const query = z.object({ // TODO: Use v_orders_latest_status for filtering
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

      app.log.info(`Order ${params.orderId} status updated to ${body.to_status}`);

      return reply.send({ order });

    } catch (err: any) {
      app.log.error(err, 'Failed to update order status');
      return reply.code(500).send({ error: 'failed_to_update_order_status' });
    }
  });

  // POST /orders/:orderId/assign - Assign staff to order
  app.post('/orders/:orderId/assign', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const params = z.object({
      orderId: z.string().uuid()
    }).parse(req.params);

    const body = z.object({
      staff_user_id: z.string().uuid()
    }).parse(req.body);

    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      // Verify staff belongs to tenant
      const { data: staff, error: staffError } = await app.supabase
        .from('staff')
        .select('id, role')
        .eq('user_id', body.staff_user_id)
        .eq('tenant_id', tenantId)
        .single();

      if (staffError || !staff) {
        return reply.code(404).send({ error: 'staff_not_found' });
      }

      // Update order with assigned staff
      const { data: order, error: updateError } = await app.supabase
        .from('orders')
        .update({ staff_id: body.staff_user_id })
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

      return reply.send({ order });

    } catch (err: any) {
      app.log.error(err, 'Failed to assign staff to order');
      return reply.code(500).send({ error: 'failed_to_assign_staff' });
    }
  });

  // POST /public/orders/checkout - Create order from cart (customer-facing)
  app.post('/orders/confirm', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const body = z.object({
      cart_id: z.string().uuid(),
      notes: z.string().optional(),
      assign_staff_id: z.string().uuid().optional()
    }).parse(req.body);

    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      // Get cart from memory (in production this would be from DB/Redis)
      const cartStorage = (global as any).cartStorage || new Map();
      const cart = cartStorage.get(body.cart_id);
      
      if (!cart || cart.tenant_id !== tenantId) {
        return reply.code(404).send({ error: 'cart_not_found' });
      }

      if (!cart.items || cart.items.length === 0) {
        return reply.code(400).send({ error: 'cart_empty' });
      }

      // Calculate totals
      // TODO: Fetch menu item prices from DB for security
      const subtotal = cart.items.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);
      const tax = subtotal * 0.08;
      const total = subtotal + tax;

      // Generate order number
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

      // Create order
      const { data: order, error: orderError } = await app.supabase
        .from('orders')
        .insert({
          tenant_id: tenantId,
          table_id: cart.table_id,
          staff_id: body.assign_staff_id,
          order_number: orderNumber,
          order_type: cart.mode,
          status: 'pending',
          subtotal: subtotal,
          tax_amount: tax,
          total_amount: total,
          special_instructions: body.notes,
          mode: cart.mode,
          session_id: cart.session_id // Link to cart session
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.items.map((item: any) => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.qty,
        unit_price: item.price,
        total_price: item.price * item.qty, // TODO: Recalculate from DB price
        special_instructions: item.notes, // Pass item-level notes
        tenant_id: tenantId
      }));

      const { error: itemsError } = await app.supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Try to insert status event (safe fallback if table missing)
      try {
        const sb = getServiceSupabase(); // Use service role for RLS bypass
        await sb
          .from('order_status_events')
          .insert({
            order_id: order.id,
            from_status: null,
            to_status: 'new',
            created_by: req.auth?.userId || 'customer'
          });
      } catch (statusErr) {
        app.log.warn('order_status_events table not available, skipping event');
      }

      // Clear cart from memory
      cartStorage.delete(body.cart_id);

      app.log.info(`Order created: ${orderNumber} for tenant ${tenantId}`);

      return reply.code(201).send({
        order_id: order.id,
        order_number: orderNumber,
        status: 'new',
        total_amount: order.total_amount
      });

    } catch (err: any) {
      app.log.error(err, 'Failed to confirm order');
      return reply.code(500).send({ error: 'failed_to_confirm_order' });
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

  // POST /orders/:id/status - Update order status
  app.post('/orders/:id/status', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const params = z.object({
      id: z.string().uuid()
    }).parse(req.params);

    const body = z.object({
      to: z.enum(['preparing', 'ready', 'served', 'paid', 'voided'])
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
            created_by: req.auth?.userId || 'staff'
          });
      } catch (statusErr) {
        app.log.warn('order_status_events table not available, skipping event');
      }

      return reply.send({ order: updatedOrder });

    } catch (err: any) {
      app.log.error(err, 'Failed to update order status');
      return reply.code(500).send({ error: 'failed_to_update_order_status' });
    }
  });
});
// Helper to get Supabase client with service role
function getServiceSupabase() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !serviceKey) throw new Error('Supabase URL or Service Role Key missing');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
