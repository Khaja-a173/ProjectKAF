import React, { useEffect, useMemo, useCallback } from "react";
import { DineInOrder } from "../types/session";
import { useCartStore } from "../state/cartStore";
import { CheckCircle, Clock, Eye, ChefHat, X } from "lucide-react";

interface OrderSuccessModalProps {
  order: DineInOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder: () => void;
  onBrowseMenu: () => void;
}

export default function OrderSuccessModal({
  order,
  isOpen,
  onClose,
  onTrackOrder,
  onBrowseMenu,
}: OrderSuccessModalProps) {
  const clearAfterCheckout = useCartStore((s) => s.clearAfterCheckout);

  const clearClientCart = useCallback(() => {
    try {
      clearAfterCheckout?.();
    } catch {}
    try {
      localStorage.removeItem('cart_id');
      localStorage.removeItem('cart_mode');
      localStorage.removeItem('table_code');
    } catch {}
  }, [clearAfterCheckout]);

  const handleTrack = useCallback(() => {
    clearClientCart();
    try { onTrackOrder(); } catch {}
  }, [clearClientCart, onTrackOrder]);

  const handleBrowse = useCallback(() => {
    clearClientCart();
    try { onBrowseMenu(); } catch {}
  }, [clearClientCart, onBrowseMenu]);

  const handleClose = useCallback(() => {
    clearClientCart();
    try { onBrowseMenu(); } catch {}
    try { onClose(); } catch {}
  }, [clearClientCart, onBrowseMenu, onClose]);

  // Prefer order-provided currency; fall back to INR
  const currency = (order as any)?.currency || (order as any)?.cartCurrency || "INR";
  const formatMoney = useMemo(() => {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency });
    } catch {
      return { format: (n: number) => `${currency} ${n.toFixed(2)}` } as Intl.NumberFormat;
    }
  }, [currency]);

  // When the modal opens with a confirmed order, clear client cart state so next add starts a fresh cart
  useEffect(() => {
    if (isOpen && order) {
      clearClientCart();
    }
  }, [isOpen, order, clearClientCart]);

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-xl w-full max-w-md relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-success-title"
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h2 id="order-success-title" className="text-2xl font-bold text-gray-900 mb-2">
            Order Placed!
          </h2>
          <p className="text-gray-600 mb-6">
            Your order has been sent to the kitchen. We'll notify you when it's
            ready.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Order Number
              </span>
              <span className="text-sm font-bold text-gray-900">
                {order.orderNumber}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Table</span>
              <span className="text-sm font-bold text-gray-900">
                {order.tableId}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Items</span>
              <span className="text-sm font-bold text-gray-900">
                {order.items.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total</span>
              <span className="text-sm font-bold text-gray-900">
                {formatMoney.format(Number((order as any).totalAmount ?? 0))}
              </span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Estimated Ready Time
              </span>
            </div>
            <p className="text-sm text-blue-800">
              15-20 minutes • We'll update you in real-time
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleTrack}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Eye className="w-5 h-5" />
              <span>Track Live Order</span>
            </button>

            <button
              onClick={handleBrowse}
              className="w-full bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
            >
              <ChefHat className="w-5 h-5" />
              <span>Browse Menu</span>
            </button>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Your order will appear in Order Management for staff review and
                confirmation.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}