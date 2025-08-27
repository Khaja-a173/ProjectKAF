import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export default fp(async function ordersRoutes(app: FastifyInstance) {
  // do NOT define /healthz here; it's defined in server/index.ts

  // GET /orders - List orders with filtering
  app.get('/orders', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const query = z.object({
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

  app.post('/api/orders/checkout', async (req, reply) => {