'use client';

import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  BarChart3, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Clock,
  Star,
  AlertCircle,
  Bell,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Settings,
  LogOut,
  Building2,
  Menu,
  X
} from 'lucide-react';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  activeCustomers: number;
  averageOrderValue: number;
  pendingOrders: number;
  completedOrdersToday: number;
  growthRate: number;
  monthlyRevenue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Simulate loading dashboard data
    setTimeout(() => {
      const dashboardStats: DashboardStats = {
        totalOrders: 1247,
        totalRevenue: 45678.90,
        activeCustomers: 892,
        averageOrderValue: 36.65,
        pendingOrders: 12,
        completedOrdersToday: 67,
        growthRate: 12.5,
        monthlyRevenue: 125430.50,
      };
      setStats(dashboardStats);
      setLoading(false);
    }, 1000);
  }, []);

  const StatCard = ({ title, value, icon: Icon, change, color, subtitle }: any) => (
    <Card className="p-6 hover:shadow-lg transition-all duration-200 border-0 bg-white/80 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          {change && (
            <p className={`text-sm flex items-center mt-2 ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-2xl ${color} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );

  const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">RestaurantOS</span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {[
            { name: 'Dashboard', icon: BarChart3, active: true },
            { name: 'Orders', icon: ShoppingCart, badge: '12' },
            { name: 'Menu', icon: Menu },
            { name: 'Customers', icon: Users },
            { name: 'Analytics', icon: TrendingUp },
            { name: 'Settings', icon: Settings },
          ].map((item) => (
            <button
              key={item.name}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                item.active 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </div>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">JD</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">John Doe</p>
            <p className="text-xs text-gray-500">Restaurant Admin</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => window.location.href = '/auth/signin'}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div className="ml-4 lg:ml-0">
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                  <p className="text-sm text-gray-600">Welcome back! Here's what's happening today.</p>
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
                <Button variant="outline" size="sm">
                  <Bell className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Revenue"
              value={`$${stats?.totalRevenue.toLocaleString()}`}
              subtitle="This month"
              icon={DollarSign}
              change={stats?.growthRate}
              color="bg-gradient-to-r from-green-500 to-emerald-500"
            />
            <StatCard
              title="Total Orders"
              value={stats?.totalOrders.toLocaleString()}
              subtitle="All time"
              icon={ShoppingCart}
              change={8.2}
              color="bg-gradient-to-r from-blue-500 to-indigo-500"
            />
            <StatCard
              title="Active Customers"
              value={stats?.activeCustomers.toLocaleString()}
              subtitle="This month"
              icon={Users}
              change={-2.1}
              color="bg-gradient-to-r from-purple-500 to-pink-500"
            />
            <StatCard
              title="Avg Order Value"
              value={`$${stats?.averageOrderValue}`}
              subtitle="Per order"
              icon={TrendingUp}
              change={15.3}
              color="bg-gradient-to-r from-orange-500 to-red-500"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Today's Overview */}
            <Card className="p-6 border-0 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Today's Overview</h3>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Pending Orders</p>
                      <p className="text-xs text-gray-600">Needs attention</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-orange-600">{stats?.pendingOrders}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Completed Today</p>
                      <p className="text-xs text-gray-600">Successfully served</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{stats?.completedOrdersToday}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Growth Rate</p>
                      <p className="text-xs text-gray-600">Monthly increase</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">+{stats?.growthRate}%</span>
                </div>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="lg:col-span-2 p-6 border-0 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { 
                    action: 'New order received', 
                    customer: 'John Smith', 
                    time: '2 minutes ago', 
                    type: 'order',
                    amount: '$45.50'
                  },
                  { 
                    action: 'Payment processed', 
                    customer: 'Sarah Johnson', 
                    time: '5 minutes ago', 
                    type: 'payment',
                    amount: '$32.75'
                  },
                  { 
                    action: 'Order completed', 
                    customer: 'Mike Wilson', 
                    time: '8 minutes ago', 
                    type: 'completed',
                    amount: '$28.90'
                  },
                  { 
                    action: 'New customer registered', 
                    customer: 'Emma Davis', 
                    time: '12 minutes ago', 
                    type: 'customer',
                    amount: null
                  },
                  { 
                    action: 'Menu item updated', 
                    customer: 'System', 
                    time: '15 minutes ago', 
                    type: 'system',
                    amount: null
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'order' ? 'bg-blue-500' :
                        activity.type === 'payment' ? 'bg-green-500' :
                        activity.type === 'completed' ? 'bg-purple-500' :
                        activity.type === 'customer' ? 'bg-orange-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.action}
                          {activity.customer !== 'System' && (
                            <span className="text-gray-600"> - {activity.customer}</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                    {activity.amount && (
                      <span className="text-sm font-semibold text-green-600">{activity.amount}</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <Card className="p-6 border-0 bg-white/80 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'New Order', icon: Plus, color: 'from-blue-500 to-indigo-500' },
                  { name: 'Add Menu Item', icon: Menu, color: 'from-green-500 to-emerald-500' },
                  { name: 'View Reports', icon: BarChart3, color: 'from-purple-500 to-pink-500' },
                  { name: 'Manage Staff', icon: Users, color: 'from-orange-500 to-red-500' },
                ].map((action) => (
                  <button
                    key={action.name}
                    className={`p-4 bg-gradient-to-r ${action.color} rounded-xl text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
                  >
                    <action.icon className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">{action.name}</p>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}