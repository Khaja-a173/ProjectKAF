

// Live events (tenant-scoped) via Redis pub/sub
type TenantEvent =
  | { type: 'cart.updated'; tenant_id: string; cart_id: string; totals: any; items_count: number; ts: string; version: number }
  | { type: 'order.created'; tenant_id: string; order_id: string; status: 'placed'; mode?: string | null; table_code?: string | null; currency?: string; totals?: any; items?: Array<{ id: string; name: string | null; qty: number; price: number }>; eta_minutes?: number | null; ts: string; version: number };

function eventChannel(fastify: FastifyInstance, tenantId: string) {
  const rk = (fastify as any).rkey as undefined | ((...parts: string[]) => string);
  return rk ? rk('orders', 'events', tenantId) : `orders:events:${tenantId}`;
}

async function publishEvent(fastify: FastifyInstance, tenantId: string, ev: TenantEvent) {
  const redis = (fastify as any).redis as import('ioredis').Redis | undefined;
  if (!redis) return;
  const channel = eventChannel(fastify, tenantId);
  try {
    await redis.publish(channel, JSON.stringify(ev));
  } catch (e) {
    fastify.log.warn({ err: (e as any)?.message, channel, ev_type: (ev as any)?.type }, 'tenant_event_publish_failed');
  }
}
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { createCartService } from '../services/cartService';
import { randomUUID } from 'crypto';

// Unified logger context helper (mirrors checkout.ts)
function logCtx(base: Record<string, any>, start: number) {
  return { ...base, ms: Date.now() - start };
}

// Lightweight in-memory counters to observe minimal vs full responses
const cartOpMetrics = {
  incr_full: 0,
  incr_min: 0,
  add_full: 0,
  add_min: 0,
  upd_full: 0,
  upd_min: 0,
  rem_full: 0,
  rem_min: 0,
};

// -----------------------------
// Helpers (local, file-scoped)
// -----------------------------
async function getTenantTaxConfig(fastify: FastifyInstance, tenantId: string) {
  const { data, error } = await fastify.supabase
    .from('v_tenant_tax_effective')
    .select('effective_rate, breakdown, mode, currency, inclusion')
    .eq('tenant_id', tenantId)
    .limit(1)
    .single();
  if (error || !data) {
    return { effective_rate: 0.08, breakdown: [{ name: 'Tax', rate: 0.08 }], mode: 'single', currency: 'INR', inclusion: 'inclusive' } as any;
  }
  // Normalize rates: accept either fraction (0.10) or percent (10)
  const normalizeRate = (val: any) => {
    const n = Number(val);
    if (!Number.isFinite(n) || n <= 0) return 0;
    const r = n > 1 ? n / 100 : n; // treat >1 as percent
    return +r.toFixed(6);
  };

  const rawBreakdown = Array.isArray((data as any).breakdown) ? (data as any).breakdown : null;
  let breakdown: Array<{ name: string; rate: number }> = [];
  let effective = normalizeRate((data as any).effective_rate ?? 0);

  if (rawBreakdown && rawBreakdown.length) {
    breakdown = rawBreakdown
      .map((c: any) => ({ name: String(c?.name ?? 'Tax'), rate: normalizeRate((c as any)?.rate) }))
      .filter((c: any) => c.rate > 0);
    const sum = breakdown.reduce((s, c) => s + c.rate, 0);
    effective = +sum.toFixed(6);
  } else {
    breakdown = [{ name: 'Tax', rate: effective }];
  }

  const inclusion = (data as any).inclusion === 'exclusive' ? 'exclusive' : 'inclusive';
  const currency = (data as any).currency || 'INR';
  return { effective_rate: effective, breakdown, mode: (data as any).mode, currency, inclusion } as any;
}

function splitInclusive(total: number, taxRate: number) {
  const subtotal = total / (1 + taxRate);
  const tax = total - subtotal;
  return { subtotal, tax };
}

// Compute cart totals using inclusive tax logic (with composite breakdown support)
function computeCartTotalsInclusive(
  items: any[],
  taxRate: number,
  breakdown?: Array<{ name: string; rate: number }>
) {
  const total = items.reduce((sum, it) => {
    const line = Number(it.price) * Number(it.qty || 0);
    return sum + (Number.isFinite(line) ? line : 0);
  }, 0);

  const { subtotal, tax } = splitInclusive(total, taxRate);

  let tax_breakdown: Array<{ name: string; rate: number; amount: number }> = [];
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
  } else {
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

function computeCartTotalsExclusive(
  items: any[],
  breakdown?: Array<{ name: string; rate: number }>
) {
  const subtotal = items.reduce((sum, it) => {
    const line = Number(it.price) * Number(it.qty || 0);
    return sum + (Number.isFinite(line) ? line : 0);
  }, 0);

  const comps = Array.isArray(breakdown) ? breakdown.filter(c => Number(c.rate) > 0) : [];
  const effRate = comps.length > 0
    ? comps.reduce((s, c) => s + Number(c.rate || 0), 0)
    : 0;

  const tax = subtotal * effRate;

  let tax_breakdown: Array<{ name: string; rate: number; amount: number }> = [];
  if (comps.length > 0) {
    const sumRates = comps.reduce((s, c) => s + Number(c.rate || 0), 0) || 1;
    let allocated = 0;
    comps.forEach((c, idx) => {
      const isLast = idx === comps.length - 1;
      const amt = isLast ? (tax - allocated) : +(tax * (Number(c.rate) / sumRates)).toFixed(6);
      allocated = +(allocated + amt).toFixed(6);
      tax_breakdown.push({ name: c.name, rate: Number(c.rate), amount: +amt.toFixed(6) });
    });
  } else {
    tax_breakdown = [{ name: 'Tax', rate: effRate, amount: +tax.toFixed(6) }];
  }

  return {
    subtotal: +subtotal.toFixed(6),
    tax: +tax.toFixed(6),
    total: +(subtotal + tax).toFixed(6),
    pricing_mode: 'tax_exclusive' as const,
    tax_breakdown,
  };
}


// Prefer plugin-provided context values for tenant and user
function tenantFromReq(req: FastifyRequest): string {
  const ctxTid = (req as any).tenantId as string | undefined;
  if (ctxTid && typeof ctxTid === 'string') return ctxTid;
  return requireTenantId(req.headers);
}

function userFromReq(req: FastifyRequest): string {
  // Prefer value bound by preHandler in server/src/index.ts
  const ctxBound = (req as any)?.userId as string | undefined;
  if (ctxBound && typeof ctxBound === 'string' && ctxBound.trim()) return ctxBound.trim();

  // Then prefer auth plugin (if present)
  const ctxUid = (req as any)?.auth?.userId as string | undefined;
  if (ctxUid && typeof ctxUid === 'string' && ctxUid.trim()) return ctxUid.trim();

  // Then fall back to header directly
  const hdr = (req.headers['x-user-id'] as string | undefined)
    || ((req.headers as any)['X-User-Id'] as string | undefined)
    || ((req.headers as any)['X-USER-ID'] as string | undefined)
    || undefined;
  if (hdr && typeof hdr === 'string' && hdr.trim()) return hdr.trim();

  // Finally, enforce requirement
  return requireUserId(req.headers);
}

function requireTenantId(headers: FastifyRequest['headers']): string {
  const h = headers || {};
  const id =
    (h['x-tenant-id'] as string) ||
    (h['X-Tenant-Id'] as unknown as string) ||
    (h['X-TENANT-ID'] as unknown as string);
  if (!id || typeof id !== 'string' || id.length < 10) {
    const err = new Error('X-Tenant-Id header required');
    // @ts-ignore
    err.statusCode = 400;
    throw err;
  }
  return id;
}

function requireUserId(headers: FastifyRequest['headers']): string {
  const h = headers || {};
  const id =
    (h['x-user-id'] as string) ||
    (h['X-User-Id'] as unknown as string) ||
    (h['X-USER-ID'] as unknown as string);
  if (!id || typeof id !== 'string' || id.length < 6) {
    const err = new Error('X-User-Id header required');
    // @ts-ignore
    err.statusCode = 401;
    throw err;
  }
  return id;
}

// Helper to load menu item price/name for a set of IDs (for cart ops)
async function loadMenuMeta(fastify: FastifyInstance, tenantId: string, ids: string[]) {
  const uniq = Array.from(new Set(ids));
  if (uniq.length === 0) return new Map<string, { price: number; name: string | null }>();
  const { data, error } = await fastify.supabase
    .from('menu_items')
    .select('id, price, name')
    .eq('tenant_id', tenantId)
    .in('id', uniq);
  if (error) {
    const e: any = new Error('menu_items_load_failed');
    e.statusCode = 500;
    e.details = error.message;
    throw e;
  }
  return new Map<string, { price: number; name: string | null }>((data || []).map((m: any) => [m.id, { price: Number(m.price), name: m.name ?? null }]));
}

// Compute cart summary (items + totals) in a single place
async function getCartSummary(
  fastify: FastifyInstance,
  tenantId: string,
  cartId: string
) {
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
  const breakdown = Array.isArray((taxCfg as any).breakdown) ? (taxCfg as any).breakdown : undefined;
  const totals = (taxCfg as any).inclusion === 'exclusive'
    ? computeCartTotalsExclusive(items || [], breakdown as any)
    : computeCartTotalsInclusive(items || [], Number(taxCfg.effective_rate ?? 0) || 0, breakdown as any);

  return {
    items: (items || []).map((it: any) => ({
      cart_id: it.cart_id,
      tenant_id: it.tenant_id,
      menu_item_id: it.menu_item_id,
      qty: it.qty,
      price: Number(it.price),
      name: it.name ?? null,
    })),
    totals,
    currency: (taxCfg as any).currency || 'INR',
  };
}

async function reconcileCartStatus(
  fastify: FastifyInstance,
  tenantId: string,
  cartId: string
) {
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
  } else {
    // Auto-close cart when empty
    const { error: upErr } = await supabase
      .from('carts')
      .update({ status: 'inactive' })
      .eq('tenant_id', tenantId)
      .eq('id', cartId);

    if (upErr) {
      fastify.log.error({ err: upErr, cartId, tenantId }, 'reconcileCartStatus: update to inactive failed');
    } else {
      fastify.log.info({ cartId, tenantId }, 'reconcileCartStatus: cart auto-closed because empty');
    }
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
    .array(
      z.object({
        menu_item_id: z.string().uuid(),
        qty: z.number().int().min(0),
      })
    )
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
  customer_name: z.string().trim().min(1).optional(),
  table_code: z.string().trim().min(1).optional(),
});

// Reusable processor to apply items to a cart (insert/update/delete w/ qty=0)
async function applyItemsToCart(
  fastify: FastifyInstance,
  tenantId: string,
  cartId: string,
  rows: Array<{ menu_item_id: string; qty: number }>,
  mode: 'set' | 'increment' = 'set'
) {
  const supabase = fastify.supabase;
  // verify cart belongs to tenant
  const { data: cart, error: cartErr } = await supabase
    .from('carts')
    .select('id, tenant_id, user_id')
    .eq('tenant_id', tenantId)
    .eq('id', cartId)
    .single();
  if (cartErr || !cart) {
    const e: any = new Error('cart_not_found');
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
    const e: any = new Error('menu_items_load_failed');
    e.statusCode = 500;
    e.details = miListErr.message;
    throw e;
  }
  const miById = new Map<string, any>((miList || []).map(m => [m.id, m]));

  // Validate inputs & build normalized rows
  const normalized = rows.map(r => {
    const mi = miById.get(r.menu_item_id);
    if (!mi) {
      const e: any = new Error('invalid_menu_item');
      e.statusCode = 400;
      e.details = `menu_item_id ${r.menu_item_id} not found`;
      throw e;
    }
    if (mi.is_available === false && r.qty > 0) {
      const e: any = new Error('item_unavailable');
      e.statusCode = 409;
      e.details = `menu_item_id ${r.menu_item_id} unavailable`;
      throw e;
    }
    const numericPrice = Number(mi.price);
    if (!Number.isFinite(numericPrice)) {
      const e: any = new Error('invalid_menu_item_price');
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
      name: mi.name as string | null,
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
        const e: any = new Error('cart_items_upsert_failed');
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
        const e: any = new Error('cart_items_delete_failed');
        e.statusCode = 500;
        e.details = delErr.message;
        throw e;
      }
    }
  } else {
    // mode === 'increment' — prefer atomic batch RPC (one call), fallback to per-line if unavailable
    const lines = normalized
      .filter(n => n.qty > 0)
      .map(n => ({ menu_item_id: n.menu_item_id, qty: n.qty, price: n.price, name: n.name }));

    if (lines.length > 0) {
      try {
        const { error: rpcBatchErr } = await supabase.rpc('cart_items_increment_batch', {
          p_tenant_id: tenantId,
          p_cart_id: cartId,
          p_lines: lines as any, // sent as jsonb
        });
        if (rpcBatchErr) {
          // Fallback: per-line atomic RPC (or two-step if RPC missing)
          for (const n of normalized) {
            if (n.qty <= 0) continue;
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
                  const e: any = new Error('cart_item_increment_failed');
                  e.statusCode = 500;
                  e.details = upErr.message;
                  throw e;
                }
              } else {
                const { error: insErr } = await supabase.from('cart_items').insert(n);
                if (insErr) {
                  const e: any = new Error('cart_item_insert_failed');
                  e.statusCode = 500;
                  e.details = insErr.message;
                  throw e;
                }
              }
            }
          }
        }
      } catch (err: any) {
        const e: any = new Error('cart_items_increment_batch_failed');
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
export default async function cartRoutes(fastify: FastifyInstance) {
  // --- Redis helpers for cart session cache (server-side only; no HTTP cache) ---
  const redis = (fastify as any).redis as import('ioredis').Redis | undefined;
  const rkey = (fastify as any).rkey as undefined | ((...parts: string[]) => string);
  const cartKey = (tenantId: string, cartId: string) => (rkey ? rkey('cart', tenantId, cartId, 'v1') : undefined);
  const CART_TTL_SEC = 3600; // 1 hour; adjust if needed

  const readCartCache = async (tenantId: string, cartId: string) => {
    if (!redis) return undefined;
    const key = cartKey(tenantId, cartId);
    if (!key) return undefined;
    try {
      const s = await redis.get(key);
      if (!s) return undefined;
      return JSON.parse(s);
    } catch (e) {
      fastify.log.warn({ err: (e as any)?.message, key }, 'cart_cache_read_failed');
      return undefined;
    }
  };

  const writeCartCache = async (tenantId: string, cartId: string, summary: any) => {
    if (!redis) return;
    const key = cartKey(tenantId, cartId);
    if (!key) return;
    try {
      await redis.set(key, JSON.stringify(summary), 'EX', CART_TTL_SEC);
    } catch (e) {
      fastify.log.warn({ err: (e as any)?.message, key }, 'cart_cache_set_failed');
    }
  };

  const invalidateCartCache = async (tenantId: string, cartId: string) => {
    if (!redis) return;
    const key = cartKey(tenantId, cartId);
    if (!key) return;
    try { await redis.del(key); } catch (e) {
      fastify.log.warn({ err: (e as any)?.message, key }, 'cart_cache_del_failed');
    }
  };

  // Convenience: publish cart.updated event after cart changes
  const publishCartUpdated = async (tenantId: string, cartId: string) => {
    try {
      const summary = await getCartSummary(fastify, tenantId, cartId);
      await publishEvent(fastify, tenantId, {
        type: 'cart.updated',
        tenant_id: tenantId,
        cart_id: cartId,
        totals: summary.totals,
        items_count: summary.items?.length ?? 0,
        ts: new Date().toISOString(),
        version: 1,
      });
    } catch (e) {
      fastify.log.warn({ err: (e as any)?.message, tenantId, cartId }, 'publish_cart_updated_failed');
    }
  };
  // POST /api/cart/start  (dine-in via tableCode or takeaway)
  fastify.post('/api/cart/start', { preHandler: [fastify.requireTenant] }, async (req, reply) => {
    const tenantId = tenantFromReq(req);
    const userId = userFromReq(req);
    const body = startBody.parse((req as any).body ?? {});
    const start = Date.now();
    const reqId = randomUUID();
    let httpStatus = 200;

    const mode = body.tableCode ? 'dinein' : 'takeaway';
    try {
      const svc = createCartService(fastify.supabase, tenantId, userId);
      const cart = await svc.ensureCart(mode as any, body.tableCode ?? null);
      const payload = { cart_id: cart.id, mode: cart.mode, table_code: cart.table_code ?? null };
      fastify.log.info(
        logCtx({ reqId, route: 'POST /api/cart/start', tenantId, userId, cart_id: cart.id, mode }, start),
        'cart_start_done'
      );
      return reply.send(payload);
    } catch (err: any) {
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
    const cartId = (req.params as any).cartId as string;
    const start = Date.now();
    const reqId = randomUUID();
    let httpStatus = 200;

    try {
      const svc = createCartService(fastify.supabase, tenantId, userId);
      let cart: any = null;
      try {
        cart = await svc.getCartById(cartId);
      } catch (e: any) {
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

      // Try server-side cart cache (post-ownership check to avoid leakage across users)
      try {
        const cached = await readCartCache(tenantId, cartId);
        if (cached) {
          reply.header('X-Cache', 'HIT');
          fastify.log.debug({ reqId, tenantId, cartId }, 'cart_cache_hit');
          return reply.send(cached);
        }
      } catch {}

      const summary = await svc.summarize(cart);
      // Warm the server-side cache
      await writeCartCache(tenantId, cartId, summary);
      reply.header('X-Cache', 'MISS');
      fastify.log.info(
        logCtx({ reqId, route: 'GET /api/cart/:cartId', tenantId, userId, cart_id: cartId, item_count: (summary?.items?.length || 0) }, start),
        'cart_get_done'
      );
      return reply.send(summary);
    } catch (err: any) {
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
    const body = addItemsBody.parse((req as any).body ?? {});
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
          const e: any = new Error(`invalid_menu_item: ${i.menu_item_id}`);
          e.statusCode = 400; throw e;
        }
        return { menu_item_id: i.menu_item_id, qty: i.qty, price: m.price, name: m.name };
      });

      const prefer = String((req.headers['prefer'] || '')).toLowerCase();
      if (prefer.includes('return=minimal')) {
        await applyItemsToCart(fastify, tenantId, body.cart_id, rows as any, 'increment');
        await invalidateCartCache(tenantId, body.cart_id);
        await publishCartUpdated(tenantId, body.cart_id);
        cartOpMetrics.add_min++;
        fastify.log.info(
          logCtx(
            {
              reqId,
              route: 'POST /api/cart/items',
              tenantId,
              userId,
              cart_id: body.cart_id,
              added: body.items.length,
              minimal: true,
              metrics: { add_min: cartOpMetrics.add_min, add_full: cartOpMetrics.add_full }
            },
            start
          ),
          'cart_items_add_done'
        );
        return reply.status(204).send();
      } else {
        const summary = await svc.incrementItems(body.cart_id, rows as any);
        await writeCartCache(tenantId, body.cart_id, summary);
        await publishCartUpdated(tenantId, body.cart_id);
        cartOpMetrics.add_full++;
        fastify.log.info(
          logCtx(
            {
              reqId,
              route: 'POST /api/cart/items',
              tenantId,
              userId,
              cart_id: body.cart_id,
              added: body.items.length,
              metrics: { add_min: cartOpMetrics.add_min, add_full: cartOpMetrics.add_full }
            },
            start
          ),
          'cart_items_add_done'
        );
        return reply.send(summary);
      }
    } catch (e: any) {
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
    const cartId = (req.params as any).cartId as string;
    const start = Date.now();
    const reqId = randomUUID();
    let httpStatus = 200;

    // Body: array of { menu_item_id, qty }
    const bodyArr = (req as any).body ?? [];
    const itemsSchema = z
      .array(z.object({ menu_item_id: z.string().uuid(), qty: z.number().int().min(0) }))
      .min(1);

    let rowsIn: Array<{ menu_item_id: string; qty: number }> = [];
    try {
      rowsIn = itemsSchema.parse(bodyArr);
    } catch (e: any) {
      return reply.status(400).send({ error: 'invalid_payload', details: e?.message });
    }

    // Ignore zero/negative deltas (client may coalesce); if nothing positive, no-op 204
    const positives = rowsIn.filter(r => Number(r.qty) > 0);
    if (positives.length === 0) {
      const reqId = randomUUID();
      fastify.log.info(
        logCtx({ route: 'POST /api/cart/:cartId/items/increment', tenantId, userId, cart_id: cartId, added: 0, reason: 'no_positive_deltas' }, Date.now()),
        'cart_items_increment_nop'
      );
      return reply.status(204).send();
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
      const meta = await loadMenuMeta(fastify, tenantId, positives.map(i => i.menu_item_id));
      const rows = positives.map(i => {
        const m = meta.get(i.menu_item_id);
        if (!m) {
          const e: any = new Error(`invalid_menu_item: ${i.menu_item_id}`);
          e.statusCode = 400; throw e;
        }
        return { menu_item_id: i.menu_item_id, qty: i.qty, price: m.price, name: m.name };
      });

      const prefer = String((req.headers['prefer'] || '')).toLowerCase();
      if (prefer.includes('return=minimal')) {
        // Apply without building a summary (fast path)
        await applyItemsToCart(fastify, tenantId, cartId, rows as any, 'increment');
        await invalidateCartCache(tenantId, cartId);
        await publishCartUpdated(tenantId, cartId);
        cartOpMetrics.incr_min++;
        fastify.log.info(
          logCtx(
            {
              reqId,
              route: 'POST /api/cart/:cartId/items/increment',
              tenantId,
              userId,
              cart_id: cartId,
              added: rows.length,
              minimal: true,
              metrics: { incr_min: cartOpMetrics.incr_min, incr_full: cartOpMetrics.incr_full }
            },
            start
          ),
          'cart_items_increment_done'
        );
        return reply.status(204).send();
      } else {
        const summary = await svc.incrementItems(cartId, rows as any);
        await writeCartCache(tenantId, cartId, summary);
        await publishCartUpdated(tenantId, cartId);
        cartOpMetrics.incr_full++;
        fastify.log.info(
          logCtx(
            {
              reqId,
              route: 'POST /api/cart/:cartId/items/increment',
              tenantId,
              userId,
              cart_id: cartId,
              added: rows.length,
              metrics: { incr_min: cartOpMetrics.incr_min, incr_full: cartOpMetrics.incr_full }
            },
            start
          ),
          'cart_items_increment_done'
        );
        return reply.send(summary);
      }
    } catch (e: any) {
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

    let cartId: string;
    let rows: Array<{ menu_item_id: string; qty: number }>;
    const raw = (req as any).body ?? {};
    try {
      const single = updateItemBody.parse(raw);
      cartId = single.cart_id; rows = [{ menu_item_id: single.menu_item_id, qty: single.qty }];
    } catch {
      const bulk = updateItemsBulkBody.parse(raw);
      cartId = bulk.cart_id; rows = bulk.items;
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

      const prefer = String((req.headers['prefer'] || '')).toLowerCase();
      if (prefer.includes('return=minimal')) {
        await applyItemsToCart(fastify, tenantId, cartId, rows as any, 'set');
        await invalidateCartCache(tenantId, cartId);
        await publishCartUpdated(tenantId, cartId);
        cartOpMetrics.upd_min++;
        fastify.log.info(
          logCtx(
            {
              reqId,
              route: 'POST /api/cart/items/update',
              tenantId,
              userId,
              cart_id: cartId,
              minimal: true,
              metrics: { upd_min: cartOpMetrics.upd_min, upd_full: cartOpMetrics.upd_full }
            },
            start
          ),
          'cart_items_update_done'
        );
        return reply.status(204).send();
      } else {
        const summary = await svc.setItems(cartId, upserts as any);
        await writeCartCache(tenantId, cartId, summary);
        await publishCartUpdated(tenantId, cartId);
        cartOpMetrics.upd_full++;
        fastify.log.info(
          logCtx(
            {
              reqId,
              route: 'POST /api/cart/items/update',
              tenantId,
              userId,
              cart_id: cartId,
              metrics: { upd_min: cartOpMetrics.upd_min, upd_full: cartOpMetrics.upd_full }
            },
            start
          ),
          'cart_items_update_done'
        );
        return reply.send(summary);
      }
    } catch (e: any) {
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
    const body = removeItemBody.parse((req as any).body ?? {});
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

      const prefer = String((req.headers['prefer'] || '')).toLowerCase();
      if (prefer.includes('return=minimal')) {
        await svc.removeItems(body.cart_id, [body.menu_item_id]);
        await invalidateCartCache(tenantId, body.cart_id);
        await publishCartUpdated(tenantId, body.cart_id);
        cartOpMetrics.rem_min++;
        fastify.log.info(
          logCtx(
            {
              reqId,
              route: 'POST /api/cart/items/remove',
              tenantId,
              userId,
              cart_id: body.cart_id,
              menu_item_id: body.menu_item_id,
              minimal: true,
              metrics: { rem_min: cartOpMetrics.rem_min, rem_full: cartOpMetrics.rem_full }
            },
            start
          ),
          'cart_item_remove_done'
        );
        return reply.status(204).send();
      } else {
        const summary = await svc.removeItems(body.cart_id, [body.menu_item_id]);
        await writeCartCache(tenantId, body.cart_id, summary);
        await publishCartUpdated(tenantId, body.cart_id);
        cartOpMetrics.rem_full++;
        fastify.log.info(
          logCtx(
            {
              reqId,
              route: 'POST /api/cart/items/remove',
              tenantId,
              userId,
              cart_id: body.cart_id,
              menu_item_id: body.menu_item_id,
              metrics: { rem_min: cartOpMetrics.rem_min, rem_full: cartOpMetrics.rem_full }
            },
            start
          ),
          'cart_item_remove_done'
        );
        return reply.send(summary);
      }
    } catch (e: any) {
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
    const body = checkoutBody.parse((req as any).body ?? {});
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

    const payload = (data as any) || {};
    const taxCfg = await getTenantTaxConfig(fastify, tenantId);
    const pricingMode: 'tax_inclusive' | 'tax_exclusive' = (taxCfg as any).inclusion === 'exclusive' ? 'tax_exclusive' : 'tax_inclusive';
    const orderId = payload.order_id as string;

    // Cart is completed; drop any cached summary for this cart
    await invalidateCartCache(tenantId, body.cart_id);

    // Best‑effort: persist customer/table on orders row if columns exist
    try {
      if (body.customer_name || body.table_code) {
        const updates: any = {};
        if (body.customer_name) updates.customer_name = body.customer_name;
        if (body.table_code) updates.table_code = body.table_code;
        if (Object.keys(updates).length > 0) {
          const { error: updErr } = await supabase
            .from('orders')
            .update(updates)
            .eq('tenant_id', tenantId)
            .eq('id', orderId);
          if (updErr) fastify.log.warn({ route: 'POST /api/cart/checkout', orderId, updates, err: updErr }, 'orders_update_customer_table_failed');
        }
      }
    } catch (e: any) {
      fastify.log.warn({ route: 'POST /api/cart/checkout', orderId, err: e?.message || String(e) }, 'orders_update_customer_table_exception');
    }

    // Recompute totals from order_items based on tenant tax inclusion (authoritative),
    // so success payload reflects inclusive vs exclusive correctly regardless of RPC defaults.
    let subtotal = 0, tax = 0, total = 0;
    let tax_breakdown: Array<{ name: string; rate: number; amount: number }> = [];
    try {
      const { data: oi, error: oiErr } = await supabase
        .from('order_items')
        .select('qty, price, name, menu_item_id')
        .eq('tenant_id', tenantId)
        .eq('order_id', orderId);
      if (oiErr) throw oiErr;
      const items = (oi || []).map((r: any) => ({ qty: Number(r.qty) || 0, price: Number(r.price) || 0, name: r.name ?? null }));
      const breakdownArr = Array.isArray((taxCfg as any).breakdown) ? (taxCfg as any).breakdown : [];
      if ((taxCfg as any).inclusion === 'exclusive') {
        const t = computeCartTotalsExclusive(items as any, breakdownArr as any);
        subtotal = t.subtotal; tax = t.tax; total = t.total; tax_breakdown = t.tax_breakdown;
      } else {
        const eff = Number((taxCfg as any).effective_rate ?? 0) || 0;
        const t = computeCartTotalsInclusive(items as any, eff, breakdownArr as any);
        subtotal = t.subtotal; tax = t.tax; total = t.total; tax_breakdown = t.tax_breakdown;
      }
    } catch (recalcErr) {
      // Fallback to RPC payload if recompute fails
      fastify.log.warn({ orderId, err: String(recalcErr) }, 'checkout_recompute_totals_failed');
      subtotal = Number(payload.subtotal) || 0;
      tax = Number(payload.tax_amount) || 0;
      total = Number(payload.total_amount) || 0;
      const breakdownArr = Array.isArray((taxCfg as any).breakdown) ? (taxCfg as any).breakdown : [];
      if (breakdownArr.length > 1) {
        const sumRates = breakdownArr.reduce((s: number, c: any) => s + Number(c?.rate || 0), 0) || 1;
        let allocated = 0;
        tax_breakdown = breakdownArr.map((c: any, idx: number) => {
          const isLast = idx === breakdownArr.length - 1;
          const rate = Number(c?.rate || 0);
          const amt = isLast ? (tax - allocated) : +(tax * (rate / sumRates)).toFixed(6);
          allocated = +(allocated + amt).toFixed(6);
          return { name: String(c?.name ?? 'Tax'), rate, amount: +amt.toFixed(6) };
        });
      } else {
        tax_breakdown = [{ name: 'Tax', rate: subtotal > 0 ? +(tax / subtotal).toFixed(6) : 0, amount: +tax.toFixed(6) }];
      }
    }

    // --- Build order.created event payload with ETA ---
    let etaMinutes: number | null = null;
    let itemsForEvent: Array<{ id: string; name: string | null; qty: number; price: number }> = [];
    try {
      const itemRows = await fastify.supabase
        .from('order_items')
        .select('menu_item_id, qty, price, name')
        .eq('tenant_id', tenantId)
        .eq('order_id', orderId);

      const list = (itemRows.data || []).map((r: any) => ({
        id: r.menu_item_id as string,
        name: r.name ?? null,
        qty: Number(r.qty) || 0,
        price: Number(r.price) || 0,
      }));
      itemsForEvent = list;

      const ids = list.map(i => i.id);
      if (ids.length > 0) {
        const { data: prepMeta } = await fastify.supabase
          .from('menu_items')
          .select('id, preparation_time')
          .eq('tenant_id', tenantId)
          .in('id', ids);

        const prepMap = new Map<string, number>((prepMeta || []).map((m: any) => [m.id, Number(m.preparation_time) || 0]));
        let totalPrep = 0;
        let totalQty = 0;
        for (const it of list) {
          const prep = prepMap.get(it.id) || 0;
          totalPrep += prep * (it.qty || 0);
          totalQty += (it.qty || 0);
        }
        if (totalQty > 0) {
          etaMinutes = Math.max(0, Math.round(totalPrep / totalQty));
        }
      }
    } catch (e) {
      fastify.log.warn({ err: (e as any)?.message, orderId }, 'order_created_eta_build_failed');
    }

    // Publish order.created so Live Orders / OM / KDS can reflect "Placed" immediately
    await publishEvent(fastify, tenantId, {
      type: 'order.created',
      tenant_id: tenantId,
      order_id: orderId,
      status: 'placed',
      mode: payload.mode ?? null,
      table_code: body.table_code || payload.table_code || null,
      currency: payload.currency || 'INR',
      totals: { subtotal, tax, total, pricing_mode: pricingMode, tax_breakdown },
      items: itemsForEvent,
      eta_minutes: etaMinutes,
      ts: new Date().toISOString(),
      version: 1,
    });

    fastify.log.info(
      logCtx({ reqId, route: 'POST /api/cart/checkout', tenantId, userId, cart_id: body.cart_id, order_id: orderId, total }, start),
      'cart_checkout_done'
    );

    return reply.send({
      order_id: orderId,
      cart_id: body.cart_id,
      customer_name: body.customer_name || null,
      table_code: body.table_code || payload.table_code || null,
      totals: {
        subtotal,
        tax,
        total,
        pricing_mode: pricingMode,
        tax_breakdown,
      },
      currency: payload.currency || 'INR',
      status: 'created',
    });
  });

  // GET /api/cart/by-order/:orderId — fetch the cart_id tied to a given order
  fastify.get('/api/cart/by-order/:orderId', { preHandler: [fastify.requireTenant] }, async (req, reply) => {
    const tenantId = tenantFromReq(req);
    const orderId = (req.params as any).orderId as string;
    const start = Date.now();
    const reqId = randomUUID();

    try {
      // 1) Try orders.cart_id (authoritative going forward)
      const { data: ord, error: ordErr } = await fastify.supabase
        .from('orders')
        .select('id, cart_id')
        .eq('tenant_id', tenantId)
        .eq('id', orderId)
        .single();

      if (ordErr) {
        fastify.log.warn({ reqId, tenantId, orderId, err: ordErr.message }, 'cart_by_order_orders_lookup_failed');
      }

      if (ord && ord.cart_id) {
        return reply.send({ cart_id: ord.cart_id });
      }

      // 2) Fallback: if older data lacks orders.cart_id, infer from payment_intents
      const { data: piList, error: piErr } = await fastify.supabase
        .from('payment_intents')
        .select('cart_id, created_at')
        .eq('tenant_id', tenantId)
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (piErr) {
        fastify.log.warn({ reqId, tenantId, orderId, err: piErr.message }, 'cart_by_order_pi_lookup_failed');
      }

      const pi = Array.isArray(piList) && piList.length > 0 ? piList[0] : null;
      if (pi && pi.cart_id) {
        return reply.send({ cart_id: pi.cart_id });
      }

      // Nothing found
      return reply.status(404).send({ error: 'cart_not_found_for_order' });
    } catch (e: any) {
      fastify.log.error({ reqId, tenantId, orderId, err: e?.message }, 'cart_by_order_failed');
      return reply.status(500).send({ error: 'cart_by_order_failed' });
    }
  });
}
