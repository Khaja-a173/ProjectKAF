import { create } from 'zustand';
import { cartApi } from '@/lib/api';
// Local helper to call cartApi.get with optional userId without TS arity issues
const cartGet = (tenantId: string, cartId: string, userId?: string) => (cartApi as any).get(tenantId, cartId, userId);

type CheckoutResponse = {
  order_id: string;
  cart_id: string;
  status: string;
  totals: CartTotals;
  currency?: string;
  items?: CartLine[];
  table_code?: string | null;
  customer_name?: string | null;
};


let startInFlight: Promise<void> | null = null;
let incrBuffer: { menu_item_id: string; qty: number }[] = [];
let incrTimer: any = null;
let idleRefreshTimer: any = null;
// Cart creation/ops queueing for instant adds before cart exists
let creatingCart = false;
let pendingOps: { menu_item_id: string; qty: number }[] = [];
// Helper to ensure cart is created in background and flush pending ops
async function ensureCartAsync(get: any, set: any) {
  if (creatingCart) return;
  creatingCart = true;
  try {
    await get().ensureCartReady(false);
    const { tenantId, cartId } = get();
    if (tenantId && cartId && pendingOps.length) {
      const batch = [...pendingOps];
      pendingOps = [];
      try { const ok = await flushOps(batch, get, set); if (ok) scheduleIdleRefresh(500); }
      catch (e) { console.warn('flush pendingOps failed', e); }
      finally { try { (useCartStore.getState() as any).setState?.({ isBatching: false }); } catch {} }
    }
  } finally {
    creatingCart = false;
  }
}

// Aggregate a batch of deltas and flush: positives -> increment; non-positives -> set final qty
async function flushOps(
  batch: { menu_item_id: string; qty: number }[],
  get: any,
  set?: any
): Promise<boolean> {
  const { tenantId: tId, cartId: cId } = get();
  if (!tId || !cId || !batch || batch.length === 0) return false;

  let anySuccess = false;

  // Collapse by id
  const acc: Record<string, number> = {};
  for (const r of batch) {
    if (!r || !r.menu_item_id) continue;
    acc[r.menu_item_id] = (acc[r.menu_item_id] || 0) + (r.qty || 0);
  }

  const itemsNow: CartLine[] = get().items || [];
  const incItems: { menu_item_id: string; qty: number }[] = [];
  const setItems: { id: string; qty: number }[] = [];

  for (const id of Object.keys(acc)) {
    const delta = acc[id];
    if (delta > 0) {
      incItems.push({ menu_item_id: id, qty: delta });
    } else if (delta <= 0) {
      // Final qty from optimistic state
      const finalQty = Math.max(0, (itemsNow.find(it => it.menu_item_id === id)?.qty) ?? 0);
      setItems.push({ id, qty: finalQty });
    }
  }

  // Send increment first (cheap, batched)
  if (incItems.length > 0) {
    try { await cartApi.increment(tId, cId, incItems); anySuccess = true; } catch (e) { console.warn('flushOps increment failed', e); }
  }
  // Then apply sets (can be multiple calls if API is single-item)
  for (const s of setItems) {
    try { await (cartApi as any).updateItem(tId, cId, s.id, s.qty); anySuccess = true; } catch (e) { console.warn('flushOps set failed', s, e); }
  }

  try {
    const okState = anySuccess
      ? { lastFlushAt: Date.now(), isBatching: false }
      : { lastBatchFailedAt: Date.now(), isBatching: false };
    if (set) set(okState);
    else (useCartStore.getState() as any).setState?.(okState);
  } catch {}

  return anySuccess;
}

// Throttled idle refresh scheduler (global, used for all cart mutations)
const scheduleIdleRefresh = (ms = 750) => {
  if (idleRefreshTimer) clearTimeout(idleRefreshTimer);
  idleRefreshTimer = setTimeout(() => {
    try { (useCartStore.getState() as any).refreshSummary?.(); } catch {}
  }, ms);
};

export type Mode = 'table' | 'takeaway';

export type CartLine = {
  menu_item_id: string;
  qty: number;
  price?: number;
  name?: string;
};

export type CartTotals = {
  subtotal: number;
  tax: number;
  total: number;
  pricing_mode?: 'tax_inclusive' | 'tax_exclusive';
  tax_breakdown?: { name: string; rate: number; amount: number }[];
};

export type CartSummary = { items: CartLine[]; totals?: CartTotals };

type CatalogEntry = { price: number; name?: string };
const recalcTotals = (items: CartLine[], prev?: CartTotals): CartTotals | undefined => {
  if (!items || items.length === 0) return prev ? { ...prev, subtotal: 0, tax: 0, total: 0 } : { subtotal: 0, tax: 0, total: 0, pricing_mode: prev?.pricing_mode, tax_breakdown: [] } as any;
  const subtotal = items.reduce((s, it) => s + ((it.price ?? 0) * (it.qty ?? 0)), 0);
  // Preserve last-known pricing_mode and combined rate if available
  const mode = prev?.pricing_mode;
  const combinedRate = prev?.tax_breakdown && prev.tax_breakdown.length > 0
    ? prev.tax_breakdown.reduce((r, tb) => r + (tb?.rate ?? 0), 0)
    : undefined;
  if (!mode || combinedRate === undefined) {
    return { subtotal, tax: prev?.tax ?? 0, total: (prev?.total ?? subtotal), pricing_mode: prev?.pricing_mode, tax_breakdown: prev?.tax_breakdown ?? [] } as any;
  }
  if (mode === 'tax_exclusive') {
    const tax = subtotal * combinedRate;
    const total = subtotal + tax;
    return { subtotal, tax, total, pricing_mode: mode, tax_breakdown: [{ name: 'Tax', rate: combinedRate, amount: tax }] };
  } else {
    // inclusive: total includes tax; if we only know subtotal (pre-tax), simulate like exclusive for UI; otherwise keep same behavior
    const tax = subtotal * combinedRate / (1 + combinedRate);
    const total = subtotal; // subtotal is treated as total when inclusive in UI list context
    return { subtotal, tax, total, pricing_mode: mode, tax_breakdown: [{ name: 'Tax', rate: combinedRate, amount: tax }] };
  }
};

export class ContextRequiredError extends Error {
  constructor(msg = 'Cart context is not initialized') {
    super(msg);
    this.name = 'ContextRequiredError';
  }
}

export interface CartStore {
  // context
  tenantId?: string;
  mode?: Mode;
  tableCode?: string | null;
  cartId?: string | null;
  userId?: string | null;

  // optimistic quantities (used for instant UI feedback)
  optimisticQty: Record<string, number>;

  // ui helpers
  booting: boolean;
  summary: CartSummary | null;

  items: CartLine[];
  totals?: CartTotals;

  catalog?: Record<string, CatalogEntry>;
  setCatalog: (entries: Record<string, CatalogEntry>) => void;

  // context/setup
  setServerContext: (
    tenantId: string,
    opts: { mode: Mode; tableCode?: string | null; cartId?: string | null; summary?: CartSummary | null; userId?: string | null }
  ) => void;
  clear: () => void;
  clearAfterCheckout: () => void;

  // boot/hydration
  initFromStorage: () => void;
  refreshSummary: () => Promise<void>;
  reloadFromServer: () => Promise<void>;

  ensureCartReady: (forceNew?: boolean) => Promise<void>;

  // server-backed operations (always sync with API)
  hydrate: (cartId: string) => Promise<void>;
  add: (menuItemId: string, qty?: number) => Promise<void>;
  updateQty: (menuItemId: string, qty: number) => Promise<void>;
  remove: (menuItemId: string) => Promise<void>;
  checkout: (opts?: { customerName?: string; tableCode?: string }) => Promise<CheckoutResponse>;
  lastOrder?: CheckoutResponse | null;
  lastFlushAt?: number;
  lastBatchFailedAt?: number;

  lastMutationAt?: number;
  isBatching?: boolean;
}

const cartKey = (tenantId?: string, tableCode?: string | null, userId?: string | null) => {
  // Namespace by tenant and per-customer context (tableCode or userId); fall back for legacy compatibility
  const scope = tableCode ?? userId ?? 'anon';
  return tenantId ? `cart_id:${tenantId}:${scope}` : 'cart_id';
};

const persistContext = (ctx: { tenantId?: string; mode?: Mode; tableCode?: string | null; cartId?: string | null }) => {
  try {
    if (ctx.tenantId) localStorage.setItem('tenant_id', ctx.tenantId);
    if (ctx.mode) localStorage.setItem('cart_mode', ctx.mode);
    if (typeof ctx.tableCode !== 'undefined') localStorage.setItem('table_code', ctx.tableCode ?? '');
    if (typeof ctx.cartId !== 'undefined') {
      const key = cartKey(ctx.tenantId, ctx.tableCode ?? null, (ctx as any).userId ?? null);
      if (ctx.cartId) {
        localStorage.setItem(key, ctx.cartId);
      } else {
        localStorage.removeItem(key);
      }
    }
  } catch {}
};

const clearPersisted = () => {
  try {
    // Remove legacy keys
    localStorage.removeItem('cart_id');
    localStorage.removeItem('cart_mode');
    localStorage.removeItem('table_code');
    // Remove any namespaced cart ids
    const toDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('cart_id:')) toDelete.push(k);
    }
    toDelete.forEach((k) => localStorage.removeItem(k));
  } catch {}
};

const normalizeSummary = (summary: any): { items: CartLine[]; totals?: CartTotals } => {
  const items: CartLine[] = Array.isArray(summary?.items) ? summary.items : [];
  const totalsFromApi = (summary as any)?.totals;
  const legacyTotal = (summary as any)?.total;
  const totals: CartTotals | undefined = totalsFromApi
    ? {
        subtotal: totalsFromApi.subtotal,
        tax: totalsFromApi.tax,
        total: totalsFromApi.total,
        pricing_mode: totalsFromApi.pricing_mode,
        tax_breakdown: totalsFromApi.tax_breakdown ?? []
      }
    : typeof legacyTotal === 'number'
      ? { subtotal: legacyTotal, tax: 0, total: legacyTotal, pricing_mode: 'tax_inclusive', tax_breakdown: [] }
      : undefined;
  return { items, totals };
};

const sumQty = (items: CartLine[] | undefined) =>
(items || []).reduce((s, it) => s + (it.qty || 0), 0);

// Helper to ensure a public user id exists and is persisted
const ensureLocalUserId = (get: any, set: any): string => {
  try {
    let uid = get().userId;
    if (uid && typeof uid === 'string') return uid;
    // try localStorage
    const fromLs = localStorage.getItem('public_user_id');
    if (fromLs) {
      set({ userId: fromLs });
      return fromLs;
    }
    // generate a UUID v4 (TS-safe)
    const gen = (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
      ? (crypto as any).randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
    localStorage.setItem('public_user_id', gen);
    set({ userId: gen });
    return gen;
  } catch {
    // fallback static when crypto/localStorage unavailable
    const gen = `anon-${Date.now()}`;
    try { localStorage.setItem('public_user_id', gen); } catch {}
    set({ userId: gen });
    return gen;
  }
};

export const useCartStore = create<CartStore>((set, get) => ({
  tenantId: undefined,
  mode: undefined,
  tableCode: null,
  cartId: null,
  userId: null,
  booting: false,
  summary: null,
  optimisticQty: {},
  items: [],
  totals: undefined,
  lastOrder: null,
  lastFlushAt: undefined,
  lastBatchFailedAt: undefined,
  lastMutationAt: undefined,
  isBatching: false,

  catalog: {},
  setCatalog: (entries) => {
    const curr = (get().catalog ?? {});
    set({ catalog: { ...curr, ...entries } });
  },

  initFromStorage: () => {
    try {
      const tenantId = localStorage.getItem('tenant_id') || undefined;
      let mode = (localStorage.getItem('cart_mode') as Mode | 'dine_in') || (undefined as any);
      if (mode === 'dine_in') mode = 'table';
      const tableCodeRaw = localStorage.getItem('table_code');
      const tableCode = tableCodeRaw === null ? null : tableCodeRaw || null;

      // Prefer namespaced cart id; fall back to legacy and migrate if present
      let cartId: string | null = null;
      if (tenantId) {
        const nsKey = cartKey(tenantId, tableCode ?? null, null);
        cartId = localStorage.getItem(nsKey) || null;
        if (!cartId) {
          const legacy = localStorage.getItem('cart_id');
          if (legacy) {
            // migrate legacy to namespaced
            localStorage.setItem(nsKey, legacy);
            localStorage.removeItem('cart_id');
            cartId = legacy;
          }
        }
      }

      if (tenantId) {
        const storedUid = localStorage.getItem('public_user_id') || undefined;
        set({ tenantId, cartId, mode, tableCode, userId: storedUid ?? null });
      }
    } catch {}
  },

  refreshSummary: async () => {
    const { tenantId, cartId } = get();
    if (!tenantId || !cartId) return;
    try {
      ensureLocalUserId(get, set);
      const summary = await cartGet(tenantId, cartId, get().userId || undefined);
      const norm = normalizeSummary(summary);
      const failedAt = get().lastBatchFailedAt;
      const flushedAt = get().lastFlushAt;
      const now = Date.now();
      const recentlyFailed = !!failedAt && (now - failedAt < 2000);
      const recentlyFlushed = !!flushedAt && (now - flushedAt < 1200);

      // Avoid snap-back while a batch is in-flight
      if (get().isBatching) {
        return;
      }

      // If we recently failed or just flushed and server is behind our optimistic state, skip reconcile
      const localItems = get().items || [];
      const serverQty = sumQty(norm.items);
      const localQty = sumQty(localItems);
      if ((recentlyFailed || recentlyFlushed) && serverQty < localQty) {
        return;
      }
      if ((recentlyFailed || recentlyFlushed) && (!Array.isArray(norm.items) || norm.items.length === 0) && localItems.length > 0) {
        console.warn('[cartStore] skip reconcile (empty server shortly after local change)');
        return;
      }
      set({ summary: summary as any, items: norm.items, totals: norm.totals });
    } catch (err: any) {
      const msg = String(err?.message || '').toLowerCase();
      if (err && (err.status === 404 || err.code === 404 || msg.includes('cart_not_found') || msg.includes('cart_get_failed'))) {
        // Cart no longer exists on server — clear local reference
        set({ cartId: null, summary: null, items: [], totals: undefined });
        persistContext({ tenantId, cartId: null, mode: get().mode, tableCode: get().tableCode ?? null });
        return;
      }
      throw err;
    }
  },

  setServerContext: (tenantId, opts) => {
    const prevTenant = get().tenantId;
    const incomingTenant = tenantId;
    const nextCartId = opts.cartId ?? null;

    const next = {
      tenantId: incomingTenant,
      mode: opts.mode,
      tableCode: opts.tableCode ?? null,
      cartId: nextCartId,
      summary: opts.summary ?? null,
      userId: opts.userId ?? null,
    };

    // If tenant changed and no explicit cart id was provided, reset cart state
    if (prevTenant && prevTenant !== incomingTenant && !nextCartId) {
      next.summary = null;
    }

    set(next);
    if (!next.userId) {
      try {
        const uid = localStorage.getItem('public_user_id');
        if (uid) set({ userId: uid });
      } catch {}
    }
    persistContext(next);
  },

  clear: () => {
    clearPersisted();
    set({ tenantId: undefined, mode: undefined, tableCode: null, cartId: null, summary: null, userId: null, optimisticQty: {}, items: [], totals: undefined });
  },

  clearAfterCheckout: () => {
    clearPersisted();
    set({ cartId: null, summary: null, optimisticQty: {}, items: [], totals: undefined });
  },

  reloadFromServer: async () => {
    const { tenantId, cartId } = get();
    if (!tenantId || !cartId) return;
    set({ booting: true });
    try {
      ensureLocalUserId(get, set);
      const summary = await cartGet(tenantId, cartId, get().userId || undefined);
      const norm = normalizeSummary(summary);
      set({
        summary: summary as any,
        items: norm.items,
        totals: norm.totals
          ? {
              subtotal: norm.totals.subtotal,
              tax: norm.totals.tax,
              total: norm.totals.total,
              pricing_mode: norm.totals.pricing_mode,
              tax_breakdown: norm.totals.tax_breakdown ?? []
            }
          : undefined,
      });
      console.log('[cartStore] totals from API ->', norm.totals);
    } catch (err: any) {
      const msg = String(err?.message || '').toLowerCase();
      if (err && (err.status === 404 || err.code === 404 || msg.includes('cart_not_found') || msg.includes('cart_get_failed'))) {
        set({ cartId: null, summary: null, items: [], totals: undefined });
        persistContext({ tenantId, cartId: null, mode: get().mode, tableCode: get().tableCode ?? null });
      } else {
        throw err;
      }
    } finally {
      set({ booting: false });
    }
  },

  ensureCartReady: async (forceNew = false) => {
    const { tenantId } = get();
    if (!tenantId) throw new ContextRequiredError('tenantId missing');

    const attempt = async () => {
      const { cartId, mode, tableCode } = get();
      ensureLocalUserId(get, set);

      // If we already have a cart and not forcing a new one, verify it exists
      if (cartId && !forceNew) {
        await cartGet(tenantId, cartId, get().userId || undefined); // may throw; outer try will handle stale
        return; // existing cart is valid
      }

      // Prevent concurrent starts (single-flight)
      if (startInFlight) {
        await startInFlight;
        return;
      }

      set({ booting: true });
      startInFlight = (async () => {
        const started = await cartApi.start(tenantId, get().tableCode ? { tableCode: get().tableCode! } : undefined);
        const newId = (started as any)?.cart_id ?? (started as any)?.id ?? null;
        set({ cartId: newId || null });
        persistContext({ tenantId, mode: get().mode, tableCode: get().tableCode ?? null, cartId: newId || null });
        if (newId) {
          const summary = await cartGet(tenantId, newId, get().userId || undefined); // if this fails as stale, outer catch will retry
          const norm = normalizeSummary(summary); set({ summary: summary as any, items: norm.items, totals: norm.totals });
        }
      })()
        .finally(() => {
          startInFlight = null;
          set({ booting: false });
        });

      await startInFlight;
    };

    try {
      await attempt();
    } catch (err: any) {
      const msg = String(err?.message || '').toLowerCase();
      const isStale = err?.status === 404 || err?.code === 404 || msg.includes('cart_not_found') || msg.includes('cart_get_failed');
      if (!isStale) throw err; // real error

      // Clear stale state and retry once to create a fresh cart
      const { tenantId: tId, mode, tableCode } = get();
      set({ cartId: null, summary: null, items: [], totals: undefined });
      persistContext({ tenantId: tId, mode, tableCode, cartId: null });

      try {
        await attempt();
      } catch (e2) {
        // If retry also fails as stale, bubble up
        throw e2;
      }
    }
  },

  hydrate: async (cartId: string) => {
    const { tenantId } = get();
    if (!tenantId) throw new ContextRequiredError('tenantId missing');
    set({ booting: true });
    try {
      ensureLocalUserId(get, set);
      const summary = await cartGet(tenantId, cartId, get().userId || undefined);
      const norm = normalizeSummary(summary); set({ cartId, summary: summary as any, items: norm.items, totals: norm.totals });
      persistContext({ tenantId, cartId, mode: get().mode, tableCode: get().tableCode ?? null });
    } catch (err: any) {
      const msg = String(err?.message || '').toLowerCase();
      if (err && (err.status === 404 || err.code === 404 || msg.includes('cart_not_found') || msg.includes('cart_get_failed'))) {
        // Server says this cart doesn't exist anymore
        set({ cartId: null, summary: null, items: [], totals: undefined });
        persistContext({ tenantId, cartId: null, mode: get().mode, tableCode: get().tableCode ?? null });
      } else {
        throw err;
      }
    } finally {
      set({ booting: false });
    }
  },

  add: async (menuItemId: string, qty = 1) => {
    const { tenantId } = get();
    if (!tenantId) throw new ContextRequiredError('tenantId missing');

    // Optimistic UI update (works even without cartId)
    const { items, catalog } = get() as any;
    const updated = [...(items || [])];
    const idx = updated.findIndex(it => it.menu_item_id === menuItemId);
    if (idx >= 0) {
      updated[idx] = { ...updated[idx], qty: (updated[idx].qty || 0) + qty };
    } else {
      const ce = (catalog || {})[menuItemId] as CatalogEntry | undefined;
      const fallbackPrice = ce?.price ?? 0;
      updated.push({
        menu_item_id: menuItemId,
        qty,
        price: fallbackPrice,
        name: ce?.name ?? `Item ${menuItemId.slice(0, 4)}`
      });
    }
    const nextTotals = recalcTotals(updated, get().totals);
    set({ lastMutationAt: Date.now(), isBatching: true, items: updated, totals: nextTotals });

    // Queue op (even if cartId not yet created)
    incrBuffer.push({ menu_item_id: menuItemId, qty });

    // If we don't have a cart yet, kick off background creation and also queue op for first flush
    let { cartId } = get();
    if (!cartId) {
      pendingOps.push({ menu_item_id: menuItemId, qty });
      // Fire background cart creation (no await)
      ensureCartAsync(get, set);
    }

    if (!incrTimer) {
      incrTimer = setTimeout(() => {
        const { tenantId: tId, cartId: cId } = get();
        const batch = [...incrBuffer];
        incrBuffer = [];
        incrTimer = null;

        (async () => {
          try {
            if (tId && cId && batch.length) {
              const ok = await flushOps(batch, get, set);
              if (ok) scheduleIdleRefresh(750);
            } else if (!cId) {
              pendingOps.push(...batch);
            }
          } catch (e) {
            console.warn('cart batch flush failed (non-blocking)', e);
            set({ lastBatchFailedAt: Date.now() });
          } finally {
            set({ isBatching: false });
          }
        })();
      }, 120);
    }
  },

  updateQty: async (menuItemId: string, qty: number) => {
    const { tenantId } = get();
    if (!tenantId) throw new ContextRequiredError('tenantId missing');

    let { cartId, items } = get();

    // Compute delta vs current qty
    const curr = (items.find(it => it.menu_item_id === menuItemId)?.qty) ?? 0;
    const delta = qty - curr;

    // Optimistic update
    const updated = items.map(it => it.menu_item_id === menuItemId ? { ...it, qty } : it);
    const ce = ((get() as any).catalog || {})[menuItemId] as { price?: number; name?: string } | undefined;
    const fallbackPrice = ce?.price ?? 0;
    const fallbackName = ce?.name ?? `Item ${menuItemId.slice(0, 4)}`;
    if (!updated.find(it => it.menu_item_id === menuItemId)) {
      updated.push({ menu_item_id: menuItemId, qty, price: fallbackPrice, name: fallbackName });
    }
    const nextTotals = recalcTotals(updated, get().totals);
    set({ lastMutationAt: Date.now(), isBatching: true, items: updated, totals: nextTotals });

    if (delta === 0) return;

    incrBuffer.push({ menu_item_id: menuItemId, qty: delta });

    if (!cartId) {
      pendingOps.push({ menu_item_id: menuItemId, qty: delta });
      ensureCartAsync(get, set);
    }

    if (!incrTimer) {
      incrTimer = setTimeout(() => {
        const { tenantId: tId, cartId: cId } = get();
        const batch = [...incrBuffer];
        incrBuffer = [];
        incrTimer = null;
        (async () => {
          try {
            if (tId && cId && batch.length) {
              const ok = await flushOps(batch, get, set);
              if (ok) scheduleIdleRefresh(750);
            } else if (!cId) {
              pendingOps.push(...batch);
            }
          } catch (e) {
            console.warn('cart batch flush failed (non-blocking)', e);
            set({ lastBatchFailedAt: Date.now() });
          } finally {
            set({ isBatching: false });
          }
        })();
      }, 120);
    }
  },

  remove: async (menuItemId: string) => {
    const { tenantId } = get();
    if (!tenantId) throw new ContextRequiredError('tenantId missing');

    let { cartId, items } = get();
    const curr = (items.find(it => it.menu_item_id === menuItemId)?.qty) ?? 0;

    // Optimistic update
    const filtered = items.filter(it => it.menu_item_id !== menuItemId);
    const nextTotals = recalcTotals(filtered, get().totals);
    set({ lastMutationAt: Date.now(), isBatching: true, items: filtered, totals: nextTotals });

    if (curr > 0) incrBuffer.push({ menu_item_id: menuItemId, qty: -curr });

    if (!cartId) {
      if (curr > 0) pendingOps.push({ menu_item_id: menuItemId, qty: -curr });
      ensureCartAsync(get, set);
    }

    if (!incrTimer) {
      incrTimer = setTimeout(() => {
        const { tenantId: tId, cartId: cId } = get();
        const batch = [...incrBuffer];
        incrBuffer = [];
        incrTimer = null;
        (async () => {
          try {
            if (tId && cId && batch.length) {
              const ok = await flushOps(batch, get, set);
              if (ok) scheduleIdleRefresh(750);
            } else if (!cId) {
              pendingOps.push(...batch);
            }
          } catch (e) {
            console.warn('cart batch flush failed (non-blocking)', e);
            set({ lastBatchFailedAt: Date.now() });
          } finally {
            set({ isBatching: false });
          }
        })();
      }, 120);
    }
  },

  checkout: async (opts?: { customerName?: string; tableCode?: string }) => {
    const { tenantId } = get();
    if (!tenantId) throw new ContextRequiredError('tenantId missing');

    ensureLocalUserId(get, set);
    await get().ensureCartReady(false);
    const { cartId } = get();
    if (!cartId) throw new ContextRequiredError('cartId missing');

    try {
      const resp = await cartApi.checkout(tenantId, cartId, {
        customer_name: opts?.customerName,
        table_code: opts?.tableCode ?? get().tableCode ?? undefined,
      });

      // Snapshot items before clearing
      const itemsSnapshot = get().items;

      const { order_id, cart_id, status, totals, currency, table_code, customer_name } = resp as any;
      const normalized: CheckoutResponse = {
        order_id,
        cart_id,
        status,
        totals: totals
          ? {
              subtotal: totals.subtotal,
              tax: totals.tax,
              total: totals.total,
              pricing_mode: totals.pricing_mode,
              tax_breakdown: totals.tax_breakdown ?? []
            }
          : undefined,
        currency,
        items: itemsSnapshot,
        table_code: table_code ?? opts?.tableCode ?? get().tableCode ?? null,
        customer_name: customer_name ?? opts?.customerName ?? null,
      };
      set({ lastOrder: normalized });

      get().clearAfterCheckout();

      return normalized;
    } catch (err: any) {
      const msg = String(err?.message || '').toLowerCase();
      // If server says cart is empty or not open, clear and rethrow (or caller can handle)
      if (
        err?.status === 400 && (msg.includes('cart_empty') || msg.includes('cart not open'))
      ) {
        get().clearAfterCheckout();
      }
      throw err;
    }
  },
}));