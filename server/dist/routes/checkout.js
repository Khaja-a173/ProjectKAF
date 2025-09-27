import { z } from 'zod';
import { randomUUID } from 'crypto';
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
function logCtx(base, start) {
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
export default async function checkoutRoutes(app) {
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
            const parsed = CreateIntentBody.safeParse(req.body);
            if (!parsed.success) {
                app.log.info(logCtx({ reqId }, start), 'checkout_create_intent_done');
                return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
            }
            const { cart_id, provider } = parsed.data;
            const tenantId = req.tenantId || req.headers['x-tenant-id'] || null;
            const userIdHdr = req.headers['x-user-id'] || null;
            // 1) Fetch cart (tenant-scoped) & ensure it exists
            const { data: cart, error: cartErr } = await app.supabase
                .from('carts')
                .select('id, tenant_id, user_id, status')
                .eq('id', cart_id)
                .maybeSingle();
            if (cartErr)
                throw cartErr;
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
            // 2) Load tenant tax settings from v_tenant_tax_effective (currency, tax_mode, effective_rate, breakdown)
            const { data: tset, error: tErr } = await app.supabase
                .from('v_tenant_tax_effective')
                .select('currency, tax_mode, effective_rate, breakdown')
                .eq('tenant_id', cart.tenant_id)
                .maybeSingle();
            if (tErr)
                throw tErr;
            const tenantCurrency = tset?.currency || DEFAULT_CURRENCY;
            const taxMode = tset?.tax_mode || 'single';
            const effectiveRateRaw = Number(tset?.effective_rate);
            const effectiveRate = Number.isFinite(effectiveRateRaw) ? effectiveRateRaw : 0;
            const breakdown = tset?.breakdown || [];
            // 3) Compute totals from cart_items snapshots (qty * price)
            const { data: items, error: itemsErr } = await app.supabase
                .from('cart_items')
                .select('qty, price')
                .eq('cart_id', cart_id)
                .eq('tenant_id', cart.tenant_id);
            if (itemsErr)
                throw itemsErr;
            const subtotal = (items || []).reduce((sum, row) => {
                const unit = Number(row.price) || 0;
                const qty = Number(row.qty) || 0;
                return sum + unit * qty;
            }, 0);
            // Compute tax breakdown amounts proportionally and ensure rounding consistency
            let taxBreakdown = {};
            let totalTaxAmount = 0;
            if (breakdown.length === 0) {
                // No breakdown, apply effective_rate as single tax
                const taxAmount = Number((subtotal * effectiveRate).toFixed(2));
                taxBreakdown = {
                    [taxMode === 'composite' ? 'composite' : 'single']: { amount: taxAmount, rate: effectiveRate }
                };
                totalTaxAmount = taxAmount;
            }
            else {
                // Composite or single with breakdown array
                // Calculate raw amounts first
                const comps = Array.isArray(breakdown)
                    ? breakdown.map((b) => ({ name: String(b.name ?? 'Tax'), rate: Number(b.rate) || 0 }))
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
                totalTaxAmount = roundedAmounts.reduce((acc, cur) => acc + cur.amount, 0);
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
                    totalTaxAmount = roundedAmounts.reduce((acc, cur) => acc + cur.amount, 0);
                }
                taxBreakdown = {};
                for (const item of roundedAmounts) {
                    taxBreakdown[item.key] = { amount: item.amount, rate: item.rate };
                }
            }
            const total = Number((subtotal + totalTaxAmount).toFixed(2));
            app.log.info(logCtx({ reqId, tenantId, userId: userIdHdr, cart_id, provider, total, currency: tenantCurrency, tax_mode: taxMode, effective_rate: effectiveRate }, start), 'checkout_create_intent_done');
            return reply.send({
                intent: {
                    id: randomUUID(),
                    amount: total,
                    currency: tenantCurrency,
                    status: 'requires_payment_method',
                    tax_breakdown: taxBreakdown
                },
                client_secret: provider === 'mock' ? `mock_${randomUUID()}` : null,
                provider_params: provider === 'mock' ? { mock: true } : {}
            });
        }
        catch (err) {
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
            const parsed = ConfirmBody.safeParse(req.body);
            if (!parsed.success) {
                app.log.info(logCtx({ reqId }, start), 'checkout_confirm_done');
                return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
            }
            const { intent_id } = parsed.data;
            const tenantId = req.tenantId || req.headers['x-tenant-id'] || null;
            const userIdHdr = req.headers['x-user-id'] || null;
            // 1) Load intent
            const { data: intent, error: iErr } = await app.supabase
                .from('payment_intents')
                .select('*')
                .eq('id', intent_id)
                .maybeSingle();
            if (iErr)
                throw iErr;
            if (!intent) {
                app.log.info(logCtx({ reqId }, start), 'checkout_confirm_done');
                return reply.code(404).send({ error: 'payment_intent_not_found' });
            }
            if (intent.status === 'succeeded' && intent.order_id) {
                // Fetch tax breakdown for response consistency
                const { data: tset, error: tErr } = await app.supabase
                    .from('v_tenant_tax_effective')
                    .select('tax_mode, effective_rate, breakdown')
                    .eq('tenant_id', intent.tenant_id)
                    .maybeSingle();
                let taxBreakdown = {};
                if (!tErr && tset) {
                    const taxMode = tset?.tax_mode || 'single';
                    const effectiveRateRaw = Number(tset?.effective_rate);
                    const effectiveRate = Number.isFinite(effectiveRateRaw) ? effectiveRateRaw : 0;
                    const breakdown = tset?.breakdown || [];
                    // We don't have subtotal here, so send empty or null tax_breakdown for idempotent success
                    taxBreakdown = {};
                    const comps2 = Array.isArray(breakdown)
                        ? breakdown.map((b) => ({ name: String(b.name ?? 'Tax'), rate: Number(b.rate) || 0 }))
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
                // Mark intent succeeded (mock provider)
                const { error: upErr } = await app.supabase
                    .from('payment_intents')
                    .update({ status: 'succeeded', updated_at: new Date().toISOString() })
                    .eq('id', intent_id);
                if (upErr)
                    throw upErr;
                // Fetch cart to get tenant_id + user_id (needed by RPC)
                const { data: cart, error: cErr } = await app.supabase
                    .from('carts')
                    .select('id, tenant_id, user_id, status')
                    .eq('id', intent.cart_id)
                    .maybeSingle();
                if (cErr)
                    throw cErr;
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
                // Delegate order creation to transactional RPC
                const { data: rpcData, error: rpcErr } = await app.supabase.rpc('checkout_cart', {
                    p_tenant_id: cart.tenant_id,
                    p_user_id: cart.user_id,
                    p_cart_id: cart.id,
                    p_payment_intent_id: intent_id,
                    p_notes: 'paid via mock provider'
                });
                if (rpcErr) {
                    const msg = String(rpcErr.message || '').toLowerCase();
                    if (msg.includes('cart_empty')) {
                        app.log.info(logCtx({ reqId }, start), 'checkout_confirm_done');
                        return reply.code(400).send({ error: 'cart_empty' });
                    }
                    if (msg.includes('not_open')) {
                        app.log.info(logCtx({ reqId }, start), 'checkout_confirm_done');
                        return reply.code(409).send({ error: 'cart_not_open' });
                    }
                    throw rpcErr;
                }
                const orderId = rpcData?.order_id;
                if (!orderId) {
                    app.log.info(logCtx({ reqId }, start), 'checkout_confirm_done');
                    return reply.code(500).send({ error: 'checkout_missing_order_id' });
                }
                // Persist order_id on intent for idempotency
                await app.supabase
                    .from('payment_intents')
                    .update({ order_id: orderId, updated_at: new Date().toISOString() })
                    .eq('id', intent_id);
                // Fetch tax breakdown for the tenant for response
                const { data: tset, error: tErr } = await app.supabase
                    .from('v_tenant_tax_effective')
                    .select('tax_mode, effective_rate, breakdown')
                    .eq('tenant_id', cart.tenant_id)
                    .maybeSingle();
                let taxBreakdown = {};
                if (!tErr && tset) {
                    const taxMode = tset?.tax_mode || 'single';
                    const effectiveRateRaw = Number(tset?.effective_rate);
                    const effectiveRate = Number.isFinite(effectiveRateRaw) ? effectiveRateRaw : 0;
                    const breakdown = tset?.breakdown || [];
                    // We don't have subtotal here, so send empty or null tax_breakdown for success
                    taxBreakdown = {};
                    const comps3 = Array.isArray(breakdown)
                        ? breakdown.map((b) => ({ name: String(b.name ?? 'Tax'), rate: Number(b.rate) || 0 }))
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
        }
        catch (err) {
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
            const parsed = CancelBody.safeParse(req.body);
            if (!parsed.success) {
                app.log.info(logCtx({ reqId }, start), 'checkout_cancel_done');
                return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
            }
            const tenantId = req.tenantId || req.headers['x-tenant-id'] || null;
            const { intent_id } = parsed.data;
            const { error } = await app.supabase
                .from('payment_intents')
                .update({ status: 'canceled', updated_at: new Date().toISOString() })
                .eq('id', intent_id);
            if (error)
                throw error;
            app.log.info(logCtx({ reqId, tenantId, intent_id }, start), 'checkout_cancel_done');
            return reply.send({ status: 'canceled' });
        }
        catch (err) {
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
