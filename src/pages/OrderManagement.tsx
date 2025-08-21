import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSessionManagement } from '../hooks/useSessionManagement'
import { ChefHat, Clock, CheckCircle, XCircle, Eye, Filter } from 'lucide-react'
import { format } from 'date-fns'

export default function OrderManagement() {
  const { 
    orders, 
    confirmOrder, 
    cancelOrder, 
    markOrderServed,
    loading 
  } = useSessionManagement({
    tenantId: 'tenant_123',
    locationId: 'location_456'
  })
  
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const statusCounts = {
    all: orders.length,
    placed: orders.filter(o => o.status === 'placed').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    served: orders.filter(o => o.status === 'served').length,
    paid: orders.filter(o => o.status === 'paid').length
  }

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'preparing': return 'bg-blue-100 text-blue-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'served': return 'bg-gray-100 text-gray-800'
      case 'paid': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'placed': return <Clock className="w-4 h-4" />
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'preparing': return <ChefHat className="w-4 h-4" />
      case 'ready': return <CheckCircle className="w-4 h-4" />
      case 'served': return <CheckCircle className="w-4 h-4" />
      case 'paid': return <CheckCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const handleConfirmOrder = async (orderId: string) => {
    try {
      await confirmOrder(orderId, 'manager_123')
      console.log('✅ Order confirmed from management')
    } catch (err) {
      alert('Failed to confirm order')
    }
  }

  const handleCancelOrder = async () => {
    if (!selectedOrderId || !cancelReason.trim()) return
    
    try {
      await cancelOrder(selectedOrderId, cancelReason, 'manager_123')
      setShowCancelModal(false)
      setCancelReason('')
      setSelectedOrderId(null)
      console.log('✅ Order cancelled from management')
    } catch (err) {
      alert('Failed to cancel order')
    }
  }

  const handleServeOrder = async (orderId: string) => {
    try {
      await markOrderServed(orderId, 'staff_123')
      console.log('✅ Order marked as served')
    } catch (err) {
      alert('Failed to mark order as served')
    }
  }

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
                  <h1 className="text-xl font-semibold text-gray-900">RestaurantOS</h1>
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
    )
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
                <h1 className="text-xl font-semibold text-gray-900">RestaurantOS</h1>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-8">
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 pb-2">
              Dashboard
            </Link>
            <Link to="/menu" className="text-gray-500 hover:text-gray-700 pb-2">
              Menu Management
            </Link>
            <Link to="/orders" className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium">
              Orders
            </Link>
            <Link to="/table-management" className="text-gray-500 hover:text-gray-700 pb-2">
              Table Management
            </Link>
            <Link to="/staff-management" className="text-gray-500 hover:text-gray-700 pb-2">
              Staff Management
            </Link>
            <Link to="/admin/kitchen" className="text-gray-500 hover:text-gray-700 pb-2">
              Kitchen Dashboard
            </Link>
            <Link to="/analytics" className="text-gray-500 hover:text-gray-700 pb-2">
              Analytics
            </Link>
            <Link to="/settings" className="text-gray-500 hover:text-gray-700 pb-2">
              Settings
            </Link>
          </div>
        </nav>

        {/* Status Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{order.tableId} • Session #{order.sessionId.slice(-6)}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.quantity}x {item.name}</span>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
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

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-gray-900">Total: ${order.total.toFixed(2)}</span>
                    <button className="p-1 text-gray-400 hover:text-blue-600">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Ordered: {format(order.orderTime, 'HH:mm')}</div>
                    <div>
                      {order.status === 'served' ? 'Served' : 'Est. Ready'}: {format(order.estimatedTime, 'HH:mm')}
                    </div>
                  </div>
                </div>

                {order.status !== 'served' && (
                  <div className="mt-4 flex space-x-2">
                    {order.status === 'pending' && (
                      <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        Start Preparing
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                        Mark Ready
                  <p className="font-medium text-gray-900">${order.totalAmount.toFixed(2)}</p>
                    )}
                    {order.status === 'ready' && (
                      <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
                        Mark Served
                      </button>
                    <span className="text-xs text-gray-500">
                      {Math.floor((Date.now() - order.placedAt.getTime()) / (1000 * 60))}m ago
                    </span>
                  </div>
                )}
              </div>
              
              {/* Order Actions */}
              <div className="mt-4 flex space-x-2">
                {order.status === 'placed' && (
                  <>
                    <button
                      onClick={() => handleConfirmOrder(order.id)}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Confirm Order
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOrderId(order.id)
                        setShowCancelModal(true)
                      }}
                      className="px-4 py-2 text-red-600 border border-red-300 rounded-lg text-sm hover:bg-red-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {order.status === 'ready' && (
                  <button
                    onClick={() => handleServeOrder(order.id)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Mark Served
                  </button>
                )}
                {order.status === 'served' && (
                  <button
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    Process Payment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">No orders match the selected status filter.</p>
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Order</h3>
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
                    setShowCancelModal(false)
                    setCancelReason('')
                    setSelectedOrderId(null)
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
    </div>
  )
}