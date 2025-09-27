import { z } from 'zod';
import { createCartService } from '../services/cartService';
import { randomUUID } from 'crypto';
// Unified logger context helper (mirrors checkout.ts)
function logCtx(base, start) {
    return { ...base, ms: Date.now() - start };
}
// -----------------------------
// Helpers (local, file-scoped)
// -----------------------------
async function getTenantTaxConfig(fastify, tenantId) {
    const { data, error } = await fastify.supabase
        .from('v_tenant_tax_effective')
        .select('effective_rate, breakdown, mode, currency, inclusion')
        .eq('tenant_id', tenantId)
        .limit(1)
        .single();
    if (error || !data) {
        return { effective_rate: 0.08, breakdown: [{ name: 'Tax', rate: 0.08 }], mode: 'single', currency: 'INR', inclusion: 'inclusive' };
    }
    // Ensure breakdown is an array of {name, rate}
    const breakdown = Array.isArray(data.breakdown) ? data.breakdown : [{ name: 'Tax', rate: data.effective_rate ?? 0 }];
    return { effective_rate: data.effective_rate ?? 0, breakdown, mode: data.mode, currency: data.currency || 'INR', inclusion: data.inclusion || 'inclusive' };
}
function splitInclusive(total, taxRate) {
    const subtotal = total / (1 + taxRate);
    const tax = total - subtotal;
    return { subtotal, tax };
}
// Compute cart totals using inclusive tax logic (with composite breakdown support)
function computeCartTotalsInclusive(items, taxRate, breakdown) {
    const total = items.reduce((sum, it) => {
        const line = Number(it.price) * Number(it.qty || 0);
        return sum + (Number.isFinite(line) ? line : 0);
    }, 0);
    const { subtotal, tax } = splitInclusive(total, taxRate);
    let tax_breakdown = [];
    const comps = Array.isArray(breakdown) ? breakdown.filter(c => Number(c.rate) > 0) : [];
    if (comps.length > 0) {
        const sumRates = comps.reduce((s, c) => s + Number(c.rate || 0), 0) || 1;
        let allocated = 0;
        comps.forEach((c, idx) => {
            const isLast = idx === comps.length - 1;
            const amt = isLast ? (tax - allocated) : +(tax * (Number(c.rate) / sumRates)).toFixed(6);
            allocated = +(allocated + amt).toFixed(6);
            tax_breakdown.push({ name: c.name, rate: Number(c.rate), amount: +amt.toFixed(6) });
        });
    }
    else {
        tax_breakdown = [{ name: 'Tax', rate: taxRate, amount: +tax.toFixed(6) }];
    }
    return {
        subtotal: +subtotal.toFixed(6),
        tax: +tax.toFixed(6),
        total: +total.toFixed(6),
        pricing_mode: 'tax_inclusive',
        tax_breakdown,
    };
}
function computeCartTotalsExclusive(items, breakdown) {
    const subtotal = items.reduce((sum, it) => {
        const line = Number(it.price) * Number(it.qty || 0);
        return sum + (Number.isFinite(line) ? line : 0);
    }, 0);
    const comps = Array.isArray(breakdown) ? breakdown.filter(c => Number(c.rate) > 0) : [];
    const effRate = comps.length > 0
        ? comps.reduce((s, c) => s + Number(c.rate || 0), 0)
        : 0;
    const tax = subtotal * effRate;
    let tax_breakdown = [];
    if (comps.length > 0) {
        const sumRates = comps.reduce((s, c) => s + Number(c.rate || 0), 0) || 1;
        let allocated = 0;
        comps.forEach((c, idx) => {
            const isLast = idx === comps.length - 1;
            const amt = isLast ? (tax - allocated) : +(tax * (Number(c.rate) / sumRates)).toFixed(6);
            allocated = +(allocated + amt).toFixed(6);
            tax_breakdown.push({ name: c.name, rate: Number(c.rate), amount: +amt.toFixed(6) });
        });
    }
    else {
        tax_breakdown = [{ name: 'Tax', rate: effRate, amount: +tax.toFixed(6) }];
    }
    return {
        subtotal: +subtotal.toFixed(6),
        tax: +tax.toFixed(6),
        total: +(subtotal + tax).toFixed(6),
        pricing_mode: 'tax_exclusive',
        tax_breakdown,
    };
}
// Prefer plugin-provided context values for tenant and user
function tenantFromReq(req) {
    const ctxTid = req.tenantId;
    if (ctxTid && typeof ctxTid === 'string')
        return ctxTid;
    return requireTenantId(req.headers);
}
function userFromReq(req) {
    // Prefer value bound by preHandler in server/src/index.ts
    const ctxBound = req?.userId;
    if (ctxBound && typeof ctxBound === 'string' && ctxBound.trim())
        return ctxBound.trim();
    // Then prefer auth plugin (if present)
    const ctxUid = req?.auth?.userId;
    if (ctxUid && typeof ctxUid === 'string' && ctxUid.trim())
        return ctxUid.trim();
    // Then fall back to header directly
    const hdr = req.headers['x-user-id']
        || req.headers['X-User-Id']
        || req.headers['X-USER-ID']
        || undefined;
    if (hdr && typeof hdr === 'string' && hdr.trim())
        return hdr.trim();
    // Finally, enforce requirement
    return requireUserId(req.headers);
}
function requireTenantId(headers) {
    const h = headers || {};
    const id = h['x-tenant-id'] ||
        h['X-Tenant-Id'] ||
        h['X-TENANT-ID'];
    if (!id || typeof id !== 'string' || id.length < 10) {
        const err = new Error('X-Tenant-Id header required');
        // @ts-ignore
        err.statusCode = 400;
        throw err;
    }
    return id;
}
function requireUserId(headers) {
    const h = headers || {};
    const id = h['x-user-id'] ||
        h['X-User-Id'] ||
        h['X-USER-ID'];
    if (!id || typeof id !== 'string' || id.length < 6) {
        const err = new Error('X-User-Id header required');
        // @ts-ignore
        err.statusCode = 401;
        throw err;
    }
    return id;
}
// Helper to load menu item price/name for a set of IDs (for cart ops)
async function loadMenuMeta(fastify, tenantId, ids) {
    const uniq = Array.from(new Set(ids));
    if (uniq.length === 0)
        return new Map();
    const { data, error } = await fastify.supabase
        .from('menu_items')
        .select('id, price, name')
        .eq('tenant_id', tenantId)
        .in('id', uniq);
    if (error) {
        const e = new Error('menu_items_load_failed');
        e.statusCode = 500;
        e.details = error.message;
        throw e;
    }
    return new Map((data || []).map((m) => [m.id, { price: Number(m.price), name: m.name ?? null }]));
}
// Compute cart summary (items + totals) in a single place
async function getCartSummary(fastify, tenantId, cartId) {
    const supabase = fastify.supabase;
    // Load items joined with current menu item meta (defensive name/price refresh)
    const { data: items, error: itemsErr } = await supabase
        .from('cart_items')
        .select('cart_id, tenant_id, menu_item_id, qty, price, name')
        .eq('tenant_id', tenantId)
        .eq('cart_id', cartId);
    if (itemsErr) {
        fastify.log.error({ err: itemsErr, cartId, tenantId }, 'getCartSummary: load items failed');
        return { items: [], totals: { subtotal: 0, tax: 0, total: 0 } };
    }
    fastify.log.debug({ cartId, tenantId, count: (items ?? []).length }, 'getCartSummary: loaded items');
    // Use tax logic based on inclusion flag
    const taxCfg = await getTenantTaxConfig(fastify, tenantId);
    const breakdown = Array.isArray(taxCfg.breakdown) ? taxCfg.breakdown : undefined;
    const totals = taxCfg.inclusion === 'exclusive'
        ? computeCartTotalsExclusive(items || [], breakdown)
        : computeCartTotalsInclusive(items || [], Number(taxCfg.effective_rate ?? 0) || 0, breakdown);
    return {
        items: (items || []).map((it) => ({
            cart_id: it.cart_id,
            tenant_id: it.tenant_id,
            menu_item_id: it.menu_item_id,
            qty: it.qty,
            price: Number(it.price),
            name: it.name ?? null,
        })),
        totals,
        currency: taxCfg.currency || 'INR',
    };
}
async function reconcileCartStatus(fastify, tenantId, cartId) {
    const supabase = fastify.supabase;
    const { count, error: cntErr } = await supabase
        .from('cart_items')
        .select('menu_item_id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('cart_id', cartId);
    if (cntErr) {
        fastify.log.error({ err: cntErr, cartId, tenantId }, 'reconcileCartStatus: count failed');
        return; // non-fatal
    }
    const hasItems = (Number(count) || 0) > 0;
    if (hasItems) {
        // Ensure it's open when items exist
        const { error: upErr } = await supabase
            .from('carts')
            .update({ status: 'open' })
            .eq('tenant_id', tenantId)
            .eq('id', cartId);
        if (upErr) {
            fastify.log.error({ err: upErr, cartId, tenantId }, 'reconcileCartStatus: update to open failed');
        }
    }
    else {
        // Do NOT set to 'inactive' (DB check constraint disallows it). Leave status as-is for now.
        fastify.log.debug({ cartId, tenantId }, 'reconcileCartStatus: cart empty; leaving status unchanged');
    }
}
// -----------------------------
// Zod schemas
// -----------------------------
const startBody = z.object({
    tableCode: z.string().trim().min(1).optional(),
});
const addItemsBody = z.object({
    cart_id: z.string().uuid(),
    items: z
        .array(z.object({
        menu_item_id: z.string().uuid(),
        qty: z.number().int().min(0),
    }))
        .min(1),
});
// Accept the same bulk shape for update as well (to be backward-compatible with some clients)
const updateItemsBulkBody = addItemsBody;
const updateItemBody = z.object({
    cart_id: z.string().uuid(),
    menu_item_id: z.string().uuid(),
    qty: z.number().int().min(0),
});
const removeItemBody = z.object({
    cart_id: z.string().uuid(),
    menu_item_id: z.string().uuid(),
});
const checkoutBody = z.object({
    cart_id: z.string().uuid(),
    // Optional payment/metadata fields (kept flexible for now)
    payment_intent_id: z.string().trim().optional(),
    notes: z.string().trim().optional(),
});
// Reusable processor to apply items to a cart (insert/update/delete w/ qty=0)
async function applyItemsToCart(fastify, tenantId, cartId, rows, mode = 'set') {
    const supabase = fastify.supabase;
    // verify cart belongs to tenant
    const { data: cart, error: cartErr } = await supabase
        .from('carts')
        .select('id, tenant_id, user_id')
        .eq('tenant_id', tenantId)
        .eq('id', cartId)
        .single();
    if (cartErr || !cart) {
        const e = new Error('cart_not_found');
        e.statusCode = 404;
        throw e;
    }
    // --- Prefetch all menu item metadata in one roundtrip ---
    const ids = Array.from(new Set(rows.map(r => r.menu_item_id)));
    const { data: miList, error: miListErr } = await supabase
        .from('menu_items')
        .select('id, price, name, is_available')
        .eq('tenant_id', tenantId)
        .in('id', ids);
    if (miListErr) {
        const e = new Error('menu_items_load_failed');
        e.statusCode = 500;
        e.details = miListErr.message;
        throw e;
    }
    const miById = new Map((miList || []).map(m => [m.id, m]));
    // Validate inputs & build normalized rows
    const normalized = rows.map(r => {
        const mi = miById.get(r.menu_item_id);
        if (!mi) {
            const e = new Error('invalid_menu_item');
            e.statusCode = 400;
            e.details = `menu_item_id ${r.menu_item_id} not found`;
            throw e;
        }
        if (mi.is_available === false && r.qty > 0) {
            const e = new Error('item_unavailable');
            e.statusCode = 409;
            e.details = `menu_item_id ${r.menu_item_id} unavailable`;
            throw e;
        }
        const numericPrice = Number(mi.price);
        if (!Number.isFinite(numericPrice)) {
            const e = new Error('invalid_menu_item_price');
            e.statusCode = 400;
            e.details = `menu_item_id ${r.menu_item_id} has invalid price`;
            throw e;
        }
        return {
            tenant_id: tenantId,
            cart_id: cartId,
            menu_item_id: r.menu_item_id,
            qty: Number(r.qty) || 0,
            price: numericPrice,
            name: mi.name,
        };
    });
    if (mode === 'set') {
        // Upsert all positive qty lines in one call
        const toUpsert = normalized.filter(n => n.qty > 0);
        if (toUpsert.length > 0) {
            const { error: upErr } = await supabase
                .from('cart_items')
                .upsert(toUpsert, { onConflict: 'cart_id,menu_item_id' });
            if (upErr) {
                const e = new Error('cart_items_upsert_failed');
                e.statusCode = 500;
                e.details = upErr.message;
                throw e;
            }
        }
        // Delete any zero-qty lines in one call
        const zeroIds = normalized.filter(n => n.qty === 0).map(n => n.menu_item_id);
        if (zeroIds.length > 0) {
            const { error: delErr } = await supabase
                .from('cart_items')
                .delete()
                .eq('tenant_id', tenantId)
                .eq('cart_id', cartId)
                .in('menu_item_id', zeroIds);
            if (delErr) {
                const e = new Error('cart_items_delete_failed');
                e.statusCode = 500;
                e.details = delErr.message;
                throw e;
            }
        }
    }
    else {
        // mode === 'increment' — prefer atomic batch RPC (one call), fallback to per-line if unavailable
        const lines = normalized
            .filter(n => n.qty > 0)
            .map(n => ({ menu_item_id: n.menu_item_id, qty: n.qty, price: n.price, name: n.name }));
        if (lines.length > 0) {
            try {
                const { error: rpcBatchErr } = await supabase.rpc('cart_items_increment_batch', {
                    p_tenant_id: tenantId,
                    p_cart_id: cartId,
                    p_lines: lines, // sent as jsonb
                });
                if (rpcBatchErr) {
                    // Fallback: per-line atomic RPC (or two-step if RPC missing)
                    for (const n of normalized) {
                        if (n.qty <= 0)
                            continue;
                        const { error: rpcErr } = await supabase.rpc('cart_items_increment', {
                            p_tenant_id: tenantId,
                            p_cart_id: cartId,
                            p_menu_item_id: n.menu_item_id,
                            p_qty: n.qty,
                            p_price: n.price,
                            p_name: n.name,
                        });
                        if (rpcErr) {
                            const { data: exist, error: existErr } = await supabase
                                .from('cart_items')
                                .select('qty')
                                .eq('tenant_id', tenantId)
                                .eq('cart_id', cartId)
                                .eq('menu_item_id', n.menu_item_id)
                                .single();
                            if (!existErr && exist) {
                                const newQty = Number(exist.qty) + Number(n.qty);
                                const { error: upErr } = await supabase
                                    .from('cart_items')
                                    .update({ qty: newQty, price: n.price, name: n.name })
                                    .eq('tenant_id', tenantId)
                                    .eq('cart_id', cartId)
                                    .eq('menu_item_id', n.menu_item_id);
                                if (upErr) {
                                    const e = new Error('cart_item_increment_failed');
                                    e.statusCode = 500;
                                    e.details = upErr.message;
                                    throw e;
                                }
                            }
                            else {
                                const { error: insErr } = await supabase.from('cart_items').insert(n);
                                if (insErr) {
                                    const e = new Error('cart_item_insert_failed');
                                    e.statusCode = 500;
                                    e.details = insErr.message;
                                    throw e;
                                }
                            }
                        }
                    }
                }
            }
            catch (err) {
                const e = new Error('cart_items_increment_batch_failed');
                e.statusCode = 500;
                e.details = err?.message || String(err);
                throw e;
            }
        }
    }
    // After applying all mutations, reconcile cart status (open/inactive)
    await reconcileCartStatus(fastify, tenantId, cartId);
}
// -----------------------------
// Routes
// -----------------------------
export default async function cartRoutes(fastify) {
    // POST /api/cart/start  (dine-in via tableCode or takeaway)
    fastify.post('/api/cart/start', { preHandler: [fastify.requireTenant] }, async (req, reply) => {
        const tenantId = tenantFromReq(req);
        const userId = userFromReq(req);
        const body = startBody.parse(req.body ?? {});
        const start = Date.now();
        const reqId = randomUUID();
        let httpStatus = 200;
        const mode = body.tableCode ? 'dinein' : 'takeaway';
        try {
            const svc = createCartService(fastify.supabase, tenantId, userId);
            const cart = await svc.ensureCart(mode, body.tableCode ?? null);
            const payload = { cart_id: cart.id, mode: cart.mode, table_code: cart.table_code ?? null };
            fastify.log.info(logCtx({ reqId, route: 'POST /api/cart/start', tenantId, userId, cart_id: cart.id, mode }, start), 'cart_start_done');
            return reply.send(payload);
        }
        catch (err) {
            httpStatus = 500;
            fastify.log.error({ reqId, err }, 'cart_start_failed');
            fastify.log.info(logCtx({ reqId, route: 'POST /api/cart/start', tenantId, userId }, start), 'cart_start_done');
            return reply.status(httpStatus).send({ error: 'cart_start_failed', details: err?.message });
        }
    });
    // GET /api/cart/:cartId
    fastify.get('/api/cart/:cartId', { preHandler: [fastify.requireTenant] }, async (req, reply) => {
        const tenantId = tenantFromReq(req);
        const userId = userFromReq(req);
        const cartId = req.params.cartId;
        const start = Date.now();
        const reqId = randomUUID();
        let httpStatus = 200;
        try {
            const svc = createCartService(fastify.supabase, tenantId, userId);
            let cart = null;
            try {
                cart = await svc.getCartById(cartId);
            }
            catch (e) {
                const code = e?.statusCode ?? e?.code;
                const msg = String(e?.message || '').toLowerCase();
                if (code === 404 || msg.includes('not found') || msg.includes('cart_not_found')) {
                    httpStatus = 404;
                    fastify.log.warn(logCtx({ reqId, route: 'GET /api/cart/:cartId', tenantId, userId, cart_id: cartId }, start), 'cart_not_found');
                    return reply.status(httpStatus).send({ error: 'cart_not_found' });
                }
                throw e; // rethrow unknown errors
            }
            if (!cart || cart.user_id !== userId) {
                httpStatus = 404;
                fastify.log.warn(logCtx({ reqId, route: 'GET /api/cart/:cartId', tenantId, userId, cart_id: cartId }, start), 'cart_not_found');
                return reply.status(httpStatus).send({ error: 'cart_not_found' });
            }
            const summary = await svc.summarize(cart);
            fastify.log.info(logCtx({ reqId, route: 'GET /api/cart/:cartId', tenantId, userId, cart_id: cartId, item_count: (summary?.items?.length || 0) }, start), 'cart_get_done');
            return reply.send(summary);
        }
        catch (err) {
            const code = err?.statusCode ?? err?.code ?? 500;
            if (code === 404) {
                httpStatus = 404;
                return reply.status(404).send({ error: 'cart_not_found' });
            }
            httpStatus = 500;
            fastify.log.error({ reqId, err }, 'cart_get_failed');
            fastify.log.info(logCtx({ reqId, route: 'GET /api/cart/:cartId', tenantId, userId, cart_id: cartId }, start), 'cart_get_done');
            return reply.status(httpStatus).send({ error: 'cart_get_failed', details: err?.message });
        }
    });
    // POST /api/cart/items  (bulk add or set qty when item exists)
    fastify.post('/api/cart/items', { preHandler: [fastify.requireTenant] }, async (req, reply) => {
        const tenantId = tenantFromReq(req);
        const userId = userFromReq(req);
        const body = addItemsBody.parse(req.body ?? {});
        const start = Date.now();
        const reqId = randomUUID();
        let httpStatus = 200;
        try {
            const svc = createCartService(fastify.supabase, tenantId, userId);
            const cart = await svc.getCartById(body.cart_id);
            if (!cart || cart.user_id !== userId) {
                httpStatus = 404;
                fastify.log.warn(logCtx({ reqId, route: 'POST /api/cart/items', tenantId, userId, cart_id: body.cart_id }, start), 'cart_not_found');
                return reply.status(httpStatus).send({ error: 'cart_not_found' });
            }
            // Fetch price/name snapshots for the items being added (ensures correct inserts)
            const meta = await loadMenuMeta(fastify, tenantId, body.items.map(i => i.menu_item_id));
            const rows = body.items.map(i => {
                const m = meta.get(i.menu_item_id);
                if (!m) {
                    const e = new Error(`invalid_menu_item: ${i.menu_item_id}`);
                    e.statusCode = 400;
                    throw e;
                }
                return { menu_item_id: i.menu_item_id, qty: i.qty, price: m.price, name: m.name };
            });
            const summary = await svc.incrementItems(body.cart_id, rows);
            fastify.log.info(logCtx({ reqId, route: 'POST /api/cart/items', tenantId, userId, cart_id: body.cart_id, added: body.items.length }, start), 'cart_items_add_done');
            return reply.send(summary);
        }
        catch (e) {
            const code = e?.statusCode ?? 500;
            httpStatus = code;
            fastify.log.error({ reqId, err: e }, 'cart_items_apply_failed');
            fastify.log.info(logCtx({ reqId, route: 'POST /api/cart/items', tenantId, userId, cart_id: body.cart_id }, start), 'cart_items_add_done');
            return reply.status(code).send({ error: e?.message || 'cart_items_apply_failed', details: e?.details });
        }
    });
    // POST /api/cart/:cartId/items/increment  (increment quantities; cart id from URL)
    fastify.post('/api/cart/:cartId/items/increment', { preHandler: [fastify.requireTenant] }, async (req, reply) => {
        const tenantId = tenantFromReq(req);
        const userId = userFromReq(req);
        const cartId = req.params.cartId;
        const start = Date.now();
        const reqId = randomUUID();
        let httpStatus = 200;
        // Body: array of { menu_item_id, qty }
        const bodyArr = req.body ?? [];
        const itemsSchema = z
            .array(z.object({ menu_item_id: z.string().uuid(), qty: z.number().int().min(0) }))
            .min(1);
        let rowsIn = [];
        try {
            rowsIn = itemsSchema.parse(bodyArr);
        }
        catch (e) {
            return reply.status(400).send({ error: 'invalid_payload', details: e?.message });
        }
        try {
            const svc = createCartService(fastify.supabase, tenantId, userId);
            const cart = await svc.getCartById(cartId);
            if (!cart || cart.user_id !== userId) {
                httpStatus = 404;
                fastify.log.warn(logCtx({ reqId, route: 'POST /api/cart/:cartId/items/increment', tenantId, userId, cart_id: cartId }, start), 'cart_not_found');
                return reply.status(httpStatus).send({ error: 'cart_not_found' });
            }
            // Fetch price/name snapshots for the items being added (ensures correct inserts)
            const meta = await loadMenuMeta(fastify, tenantId, rowsIn.map(i => i.menu_item_id));
            const rows = rowsIn.map(i => {
                const m = meta.get(i.menu_item_id);
                if (!m) {
                    const e = new Error(`invalid_menu_item: ${i.menu_item_id}`);
                    e.statusCode = 400;
                    throw e;
                }
                return { menu_item_id: i.menu_item_id, qty: i.qty, price: m.price, name: m.name };
            });
            const summary = await svc.incrementItems(cartId, rows);
            fastify.log.info(logCtx({ reqId, route: 'POST /api/cart/:cartId/items/increment', tenantId, userId, cart_id: cartId, added: rows.length }, start), 'cart_items_increment_done');
            return reply.send(summary);
        }
        catch (e) {
            const code = e?.statusCode ?? 500;
            httpStatus = code;
            fastify.log.error({ reqId, err: e }, 'cart_items_increment_failed');
            fastify.log.info(logCtx({ reqId, route: 'POST /api/cart/:cartId/items/increment', tenantId, userId, cart_id: cartId }, start), 'cart_items_increment_done');
            return reply.status(code).send({ error: e?.message || 'cart_items_increment_failed', details: e?.details });
        }
    });
    // POST /api/cart/items/update (set qty) — explicit single-row update
    fastify.post('/api/cart/items/update', { preHandler: [fastify.requireTenant] }, async (req, reply) => {
        const tenantId = tenantFromReq(req);
        const userId = userFromReq(req);
        let cartId;
        let rows;
        const raw = req.body ?? {};
        try {
            const single = updateItemBody.parse(raw);
            cartId = single.cart_id;
            rows = [{ menu_item_id: single.menu_item_id, qty: single.qty }];
        }
        catch {
            const bulk = updateItemsBulkBody.parse(raw);
            cartId = bulk.cart_id;
            rows = bulk.items;
        }
        const start = Date.now();
        const reqId = randomUUID();
        let httpStatus = 200;
        try {
            const svc = createCartService(fastify.supabase, tenantId, userId);
            const cart = await svc.getCartById(cartId);
            if (!cart || cart.user_id !== userId) {
                httpStatus = 404;
                fastify.log.warn(logCtx({ reqId, route: 'POST /api/cart/items/update', tenantId, userId, cart_id: cartId }, start), 'cart_not_found');
                return reply.status(httpStatus).send({ error: 'cart_not_found' });
            }
            // Only fetch meta for lines with qty > 0 (new or overwrite)
            const positive = rows.filter(r => r.qty > 0);
            const meta = await loadMenuMeta(fastify, tenantId, positive.map(i => i.menu_item_id));
            const upserts = rows.map(r => {
                const m = meta.get(r.menu_item_id);
                return { menu_item_id: r.menu_item_id, qty: r.qty, price: m?.price, name: m?.name };
            });
            const summary = await svc.setItems(cartId, upserts);
            fastify.log.info(logCtx({ reqId, route: 'POST /api/cart/items/update', tenantId, userId, cart_id: cartId }, start), 'cart_items_update_done');
            return reply.send(summary);
        }
        catch (e) {
            const code = e?.statusCode ?? 500;
            httpStatus = code;
            fastify.log.error({ reqId, err: e }, 'cart_items_update_failed');
            fastify.log.info(logCtx({ reqId, route: 'POST /api/cart/items/update', tenantId, userId, cart_id: cartId }, start), 'cart_items_update_done');
            return reply.status(code).send({ error: e?.message || 'cart_items_update_failed', details: e?.details });
        }
    });
    // POST /api/cart/items/remove (qty=0)
    fastify.post('/api/cart/items/remove', { preHandler: [fastify.requireTenant] }, async (req, reply) => {
        const tenantId = tenantFromReq(req);
        const userId = userFromReq(req);
        const body = removeItemBody.parse(req.body ?? {});
        const start = Date.now();
        const reqId = randomUUID();
        let httpStatus = 200;
        try {
            const svc = createCartService(fastify.supabase, tenantId, userId);
            const cart = await svc.getCartById(body.cart_id);
            if (!cart || cart.user_id !== userId) {
                httpStatus = 404;
                fastify.log.warn(logCtx({ reqId, route: 'POST /api/cart/items/remove', tenantId, userId, cart_id: body.cart_id }, start), 'cart_not_found');
                return reply.status(httpStatus).send({ error: 'cart_not_found' });
            }
            const summary = await svc.removeItems(body.cart_id, [body.menu_item_id]);
            fastify.log.info(logCtx({ reqId, route: 'POST /api/cart/items/remove', tenantId, userId, cart_id: body.cart_id, menu_item_id: body.menu_item_id }, start), 'cart_item_remove_done');
            return reply.send(summary);
        }
        catch (e) {
            const code = e?.statusCode ?? 500;
            httpStatus = code;
            fastify.log.error({ reqId, err: e }, 'cart_item_remove_failed');
            fastify.log.info(logCtx({ reqId, route: 'POST /api/cart/items/remove', tenantId, userId, cart_id: body.cart_id }, start), 'cart_item_remove_done');
            return reply.status(code).send({ error: e?.message || 'cart_item_remove_failed', details: e?.details });
        }
    });
    // POST /api/cart/checkout — create order from cart and mark cart completed
    fastify.post('/api/cart/checkout', { preHandler: [fastify.requireTenant] }, async (req, reply) => {
        const tenantId = tenantFromReq(req);
        const userId = userFromReq(req);
        const body = checkoutBody.parse(req.body ?? {});
        const supabase = fastify.supabase;
        const start = Date.now();
        const reqId = randomUUID();
        let httpStatus = 200;
        // Call transactional RPC v2 so checkout is atomic
        const { data, error } = await supabase.rpc('checkout_cart_v2', {
            p_tenant_id: tenantId,
            p_user_id: userId,
            p_cart_id: body.cart_id,
            p_payment_intent_id: body.payment_intent_id ?? null,
            p_notes: body.notes ?? null,
        });
        if (error) {
            const msg = String(error.message || '').toLowerCase();
            if (msg.includes('cart_not_found_or_not_open')) {
                httpStatus = 409;
                return reply.status(httpStatus).send({ error: 'cart_not_open' });
            }
            if (msg.includes('cart_empty')) {
                httpStatus = 400;
                return reply.status(httpStatus).send({ error: 'cart_empty' });
            }
            httpStatus = 500;
            return reply.status(httpStatus).send({ error: 'checkout_failed', details: error.message });
        }
        const payload = data || {};
        const taxCfg = await getTenantTaxConfig(fastify, tenantId);
        const pricingMode = taxCfg.inclusion === 'exclusive' ? 'tax_exclusive' : 'tax_inclusive';
        const orderId = payload.order_id;
        // Use values directly from RPC payload
        const subtotal = Number(payload.subtotal) || 0;
        const tax = Number(payload.tax_amount) || 0;
        const total = Number(payload.total_amount) || 0;
        fastify.log.info(logCtx({ reqId, route: 'POST /api/cart/checkout', tenantId, userId, cart_id: body.cart_id, order_id: orderId, total }, start), 'cart_checkout_done');
        return reply.send({
            order_id: orderId,
            cart_id: body.cart_id,
            totals: {
                subtotal,
                tax,
                total,
                pricing_mode: pricingMode,
                tax_breakdown: [
                    { name: 'Tax', rate: tax > 0 && subtotal > 0 ? +(tax / subtotal).toFixed(4) : 0, amount: tax }
                ]
            },
            currency: payload.currency || 'INR',
            status: 'created',
        });
    });
}
