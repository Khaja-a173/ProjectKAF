import { useEffect } from 'react';
import { useOrderStore } from '../stores/orderStore';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-green-100 text-green-800',
  served: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusLabels = {
  pending: 'Order Received',
  confirmed: 'Confirmed',
  preparing: 'Being Prepared',
  ready: 'Ready for Pickup',
  served: 'Completed',
  cancelled: 'Cancelled'
};

export function OrderStatus() {
  const { orders, fetchOrders, loading } = useOrderStore();

  useEffect(() => {
    fetchOrders();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
        <p className="text-gray-500">Your orders will appear here once you place them</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Your Orders</h2>
      
      <div className="grid gap-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Order #{order.id.slice(-8)}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
                {order.tableNumber && (
                  <p className="text-sm text-gray-500">Table: {order.tableNumber}</p>
                )}
              </div>
              
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                  {statusLabels[order.status]}
                </span>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  ${order.total.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.menuItem.name}</p>
                    {item.notes && (
                      <p className="text-sm text-gray-500 italic">Note: {item.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {item.quantity}x ${item.price.toFixed(2)}
                    </p>
                    <p className="font-medium text-gray-900">
                      ${(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {order.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Order notes:</span> {order.notes}
                </p>
              </div>
            )}

            {/* Order Progress */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>Order Received</span>
                <span>Preparing</span>
                <span>Ready</span>
                <span>Completed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    order.status === 'pending' ? 'w-1/4 bg-yellow-500' :
                    order.status === 'confirmed' ? 'w-1/4 bg-blue-500' :
                    order.status === 'preparing' ? 'w-2/4 bg-orange-500' :
                    order.status === 'ready' ? 'w-3/4 bg-green-500' :
                    order.status === 'served' ? 'w-full bg-green-600' :
                    'w-0 bg-red-500'
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}