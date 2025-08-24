import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// ---- helpers: normalize request body (snake_case → camelCase, coerce numbers) ----
function normalizeBody(input: any) {
  const b = typeof input === 'string' ? JSON.parse(input) : (input ?? {});
  // accept both camelCase and snake_case keys
  const tenantId     = b.tenantId ?? b.tenant_id ?? b.tenantID;
  const sessionId    = b.sessionId ?? b.session_id ?? b.sessionID;
  const mode         = b.mode;
  const tableId      = (b.tableId ?? b.table_id ?? null) || null;

  // coerce numbers that may arrive as strings
  const cartVersion  = b.cartVersion ?? b.cart_version ?? b.cartVer ?? b.cart_ver;
  const totalCents   = b.totalCents ?? b.total_cents ?? b.amount_cents ?? b.amountCents;

  return {
    tenantId,
    sessionId,
    mode,
    tableId,
    cartVersion,
    totalCents,
  };
}

// Body schema: coerce numeric fields; require tableId only for table mode
const BodySchema = z.object({
  tenantId: z.string().uuid(),
  sessionId: z.string().min(1),
  mode: z.enum(['table', 'takeaway']),
  tableId: z.string().uuid().nullable().optional(),
  cartVersion: z.coerce.number().int().nonnegative(), // coerce "0" → 0
  totalCents: z.coerce.number().int().nonnegative(),  // coerce "1000" → 1000
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
  if (!url || !serviceKey) throw new Error('server_misconfigured');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export default fp(async function ordersRoutes(app: FastifyInstance) {
  app.post('/api/orders/checkout', async (req, reply) => {
    // 1) Require Idempotency-Key header
    const idem = (req.headers['idempotency-key'] ||
      req.headers['Idempotency-Key'] ||
      req.headers['IDEMPOTENCY-KEY']) as string | undefined;
    if (!idem || idem.trim() === '') {
      return reply.code(400).send({ error: 'idempotency_required' });
    }

    // 2) Normalize + validate body
    const normalized = normalizeBody(req.body);
    const parsed = BodySchema.safeParse(normalized);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      const msg = first?.message === 'table_required' ? 'table_required' : 'bad_request';
      const hint = process.env.NODE_ENV === 'test' ? { hint: first?.message || first?.code } : {};
      return reply.code(400).send({ error: msg, ...hint });
    }
    const { tenantId, sessionId, mode, tableId, cartVersion, totalCents } = parsed.data;

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

      // 4) Map RPC/DB errors → precise HTTP codes
      if (error) {
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('stale_cart'))          return reply.code(409).send({ error: 'stale_cart' });
        if (msg.includes('active_order_exists'))  return reply.code(409).send({ error: 'active_order_exists' });
        if (msg.includes('forbidden'))            return reply.code(403).send({ error: 'forbidden' });
        req.log.error({ err: error }, 'checkout_order rpc failed');
        return reply.code(500).send({ error: 'internal_error' });
      }

      // RPC returns table(order_id uuid, duplicate boolean)
      const row = Array.isArray(data) ? data[0] : data;
      const orderId = row?.order_id as string | undefined;
      const duplicate = !!row?.duplicate;

      if (!orderId) return reply.code(500).send({ error: 'internal_error' });

      // 5) Status by duplicate/new
      if (duplicate) return reply.code(200).send({ order: { id: orderId }, duplicate: true });
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
});