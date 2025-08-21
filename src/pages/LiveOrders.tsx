import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useSessionManagement } from '../hooks/useSessionManagement'
import { useSearchParams } from 'react-router-dom'
import { useCustomization } from '../hooks/useCustomization'
import DynamicPageRenderer from '../components/DynamicPageRenderer'
import { Clock, CheckCircle, Truck, MapPin, Phone, TrendingUp, Users, Star, ShoppingBag, DollarSign, ChefHat, BarChart3 } from 'lucide-react'

export default function LiveOrders() {
  const [searchParams] = useSearchParams()
  const trackingOrderId = searchParams.get('order')
  
  const { orders, loading: sessionLoading } = useSessionManagement({
    tenantId: 'tenant_123',
    locationId: 'location_456'
  })
  
  const { pages, theme, loading: customizationLoading } = useCustomization({
    tenantId: 'tenant_123',
    locationId: 'location_456'
  })

  // Focus on tracking order if provided
  const trackingOrder = trackingOrderId ? orders.find(o => o.id === trackingOrderId) : null

  const liveOrdersPage = pages.find(p => p.slug === 'live-orders' && p.status === 'published')
  const hasCustomContent = liveOrdersPage && 
    liveOrdersPage.sections.length > 0 && 
    liveOrdersPage.sections.some(s => s.visible && s.props && Object.keys(s.props).length > 0)

  if (customizationLoading || sessionLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading live orders...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // If tenant has customized the live orders page, render it dynamically
  if (hasCustomContent) {
    return (
      <div className="min-h-screen">
        <Header />
        <DynamicPageRenderer page={liveOrdersPage} theme={theme} />
        <Footer />
      </div>
    )
  }

  // Original beautiful live orders design (unchanged)
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'bg-yellow-500'
      case 'confirmed': return 'bg-blue-500'
      case 'preparing': return 'bg-orange-500'
      case 'ready': return 'bg-green-500'
      case 'served': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'placed': return 'Order Placed'
      case 'confirmed': return 'Order Confirmed'
      case 'preparing': return 'Preparing'
      case 'ready': return 'Ready'
      case 'served': return 'Served'
      default: return status
    }
  }

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'placed': return 'Waiting for confirmation'
      case 'confirmed': return 'Confirmed and sent to kitchen'
      case 'preparing': return 'Chef is working on your meal'
      case 'ready': return 'Order ready for service'
      case 'served': return 'Order has been served'
      default: return ''
    }
  }

  const ordersByStatus = {
    placed: orders.filter(o => o.status === 'placed' || o.status === 'confirmed'),
    confirmed: orders.filter(o => o.status === 'confirmed'),
    preparing: orders.filter(o => o.status === 'preparing'),
    ready: orders.filter(o => o.status === 'ready'),
    served: orders.filter(o => o.status === 'served'),
    paying: orders.filter(o => o.status === 'paying'),
    paid: orders.filter(o => o.status === 'paid')
  }

  const totalOrders = orders.filter(o => o.status !== 'paid' && o.status !== 'closed').length
  const activeOrders = orders.filter(o => ['placed', 'confirmed', 'preparing', 'ready'].includes(o.status)).length

  const mostSoldItems = [
    { name: 'Butter Chicken', orders: 15, trend: '+10%' },
    { name: 'Chicken Biryani', orders: 12, trend: '+8%' },
    { name: 'Garlic Naan', orders: 18, trend: '+15%' },
    { name: 'Paneer Tikka', orders: 9, trend: '+6%' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Section 1: Hero Section */}
      <section className="relative h-80 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920)'
          }}
        ></div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Live Orders</h1>
          <p className="text-xl mb-2">Track your orders live here</p>
          <p className="text-lg opacity-90">Track your dine-in and takeaway orders in real-time with live kitchen updates</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tracking Order Highlight */}
        {trackingOrder && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-blue-900">Tracking Your Order</h2>
                <p className="text-blue-700">
                  {trackingOrder.orderNumber} • Table {trackingOrder.tableId} • ${trackingOrder.totalAmount.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(trackingOrder.status)}`}>
                  {getStatusText(trackingOrder.status)}
                </span>
                <p className="text-sm text-blue-600 mt-1">
                  {getStatusDescription(trackingOrder.status)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Order Status Columns */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Placed Orders Column */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Order Placed</h3>
                    <p className="text-sm text-gray-600">Waiting for confirmation</p>
                  </div>
                </div>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  {ordersByStatus.placed.length}
                </span>
              </div>

              <div className="space-y-4">
                {ordersByStatus.placed.map((order) => (
                  <div key={order.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-gray-900">{order.tableId}</div>
                        <div className="text-sm text-gray-600">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">{format(order.placedAt, 'HH:mm')}</div>
                      </div>
                    </div>
                    <div className="space-y-1 mb-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700">• {item.name}</span>
                          <span className="text-orange-600 font-medium">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirmed Orders Column */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Confirmed</h3>
                    <p className="text-sm text-gray-600">Sent to kitchen</p>
                  </div>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {ordersByStatus.confirmed.length}
                </span>
              </div>

              <div className="space-y-4">
                {ordersByStatus.confirmed.map((order) => (
                  <div key={order.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-gray-900">{order.tableId}</div>
                        <div className="text-sm text-gray-600">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">{format(order.placedAt, 'HH:mm')}</div>
                      </div>
                    </div>
                    <div className="space-y-1 mb-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700">• {item.name}</span>
                          <span className="text-orange-600 font-medium">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preparing Column */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Preparing</h3>
                    <p className="text-sm text-gray-600">Chef is working on your meal</p>
                  </div>
                </div>
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  {ordersByStatus.preparing.length}
                </span>
              </div>

              <div className="space-y-4">
                {ordersByStatus.preparing.map((order) => (
                  <div key={order.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-gray-900">{order.tableId}</div>
                        <div className="text-sm text-gray-600">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">{format(order.placedAt, 'HH:mm')}</div>
                      </div>
                    </div>
                    <div className="space-y-1 mb-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700">• {item.name}</span>
                          <span className="text-orange-600 font-medium">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ready Column */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Ready</h3>
                    <p className="text-sm text-gray-600">Ready for service</p>
                  </div>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {ordersByStatus.ready.length}
                </span>
              </div>

              <div className="space-y-4">
                {ordersByStatus.ready.map((order) => (
                  <div key={order.id} className="bg-gray-50 rounded-xl p-4 relative">
                    {order.priority === 'urgent' && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          URGENT
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-gray-900">{order.tableId}</div>
                        <div className="text-sm text-gray-600">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">{format(order.placedAt, 'HH:mm')}</div>
                      </div>
                    </div>
                    <div className="space-y-1 mb-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700">• {item.name}</span>
                          <span className="text-orange-600 font-medium">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Served Column */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Served</h3>
                    <p className="text-sm text-gray-600">Awaiting payment</p>
                  </div>
                </div>
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                  {ordersByStatus.served.length}
                </span>
              </div>

              <div className="space-y-4">
                {ordersByStatus.served.map((order) => (
                  <div key={order.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-gray-900">{order.tableId}</div>
                        <div className="text-sm text-gray-600">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">{format(order.servedAt || order.placedAt, 'HH:mm')}</div>
                      </div>
                    </div>
                    <div className="space-y-1 mb-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700">• {item.name}</span>
                          <span className="text-orange-600 font-medium">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Kitchen Insights Section */}
        <div className="mt-8">
          <div className="bg-gray-900 text-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Kitchen Insights</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Online</span>
                </div>
                <select className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700">
                  <option>Kitchen 1</option>
                  <option>Kitchen 2</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Total Orders */}
              <div>
                <h3 className="text-gray-400 text-sm mb-2">Total Orders</h3>
                <div className="text-5xl font-bold mb-4">26</div>
              </div>

              {/* Orders by Status */}
              <div>
                <h3 className="text-gray-400 text-sm mb-4">Orders by Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-20 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Preparing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Ready</span>
                  </div>
                </div>
              </div>

              {/* Average Prep Time */}
              <div>
                <h3 className="text-gray-400 text-sm mb-2">Average Prep Time</h3>
                <div className="text-4xl font-bold">12m 30s</div>
              </div>

              {/* Longest Pending Order */}
              <div>
                <h3 className="text-gray-400 text-sm mb-2">Longest Pending Order</h3>
                <div className="text-2xl font-bold">#O-117 <span className="text-lg">18m</span></div>
              </div>

              {/* Top 5 Dishes */}
              <div>
                <h3 className="text-gray-400 text-sm mb-4">Top 5 Dishes</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Butter Chicken</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium">15</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Chicken Biryani</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-12 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium">10</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Dal Tadka</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium">8</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Paneer Tikka</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium">4</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Garlic Naan</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium">3</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Orders Service Type - Donut Chart */}
              <div>
                <h3 className="text-gray-400 text-sm mb-4">Orders' Service Type</h3>
                <div className="flex items-center space-x-4">
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#374151"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="3"
                        strokeDasharray="60, 100"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#1F2937"
                        strokeWidth="3"
                        strokeDasharray="30, 100"
                        strokeDashoffset="-60"
                      />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Dine in</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                      <span className="text-sm">Takeaway</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                      <span className="text-sm">Delivery</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              {/* Chef Workload */}
              <div>
                <h3 className="text-gray-400 text-sm mb-4">Chef Workload</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">FG</span>
                  </div>
                  <div>
                    <div className="font-medium">Ford Garrison</div>
                    <div className="text-2xl font-bold">6</div>
                  </div>
                </div>
              </div>

              {/* Cancelled Order Reasons */}
              <div>
                <h3 className="text-gray-400 text-sm mb-4">Cancelled Order Reasons</h3>
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#374151"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="3"
                        strokeDasharray="40, 100"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#D97706"
                        strokeWidth="3"
                        strokeDasharray="35, 100"
                        strokeDashoffset="-40"
                      />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Late</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                      <span className="text-sm">Wrong item</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                      <span className="text-sm">Other</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Section 3: Summary and Statistics */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Live Order Summary</h2>
          
          {/* Order Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{ordersByStatus.placed.length}</div>
              <div className="text-sm text-gray-600">Placed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{ordersByStatus.confirmed.length}</div>
              <div className="text-sm text-gray-600">Confirmed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{ordersByStatus.preparing.length}</div>
              <div className="text-sm text-gray-600">Preparing</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{ordersByStatus.ready.length}</div>
              <div className="text-sm text-gray-600">Ready</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Revenue Analytics */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-6">
                <DollarSign className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Today's Revenue</div>
                      <div className="text-sm text-gray-500">Live tracking</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">$2,847</div>
                    <div className="text-sm text-green-500">+12.5%</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Avg Order Value</div>
                      <div className="text-sm text-gray-500">Per transaction</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">$18.25</div>
                    <div className="text-sm text-red-500">-2.1%</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Peak Hour Revenue</div>
                      <div className="text-sm text-gray-500">7-8 PM</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">$498</div>
                    <div className="text-sm text-green-500">+8.3%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Kitchen Performance */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-6">
                <ChefHat className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900">Kitchen Performance</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Avg Prep Time</div>
                      <div className="text-sm text-gray-500">All orders</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">12m 30s</div>
                    <div className="text-sm text-green-500">-1.2m</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Order Accuracy</div>
                      <div className="text-sm text-gray-500">Success rate</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">98.5%</div>
                    <div className="text-sm text-green-500">+0.3%</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Kitchen Efficiency</div>
                      <div className="text-sm text-gray-500">Orders/hour</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">24.5</div>
                    <div className="text-sm text-green-500">+2.1</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Most Sold Items */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900">Most Sold Items</h3>
              </div>
              <div className="space-y-4">
                {mostSoldItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.orders} orders today</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">{item.trend}</div>
                      <div className="text-xs text-gray-500">Trend</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Insights */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Users className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-gray-900">Customer Insights</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-700">Active Customers</span>
                  </div>
                  <span className="font-semibold text-gray-900">42</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">Avg Wait Time</span>
                  </div>
                  <span className="font-semibold text-gray-900">8m 15s</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-gray-700">Satisfaction Score</span>
                  </div>
                  <span className="font-semibold text-gray-900">4.8/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Repeat Customers</span>
                  </div>
                  <span className="font-semibold text-gray-900">68%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Analytics Dashboard */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white mb-8">
            <h2 className="text-2xl font-bold mb-8 text-center">Real-Time Business Intelligence</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">$2,847</div>
                <div className="text-sm text-gray-300">Today's Revenue</div>
                <div className="text-xs text-green-400">↗ +12.5%</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">156</div>
                <div className="text-sm text-gray-300">Orders Served</div>
                <div className="text-xs text-blue-400">↗ +8.2%</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">24/32</div>
                <div className="text-sm text-gray-300">Table Occupancy</div>
                <div className="text-xs text-purple-400">75% Full</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400 mb-2">18m</div>
                <div className="text-sm text-gray-300">Avg Service Time</div>
                <div className="text-xs text-green-400">↘ -2.1m</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Peak Hours Analysis</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Lunch Rush (12-2 PM)</span>
                    <span className="text-yellow-400">$892</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Dinner Peak (7-9 PM)</span>
                    <span className="text-green-400">$1,245</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Late Night (9-11 PM)</span>
                    <span className="text-blue-400">$710</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Staff Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Active Staff</span>
                    <span className="text-green-400">8/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Efficiency Score</span>
                    <span className="text-yellow-400">94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Orders per Staff</span>
                    <span className="text-blue-400">19.5</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Quality Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Order Accuracy</span>
                    <span className="text-green-400">98.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Customer Returns</span>
                    <span className="text-yellow-400">1.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Food Waste</span>
                    <span className="text-green-400">3.1%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Type Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <MapPin className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Active Orders</h3>
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{activeOrders}</div>
              <div className="text-sm text-blue-700">Active Orders</div>
            </div>

            <div className="bg-purple-50 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <ShoppingBag className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-purple-900">Total Orders</h3>
              </div>
              <div className="text-4xl font-bold text-purple-600 mb-2">{totalOrders}</div>
              <div className="text-sm text-purple-700">Today</div>
            </div>
          </div>

          {/* Predictive Analytics */}
          <div className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">AI-Powered Predictions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Next Hour Forecast</h3>
                <p className="text-3xl font-bold text-indigo-600 mb-1">28 Orders</p>
                <p className="text-sm text-gray-600">Expected revenue: $512</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Optimal Staffing</h3>
                <p className="text-3xl font-bold text-green-600 mb-1">+2 Staff</p>
                <p className="text-sm text-gray-600">Recommended for dinner rush</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Inventory Alert</h3>
                <p className="text-3xl font-bold text-orange-600 mb-1">3 Items</p>
                <p className="text-sm text-gray-600">Running low, restock needed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}