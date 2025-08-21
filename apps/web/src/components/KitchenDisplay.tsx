import { Order } from '../types';

interface KitchenDisplayProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: string) => Promise<void>;
}

const statusButtons = [
  { status: 'confirmed', label: 'Confirm', color: 'bg-blue-600 hover:bg-blue-700' },
  { status: 'preparing', label: 'Start Preparing', color: 'bg-orange-600 hover:bg-orange-700' },
  { status: 'ready', label: 'Mark Ready', color: 'bg-green-600 hover:bg-green-700' },
  { status: 'served', label: 'Mark Served', color: 'bg-gray-600 hover:bg-gray-700' }
];

export function KitchenDisplay({ orders, onUpdateStatus }: KitchenDisplayProps) {
  const getNextActions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return [statusButtons[0]]; // Confirm
      case 'confirmed':
        return [statusButtons[1]]; // Start Preparing
      case 'preparing':
        return [statusButtons[2]]; // Mark Ready
      case 'ready':
        return [statusButtons[3]]; // Mark Served
      default:
        return [];
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'border-l-yellow-500 bg-yellow-50';
      case 'confirmed': return 'border-l-blue-500 bg-blue-50';
      case 'preparing': return 'border-l-orange-500 bg-orange-50';
      case 'ready': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getTimeElapsed = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes === 1) return '1 min ago';
    return `${diffInMinutes} mins ago`;
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">No orders to display</h3>
        <p className="text-gray-500">New orders will appear here automatically</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {orders.map((order) => (
        <div
          key={order.id}
          className={`bg-white rounded-lg border-l-4 shadow-lg ${getStatusColor(order.status)}`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  #{order.id.slice(-6)}
                </h3>
                {order.tableNumber && (
                  <p className="text-sm font-medium text-gray-600">
                    Table {order.tableNumber}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{getTimeElapsed(order.createdAt)}</p>
                <p className="text-sm font-semibold text-gray-900">
                  ${order.total.toFixed(2)}
                </p>
              </div>
            </div>

            {order.customerName && (
              <p className="text-sm text-gray-600 mb-3">
                Customer: {order.customerName}
              </p>
            )}

            <div className="space-y-2 mb-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      {item.quantity}x {item.menuItem.name}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-red-600 font-medium">
                        ⚠️ {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {order.notes && (
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-2 mb-4">
                <p className="text-xs text-yellow-800">
                  <span className="font-semibold">Order notes:</span> {order.notes}
                </p>
              </div>
            )}

            <div className="flex flex-col space-y-2">
              {getNextActions(order.status).map((action) => (
                <button
                  key={action.status}
                  onClick={() => onUpdateStatus(order.id, action.status)}
                  className={`w-full px-4 py-2 rounded-lg text-white font-medium transition-colors ${action.color}`}
                >
                  {action.label}
                </button>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}