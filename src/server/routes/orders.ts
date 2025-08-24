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

      const total_cents = items.reduce((sum, i) => sum + i.price_cents * i.qty, 0);
      const { data: rpc, error: rpcErr } = await sb.rpc('app.checkout_order', {
        p_tenant_id: tenantId,
        p_session_id: sessionId,
        p_mode: mode,
        p_table_id: tableId ?? null,
        p_cart_version: cartVersion,
        p_idempotency_key: idempotencyKey,
        p_total_cents: total_cents
      });
      if (rpcErr) {
        const msg = rpcErr.message || '';
        if (msg.includes('stale_cart')) return reply.code(409).send({ error: 'stale_cart' });
        if (msg.includes('active_order_exists')) return reply.code(409).send({ error: 'active_order_exists' });
        if (msg.includes('forbidden')) return reply.code(403).send({ error: 'forbidden' });
        // unique violation is handled inside function; but guard anyway
        return reply.code(500).send({ error: 'order_tx_failed', detail: msg });
      }
      const row = rpc?.[0];
      if (!row) return reply.code(500).send({ error: 'order_tx_empty' });
      if (row.duplicate) {
        // Return existing order (id-only ok for tests)
        return reply.code(200).send({ duplicate: true, order: { id: row.order_id } });
      }

      return reply.code(201).send({ order: { id: row.order_id, total_cents } });
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