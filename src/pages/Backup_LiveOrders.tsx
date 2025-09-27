import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
// import DashboardHeader from "../components/DashboardHeader";
import { useSessionManagement } from "../hooks/useSessionManagement";
import { format } from "date-fns";

import {
  Clock,
  CheckCircle,
  ChefHat,
  Truck,
  DollarSign,
  Eye,
  Search,
  MapPin,
  Users,
  Timer,
  Flame,
  Leaf,
  Package,
  CreditCard,
  Archive,
} from "lucide-react";

// Validate UUID (v4 or generic 36-char dashed)
const isValidUuid = (v: unknown): v is string => {
  if (typeof v !== "string") return false;
// Accept standard UUIDs (any version) OR any 36-char dashed token (fallback from some backends/tests)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)) return true;
  return /^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/i.test(v);
};

export default function LiveOrders() {
  const [searchParams] = useSearchParams();
  const highlightOrderId = searchParams.get("order");

  const tenantIdFromStorage = (typeof window !== "undefined" ? (localStorage.getItem("tenant_id") || "") : "").trim();
  const tenantIdFromUrl = (typeof window !== "undefined" ? (new URLSearchParams(window.location.search).get("tenant_id") || "") : "").trim();
  const tenantId = (tenantIdFromStorage || tenantIdFromUrl);
  console.log("[LiveOrders] subscribing for tenant:", tenantId || "(missing)");

  // Live state that we can update via SSE without fighting the hook
  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [liveArchived, setLiveArchived] = useState<any[]>([]);
  const sseRef = useRef<EventSource | null>(null);

  const {
    orders,
    archivedOrders,
    loading,
  } = useSessionManagement({
    tenantId,
    locationId: "location_456",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTable, setSelectedTable] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // ---- DEBUG: layout inspection ----
  const sectionsRef = useRef<HTMLDivElement | null>(null);
  const [layoutDebug, setLayoutDebug] = useState<{
    display: string;
    flexDirection: string;
    parentDisplay?: string;
    parentFlexDirection?: string;
    grandDisplay?: string;
    grandFlexDirection?: string;
  }>({ display: "", flexDirection: "" });

  // Normalize back-end statuses to UI lanes
  const normalizeStatus = (s: string | undefined): string => {
    switch ((s || "").toLowerCase()) {
      case "pending":
        return "placed"; // backend uses 'pending' for newly placed
      case "queued":
        return "preparing"; // kitchen queued → prepping lane start
      case "processing":
        return "paying"; // payments in progress
      case "closed":
      case "archived":
      case "paid":
        return s!.toLowerCase();
      default:
        return (s || "placed").toLowerCase();
    }
  };

  // Helper: Normalize API order to UI shape
  const mapApiOrder = (api: any): any => {
    if (!api) return null;
    try {
      const o = api.order || api;
      const items = api.items || o.items || [];
      const placedAt = new Date(o.created_at || Date.now());
      const etaMin = computeEtaMinutes(items, o.eta_minutes);
      return {
        id: o.id,
        orderNumber: o.order_code || o.order_number || String(o.id).slice(0, 8),
        tableId: o.table_code || null,
        sessionId: o.session_id || "session",
        status: normalizeStatus(o.status || "placed"),
        totalAmount: Number(o.total_amount ?? o.total ?? 0),
        placedAt,
        estimatedReadyAt: new Date(placedAt.getTime() + etaMin * 60 * 1000),
        items: items.map((it: any) => ({
          name: it.name,
          quantity: it.qty ?? it.quantity ?? 1,
          unitPrice: Number(it.price ?? it.unitPrice ?? 0),
          status: it.status || "queued",
          preparation_time: it.preparation_time ?? it.preparationTime ?? undefined,
          isVegan: it.is_vegan ?? it.isVegan ?? false,
          isVegetarian: it.is_vegetarian ?? it.isVegetarian ?? false,
          spicyLevel: it.spicy_level ?? it.spicyLevel ?? 0,
        })),
      };
    } catch {
      return null;
    }
  };

  // Helper: fetch and upsert a single order by id
  const fetchAndUpsertOrder = async (id: string) => {
    if (!isValidUuid(id)) return;
    try {
      const res = await fetch(`/api/orders/${id}`, {
        headers: { "X-Tenant-Id": tenantId }
      });
      if (!res.ok) return;
      const data = await res.json();
      const mapped = mapApiOrder(data);
      if (mapped) upsertOrder(mapped);
    } catch {}
  };

  // Auto-refresh every 5 seconds when enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log("🔄 Auto-refreshing live orders");
      setSearchTerm(prev => prev);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Log computed layout for #live-orders-sections on mount
  useEffect(() => {
    const el = document.getElementById("live-orders-sections");
    if (!el) return;
    const cs = getComputedStyle(el);
    console.log("[LiveOrders] #live-orders-sections computed:", {
      display: cs.display,
      flexDirection: (cs as any).flexDirection
    });
  }, []);

  // Scroll to highlighted order
  useEffect(() => {
    if (highlightOrderId) {
      setTimeout(() => {
        const element = document.getElementById(`order-${highlightOrderId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("ring-4", "ring-blue-500", "ring-opacity-50");
          setTimeout(() => {
            element.classList.remove("ring-4", "ring-blue-500", "ring-opacity-50");
          }, 3000);
        }
      }, 500);
    }
  }, [highlightOrderId, liveOrders]);

  console.log("LiveOrders - Current orders:", liveOrders.length);
  console.log("LiveOrders - Archived orders:", liveArchived.length);

  // Sync initial orders/archivedOrders from hook into live state
  useEffect(() => {
    setLiveOrders(orders.map((o: any) => ({ ...o, status: normalizeStatus(o.status) })));
    setLiveArchived(archivedOrders.map((o: any) => ({ ...o, status: normalizeStatus(o.status) })));
  }, [orders, archivedOrders]);

  // ---- DEBUG: compute flex styles on the sections wrapper and parents
  useEffect(() => {
    const el = sectionsRef.current;
    if (!el) return;

    const readStyles = (node: Element | null) => {
      if (!node) return { display: "N/A", flexDirection: "N/A" };
      const cs = getComputedStyle(node as Element);
      return { display: cs.display, flexDirection: cs.flexDirection };
    };

    const own = readStyles(el);
    const parent = readStyles(el.parentElement);
    const grand = readStyles(el.parentElement?.parentElement || null);

    setLayoutDebug({
      display: own.display,
      flexDirection: own.flexDirection,
      parentDisplay: parent.display,
      parentFlexDirection: parent.flexDirection,
      grandDisplay: grand.display,
      grandFlexDirection: grand.flexDirection,
    });

    console.groupCollapsed("[LiveOrders][DEBUG] Layout check");
    console.log("Self  .status-sections →", own);
    console.log("Parent                →", parent, el.parentElement);
    console.log("GrandParent           →", grand, el.parentElement?.parentElement || null);
    console.log("Wrapper classList     →", Array.from(el.classList).join(" "));
    console.groupEnd();

    // Also observe class mutations (e.g., if some global script toggles classes)
    const obs = new MutationObserver(() => {
      const s = readStyles(el);
      const p = readStyles(el.parentElement);
      const g = readStyles(el.parentElement?.parentElement || null);
      setLayoutDebug({
        display: s.display,
        flexDirection: s.flexDirection,
        parentDisplay: p.display,
        parentFlexDirection: p.flexDirection,
        grandDisplay: g.display,
        grandFlexDirection: g.flexDirection,
      });
      console.log("[LiveOrders][DEBUG] Mutation observed →", {
        self: s, parent: p, grand: g, classList: Array.from(el.classList),
      });
    });
    obs.observe(el, { attributes: true, attributeFilter: ["class", "style"] });

    return () => obs.disconnect();
  }, [orders, archivedOrders]);

  // Compute average ETA (minutes) from items, fallback to provided eta or 20
  const computeEtaMinutes = (items: any[] = [], fallback: number | undefined = undefined) => {
    const times = items
      .map((it) => it.preparation_time ?? it.preparationTime ?? it.prepMinutes)
      .filter((v) => typeof v === "number" && v > 0);
    if (times.length > 0) {
      const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      return Math.max(1, avg);
    }
    if (typeof fallback === "number" && fallback > 0) return fallback;
    return 20;
  };

  // Upsert / move helpers
  const upsertOrder = (next: any) => {
    const normalized = { ...next, status: normalizeStatus(next?.status) };
    setLiveOrders((prev) => {
      const idx = prev.findIndex((o) => o.id === normalized.id);
      if (idx === -1) return [normalized, ...prev];
      const copy = prev.slice();
      copy[idx] = { ...copy[idx], ...normalized };
      return copy;
    });
  };
  const setOrderStatus = (id: string, status: string) => {
    setLiveOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };
  const archiveOrder = (id: string) => {
    setLiveOrders((prev) => {
      const idx = prev.findIndex((o) => o.id === id);
      if (idx === -1) return prev;
      const order = prev[idx];
      setLiveArchived((arch) => [{ ...order }, ...arch]);
      const copy = prev.slice();
      copy.splice(idx, 1);
      return copy;
    });
  };

  // Live subscribe to server-sent events (SSE)
  useEffect(() => {
    if (!tenantId) return;

    // Close any existing stream first
    if (sseRef.current) {
      try { sseRef.current.close(); } catch (_) {}
      sseRef.current = null;
    }

    const es = new EventSource(`/api/events/subscribe?tenant_id=${encodeURIComponent(tenantId)}`);
    sseRef.current = es;
    es.onopen = () => {
      console.log("[LiveOrders] SSE connected", { tenantId, layoutDebugAtOpen: layoutDebug });
    };

    const onCreated = (e: any) => {
      try {
        const msg = JSON.parse((e as unknown as any).data || "{}");
        const p = msg.payload || msg; // tolerate either shape
        const id = p.order_id || p.id || p.orderId;
        // If it's a valid UUID, fetch the full order to hydrate details;
        // otherwise still upsert from the payload so the card appears instantly.
        if (isValidUuid(id)) {
          fetchAndUpsertOrder(id);
        }
        const placedAt = new Date(p.placed_at || Date.now());
        const etaMin = computeEtaMinutes(p.items || [], p.eta_minutes);
        // Normalize to what this screen expects (fallback for responsiveness)
        upsertOrder({
          id,
          orderNumber: p.order_code || p.order_number || (id + "").slice(0, 8),
          tableId: p.table_code || p.tableId || null,
          sessionId: p.session_id || p.sessionId || "session",
          status: normalizeStatus("pending"),
          totalAmount: Number(p.totals?.total ?? p.total_amount ?? p.total ?? 0),
          placedAt,
          estimatedReadyAt: new Date(placedAt.getTime() + etaMin * 60 * 1000),
          items: (p.items || []).map((it: any) => ({
            name: it.name,
            quantity: it.qty ?? it.quantity ?? 1,
            unitPrice: Number(it.price ?? it.unitPrice ?? 0),
            status: "queued",
            preparation_time: it.preparation_time ?? it.preparationTime ?? undefined,
            isVegan: it.is_vegan ?? it.isVegan ?? false,
            isVegetarian: it.is_vegetarian ?? it.isVegetarian ?? false,
            spicyLevel: it.spicy_level ?? it.spicyLevel ?? 0,
          })),
        });
      } catch (_) {}
    };

    const onStatus = (status: string) => (e: any) => {
      try {
        const msg = JSON.parse((e as unknown as any).data || "{}");
        const id = msg.payload?.order_id || msg.order_id || msg.id;
        if (!isValidUuid(id)) return;
        setOrderStatus(id, normalizeStatus(status));
        fetchAndUpsertOrder(id);
        if (status === "paid" || status === "archived" || status === "closed") {
          archiveOrder(id);
        }
      } catch (_) {}
    };

    es.addEventListener("order.created", (e) => { 
      try { console.log("[LiveOrders] order.created", JSON.parse((e as any).data)); } catch(_) {}
      onCreated(e as any);
    });
    es.addEventListener("order.confirmed", onStatus("confirmed"));
    es.addEventListener("order.queued", onStatus("preparing")); // KDS 'queued' maps to preparing lane start
    es.addEventListener("order.preparing", onStatus("preparing"));
    es.addEventListener("order.ready", onStatus("ready"));
    es.addEventListener("order.served", onStatus("served"));
    es.addEventListener("order.handed_over", onStatus("delivering"));
    es.addEventListener("order.completed", onStatus("paying")); // optional intermediate
    es.addEventListener("order.paid", onStatus("paid"));
    es.addEventListener("order.archived", onStatus("archived"));

    // Some environments send `event: message` with a JSON body that has `type`
    es.onmessage = (raw) => {
      try {
        const msg = JSON.parse((raw as any).data || "{}") as any;
        const t = (msg.type || msg.event || "").toString();
        // Route to the same handlers we already registered
        if (t === "order.created") {
          // Wrap the parsed payload back into an object that matches our handler shape
          onCreated({ data: JSON.stringify(msg) } as any);
          return;
        }
        if (t.startsWith("order.")) {
          const status = t.replace("order.", ""); // e.g. confirmed, preparing, ready, paid, archived
          // Call the status handler with a synthetic event
          onStatus(status)({ data: JSON.stringify(msg) } as any);
          return;
        }
      } catch {
        // ignore malformed messages
      }
    };

    es.onerror = (err) => {
      console.warn("[LiveOrders] SSE error, will retry", err);
      try { es.close(); } catch (_) {}
      sseRef.current = null;
    };

    return () => {
      try { es.close(); } catch (_) {}
      sseRef.current = null;
    };
  }, [tenantId]);

  // Group orders by status
  const ordersByStatus = {
    placed: liveOrders.filter(o => o.status === "placed"),
    confirmed: liveOrders.filter(o => o.status === "confirmed"),
    preparing: liveOrders.filter(o => o.status === "preparing"),
    ready: liveOrders.filter(o => o.status === "ready"),
    served: liveOrders.filter(o => o.status === "served"),
  };

  const allTables = [...new Set([
    ...liveOrders.map(o => o.tableId),
    ...liveArchived.map(o => o.tableId)
  ])].filter(Boolean).sort();

  const filteredOrdersByStatus = Object.fromEntries(
    Object.entries(ordersByStatus).map(([status, statusOrders]) => [
      status,
      statusOrders.filter(order => {
        const matchesSearch = 
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.tableId?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTable = selectedTable === "all" || order.tableId === selectedTable;
        return matchesSearch && matchesTable;
      })
    ])
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "placed": return "bg-yellow-500";
      case "confirmed": return "bg-blue-500";
      case "preparing": return "bg-orange-500";
      case "ready": return "bg-green-500";
      case "delivering": return "bg-purple-500";
      case "served": return "bg-gray-500";
      case "paying": return "bg-indigo-500";
      case "paid": return "bg-emerald-500";
      case "closed": return "bg-slate-500";
      default: return "bg-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "placed": return <Clock className="w-4 h-4" />;
      case "confirmed": return <CheckCircle className="w-4 h-4" />;
      case "preparing": return <ChefHat className="w-4 h-4" />;
      case "ready": return <Package className="w-4 h-4" />;
      case "delivering": return <Truck className="w-4 h-4" />;
      case "served": return <CheckCircle className="w-4 h-4" />;
      case "paying": return <CreditCard className="w-4 h-4" />;
      case "paid": return <DollarSign className="w-4 h-4" />;
      case "closed": return <Archive className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getDietaryIcons = (item: any) => {
    const icons = [];
    if (item.isVegan) icons.push(<Leaf key="vegan" className="w-3 h-3 text-green-600" aria-label="Vegan" />);
    else if (item.isVegetarian) icons.push(<Leaf key="vegetarian" className="w-3 h-3 text-green-500" aria-label="Vegetarian" />);
    
    if (item.spicyLevel > 0) {
      icons.push(
        <div key="spicy" className="flex" aria-label={`Spicy Level: ${item.spicyLevel}`}>
          {[...Array(item.spicyLevel)].map((_, i) => (
            <Flame key={i} className="w-3 h-3 text-red-500" />
          ))}
        </div>
      );
    }
    
    return icons;
  };

  const formatElapsedTime = (placedAt: Date) => {
    const minutes = Math.floor((Date.now() - placedAt.getTime()) / (1000 * 60));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const renderOrderCard = (order: any, isHighlighted = false) => (
    <div
      id={`order-${order.id}`}
      key={order.id}
      className={`bg-white rounded-xl shadow-lg border-l-4 p-6 hover:shadow-xl transition-all h-full flex flex-col ${
        isHighlighted ? "ring-4 ring-blue-500 ring-opacity-50" : ""
      } ${
        order.priority === "urgent" ? "border-red-500 bg-red-50" :
        order.priority === "high" ? "border-orange-500 bg-orange-50" :
        "border-gray-300"
      }`}
    >
      {/* Order Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg ${getStatusColor(order.status)} flex items-center justify-center text-white`}>
            {getStatusIcon(order.status)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{order.orderNumber}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-3 h-3" />
              <span>{order.tableId}</span>
              <span>•</span>
              <Users className="w-3 h-3" />
              <span>Session #{String(order.sessionId).slice(-6)}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">
            ${(Number(order.totalAmount ?? 0)).toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">
            {formatElapsedTime(order.placedAt)}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="space-y-2 mb-4">
        {order.items.map((item: any, index: number) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {item.quantity}x {item.name}
              </span>
              <div className="flex items-center space-x-1">
                {getDietaryIcons(item)}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                ${(item.unitPrice * item.quantity).toFixed(2)}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                item.status === "queued" ? "bg-gray-500" :
                item.status === "in_progress" ? "bg-orange-500" :
                item.status === "ready_item" ? "bg-green-500" :
                item.status === "served_item" ? "bg-blue-500" :
                "bg-gray-400"
              }`}>
                {item.status.replace("_", " ").toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Special Instructions */}
      {order.specialInstructions && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-800">
            <strong>Special Instructions:</strong> {order.specialInstructions}
          </div>
        </div>
      )}

      {/* Order Timeline */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>Placed: {format(order.placedAt, "HH:mm:ss")}</div>
        {order.confirmedAt && (
          <div>Confirmed: {format(order.confirmedAt, "HH:mm:ss")}</div>
        )}
        {order.readyAt && (
          <div>Ready: {format(order.readyAt, "HH:mm:ss")}</div>
        )}
        {order.servedAt && (
          <div>Served: {format(order.servedAt, "HH:mm:ss")}</div>
        )}
        {order.paidAt && (
          <div>Paid: {format(order.paidAt, "HH:mm:ss")}</div>
        )}
      </div>

      {/* Estimated Ready Time */}
      {order.estimatedReadyAt && order.status !== "served" && order.status !== "paid" && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-blue-800">
            <Timer className="w-4 h-4" />
            <span>Est. Ready: {format(order.estimatedReadyAt, "HH:mm")}</span>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading live orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search orders or tables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Tables</option>
                {allTables.map(table => (
                  <option key={table} value={table}>{table}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Auto-refresh</span>
              </label>
              
              <div className="flex items-center space-x-1 bg-green-100 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">🔍 Live Order Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{filteredOrdersByStatus.placed.length}</div>
              <div className="text-yellow-800">Placed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredOrdersByStatus.confirmed.length}</div>
              <div className="text-blue-800">Confirmed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{filteredOrdersByStatus.preparing.length}</div>
              <div className="text-orange-800">Preparing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{filteredOrdersByStatus.ready.length}</div>
              <div className="text-green-800">Ready</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{filteredOrdersByStatus.served.length}</div>
              <div className="text-gray-800">Served</div>
            </div>
          </div>
        </div>

        {/* Layout Debug Banner (temporary) */}
        <div className="mb-4 p-3 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-sm">
          <div className="font-semibold">Layout Debug</div>
          <div>Self: display=<code>{layoutDebug.display}</code>, flexDirection=<code>{layoutDebug.flexDirection}</code></div>
          <div>Parent: display=<code>{layoutDebug.parentDisplay}</code>, flexDirection=<code>{layoutDebug.parentFlexDirection}</code></div>
          <div>Grand: display=<code>{layoutDebug.grandDisplay}</code>, flexDirection=<code>{layoutDebug.grandFlexDirection}</code></div>
          <div className="text-xs mt-1">Tip: Self should be <code>display:flex</code> and <code>flex-direction: column</code>.</div>
        </div>

        {/* Modern Card-like Vertical Stack for Order Status Sections */}
        <div
          id="live-orders-sections"
          ref={sectionsRef}
          data-debug="status-sections"
          style={{ display: "flex", flexDirection: "column" }}
          className="flex flex-col space-y-6 w-full"
        >
          {/* Placed */}
          <div className="bg-white shadow rounded-xl p-6 mb-0 transition hover:shadow-md">
            <div className="flex items-center mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-500 mr-3">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 flex items-center">
                <h2 className="font-bold text-lg text-gray-900 mr-2">Order Placed</h2>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">{filteredOrdersByStatus.placed.length}</span>
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-2">Awaiting confirmation</div>
            <div className="mt-4">
              {filteredOrdersByStatus.placed.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No orders placed yet</p>
                  <p className="text-sm text-gray-500">New orders will appear here when customers place them</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredOrdersByStatus.placed.map(order => (
                    <div key={order.id} className="h-full">
                      {renderOrderCard(order, order.id === highlightOrderId)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Confirmed */}
          <div className="bg-white shadow rounded-xl p-6 mb-0 transition hover:shadow-md">
            <div className="flex items-center mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 mr-3">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 flex items-center">
                <h2 className="font-bold text-lg text-gray-900 mr-2">Confirmed</h2>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">{filteredOrdersByStatus.confirmed.length}</span>
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-2">Sent to kitchen</div>
            <div className="mt-4">
              {filteredOrdersByStatus.confirmed.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No confirmed orders</p>
                  <p className="text-sm text-gray-500">Confirmed orders will appear here</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredOrdersByStatus.confirmed.map(order => (
                    <div key={order.id} className="h-full">
                      {renderOrderCard(order, order.id === highlightOrderId)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Preparing */}
          <div className="bg-white shadow rounded-xl p-6 mb-0 transition hover:shadow-md">
            <div className="flex items-center mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500 mr-3">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 flex items-center">
                <h2 className="font-bold text-lg text-gray-900 mr-2">Preparing</h2>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">{filteredOrdersByStatus.preparing.length}</span>
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-2">Kitchen is cooking</div>
            <div className="mt-4">
              {filteredOrdersByStatus.preparing.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No orders being prepared</p>
                  <p className="text-sm text-gray-500">Orders being cooked will appear here</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredOrdersByStatus.preparing.map(order => (
                    <div key={order.id} className="h-full">
                      {renderOrderCard(order, order.id === highlightOrderId)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ready */}
          <div className="bg-white shadow rounded-xl p-6 mb-0 transition hover:shadow-md">
            <div className="flex items-center mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500 mr-3">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 flex items-center">
                <h2 className="font-bold text-lg text-gray-900 mr-2">Ready</h2>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">{filteredOrdersByStatus.ready.length}</span>
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-2">Ready for pickup</div>
            <div className="mt-4">
              {filteredOrdersByStatus.ready.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No orders ready</p>
                  <p className="text-sm text-gray-500">Ready orders will appear here</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredOrdersByStatus.ready.map(order => (
                    <div key={order.id} className="h-full">
                      {renderOrderCard(order, order.id === highlightOrderId)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Served */}
          <div className="bg-white shadow rounded-xl p-6 mb-0 transition hover:shadow-md">
            <div className="flex items-center mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-500 mr-3">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 flex items-center">
                <h2 className="font-bold text-lg text-gray-900 mr-2">Served</h2>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold">{filteredOrdersByStatus.served.length}</span>
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-2">Delivered to table</div>
            <div className="mt-4">
              {filteredOrdersByStatus.served.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No served orders</p>
                  <p className="text-sm text-gray-500">Served orders will appear here</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredOrdersByStatus.served.map(order => (
                    <div key={order.id} className="h-full">
                      {renderOrderCard(order, order.id === highlightOrderId)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Stats */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Live Restaurant Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{liveOrders.length}</div>
              <div className="text-blue-100">Active Orders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {liveOrders.filter(o => ["preparing", "ready"].includes(o.status)).length}
              </div>
              <div className="text-blue-100">In Kitchen</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                ${liveOrders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(0)}
              </div>
              <div className="text-blue-100">Active Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {Math.round(liveOrders.length > 0 ? 
                  liveOrders.reduce((sum, o) => sum + (Date.now() - o.placedAt.getTime()), 0) / 
                  (liveOrders.length * 1000 * 60) : 0)}m
              </div>
              <div className="text-blue-100">Avg Wait Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}