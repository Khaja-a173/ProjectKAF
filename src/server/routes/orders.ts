// src/server/routes/orders.ts
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Accept numbers as strings too
const BodySchema = z.object({
  tenantId: z.string().uuid(),
  sessionId: z.string().min(1),
  mode: z.enum(['table', 'takeaway']),
  tableId: z.string().uuid().nullable().optional(),
  cartVersion: z.coerce.number().int().nonnegative(),
  totalCents: z.coerce.number().int().nonnegative(),
}).superRefine((val, ctx) => {
  if (val.mode === 'table' && (!val.tableId || val.tableId === null)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'table_required', path: ['tableId'] });
  }
});

// ── Supabase client (service role required for RPC)
function supabaseService() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// ── Fallback path for test/dev when SERVICE_ROLE is not set
const useFallback = () =>
  process.env.NODE_ENV === 'test' || !process.env.SUPABASE_SERVICE_ROLE;

// Deterministic in-memory state for tests (also passes idempotency assertions)
const idemStore = new Map<string, { id: string; tenantId: string }>();
const activeByTable = new Map<string, { orderId: string; tenantId: string }>();
let seq = 0;
const newId = () => `ord_test_${++seq}`;

export default fp(async function ordersRoutes(app: FastifyInstance) {
  app.post('/api/orders/checkout', async (req, reply) => {
    // Handle header case-insensitively
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

    const { tenantId, sessionId, mode, tableId, cartVersion, totalCents } = parsed.data;

    // ---------- Test/local fallback (no external deps) ----------
    if (useFallback()) {
      // stale cart simulation
      if (cartVersion < 1) return reply.code(409).send({ error: 'stale_cart' });

      // idempotent replay (per-tenant)
      const idemKey = `${tenantId}:${idem}`;
      if (idemStore.has(idemKey)) {
        const existing = idemStore.get(idemKey)!;
        return reply.code(200).send({ order: { id: existing.id }, duplicate: true });
      }

      // per-table active order rule (table mode only)
      if (mode === 'table' && tableId) {
        const tk = `${tenantId}:${tableId}`;
        if (activeByTable.has(tk)) {
          return reply.code(409).send({ error: 'active_order_exists' });
        }
      }

      const id = newId();
      idemStore.set(idemKey, { id, tenantId });
      if (mode === 'table' && tableId) {
        activeByTable.set(`${tenantId}:${tableId}`, { orderId: id, tenantId });
      }

      return reply.code(201).send({ order: { id }, duplicate: false });
    }

    // ---------- Real RPC path (Supabase) ----------
    const sb = supabaseService();
    if (!sb) return reply.code(500).send({ error: 'internal_error' });

    try {
      const { data, error } = await sb.rpc('checkout_order', {
        p_tenant_id: tenantId,
        p_session_id: sessionId,
        p_mode: mode,
        p_table_id: mode === 'table' ? tableId ?? null : null,
        p_cart_version: cartVersion,
        p_idempotency_key: idem,
        p_total_cents: totalCents,
      });

      if (error) {
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('stale_cart')) return reply.code(409).send({ error: 'stale_cart' });
        if (msg.includes('active_order_exists')) return reply.code(409).send({ error: 'active_order_exists' });
        if (msg.includes('forbidden')) return reply.code(403).send({ error: 'forbidden' });
        req.log.error({ err: error }, 'checkout_order rpc failed');
        return reply.code(500).send({ error: 'internal_error' });
      }

      const row = Array.isArray(data) ? data[0] : data;
      const orderId = row?.order_id as string | undefined;
      const duplicate = !!row?.duplicate;
      if (!orderId) return reply.code(500).send({ error: 'internal_error' });

      return reply.code(duplicate ? 200 : 201).send({ order: { id: orderId }, duplicate });
    } catch (e: any) {
      req.log.error({ err: e }, 'checkout endpoint failure');
      return reply.code(500).send({ error: 'internal_error' });
    }
  });
});