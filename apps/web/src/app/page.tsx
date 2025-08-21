'use client';

import { useState, useEffect } from 'react';
import { MenuGrid } from '../components/MenuGrid';
import { Cart } from '../components/Cart';
import { OrderStatus } from '../components/OrderStatus';
import { Header } from '../components/Header';
import { useMenuStore } from '../stores/menuStore';
import { useCartStore } from '../stores/cartStore';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'menu' | 'orders'>('menu');
  const { fetchMenu, categories, menuItems, loading } = useMenuStore();
  const { items: cartItems } = useCartStore();

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'menu'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Menu
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Orders
            </button>
          </div>
        </div>

        {activeTab === 'menu' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <MenuGrid
                categories={categories}
                menuItems={menuItems}
                loading={loading}
              />
            </div>
            <div className="lg:col-span-1">
              <Cart />
            </div>
          </div>
        ) : (
          <OrderStatus />
        )}

        {/* Floating Cart Button for Mobile */}
        {cartItemCount > 0 && (
          <div className="fixed bottom-4 right-4 lg:hidden">
            <button
              onClick={() => setActiveTab('menu')}
              className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
            >
              <span className="text-sm font-bold">{cartItemCount}</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}