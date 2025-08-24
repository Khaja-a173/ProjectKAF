import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const CheckoutBody = z.object({
  tenantId: z.string().min(1),
  sessionId: z.string().min(1),
  mode: z.enum(['table', 'takeaway']),
  tableId: z.string().uuid().optional(), // required when mode='table'
  cartVersion: z.number().int().nonnegative(),
  items: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    price_cents: z.number().int().nonnegative(),
    qty: z.number().int().positive(),
  })).min(1),
  idempotencyKey: z.string().min(8).optional(), // allow header override
});

function supabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !serviceKey) throw new Error('missing supabase env');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export default fp(async (app: FastifyInstance) => {
  app.post('/api/orders/checkout', async (req, reply) => {
    try {
      const headerKey = (req.headers['idempotency-key'] || req.headers['x-idempotency-key']) as string | undefined;
      const parsed = CheckoutBody.parse({ ...(req.body as any), idempotencyKey: (req.body as any)?.idempotencyKey ?? headerKey });

      const { tenantId, sessionId, mode, tableId, items, idempotencyKey, cartVersion } = parsed;

      if (!idempotencyKey) {
        return reply.code(400).send({ error: 'idempotency_required' });
      }
      if (mode === 'table' && !tableId) {
        return reply.code(400).send({ error: 'table_required_for_dinein' });
      }

      const sb = supabaseAdmin();

      // 1) Optimistic lock: bump cart_version only if matches client version
      const { data: bump, error: bumpErr } = await sb
        .from('table_sessions')
        .update({ cart_version: (cartVersion + 1) })
        .eq('tenant_id', tenantId)
        .eq('id', sessionId)
        .eq('cart_version', cartVersion)
        .select('id')
        .limit(1);

      if (bumpErr) {
        return reply.code(500).send({ error: 'cart_version_update_failed', detail: bumpErr.message });
      }
      if (!bump || bump.length === 0) {
        return reply.code(409).send({ error: 'stale_cart' }); // Someone already checked out
      }

      // 2) Pre-check: existing active order for same table (dine-in)
      if (mode === 'table' && tableId) {
        const { data: active, error: activeErr } = await sb
          .from('orders')
          .select('id,status')
          .eq('tenant_id', tenantId)
          .eq('table_id', tableId)
          .in('status', ['pending', 'processing'])
          .limit(1);
        if (activeErr) {
          return reply.code(500).send({ error: 'active_check_failed', detail: activeErr.message });
        }
        if (active && active.length > 0) {
          return reply.code(409).send({ error: 'active_order_exists', order_id: active[0].id });
        }
      }

      // 3) Compute total
      const total_cents = items.reduce((sum, i) => sum + i.price_cents * i.qty, 0);

      // 4) Insert order with idempotency key (unique)
      const { data: inserted, error: insertErr } = await sb
        .from('orders')
        .insert([{
          tenant_id: tenantId,
          session_id: sessionId,
          table_id: mode === 'table' ? tableId! : null,
          mode,
          status: 'pending',
          total_cents,
          idempotency_key: idempotencyKey,
        }])
        .select('id, status, total_cents')
        .limit(1);

      if (insertErr) {
        // Handle duplicate idempotency (unique constraint)
        // 23505 = unique_violation
        if (insertErr.code === '23505') {
          const { data: existing } = await sb
            .from('orders')
            .select('id, status, total_cents')
            .eq('tenant_id', tenantId)
            .eq('idempotency_key', idempotencyKey)
            .limit(1);
          return reply.code(200).send({ duplicate: true, order: existing?.[0] ?? null });
        }
        // Handle unique partial index hit for active order (race)
        if (insertErr.message?.includes('ux_orders_active_per_table')) {
          return reply.code(409).send({ error: 'active_order_exists' });
        }
        return reply.code(500).send({ error: 'order_insert_failed', detail: insertErr.message });
      }

      const order = inserted![0];

      // 5) (Optional) Place external charge here. In tests we skip real charge.
      // If success, you could set status='processing' or 'paid' accordingly.

      return reply.code(201).send({ order });
    } catch (e: any) {
      return reply.code(400).send({ error: 'bad_request', detail: e?.message });
    }
  });

  // Fetch order status by id (handy for tests)
  app.get('/api/orders/status', async (req, reply) => {
    const id = (req.query as any)?.id as string | undefined;
    const tenantId = (req.query as any)?.tenantId as string | undefined;
    if (!id || !tenantId) return reply.code(400).send({ error: 'missing_params' });
    const sb = supabaseAdmin();
    const { data, error } = await sb.from('orders').select('*').eq('tenant_id', tenantId).eq('id', id).limit(1);
    if (error) return reply.code(500).send({ error: 'db_error', detail: error.message });
    return reply.code(200).send({ order: data?.[0] ?? null });
  });
});