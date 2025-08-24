import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Accept UI or enum modes; coerce numbers; require tableId for dine-in
const BodySchema = z.object({
  tenantId: z.string().uuid(),
  sessionId: z.string().min(1),
  mode: z.union([z.enum(['table', 'takeaway']), z.enum(['DINE_IN', 'TAKEAWAY'])]),
  tableId: z.string().uuid().optional().nullable(),
  cartVersion: z.coerce.number().int(),
  totalCents: z.coerce.number().int().nonnegative(),
}).superRefine((val, ctx) => {
  const m = String(val.mode).toUpperCase();
  const isTable = m === 'TABLE' || m === 'DINE_IN';
  if (isTable && (!val.tableId || val.tableId === null)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'table_required', path: ['tableId'] });
  }
});

function normMode(mode: string): 'table' | 'takeaway' {
  const m = String(mode).toUpperCase();
  return (m === 'DINE_IN' || m === 'TABLE') ? 'table' : 'takeaway';
}

function makeServiceClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !serviceKey) throw new Error('server_misconfigured');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

const ACTIVE = ['NEW','PREPARING','READY','PAY_PENDING'];

export default fp(async function ordersRoutes(app: FastifyInstance) {
  app.post('/api/orders/checkout', async (req, reply) => {
    const idem =
      (req.headers['idempotency-key'] as string) ??
      (req.headers['Idempotency-Key'] as string) ??
      (req.headers['IDEMPOTENCY-KEY'] as string);

    if (!idem || idem.trim() === '') {
      return reply.code(400).send({ error: 'idempotency_required' });
    }

    const parsed = BodySchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      const msg = first?.message === 'table_required' ? 'table_required' : 'bad_request';
      return reply.code(400).send({ error: msg });
    }

    const { tenantId, sessionId, tableId, totalCents } = parsed.data;
    const mode = normMode((parsed.data as any).mode);
    const cartVersion = parsed.data.cartVersion ?? 0;

    if (cartVersion < 1) {
      return reply.code(409).send({ error: 'stale_cart' });
    }

    let sb;
    try {
      sb = makeServiceClient();
    } catch {
      return reply.code(500).send({ error: 'internal_error' });
    }

    try {
      // Fast idempotency check
      const { data: existing, error: qErr } = await sb
        .from('orders')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('idempotency_key', idem)
        .limit(1)
        .maybeSingle();

      if (qErr) {
        req.log.error({ err: qErr }, 'idempotency lookup failed');
        return reply.code(500).send({ error: 'internal_error' });
      }
      if (existing?.id) {
        return reply.code(200).send({ order: { id: existing.id }, duplicate: true });
      }

      // One active dine-in per table
      if (mode === 'table' && tableId) {
        const { data: active, error: actErr } = await sb
          .from('orders')
          .select('id,status')
          .eq('tenant_id', tenantId)
          .eq('table_id', tableId)
          .in('status', ACTIVE)
          .limit(1);

        if (actErr) {
          req.log.error({ err: actErr }, 'active-order lookup failed');
          return reply.code(500).send({ error: 'internal_error' });
        }
        if (active && active.length > 0) {
          return reply.code(409).send({ error: 'active_order_exists' });
        }
      }

      // Insert with idempotent upsert
      const row = {
        tenant_id: tenantId,
        session_id: sessionId,
        mode,
        table_id: mode === 'table' ? tableId ?? null : null,
        cart_version: cartVersion,
        total_cents: totalCents,
        idempotency_key: idem,
        status: 'NEW',
      };

      const { data: created, error: insErr } = await sb
        .from('orders')
        .upsert(row, { onConflict: 'tenant_id,idempotency_key', ignoreDuplicates: true })
        .select('id')
        .limit(1);

      if (insErr) {
        const msg = (insErr.message || '').toLowerCase();
        if ((insErr as any).code === '23505' || msg.includes('duplicate') || msg.includes('idempotency')) {
          const { data: again } = await sb
            .from('orders')
            .select('id')
            .eq('tenant_id', tenantId)
            .eq('idempotency_key', idem)
            .limit(1)
            .maybeSingle();
          if (again?.id) return reply.code(200).send({ order: { id: again.id }, duplicate: true });
          return reply.code(500).send({ error: 'internal_error' });
        }
        if (msg.includes('active') && msg.includes('table')) {
          return reply.code(409).send({ error: 'active_order_exists' });
        }
        req.log.error({ err: insErr }, 'order insert failed');
        return reply.code(500).send({ error: 'internal_error' });
      }

      const orderId = created?.[0]?.id;
      if (!orderId) {
        const { data: again } = await sb
          .from('orders')
          .select('id')
          .eq('tenant_id', tenantId)
          .eq('idempotency_key', idem)
          .limit(1)
          .maybeSingle();
        if (again?.id) return reply.code(200).send({ order: { id: again.id }, duplicate: true });
        return reply.code(500).send({ error: 'internal_error' });
      }

      return reply.code(201).send({ order: { id: orderId }, duplicate: false });
    } catch (e: any) {
      req.log.error({ err: e }, 'checkout endpoint failure');
      return reply.code(500).send({ error: 'internal_error' });
    }
  });
});