import React from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { useCartStore } from '@/state/cartStore';
import { useNavigate } from 'react-router-dom';
import { formatMoney } from '../../lib/money';

export interface CheckoutSuccessModalProps {
  open: boolean;
  onClose: () => void;
  customerName?: string;
}

const CheckoutSuccessModal: React.FC<CheckoutSuccessModalProps> = ({ open, onClose, customerName }) => {
  const { lastOrder } = useCartStore();
  const navigate = useNavigate();

  const orderCustomerName = customerName || (lastOrder as any)?.customer_name || 'N/A';
  const orderTableCode = (lastOrder as any)?.table_code || 'Take away';
  const pricingMode = (lastOrder as any)?.totals?.pricing_mode as 'tax_inclusive' | 'tax_exclusive' | undefined;
  const taxLabel = pricingMode === 'tax_exclusive' ? 'Tax (added)' : 'Tax (included)';

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 flex items-center justify-center">
        <DialogBackdrop className="fixed inset-0 bg-black/30" />

        <DialogPanel className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          <DialogTitle className="text-lg font-semibold mb-4 flex items-center gap-2">
            Order Placed Successfully
            {pricingMode && (
              <span className={`text-xs rounded px-2 py-0.5 ${pricingMode === 'tax_exclusive' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                {pricingMode === 'tax_exclusive' ? 'Tax Exclusive' : 'Tax Inclusive'}
              </span>
            )}
          </DialogTitle>
          <div className="mb-4 text-sm">
            <p><strong>Order ID:</strong> {lastOrder?.order_id}</p>
            <p><strong>Customer:</strong> {orderCustomerName}</p>
            <p><strong>Table:</strong> {orderTableCode}</p>
          </div>
        <div className="mb-4">
          <p className="font-medium">
            {taxLabel}: {formatMoney(lastOrder?.totals?.tax ?? 0, lastOrder?.currency)}
          </p>
          {Array.isArray(lastOrder?.totals?.tax_breakdown) && lastOrder!.totals!.tax_breakdown.length > 1 && (
            <ul className="list-none pl-4 mt-1 text-sm text-gray-600">
              {lastOrder!.totals!.tax_breakdown.map((c: any, i: number) => (
                <li key={i} className="flex items-center justify-between">
                  <span>
                    {c?.name ?? 'Tax'} {typeof c?.rate === 'number' ? `(${(c.rate * 100).toFixed(2)}%)` : ''}
                  </span>
                  <span>
                    {typeof c?.amount === 'number' ? formatMoney(c.amount, lastOrder?.currency) : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="font-semibold">Total: {formatMoney(lastOrder?.totals?.total ?? 0, lastOrder?.currency)}</p>
        </div>
        <div className="mb-4">
          <p className="font-medium mb-1">Items:</p>
          <ul className="list-disc list-inside text-sm">
            {lastOrder?.items?.length
              ? lastOrder.items.map((item: any, idx: number) => (
                  <li key={item.id || idx}>
                    {item.name} x{item.qty} {item.price ? `- ${formatMoney(item.price, lastOrder?.currency)}` : ''}
                  </li>
                ))
              : <li>No items</li>
            }
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => navigate('/live-orders')}
            className="px-3 py-1 rounded bg-green-600 text-white"
          >
            Track Live Order
          </button>
          <button
            onClick={() => navigate('/events')}
            className="px-3 py-1 rounded bg-blue-600 text-white"
          >
            View Events
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded border"
          >
            Close
          </button>
        </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default CheckoutSuccessModal;