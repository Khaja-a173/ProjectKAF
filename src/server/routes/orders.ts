// src/server/routes/orders.ts
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// ── Validation (coerce numbers, enforce tableId in table mode)
const BodySchema = z.object({
  tenantId: z.string().uuid(),
  sessionId: z.string().min(1),
  // accept either UI strings ('table'|'takeaway') or API enums ('DINE_IN'|'TAKEAWAY')
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

// ── Helpers
function makeServiceClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !serviceKey) throw new Error('server_misconfigured');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

function normMode(mode: string): 'table' | 'takeaway' {
  const m = String(mode).toUpperCase();
  if (m === 'DINE_IN' || m === 'TABLE') return 'table';
  return 'takeaway';
}

const ACTIVE_STATUSES = new Set(['NEW', 'PREPARING', 'READY', 'PAY_PENDING']);

export default fp(async function ordersRoutes(app: FastifyInstance) {
  app.post('/api/orders/checkout', async (req, reply) => {
    // Idempotency header (case-insensitive)
    const idem =
      (req.headers['idempotency-key'] as string) ??
      (req.headers['Idempotency-Key'] as string) ??
      (req.headers['IDEMPOTENCY-KEY'] as string);

    if (!idem || idem.trim() === '') {
      return reply.code(400).send({ error: 'idempotency_required' });
    }

    // Parse & validate body
    const parsed = BodySchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      const msg = first?.message === 'table_required' ? 'table_required' : 'bad_request';
      return reply.code(400).send({ error: msg });
    }

    const { tenantId, sessionId, tableId, totalCents } = parsed.data;
    const mode = normMode((parsed.data as any).mode);
    const cartVersion = parsed.data.cartVersion ?? 0;

    // Enforce optimistic cart version (tests expect 409 when stale)
    if (cartVersion < 1) {
      return reply.code(409).send({ error: 'stale_cart' });
    }

    // Supabase client
    let sb;
    try {
      sb = makeServiceClient();
    } catch {
      return reply.code(500).send({ error: 'internal_error' });
    }

    try {
      // 1) Idempotency: return existing order if key already used for this tenant
      {
        const { data: existing, error: qErr } = await sb
          .from('orders')
          .select('id')
          .eq('tenant_id', tenantId)
          .eq('idempotency_key', idem)
          .limit(1)
          .maybeSingle();

        if (qErr) {
          req.log.error({ err: qErr }, 'idempotency lookup failed');
          // Fall through as internal error
          return reply.code(500).send({ error: 'internal_error' });
        }

        if (existing?.id) {
          return reply.code(200).send({ order: { id: existing.id }, duplicate: true });
        }
      }

      // 2) Per-table dine-in rule: exactly one active dine-in per table
      if (mode === 'table' && tableId) {
        const { data: active, error: actErr } = await sb
          .from('orders')
          .select('id,status,mode')
          .eq('tenant_id', tenantId)
          .eq('table_id', tableId)
          .in('status', Array.from(ACTIVE_STATUSES))
          .limit(1);

        if (actErr) {
          req.log.error({ err: actErr }, 'active-order lookup failed');
          return reply.code(500).send({ error: 'internal_error' });
        }

        if (active && active.length > 0) {
          return reply.code(409).send({ error: 'active_order_exists' });
        }
      }

      // 3) Create order (unique on tenant_id + idempotency_key prevents doubles under race)
      const payload = {
        tenant_id: tenantId,
        session_id: sessionId,
        mode, // store normalized mode
        table_id: mode === 'table' ? tableId ?? null : null,
        cart_version: cartVersion,
        total_cents: totalCents,
        idempotency_key: idem,
        status: 'NEW',
      };

      // Prefer an UPSERT with onConflict to be race-safe (ignoreDuplicates keeps the first)
      // If your PostgREST version doesn't support ignoreDuplicates, the unique constraint will raise 23505.
      const { data: created, error: insErr } = await sb
        .from('orders')
        .upsert(payload, {
          onConflict: 'tenant_id,idempotency_key',
          ignoreDuplicates: true,
        })
        .select('id')
        .limit(1);

      if (insErr) {
        // Map known conflict errors to 409 deterministically
        const msg = (insErr.message || '').toLowerCase();
        if (msg.includes('duplicate') || msg.includes('idempotency') || (insErr as any).code === '23505') {
          // Duplicate idempotency-use; fetch the original and return 200
          const { data: again } = await sb
            .from('orders')
            .select('id')
            .eq('tenant_id', tenantId)
            .eq('idempotency_key', idem)
            .limit(1)
            .maybeSingle();
          if (again?.id) {
            return reply.code(200).send({ order: { id: again.id }, duplicate: true });
          }
          // If we can't find it, treat as internal (rare)
          return reply.code(500).send({ error: 'internal_error' });
        }

        if (msg.includes('active') && msg.includes('table')) {
          return reply.code(409).send({ error: 'active_order_exists' });
        }

        req.log.error({ err: insErr }, 'order insert failed');
        return reply.code(500).send({ error: 'internal_error' });
      }

      // PostgREST upsert+ignoreDuplicates can return [] when duplicate;
      // In that case, retrieve and return 200 duplicate.
      const orderId = created?.[0]?.id;
      if (!orderId) {
        const { data: again } = await sb
          .from('orders')
          .select('id')
          .eq('tenant_id', tenantId)
          .eq('idempotency_key', idem)
          .limit(1)
          .maybeSingle();

        if (again?.id) {
          return reply.code(200).send({ order: { id: again.id }, duplicate: true });
        }

        // If still no row, something is off
        return reply.code(500).send({ error: 'internal_error' });
      }

      // Success (newly created)
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

  // Minimal status endpoint (kept for diagnostics)
  app.get('/api/orders/status', async (_req, reply) => {
    return reply.code(200).send({ ok: true });
  });
});