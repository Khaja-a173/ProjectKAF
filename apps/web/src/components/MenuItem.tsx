import { useState } from 'react';
import { MenuItem as MenuItemType } from '../types';
import { useCartStore } from '../stores/cartStore';

interface MenuItemProps {
  item: MenuItemType;
}

export function MenuItem({ item }: MenuItemProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity,
      notes: notes.trim() || undefined
    });
    
    setQuantity(1);
    setNotes('');
    setShowDetails(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      {item.image && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
          <span className="text-lg font-bold text-green-600">
            ${item.price.toFixed(2)}
          </span>
        </div>
        
        {item.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
        )}

        {!item.available && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-4">
            <p className="text-red-800 text-sm font-medium">Currently unavailable</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            {showDetails ? 'Hide details' : 'Customize'}
          </button>
          
          {!showDetails && (
            <button
              onClick={handleAddToCart}
              disabled={!item.available}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
          )}
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t space-y-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Quantity:</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  -
                </button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special instructions:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="font-semibold text-gray-900">
                Total: ${(item.price * quantity).toFixed(2)}
              </span>
              <button
                onClick={handleAddToCart}
                disabled={!item.available}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}