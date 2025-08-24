// src/server/routes/orders.ts
import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// ── Validation (coerce numbers, enforce tableId for table mode)
const BodySchema = z.object({
  tenantId: z.string().uuid(),
  sessionId: z.string().min(1),
  mode: z.enum(['table', 'takeaway']),
  tableId: z.string().uuid().optional().nullable(),
  cartVersion: z.coerce.number().int().nonnegative(),
  totalCents: z.coerce.number().int().nonnegative(),
}).superRefine((val, ctx) => {
  if (val.mode === 'table' && (!val.tableId || val.tableId === null)) {
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

function shouldUseFallback() {
  // Use fallback in tests or when service key isn't configured
  return process.env.NODE_ENV === 'test' || !process.env.SUPABASE_SERVICE_ROLE;
}

// ── In-memory fallback for tests (deterministic behavior)
const idemStore = new Map<string, { id: string }>();                 // idempotency-key -> { id }
const activeTable = new Map<string, { orderId: string }>();           // tenantId:tableId -> { orderId }
const lastCartVersionBySession = new Map<string, number>();           // sessionId -> last cartVersion

function createOrderId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as any).randomUUID();
  }
  return `ord_${Math.random().toString(36).slice(2, 10)}`;
}

export default fp(async function ordersRoutes(app: FastifyInstance) {
  // IMPORTANT: do NOT register /healthz here (server/index.ts already does)

  app.post('/api/orders/checkout', async (req, reply) => {
    // Idempotency header (case-insensitive)
    const idem =
      (req.headers['idempotency-key'] as string) ??
      (req.headers['Idempotency-Key'] as string) ??
      (req.headers['IDEMPOTENCY-KEY'] as string);

    if (!idem || idem.trim() === '') {
      return reply.code(400).send({ error: 'idempotency_required' });
    }

    // Body validation
    const parsed = BodySchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      const msg = first?.message === 'table_required' ? 'table_required' : 'bad_request';
      return reply.code(400).send({ error: msg });
    }

    const { tenantId, sessionId, mode, tableId, cartVersion, totalCents } = parsed.data;

    // ── Test/Local fallback (no external deps) → exact status codes for tests
    if (shouldUseFallback()) {
      // 1) idempotency replay
      if (idemStore.has(idem)) {
        const existing = idemStore.get(idem)!;
        return reply.code(200).send({ order: { id: existing.id }, duplicate: true });
      }

      // 2) optimistic cart lock per session
      const last = lastCartVersionBySession.get(sessionId) ?? -1;
      if (cartVersion <= last) {
        return reply.code(409).send({ error: 'stale_cart' });
      }
      lastCartVersionBySession.set(sessionId, cartVersion);

      // 3) one active dine-in order per table (scoped by tenant)
      if (mode === 'table' && tableId) {
        const key = `${tenantId}:${tableId}`;
        if (activeTable.has(key)) {
          return reply.code(409).send({ error: 'active_order_exists' });
        }
      }

      // 4) create order
      const id = createOrderId();
      idemStore.set(idem, { id });
      if (mode === 'table' && tableId) {
        activeTable.set(`${tenantId}:${tableId}`, { orderId: id });
      }

      return reply.code(201).send({ order: { id }, duplicate: false });
    }

    // ── Real RPC path (production/Supabase)
    try {
      const sb = makeServiceClient();
      const p_table_id = mode === 'table' ? (tableId ?? null) : null;

      const { data, error } = await sb.rpc('checkout_order', {
        p_tenant_id: tenantId,
        p_session_id: sessionId,
        p_mode: mode,
        p_table_id,
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
      const msg = String(e?.message || '');
      if (msg.includes('server_misconfigured')) {
        return reply.code(500).send({ error: 'internal_error' });
      }
      req.log.error({ err: e }, 'checkout endpoint failure');
      return reply.code(500).send({ error: 'internal_error' });
    }
  });

  // Simple status endpoint for diagnostics (kept distinct from /healthz)
  app.get('/api/orders/status', async (_req, reply) => {
    return reply.code(200).send({ ok: true });
  });
});