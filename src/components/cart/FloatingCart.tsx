import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useCartStore } from '../../state/cartStore';
import PreCheckoutModal from './PreCheckoutModal';
import CheckoutSuccessModal from './CheckoutSuccessModal';
import { formatMoney } from '../../lib/money';

type Props = {
  bottom?: number;   // px offset from bottom
  right?: number;    // px offset from right
};

const Backdrop: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div
    onClick={onClose}
    className="fixed inset-0 bg-black/30 z-[999]"
    aria-hidden="true"
  />
);

const Drawer: React.FC<{ open: boolean; onClose: () => void; children: React.ReactNode }> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <>
      <Backdrop onClose={onClose} />
      <div
        className="fixed right-4 bottom-4 md:right-8 md:bottom-8 z-[1000] w-[92vw] max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="max-h-[70vh] flex flex-col">
          {children}
        </div>
      </div>
    </>
  );
};

type CartTotalsView = {
  subtotal: number;
  tax: number;
  total: number;
  pricing_mode?: 'tax_inclusive' | 'tax_exclusive';
  tax_breakdown?: { name: string; rate: number; amount: number }[];
};
type CartItemView = { menu_item_id: string; name?: string; price?: number; qty: number };
type CartStoreView = {
  items: CartItemView[];
  totals?: CartTotalsView;
  currency?: string;
  add: (id: string, qty?: number) => any;
  updateQty: (id: string, qty: number) => any;
  remove: (id: string) => any;
  ensureCartReady: (createIfMissing?: boolean) => Promise<void>;
  reloadFromServer: () => Promise<void>;
  tableCode?: string;
  checkout: (args?: { customerName?: string; tableCode?: string }) => Promise<{ order_id: string; cart_id?: string; status: string; totals?: CartTotalsView; currency?: string }>;
};

export const FloatingCart: React.FC<Props> = ({ bottom = 24, right = 24 }) => {
  const [open, setOpen] = useState(false);
  const [preCheckoutOpen, setPreCheckoutOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');

  const {
    items,
    totals,
    currency,
    add,
    updateQty,
    remove,
    ensureCartReady,
    reloadFromServer,
    checkout,
    tableCode,
  } = useCartStore() as unknown as CartStoreView;

  useEffect(() => {
    if (open) {
      console.log('[FloatingCart] store totals:', totals);
    }
  }, [open, totals]);

  const itemCount = useMemo(
    () => items?.reduce((sum, it) => sum + (it.qty || 0), 0) ?? 0,
    [items]
  );

  const localTotal = useMemo(
    () => items?.reduce((sum, it) => sum + ((it.price || 0) * (it.qty || 0)), 0) ?? 0,
    [items]
  );

  // When opening the drawer, ensure cart is hydrated
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        // do not force-create; just load what exists
        await ensureCartReady(false);
        await reloadFromServer();
      } catch (e) {
        // if cart missing server-side, store may auto-clear
        // swallow here; UI will show empty cart
        console.warn('cart hydrate on open failed:', e);
      }
    })();
  }, [open, ensureCartReady, reloadFromServer]);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("cart:open", handleOpen);
    return () => {
      window.removeEventListener("cart:open", handleOpen);
    };
  }, []);

  const handleCheckout = useCallback(() => {
    if (!items || items.length === 0) {
      return; // Guard: do not proceed if cart empty
    }
    setOpen(false);
    setPreCheckoutOpen(true);
  }, [items]);

  const handleProceed = async (name: string) => {
    try {
      setCustomerName(name);
      const res = await checkout({ customerName: name, tableCode });
      setPreCheckoutOpen(false);
      setOpen(false);
      setSuccessOpen(true);
    } catch (e: any) {
      console.error('checkout failed', e);
      alert(e?.message || 'Checkout failed');
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        aria-label="Open cart"
        onClick={() => setOpen(true)}
        style={{ bottom, right }}
        className="fixed rounded-full shadow-lg z-[998] bg-orange-500 hover:bg-orange-600 text-white w-14 h-14 flex items-center justify-center transition-all"
      >
        <span className="relative">
          🛒
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-3 text-xs bg-white text-orange-600 font-semibold rounded-full px-1.5 py-0.5 shadow">
              {itemCount}
            </span>
          )}
        </span>
      </button>

      {/* Drawer */}
      <Drawer open={open} onClose={() => setOpen(false)}>
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your Order</h3>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto divide-y">
          {items.length === 0 ? (
            <div className="p-6 text-center text-gray-500 flex flex-col items-center gap-2">
              <div className="animate-bounce text-4xl">🛒</div>
              <p className="mt-2">Your cart is empty</p>
            </div>
          ) : (
            items.map((it) => (
              <div key={it.menu_item_id} className="p-4 flex items-start gap-3">
                <div className="flex-1">
                  <div className="font-medium">{it.name ?? 'Item'}</div>
                  <div className="text-sm text-gray-500">
                    {formatMoney(it.price ?? 0, currency)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-2 h-8 rounded bg-gray-100 hover:bg-gray-200"
                    onClick={() => updateQty(it.menu_item_id, it.qty - 1)}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <div className="w-8 text-center">{it.qty}</div>
                  <button
                    className="px-2 h-8 rounded bg-gray-100 hover:bg-gray-200"
                    onClick={() => add(it.menu_item_id, 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button
                  className="ml-3 text-red-500 hover:text-red-600"
                  onClick={() => remove(it.menu_item_id)}
                  aria-label="Remove item"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="px-4 py-3 border-t bg-gray-50">
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatMoney(localTotal, currency)}</span>
            </div>
            <button
              className="w-full mt-3 h-10 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold"
              onClick={handleCheckout}
            >
              Place Order
            </button>
          </div>
        )}
      </Drawer>

      <PreCheckoutModal
        open={preCheckoutOpen}
        onClose={() => setPreCheckoutOpen(false)}
        items={items}
        totals={totals}
        currency={currency}
        onProceed={handleProceed}
      />

      <CheckoutSuccessModal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        customerName={customerName}
      />
    </>
  );
};

export default FloatingCart;