import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Clock, CheckCircle, Truck, MapPin, Phone } from 'lucide-react'

export default function LiveOrders() {
  const [orders, setOrders] = useState([
    {
      id: '#ORD-001',
      customerName: 'John Smith',
      items: ['Wagyu Beef Tenderloin', 'Truffle Arancini', 'Chocolate Lava Cake'],
      total: 95.00,
      status: 'preparing',
      orderTime: new Date(Date.now() - 15 * 60 * 1000),
      estimatedTime: new Date(Date.now() + 10 * 60 * 1000),
      type: 'dine-in',
      table: 'Table 5'
    },
    {
      id: '#ORD-002',
      customerName: 'Sarah Johnson',
      items: ['Grilled Atlantic Salmon', 'Craft Beer Selection'],
      total: 40.00,
      status: 'ready',
      orderTime: new Date(Date.now() - 25 * 60 * 1000),
      estimatedTime: new Date(Date.now() - 5 * 60 * 1000),
      type: 'pickup',
      phone: '+1 (555) 123-4567'
    },
    {
      id: '#ORD-003',
      customerName: 'Mike Wilson',
      items: ['Lobster Risotto', 'Tiramisu', 'Wine Selection'],
      total: 68.00,
      status: 'delivered',
      orderTime: new Date(Date.now() - 45 * 60 * 1000),
      estimatedTime: new Date(Date.now() - 15 * 60 * 1000),
      type: 'delivery',
      address: '123 Main St, City, State 12345'
    },
    {
      id: '#ORD-004',
      customerName: 'Emma Davis',
      items: ['Spicy Thai Curry', 'Pan-Seared Scallops'],
      total: 52.00,
      status: 'confirmed',
      orderTime: new Date(Date.now() - 5 * 60 * 1000),
      estimatedTime: new Date(Date.now() + 20 * 60 * 1000),
      type: 'dine-in',
      table: 'Table 12'
    }
  ])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.status === 'confirmed' && Math.random() > 0.7) {
            return { ...order, status: 'preparing' }
          }
          if (order.status === 'preparing' && Math.random() > 0.8) {
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
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'preparing': return 'bg-yellow-100 text-yellow-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'delivered': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <Clock className="w-4 h-4" />
      case 'preparing': return <Clock className="w-4 h-4" />
      case 'ready': return <CheckCircle className="w-4 h-4" />
      case 'delivered': return <Truck className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'dine-in': return <MapPin className="w-4 h-4 text-blue-500" />
      case 'pickup': return <Clock className="w-4 h-4 text-orange-500" />
      case 'delivery': return <Truck className="w-4 h-4 text-green-500" />
      default: return <MapPin className="w-4 h-4" />
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const getTimeRemaining = (estimatedTime: Date) => {
    const now = new Date()
    const diff = estimatedTime.getTime() - now.getTime()
    const minutes = Math.ceil(diff / (1000 * 60))
    
    if (minutes <= 0) return 'Ready now'
    if (minutes === 1) return '1 minute'
    return `${minutes} minutes`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Live Order Tracking</h1>
          <p className="text-xl opacity-90">Track your order in real-time</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Order Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Preparing</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {orders.filter(o => o.status === 'preparing').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ready</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.status === 'ready').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-600">
                  {orders.filter(o => o.status === 'delivered').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Live Orders */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Live Orders</h2>
            <p className="text-gray-600">Real-time order status updates</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {orders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{order.id}</h3>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        {getTypeIcon(order.type)}
                        <span className="capitalize">{order.type}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Customer</p>
                        <p className="font-medium">{order.customerName}</p>
                        {order.table && (
                          <>
                            <p className="text-sm text-gray-600 mt-1">Location</p>
                            <p className="font-medium">{order.table}</p>
                          </>
                        )}
                        {order.phone && (
                          <>
                            <p className="text-sm text-gray-600 mt-1">Phone</p>
                            <p className="font-medium">{order.phone}</p>
                          </>
                        )}
                        {order.address && (
                          <>
                            <p className="text-sm text-gray-600 mt-1">Address</p>
                            <p className="font-medium">{order.address}</p>
                          </>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Items</p>
                        <ul className="space-y-1">
                          {order.items.map((item, index) => (
                            <li key={index} className="text-sm">{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:text-right lg:ml-6">
                    <p className="text-2xl font-bold text-gray-900 mb-2">${order.total.toFixed(2)}</p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Ordered: {formatTime(order.orderTime)}</p>
                      <p className="font-medium">
                        {order.status === 'delivered' ? 'Completed' : getTimeRemaining(order.estimatedTime)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Tracking Info */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Confirmed</p>
                <p className="text-sm text-gray-600">Order received</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Preparing</p>
                <p className="text-sm text-gray-600">Kitchen is cooking</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Ready</p>
                <p className="text-sm text-gray-600">Ready for pickup/serving</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Truck className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Completed</p>
                <p className="text-sm text-gray-600">Order delivered/served</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}