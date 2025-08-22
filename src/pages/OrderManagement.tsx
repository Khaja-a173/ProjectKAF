import { useState } from "react";
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
} from "lucide-react";
import { format } from "date-fns";

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
    processPayment,
    clearTable,
    loading,
  } = useSessionManagement({
    tenantId: "tenant_123",
    locationId: "location_456",
  });

  const [selectedStatus, setSelectedStatus] = useState("active");
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStaffAssignModal, setShowStaffAssignModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "digital"
  >("card");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock staff data
  const availableStaff = [
    { id: "staff_1", name: "Sarah Johnson", role: "Waiter" },
    { id: "staff_2", name: "Mike Chen", role: "Waiter" },
    { id: "staff_3", name: "Emma Davis", role: "Runner" },
    { id: "staff_4", name: "James Wilson", role: "Host" },
  ];

  const currentOrders = activeTab === "active" ? orders : archivedOrders;

  const statusCounts = {
    active: orders.filter((o) => !["paid", "closed", "cancelled"].includes(o.status)).length,
    placed: orders.filter((o) => o.status === "placed").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
    served: orders.filter((o) => o.status === "served").length,
    delivering: orders.filter((o) => o.status === "delivering").length,
    paying: orders.filter((o) => o.status === "paying").length,
    archived: archivedOrders.length,
  };

  const filteredOrders = currentOrders.filter((order) => {
    const matchesStatus =
      selectedStatus === "active" 
        ? !["paid", "closed", "cancelled"].includes(order.status)
        : order.status === selectedStatus;
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tableId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "placed":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-orange-100 text-orange-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "served":
        return "bg-gray-100 text-gray-800";
      case "paid":
        return "bg-purple-100 text-purple-800";
      case "paying":
        return "bg-indigo-100 text-indigo-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "placed":
        return <Clock className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "preparing":
        return <ChefHat className="w-4 h-4" />;
      case "ready":
        return <CheckCircle className="w-4 h-4" />;
      case "served":
        return <CheckCircle className="w-4 h-4" />;
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "paying":
        return <Clock className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
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

  const handleProcessPayment = async () => {
    if (!selectedOrderId) return;

    try {
      const order = orders.find((o) => o.id === selectedOrderId);
      if (!order) return;

      await processPayment(selectedOrderId, paymentMethod, order.totalAmount);
      setShowPaymentModal(false);
      setSelectedOrderId(null);
      console.log("✅ Payment processed successfully");
    } catch (err) {
      alert("Failed to process payment");
    }
  };

  const handleClearTable = async (tableId: string) => {
    try {
      await clearTable(tableId, "manager_123");
      console.log("✅ Table cleared successfully");
    } catch (err) {
      alert("Failed to clear table");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link to="/dashboard" className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <ChefHat className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    RestaurantOS
                  </h1>
                </Link>
              </div>
            </div>
          </div>
        </header>
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">
                  RestaurantOS
                </h1>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 bg-green-100 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">
                  Live Updates
                </span>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-8">
            <Link
              to="/dashboard"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/menu"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Menu Management
            </Link>
            <Link
              to="/orders"
              className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium"
            >
              Orders
            </Link>
            <Link
              to="/table-management"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Table Management
            </Link>
            <Link
              to="/staff-management"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Staff Management
            </Link>
            <Link
              to="/kitchen-dashboard"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Kitchen Dashboard
            </Link>
            <Link
              to="/analytics"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Analytics
            </Link>
            <Link
              to="/settings"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Settings
            </Link>
          </div>
        </nav>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    orders.filter((o) =>
                      ["placed", "confirmed", "preparing", "ready"].includes(
                        o.status,
                      ),
                    ).length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Revenue Today
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  $
                  {orders
                    .filter((o) => o.status === "paid")
                    .reduce((sum, o) => sum + o.totalAmount, 0)
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
                <p className="text-sm font-medium text-gray-600">
                  Avg Order Value
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  $
                  {orders.length > 0
                    ? (
                        orders.reduce((sum, o) => sum + o.totalAmount, 0) /
                        orders.length
                      ).toFixed(2)
                    : "0.00"}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
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
            </div>
          </div>
        </div>

        {/* Status Filter */}
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
                    {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Orders Grid */}
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
                      {order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.tableId} • Session #{order.sessionId.slice(-6)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Placed: {format(order.placedAt, "HH:mm")}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}
                  >
                    {getStatusIcon(order.status)}
                    <span>
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-medium">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {order.specialInstructions && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Special Instructions:</strong>{" "}
                      {order.specialInstructions}
                    </p>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">
                      Total: ${order.totalAmount.toFixed(2)}
                    </span>
                    <button className="p-1 text-gray-400 hover:text-blue-600">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {order.estimatedReadyAt && (
                    <div className="text-xs text-gray-500 mt-2">
                      Est. Ready: {format(order.estimatedReadyAt, "HH:mm")}
                    </div>
                  )}
                </div>

                {/* Order Actions */}
                <div className="flex space-x-2">
                  {order.status === "placed" && (
                    <>
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
                    </>
                  )}
                  {order.status === "ready" && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedOrderId(order.id);
                          setShowStaffAssignModal(true);
                        }}
                        className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                      >
                        Assign Staff
                      </button>
                      <button
                        onClick={() => handleMarkForDelivery(order.id)}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Mark for Delivery
                      </button>
                    </>
                  )}
                  {order.status === "delivering" && (
                    <button
                      onClick={() => handleServeOrder(order.id)}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Mark Delivered
                    </button>
                  )}
                  {order.status === "served" && (
                    <button
                      onClick={() => handleInitiatePayment(order.id)}
                      className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
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
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Mark Paid
                    </button>
                  )}
                  
                  {/* Show assigned staff info */}
                  {order.assignedStaffId && (
                    <div className="text-xs text-gray-500 mt-2">
                      Assigned: {availableStaff.find(s => s.id === order.assignedStaffId)?.name || "Unknown"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === "active" ? "No active orders found" : "No archived orders found"}
            </h3>
            <p className="text-gray-600">
              {activeTab === "active"
                ? "No active orders have been placed yet. Orders will appear here when customers place them."
                : "No completed orders yet. Paid orders will appear here after completion."}
            </p>
          </div>
        )}
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
                    setPaymentMethod(
                      e.target.value as "cash" | "card" | "digital",
                    )
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
                    <span className="font-medium text-gray-900">
                      Total Amount:
                    </span>
                    <span className="text-xl font-bold text-gray-900">
                      $
                      {currentOrders
                        .find((o) => o.id === selectedOrderId)
                        ?.totalAmount.toFixed(2)}
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