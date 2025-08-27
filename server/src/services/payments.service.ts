import type { FastifyInstance } from 'fastify';
import type { 
  PaymentProvider, 
  TenantPaymentConfig, 
  CreateIntentInput, 
  CaptureInput, 
  RefundInput, 
  SplitInput,
  PaymentIntent,
  PaymentCapture,
  PaymentRefund,
  PaymentSplit
} from '../types/payments.js';

// In-memory fallback for when DB tables don't exist yet
const configFallback = new Map<string, TenantPaymentConfig>();

export class PaymentsService {
  constructor(private app: FastifyInstance) {}

  async getConfig(tenantId: string): Promise<{ configured: boolean; config?: TenantPaymentConfig }> {
    try {
      const { data, error } = await this.app.supabase
        .from('payment_providers')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_enabled', true)
        .single();

      if (error) {
        // Check if table doesn't exist (42P01)
        if (error.code === '42P01') {
          this.app.log.warn('payment_providers table not found, using fallback');
          const fallbackConfig = configFallback.get(tenantId);
          return fallbackConfig 
            ? { configured: true, config: fallbackConfig }
            : { configured: false };
        }
        
        // No config found
        if (error.code === 'PGRST116') {
          return { configured: false };
        }
        
        throw error;
      }

      const config: TenantPaymentConfig = {
        provider: data.provider as PaymentProvider,
        live_mode: data.is_live,
        currency: data.currency || 'USD',
        enabled_methods: data.enabled_methods || ['card'],
        publishable_key: data.publishable_key,
        secret_key: data.secret_key
      };

      return { configured: true, config };
    } catch (err) {
      this.app.log.warn('Failed to load payment config, using fallback:', err);
      const fallbackConfig = configFallback.get(tenantId);
      return fallbackConfig 
        ? { configured: true, config: fallbackConfig }
        : { configured: false };
    }
  }

  async upsertConfig(tenantId: string, payload: TenantPaymentConfig): Promise<TenantPaymentConfig> {
    try {
      const { data, error } = await this.app.supabase
        .from('payment_providers')
        .upsert({
          tenant_id: tenantId,
          provider: payload.provider,
          is_live: payload.live_mode,
          currency: payload.currency,
          enabled_methods: payload.enabled_methods,
          publishable_key: payload.publishable_key,
          secret_key: payload.secret_key,
          is_enabled: true
        })
        .select()
        .single();

      if (error) {
        // If table doesn't exist, use in-memory fallback
        if (error.code === '42P01') {
          this.app.log.warn('payment_providers table not found, using in-memory fallback');
          configFallback.set(tenantId, payload);
          return payload;
        }
        throw error;
      }

      return {
        provider: data.provider as PaymentProvider,
        live_mode: data.is_live,
        currency: data.currency,
        enabled_methods: data.enabled_methods,
        publishable_key: data.publishable_key,
        secret_key: data.secret_key
      };
    } catch (err) {
      this.app.log.warn('Failed to save payment config, using in-memory fallback:', err);
      configFallback.set(tenantId, payload);
      return payload;
    }
  }

  async createIntent(tenantId: string, body: CreateIntentInput): Promise<PaymentIntent> {
    const { configured, config } = await this.getConfig(tenantId);

    if (!configured || !config) {
      throw new Error('Payment provider not configured');
    }

    if (config.provider === 'mock') {
      const mockIntent: PaymentIntent = {
        id: `mock_${Date.now()}`,
        client_secret: `mock_secret_${Date.now()}`,
        provider: 'mock',
        status: 'requires_capture',
        amount: body.amount,
        currency: body.currency,
        metadata: body.metadata
      };

      // Try to record in payment_intents table if it exists
      try {
        await this.app.supabase
          .from('payment_intents')
          .insert({
            tenant_id: tenantId,
            order_id: body.order_id,
            amount: body.amount,
            currency: body.currency,
            provider: 'mock',
            status: 'requires_capture',
            provider_intent_id: mockIntent.id,
            client_secret_last4: mockIntent.client_secret.slice(-4),
            metadata: body.metadata
          });
      } catch (err: any) {
        if (err.code !== '42P01') {
          this.app.log.warn('Failed to record payment intent:', err);
        }
      }

      return mockIntent;
    }

    if (config.provider === 'stripe' || config.provider === 'razorpay') {
      if (!config.publishable_key || !config.secret_key) {
        const error = new Error(`${config.provider} provider not fully configured`);
        (error as any).statusCode = 501;
        throw error;
      }
      
      // TODO: Implement actual Stripe/Razorpay SDK integration
      const error = new Error(`${config.provider} integration not implemented yet`);
      (error as any).statusCode = 501;
      throw error;
    }

    throw new Error('Unsupported payment provider');
  }

  async capture(tenantId: string, body: CaptureInput): Promise<PaymentCapture> {
    const { configured, config } = await this.getConfig(tenantId);

    if (!configured || !config) {
      throw new Error('Payment provider not configured');
    }

    if (config.provider === 'mock') {
      const capture: PaymentCapture = {
        id: `capture_${Date.now()}`,
        payment_intent_id: body.intent_id,
        status: 'succeeded',
        captured_at: new Date().toISOString()
      };

      // Try to record payment event
      try {
        await this.app.supabase
          .from('payment_events')
          .insert({
            tenant_id: tenantId,
            provider: 'mock',
            event_id: `evt_${Date.now()}`,
            payload: { type: 'payment.captured', data: capture }
          });
      } catch (err: any) {
        if (err.code !== '42P01') {
          this.app.log.warn('Failed to record payment event:', err);
        }
      }

      return capture;
    }

    // For other providers, return 501 if not configured
    const error = new Error(`${config.provider} capture not implemented yet`);
    (error as any).statusCode = 501;
    throw error;
  }

  async refund(tenantId: string, body: RefundInput): Promise<PaymentRefund> {
    const { configured, config } = await this.getConfig(tenantId);

    if (!configured || !config) {
      throw new Error('Payment provider not configured');
    }

    if (config.provider === 'mock') {
      const refund: PaymentRefund = {
        id: `refund_${Date.now()}`,
        payment_id: body.payment_id,
        amount: body.amount,
        status: 'succeeded',
        reason: body.reason
      };

      // Try to record payment event
      try {
        await this.app.supabase
          .from('payment_events')
          .insert({
            tenant_id: tenantId,
            provider: 'mock',
            event_id: `evt_${Date.now()}`,
            payload: { type: 'refund.succeeded', data: refund }
          });
      } catch (err: any) {
        if (err.code !== '42P01') {
          this.app.log.warn('Failed to record payment event:', err);
        }
      }

      return refund;
    }

    // For other providers, return 501 if not configured
    const error = new Error(`${config.provider} refund not implemented yet`);
    (error as any).statusCode = 501;
    throw error;
  }

  async split(tenantId: string, body: SplitInput): Promise<PaymentSplit> {
    // Validate splits total matches
    const splitsTotal = body.splits.reduce((sum, split) => sum + split.amount, 0);
    if (Math.abs(splitsTotal - body.total) > 0.01) {
      throw new Error('Split amounts must equal total');
    }

    const split: PaymentSplit = {
      id: `split_${Date.now()}`,
      total: body.total,
      currency: body.currency,
      splits: body.splits
    };

    // Try to record in payment_splits table if it exists
    try {
      await this.app.supabase
        .from('payment_splits')
        .insert({
          tenant_id: tenantId,
          total: body.total,
          currency: body.currency,
          splits: body.splits
        });
    } catch (err: any) {
      if (err.code !== '42P01') {
        this.app.log.warn('Failed to record payment split:', err);
      }
    }

    return split;
  }

  maskConfig(config: TenantPaymentConfig): TenantPaymentConfig {
    return {
      ...config,
      secret_key: config.secret_key ? `${config.secret_key.substring(0, 8)}...` : undefined
    };
  }
}