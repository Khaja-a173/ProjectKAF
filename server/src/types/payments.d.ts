export type PaymentProvider = 'stripe' | 'razorpay' | 'mock';

export interface TenantPaymentConfig {
  provider: PaymentProvider;
  live_mode: boolean;
  currency: string;
  enabled_methods: string[];
  publishable_key?: string;
  secret_key?: string;
}

export interface CreateIntentInput {
  amount: number;
  currency: string;
  order_id?: string;
  method?: string;
  metadata?: Record<string, any>;
}

export interface CaptureInput {
  intent_id: string;
  provider: PaymentProvider;
  metadata?: Record<string, any>;
}

export interface RefundInput {
  payment_id: string;
  amount: number;
  reason?: string;
  provider: PaymentProvider;
}

export interface SplitInput {
  total: number;
  currency: string;
  splits: Array<{
    amount: number;
    payer_type: 'customer' | 'staff';
    note?: string;
  }>;
}

export interface PaymentIntent {
  id: string;
  client_secret: string;
  provider: PaymentProvider;
  status: string;
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
}

export interface PaymentCapture {
  id: string;
  payment_intent_id: string;
  status: 'succeeded' | 'failed';
  captured_at: string;
}

export interface PaymentRefund {
  id: string;
  payment_id: string;
  amount: number;
  status: 'pending' | 'succeeded' | 'failed';
  reason?: string;
}

export interface PaymentSplit {
  id: string;
  total: number;
  currency: string;
  splits: Array<{
    amount: number;
    payer_type: string;
    note?: string;
  }>;
}