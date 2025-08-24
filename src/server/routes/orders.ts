import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Normalize mode (accept 'table' | 'takeaway' or 'DINE_IN' | 'TAKEAWAY')
const ModeSchema = z.preprocess((v) => {
  if (typeof v !== 'string') return v;
  const s = v.trim().toUpperCase();
  if (s === 'TABLE') return 'DINE_IN';
  if (s === 'TAKEAWAY') return 'TAKEAWAY';
  return s;
}, z.enum(['DINE_IN', 'TAKEAWAY']));

// Request validation
const BodySchema = z.object({
  tenantId: z.string().uuid(),
  sessionId: z.string().min(1),
  mode: ModeSchema, // -> 'DINE_IN' | 'TAKEAWAY'
  tableId: z.string().uuid().optional().nullable(),
  cartVersion: z.coerce.number().int().nonnegative(),
  totalCents: z.coerce.number().int().nonnegative(),
}).superRefine((val, ctx) => {
  if (val.mode === 'DINE_IN' && (!val.tableId || val.tableId === null)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'table_required', path: ['tableId'] });
  }
});

// Supabase service client
function makeServiceClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.VITE_SUPABASE_SERVICE_ROLE; // allow tests to provide via VITE_*
  if (!url || !serviceKey) throw new Error('server_misconfigured');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export default fp(async function ordersRoutes(app: FastifyInstance) {
  app.post('/api/orders/checkout', async (req, reply) => {
    // Idempotency (case-insensitive header)
    const idem =
      (req.headers['idempotency-key'] as string) ??
      (req.headers['Idempotency-Key'] as string) ??
      (req.headers['IDEMPOTENCY-KEY'] as string);

    if (!idem || idem.trim() === '') {
      return reply.code(400).send({ error: 'idempotency_required' });
    }

    // Validate body
    const parsed = BodySchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      const msg = first?.message === 'table_required' ? 'table_required' : 'bad_request';
      return reply.code(400).send({ error: msg });
    }

    const { tenantId, sessionId, mode, tableId, cartVersion, totalCents } = parsed.data;

    try {
      const sb = makeServiceClient();

      // RPC expects DB mode values; we pass 'DINE_IN' or 'TAKEAWAY'
      const { data, error } = await sb.rpc('checkout_order', {
        p_tenant_id: tenantId,
        p_session_id: sessionId,
        p_mode: mode, // 'DINE_IN' | 'TAKEAWAY'
        p_table_id: mode === 'DINE_IN' ? (tableId ?? null) : null,
        p_cart_version: cartVersion,
        p_idempotency_key: idem,
        p_total_cents: totalCents,
      });

      if (error) {
        const m = (error.message || '').toLowerCase();
        if (m.includes('stale_cart')) return reply.code(409).send({ error: 'stale_cart' });
        if (m.includes('active_order_exists')) return reply.code(409).send({ error: 'active_order_exists' });
        if (m.includes('forbidden')) return reply.code(403).send({ error: 'forbidden' });
        req.log.error({ err: error }, 'checkout_order rpc failed');
        return reply.code(500).send({ error: 'internal_error' });
      }

      const row = Array.isArray(data) ? data[0] : data;
      const orderId = row?.order_id as string | undefined;
      const duplicate = !!row?.duplicate;
      if (!orderId) return reply.code(500).send({ error: 'internal_error' });

      return reply.code(duplicate ? 200 : 201).send({ order: { id: orderId }, duplicate });
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (msg.includes('server_misconfigured')) {
        // Make the error obvious in logs, but keep generic to client
        req.log.error('Missing SUPABASE_URL / SERVICE_ROLE in env for checkout RPC');
        return reply.code(500).send({ error: 'internal_error' });
      }
      req.log.error({ err: e }, 'checkout endpoint failure');
      return reply.code(500).send({ error: 'internal_error' });
    }
  });

  // Keep this diagnostic endpoint
  app.get('/api/orders/status', async (_req, reply) => {
    return reply.code(200).send({ ok: true });
  });
});