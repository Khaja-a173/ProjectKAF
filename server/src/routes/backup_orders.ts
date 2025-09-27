import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export default async function ordersRoutes(app: FastifyInstance) {
  // Utility: ensure an active table session and lock the table
  async function ensureActiveTableSession(tenantId: string, tableId: string) {
    // Is there already an active session?
    const { data: active, error: activeErr } = await app.supabase
      .from('table_sessions')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('table_id', tableId)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();

    if (activeErr) throw activeErr;

    if (!active) {
      // create a new active session
      const { error: insertErr } = await app.supabase
        .from('table_sessions')
        .insert({
          tenant_id: tenantId,
          table_id: tableId,
          status: 'active',
          started_at: new Date().toISOString()
        });
      if (insertErr) throw insertErr;
    }

    // lock the table (so the same table cannot be booked again)
    const { error: lockErr } = await app.supabase
      .from('tables')
      .update({ is_locked: true })
      .eq('tenant_id', tenantId)
      .eq('id', tableId);

    if (lockErr) throw lockErr;
  }

  // Utility: end table session(s) for a table and unlock if no remaining active sessions
  async function endActiveSessionsAndMaybeUnlock(tenantId: string, tableId: string) {
    // End all active sessions for this table
    const { error: endErr } = await app.supabase
      .from('table_sessions')
      .update({ status: 'ended', ended_at: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .eq('table_id', tableId)
      .eq('status', 'active');
    if (endErr) throw endErr;

    // Check if any other active sessions remain for this table
    const { data: remaining, error: remErr } = await app.supabase
      .from('table_sessions')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('table_id', tableId)
      .eq('status', 'active')
      .limit(1);
    if (remErr) throw remErr;

    if (!remaining || remaining.length === 0) {
      // No active sessions left → unlock table
      const { error: unlockErr } = await app.supabase
        .from('tables')
        .update({ is_locked: false })
        .eq('tenant_id', tenantId)
        .eq('id', tableId);
      if (unlockErr) throw unlockErr;
    }
  }

  // ----------------------------------------------------------------------------
  // POST /orders - Create order (optionally for a table)
  // ----------------------------------------------------------------------------
  app.post('/orders', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const body = z.object({
      table_id: z.string().uuid().optional(),
      order_type: z.enum(['dine_in', 'takeaway', 'delivery']).default('dine_in'),
      note: z.string().optional(),
      items: z.array(z.object({
        menu_item_id: z.string().uuid(),
        quantity: z.number().int().positive().default(1),
        unit_price: z.number().nonnegative().optional(), // server can re-price if needed
        customizations: z.record(z.any()).optional(),
        special_instructions: z.string().optional()
      })).optional()
    }).parse(req.body);

    const tenantId = (req as any).auth?.primaryTenantId ?? (req as any).tenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      // If a table is specified, ensure it belongs to the tenant
      if (body.table_id) {
        const { data: table, error: tableErr } = await app.supabase
          .from('tables')
          .select('id')
          .eq('tenant_id', tenantId)
          .eq('id', body.table_id)
          .single();
        if (tableErr || !table) {
          return reply.code(404).send({ error: 'table_not_found' });
        }
      }

      // Create order
      const nowIso = new Date().toISOString();
      const { data: order, error: orderErr } = await app.supabase
        .from('orders')
        .insert({
          tenant_id: tenantId,
          table_id: body.table_id ?? null,
          order_type: body.order_type,
          status: 'pending',
          note: body.note ?? null,
          created_at: nowIso,
          updated_at: nowIso
        })
        .select()
        .single();
      if (orderErr) throw orderErr;

      // If items provided, insert them
      if (body.items && body.items.length > 0) {
        const itemsPayload = body.items.map(i => ({
          id: crypto.randomUUID?.() ?? undefined,
          order_id: order.id,
          tenant_id: tenantId,
          menu_item_id: i.menu_item_id,
          quantity: i.quantity,
          unit_price: i.unit_price ?? null,
          total_price: i.unit_price ? String((i.unit_price || 0) * i.quantity) : null,
          customizations: i.customizations ?? {},
          special_instructions: i.special_instructions ?? null,
          status: 'pending',
          created_at: nowIso,
          updated_at: nowIso
        }));
        const { error: itemsErr } = await app.supabase
          .from('order_items')
          .insert(itemsPayload);
        if (itemsErr) throw itemsErr;
      }

      // If this order is for a table, ensure an active session and lock the table
      if (body.table_id) {
        await ensureActiveTableSession(tenantId, body.table_id);
      }

      return reply.code(201).send({ order });
    } catch (err: any) {
      app.log.error(err, 'Failed to create order');
      return reply.code(500).send({ error: 'failed_to_create_order' });
    }
  });

  // ----------------------------------------------------------------------------
  // GET /orders - List orders with filtering
  // ----------------------------------------------------------------------------
  app.get('/orders', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const query = z.object({
      status: z.string().optional(),
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(50)
    }).parse(req.query);

    // Resolve tenant id from authenticated user first, else from header-derived context
    const tenantId = (req as any).auth?.primaryTenantId ?? (req as any).tenantId;
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

  // ----------------------------------------------------------------------------
  // POST /orders/:orderId/status - Update order status
  // ----------------------------------------------------------------------------
  app.post('/orders/:orderId/status', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const params = z.object({
      orderId: z.string().uuid()
    }).parse(req.params);

    const body = z.object({
      to_status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled', 'voided']),
      note: z.string().optional()
    }).parse(req.body);

    // Resolve tenant id from authenticated user first, else from header-derived context
    const tenantId = (req as any).auth?.primaryTenantId ?? (req as any).tenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      const { data: order, error: orderError } = await app.supabase
        .from('orders')
        .select('id, status, table_id')
        .eq('id', params.orderId)
        .eq('tenant_id', tenantId)
        .single();

      if (orderError || !order) {
        return reply.code(404).send({ error: 'order_not_found' });
      }

      const updates: any = { status: body.to_status };
      if (body.to_status === 'ready') updates.ready_at = new Date().toISOString();
      if (body.to_status === 'served') updates.served_at = new Date().toISOString();
      if (body.to_status === 'paid') updates.paid_at = new Date().toISOString();
      if (body.note) updates.note = body.note;

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

      // If order reached a terminal state, end table session and maybe unlock
      const terminal = ['paid', 'cancelled', 'voided'] as const;
      if (order.table_id && terminal.includes(body.to_status as typeof terminal[number])) {
        try {
          await endActiveSessionsAndMaybeUnlock(tenantId, order.table_id);
        } catch (sessErr: any) {
          app.log.warn({ err: sessErr }, 'Failed ending session / unlocking table');
          // We do not fail the whole request if unlocking had an issue
        }
      }

      // Insert into order_status_events (optional)
      try {
        await app.supabase.from('order_status_events').insert({
          tenant_id: tenantId,
          order_id: params.orderId,
          from_status: order.status,
          to_status: body.to_status,
          note: body.note ?? null,
          created_by: req.auth?.userId || 'staff',
          created_at: new Date().toISOString()
        });
      } catch (statusErr: any) {
        app.log.warn('order_status_events insert skipped', statusErr);
      }

      app.log.info(`Order ${params.orderId} status updated to ${body.to_status}`);

      return reply.send({ order: updatedOrder });
    } catch (err: any) {
      app.log.error(err, 'Failed to update order status');
      return reply.code(500).send({ error: 'failed_to_update_order_status' });
    }
  });

  // ----------------------------------------------------------------------------
  // POST /orders/:id/emit-status - Explicitly emit a status event
  // ----------------------------------------------------------------------------
  app.post('/orders/:id/emit-status', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const params = z.object({ id: z.string().uuid() }).parse(req.params);
    const body = z.object({
      to_status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled']),
      note: z.string().optional()
    }).parse(req.body);

    // Resolve tenant id from authenticated user first, else from header-derived context
    const tenantId = (req as any).auth?.primaryTenantId ?? (req as any).tenantId;
    if (!tenantId) {
      return reply.code(401).send({ error: 'Missing tenant ID' });
    }

    try {
      const { data: latest, error: latestErr } = await app.supabase
        .from('order_status_events')
        .select('to_status')
        .eq('order_id', params.id)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const fromStatus = latestErr ? 'pending' : latest?.to_status || 'pending';

      const { error: insertErr } = await app.supabase.from('order_status_events').insert({
        tenant_id: tenantId,
        order_id: params.id,
        from_status: fromStatus,
        to_status: body.to_status,
        note: body.note ?? null,
        created_by: req.auth?.userId || 'staff',
        created_at: new Date().toISOString()
      });
      if (insertErr) throw insertErr;

      return reply.send({ ok: true });
    } catch (err: any) {
      app.log.error(err, 'Failed to emit status change');
      return reply.code(500).send({ error: 'failed_to_emit_status_change' });
    }
  });

  // ----------------------------------------------------------------------------
  // GET /orders/:id/status - Get order status timeline
  // ----------------------------------------------------------------------------
  app.get('/orders/:id/status', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const params = z.object({ id: z.string().uuid() }).parse(req.params);

    // Resolve tenant id from authenticated user first, else from header-derived context
    const tenantId = (req as any).auth?.primaryTenantId ?? (req as any).tenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      const { data: order, error: orderError } = await app.supabase
        .from('orders')
        .select('id, status')
        .eq('id', params.id)
        .eq('tenant_id', tenantId)
        .single();

      if (orderError || !order) {
        return reply.code(404).send({ error: 'order_not_found' });
      }

      const { data: events, error: eventsError } = await app.supabase
        .from('order_status_events')
        .select('*')
        .eq('order_id', params.id)
        .eq('tenant_id', tenantId)
        .order('created_at');

      if (eventsError) {
        return reply.send({
          order_id: params.id,
          current: order.status || 'new',
          timeline: []
        });
      }

      const timeline = (events || []).map(event => ({
        at: event.created_at,
        from: event.from_status,
        to: event.to_status,
        note: event.note || null
      }));

      return reply.send({
        order_id: params.id,
        current: order.status || 'new',
        timeline
      });
    } catch (err: any) {
      app.log.error(err, 'Failed to get order status');
      return reply.code(500).send({ error: 'failed_to_get_order_status' });
    }
  });
}