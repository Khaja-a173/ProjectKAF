import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { createPaymentIntent, confirmPaymentIntent, getErrorMessage, closeOrderForTable } from "@/lib/api";
import { useCartStore } from "@/state/cartStore";
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  CreditCard, 
  DollarSign, 
  Smartphone, 
  Wallet, 
  CheckCircle
} from 'lucide-react';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order');
  
  const location = useLocation();
  const navState = (location.state || {}) as any;
  const store = useCartStore();

  // Prefer nav-passed summary (fast, no fetch), then store, else zeros
  const summary = useMemo(() => {
    const fromNav = navState?.summary; // { items, totals, currency }
    if (fromNav?.totals?.total != null) return fromNav;
    if (store?.totals?.total != null) return { items: store.items, totals: store.totals, currency: 'INR' };
    return { items: [], totals: { subtotal: 0, tax: 0, total: 0, tax_breakdown: [], pricing_mode: 'tax_inclusive' }, currency: 'INR' };
  }, [navState, store.items, store.totals]);

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'upi' | 'wallet'>('card');
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, Amex'
    },
    {
      id: 'cash',
      name: 'Cash',
      icon: DollarSign,
      description: 'Pay at counter'
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: Smartphone,
      description: 'Google Pay, PhonePe, Paytm'
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: Wallet,
      description: 'Apple Pay, Samsung Pay'
    }
  ];

  const handlePayment = async () => {
    if (!orderId) {
      alert('Missing order id. Please start from the cart or scan flow again.');
      return;
    }

    try {
      setProcessing(true);

      // Amount in the smallest currency unit (e.g., cents)
      const amountCents = Math.round(Number(summary?.totals?.total ?? 0) * 100);

      const intent = await createPaymentIntent({
        order_id: orderId as string,
        amount: amountCents,
        method: paymentMethod
      });

      const intentId = (intent as any)?.id;
      if (typeof intentId !== 'string') {
        throw new Error('Invalid payment intent id');
      }

      const confirmed = await confirmPaymentIntent(intentId);

      if (confirmed.status === 'succeeded') {
        setCompleted(true);
        try {
          // End the active table session and unlock the table server-side
         await closeOrderForTable(orderId as string, 'paid');
        } catch (e) {
          // Do not block the user on this; log and continue to success page
          console.warn('closeOrderForTable failed (non-blocking):', e);
        }
        // Redirect to success page with context
        setTimeout(() => {
          navigate(`/CheckoutSuccess?intent=${confirmed.id}&order=${orderId}`);
        }, 1500);
      } else {
        alert(`Payment status: ${confirmed.status}`);
      }
    } catch (err: any) {
      alert('Payment failed: ' + getErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  };

  if (completed) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your payment has been processed successfully. Redirecting to the success page…
            </p>
            <div className="bg-white rounded-xl p-4">
              <div className="text-sm text-gray-600">
                <p><strong>Order:</strong> {orderId}</p>
                <p><strong>Amount:</strong> {(summary.currency || 'INR')} {Number(summary?.totals?.total ?? 0).toFixed(2)}</p>
                <p><strong>Method:</strong> {paymentMethod.toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {summary.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600">{item.qty}x {item.name}</span>
                  <span className="font-medium">{(summary.currency || 'INR')} {(Number(item.price) * Number(item.qty)).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{summary.currency || 'INR'} {Number(summary.totals.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">{summary.currency || 'INR'} {Number(summary.totals.tax).toFixed(2)}</span>
              </div>
              {summary.totals.tax_breakdown && summary.totals.tax_breakdown.length > 0 && (
                <div className="space-y-1 pl-2">
                  {summary.totals.tax_breakdown.map((tb: any) => (
                    <div key={tb.name} className="flex justify-between text-xs text-gray-500">
                      <span>{tb.name} ({(Number(tb.rate) * 100).toFixed(0)}%)</span>
                      <span>{summary.currency || 'INR'} {Number(tb.amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-blue-600">{summary.currency || 'INR'} {Number(summary.totals.total).toFixed(2)}</span>
              </div>
              {summary?.totals?.pricing_mode && (
                <div className="text-xs text-gray-500 text-right">
                  {summary.totals.pricing_mode === 'tax_exclusive'
                    ? 'Tax exclusive (added on top)'
                    : 'Tax inclusive'}
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods (single payment) */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>

            <div className="space-y-4 mb-6">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as 'card' | 'cash' | 'upi' | 'wallet')}
                  className={`w-full p-4 border-2 rounded-xl transition-colors text-left ${
                    paymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <method.icon className={`w-6 h-6 ${
                      paymentMethod === method.id ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <div className="font-medium text-gray-900">{method.name}</div>
                      <div className="text-sm text-gray-500">{method.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl text-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5" />
                  <span>Pay {(summary.currency || 'INR')} {Number(summary?.totals?.total ?? 0).toFixed(2)}</span>
                </>
              )}
            </button>

            <div className="mt-4 text-center text-sm text-gray-500">
              <p>Secure payment processing • Dev mode simulation</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}