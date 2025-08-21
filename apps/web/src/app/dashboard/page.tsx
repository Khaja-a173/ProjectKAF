'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { 
  BarChart3, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Clock,
  Star,
  AlertCircle
} from 'lucide-react';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  activeCustomers: number;
  averageOrderValue: number;
  pendingOrders: number;
  completedOrdersToday: number;
}

const mockChartData = [
  { name: 'Mon', orders: 45, revenue: 1200 },
  { name: 'Tue', orders: 52, revenue: 1400 },
  { name: 'Wed', orders: 38, revenue: 980 },
  { name: 'Thu', orders: 61, revenue: 1650 },
  { name: 'Fri', orders: 75, revenue: 2100 },
  { name: 'Sat', orders: 89, revenue: 2400 },
  { name: 'Sun', orders: 67, revenue: 1800 },
];

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      const dashboardStats: DashboardStats = {
        totalOrders: 1247,
        totalRevenue: 45678.90,
        activeCustomers: 892,
        averageOrderValue: 36.65,
        pendingOrders: 12,
        completedOrdersToday: 67,
      };

      setStats(dashboardStats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, change, color }: any) => (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm flex items-center mt-2 ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {change > 0 ? '+' : ''}{change}% from last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.user_metadata?.first_name || 'User'}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                Sign Out
              </Button>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.user_metadata?.first_name?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders.toLocaleString()}
            icon={ShoppingCart}
            change={12.5}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Revenue"
            value={`$${stats?.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            change={8.2}
            color="bg-green-500"
          />
          <StatCard
            title="Active Customers"
            value={stats?.activeCustomers.toLocaleString()}
            icon={Users}
            change={-2.1}
            color="bg-purple-500"
          />
          <StatCard
            title="Avg Order Value"
            value={`$${stats?.averageOrderValue}`}
            icon={TrendingUp}
            change={15.3}
            color="bg-orange-500"
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Today's Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-yellow-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Pending Orders</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">{stats?.pendingOrders}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Completed Today</span>
                </div>
                <span className="text-lg font-bold text-green-600">{stats?.completedOrdersToday}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Growth Rate</span>
                </div>
                <span className="text-lg font-bold text-blue-600">+12.5%</span>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { action: 'New order received', customer: 'John Doe', time: '2 minutes ago', type: 'order' },
                { action: 'Payment processed', customer: 'Jane Smith', time: '5 minutes ago', type: 'payment' },
                { action: 'Order completed', customer: 'Mike Johnson', time: '8 minutes ago', type: 'completed' },
                { action: 'New customer registered', customer: 'Sarah Wilson', time: '12 minutes ago', type: 'customer' },
                { action: 'Menu item updated', customer: 'System', time: '15 minutes ago', type: 'system' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'order' ? 'bg-blue-500' :
                    activity.type === 'payment' ? 'bg-green-500' :
                    activity.type === 'completed' ? 'bg-purple-500' :
                    activity.type === 'customer' ? 'bg-orange-500' : 'bg-gray-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.action}</span>
                      {activity.customer !== 'System' && (
                        <span className="text-gray-600"> - {activity.customer}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}