import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCartStore, ContextRequiredError } from "../state/cartStore";
import { Search, Star, Clock, Leaf, Flame } from "lucide-react";
import { useMenuManagement } from "../hooks/useMenuManagement";
import { getTenantId, cartApi, taxApi, getUserId, syncUserId } from "@/lib/api";
import { menuApi } from "@/lib/api/menuApi";
// Local helper to call cartApi.get with optional userId without TS arity issues
const cartGet = (tenantId: string, cartId: string, userId?: string) => (cartApi as any).get(tenantId, cartId, userId);
import FloatingCart from '../components/cart/FloatingCart';

// Legacy keys from older flows that can corrupt state / wrong endpoints
const LEGACY_CART_KEYS = [
  "session_id",
  "session_cart_id",
  "cart_session_id",
  "session_cart_key",
  "cart_key",
  "session_mode",
];


// Normalize URL ?table= to human code (e.g., T01)
function normalizeTableParam(v: string | null) {
  if (!v) return "";
  return String(v).trim().replace(/\s+/g, "").toUpperCase();
}

// Treat an item as unavailable if either shape indicates so
function isItemUnavailable(item: any): boolean {
  return item?.isAvailable === false || (item as any)?.is_available === false;
}

// cross-shape helpers
const getSpicy = (it: any) => it?.spicyLevel ?? it?.spicy_level ?? 0;
const getPrep = (it: any) => it?.preparationTime ?? it?.preparation_time ?? null;
const getCals = (it: any) => it?.calories ?? null;
const getImage = (it: any) => it?.imageUrl ?? it?.image_url ?? "";
const getTags = (it: any): string[] => {
  const t = it?.tags;
  if (!t) return [];
  if (Array.isArray(t)) return t as string[];
  if (typeof t === "string") return t.split(/\||,|\s+/).filter(Boolean);
  return [];
};
const getAllergens = (it: any): string[] => {
  const a = it?.allergens;
  if (!a) return [];
  if (Array.isArray(a)) return a as string[];
  if (typeof a === "string") return a.split(/\||,|\s+/).filter(Boolean);
  return [];
};
const getDietaryInfo = (it: any): Record<string, boolean> =>
  it?.dietary_info && typeof it.dietary_info === "object" ? it.dietary_info : {};

// Ensure a stable public user id exists (used by cart API headers)
function ensurePublicUserId(): string {
  try {
    let uid = getUserId?.() || localStorage.getItem('kaf.publicUserId') || localStorage.getItem('user_id') || '';
    if (!uid) {
      uid = (globalThis.crypto && 'randomUUID' in globalThis.crypto)
        ? (globalThis.crypto as any).randomUUID()
        : `anon_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
      localStorage.setItem('kaf.publicUserId', uid);
    }
    if (getUserId?.() !== uid) {
      syncUserId?.(uid);
    }
    return uid;
  } catch {
    // Fallback if storage is blocked
    const uid = `anon_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
    try { localStorage.setItem('kaf.publicUserId', uid); } catch {}
    try { syncUserId?.(uid); } catch {}
    return uid;
  }
}

export default function Menu() {
  const [searchParams] = useSearchParams();
  const tableParam = useMemo(() => normalizeTableParam(searchParams.get("table")), [searchParams]);
  const source = searchParams.get("source"); // 'qr' | 'layout' | null

  const [servingTable, setServingTable] = useState<string>(tableParam);

  // Boot: hydrate cart context from localStorage once (must be inside component)
  useEffect(() => {
    try {
      useCartStore.getState().initFromStorage?.();
    } catch {}
  }, []);

  // Resolve tenant/location *once*, before any early UI branches (we will not early-return; to keep hook order stable)
  const resolvedTenantId = (localStorage.getItem("tenant_id") || getTenantId() || "").trim();
  const resolvedLocationId = localStorage.getItem("location_id") || "default";
  const hasValidTenant = /^[0-9a-fA-F-]{36}$/.test(resolvedTenantId);

  // Ensure api.ts has a user id (so X-User-Id header is sent)
  useEffect(() => {
    ensurePublicUserId();
  }, []);

  // Menu data (sections + items)
  const { sections, loading } = useMenuManagement({
    tenantId: resolvedTenantId,
    locationId: resolvedLocationId,
  });
  // Show all sections (no filtering for active state)
  const visibleSections = useMemo(() => sections, [sections]);

  // Search (debounced)
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const searchTimer = useRef<number | null>(null);
  useEffect(() => {
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 200);
    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
    };
  }, [searchInput]);

  // Category filter (declare BEFORE using in memos)
  const [selectedCategory, setSelectedCategory] = useState("all");
  // Reset selectedCategory if it points to a non-existent section
  useEffect(() => {
    if (selectedCategory !== "all" && !visibleSections.some((s) => s.id === selectedCategory)) {
      setSelectedCategory("all");
    }
  }, [visibleSections, selectedCategory]);

  // Order success modal
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);

  // Lightweight toast for "Added to cart" confirmation
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToast({ id, message });
    window.setTimeout(() => {
      setToast((t) => (t && t.id === id ? null : t));
    }, 1200);
  }, []);

  // Force re-render when cart store updates
  const [, force] = useState(0);
  useEffect(() => {
    const unsub = useCartStore.subscribe(() => force((x) => x + 1));
    return () => unsub();
  }, []);

  // Sidebar cart summary
  const [cartSummary, setCartSummary] = useState<{ items: any[]; totals?: any; currency?: string } | null>(null);
  const [taxConfig, setTaxConfig] = useState<any | null>(null);
  const [bootingCart, setBootingCart] = useState(false);
  // Helper to round to 2 decimals
  const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

  // Unified currency formatter (uses tenant/server currency only)
  const uiCurrency = useMemo(() => {
    const c = (cartSummary as any)?.currency || (taxConfig as any)?.currency || "INR";
    return typeof c === "string" && c.trim() ? c.trim().toUpperCase() : "INR";
  }, [cartSummary, taxConfig]);

  const formatCurrency = useCallback(
    (amount: number) => {
      const a = Number.isFinite(amount) ? amount : 0;
      try {
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: uiCurrency,
        }).format(a);
      } catch {
        return `${uiCurrency} ${a.toFixed(2)}`;
      }
    },
    [uiCurrency]
  );

  // Fetch tenant tax config once when tenant is valid
  useEffect(() => {
    (async () => {
      if (!hasValidTenant) return;
      try {
        const cfg = await taxApi.get(resolvedTenantId);
        setTaxConfig(cfg || null);
      } catch {
        setTaxConfig(null);
      }
    })();
  }, [hasValidTenant, resolvedTenantId]);

  // Derive inclusive-tax totals from line items
  function deriveTotals(summary: { items?: any[]; totals?: any } | null, cfg: any | null) {
    // Prefer server-provided totals (authoritative)
    if (summary?.totals) {
      const st = summary.totals as any;
      return {
        subtotal: Number(st.subtotal) || 0,
        tax: Number(st.tax) || 0,
        total: Number(st.total) || 0,
      };
    }

    // Fallback: compute from items if server didn't send totals
    const lines = summary?.items || [];
    const gross = lines.reduce((acc: number, it: any) => {
      const price = parseFloat(String(it.price ?? 0)) || 0;
      const qty = parseFloat(String(it.qty ?? it.quantity ?? 0)) || 0;
      return acc + price * qty;
    }, 0);

    const totalRatePct = Number(cfg?.total_rate ?? 0);
    const rate = totalRatePct / 100;
    if (gross <= 0 || rate < 0) {
      return { subtotal: r2(gross), tax: 0, total: r2(gross) };
    }
    const net = gross / (1 + rate);
    const tax = gross - net;
    return { subtotal: r2(net), tax: r2(tax), total: r2(gross) } as any;
  }

  // Fine-grained, per-item in-flight guards
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const withAdding = useCallback(async (id: string, fn: () => Promise<void>) => {
    setAddingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    try {
      await fn();
    } finally {
      setAddingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, []);

  const withUpdating = useCallback(async (id: string, fn: () => Promise<void>) => {
    setUpdatingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    try {
      await fn();
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, []);

  // Clean legacy keys on mount
  useEffect(() => {
    try {
      LEGACY_CART_KEYS.forEach((k) => localStorage.removeItem(k));
      const cid = localStorage.getItem("cart_id");
      if (cid && /^session_/.test(cid)) localStorage.removeItem("cart_id");
    } catch {}
  }, []);


  // Hydrate existing cart on mount
  useEffect(() => {
    (async () => {
      if (!hasValidTenant) return;
      const cid = useCartStore.getState().cartId || "";
      if (cid && !/^session_/.test(cid)) {
        try {
          useCartStore.getState().setServerContext(resolvedTenantId, {
            mode: tableParam ? "table" : "takeaway",
            tableCode: tableParam || null,
            cartId: cid,
            userId: ensurePublicUserId(),
          });
          await useCartStore.getState().reloadFromServer();
          setCartSummary(useCartStore.getState().summary || null);
        } catch {
          // ignore and let ensureCartReady create one later
        }
      }
    })();
  }, [resolvedTenantId, hasValidTenant, tableParam]);

  // Ensure cart context is seeded at least once
  useEffect(() => {
    if (!hasValidTenant) return;
    const st = useCartStore.getState();
    if (!st.tenantId) {
      st.setServerContext(resolvedTenantId, {
        mode: tableParam ? "table" : "takeaway",
        tableCode: tableParam || null,
        userId: ensurePublicUserId(),
      });
    }
  }, [resolvedTenantId, hasValidTenant, tableParam]);

  // Cross-tab sync
  useEffect(() => {
    // current scope key (tenant + tableCode/anon), matches cartStore.ts namespacing
    const scope = tableParam || 'anon';
    const nsKey = hasValidTenant ? `cart_id:${resolvedTenantId}:${scope}` : 'cart_id';

    const onStorage = (e: StorageEvent) => {
      if (!e || !e.key) return;

      // Accept either the exact namespaced key for this scope OR the legacy key for backward compatibility
      const isForThisScope = e.key === nsKey || e.key === 'cart_id';
      if (!isForThisScope) return;

      const incomingId = e.newValue || '';
      if (!incomingId || incomingId === useCartStore.getState().cartId) return;

      useCartStore.getState().setServerContext(resolvedTenantId, {
        mode: tableParam ? 'table' : 'takeaway',
        tableCode: tableParam || null,
        cartId: incomingId,
        userId: ensurePublicUserId(),
      });

      cartGet(resolvedTenantId, incomingId, ensurePublicUserId())
        .then(setCartSummary)
        .catch(() => {});
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [resolvedTenantId, tableParam, hasValidTenant]);

  // Auto-start a cart if none exists
  useEffect(() => {
    (async () => {
      if (!hasValidTenant) return;
      try {
        await useCartStore.getState().ensureCartReady?.();
      } catch (e) {
        console.error("ensureCartReady failed:", e);
      }
    })();
  }, [hasValidTenant]);

  // Update header when table changes
  useEffect(() => {
    if (tableParam) setServingTable(tableParam);
  }, [tableParam]);

  // Categories and items
  const categories = useMemo(
    () => [{ id: "all", name: "All Items" }, ...visibleSections.map((s) => ({ id: s.id, name: s.name }))],
    [visibleSections]
  );
  const allItems = useMemo(() => visibleSections.flatMap((s) => s.items || []), [visibleSections]);

  // Wire menu catalog into cart store catalog cache
  useEffect(() => {
    try {
      const setCatalog = useCartStore.getState().setCatalog;
      const entries = Object.fromEntries(
        (allItems || [])
          .map((it: any) => {
            const id = String(it?.id ?? it?.menu_item_id ?? '').trim();
            if (!id) return null;
            const priceNum = typeof it.price === 'number' ? it.price : parseFloat(String(it.price ?? 0)) || 0;
            return [id, { price: priceNum, name: it?.name ?? '' }];
          })
          .filter(Boolean) as any
      );
      if (entries && Object.keys(entries).length) setCatalog(entries);
    } catch {}
  }, [allItems]);

  const filteredItems = useMemo(() => {
    const term = debouncedSearch.toLowerCase();
    return allItems.filter((item: any) => {
      const sid = String(item.sectionId ?? item.section_id ?? "");
      const inCategory = selectedCategory === "all" || sid === selectedCategory;
      if (!inCategory) return false;

      if (onlyAvailable && isItemUnavailable(item)) return false;

      if (!term) return true;
      const name = String(item.name || "");
      const desc = String(item.description || "");
      return name.toLowerCase().includes(term) || desc.toLowerCase().includes(term);
    });
  }, [allItems, debouncedSearch, selectedCategory, onlyAvailable]);

  // Item Details Modal state
  const [detailsItem, setDetailsItem] = useState<any | null>(null);
  const openItemDetails = useCallback((item: any) => setDetailsItem(item), []);
  const closeItemDetails = useCallback(() => setDetailsItem(null), []);

  // Takeaway prompt state (for direct menu access without table)
  const [showTakeawayPrompt, setShowTakeawayPrompt] = useState(false);
  const pendingItemRef = useRef<any>(null);

  const confirmTakeawayProceed = useCallback(async () => {
    try {
      localStorage.setItem('kaf.takeaway_ack', '1');
      // Ensure context is set to takeaway explicitly
      const pubUid = ensurePublicUserId();
      useCartStore.getState().setServerContext(resolvedTenantId, {
        mode: 'takeaway',
        tableCode: null,
        userId: pubUid,
      });

      const pending = pendingItemRef.current;
      if (pending) {
        const pid = String(pending.id ?? pending.menu_item_id ?? '').trim();
        if (pid) {
          await withAdding(pid, async () => {
            try {
              await useCartStore.getState().add(pid, 1);
              showToast('Added to cart');
            } catch (e) {
              console.error('Failed after takeaway confirm (store.add):', e);
              alert('Failed to add item to cart');
            }
          });
        }
      }
    } finally {
      pendingItemRef.current = null;
      setShowTakeawayPrompt(false);
    }
  }, [resolvedTenantId, withAdding, showToast]);

  // Cart actions
  const handleAddToCart = useCallback(
    async (item: any) => {
      const itemId = String(item?.id ?? (item as any)?.menu_item_id ?? '').trim();
      if (!itemId || isItemUnavailable(item)) return;

      // Avoid stacking clicks for the same item while it's in-flight
      if (addingIds.has(itemId) || updatingIds.has(itemId)) return;

      // If user is not at a table (direct menu access) and hasn't acknowledged, show Takeaway prompt
      const takeawayAck = localStorage.getItem('kaf.takeaway_ack') === '1';
      if (!tableParam && !takeawayAck) {
        pendingItemRef.current = item;
        setShowTakeawayPrompt(true);
        return; // wait for user to confirm, then we proceed in confirmTakeawayProceed
      }

      // Seed context if not set or if userId missing
      const pubUid = ensurePublicUserId();
      if (!useCartStore.getState().tenantId || !useCartStore.getState().userId) {
        useCartStore.getState().setServerContext(resolvedTenantId, {
          mode: tableParam ? "table" : "takeaway",
          tableCode: tableParam || null,
          userId: pubUid,
        });
      }

      const attemptAdd = async () => {
        await useCartStore.getState().add(String(itemId), 1);
      };

      await withAdding(itemId, async () => {
        try {
          await attemptAdd();
          showToast('Added to cart');
        } catch (e: any) {
          const isCtxErr = e instanceof ContextRequiredError || e?.name === 'ContextRequiredError' || /ContextRequiredError/i.test(String(e?.message || ''));
          const status = e?.status ?? e?.code ?? e?.response?.status;

          // If the server says the cart is gone, clear locally, bootstrap, and retry once
          if (status === 404) {
            try {
              useCartStore.getState().clearAfterCheckout?.();
            } catch {}
            try {
              await useCartStore.getState().ensureCartReady?.(true);
              await useCartStore.getState().add(String(itemId), 1);
              return;
            } catch {}
          }

          if (isCtxErr) {
            alert("Please scan the table QR or choose Takeaway to start.");
            return;
          }

          console.error("Failed to add to cart:", e);
          alert("Failed to add item to cart");
        }
      });
    },
    [resolvedTenantId, withAdding, addingIds, updatingIds, cartSummary, tableParam]
  );

  const handleUpdateCartQuantity = useCallback(
    async (itemId: string, newQty: number) => {
      if (!itemId) return;
      await withUpdating(String(itemId), async () => {
        try {
          await useCartStore.getState().updateQty(itemId, newQty);
        } catch (e) {
          console.error("Failed to update quantity:", e);
          alert("Failed to update quantity");
        }
      });
    },
    [resolvedTenantId, withUpdating]
  );

  const handleRemoveFromCart = useCallback(
    async (itemId: string) => {
      if (!itemId) return;
      await withUpdating(String(itemId), async () => {
        try {
          await useCartStore.getState().remove(itemId);
        } catch (e) {
          console.error("Failed to remove item:", e);
          alert("Failed to remove item");
        }
      });
    },
    [resolvedTenantId, withUpdating]
  );

  const handlePlaceOrder = useCallback(async () => {
    try {
      // Ensure cart exists and is ready
      await useCartStore.getState().ensureCartReady?.();

      // Perform checkout via store (which also clears local cart on success)
      const resp = await useCartStore.getState().checkout();
      const orderId = (resp as any)?.order_id || (resp as any)?.orderId || (resp as any)?.id;

      setPlacedOrder({ id: orderId ?? "unknown" });
      setShowOrderSuccess(true);  

      // Clear sidebar summary immediately; store has already cleared ids/state
      setCartSummary(null);

      // Optional redirect to live orders after a short confirmation delay
      setTimeout(() => {
        if (orderId) window.location.href = `/live-orders?order=${orderId}`;
      }, 2000);
    } catch (e) {
      console.error("Failed to place order:", e);
      alert("Failed to place order");
    }
  }, []);

  // Adapt server cart line items to SessionCartComponent expected shape
  function adaptCartItems(lines: any[] | undefined) {
    if (!Array.isArray(lines)) return [];
    const mapped = lines.map((it) => ({
      id: it.menu_item_id ?? it.id,
      name: it.name ?? "",
      price: parseFloat(String(it.price)) || 0,
      quantity: Math.max(0, parseInt(String(it.qty ?? it.quantity ?? 0), 10) || 0),
      specialInstructions: it.special_instructions ?? "",
      isVegan: Boolean(it.isVegan ?? false),
      isVegetarian: Boolean(it.isVegetarian ?? false),
      spicyLevel: Number(getSpicy(it) ?? 0) || 0,
    }));
    return mapped.filter((x) => (Number.isFinite(x.quantity) ? x.quantity! : 0) > 0);
  }

  // Adapt server cart summary to SessionCartComponent expected shape
  const cartForSidebar = useMemo(() => {
    return {
      id: useCartStore.getState().cartId || "cart",
      sessionId: useCartStore.getState().cartId || "cart",
      tenantId: resolvedTenantId,
      locationId: resolvedLocationId,
      mode: tableParam ? "table" : "takeaway",
      status: "open",
      items: adaptCartItems(cartSummary?.items),
      totals: deriveTotals(cartSummary, taxConfig),
      currency: uiCurrency,
    } as any;
  }, [cartSummary, resolvedTenantId, resolvedLocationId, tableParam, taxConfig, uiCurrency]);

  // --------- RENDER (single return to keep hook order stable across hot reloads) ----------
  return (
    <div className="min-h-screen">
      <Header />

      {/* TENANT NOT SET BANNER */}
      {!hasValidTenant && (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-gray-800 font-semibold">Tenant not set</p>
            <p className="text-gray-600 text-sm">
              Please set <code>tenant_id</code> in localStorage and reload.
            </p>
            <pre className="bg-gray-100 text-gray-700 p-3 rounded text-xs inline-block text-left">
{`localStorage.setItem('tenant_id','550e8400-e29b-41d4-a716-446655440000');\nlocation.reload();`}
            </pre>
          </div>
        </div>
      )}

      {/* Page content only renders when tenant is set */}
      {hasValidTenant && (
        <>
          {/* Hero Section */}
          <section className="relative h-64 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" />
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url(https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920)",
              }}
            />
            <div className="relative z-10 text-center text-white">
              <h1 className="text-5xl font-bold mb-4">Our Menu</h1>
              <p className="text-xl">Discover our culinary masterpieces</p>
              {!tableParam && (
                <div className="mt-3">
                  <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                    <span className="w-2 h-2 bg-orange-300 rounded-full" />
                    Takeaway order
                  </span>
                </div>
              )}

              {servingTable && (
                <div className="mt-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 inline-block">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-lg font-semibold">Now serving to Table {servingTable}</span>
                      {source === "qr" && (
                        <span className="bg-blue-500/80 text-white px-2 py-1 rounded-full text-xs">QR Scanned</span>
                      )}
                      {source === "layout" && (
                        <span className="bg-purple-500/80 text-white px-2 py-1 rounded-full text-xs">Table Selected</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm">Live Menu - Synced with Kitchen</span>
              </div>
            </div>
          </section>

          {/* LOADING STRIP */}
          {loading && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" aria-hidden="true">
              {/* Skeleton: mirrors 4-column menu card grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-pulse">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={`sk-${i}`} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="w-full h-48 bg-gray-200" />
                    <div className="p-6 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="h-5 w-2/3 bg-gray-200 rounded" />
                        <div className="h-6 w-16 bg-gray-200 rounded" />
                      </div>
                      <div className="h-4 w-full bg-gray-200 rounded" />
                      <div className="h-4 w-5/6 bg-gray-200 rounded" />
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-12 bg-gray-200 rounded" />
                          <div className="h-4 w-10 bg-gray-200 rounded" />
                        </div>
                        <div className="h-4 w-16 bg-gray-200 rounded" />
                      </div>
                      <div className="h-10 w-full bg-gray-200 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div>
              {/* Main Menu */}
              <div className="flex-1">
                {/* Search */}
                <div className="mb-8 flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex-1 relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search menu items..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 select-none">
                    <input
                      type="checkbox"
                      checked={onlyAvailable}
                      onChange={(e) => setOnlyAvailable(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    Only available
                  </label>
                </div>

                {/* Category Filter */}
                <div className="mb-8 flex flex-wrap gap-2">
                  {[{ id: "all", name: "All Items" }, ...visibleSections.map((s) => ({ id: s.id, name: s.name }))].map(
                    (category) => (
                      <button
                        key={`cat-${category.id}`}
                        onClick={() =>
                          setSelectedCategory((prev) => (prev === category.id ? "all" : category.id))
                        }
                        aria-pressed={selectedCategory === category.id}
                        className={`px-6 py-2 rounded-full font-medium transition-colors ${
                          selectedCategory === category.id
                            ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {category.name}
                      </button>
                    )
                  )}
                </div>

                {/* Menu Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {filteredItems.map((item: any) => (
                    <div
                      key={String(item.id ?? (item as any)?.menu_item_id ?? `item-${Math.random().toString(36).slice(2)}`)}
                      role="button"
                      tabIndex={0}
                      onClick={() => setDetailsItem(item)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setDetailsItem(item);
                        }
                      }}
                      className={`bg-white rounded-xl shadow-lg overflow-hidden transition-shadow ${
                        isItemUnavailable(item) ? "opacity-60" : "hover:shadow-xl"
                      } cursor-pointer`}
                    >
                      <div className="relative">
                        <img
                          src={
                            (getImage(item) && !String(getImage(item)).startsWith("blob:") ? getImage(item) : "") ||
                            (item.imageUrl && !String(item.imageUrl).startsWith("blob:") ? item.imageUrl : "") ||
                            "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&amp;auto=format&amp;fit=crop&amp;w=1200&amp;h=800"
                          }
                          alt={item.name}
                          loading="lazy"
                          className={`w-full h-48 object-cover ${isItemUnavailable(item) ? "grayscale" : ""}`}
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">4.8</span>
                          </div>
                        </div>
                        {isItemUnavailable(item) && (
                          <div className="absolute bottom-4 left-4">
                            <span className="bg-gray-800/80 text-white px-2 py-1 rounded-full text-xs font-medium">
                              Unavailable
                            </span>
                          </div>
                        )}
                        {getTags(item).includes("popular") && (
                          <div className="absolute top-4 left-4">
                            <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                              Popular
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                          <span className="text-2xl font-bold text-orange-600">
                            {formatCurrency(
                              typeof item.price === "number"
                                ? (item.price as number)
                                : parseFloat(String(item.price ?? 0))
                            )}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-4">{item.description}</p>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            {getPrep(item) && (
                              <>
                                <Clock className="w-4 h-4" />
                                <span>{getPrep(item)} min</span>
                              </>
                            )}
                            {getCals(item) && <span>{getCals(item)} cal</span>}
                          </div>
                          <div className="flex items-center space-x-2">
                            {item.isVegan || item.isVegetarian ? <Leaf className="w-4 h-4 text-green-600" /> : null}
                            {getSpicy(item) > 0 && (
                              <div className="flex items-center">
                                {[...Array(getSpicy(item))].map((_, i) => (
                                  <Flame key={i} className="w-3 h-3 text-red-500" />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 mb-4">
                          {getTags(item)
                            .slice(0, 3)
                            .map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(item);
                          }}
                          disabled={
                            isItemUnavailable(item) ||
                            addingIds.has(String(item?.id ?? (item as any)?.menu_item_id ?? ''))
                          }
                          className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl hover:from-orange-600 hover:to-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isItemUnavailable(item)
                            ? "Unavailable"
                            : addingIds.has(String(item?.id ?? (item as any)?.menu_item_id ?? ''))
                            ? "Adding..."
                            : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredItems.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No menu items found matching your criteria.</p>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Item Details Modal */}
          {detailsItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50" onClick={closeItemDetails} />
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
                {getImage(detailsItem) ? (
                  <div className="h-56 w-full overflow-hidden">
                    <img
                      src={
                        (getImage(detailsItem) && !String(getImage(detailsItem)).startsWith("blob:")
                          ? getImage(detailsItem)
                          : "") ||
                        (detailsItem.imageUrl && !String(detailsItem.imageUrl).startsWith("blob:")
                          ? detailsItem.imageUrl
                          : "") ||
                        "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&auto=format&fit=crop&w=1200&h=800"
                      }
                      alt={detailsItem.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : null}

                <button
                  onClick={closeItemDetails}
                  className="absolute top-3 right-3 inline-flex items-center justify-center h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow"
                  aria-label="Close"
                >
                  ×
                </button>

                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-2xl font-semibold text-gray-900">{detailsItem.name}</h3>
                    <span className="text-2xl font-bold text-orange-600">
                      {formatCurrency(
                        typeof detailsItem.price === "number"
                          ? (detailsItem.price as number)
                          : parseFloat(String(detailsItem.price ?? 0))
                      )}
                    </span>
                  </div>

                  {detailsItem.description && (
                    <p className="text-gray-700 leading-relaxed">{detailsItem.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    {getPrep(detailsItem) && (
                      <span className="inline-flex items-center gap-2">
                        <Clock className="w-4 h-4" /> {getPrep(detailsItem)} min
                      </span>
                    )}
                    {getCals(detailsItem) && <span>{getCals(detailsItem)} cal</span>}
                    {getSpicy(detailsItem) > 0 && (
                      <span className="inline-flex items-center gap-1">
                        {[...Array(getSpicy(detailsItem))].map((_, i) => (
                          <Flame key={i} className="w-4 h-4 text-red-500" />
                        ))}
                      </span>
                    )}
                  </div>

                  {Object.keys(getDietaryInfo(detailsItem)).length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Dietary information</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(getDietaryInfo(detailsItem))
                          .filter(([, v]) => !!v)
                          .map(([k]) => (
                            <span
                              key={k}
                              className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200"
                            >
                              {String(k).replace(/_/g, " ")}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {getTags(detailsItem).length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {getTags(detailsItem).map((t, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {getAllergens(detailsItem).length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Allergens</h4>
                      <div className="flex flex-wrap gap-2">
                        {getAllergens(detailsItem).map((a, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full border border-red-200"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(detailsItem);
                        closeItemDetails();
                      }}
                      disabled={
                        isItemUnavailable(detailsItem) ||
                        addingIds.has(String(detailsItem?.id ?? (detailsItem as any)?.menu_item_id ?? ''))
                      }
                      className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl hover:from-orange-600 hover:to-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isItemUnavailable(detailsItem)
                        ? "Unavailable"
                        : addingIds.has(String(detailsItem?.id ?? (detailsItem as any)?.menu_item_id ?? ''))
                        ? "Adding..."
                        : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Takeaway Confirmation Modal */}
          {showTakeawayPrompt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowTakeawayPrompt(false)} />
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">Take away</h3>
                  <p className="text-gray-700">You're ordering without a table. We'll proceed as a <span className="font-medium">Takeaway</span> order.</p>
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => setShowTakeawayPrompt(false)}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => void confirmTakeawayProceed()}
                      className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                      type="button"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <FloatingCart />
        </>
      )}

      {/* Snack toast */}
      {toast && (
        <div className="fixed inset-x-0 bottom-6 z-[60] flex justify-center pointer-events-none">
          <div className="pointer-events-auto bg-black/80 text-white text-sm px-4 py-2 rounded-full shadow-lg">
            {toast.message}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}