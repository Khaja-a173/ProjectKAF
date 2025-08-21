import { useState } from 'react';
import { useCartStore } from '../stores/cartStore';
import { useOrderStore } from '../stores/orderStore';

export function Cart() {
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { items, removeItem, updateQuantity, clearCart, total } = useCartStore();
  const { createOrder } = useOrderStore();

  const handleSubmitOrder = async () => {
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      await createOrder({
        customerName: customerName.trim() || undefined,
        tableNumber: tableNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        items: items.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          notes: item.notes
        }))
      });

      clearCart();
      setCustomerName('');
      setTableNumber('');
      setNotes('');
      
      // Show success message
      alert('Order placed successfully!');
    } catch (error) {
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Cart</h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9" />
            </svg>
          </div>
          <p className="text-gray-500">Your cart is empty</p>
          <p className="text-sm text-gray-400 mt-1">Add some delicious items to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Your Cart</h2>
      </div>

      <div className="p-6 space-y-4">
        {items.map((item) => (
          <div key={`${item.menuItemId}-${item.notes || ''}`} className="flex items-center space-x-4">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{item.name}</h4>
              {item.notes && (
                <p className="text-sm text-gray-500 italic">Note: {item.notes}</p>
              )}
              <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateQuantity(item.menuItemId, item.notes, Math.max(1, item.quantity - 1))}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                -
              </button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.menuItemId, item.notes, item.quantity + 1)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                +
              </button>
            </div>

            <div className="text-right">
              <p className="font-medium text-gray-900">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
              <button
                onClick={() => removeItem(item.menuItemId, item.notes)}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Optional"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Table Number
            </label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Optional"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special instructions for the entire order..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={2}
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <p className="text-lg font-semibold text-gray-900">
              Total: ${total.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">
              {items.reduce((sum, item) => sum + item.quantity, 0)} items
            </p>
          </div>
          
          <button
            onClick={handleSubmitOrder}
            disabled={isSubmitting}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}