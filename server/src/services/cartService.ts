import type { SupabaseClient } from '@supabase/supabase-js';
import type { Redis } from 'ioredis';

export type CartMode = 'dinein' | 'takeaway' | 'inactive';

export interface CartRow {
  id: string;
  tenant_id: string;
  user_id: string | null;
  status: 'open' | 'inactive' | 'completed' | string;
  mode: CartMode;
  table_code?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CartItemInput {
  menu_item_id: string;
  qty: number; // intended delta for increment, or absolute for set
  price?: number; // tax-inclusive snapshot; required for set/new rows
  name?: string;  // optional label snapshot
  image_url?: string | null;
}

export interface CartItemRow {
  cart_id: string;
  tenant_id: string;
  menu_item_id: string;
  name: string | null;
  qty: number;
  price: number; // tax-inclusive unit price snapshot
  image_url?: string | null;
}

export interface TaxComponent { name: string; rate: number } // rate as fraction (0.05)
export interface TaxConfig { effective_rate: number; breakdown: TaxComponent[]; mode: 'single' | 'components' | string; currency?: string; inclusion?: 'inclusive' | 'exclusive' }

export interface CartTotals {
  subtotal: number;
  tax: number;
  total: number;
  pricing_mode: 'tax_inclusive' | 'tax_exclusive';
  tax_breakdown: Array<{ name: string; rate: number; amount: number }>;
}

export interface CartSummary {
  cart: Pick<CartRow, 'id' | 'tenant_id' | 'user_id' | 'status' | 'mode' | 'table_code'>;
  items: CartItemRow[];
  totals: CartTotals;
  currency?: string;
}

// Optional Redis cache wiring for service-level consistency
export interface CartCacheOptions {
  redis?: Redis;
  rkey?: (...parts: string[]) => string;
  cartTtlSec?: number; // default 3600
}

const defaultNs = () => (process.env.REDIS_NAMESPACE || 'pkaf');
const makeCartKey = (tenantId: string, cartId: string, rkey?: (...p: string[]) => string) =>
  rkey ? rkey('cart', tenantId, cartId, 'v1') : `${defaultNs()}:cart:${tenantId}:${cartId}:v1`;

async function writeCartCache(opts: CartCacheOptions | undefined, tenantId: string, cartId: string, summary: CartSummary) {
  if (!opts?.redis) return;
  const key = makeCartKey(tenantId, cartId, opts.rkey);
  const ttl = Math.max(60, Number(opts.cartTtlSec ?? 3600));
  try {
    await opts.redis.set(key, JSON.stringify(summary), 'EX', ttl);
  } catch (_) { /* best-effort */ }
}

async function delCartCache(opts: CartCacheOptions | undefined, tenantId: string, cartId: string) {
  if (!opts?.redis) return;
  const key = makeCartKey(tenantId, cartId, opts.rkey);
  try { await opts.redis.del(key); } catch (_) { /* best-effort */ }
}

const money = (n: unknown) => {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
};

// Safety clamps
const MAX_QTY = 999;

// App-level error wrapper for consistent API responses
class AppError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;
  constructor(code: string, message?: string, statusCode = 500, details?: unknown) {
    super(message || code);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

const wrapDbError = (code: string, err: any, fallbackMsg?: string) =>
  new AppError(code, err?.message || fallbackMsg || code, (err as any)?.status || 500, err);

const clampQty = (q: number) => Math.max(0, Math.min(MAX_QTY, Math.trunc(money(q))));

function splitInclusive(total: number, rate: number) {
  const safeRate = rate > 1 ? rate / 100 : rate;
  const subtotal = total / (1 + (safeRate || 0));
  const tax = total - subtotal;
  return { subtotal, tax };
}

function computeTotalsInclusive(total: number, breakdown?: TaxComponent[]): CartTotals {
  const sumRate = (breakdown ?? []).reduce((s, c) => s + money(c.rate), 0);
  const eff = sumRate > 0 ? sumRate : (breakdown && breakdown.length === 0 ? 0 : sumRate);
  const { subtotal, tax } = splitInclusive(total, eff);

  let tax_breakdown: Array<{ name: string; rate: number; amount: number }> = [];
  if (breakdown && breakdown.length) {
    const rates = breakdown.map(b => ({ name: String(b.name || 'Tax'), rate: money(b.rate) }));
    const sum = rates.reduce((s, r) => s + r.rate, 0) || 1;
    let allocated = 0;
    rates.forEach((r, i) => {
      const isLast = i === rates.length - 1;
      const amt = isLast ? (tax - allocated) : Number((tax * (r.rate / sum)).toFixed(6));
      allocated = Number((allocated + amt).toFixed(6));
      tax_breakdown.push({ name: r.name, rate: r.rate, amount: Number(amt.toFixed(6)) });
    });
  } else {
    tax_breakdown.push({ name: 'Tax', rate: eff, amount: Number(tax.toFixed(6)) });
  }

  return {
    subtotal: Number(subtotal.toFixed(6)),
    tax: Number(tax.toFixed(6)),
    total: Number(total.toFixed(6)),
    pricing_mode: 'tax_inclusive',
    tax_breakdown,
  };
}

function computeTotalsExclusive(subtotal: number, breakdown?: TaxComponent[]): CartTotals {
  const sumRate = (breakdown ?? []).reduce((s, c) => s + money(c.rate), 0);
  const eff = sumRate > 0 ? sumRate : 0;
  const tax = subtotal * eff;
  let tax_breakdown: Array<{ name: string; rate: number; amount: number }> = [];
  if (breakdown && breakdown.length) {
    const rates = breakdown.map(b => ({ name: String(b.name || 'Tax'), rate: money(b.rate) }));
    const sum = rates.reduce((s, r) => s + r.rate, 0) || 1;
    let allocated = 0;
    rates.forEach((r, i) => {
      const isLast = i === rates.length - 1;
      const amt = isLast ? (tax - allocated) : Number((tax * (r.rate / sum)).toFixed(6));
      allocated = Number((allocated + amt).toFixed(6));
      tax_breakdown.push({ name: r.name, rate: r.rate, amount: Number(amt.toFixed(6)) });
    });
  } else {
    tax_breakdown.push({ name: 'Tax', rate: eff, amount: Number(tax.toFixed(6)) });
  }

  return {
    subtotal: Number(subtotal.toFixed(6)),
    tax: Number(tax.toFixed(6)),
    total: Number((subtotal + tax).toFixed(6)),
    pricing_mode: 'tax_exclusive',
    tax_breakdown,
  };
}

async function getTaxConfig(supabase: SupabaseClient, tenantId: string): Promise<TaxConfig> {
  const { data, error } = await supabase
    .from('v_tenant_tax_effective')
    .select('effective_rate, breakdown, mode, currency, inclusion')
    .eq('tenant_id', tenantId)
    .maybeSingle();
  if (error || !data) {
    return { effective_rate: 0, breakdown: [{ name: 'Tax', rate: 0 }], mode: 'single', currency: 'INR', inclusion: 'inclusive' };
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
      .map((b: any) => ({ name: String(b?.name ?? 'Tax'), rate: normalizeRate((b as any)?.rate) }))
      .filter((c: any) => c.rate > 0);
    const sum = breakdown.reduce((s, c) => s + c.rate, 0);
    effective = +sum.toFixed(6);
  } else {
    breakdown = [{ name: 'Tax', rate: effective }];
  }

  return {
    effective_rate: effective,
    breakdown,
    mode: (data as any).mode,
    currency: (data as any).currency || 'INR',
    inclusion: (data as any).inclusion || 'inclusive',
  };
}

export function createCartService(supabase: SupabaseClient, tenantId: string, userId: string | null, cacheOpts?: CartCacheOptions) {
  if (!tenantId) throw new Error('tenant_id_required');

  // Resolve an effective user id for public flows:
  // - prefer explicit userId (from header/preHandler)
  // - else, if table_code is present (dine-in), derive an id from it
  // - else, no user — caller must provide one
  const resolveUserId = (table_code?: string | null): string | null => {
    const explicit = (userId ?? '').trim();
    if (explicit) return explicit;
    const t = (table_code ?? '').trim();
    if (t) return `table:${t}`;
    return null;
  };

  async function getOpenCart(table_code?: string | null): Promise<CartRow | null> {
    const effUid = resolveUserId(table_code);
    if (!effUid) throw new AppError('user_id_required', 'User ID required for cart operation', 400);

    const { data, error } = await supabase
      .from('carts')
      .select('id, tenant_id, user_id, status, mode, table_code')
      .eq('tenant_id', tenantId)
      .eq('user_id', effUid)
      .in('status', ['open', 'inactive'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw wrapDbError('db_get_open_cart_failed', error);
    return data ?? null;
  }

  async function ensureCart(mode: CartMode = 'takeaway', table_code?: string | null): Promise<CartRow> {
    const existing = await getOpenCart(table_code);
    if (existing) return existing;

    const effUid = resolveUserId(table_code);
    if (!effUid) throw new AppError('user_id_required', 'User ID required for cart operation', 400);

    const insert = {
      tenant_id: tenantId,
      user_id: effUid,
      status: 'open',
      mode,
      table_code: (table_code ?? null) || null,
    } as Partial<CartRow>;

    const { data, error } = await supabase.from('carts').insert(insert).select('*').single();
    if (error || !data) throw wrapDbError('cart_create_failed', error);
    return data;
  }

  async function getCartById(cartId: string): Promise<CartRow | null> {
    const { data, error } = await supabase
      .from('carts')
      .select('id, tenant_id, user_id, status, mode, table_code')
      .eq('tenant_id', tenantId)
      .eq('id', cartId)
      .maybeSingle();
    if (error) {
      // Supabase "no rows" error has code PGRST116, treat it as not found
      if ((error as any)?.code === 'PGRST116') {
        return null;
      }
      throw wrapDbError('db_get_cart_failed', error);
    }
    return data ?? null;
  }

  async function listItems(cartId: string): Promise<CartItemRow[]> {
    // Join cart_items with menu_items to fetch name, price, image_url from menu_items
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        cart_id,
        tenant_id,
        menu_item_id,
        qty,
        price,
        menu_items!inner(
          name,
          image_url
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('cart_id', cartId)
      .eq('menu_items.tenant_id', tenantId);
    if (error) throw wrapDbError('db_list_items_failed', error);
    return (data ?? []).map((r: any) => ({
      cart_id: r.cart_id,
      tenant_id: r.tenant_id,
      menu_item_id: r.menu_item_id,
      name: r.menu_items?.name ?? null,
      qty: clampQty(r.qty),
      price: money(r.price),
      // Merge image_url from menu_items into returned row for UI
      image_url: r.menu_items?.image_url ?? null,
    }));
  }

  async function summarize(cart: CartRow): Promise<CartSummary> {
    const items = await listItems(cart.id);
    const total = items.reduce((s, it) => s + money(it.qty) * money(it.price), 0);
    const taxCfg = await getTaxConfig(supabase, tenantId);
    let totals: CartTotals;
    if (taxCfg.inclusion === 'exclusive') {
      totals = computeTotalsExclusive(total, taxCfg.mode === 'components' ? taxCfg.breakdown : [{ name: 'Tax', rate: taxCfg.effective_rate }]);
    } else {
      if (taxCfg.mode === 'single') {
        totals = computeTotalsInclusive(total, [{ name: 'Tax', rate: taxCfg.effective_rate }]);
      } else if (taxCfg.mode === 'components') {
        totals = computeTotalsInclusive(total, taxCfg.breakdown);
      } else {
        totals = computeTotalsInclusive(total, [{ name: 'Tax', rate: taxCfg.effective_rate }]);
      }
    }
    const summary: CartSummary = { cart: { id: cart.id, tenant_id: cart.tenant_id, user_id: cart.user_id, status: cart.status, mode: cart.mode, table_code: cart.table_code ?? null }, items, totals, currency: taxCfg.currency };
    // Best-effort write-through after compute
    writeCartCache(cacheOpts, tenantId, cart.id, summary);
    return summary;
  }

  // Upsert (set absolute qty). qty <= 0 will delete the row.
  async function setItems(cartId: string, rows: CartItemInput[]): Promise<CartSummary> {
    if (!rows || rows.length === 0) {
      const cart = await getCartById(cartId);
      if (!cart) throw new Error('cart_not_found');
      return summarize(cart);
    }

    const upserts = rows
      .filter(r => r && r.menu_item_id)
      .map(r => ({
        cart_id: cartId,
        tenant_id: tenantId,
        menu_item_id: r.menu_item_id,
        name: r.name ?? null,
        qty: clampQty(r.qty),
        price: money(r.price),
        // image_url is not written to cart_items anymore
      }));

    // Delete zero-qty rows first to avoid unique conflicts
    const zeros = upserts.filter(r => r.qty <= 0).map(r => r.menu_item_id);
    if (zeros.length) {
      const { error: delErr } = await supabase
        .from('cart_items')
        .delete()
        .eq('tenant_id', tenantId)
        .eq('cart_id', cartId)
        .in('menu_item_id', zeros);
      if (delErr) throw wrapDbError('cart_items_delete_failed', delErr);
    }

    const toUpsert = upserts.filter(r => r.qty > 0);
    if (toUpsert.length) {
      const { error: upErr } = await supabase
        .from('cart_items')
        .upsert(toUpsert, { onConflict: 'cart_id,menu_item_id' });
      if (upErr) throw wrapDbError('cart_items_upsert_failed', upErr);
    }

    const cart = await getCartById(cartId);
    if (!cart) throw new Error('cart_not_found');
    // Do not set inactive; keep open for empty carts
    const items = await listItems(cartId);
    try {
      if (items.length && cart.status !== 'open') {
        const { error: stErr } = await supabase.from('carts').update({ status: 'open' }).eq('id', cartId);
        if (stErr) throw stErr;
        (cart as any).status = 'open';
      }
    } catch (e: any) {
      throw wrapDbError('cart_status_update_failed', e);
    }
    delCartCache(cacheOpts, tenantId, cartId);
    return summarize(cart);
  }

  // Increment deltas (positive or negative). Falls back to upsert if RPC missing.
  async function incrementItems(cartId: string, rows: CartItemInput[]): Promise<CartSummary> {
    if (!rows || rows.length === 0) {
      const cart = await getCartById(cartId);
      if (!cart) throw new Error('cart_not_found');
      return summarize(cart);
    }

    // Try RPC for atomic batch increments
    const payload = rows.map(r => ({
      menu_item_id: r.menu_item_id,
      delta: Math.sign(money(r.qty)) * clampQty(Math.abs(money(r.qty))),
      name: r.name ?? null,
      price: money(r.price),
      // image_url is no longer written
    }));

    const { error: rpcErr } = await supabase.rpc('cart_items_increment_batch', {
      p_tenant_id: tenantId,
      p_cart_id: cartId,
      p_rows: payload as any,
    });

    if (rpcErr) {
      // Fallback: emulate increment with read+upsert (best effort)
      const existing = await listItems(cartId);
      const map = new Map<string, CartItemRow>();
      existing.forEach(it => map.set(it.menu_item_id, it));

      const updates: Array<{ cart_id: string; tenant_id: string; menu_item_id: string; name: string | null; qty: number; price: number; }> = [];
      const deletes: string[] = [];

      for (const r of rows) {
        const cur = map.get(r.menu_item_id);
        const nextQty = Math.max(0, Math.trunc((cur?.qty ?? 0) + money(r.qty)));
        if (nextQty === 0) {
          deletes.push(r.menu_item_id);
        } else {
          updates.push({
            cart_id: cartId,
            tenant_id: tenantId,
            menu_item_id: r.menu_item_id,
            name: r.name ?? cur?.name ?? null,
            qty: nextQty,
            price: money(r.price ?? cur?.price ?? 0),
            // image_url is not written to cart_items
          });
        }
      }

      if (deletes.length) {
        const { error: delErr } = await supabase
          .from('cart_items')
          .delete()
          .eq('tenant_id', tenantId)
          .eq('cart_id', cartId)
          .in('menu_item_id', deletes);
        if (delErr) throw wrapDbError('cart_items_delete_failed', delErr);
      }
      if (updates.length) {
        const { error: upErr } = await supabase
          .from('cart_items')
          .upsert(updates, { onConflict: 'cart_id,menu_item_id' });
        if (upErr) throw wrapDbError('cart_items_upsert_failed', upErr);
      }
    }

    const cart = await getCartById(cartId);
    if (!cart) throw new Error('cart_not_found');

    // Reconcile cart status
    const items = await listItems(cartId);
    try {
      // Do not set inactive; keep open for empty carts
      if (items.length && cart.status !== 'open') {
        const { error: stErr } = await supabase.from('carts').update({ status: 'open' }).eq('id', cartId);
        if (stErr) throw stErr;
        (cart as any).status = 'open';
      }
    } catch (e: any) {
      throw wrapDbError('cart_status_update_failed', e);
    }
    delCartCache(cacheOpts, tenantId, cartId);
    return summarize(cart);
  }

  async function removeItems(cartId: string, menuItemIds: string[]): Promise<CartSummary> {
    if (!menuItemIds || !menuItemIds.length) {
      const cart = await getCartById(cartId);
      if (!cart) throw new Error('cart_not_found');
      return summarize(cart);
    }
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('cart_id', cartId)
      .in('menu_item_id', menuItemIds);
    if (error) throw wrapDbError('cart_items_delete_failed', error);

    const cart = await getCartById(cartId);
    if (!cart) throw new Error('cart_not_found');

    const items = await listItems(cartId);
    try {
      if (items.length && cart.status !== 'open') {
        const { error: stErr } = await supabase.from('carts').update({ status: 'open' }).eq('id', cartId);
        if (stErr) throw stErr;
        (cart as any).status = 'open';
      }
    } catch (e: any) {
      throw wrapDbError('cart_status_update_failed', e);
    }
    delCartCache(cacheOpts, tenantId, cartId);
    return summarize(cart);
  }

  return {
    ensureCart,
    getOpenCart,
    getCartById,
    listItems,
    summarize,
    setItems,
    incrementItems,
    removeItems,
  };
}

export type CartService = ReturnType<typeof createCartService>;
export { AppError };
