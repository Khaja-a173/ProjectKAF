import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChefHat, Clock, CheckCircle, XCircle, Eye, Filter } from 'lucide-react'
import { format } from 'date-fns'

export default function OrderManagement() {
  const [selectedStatus, setSelectedStatus] = useState('all')

  const orders = [
    {
      id: '#1234',
      table: 'Table 5',
      customer: 'John Smith',
      items: [
        { name: 'Grilled Salmon', quantity: 1, price: 28.50 },
        { name: 'Caesar Salad', quantity: 2, price: 14.50 },
        { name: 'Wine', quantity: 1, price: 12.00 }
      ],
      total: 69.50,
      status: 'preparing',
      orderTime: new Date(Date.now() - 15 * 60 * 1000),
      estimatedTime: new Date(Date.now() + 10 * 60 * 1000),
      specialInstructions: 'No onions in salad'
    },
    {
      id: '#1235',
      table: 'Table 2',
      customer: 'Sarah Johnson',
      items: [
        { name: 'Pasta Carbonara', quantity: 1, price: 22.00 },
        { name: 'Garlic Bread', quantity: 1, price: 8.50 }
      ],
      total: 30.50,
      status: 'ready',
      orderTime: new Date(Date.now() - 25 * 60 * 1000),
      estimatedTime: new Date(Date.now() - 5 * 60 * 1000),
      specialInstructions: null
    },
    {
      id: '#1236',
      table: 'Table 8',
      customer: 'Mike Wilson',
      items: [
        { name: 'Steak', quantity: 1, price: 35.00 },
        { name: 'Mashed Potatoes', quantity: 1, price: 8.00 },
        { name: 'Beer', quantity: 2, price: 8.00 }
      ],
      total: 59.00,
      status: 'served',
      orderTime: new Date(Date.now() - 45 * 60 * 1000),
      estimatedTime: new Date(Date.now() - 15 * 60 * 1000),
      specialInstructions: 'Medium rare steak'
    },
    {
      id: '#1237',
      table: 'Table 1',
      customer: 'Emma Davis',
      items: [
        { name: 'Chicken Salad', quantity: 1, price: 18.50 }
      ],
      total: 18.50,
      status: 'pending',
      orderTime: new Date(Date.now() - 5 * 60 * 1000),
      estimatedTime: new Date(Date.now() + 20 * 60 * 1000),
      specialInstructions: 'Dressing on the side'
    }
  ]

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    served: orders.filter(o => o.status === 'served').length
  }

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'preparing': return 'bg-blue-100 text-blue-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'served': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'preparing': return <ChefHat className="w-4 h-4" />
      case 'ready': return <CheckCircle className="w-4 h-4" />
      case 'served': return <CheckCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
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
                    <h3 className="font-semibold text-gray-900">{order.id}</h3>
                    <p className="text-sm text-gray-600">{order.table} • {order.customer}</p>
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
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
                        Mark Served
                      </button>
                    )}
                  </div>
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
    </div>
  )
}