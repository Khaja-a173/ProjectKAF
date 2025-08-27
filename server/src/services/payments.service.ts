import type { FastifyInstance } from 'fastify';
import type { 
  PaymentProvider, 
  TenantPaymentConfig, 
  CreateIntentInput, 
  CaptureInput, 
  RefundInput, 
  SplitInput 
} from '../types/payments';

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
        .maybeSingle();

      if (error) {
        // Check if table doesn't exist (42P01)
        if (error.code === '42P01') {
          this.app.log.warn('payment_providers table not available, using fallback');
          const fallbackConfig = configFallback.get(tenantId);
          return fallbackConfig 
            ? { configured: true, config: fallbackConfig }
            : { configured: false };
        }
        throw error;
      }

      if (!data) {
        return { configured: false };
      }

      // Mask secret key in response
      const config: TenantPaymentConfig = {
        provider: data.provider as PaymentProvider,
        live_mode: data.is_live || false,
        currency: data.currency || 'USD',
        enabled_methods: data.enabled_methods || ['card'],
        publishable_key: data.publishable_key,
        secret_key: data.secret_last4 ? `***${data.secret_last4}` : undefined,
        metadata: data.metadata
      };

      return { configured: true, config };
    } catch (err: any) {
      this.app.log.error(err, 'Failed to get payment config');
      // Check fallback
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
          secret_last4: payload.secret_key ? payload.secret_key.slice(-4) : null,
          is_enabled: true,
          metadata: payload.metadata
        })
        .select()
        .single();

      if (error) {
        // If table doesn't exist, use in-memory fallback
        if (error.code === '42P01') {
          this.app.log.warn('payment_providers table not available, using in-memory fallback');
          configFallback.set(tenantId, payload);
          return payload;
        }
        throw error;
      }

      // Return masked config
      return {
        provider: data.provider as PaymentProvider,
        live_mode: data.is_live || false,
        currency: data.currency || 'USD',
        enabled_methods: data.enabled_methods || ['card'],
        publishable_key: data.publishable_key,
        secret_key: data.secret_last4 ? `***${data.secret_last4}` : undefined,
        metadata: data.metadata
      };
    } catch (err: any) {
      this.app.log.error(err, 'Failed to upsert payment config');
      // Fallback to in-memory storage
      configFallback.set(tenantId, payload);
      return payload;
    }
  }

  async createIntent(tenantId: string, body: CreateIntentInput): Promise<any> {
    const { configured, config } = await this.getConfig(tenantId);

    if (!configured || !config) {
      return {
        error: 'payment_not_configured',
        message: 'Payment provider not configured for this tenant'
      };
    }

    if (config.provider === 'mock') {
      // Mock provider - simulate success
      const intentId = `mock_intent_${Date.now()}`;
      
      // Try to store in payment_intents table if it exists
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
            provider_intent_id: intentId,
            metadata: body.metadata
          });
      } catch (err: any) {
        if (err.code === '42P01') {
          this.app.log.warn('payment_intents table not available, skipping storage');
        }
      }

      return {
        intent_id: intentId,
        client_secret: `mock_secret_${intentId}`,
        provider: 'mock',
        status: 'requires_capture',
        amount: body.amount,
        currency: body.currency
      };
    }

    // Real providers - return 501 until properly configured
    if (config.provider === 'stripe' || config.provider === 'razorpay') {
      if (!config.publishable_key || !config.secret_key) {
        return {
          error: 'provider_not_configured',
          message: `${config.provider} keys not configured`,
          status: 501
        };
      }

      // TODO: Implement actual Stripe/Razorpay SDK integration
      return {
        error: 'not_implemented',
        message: `${config.provider} integration coming soon`,
        status: 501
      };
    }

    return {
      error: 'unsupported_provider',
      message: 'Unsupported payment provider',
      status: 400
    };
  }

  async capture(tenantId: string, body: CaptureInput): Promise<any> {
    const { configured, config } = await this.getConfig(tenantId);

    if (!configured || !config) {
      return {
        error: 'payment_not_configured',
        message: 'Payment provider not configured'
      };
    }

    if (config.provider === 'mock') {
      // Mock capture - simulate success
      try {
        await this.app.supabase
          .from('payment_intents')
          .update({
            status: 'succeeded',
            provider_transaction_id: body.provider_transaction_id || `mock_txn_${Date.now()}`
          })
          .eq('tenant_id', tenantId)
          .eq('provider_intent_id', body.intent_id);
      } catch (err: any) {
        if (err.code === '42P01') {
          this.app.log.warn('payment_intents table not available, skipping update');
        }
      }

      return {
        success: true,
        provider: 'mock',
        transaction_id: body.provider_transaction_id || `mock_txn_${Date.now()}`,
        status: 'succeeded'
      };
    }

    // Real providers
    return {
      error: 'not_implemented',
      message: `${config.provider} capture coming soon`,
      status: 501
    };
  }

  async refund(tenantId: string, body: RefundInput): Promise<any> {
    const { configured, config } = await this.getConfig(tenantId);

    if (!configured || !config) {
      return {
        error: 'payment_not_configured',
        message: 'Payment provider not configured'
      };
    }

    if (config.provider === 'mock') {
      // Mock refund - simulate success
      const refundId = `mock_refund_${Date.now()}`;
      
      try {
        await this.app.supabase
          .from('payment_refunds')
          .insert({
            tenant_id: tenantId,
            payment_id: body.payment_id,
            amount: body.amount,
            reason: body.reason || 'customer_request',
            status: 'completed',
            provider_refund_id: refundId
          });
      } catch (err: any) {
        if (err.code === '42P01') {
          this.app.log.warn('payment_refunds table not available, skipping storage');
        }
      }

      return {
        success: true,
        refund_id: refundId,
        amount: body.amount,
        status: 'completed'
      };
    }

    // Real providers
    return {
      error: 'not_implemented',
      message: `${config.provider} refund coming soon`,
      status: 501
    };
  }

  async split(tenantId: string, body: SplitInput): Promise<any> {
    // Validate split totals
    const splitTotal = body.splits.reduce((sum, split) => sum + split.amount, 0);
    if (Math.abs(splitTotal - body.total) > 0.01) {
      return {
        error: 'invalid_split_total',
        message: 'Split amounts must equal total amount'
      };
    }

    try {
      // Try to store splits if table exists
      const splitRecords = body.splits.map(split => ({
        tenant_id: tenantId,
        amount: split.amount,
        payer_type: split.payer_type,
        method: split.method,
        note: split.note,
        status: 'pending'
      }));

      await this.app.supabase
        .from('payment_splits')
        .insert(splitRecords);

      return {
        success: true,
        splits: body.splits,
        total: body.total,
        currency: body.currency
      };
    } catch (err: any) {
      if (err.code === '42P01') {
        this.app.log.warn('payment_splits table not available, returning validation only');
        return {
          success: true,
          splits: body.splits,
          total: body.total,
          currency: body.currency,
          note: 'Splits validated but not persisted (table not available)'
        };
      }
      throw err;
    }
  }
}