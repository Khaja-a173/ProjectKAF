import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

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