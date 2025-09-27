import React, { useState, useMemo, useCallback, memo, useEffect } from "react";
import { SessionCart, CartItem } from "../types/session";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Clock,
  Leaf,
  Flame,
  Edit,
  X,
} from "lucide-react";

interface SessionCartProps {
  cart: SessionCart | null;
  /** Optional server summary coming from page-level state */
  summary?: {
    items: Array<{ menu_item_id: string; qty: number; price?: number; name?: string }>;
    totals?: { subtotal: number; tax: number; total: number; pricing_mode?: 'tax_inclusive' | 'tax_exclusive'; tax_breakdown?: Array<{ name: string; rate?: number; amount?: number }> };
    currency?: string;
  } | null;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onPlaceOrder: () => void;
  onEditItem?: (item: CartItem) => void;
  disabled?: boolean;
  updatingIds?: Set<string>;
  addingIds?: Set<string>;
}

// Currency exponent helper
const CURRENCY_EXPONENTS: Record<string, number> = {
  KWD: 3,
  BHD: 3,
  OMR: 3, // 3 decimal places
  JPY: 0,
  KRW: 0, // 0 decimal places
  // Default: 2 decimal places for INR, AUD, USD, EUR, etc.
};

const getCurrencyExponent = (currency: string): number => {
  return CURRENCY_EXPONENTS[currency] ?? 2;
};

// Safe numeric coercion for values that may arrive as strings (e.g. "22.20")
const toNumber = (v: any): number => {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
};

// Safe money formatter using minor units
const formatMoney = (
  amountMinor: number | undefined,
  currency: string = "INR",
): string => {
  const safeAmount = Number.isFinite(amountMinor) ? amountMinor! : 0;
  const exponent = getCurrencyExponent(currency);
  const majorAmount = safeAmount / Math.pow(10, exponent);

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency,
    }).format(majorAmount);
  } catch {
    // Fallback if currency is invalid
    return `${currency} ${majorAmount.toFixed(exponent)}`;
  }
};

export default function SessionCartComponent({
  cart,
  summary,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  onEditItem,
  disabled = false,
  updatingIds,
  addingIds,
}: SessionCartProps) {
  const _updatingIds = updatingIds ?? new Set<string>();
  const _addingIds = addingIds ?? new Set<string>();
  const [showOrderReview, setShowOrderReview] = useState(false);

  // Local summary fallback (fetch when parent did not provide totals)
  const [localSummary, setLocalSummary] = useState<typeof summary>(null);

  // Memoized normalized cart id (must be declared before effects that use it)
  const cartIdNorm = useMemo(() => (cart as any)?.cart_id ?? (cart as any)?.id ?? '', [cart]);

  useEffect(() => {
    const st = summary?.totals as any;
    if (st && typeof st.total !== 'undefined') {
      // Seed with parent summary, but still fetch authoritative totals from server
      setLocalSummary(summary);
    }
    const id = cartIdNorm;
    if (!id) return;
    let aborted = false;
    (async () => {
      try {
        const tenant = (cart as any)?.tenant_id;
        const userId = (cart as any)?.user_id;
        const headers: Record<string, string> = {};
        if (tenant) headers['x-tenant-id'] = String(tenant);
        if (userId) headers['x-user-id'] = String(userId);
        const res = await fetch(`/api/cart/${encodeURIComponent(id)}`, { headers });
        if (!res.ok) return;
        const json = await res.json();
        if (!aborted) {
          const norm = {
            items: Array.isArray(json?.items) ? json.items : [],
            totals: json?.totals,
            currency: json?.currency || summary?.currency || cart?.currency || 'INR',
          } as typeof summary;
          setLocalSummary(norm);
        }
      } catch {}
    })();
    return () => { aborted = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartIdNorm, (cart as any)?.tenant_id, (cart as any)?.user_id]);

  // Optimistic quantity cache keyed by menu item id
  const [optimisticQty, setOptimisticQty] = useState<Record<string, number>>({});

  // Use unified summary for all calculations and display
  const activeSummary = localSummary?.totals ? localSummary : summary;

  // Memoize currency
  const currency = useMemo(() => activeSummary?.currency || cart?.currency || "INR", [activeSummary?.currency, cart?.currency]);


  // Helper to get optimistic qty with fallback to item qty (memoized)
  const pickQty = useCallback((id: string, serverQty: number) => {
    const q = optimisticQty[id];
    return Number.isFinite(q) ? q : serverQty;
  }, [optimisticQty]);

  // Memoized items hydration from summary/cart (with optimistic qty overlay), filter zero-qty at the source
  const items: CartItem[] = useMemo(() => {
    const mapSummary = () => (activeSummary?.items || []).map((it) => {
      const q = toNumber((it as any).qty ?? (it as any).quantity) || 1;
      const base: Partial<CartItem> = {
        id: it.menu_item_id,
        menuItemId: it.menu_item_id,
        cartId: cartIdNorm,
        name: (it.name ?? "Item") as any,
        price: toNumber(it.price),
        quantity: q,
        specialInstructions: undefined as any,
        isVegan: false,
        isVegetarian: false,
        spicyLevel: 0,
        allergens: [],
        addedAt: undefined as any,
      };
      return base as CartItem;
    });

    const mapCart = () => {
      const raw = Array.isArray(cart?.items) ? (cart!.items as any[]) : [];
      return raw.map((it) => {
        const q = toNumber((it as any).qty ?? (it as any).quantity) || 1;
        const base: Partial<CartItem> = {
          id: it.menu_item_id,
          menuItemId: it.menu_item_id,
          cartId: cartIdNorm,
          name: (it.name ?? "Item") as any,
          price: toNumber(it.price),
          quantity: q,
          specialInstructions: undefined as any,
          isVegan: false,
          isVegetarian: false,
          spicyLevel: 0,
          allergens: [],
          addedAt: undefined as any,
        };
        return base as CartItem;
      });
    };

    const rawItems = activeSummary ? mapSummary() : mapCart();

    // Merge duplicates by menu item id (sum quantities), then apply optimistic overlay
    const merged = rawItems.reduce((acc: Map<string, any>, it: any) => {
      const keyRaw = (it as any).menuItemId ?? (it as any).id;
      const key = String(keyRaw ?? '').trim();
      const q = toNumber((it as any).quantity);
      if (!key) return acc; // skip malformed rows without a stable key
      const qty = Number.isFinite(q) ? q : 1;
      if (acc.has(key)) {
        const prev = acc.get(key)!;
        acc.set(key, { ...prev, quantity: toNumber(prev.quantity) + qty });
      } else {
        acc.set(key, { ...it, quantity: qty });
      }
      return acc;
    }, new Map<string, any>());

    const list = Array.from(merged.values()).map((it: any) => {
      const id = String((it as any).menuItemId ?? (it as any).id ?? '').trim();
      const serverQty = toNumber((it as any).quantity);
      return { ...it, quantity: pickQty(id, serverQty) } as CartItem;
    });

    return list.filter((it: any) => {
      const q = toNumber((it as any).quantity);
      return (Number.isFinite(q) ? q : 1) > 0;
    });
  }, [summary, cart, optimisticQty, cartIdNorm, pickQty]);

  // Compute totals: always trust server totals when present, only compute as fallback
  const { subtotalMinor, taxMinor, totalMinor } = useMemo(() => {
    const exp = getCurrencyExponent(currency);
    const pow = Math.pow(10, exp);

    // Prefer server-provided totals (authoritative, already tax-inclusive)
    const st = activeSummary?.totals as any;
    if (st && (typeof st.total !== 'undefined')) {
      const subtotal = toNumber(st.subtotal);
      const tax = toNumber(st.tax);
      const total = toNumber(st.total);
      return {
        subtotalMinor: Math.round(subtotal * pow),
        taxMinor: Math.round(tax * pow),
        totalMinor: Math.round(total * pow),
      };
    }

    // Fallback: compute from items if server didn't send totals
    const computedSubtotal = items.reduce((acc, it) => {
      const p = toNumber((it as any).price);
      const q = Math.max(0, toNumber((it as any).quantity));
      return acc + p * q;
    }, 0);

    const subtotalMinorC = Math.round(computedSubtotal * pow);
    // Inclusive prices, tax unknown → 0 fallback
    const taxMinorC = 0;
    const totalMinorC = subtotalMinorC;

    return { subtotalMinor: subtotalMinorC, taxMinor: taxMinorC, totalMinor: totalMinorC };
  }, [currency, items, activeSummary?.totals]);

  // Memoized server-provided tax breakdown transformer
  const taxBreakdown = useMemo(() => {
    const exp = getCurrencyExponent(currency);
    const pow = Math.pow(10, exp);
    const bd = (activeSummary as any)?.totals?.tax_breakdown as Array<{ name: string; rate?: number; amount?: number }> | undefined;
    if (!bd || !Array.isArray(bd) || bd.length === 0) return [] as Array<{ name: string; amountMinor: number; rate?: number }>;
    return bd.map((b) => ({
      name: String(b.name || "Tax"),
      rate: typeof b.rate === 'number' ? b.rate : undefined,
      amountMinor: Math.round(toNumber(b.amount) * pow),
    }));
  }, [activeSummary, currency]);
  // Precompute totalQty outside JSX (fix hooks misuse)
  const totalQty = useMemo(() => items.reduce((acc, it) => acc + Math.max(0, toNumber((it as any).quantity)), 0), [items]);

  // Cleanup optimistic quantities once the server confirms changes (via props)
  useEffect(() => {
    if (!_updatingIds || _updatingIds.size === 0) {
      // Server has settled all updates; drop optimistic overlays
      setOptimisticQty({});
      return;
    }
    setOptimisticQty((prev) => {
      const next: Record<string, number> = { ...prev };
      for (const id of Object.keys(next)) {
        if (!_updatingIds.has(id)) delete next[id];
      }
      return next;
    });
  }, [_updatingIds]);

  const getDietaryIcons = (item: CartItem) => {
    const icons = [];
    if (item.isVegan)
      icons.push(
        <Leaf
          key="vegan"
          className="w-3 h-3 text-green-600"
          aria-label="Vegan"
        />,
      );
    else if (item.isVegetarian)
      icons.push(
        <Leaf
          key="vegetarian"
          className="w-3 h-3 text-green-500"
          aria-label="Vegetarian"
        />,
      );

    if (item.spicyLevel > 0) {
      icons.push(
        <div
          key="spicy"
          className="flex"
          aria-label={`Spicy Level: ${item.spicyLevel}`}
        >
          {[...Array(item.spicyLevel)].map((_, i) => (
            <Flame key={i} className="w-3 h-3 text-red-500" />
          ))}
        </div>,
      );
    }

    return icons;
  };

  const handlePlaceOrder = () => {
    if (items.length === 0) return;
    console.log("🛒 Cart - Placing order with items:", items.length);
    console.log("🛒 Cart - Total amount:", formatMoney(totalMinor, currency));
    setShowOrderReview(true);
  };

  const confirmPlaceOrder = () => {
    console.log("🛒 Cart - Confirming order placement");
    onPlaceOrder();
    setShowOrderReview(false);
  };


  // Memoized item price formatter
  const formatItemPrice = useCallback((price: number | undefined): string => {
    const safePrice = toNumber(price);
    const priceMinor = Math.round(safePrice * Math.pow(10, getCurrencyExponent(currency)));
    return formatMoney(priceMinor, currency);
  }, [currency]);

  // Memoized line total calculator
  const getLineTotal = useCallback((item: CartItem): string => {
    const safePrice = toNumber((item as any).price);
    const safeQuantity = Math.max(0, Math.floor(toNumber((item as any).quantity) || 0));
    const lineTotal = safePrice * safeQuantity;
    const lineTotalMinor = Math.round(lineTotal * Math.pow(10, getCurrencyExponent(currency)));
    return formatMoney(lineTotalMinor, currency);
  }, [currency]);

  // Memoized image resolver (snake_case and camelCase)
  const resolveImageSrc = useCallback((it: any): string | null => {
    const cand = (it?.imageUrl ?? it?.image_url ?? '') as string;
    if (!cand) return null;
    if (cand.startsWith('http://') || cand.startsWith('https://') || cand.startsWith('data:')) return cand;
    return null;
  }, []);

  // Memoized quantity decrement
  const decQty = useCallback((key: string, current: number) => {
    const next = Math.max(0, current - 1);
    setOptimisticQty((m) => ({ ...m, [key]: next }));
    onUpdateQuantity(key, next);
  }, [onUpdateQuantity]);

  // Memoized quantity increment
  const incQty = useCallback((key: string, current: number) => {
    const next = Math.min(99, current + 1);
    setOptimisticQty((m) => ({ ...m, [key]: next }));
    onUpdateQuantity(key, next);
  }, [onUpdateQuantity]);

  // Memoized item remove
  const removeItem = useCallback((key: string) => {
    setOptimisticQty((m) => ({ ...m, [key]: 0 }));
    onRemoveItem(key);
  }, [onRemoveItem]);

  // Memoized cart row component
  const CartRow = memo(function CartRow({
    cartId,
    item,
    currency,
    isItemUpdating,
    onDec,
    onInc,
    onRemove,
    formatItemPrice,
    getLineTotal,
    resolveImageSrc,
    disabled,
    locked,
    onEditItem,
  }: {
    cartId: string | undefined;
    item: CartItem;
    currency: string;
    isItemUpdating: boolean;
    onDec: (key: string, current: number) => void;
    onInc: (key: string, current: number) => void;
    onRemove: (key: string) => void;
    formatItemPrice: (p: number | undefined) => string;
    getLineTotal: (it: CartItem) => string;
    resolveImageSrc: (it: any) => string | null;
    disabled: boolean;
    locked: boolean;
    onEditItem?: (item: CartItem) => void;
  }) {
    const keyId = (item as any).menuItemId ?? (item as any).id;
    const compositeKey = `${cartId || 'cart'}:${String(keyId).trim()}`;
    return (
      <div key={compositeKey} data-menu-item-id={keyId} className="border border-gray-200 rounded-lg p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            {(() => {
              const img = resolveImageSrc(item as any);
              return img ? (
                <img
                  src={img}
                  alt={item.name || "Item"}
                  className="w-12 h-12 object-cover rounded mb-2"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.png"; }}
                />
              ) : null;
            })()}
            <h4 className="font-medium text-gray-900">{item.name || "Unknown Item"}</h4>
            <p className="text-sm text-gray-600">{formatItemPrice(item.price)} each</p>
            {item.specialInstructions && (
              <p className="text-xs text-orange-600 mt-1">Note: {item.specialInstructions}</p>
            )}
          </div>
          <div className="flex items-center space-x-1">{getDietaryIcons(item)}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onDec(keyId, toNumber((item as any).quantity) || 0)}
              disabled={disabled || locked || isItemUpdating || (toNumber((item as any).quantity) <= 0)}
              className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center font-medium">
              {(() => { const q = Number.isFinite(item.quantity) ? (item.quantity as number) : 0; return Math.max(0, q); })()}
            </span>
            <button
              onClick={() => onInc(keyId, toNumber((item as any).quantity) || 0)}
              disabled={disabled || locked || isItemUpdating}
              className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">{getLineTotal(item)}</span>
            {onEditItem && (
              <button onClick={() => onEditItem(item)} disabled={disabled || locked} className="p-1 text-gray-400 hover:text-orange-500 disabled:opacity-50">
                <Edit className="w-3 h-3" />
              </button>
            )}
            <button onClick={() => onRemove(keyId)} disabled={disabled || locked || isItemUpdating} className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-50">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  });

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Your Order</h3>
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-600">
              {totalQty} {totalQty === 1 ? "item" : "items"}
            </span>
            {cart?.status === "locked" && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                Processing
              </span>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Your cart is empty</p>
            <p className="text-sm text-gray-400">Add items to get started</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {items.filter((i) => Math.max(0, toNumber((i as any).quantity)) > 0).map((item, idx) => {
                const keyId = (item as any).menuItemId ?? (item as any).id ?? `idx-${idx}`;
                const isItemUpdating = _updatingIds.has(keyId);
                return (
                  <CartRow
                    key={`${cartIdNorm || 'cart'}:${keyId}`}
                    cartId={cartIdNorm}
                    item={item}
                    currency={currency}
                    isItemUpdating={isItemUpdating}
                    onDec={decQty}
                    onInc={incQty}
                    onRemove={removeItem}
                    formatItemPrice={formatItemPrice}
                    getLineTotal={getLineTotal}
                    resolveImageSrc={resolveImageSrc}
                    disabled={disabled}
                    locked={cart?.status === 'locked'}
                    onEditItem={onEditItem}
                  />
                );
              })}
            </div>

            <div className="border-t pt-4">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Subtotal</span>

                <div className="flex items-baseline gap-2">
                  <span className="font-medium">
                    {formatMoney(subtotalMinor, currency)}
                  </span>

                  {activeSummary?.totals?.pricing_mode === 'tax_inclusive' && taxMinor > 0 && (
                    <span className="text-xs text-gray-500">
                      (incl. tax {formatMoney(taxMinor, currency)})
                    </span>
                  )}
                </div>
              </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">
                    {formatMoney(taxMinor, currency)}
                  </span>
                </div>
                {taxBreakdown.length > 0 && (
                  <div className="space-y-1 text-xs text-gray-600">
                    {taxBreakdown.map((t, i) => (
                      <div key={`tb-${i}`} className="flex justify-between">
                        <span>{t.name}{typeof t.rate === 'number' ? ` (${Math.round(t.rate * 100)}%)` : ''}</span>
                        <span className="font-medium">{formatMoney(t.amountMinor, currency)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-orange-600">
                    {formatMoney(totalMinor, currency)}
                  </span>
                </div>
                {activeSummary?.totals?.pricing_mode && (
                  <div className="text-xs text-gray-500 text-right">
                    {activeSummary.totals.pricing_mode === 'tax_exclusive'
                      ? 'Tax exclusive (added on top)'
                      : 'Tax inclusive'}
                  </div>
                )}
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={
                  disabled || cart?.status === "locked" || items.length === 0 || !(cartIdNorm)
                }
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {cart?.status === "locked" ? (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Processing Order...</span>
                  </>
                ) : !(cartIdNorm) ? (
                  <span>Setting up session...</span>
                ) : (
                  <span>Place Order</span>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {showOrderReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Review Your Order
              </h3>
              <button
                onClick={() => setShowOrderReview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {items.map((item, idx) => (
                <div key={`${cartIdNorm || 'cart'}:${(item as any).menuItemId ?? (item as any).id ?? `idx-${idx}`}`} className="flex justify-between text-sm">
                  <span>
                    {(() => {
                      const q = Math.max(0, Math.floor(toNumber((item as any).quantity) || 0));
                      return q;
                    })()}x {item.name || "Unknown Item"}
                  </span>
                  <span>{getLineTotal(item)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-2 mb-4">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatMoney(totalMinor, currency)}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowOrderReview(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmPlaceOrder}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
