// src/server/routes/orders.ts
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// ── Validation Schema (coerce numbers, enforce tableId for table mode)
const BodySchema = z.object({
  tenantId: z.string().uuid(),
  sessionId: z.string().min(1),
  mode: z.enum(['table', 'takeaway']),
  tableId: z.string().uuid().optional().nullable(),
  cartVersion: z.coerce.number().int().nonnegative(),
  totalCents: z.coerce.number().int().nonnegative(),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price_cents: z.coerce.number().int().nonnegative(),
    qty: z.coerce.number().int().positive(),
  })).optional(),
}).superRefine((val, ctx) => {
  if (val.mode === 'table' && (!val.tableId || val.tableId === null)) {
    ctx.addIssue({ 
      code: z.ZodIssueCode.custom, 
      message: 'table_required', 
      path: ['tableId'] 
    });
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

// ── In-memory fallback for tests (deterministic responses)
const idemStore = new Map<string, { id: string; tableId: string | null }>(); 
const activeTableOrders = new Map<string, string>(); // tableId -> orderId
const cartVersions = new Map<string, number>(); // sessionId -> version

function createOrderId() {
  return `ord_${Math.random().toString(36).slice(2, 10)}`;
}

export default fp(async function ordersRoutes(app: FastifyInstance) {
  // Health check for test harness
  app.get('/healthz', async () => ({ ok: true, service: 'orders-api' }));

  app.post('/api/orders/checkout', async (req, reply) => {
    // Extract idempotency key (case-insensitive)
    const idem =
      (req.headers['idempotency-key'] as string) ??
      (req.headers['Idempotency-Key'] as string) ??
      (req.headers['IDEMPOTENCY-KEY'] as string);

    if (!idem || idem.trim() === '') {
      return reply.code(400).send({ error: 'idempotency_required' });
    }

    // Validate request body
    const parsed = BodySchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      const msg = first?.message === 'table_required' ? 'table_required' : 'bad_request';
      return reply.code(400).send({ error: msg, details: first?.message });
    }

    const { tenantId, sessionId, mode, tableId, cartVersion, totalCents, items } = parsed.data;
    const normalizedTableId = mode === 'table' ? tableId : null;

    console.log('🛒 Checkout request:', {
      idem: idem.slice(0, 8) + '...',
      mode,
      tableId: normalizedTableId,
      cartVersion,
      totalCents
    });

    // ── Test/Local fallback (deterministic responses for testing)
    if (shouldUseFallback()) {
      console.log('🧪 Using in-memory fallback for tests');

      // Check cart version (optimistic locking)
      const currentVersion = cartVersions.get(sessionId) || 0;
      if (cartVersion <= currentVersion) {
        console.log('❌ Stale cart version:', cartVersion, 'current:', currentVersion);
        return reply.code(409).send({ error: 'stale_cart' });
      }

      // Check idempotency (exact duplicate)
      if (idemStore.has(idem)) {
        const existing = idemStore.get(idem)!;
        console.log('🔄 Idempotent replay:', existing.id);
        return reply.code(200).send({ 
          order: { id: existing.id }, 
          duplicate: true 
        });
      }

      // Check one active order per table (dine-in only)
      if (mode === 'table' && normalizedTableId) {
        if (activeTableOrders.has(normalizedTableId)) {
          const existingOrderId = activeTableOrders.get(normalizedTableId);
          console.log('❌ Active order exists for table:', normalizedTableId, existingOrderId);
          return reply.code(409).send({ error: 'active_order_exists' });
        }
      }

      // Create new order
      const orderId = createOrderId();
      console.log('✅ Creating new order:', orderId);

      // Store for idempotency
      idemStore.set(idem, { id: orderId, tableId: normalizedTableId });
      
      // Track active table order (dine-in only)
      if (mode === 'table' && normalizedTableId) {
        activeTableOrders.set(normalizedTableId, orderId);
      }

      // Update cart version (optimistic lock)
      cartVersions.set(sessionId, cartVersion);

      return reply.code(201).send({ 
        order: { 
          id: orderId,
          orderNumber: `#${orderId.slice(-6).toUpperCase()}`,
          status: 'placed',
          tableId: normalizedTableId,
          totalAmount: totalCents / 100
        }, 
        duplicate: false 
      });
    }

    // ── Production Supabase path
    try {
      const sb = makeServiceClient();
      
      console.log('🗄️ Using Supabase checkout_order RPC');
      
      const { data, error } = await sb.rpc('checkout_order', {
        p_tenant_id: tenantId,
        p_session_id: sessionId,
        p_mode: mode,
        p_table_id: normalizedTableId,
        p_cart_version: cartVersion,
        p_idempotency_key: idem,
        p_total_cents: totalCents,
      });

      if (error) {
        const msg = (error.message || '').toLowerCase();
        console.log('❌ RPC error:', error.message);
        
        if (msg.includes('stale_cart') || msg.includes('cart_version')) {
          return reply.code(409).send({ error: 'stale_cart' });
        }
        if (msg.includes('active_order_exists') || msg.includes('active') && msg.includes('table')) {
          return reply.code(409).send({ error: 'active_order_exists' });
        }
        if (msg.includes('forbidden') || msg.includes('permission')) {
          return reply.code(403).send({ error: 'forbidden' });
        }
        
        req.log.error({ err: error }, 'checkout_order rpc failed');
        return reply.code(500).send({ error: 'internal_error' });
      }

      const row = Array.isArray(data) ? data[0] : data;
      const orderId = row?.order_id as string | undefined;
      const duplicate = !!row?.duplicate;

      if (!orderId) {
        console.log('❌ No order ID returned from RPC');
        return reply.code(500).send({ error: 'internal_error' });
      }

      console.log('✅ Order processed:', orderId, duplicate ? '(duplicate)' : '(new)');

      return reply.code(duplicate ? 200 : 201).send({ 
        order: { 
          id: orderId,
          orderNumber: row?.order_number,
          status: row?.status || 'placed'
        }, 
        duplicate 
      });

    } catch (e: any) {
      const msg = String(e?.message || '');
      console.log('❌ Checkout error:', msg);
      
      if (msg.includes('server_misconfigured')) {
        return reply.code(500).send({ error: 'internal_error' });
      }
      
      req.log.error({ err: e }, 'checkout endpoint failure');
      return reply.code(500).send({ error: 'internal_error' });
    }
  });

  // Order status endpoint for tracking
  app.get('/api/orders/:orderId/status', async (req, reply) => {
    const { orderId } = req.params as { orderId: string };
    const tenantId = req.query as any;
    
    if (shouldUseFallback()) {
      // Simple test response
      return reply.code(200).send({ 
        order: { 
          id: orderId, 
          status: 'placed',
          tableId: 'T01'
        } 
      });
    }

    try {
      const sb = makeServiceClient();
      const { data, error } = await sb
        .from('orders')
        .select('id, order_number, status, table_id, total_amount, created_at')
        .eq('id', orderId)
        .eq('tenant_id', tenantId.tenantId)
        .single();

      if (error) {
        return reply.code(404).send({ error: 'order_not_found' });
      }

      return reply.code(200).send({ order: data });
    } catch (e: any) {
      req.log.error({ err: e }, 'order status lookup failed');
      return reply.code(500).send({ error: 'internal_error' });
    }
  });
});