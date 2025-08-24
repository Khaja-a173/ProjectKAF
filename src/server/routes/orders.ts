import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Body schema expected by tests
const BodySchema = z.object({
  tenantId: z.string().uuid(),
  sessionId: z.string().min(1),
  mode: z.enum(['table', 'takeaway']),
  tableId: z.string().uuid().nullable().optional(),
  cartVersion: z.coerce.number().int().nonnegative(),
  totalCents: z.coerce.number().int().nonnegative(),
}).superRefine((val, ctx) => {
  if (val.mode === 'table' && (!val.tableId || val.tableId === null)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'table_required',
      path: ['tableId'],
    });
  }
});

function makeServiceClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !serviceKey) {
    throw new Error('server_misconfigured');
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export default fp(async function ordersRoutes(app: FastifyInstance) {
  app.post('/api/orders/checkout', async (req, reply) => {
    // 0) Body normalization: tests may omit Content-Type, yielding a string body.
    let rawBody: unknown = req.body;
    if (typeof rawBody === 'string') {
      try {
        rawBody = JSON.parse(rawBody);
      } catch {
        // keep as string; Zod will fail with bad_request below
      }
    }

    // 1) Require Idempotency-Key header
    const idem = (req.headers['idempotency-key'] ||
      req.headers['Idempotency-Key'] ||
      req.headers['IDEMPOTENCY-KEY']) as string | undefined;

    if (!idem || idem.trim() === '') {
      return reply.code(400).send({ error: 'idempotency_required' });
    }

    // 2) Validate body
    const parse = BodySchema.safeParse(rawBody);
    if (!parse.success) {
      const first = parse.error.issues[0];
      const msg = first?.message === 'table_required' ? 'table_required' : 'bad_request';
      // Helpful hint during tests
      if (process.env.NODE_ENV === 'test') {
        return reply.code(400).send({
          error: msg,
          hint: 'Zod validation failed',
          debug: { received: rawBody }
        });
      }
      return reply.code(400).send({ error: msg });
    }
    const { tenantId, sessionId, mode, tableId, cartVersion, totalCents } = parse.data;

    // 3) Call transactional RPC
    const sb = makeServiceClient();
    const p_table_id = mode === 'table' ? tableId! : null;

    try {
      const { data, error } = await sb.rpc('checkout_order', {
        p_tenant_id: tenantId,
        p_session_id: sessionId,
        p_mode: mode,
        p_table_id,
        p_cart_version: cartVersion,
        p_idempotency_key: idem,
        p_total_cents: totalCents,
      });

      // 4) Map RPC/DB errors
      if (error) {
        const blob = `${error.message ?? ''} ${error.details ?? ''} ${error.hint ?? ''}`.toLowerCase();
        if (blob.includes('stale_cart')) {
          return reply.code(409).send({ error: 'stale_cart' });
        }
        if (blob.includes('active_order_exists')) {
          return reply.code(409).send({ error: 'active_order_exists' });
        }
        if (blob.includes('forbidden')) {
          return reply.code(403).send({ error: 'forbidden' });
        }
        req.log.error({ err: error }, 'checkout_order rpc failed');
        return reply.code(500).send({ error: 'internal_error' });
      }

      const row = Array.isArray(data) ? data[0] : data;
      const orderId = row?.order_id as string | undefined;
      const duplicate = !!row?.duplicate;

      if (!orderId) {
        return reply.code(500).send({ error: 'internal_error' });
      }

      if (duplicate) {
        return reply.code(200).send({ order: { id: orderId }, duplicate: true });
      }
      return reply.code(201).send({ order: { id: orderId }, duplicate: false });
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (msg.includes('server_misconfigured')) {
        return reply.code(500).send({ error: 'internal_error' });
      }
      req.log.error({ err: e }, 'checkout endpoint failure');
      return reply.code(500).send({ error: 'internal_error' });
    }
  });

  // Fetch order status by id (handy for tests)
  app.get('/api/orders/status', async (req, reply) => {
    const id = (req.query as any)?.id as string | undefined;
    const tenantId = (req.query as any)?.tenantId as string | undefined;
    if (!id || !tenantId) return reply.code(400).send({ error: 'missing_params' });
    const sb = makeServiceClient();
    const { data, error } = await sb.from('orders').select('*').eq('tenant_id', tenantId).eq('id', id).limit(1);
    if (error) return reply.code(500).send({ error: 'db_error', detail: error.message });
    return reply.code(200).send({ order: data?.[0] ?? null });
  });
});