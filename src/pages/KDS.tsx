import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getKdsOrders, advanceKdsOrder } from '../lib/api';
import DashboardHeader from '../components/DashboardHeader';
import {
  ChefHat,
  Clock,
  Play,
  CheckCircle,
  ArrowRight,
  Users,
  Timer,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export default function KDS() {
  const [orders, setOrders] = useState<any>({ queued: [], preparing: [], ready: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadOrders();
    
    // Set up polling if auto-refresh is enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadOrders, 5000); // Poll every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await getKdsOrders();
      setOrders(response || { queued: [], preparing: [], ready: [] });
      setError(null);
    } catch (err: any) {
      console.error('Failed to load KDS orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceOrder = async (orderId: string, toStatus: string) => {
    try {
      await advanceKdsOrder(orderId, toStatus);
      loadOrders(); // Refresh after update
    } catch (err: any) {
      alert('Failed to advance order: ' + err.message);
    }
  };

  const formatElapsedTime = (ageSec: number) => {
    const minutes = Math.floor(ageSec / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const renderOrderCard = (order: any) => (
    <div key={order.order_id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{order.number}</h3>
          <p className="text-sm text-gray-500">
            {order.table_number || 'Takeaway'} • {formatElapsedTime(order.age_sec)}
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {order.items.map((item: any, index: number) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="font-medium">{item.qty}x {item.name}</span>
          </div>
        ))}
      </div>

      <div className="flex space-x-2">
        {/* Determine which button to show based on current lane */}
        {orders.queued.includes(order) && (
          <button
            onClick={() => handleAdvanceOrder(order.order_id, 'preparing')}
            className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Start</span>
          </button>
        )}
        
        {orders.preparing.includes(order) && (
          <button
            onClick={() => handleAdvanceOrder(order.order_id, 'ready')}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Ready</span>
          </button>
        )}
        
        {orders.ready.includes(order) && (
          <button
            onClick={() => handleAdvanceOrder(order.order_id, 'served')}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Served</span>
          </button>
        )}
      </div>
    </div>
  );

  if (loading && orders.queued.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader title="Kitchen Display System" subtitle="Real-time kitchen operations" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading kitchen orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Kitchen Display System" subtitle="Real-time kitchen operations" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Kitchen Orders</h2>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Auto-refresh (5s)</span>
              </label>
              <button
                onClick={loadOrders}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="text-red-800">Error loading kitchen orders: {error}</div>
          </div>
        )}

        {/* Kitchen Lanes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Queued Lane */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Queued</h3>
                  <p className="text-sm text-gray-600">New orders waiting</p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  {orders.queued.length}
                </span>
              </div>
            </div>
            <div className="p-4">
              {orders.queued.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No queued orders</p>
                </div>
              ) : (
                orders.queued.map(renderOrderCard)
              )}
            </div>
          </div>

          {/* Preparing Lane */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Preparing</h3>
                  <p className="text-sm text-gray-600">Currently cooking</p>
                </div>
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  {orders.preparing.length}
                </span>
              </div>
            </div>
            <div className="p-4">
              {orders.preparing.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ChefHat className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No orders preparing</p>
                </div>
              ) : (
                orders.preparing.map(renderOrderCard)
              )}
            </div>
          </div>

          {/* Ready Lane */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Ready</h3>
                  <p className="text-sm text-gray-600">Ready for pickup</p>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {orders.ready.length}
                </span>
              </div>
            </div>
            <div className="p-4">
              {orders.ready.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No orders ready</p>
                </div>
              ) : (
                orders.ready.map(renderOrderCard)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}