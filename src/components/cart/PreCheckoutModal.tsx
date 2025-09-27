import React, { useEffect, useRef, useState } from 'react';
import { formatMoney } from '../../lib/money';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { useCartStore } from '../../state/cartStore';
import { cartApi, getTenantId, getUserId } from '../../lib/api';

interface PreCheckoutModalProps {
  open: boolean;
  onClose: () => void;
  items: any[];
  totals: any;
  currency?: string;
  onProceed: (customerName: string) => void;
}

const PreCheckoutModal: React.FC<PreCheckoutModalProps> = ({ open, onClose, items, totals, currency, onProceed }) => {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [snap, setSnap] = useState<{ items: any[]; totals: any; currency?: string } | null>(null);
  const [loadingSnap, setLoadingSnap] = useState(false);
  const viewItems = snap?.items ?? items;
  const viewTotals = snap?.totals ?? totals;
  const cur = (snap?.currency ?? currency) ?? 'INR';
  const pricingMode: 'tax_inclusive' | 'tax_exclusive' | undefined = viewTotals?.pricing_mode;
  const taxLabel = pricingMode === 'tax_exclusive' ? 'Tax (added)' : 'Tax (included)';

  useEffect(() => {
    if (open && inputRef.current) {
      // Give the dialog a tick to mount then focus
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        setLoadingSnap(true);
        const store = useCartStore.getState() as any;
        await store.ensureCartReady?.(false);

        const tenantId = getTenantId?.() as string | undefined;
        const cartId = (useCartStore.getState() as any).cartId as string | undefined;
        const userId = getUserId?.(); // ensures public user id exists
        if (!tenantId || !cartId) return;

        // ✅ Use shared API client (adds Authorization, X-Tenant-Id, X-User-Id, etc.)
        const summary: any = await cartApi.get(tenantId, cartId);
        if (!cancelled) {
          const totals = summary.totals ?? {
            subtotal: summary.subtotal,
            tax: summary.tax,
            total: summary.total,
            pricing_mode: summary.pricing_mode,
            tax_breakdown: summary.tax_breakdown ?? [],
          };
          setSnap({ items: summary.items || [], totals, currency: summary.currency });
          console.log('[PreCheckoutModal] API summary ->', {
            subtotal: totals?.subtotal,
            tax: totals?.tax,
            total: totals?.total,
            pricing_mode: totals?.pricing_mode,
            tax_breakdown: totals?.tax_breakdown,
          });
        }

        // If server still returns zero tax with items present, retry once after a short delay
        if (!cancelled && (summary?.items?.length ?? 0) > 0) {
          const t = summary.totals ?? summary;
          if (t?.tax === 0 || t?.tax === undefined) {
            setTimeout(async () => {
              try {
                const again: any = await cartApi.get(tenantId!, cartId!);
                if (!cancelled) {
                  const totals2 = again.totals ?? {
                    subtotal: again.subtotal,
                    tax: again.tax,
                    total: again.total,
                    pricing_mode: again.pricing_mode,
                    tax_breakdown: again.tax_breakdown ?? [],
                  };
                  setSnap({ items: again.items || [], totals: totals2, currency: again.currency });
                  console.log('[PreCheckoutModal] API summary retry ->', {
                    subtotal: totals2?.subtotal,
                    tax: totals2?.tax,
                    total: totals2?.total,
                    pricing_mode: totals2?.pricing_mode,
                    tax_breakdown: totals2?.tax_breakdown,
                  });
                }
              } catch {}
            }, 250);
          }
        }
      } catch (e) {
        setSnap(null);
      } finally {
        if (!cancelled) setLoadingSnap(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const vt = (snap?.totals ?? totals);
    console.log('[PreCheckoutModal] OPEN snapshot ->', {
      pricing_mode: vt?.pricing_mode,
      subtotal: vt?.subtotal,
      tax: vt?.tax,
      total: vt?.total,
      tax_breakdown: vt?.tax_breakdown,
    });
  }, [open, snap, totals]);

  const canProceed = !!name.trim() && Array.isArray(viewItems) && viewItems.length > 0 && !submitting;

  const handleProceed = async () => {
    if (!canProceed) return;
    try {
      setSubmitting(true);
      await onProceed(name.trim());
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 flex items-center justify-center">
        <DialogBackdrop className="fixed inset-0 bg-black/30" />

        <DialogPanel className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          <DialogTitle className="text-lg font-semibold mb-4">Review Order</DialogTitle>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Customer Name</label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleProceed(); } }}
              className="w-full border rounded px-2 py-1"
              placeholder="Enter name"
            />
          </div>

          <div className="mb-4">
            <p className="text-sm">Table: {viewItems?.[0]?.table_code || 'Take away'}</p>
          </div>

          <ul className="divide-y divide-gray-200 mb-4 max-h-40 overflow-y-auto">
            {viewItems?.map((it) => (
              <li key={it.menu_item_id} className="py-2 flex justify-between text-sm">
                <span>{it.name} × {it.qty}</span>
                <span>
                  {formatMoney((it.price ?? 0) * (it.qty ?? 0), cur)}
                </span>
              </li>
            ))}
          </ul>

          {loadingSnap && (
            <div className="mb-2 text-xs text-gray-500">Fetching latest totals…</div>
          )}

          <div className="mb-4 text-sm space-y-1">
            <p>Subtotal: {formatMoney(viewTotals?.subtotal ?? 0, cur)}</p>
            <p className="font-medium">
              {taxLabel}: {formatMoney(viewTotals?.tax ?? 0, cur)}
            </p>
            {Array.isArray(viewTotals?.tax_breakdown) && viewTotals!.tax_breakdown.length > 1 && (
              <ul className="list-none pl-4 mt-1 text-xs text-gray-600">
                {viewTotals!.tax_breakdown.map((c: any, i: number) => (
                  <li key={i} className="flex items-center justify-between">
                    <span>
                      {(c?.name ?? 'Tax')} {typeof c?.rate === 'number' ? `(${(c.rate * 100).toFixed(2)}%)` : ''}
                    </span>
                    <span>
                      {typeof c?.amount === 'number' ? formatMoney(c.amount, cur) : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="font-semibold">Total: {formatMoney(viewTotals?.total ?? 0, cur)}</p>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-3 py-1 rounded border">Cancel</button>
            <button
              onClick={handleProceed}
              disabled={!canProceed}
              className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Processing…' : 'Proceed'}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default PreCheckoutModal;
