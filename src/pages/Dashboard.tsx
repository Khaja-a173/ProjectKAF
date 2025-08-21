import React from 'react'
import { Link } from 'react-router-dom'
import { 
  BarChart3, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Clock,
  ChefHat,
  Settings,
  Bell,
  Search,
  Menu as MenuIcon,
  Grid3X3
} from 'lucide-react'

export default function Dashboard() {
  const stats = [
    { name: 'Total Revenue', value: '$45,231', change: '+20.1%', icon: DollarSign, color: 'text-green-600' },
    { name: 'Orders Today', value: '156', change: '+12.5%', icon: ShoppingCart, color: 'text-blue-600' },
    { name: 'Active Tables', value: '24/32', change: '+5.2%', icon: Users, color: 'text-purple-600' },
    { name: 'Avg Order Time', value: '18 min', change: '-2.1%', icon: Clock, color: 'text-orange-600' },
  ]

  const recentOrders = [
    { id: '#1234', table: 'Table 5', items: 3, total: '$45.50', status: 'Preparing', time: '5 min ago' },
    { id: '#1235', table: 'Table 2', items: 2, total: '$28.75', status: 'Ready', time: '8 min ago' },
    { id: '#1236', table: 'Table 8', items: 4, total: '$67.25', status: 'Served', time: '12 min ago' },
    { id: '#1237', table: 'Table 1', items: 1, total: '$15.50', status: 'Pending', time: '15 min ago' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">RestaurantOS</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-8">
            <Link to="/dashboard" className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium">
              Dashboard
            </Link>
            <Link to="/menu" className="text-gray-500 hover:text-gray-700 pb-2">
              Menu Management
            </Link>
            <Link to="/orders" className="text-gray-500 hover:text-gray-700 pb-2">
              Orders
            </Link>
            <Link to="/table-management" className="text-gray-500 hover:text-gray-700 pb-2">
              Table Management
            </Link>
            <Link to="/analytics" className="text-gray-500 hover:text-gray-700 pb-2">
              Analytics
            </Link>
            <Link to="/settings" className="text-gray-500 hover:text-gray-700 pb-2">
              Settings
            </Link>
          </div>
        </nav>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                <span className="text-sm text-gray-500 ml-1">from last week</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium text-gray-900">{order.id}</p>
                          <p className="text-sm text-gray-500">{order.table} • {order.items} items</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{order.total}</p>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            order.status === 'Ready' ? 'bg-green-100 text-green-800' :
                            order.status === 'Preparing' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'Served' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                          <span className="text-xs text-gray-500">{order.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/menu"
                  className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <MenuIcon className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="font-medium text-blue-900">Manage Menu</span>
                </Link>
                <Link
                  to="/admin/menu"
                  className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <ChefHat className="w-5 h-5 text-green-600 mr-3" />
                  <span className="font-medium text-green-900">Admin Menu Management</span>
                </Link>
                <Link
                  to="/application-customization"
                  className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Settings className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="font-medium text-purple-900">Application Customization</span>
                </Link>
                <Link
                  to="/orders"
                  className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5 text-green-600 mr-3" />
                  <span className="font-medium text-green-900">View Orders</span>
                </Link>
                <Link
                  to="/analytics"
                  className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <BarChart3 className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="font-medium text-purple-900">Analytics</span>
                </Link>
                <Link
                  to="/table-management"
                  className="flex items-center p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Grid3X3 className="w-5 h-5 text-indigo-600 mr-3" />
                  <span className="font-medium text-indigo-900">Table Management</span>
                </Link>
                <Link
                  to="/staff-management"
                  className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Users className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="font-medium text-purple-900">Staff Management</span>
                </Link>
                <Link
                  to="/kitchen-dashboard"
                  className="flex items-center p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <ChefHat className="w-5 h-5 text-red-600 mr-3" />
                  <span className="font-medium text-red-900">Kitchen Dashboard</span>
                </Link>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Today's Performance</h3>
              <p className="text-blue-100 mb-4">Your restaurant is performing 15% better than yesterday!</p>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Revenue Goal</span>
                  <span className="text-sm font-medium">78%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div className="bg-white rounded-full h-2" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}