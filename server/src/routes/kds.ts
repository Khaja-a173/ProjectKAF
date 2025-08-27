import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Helper to get Supabase client with service role
function getServiceSupabase() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !serviceKey) throw new Error('Supabase URL or Service Role Key missing');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

const AdvanceOrderSchema = z.object({
  to_status: z.enum(['preparing', 'ready', 'served'])
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
    const userRole = req.auth?.memberships?.?.role;
    if (!['kitchen', 'staff', 'manager', 'admin'].includes(userRole || '')) {
      return reply.code(403).send({ error: 'insufficient_role' });
    }

    try {
      const sb = getServiceSupabase(); // Use service role for RLS bypass
      let orders: any[] = [];
      
      // Try to use v_orders_latest_status view first
      try {
        const { data: latestStatuses, error: viewError } = await sb
          .from('v_orders_latest_status')
          .select('order_id, status, last_changed_at')
          .eq('tenant_id', tenantId);

        if (!viewError && latestStatuses) {
          const activeOrderIds = latestStatuses
            .filter(o => ['new', 'pending', 'confirmed', 'preparing', 'ready'].includes(o.status))
            .map(o => o.order_id);

          if (activeOrderIds.length > 0) {
            const { data: fullOrders } = await sb
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
        app.log.warn('v_orders_latest_status view not available, using fallback for KDS orders');
      }

      // Fallback: query orders directly if view failed or no active orders found via view
      if (orders.length === 0) {
        const { data: fallbackOrders } = await sb
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
          .not('status', 'in', '(cancelled,paid,served)') // Exclude final states
          .order('created_at');

        orders = fallbackOrders || [];
      }

      // Group by lanes based on current order status
      const lanes = {
        queued: orders.filter(o => ['new', 'pending', 'confirmed'].includes(o.status)),
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
    const userRole = req.auth?.memberships?.?.role;
    if (!['kitchen', 'staff', 'manager', 'admin'].includes(userRole || '')) {
      return reply.code(403).send({ error: 'insufficient_role' });
    }

    try {
      const sb = getServiceSupabase(); // Use service role for RLS bypass
      // Get current order
      const { data: order, error: orderError } = await sb
        .from('orders')
        .select('id, status')
        .eq('id', params.id)
        .eq('tenant_id', tenantId)
        .single();

      if (orderError || !order) {
        return reply.code(404).send({ error: 'order_not_found' });
      }

      // Update order status
      const updates: any = { status: body.to_status };
      if (body.to_status === 'ready') updates.ready_at = new Date().toISOString();
      if (body.to_status === 'served') updates.served_at = new Date().toISOString();

      const { data: updatedOrder, error: updateError } = await sb
        .from('orders')
        .update(updates)
        .eq('id', params.id)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Try to insert status event
      try {
        await sb
          .from('order_status_events')
          .insert({
            tenant_id: tenantId, // Explicitly set tenant_id for RLS bypass
            order_id: params.id,
            from_status: order.status,
            to_status: body.to_status,
            created_by: req.auth?.userId || 'kitchen'
          });
      } catch (statusErr) {
        app.log.warn('order_status_events table not available, skipping event for KDS advance');
      }

      app.log.info(`KDS: Order ${params.id} advanced from ${order.status} to ${body.to_status}`);

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
      const sb = getServiceSupabase(); // Use service role for RLS bypass
      // Try to query the KDS lane counts view
      const { data, error } = await sb
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
      const sb = getServiceSupabase(); // Use service role for RLS bypass
      // Try to query the latest status view
      const { data, error } = await sb
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