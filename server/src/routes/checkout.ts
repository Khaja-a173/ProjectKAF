// server/src/routes/checkout.ts
// NOTE: Legacy manual checkout endpoints are deprecated.
// All checkout flows should use: POST /checkout/create-intent -> POST /checkout/confirm -> (optional) /checkout/cancel
// Ensure no other route files expose overlapping endpoints.
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { getRedisClient, buildRedisKey } from '../plugins/redis';

/**
 * Checkout routes
 * - Mounted under prefix /checkout (e.g., app.register(checkoutRoutes, { prefix: '/checkout' }))
 * - Feature flag: ENABLE_PAYMENTS=true to enable routes
 * - Providers: 'mock' implemented; others return 501 until wired
 * - Storage: Supabase (via app.supabase). No app.pg usage.
 */

const CurrencySchema = z.string().min(3).max(8).default('INR');
const ENABLE_PAYMENTS = process.env.ENABLE_PAYMENTS === 'true';
const DEFAULT_CURRENCY = CurrencySchema.parse(process.env.PAYMENTS_CURRENCY ?? 'INR');

// Unified logger context helper
function logCtx(base: Record<string, any>, start: number) {
  return { ...base, ms: Date.now() - start };
}

// Body schemas
const CreateIntentBody = z.object({
  cart_id: z.string().uuid(),
  provider: z.enum(['stripe', 'razorpay', 'mock']).default('mock')
});

const ConfirmBody = z.object({
  intent_id: z.string().uuid(),
  provider_payload: z.any().optional()
});

const CancelBody = z.object({
  intent_id: z.string().uuid()
});

export default async function checkoutRoutes(app: FastifyInstance) {
  if (!ENABLE_PAYMENTS) {
    app.log.info('Payment features disabled via ENABLE_PAYMENTS flag');
    // Provide a harmless probe route to aid diagnostics
    app.get('/_disabled', async () => ({ ok: true, reason: 'payments_disabled' }));
    return;
  }

  // ----------------------------------------------------------------------------
  // POST /checkout/create-intent
  // ----------------------------------------------------------------------------
  app.post('/create-intent', { preHandler: [app.requireTenant] }, async (req, reply) => {
    const start = Date.now();
    const reqId = randomUUID();
    try {
      const parsed = CreateIntentBody.safeParse((req as any).body);
      if (!parsed.success) {
        app.log.info(logCtx({ reqId }, start), 'checkout_create_intent_done');
        return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
      }
      const { cart_id, provider } = parsed.data;

      const tenantId = (req as any).tenantId || (req.headers['x-tenant-id'] as string | undefined) || null;
      const userIdHdr = (req.headers['x-user-id'] as string | undefined) || null;

      // Prepare Redis (optional)
      const redis = getRedisClient(app);
      const cacheParts: Record<string, 'HIT' | 'MISS' | 'SKIP'> = {};

      // 1) Fetch cart (tenant-scoped) & ensure it exists
      const { data: cart, error: cartErr } = await app.supabase
        .from('carts')
        .select('id, tenant_id, user_id, status')
        .eq('id', cart_id)
        .maybeSingle();
      if (cartErr) throw cartErr;
      if (!cart) {
        app.log.info(logCtx({ reqId, tenantId, cart_id, provider }, start), 'checkout_create_intent_done');
        return reply.code(404).send({ error: 'cart_not_found' });
      }
      if (tenantId && cart.tenant_id !== tenantId) {
        app.log.warn(logCtx({ reqId, tenantId, cart_id, provider }, start), 'checkout_create_intent_tenant_mismatch');
        return reply.code(403).send({ error: 'tenant_mismatch' });
      }
      if (cart.status !== 'open' && cart.status !== 'inactive') {
        app.log.info(logCtx({ reqId }, start), 'checkout_create_intent_done');
        return reply.code(409).send({ error: 'cart_not_open' });
      }

      // 2) Load tenant tax settings (Redis-backed, 5 min TTL)
      const taxKey = buildRedisKey('checkout', 'tset', cart.tenant_id, 'v1');
      let tset: any | null = null;
      if (redis) {
        try {
          const cached = await redis.get(taxKey);
          if (cached) {
            tset = JSON.parse(cached);
            cacheParts.tax = 'HIT';
          } else {
            cacheParts.tax = 'MISS';
          }
        } catch {
          cacheParts.tax = 'SKIP';
        }
      }
      if (!tset) {
        const { data, error } = await app.supabase
          .from('v_tenant_tax_effective')
          .select('currency, mode, effective_rate, breakdown, inclusion')
          .eq('tenant_id', cart.tenant_id)
          .maybeSingle();
        if (error) throw error;
        tset = data;
        if (redis && tset) {
          try { await redis.setex(taxKey, 300, JSON.stringify(tset)); } catch {}
        }
      }
      const tenantCurrency = (tset as any)?.currency || DEFAULT_CURRENCY;
      const taxMode = (tset as any)?.mode || 'single';
      const effectiveRateRaw = Number((tset as any)?.effective_rate);
      const effectiveRate = Number.isFinite(effectiveRateRaw) ? effectiveRateRaw : 0;
      const breakdown = (tset as any)?.breakdown || [];

      // 3) Compute totals from cart_items (Redis-backed, 5 min TTL). Invalidation happens in cart routes.
      const totalsKey = buildRedisKey('cart', 'totals', cart_id, 'v1');
      let subtotal = 0;
      if (redis) {
        try {
          const cachedTotals = await redis.get(totalsKey);
          if (cachedTotals) {
            const parsed = JSON.parse(cachedTotals);
            if (typeof parsed?.subtotal === 'number') {
              subtotal = parsed.subtotal;
              cacheParts.totals = 'HIT';
            }
          } else {
            cacheParts.totals = 'MISS';
          }
        } catch {
          cacheParts.totals = 'SKIP';
        }
      }
      if (subtotal === 0) {
        const { data: items, error: itemsErr } = await app.supabase
          .from('cart_items')
          .select('qty, price')
          .eq('cart_id', cart_id)
          .eq('tenant_id', cart.tenant_id);
        if (itemsErr) throw itemsErr;
        subtotal = (items || []).reduce((sum: number, row: any) => {
          const unit = Number(row.price) || 0;
          const qty = Number(row.qty) || 0;
          return sum + unit * qty;
        }, 0);
        if (redis) {
          try { await redis.setex(totalsKey, 300, JSON.stringify({ subtotal, at: Date.now() })); } catch {}
        }
      }

      // Compute tax breakdown amounts proportionally and ensure rounding consistency
      let taxBreakdown: Record<string, { amount: number; rate: number }> = {};
      let totalTaxAmount = 0;

      if (breakdown.length === 0) {
        // No breakdown, apply effective_rate as single tax
        const taxAmount = Number((subtotal * effectiveRate).toFixed(2));
        taxBreakdown = {
          [taxMode === 'composite' ? 'composite' : 'single']: { amount: taxAmount, rate: effectiveRate }
        };
        totalTaxAmount = taxAmount;
      } else {
        // Composite or single with breakdown array
        // Calculate raw amounts first
        const comps: Array<{ name: string; rate: number }> = Array.isArray(breakdown)
          ? breakdown.map((b: any) => ({ name: String(b.name ?? 'Tax'), rate: Number(b.rate) || 0 }))
          : [];

        const rawAmounts = comps.map((comp, idx) => {
          const rate = comp.rate;
          const key = comp.name || `tax_${idx + 1}`;
          return { key, rate, rawAmount: subtotal * rate };
        });
        // Round amounts to 2 decimals and accumulate total rounded tax
        let roundedAmounts = rawAmounts.map(({ key, rate, rawAmount }) => ({
          key,
          rate,
          amount: Number(rawAmount.toFixed(2))
        }));
        totalTaxAmount = roundedAmounts.reduce((acc: number, cur) => acc + cur.amount, 0);

        // Adjust for rounding difference so subtotal + sum(tax) = total
        const total = Number((subtotal + totalTaxAmount).toFixed(2));
        const roundingDiff = total - (subtotal + totalTaxAmount);
        if (roundingDiff !== 0 && roundedAmounts.length > 0) {
          // Adjust the largest tax amount by roundingDiff
          let maxIndex = 0;
          let maxAmount = roundedAmounts[0].amount;
          for (let i = 1; i < roundedAmounts.length; i++) {
            if (roundedAmounts[i].amount > maxAmount) {
              maxAmount = roundedAmounts[i].amount;
              maxIndex = i;
            }
          }
          roundedAmounts[maxIndex].amount = Number((roundedAmounts[maxIndex].amount + roundingDiff).toFixed(2));
          totalTaxAmount = roundedAmounts.reduce((acc: number, cur) => acc + cur.amount, 0);
        }

        taxBreakdown = {};
        for (const item of roundedAmounts) {
          taxBreakdown[item.key] = { amount: item.amount, rate: item.rate };
        }
      }

      const total = Number((subtotal + totalTaxAmount).toFixed(2));

      if (cacheParts.tax) reply.header('X-Cache-Tax', cacheParts.tax);
      if (cacheParts.totals) reply.header('X-Cache-Totals', cacheParts.totals);

      // Persist payment intent (required for /confirm)
      const intentId = randomUUID();
      const nowIso = new Date().toISOString();
      {
        const { error: piErr } = await app.supabase
          .from('payment_intents')
          .insert({
            id: intentId,
            tenant_id: cart.tenant_id,
            cart_id: cart_id,
            provider,
            amount: total,
            currency: tenantCurrency,
            status: 'requires_payment_method',
            created_at: nowIso,
            updated_at: nowIso
          });
        if (piErr) {
          const msg = String(piErr.message || '').toLowerCase();
          if (msg.includes('relation') && msg.includes('does not exist')) {
            app.log.info(logCtx({ reqId }, start), 'checkout_create_intent_done');
            return reply.code(503).send({ error: 'Service not available', reason: 'missing_table' });
          }
          throw piErr;
        }
      }

      app.log.info(
        logCtx({ reqId, tenantId, userId: userIdHdr, cart_id, provider, total, currency: tenantCurrency, tax_mode: taxMode, effective_rate: effectiveRate }, start),
        'checkout_create_intent_done'
      );
      return reply.send({
        intent: {
          id: intentId,
          amount: total,
          currency: tenantCurrency,
          status: 'requires_payment_method',
          tax_breakdown: taxBreakdown
        },
        client_secret: provider === 'mock' ? `mock_${intentId}` : null,
        provider_params: provider === 'mock' ? { mock: true } : {}
      });
    } catch (err: any) {
      app.log.error({ err, ms: Date.now() - start }, 'create_intent_failed');
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('relation') && msg.includes('does not exist')) {
        app.log.info(logCtx({ reqId }, start), 'checkout_create_intent_done');
        return reply.code(503).send({ error: 'Service not available', reason: 'missing_table' });
      }
      app.log.info(logCtx({ reqId }, start), 'checkout_create_intent_done');
      return reply.code(500).send({ error: 'internal_server_error' });
    }
  });

  // ----------------------------------------------------------------------------
  // POST /checkout/confirm
  // ----------------------------------------------------------------------------
  app.post('/confirm', { preHandler: [app.requireTenant] }, async (req, reply) => {
    const start = Date.now();
    const reqId = randomUUID();
    try {
      const parsed = ConfirmBody.safeParse((req as any).body);
      if (!parsed.success) {
        app.log.info(logCtx({ reqId }, start), 'checkout_confirm_done');
        return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
      }
      const { intent_id } = parsed.data;

      const tenantId = (req as any).tenantId || (req.headers['x-tenant-id'] as string | undefined) || null;
      const userIdHdr = (req.headers['x-user-id'] as string | undefined) || null;

      // 1) Load intent
      const { data: intent, error: iErr } = await app.supabase
        .from('payment_intents')
        .select('*')
        .eq('id', intent_id)
        .maybeSingle();
      if (iErr) throw iErr;
      if (!intent) {
        app.log.info(logCtx({ reqId }, start), 'checkout_confirm_done');
        return reply.code(404).send({ error: 'payment_intent_not_found' });
      }
      if (intent.status === 'succeeded' && intent.order_id) {
        // Fetch tax breakdown for response consistency
        const { data: tset, error: tErr } = await app.supabase
          .from('v_tenant_tax_effective')
          .select('mode, effective_rate, breakdown, inclusion')
          .eq('tenant_id', intent.tenant_id)
          .maybeSingle();
        let taxBreakdown: Record<string, { amount: number; rate: number }> = {};
        if (!tErr && tset) {
          const taxMode = (tset as any)?.mode || 'single';
          const effectiveRateRaw = Number((tset as any)?.effective_rate);
          const effectiveRate = Number.isFinite(effectiveRateRaw) ? effectiveRateRaw : 0;
          const breakdown = (tset as any)?.breakdown || [];
          // We don't have subtotal here, so send empty or null tax_breakdown for idempotent success
          taxBreakdown = {};
          const comps2: Array<{ name: string; rate: number }> = Array.isArray(breakdown)
            ? breakdown.map((b: any) => ({ name: String(b.name ?? 'Tax'), rate: Number(b.rate) || 0 }))
            : [];
          for (const comp of comps2) {
            const key = comp.name;
            taxBreakdown[key] = { amount: 0, rate: comp.rate };
          }
          if (breakdown.length === 0) {
            taxBreakdown[taxMode === 'composite' ? 'composite' : 'single'] = { amount: 0, rate: effectiveRate };
          }
        }
        app.log.info(logCtx({ reqId, tenantId, intent_id, cart_id: intent.cart_id }, start), 'checkout_confirm_idempotent');
        return reply.send({ status: 'succeeded', order_id: intent.order_id, tax_breakdown: taxBreakdown });
      }

      // 2) Provider handling
      if (intent.provider === 'mock') {
        // Fetch cart to get tenant_id + user_id (needed by RPC)
        const { data: cart, error: cErr } = await app.supabase
          .from('carts')
          .select('id, tenant_id, user_id, status')
          .eq('id', intent.cart_id)
          .maybeSingle();
        if (cErr) throw cErr;
        if (!cart) {
          app.log.info(logCtx({ reqId, tenantId, intent_id }, start), 'checkout_confirm_done');
          return reply.code(404).send({ error: 'cart_not_found' });
        }
        if (tenantId && cart.tenant_id !== tenantId) {
          app.log.warn(logCtx({ reqId, tenantId, intent_id, cart_id: cart.id }, start), 'checkout_confirm_tenant_mismatch');
          return reply.code(403).send({ error: 'tenant_mismatch' });
        }
        if (userIdHdr && cart.user_id && cart.user_id !== userIdHdr) {
          app.log.warn(logCtx({ reqId, tenantId, intent_id, cart_id: cart.id }, start), 'checkout_confirm_user_mismatch');
          return reply.code(403).send({ error: 'user_mismatch' });
        }
        if (cart.status !== 'open' && cart.status !== 'inactive') {
          app.log.info(logCtx({ reqId, tenantId, intent_id, cart_id: cart.id }, start), 'checkout_confirm_done');
          return reply.code(409).send({ error: 'cart_not_open' });
        }

        // Delegate order creation to transactional RPC, fallback to inline if RPC fails or missing
        const { data: rpcData, error: rpcErr } = await app.supabase.rpc('checkout_cart', {
          p_tenant_id: cart.tenant_id,
          p_user_id: cart.user_id,
          p_cart_id: cart.id,
          p_payment_intent_id: intent_id,
          p_notes: 'paid via mock provider'
        });

        let orderId: string | undefined = (rpcData as any)?.order_id as string | undefined;

        if (rpcErr || !orderId) {
          // Inspect error and only short-circuit for cart-related issues
          const msg = String(rpcErr?.message || '').toLowerCase();
          if (msg.includes('cart_empty')) {
            app.log.info(logCtx({ reqId }, start), 'checkout_confirm_done');
            return reply.code(400).send({ error: 'cart_empty' });
          }
          if (msg.includes('not_open')) {
            app.log.info(logCtx({ reqId }, start), 'checkout_confirm_done');
            return reply.code(409).send({ error: 'cart_not_open' });
          }

          // Fallback path (no RPC): compute subtotal and create order inline (mock provider only)
          // 1) Recompute subtotal
          const { data: items2, error: itemsErr2 } = await app.supabase
            .from('cart_items')
            .select('qty, price')
            .eq('cart_id', cart.id)
            .eq('tenant_id', cart.tenant_id);
          if (itemsErr2) throw itemsErr2;
          const subtotal2 = (items2 || []).reduce((sum: number, row: any) => {
            const unit = Number(row.price) || 0;
            const qty = Number(row.qty) || 0;
            return sum + unit * qty;
          }, 0);
          if (!Number.isFinite(subtotal2) || subtotal2 <= 0) {
            app.log.info(logCtx({ reqId }, start), 'checkout_confirm_done');
            return reply.code(400).send({ error: 'cart_empty' });
          }

          // 2) Insert order
          orderId = randomUUID();
          const nowIso2 = new Date().toISOString();
          {
            const { error: ordErr } = await app.supabase
              .from('orders')
              .insert({
                id: orderId,
                tenant_id: cart.tenant_id,
                cart_id: cart.id,
                total_amount: Number(subtotal2.toFixed(2)),
                status: 'paid',
                created_at: nowIso2,
                updated_at: nowIso2
              });
            if (ordErr) throw ordErr;
          }

          // 3) Mark cart checked_out (best-effort)
          try {
            await app.supabase
              .from('carts')
              .update({ status: 'checked_out', updated_at: new Date().toISOString() })
              .eq('id', cart.id);
          } catch {}
          // (No update of payment_intents here; atomic update will be done below)
        }

        // Ensure atomic linkage: set order_id and succeeded together (satisfies trigger on_payment_succeeded)
        if (!orderId) {
          throw new Error('order_creation_failed');
        }
        {
          const { error: piFinalErr } = await app.supabase
            .from('payment_intents')
            .update({ order_id: orderId, status: 'succeeded', updated_at: new Date().toISOString() })
            .eq('id', intent_id);
          if (piFinalErr) throw piFinalErr;
        }

        // Fetch tax breakdown for the tenant for response
        const { data: tset, error: tErr } = await app.supabase
          .from('v_tenant_tax_effective')
          .select('mode, effective_rate, breakdown, inclusion')
          .eq('tenant_id', cart.tenant_id)
          .maybeSingle();

        let taxBreakdown: Record<string, { amount: number; rate: number }> = {};
        if (!tErr && tset) {
          const taxMode = (tset as any)?.mode || 'single';
          const effectiveRateRaw = Number((tset as any)?.effective_rate);
          const effectiveRate = Number.isFinite(effectiveRateRaw) ? effectiveRateRaw : 0;
          const breakdown = (tset as any)?.breakdown || [];

          // We don't have subtotal here, so send empty or null tax_breakdown for success
          taxBreakdown = {};
          const comps3: Array<{ name: string; rate: number }> = Array.isArray(breakdown)
            ? breakdown.map((b: any) => ({ name: String(b.name ?? 'Tax'), rate: Number(b.rate) || 0 }))
            : [];
          for (const comp of comps3) {
            const key = comp.name;
            taxBreakdown[key] = { amount: 0, rate: comp.rate };
          }
          if (breakdown.length === 0) {
            taxBreakdown[taxMode === 'composite' ? 'composite' : 'single'] = { amount: 0, rate: effectiveRate };
          }
          app.log.info(logCtx({ reqId, tenantId: cart.tenant_id, tax_mode: taxMode, effective_rate: effectiveRate }, start), 'checkout_confirm_tax_info');
        }

        app.log.info(logCtx({ reqId, tenantId, intent_id, cart_id: cart.id, order_id: orderId }, start), 'checkout_confirm_done');
        return reply.send({ status: 'succeeded', order_id: orderId, tax_breakdown: taxBreakdown });
      }

      // Other providers: not implemented (wire later)
      app.log.info(logCtx({ reqId }, start), 'checkout_confirm_done');
      return reply.code(501).send({ error: 'provider_not_implemented' });
    } catch (err: any) {
      app.log.error({ err, ms: Date.now() - start }, 'confirm_payment_failed');
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('relation') && msg.includes('does not exist')) {
        app.log.info(logCtx({ reqId }, start), 'checkout_confirm_done');
        return reply.code(503).send({ error: 'Service not available', reason: 'missing_table' });
      }
      app.log.info(logCtx({ reqId }, start), 'checkout_confirm_done');
      return reply.code(500).send({ error: 'internal_server_error' });
    }
  });

  // ----------------------------------------------------------------------------
  // POST /checkout/cancel
  // ----------------------------------------------------------------------------
  app.post('/cancel', { preHandler: [app.requireTenant] }, async (req, reply) => {
    const start = Date.now();
    const reqId = randomUUID();
    try {
      const parsed = CancelBody.safeParse((req as any).body);
      if (!parsed.success) {
        app.log.info(logCtx({ reqId }, start), 'checkout_cancel_done');
        return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
      }

      const tenantId = (req as any).tenantId || (req.headers['x-tenant-id'] as string | undefined) || null;

      const { intent_id } = parsed.data;
      const { error } = await app.supabase
        .from('payment_intents')
        .update({ status: 'canceled', updated_at: new Date().toISOString() })
        .eq('id', intent_id);
      if (error) throw error;

      app.log.info(logCtx({ reqId, tenantId, intent_id }, start), 'checkout_cancel_done');
      return reply.send({ status: 'canceled' });
    } catch (err: any) {
      app.log.error({ err, ms: Date.now() - start }, 'cancel_payment_failed');
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('relation') && msg.includes('does not exist')) {
        app.log.info(logCtx({ reqId }, start), 'checkout_cancel_done');
        return reply.code(503).send({ error: 'Service not available', reason: 'missing_table' });
      }
      app.log.info(logCtx({ reqId }, start), 'checkout_cancel_done');
      return reply.code(500).send({ error: 'internal_server_error' });
    }
  });
}