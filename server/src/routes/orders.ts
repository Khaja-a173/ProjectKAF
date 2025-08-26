import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const PlaceOrderFromCartSchema = z.object({
  session_id: z.string().uuid(),
  assigned_staff_id: z.string().uuid().optional()
});

const UpdateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled'])
});

const AssignStaffSchema = z.object({
  staff_user_id: z.string().uuid()
});

const CreateOrderSchema = z.object({
  order_type: z.enum(['dine_in', 'takeaway']).default('dine_in'),
  table_id: z.string().uuid().optional(),
  items: z.array(z.object({
    menu_item_id: z.string().uuid(),
    quantity: z.number().int().positive()
  })),
  notes: z.string().optional()
});

const UpdateOrderSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled']).optional(),
  kitchen_state: z.enum(['queued', 'preparing', 'ready', 'served', 'cancelled']).optional()
});

export default async function ordersRoutes(app: FastifyInstance) {
  // GET /orders - List orders
  app.get('/orders', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const query = z.object({
      status: z.string().optional(),
      type: z.string().optional(),
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(50),
      since: z.string().optional()
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
            menu_items (name, price)
          ),
          restaurant_tables (table_number),
          customers (first_name, last_name)
        `)
        .in('tenant_id', tenantIds)
        .order('created_at', { ascending: false });

      if (query.status) {
        queryBuilder = queryBuilder.eq('status', query.status);
      }

      if (query.type) {
        queryBuilder = queryBuilder.eq('order_type', query.type);
      }

      if (query.since) {
        const hoursAgo = query.since === '24h' ? 24 : 168; // default to 1 week
        const sinceDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
        queryBuilder = queryBuilder.gte('created_at', sinceDate.toISOString());
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

  // POST /orders/from-cart - Create order from cart session
  app.post('/orders/from-cart', async (req, reply) => {
    const body = PlaceOrderFromCartSchema.parse(req.body);
    
    try {
      // Get cart session with items
      const { data: session, error: sessionError } = await app.supabase
        .from('cart_sessions')
        .select(`
          *,
          cart_items (
            *,
            menu_items (
              id,
              name,
              price
            )
          )
        `)
        .eq('id', body.session_id)
        .eq('status', 'active')
        .single();
      
      if (sessionError || !session) {
        return reply.code(404).send({ error: 'session_not_found_or_inactive' });
      }
      
      if (!session.cart_items || session.cart_items.length === 0) {
        return reply.code(400).send({ error: 'cart_is_empty' });
      }
      
      // Calculate totals
      const subtotal = session.cart_items.reduce((sum: number, item: any) => {
        const price = item.menu_items?.price || 0;
        return sum + (price * item.qty);
      }, 0);
      
      const taxAmount = subtotal * 0.08; // 8% tax
      const totalAmount = subtotal + taxAmount;
      
      // Generate order number
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
      
      // Create order
      const { data: order, error: orderError } = await app.supabase
        .from('orders')
        .insert({
          tenant_id: session.tenant_id,
          table_id: session.table_id,
          staff_id: body.assigned_staff_id,
          order_number: orderNumber,
          order_type: session.mode === 'dine_in' ? 'dine_in' : 'takeaway',
          status: 'pending',
          subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          session_id: session.id
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Create order items
      const orderItems = session.cart_items.map((item: any) => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.qty,
        unit_price: item.menu_items?.price || 0,
        total_price: (item.menu_items?.price || 0) * item.qty,
        special_instructions: item.notes,
        tenant_id: session.tenant_id
      }));
      
      const { error: itemsError } = await app.supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      // Create status event
      await app.supabase
        .from('order_status_events')
        .insert({
          tenant_id: session.tenant_id,
          order_id: order.id,
          status: 'pending',
          created_by: body.assigned_staff_id || 'customer'
        });
      
      // Mark cart session as completed
      await app.supabase
        .from('cart_sessions')
        .update({ status: 'completed' })
        .eq('id', body.session_id);
      
      // If dine_in, optionally mark table as occupied
      if (session.mode === 'dine_in' && session.table_id) {
        await app.supabase
          .from('restaurant_tables')
          .update({ status: 'occupied' })
          .eq('id', session.table_id);
      }
      
      return reply.code(201).send({
        order: {
          id: order.id,
          number: order.order_number,
          status: order.status,
          totals: {
            subtotal,
            tax: taxAmount,
            total: totalAmount
          }
        }
      });
      
    } catch (err: any) {
      app.log.error(err, 'Failed to place order from cart');
      return reply.code(500).send({ error: 'failed_to_place_order' });
    }
  });

  // PATCH /orders/:id/status - Update order status
  app.patch('/orders/:id/status', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const params = z.object({
      id: z.string().uuid()
    }).parse(req.params);

    const body = UpdateOrderStatusSchema.parse(req.body);
    const tenantId = req.auth?.primaryTenantId;

    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      // Update order status
      const updates: any = { status: body.status };
      
      // Set timestamps based on status
      if (body.status === 'ready') updates.ready_at = new Date().toISOString();
      if (body.status === 'served') updates.served_at = new Date().toISOString();
      if (body.status === 'cancelled') updates.cancelled_at = new Date().toISOString();

      const { data: order, error: updateError } = await app.supabase
        .from('orders')
        .update(updates)
        .eq('id', params.id)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (updateError) {
        if (updateError.code === 'PGRST116') {
          return reply.code(404).send({ error: 'order_not_found' });
        }
        throw updateError;
      }

      // Create status event
      await app.supabase
        .from('order_status_events')
        .insert({
          tenant_id: tenantId,
          order_id: params.id,
          status: body.status,
          created_by: req.auth?.userId || 'system'
        });

      return reply.send({ order });

    } catch (err: any) {
      app.log.error(err, 'Failed to update order status');
      return reply.code(500).send({ error: 'failed_to_update_status' });
    }
  });

  // POST /orders/:id/assign - Assign staff to order
  app.post('/orders/:id/assign', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const params = z.object({
      id: z.string().uuid()
    }).parse(req.params);

    const body = AssignStaffSchema.parse(req.body);
    const tenantId = req.auth?.primaryTenantId;

    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      // Verify staff belongs to tenant
      const { data: staff, error: staffError } = await app.supabase
        .from('staff')
        .select('id, user_id')
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
        .eq('id', params.id)
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

  // POST /orders - Create new order
  app.post('/orders', {
    preHandler: [app.requireAuth, async (req, reply) => {
      await app.requireRole(req, reply, ['admin', 'manager', 'staff']);
    }]
  }, async (req, reply) => {
    const body = CreateOrderSchema.parse(req.body);
    const tenantId = req.auth?.primaryTenantId;
    
    if (!tenantId) {
      return reply.code(403).send({ error: 'no_tenant_context' });
    }

    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
      
      // Calculate totals
      const { data: menuItems, error: menuError } = await app.supabase
        .from('menu_items')
        .select('id, price')
        .eq('tenant_id', tenantId)
        .in('id', body.items.map(item => item.menu_item_id));

      if (menuError) throw menuError;

      const subtotal = body.items.reduce((sum, item) => {
        const menuItem = menuItems?.find(mi => mi.id === item.menu_item_id);
        return sum + (menuItem?.price || 0) * item.quantity;
      }, 0);

      const taxAmount = subtotal * 0.08; // 8% tax
      const totalAmount = subtotal + taxAmount;

      // Create order
      const { data: order, error: orderError } = await app.supabase
        .from('orders')
        .insert({
          tenant_id: tenantId,
          table_id: body.table_id,
          order_number: orderNumber,
          order_type: body.order_type,
          status: 'pending',
          subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          special_instructions: body.notes,
          kitchen_state: 'queued'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = body.items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: menuItems?.find(mi => mi.id === item.menu_item_id)?.price || 0,
        total_price: (menuItems?.find(mi => mi.id === item.menu_item_id)?.price || 0) * item.quantity,
        tenant_id: tenantId
      }));

      const { error: itemsError } = await app.supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return reply.code(201).send({ order, items: orderItems });
    } catch (err: any) {
      app.log.error(err, 'Failed to create order');
      return reply.code(500).send({ error: 'failed_to_create_order' });
    }
  });

  // PATCH /orders/:id - Update order
  app.patch('/orders/:id', {
    preHandler: [app.requireAuth, async (req, reply) => {
      await app.requireRole(req, reply, ['admin', 'manager', 'staff', 'kitchen']);
    }]
  }, async (req, reply) => {
    const params = z.object({
      id: z.string().uuid()
    }).parse(req.params);

    const body = UpdateOrderSchema.parse(req.body);
    const tenantIds = req.auth?.tenantIds || [];

    if (tenantIds.length === 0) {
      return reply.code(403).send({ error: 'no_tenant_access' });
    }

    try {
      const updates: any = {};
      
      if (body.status) {
        updates.status = body.status;
        
        // Set timestamps based on status
        if (body.status === 'ready') updates.ready_at = new Date().toISOString();
        if (body.status === 'served') updates.served_at = new Date().toISOString();
        if (body.status === 'cancelled') updates.cancelled_at = new Date().toISOString();
      }

      if (body.kitchen_state) {
        updates.kitchen_state = body.kitchen_state;
      }

      const { data, error } = await app.supabase
        .from('orders')
        .update(updates)
        .eq('id', params.id)
        .in('tenant_id', tenantIds)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return reply.code(404).send({ error: 'order_not_found' });
        }
        throw error;
      }

      return reply.send({ order: data });
    } catch (err: any) {
      app.log.error(err, 'Failed to update order');
      return reply.code(500).send({ error: 'failed_to_update_order' });
    }
  });

  // DELETE /orders/:id - Cancel order
  app.delete('/orders/:id', {
    preHandler: [app.requireAuth, async (req, reply) => {
      await app.requireRole(req, reply, ['admin', 'manager']);
    }]
  }, async (req, reply) => {
    const params = z.object({
      id: z.string().uuid()
    }).parse(req.params);

    const tenantIds = req.auth?.tenantIds || [];
    if (tenantIds.length === 0) {
      return reply.code(403).send({ error: 'no_tenant_access' });
    }

    try {
      const { data, error } = await app.supabase
        .from('orders')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: 'Cancelled by staff'
        })
        .eq('id', params.id)
        .in('tenant_id', tenantIds)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return reply.code(404).send({ error: 'order_not_found' });
        }
        throw error;
      }

      return reply.send({ order: data });
    } catch (err: any) {
      app.log.error(err, 'Failed to cancel order');
      return reply.code(500).send({ error: 'failed_to_cancel_order' });
    }
  });
}