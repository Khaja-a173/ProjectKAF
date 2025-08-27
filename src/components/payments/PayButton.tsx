import { useState } from 'react';
import { createPaymentIntent, capturePayment } from '../../lib/api';
import { CreditCard, Loader, CheckCircle, AlertTriangle } from 'lucide-react';

interface PayButtonProps {
  amount: number;
  currency: string;
  orderId?: string;
  method: string;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export default function PayButton({
  amount,
  currency,
  orderId,
  method,
  onSuccess,
  onError,
  disabled = false
}: PayButtonProps) {
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const formatAmount = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  };

  const handlePayment = async () => {
    if (processing || disabled) return;

    try {
      setProcessing(true);
      setStatus('processing');

      // Create payment intent
      const intentResponse = await createPaymentIntent({
        amount,
        currency,
        order_id: orderId,
        method
      });

      if (intentResponse.error) {
        if (intentResponse.status === 501) {
          onError('Payment provider not configured yet. Please contact restaurant admin.');
          setStatus('error');
          return;
        }
        throw new Error(intentResponse.message || 'Failed to create payment intent');
      }

      // For mock provider, immediately capture
      if (intentResponse.provider === 'mock') {
        const captureResponse = await capturePayment({
          intent_id: intentResponse.intent_id,
          provider: 'mock'
        });

        if (captureResponse.success) {
          setStatus('success');
          onSuccess({
            transaction_id: captureResponse.transaction_id,
            amount,
            currency,
            method
          });
        } else {
          throw new Error('Payment capture failed');
        }
      } else {
        // Real providers would show payment form here
        onError('Real payment processing requires provider configuration');
        setStatus('error');
      }

    } catch (err: any) {
      console.error('Payment failed:', err);
      onError(err.message || 'Payment processing failed');
      setStatus('error');
    } finally {
      setProcessing(false);
    }
  };

  const getButtonContent = () => {
    switch (status) {
      case 'processing':
        return (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="w-5 h-5" />
            <span>Payment Successful</span>
          </>
        );
      case 'error':
        return (
          <>
            <AlertTriangle className="w-5 h-5" />
            <span>Try Again</span>
          </>
        );
      default:
        return (
          <>
            <CreditCard className="w-5 h-5" />
            <span>Pay {formatAmount(amount, currency)}</span>
          </>
        );
    }
  };

  const getButtonColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || processing}
      className={`w-full py-4 px-6 rounded-xl text-white font-semibold transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${getButtonColor()}`}
    >
      {getButtonContent()}
    </button>
  );
}