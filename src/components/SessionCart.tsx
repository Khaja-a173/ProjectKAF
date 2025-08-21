import React, { useState } from 'react'
import { SessionCart, CartItem } from '../types/session'
import { ShoppingCart, Plus, Minus, Trash2, Clock, Leaf, Flame, Edit, X } from 'lucide-react'

interface SessionCartProps {
  cart: SessionCart | null
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemoveItem: (itemId: string) => void
  onPlaceOrder: () => void
  onEditItem?: (item: CartItem) => void
  disabled?: boolean
}

export default function SessionCartComponent({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  onEditItem,
  disabled = false
}: SessionCartProps) {
  const [showOrderReview, setShowOrderReview] = useState(false)

  if (!cart) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
        <div className="text-center py-8">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No active cart</p>
          <p className="text-sm text-gray-400">Select a table to start ordering</p>
        </div>
      </div>
    )
  }

  const getDietaryIcons = (item: CartItem) => {
    const icons = []
    if (item.isVegan) icons.push(<Leaf key="vegan" className="w-3 h-3 text-green-600" title="Vegan" />)
    else if (item.isVegetarian) icons.push(<Leaf key="vegetarian" className="w-3 h-3 text-green-500" title="Vegetarian" />)
    
    if (item.spicyLevel > 0) {
      icons.push(
        <div key="spicy" className="flex" title={`Spicy Level: ${item.spicyLevel}`}>
          {[...Array(item.spicyLevel)].map((_, i) => (
            <Flame key={i} className="w-3 h-3 text-red-500" />
          ))}
        </div>
      )
    }
    
    return icons
  }

  const handlePlaceOrder = () => {
    if (cart.items.length === 0) return
    setShowOrderReview(true)
  }

  const confirmPlaceOrder = () => {
    onPlaceOrder()
    setShowOrderReview(false)
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Your Order</h3>
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-600">{cart.items.length} items</span>
            {cart.status === 'locked' && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                Processing
              </span>
            )}
          </div>
        </div>

        {cart.items.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Your cart is empty</p>
            <p className="text-sm text-gray-400">Add items to get started</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {cart.items.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">${item.price} each</p>
                      {item.specialInstructions && (
                        <p className="text-xs text-orange-600 mt-1">
                          Note: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {getDietaryIcons(item)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={disabled || cart.status === 'locked'}
                        className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={disabled || cart.status === 'locked'}
                        className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      {onEditItem && (
                        <button
                          onClick={() => onEditItem(item)}