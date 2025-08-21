import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Clock, CheckCircle, Truck, MapPin, Phone, TrendingUp, Users, Star, ShoppingBag } from 'lucide-react'

export default function LiveOrders() {
  const [orders, setOrders] = useState([
    {
      id: '#ORD-2025-000001',
      table: 'T02',
      items: [
        { name: 'Butter Chicken', quantity: 1 },
        { name: 'Garlic Naan', quantity: 2 }
      ],
      total: 32.57,
      status: 'received',
      orderTime: '14:27:51',
      type: 'dine-in'
    },
    {
      id: '#ORD-2025-000002',
      table: 'T03',
      items: [
        { name: 'Chicken Hyderabadi Biryani (Full)', quantity: 1 },
        { name: 'Chicken 65', quantity: 1 }
      ],
      total: 44.20,
      status: 'preparing',
      orderTime: '14:12:51',
      type: 'dine-in'
    },
    {
      id: '#ORD-2025-000003',
      table: 'F01',
      items: [
        { name: 'Paneer Tikka', quantity: 1 },
        { name: 'Dal Tadka', quantity: 1 }
      ],
      total: 28.90,
      status: 'ready',
      orderTime: '14:02:51',
      type: 'dine-in',
      urgent: true
    }
  ])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.status === 'received' && Math.random() > 0.8) {
            return { ...order, status: 'preparing' }
          }
          if (order.status === 'preparing' && Math.random() > 0.9) {
            return { ...order, status: 'ready' }
          }
          return order
        })
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-blue-500'
      case 'preparing': return 'bg-orange-500'
      case 'ready': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'received': return 'Order Received'
      case 'preparing': return 'Preparing'
      case 'ready': return 'Ready'
      default: return status
    }
  }

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'received': return 'Confirmed and sent to kitchen'
      case 'preparing': return 'Chef is working on your meal'
      case 'ready': return 'Orders ready for service/pickup'
      default: return ''
    }
  }

  const ordersByStatus = {
    received: orders.filter(o => o.status === 'received'),
    preparing: orders.filter(o => o.status === 'preparing'),
    ready: orders.filter(o => o.status === 'ready')
  }

  const totalOrders = orders.length
  const dineInOrders = orders.filter(o => o.type === 'dine-in').length
  const takeawayOrders = orders.filter(o => o.type === 'takeaway').length

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
        {/* Section 2: Order Status Columns */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* New Orders Column */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Order Received</h3>
                    <p className="text-sm text-gray-600">Confirmed and sent to kitchen</p>
                  </div>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {ordersByStatus.received.length}
                </span>
              </div>

              <div className="space-y-4">
                {ordersByStatus.received.map((order) => (
                  <div key={order.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-gray-900">{order.table}</div>
                        <div className="text-sm text-gray-600">{order.id}</div>
                        <div className="text-sm text-gray-500">{order.orderTime}</div>
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
                        <div className="font-semibold text-gray-900">{order.table}</div>
                        <div className="text-sm text-gray-600">{order.id}</div>
                        <div className="text-sm text-gray-500">{order.orderTime}</div>
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
                    <p className="text-sm text-gray-600">Orders ready for service/pickup</p>
                  </div>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {ordersByStatus.ready.length}
                </span>
              </div>

              <div className="space-y-4">
                {ordersByStatus.ready.map((order) => (
                  <div key={order.id} className="bg-gray-50 rounded-xl p-4 relative">
                    {order.urgent && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          URGENT
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-gray-900">{order.table}</div>
                        <div className="text-sm text-gray-600">{order.id}</div>
                        <div className="text-sm text-gray-500">{order.orderTime}</div>
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

        {/* Section 3: Summary and Statistics */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Live Order Summary</h2>
          
          {/* Order Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{ordersByStatus.received.length}</div>
              <div className="text-sm text-gray-600">Received</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{ordersByStatus.preparing.length}</div>
              <div className="text-sm text-gray-600">Preparing</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{ordersByStatus.ready.length}</div>
              <div className="text-sm text-gray-600">Ready</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">{totalOrders}</div>
              <div className="text-sm text-gray-600">Total Active</div>
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

            {/* Live Statistics */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Users className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900">Live Statistics</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">Active Staff</span>
                  </div>
                  <span className="font-semibold text-gray-900">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-gray-700">Customer Satisfaction</span>
                  </div>
                  <span className="font-semibold text-gray-900">4.8/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-700">Active Orders</span>
                  </div>
                  <span className="font-semibold text-gray-900">{totalOrders}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Type Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <MapPin className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Dine-In Orders</h3>
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{dineInOrders}</div>
              <div className="text-sm text-blue-700">Active Orders</div>
            </div>

            <div className="bg-purple-50 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <ShoppingBag className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-purple-900">Takeaway Orders</h3>
              </div>
              <div className="text-4xl font-bold text-purple-600 mb-2">{takeawayOrders}</div>
              <div className="text-sm text-purple-700">Active Orders</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}