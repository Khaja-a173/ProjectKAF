import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getKdsOrders, advanceOrderFromKds, getKdsLanes, getKdsLatest } from '../lib/api';
import { subscribeOrders } from '../lib/realtime';
import DashboardHeader from '../components/DashboardHeader';
import {
  ChefHat,
  Clock,
  Play,
  CheckCircle,
  ArrowRight,
  Users,
  Timer,
  AlertTriangle
} from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  kitchen_state: string;
  status: string;
  total_amount: number;
  special_instructions?: string;
  created_at: string;
  order_items: Array<{
    id: string;
    quantity: number;
    menu_items: {
      name: string;
      preparation_time?: number;
      image_url?: string;
    };
  }>;
  restaurant_tables?: {
    table_number: string;
  };
}

interface KdsOrders {
  queued: Order[];
  preparing: Order[];
  ready: Order[];
}

interface KdsLaneCounts {
  tenant_id: string;
  queued: number;
  preparing: number;
  ready: number;
}

export default function KDS() {
  const [orders, setOrders] = useState<KdsOrders>({ queued: [], preparing: [], ready: [] });
  const [laneCounts, setLaneCounts] = useState<KdsLaneCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadKdsData();
    
    // Subscribe to real-time updates (if available)
    const subscription = subscribeOrders('550e8400-e29b-41d4-a716-446655440000', (payload) => {
      console.log('KDS order update:', payload);
      loadKdsData(); // Refresh on any change
    });

    // Poll every 5 seconds as a fallback or for counts
    const pollingInterval = setInterval(loadKdsData, 5000);

    return () => {
      subscription.unsubscribe();
      clearInterval(pollingInterval);
    };
  }, []);

  const loadKdsData = async () => {
    try {
      setLoading(true);
      const [ordersResponse, laneCountsResponse] = await Promise.all([
        getKdsOrders(),
        getKdsLanes()
      ]);
      setOrders(ordersResponse.orders || { queued: [], preparing: [], ready: [] });
      setLaneCounts(laneCountsResponse);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load KDS data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = async (orderId: string, newState: string) => {
    try {
      await advanceOrderFromKds(orderId, newState);
      loadKdsData(); // Refresh after update
    } catch (err: any) {
      alert('Failed to update kitchen state: ' + err.message);
    }
  };

  const formatElapsedTime = (createdAt: string) => {
    const minutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const renderOrderCard = (order: Order) => (
    <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{order.order_number}</h3>
          <p className="text-sm text-gray-500">
            {order.restaurant_tables?.table_number || 'Takeaway'} • {formatElapsedTime(order.created_at)}
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">${order.total_amount.toFixed(2)}</div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {order.order_items.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="font-medium">{item.quantity}x {item.menu_items.name}</span>
            {item.menu_items.preparation_time && (
              <div className="flex items-center space-x-1 text-gray-500">
                <Timer className="w-3 h-3" />
                <span>{item.menu_items.preparation_time}m</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {order.special_instructions && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> {order.special_instructions}
          </p>
        </div>
      )}

      <div className="flex space-x-2">
        {order.status === 'new' || order.status === 'pending' || order.status === 'confirmed' ? (
          <button
            onClick={() => handleStateChange(order.id, 'preparing')}
            className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Start</span>
          </button>
        ) : order.status === 'preparing' ? (
          <button
            onClick={() => handleStateChange(order.id, 'ready')}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Ready</span>
          </button>
        ) : order.status === 'ready' ? (
          <button
            onClick={() => handleStateChange(order.id, 'served')}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Served</span>
          </button>
        ) : null}
      </div>
    </div>
  );

  if (loading) {
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
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-8">
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 pb-2">
              Dashboard
            </Link>
            <Link to="/orders" className="text-gray-500 hover:text-gray-700 pb-2">
              Orders
            </Link>
            <Link to="/menu" className="text-gray-500 hover:text-gray-700 pb-2">
              Menu
            </Link>
            <Link to="/tables" className="text-gray-500 hover:text-gray-700 pb-2">
              Tables
            </Link>
            <Link to="/staff" className="text-gray-500 hover:text-gray-700 pb-2">
              Staff
            </Link>
            <Link to="/kds" className="text-orange-600 border-b-2 border-orange-600 pb-2 font-medium">
              Kitchen
            </Link>
            <Link to="/branding" className="text-gray-500 hover:text-gray-700 pb-2">
              Branding
            </Link>
          </div>
        </nav>

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
                  {laneCounts?.queued || 0}
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
                  {laneCounts?.preparing || 0}
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
                  {laneCounts?.ready || 0}
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