'use client';

import { useState, useEffect } from 'react';
import { KitchenDisplay } from '../../components/KitchenDisplay';
import { useOrderStore } from '../../stores/orderStore';

export default function KDSPage() {
  const { orders, fetchOrders, updateOrderStatus, loading } = useOrderStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all');

  useEffect(() => {
    fetchOrders();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status);
    if (filter === 'pending') return ['pending', 'confirmed'].includes(order.status);
    return order.status === filter;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Kitchen Display System</h1>
          
          <div className="flex space-x-2">
            {(['all', 'pending', 'preparing', 'ready'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="ml-2 bg-gray-600 px-2 py-1 rounded-full text-xs">
                  {filteredOrders.length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : (
          <KitchenDisplay
            orders={filteredOrders}
            onUpdateStatus={updateOrderStatus}
          />
        )}
      </main>
    </div>
  );
}