import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSessionManagement } from "../hooks/useSessionManagement";
import {
  ChefHat,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Bell,
  Search,
  Users,
  DollarSign,
  TrendingUp,
  BarChart3,
  X,
  Archive,
  Package,
  CreditCard,
  Truck,
  UserPlus,
  AlertTriangle,
  ShoppingCart,
  CornerUpLeft,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";

type OrderEvent =
  | "order.created"
  | "order.confirmed"
  | "order.queued"
  | "order.preparing"
  | "order.ready"
  | "order.served"
  | "order.delivering"
  | "order.paying"
  | "order.paid"
  | "order.cancelled"
  | "order.archived";

function getTenantId(): string {
  const fromStorage =
    (typeof window !== "undefined" &&
      (localStorage.getItem("tenant_id") || localStorage.getItem("tenantId"))) ||
    "";
  const fromEnv = (import.meta as any)?.env?.VITE_TENANT_ID || "";
  return fromStorage || fromEnv || "550e8400-e29b-41d4-a716-446655440000";
}

async function fetchOrderDetail(orderId: string) {
  const tenantId = getTenantId();
  const res = await fetch(`/api/orders/${orderId}`, {
    headers: { "X-Tenant-Id": tenantId },
  });
  if (!res.ok) throw new Error(`fetch order ${orderId} failed: ${res.status}`);
  const data = await res.json();
  return data?.order;
}


export default function OrderManagement() {
  const {
    orders,
    archivedOrders,
    confirmOrder,
    cancelOrder,
    markOrderServed,
    assignStaffToOrder,
    markOrderForDelivery,
    initiatePayment,
    markOrderPaid,
    loading,
  } = useSessionManagement({
  tenantId: getTenantId(),
  locationId:
    (typeof window !== "undefined" &&
      (localStorage.getItem("location_id") || localStorage.getItem("locationId"))) ||
    "default",
  });

  // Local, event-driven mirrors to allow SSE upserts without changing the hook
  const [liveOrders, setLiveOrders] = useState(orders);
  const [liveArchived, setLiveArchived] = useState(archivedOrders);

  useEffect(() => {
  const tenantId = getTenantId();
  const es = new EventSource(`/api/events/subscribe?tenant_id=${tenantId}`);

  const upsertOrder = (order: any) => {
    setLiveOrders((prev) => {
      const idx = prev.findIndex((o) => o.id === order.id);
      if (idx === -1) return [order, ...prev];
      const next = [...prev];
      next[idx] = { ...next[idx], ...order };
      return next;
    });
  };

  const moveToArchiveIfFinal = (order: any) => {
    const finals = new Set(["paid", "cancelled", "closed"]);
    if (!finals.has(order.status)) return;
    setLiveOrders((prev) => prev.filter((o) => o.id !== order.id));
    setLiveArchived((prev) => (prev.some((o) => o.id === order.id) ? prev : [order, ...prev]));
  };

  const onEvent = async (ev: MessageEvent) => {
    if (!ev?.data) return;
    try {
      const msg = JSON.parse(ev.data);
      const type: OrderEvent | string = msg?.event;
      const payload = msg?.payload || {};
      const orderId: string = payload?.order_id || payload?.id;
      if (!type || !orderId) return;

      const order = await fetchOrderDetail(orderId);
      if (!order) return;

      upsertOrder(order);
      moveToArchiveIfFinal(order);
    } catch {
      // swallow parse/network errors
    }
  };

  const names: OrderEvent[] = [
    "order.created",
    "order.confirmed",
    "order.queued",
    "order.preparing",
    "order.ready",
    "order.served",
    "order.delivering",
    "order.paying",
    "order.paid",
    "order.cancelled",
    "order.archived",
  ];
  names.forEach((n) => es.addEventListener(n, onEvent as any));
  es.addEventListener("message", onEvent as any); // fallback

  es.onerror = () => {
    // let browser auto-reconnect
  };

  return () => {
    try {
      es.close();
    } catch {}
  };
}, []);

  // Keep mirrors in sync when the hook updates (poll/initial load)
  useEffect(() => {
    setLiveOrders(orders);
  }, [orders]);

  useEffect(() => {
    setLiveArchived(archivedOrders);
  }, [archivedOrders]);

  const [selectedStatus, setSelectedStatus] = useState("active");
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStaffAssignModal, setShowStaffAssignModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "digital">("card");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [quickOpen, setQuickOpen] = useState(false);

  const [archiving, setArchiving] = useState(false);

  const archiveOldOrders = useCallback(async () => {
    try {
      setArchiving(true);
      const res = await fetch('/api/orders/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beforeDays: 7, statuses: ['paid','served','cancelled'] })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Archive failed: ${data?.error || res.status}`);
        return;
      }
      alert(`Archived ${data.archived || 0} orders (last ${data.beforeDays} days).`);
      // Optional: refresh current view if your hook reacts to backend changes
      // window.location.reload();
    } catch (e: any) {
      alert(`Archive error: ${e?.message || e}`);
    } finally {
      setArchiving(false);
    }
  }, []);

  // Mock staff data
  const availableStaff = [
    { id: "staff_1", name: "Sarah Johnson", role: "Waiter" },
    { id: "staff_2", name: "Mike Chen", role: "Waiter" },
    { id: "staff_3", name: "Emma Davis", role: "Runner" },
    { id: "staff_4", name: "James Wilson", role: "Host" },
  ];

  const statusCounts = {
    active: liveOrders.filter((o) =>
      ["placed", "confirmed", "preparing", "ready", "served", "delivering", "paying"].includes(o.status)
    ).length,
    placed: liveOrders.filter((o) => o.status === "placed").length,
    confirmed: liveOrders.filter((o) => o.status === "confirmed").length,
    preparing: liveOrders.filter((o) => o.status === "preparing").length,
    ready: liveOrders.filter((o) => o.status === "ready").length,
    served: liveOrders.filter((o) => o.status === "served").length,
    delivering: liveOrders.filter((o) => o.status === "delivering").length,
    paying: liveOrders.filter((o) => o.status === "paying").length,
    archived: liveArchived.length,
  };

  const currentOrders = activeTab === "active" ? liveOrders : liveArchived;

  const filteredOrders = currentOrders.filter((order) => {
    const matchesStatus = activeTab === "active" 
      ? (selectedStatus === "active" 
          ? ["placed", "confirmed", "preparing", "ready", "served", "delivering", "paying"].includes(order.status)
          : order.status === selectedStatus)
      : ["paid", "served", "cancelled"].includes(order.status);
    
    const idText =
      order.orderNumber?.toLowerCase?.() ||
      (order as any).order_code?.toLowerCase?.() ||
      (order as any).code?.toLowerCase?.() ||
      `order-${order.id?.slice?.(-6)}`;

    const tableText =
      (order as any).tableId?.toLowerCase?.() ||
      (order as any).table_code?.toLowerCase?.() ||
      "";

    const matchesSearch =
      idText.includes(searchTerm.toLowerCase()) ||
      tableText.includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "placed": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "preparing": return "bg-orange-100 text-orange-800";
      case "ready": return "bg-green-100 text-green-800";
      case "served": return "bg-gray-100 text-gray-800";
      case "delivering": return "bg-purple-100 text-purple-800";
      case "paying": return "bg-indigo-100 text-indigo-800";
      case "paid": return "bg-emerald-100 text-emerald-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "placed": return <Clock className="w-4 h-4" />;
      case "confirmed": return <CheckCircle className="w-4 h-4" />;
      case "preparing": return <ChefHat className="w-4 h-4" />;
      case "ready": return <Package className="w-4 h-4" />;
      case "served": return <CheckCircle className="w-4 h-4" />;
      case "delivering": return <Truck className="w-4 h-4" />;
      case "paying": return <CreditCard className="w-4 h-4" />;
      case "paid": return <DollarSign className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    try {
      await confirmOrder(orderId, "manager_123");
      console.log("✅ Order confirmed from management");
    } catch (err) {
      alert("Failed to confirm order");
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrderId || !cancelReason.trim()) return;

    try {
      await cancelOrder(selectedOrderId, cancelReason, "manager_123");
      setShowCancelModal(false);
      setCancelReason("");
      setSelectedOrderId(null);
      console.log("✅ Order cancelled from management");
    } catch (err) {
      alert("Failed to cancel order");
    }
  };

  const handleServeOrder = async (orderId: string) => {
    try {
      await markOrderServed(orderId, "staff_123");
      console.log("✅ Order marked as served");
    } catch (err) {
      alert("Failed to mark order as served");
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedOrderId || !selectedStaff) return;

    try {
      const staff = availableStaff.find((s) => s.id === selectedStaff);
      if (!staff) return;

      await assignStaffToOrder(selectedOrderId, selectedStaff, staff.name);
      setShowStaffAssignModal(false);
      setSelectedOrderId(null);
      setSelectedStaff("");
      console.log("✅ Staff assigned successfully");
    } catch (err) {
      alert("Failed to assign staff");
    }
  };

  const handleMarkForDelivery = async (orderId: string) => {
    try {
      await markOrderForDelivery(orderId, "staff_123");
      console.log("✅ Order marked for delivery");
    } catch (err) {
      alert("Failed to mark for delivery");
    }
  };

  const handleInitiatePayment = async (orderId: string) => {
    try {
      await initiatePayment(orderId, "manager_123");
      console.log("✅ Payment initiated");
    } catch (err) {
      alert("Failed to initiate payment");
    }
  };

  const handleMarkPaid = async () => {
    if (!selectedOrderId) return;

    try {
      await markOrderPaid(selectedOrderId, paymentMethod, "manager_123");
      setShowPaymentModal(false);
      setSelectedOrderId(null);
      console.log("✅ Order marked as paid and archived");
    } catch (err) {
      alert("Failed to mark order as paid");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          {/* Left: Title & Subtitle */}
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-lg bg-blue-50 p-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-500">All orders</p>
            </div>
          </div>

          {/* Right: Dashboard (orange pill) + Quick actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-600 hover:bg-orange-700 text-white shadow transition-colors"
              aria-label="Back to Dashboard"
            >
              <CornerUpLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            {/* Quick actions dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setQuickOpen((v) => !v)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                aria-haspopup="menu"
                aria-expanded={quickOpen ? 'true' : 'false'}
              >
                Quick actions
                <ChevronDown className="w-4 h-4 opacity-80" />
              </button>

              {quickOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden z-20"
                >
                  <nav className="py-2 text-sm text-gray-900">
                    <Link to="/dashboard" className="block px-4 py-2.5 hover:bg-gray-50">Dashboard</Link>
                    <Link to="/menu-management" className="block px-4 py-2.5 hover:bg-gray-50">Menu Management</Link>
                    <Link to="/orders" className="block px-4 py-2.5 hover:bg-gray-50">View Orders</Link>
                    <Link to="/table-management" className="block px-4 py-2.5 hover:bg-gray-50">Table Management</Link>
                    <Link to="/staff" className="block px-4 py-2.5 hover:bg-gray-50">Staff Management</Link>
                    <Link to="/kds" className="block px-4 py-2.5 hover:bg-gray-50">Kitchen Dashboard</Link>
                    <Link to="/analytics" className="block px-4 py-2.5 hover:bg-gray-50">Analytics</Link>
                    <Link to="/settings" className="block px-4 py-2.5 hover:bg-gray-50">Settings</Link>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.active}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Kitchen</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statusCounts.preparing + statusCounts.ready}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${[...liveOrders, ...liveArchived]
                    .filter((o) => ["paid", "served"].includes(o.status))
                    .reduce((sum, o: any) => sum + Number(o.totalAmount ?? o.total_amount ?? o.total ?? 0), 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.archived}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Archive className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Debug Panel */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h4 className="font-medium text-blue-900 mb-2">📊 Real-time Order Status</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 text-sm text-blue-800">
            <div>Total: {orders.length}</div>
            <div>New Orders: {statusCounts.placed}</div>
            <div>Confirmed: {statusCounts.confirmed}</div>
            <div>Preparing: {statusCounts.preparing}</div>
            <div>Ready: {statusCounts.ready}</div>
            <div>Served: {statusCounts.served}</div>
            <div>Paying: {statusCounts.paying}</div>
            <div>Archived: {statusCounts.archived}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Tab Switcher */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab("active")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "active"
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Active Orders ({statusCounts.active})
                </button>
                <button
                  onClick={() => setActiveTab("archived")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "archived"
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Archived Orders ({statusCounts.archived})
                </button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={archiveOldOrders}
                disabled={archiving}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${archiving ? 'opacity-60 cursor-not-allowed' : 'bg-gray-50 hover:bg-gray-100 border-gray-300 text-gray-700'}`}
                title="Archive paid/served/cancelled orders older than 7 days"
              >
                <Archive className="w-4 h-4" />
                {archiving ? 'Archiving…' : 'Archive (7d)'}
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter for Active Orders */}
        {activeTab === "active" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-wrap gap-4">
              {Object.entries(statusCounts)
                .filter(([status]) => !["archived"].includes(status))
                .map(([status, count]) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedStatus === status
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {status === "placed"
                      ? "New Orders"
                      : status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Orders Grid */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {activeTab === "active" ? (
                  <Clock className="w-8 h-8 text-gray-400" />
                ) : (
                  <Archive className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === "active" ? "No active orders found" : "No archived orders found"}
              </h3>
              <p className="text-gray-600">
                {activeTab === "active" 
                  ? "No active orders have been placed yet. Orders will appear here when customers place them."
                  : "Completed and paid orders will appear here after payment processing."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.orderNumber || (order as any).order_code || (order as any).code || `Order #${order.id?.slice?.(-6)}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(order as any).tableId || (order as any).table_code || "—"} • Session #{(order as any).sessionId?.slice?.(-6) || "—"}
                        </p>
                        <p className="text-xs text-gray-400">
                          Placed: {format(new Date((order as any).placedAt || (order as any).createdAt || (order as any).created_at || Date.now()), "HH:mm:ss")}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                      </div>
                    </div>

                      <div className="space-y-2 mb-4">
                        {(order.items || []).map((item: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {(item.quantity ?? item.qty ?? 1)}x {item.name ?? item.title ?? "Item"}
                            </span>
                            <span className="font-medium">
                              ${Number(
                                (item.unitPrice ?? item.price ?? 0) * (item.quantity ?? item.qty ?? 1)
                              ).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                    {order.specialInstructions && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Special Instructions:</strong> {order.specialInstructions}
                        </p>
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">
                          Total: ${Number(order.totalAmount ?? (order as any).total_amount ?? (order as any).total ?? 0).toFixed(2)}
                        </span>
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>

                      {(order as any).estimatedReadyAt && (
                        <div className="text-xs text-gray-500 mt-2">
                          Est. Ready: {format(new Date((order as any).estimatedReadyAt), "HH:mm")}
                        </div>
                      )}
                    </div>

                    {/* Order Actions */}
                    <div className="space-y-2">
                      {order.status === "placed" && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleConfirmOrder(order.id)}
                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                          >
                            Confirm Order
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setShowCancelModal(true);
                            }}
                            className="px-4 py-2 text-red-600 border border-red-300 rounded-lg text-sm hover:bg-red-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      
                      {order.status === "ready" && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setShowStaffAssignModal(true);
                            }}
                            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-1"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>Assign Staff</span>
                          </button>
                          <button
                            onClick={() => handleMarkForDelivery(order.id)}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            Mark for Delivery
                          </button>
                        </div>
                      )}
                      
                      {order.status === "delivering" && (
                        <button
                          onClick={() => handleServeOrder(order.id)}
                          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          Mark Delivered
                        </button>
                      )}
                      
                      {order.status === "served" && (
                        <button
                          onClick={() => handleInitiatePayment(order.id)}
                          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Initiate Payment
                        </button>
                      )}
                      
                      {order.status === "paying" && (
                        <button
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            setShowPaymentModal(true);
                          }}
                          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Mark Paid
                        </button>
                      )}

                      {/* Show assigned staff info */}
                      {order.assignedStaffId && (
                        <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                          Assigned: {availableStaff.find(s => s.id === order.assignedStaffId)?.name || "Unknown"}
                        </div>
                      )}

                      {/* Archive section - show completion info */}
                      {activeTab === "archived" && (order.status === "paid" || order.status === "closed") && (
                        <div className="mt-2 text-xs text-gray-500 p-2 bg-green-50 rounded">
                          Completed: {(order as any).paidAt || (order as any).paid_at
                            ? format(new Date((order as any).paidAt || (order as any).paid_at), "HH:mm:ss")
                            : "N/A"}
                          {(order as any).closedAt || (order as any).closed_at
                            ? ` • Closed: ${format(new Date((order as any).closedAt || (order as any).closed_at), "HH:mm:ss")}`
                            : ""}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Cancel Order
              </h3>
              <p className="text-gray-600 mb-4">
                Please provide a reason for cancelling this order:
              </p>

              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                placeholder="Reason for cancellation..."
              />

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason("");
                    setSelectedOrderId(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={!cancelReason.trim()}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Mark Order as Paid
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as "cash" | "card" | "digital")
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="cash">Cash</option>
                  <option value="digital">Digital Wallet</option>
                </select>
              </div>

              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total Amount:</span>
                    <span className="text-xl font-bold text-gray-900">
                      ${Number(
                        (currentOrders.find((o: any) => o.id === selectedOrderId)?.totalAmount) ??
                        (currentOrders.find((o: any) => o.id === selectedOrderId) as any)?.total_amount ??
                        (currentOrders.find((o: any) => o.id === selectedOrderId) as any)?.total ??
                        0
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedOrderId(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkPaid}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Mark as Paid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Assignment Modal */}
      {showStaffAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Assign Staff Member
              </h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Staff Member
                </label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose staff member...</option>
                  {availableStaff.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} ({staff.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowStaffAssignModal(false);
                    setSelectedOrderId(null);
                    setSelectedStaff("");
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignStaff}
                  disabled={!selectedStaff}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  Assign Staff
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}