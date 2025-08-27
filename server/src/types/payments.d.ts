export type PaymentProvider = 'stripe' | 'razorpay' | 'mock';

export interface TenantPaymentConfig {
  provider: PaymentProvider;
  live_mode: boolean;
  currency: string;
  enabled_methods: string[];
  publishable_key?: string;
  secret_key?: string;
  metadata?: Record<string, any>;
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
  provider_transaction_id?: string;
  metadata?: Record<string, any>;
}

export interface RefundInput {
  payment_id: string;
  amount: number;
  provider: PaymentProvider;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface SplitInput {
  total: number;
  currency: string;
  splits: Array<{
    amount: number;
    payer_type: 'customer' | 'staff';
    method: string;
    note?: string;
  }>;
}

export interface PaymentIntent {
  id: string;
  tenant_id: string;
  order_id?: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  status: string;
  client_secret?: string;
  provider_intent_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface PaymentWebhookEvent {
  id: string;
  provider: PaymentProvider;
  event_id: string;
  tenant_id?: string;
  payload: any;
  received_at: string;
}