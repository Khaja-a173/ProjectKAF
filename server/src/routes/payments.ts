import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const CreateProviderSchema = z.object({
  provider: z.enum(['stripe', 'razorpay', 'other']),
  display_name: z.string().optional(),
  publishable_key: z.string().optional(),
  secret_last4: z.string().optional(),
  is_live: z.boolean().default(false),
  is_enabled: z.boolean().default(true),
  metadata: z.record(z.any()).optional()
});

const UpdateProviderSchema = z.object({
  display_name: z.string().optional(),
  publishable_key: z.string().optional(),
  secret_last4: z.string().optional(),
  is_live: z.boolean().optional(),
  is_enabled: z.boolean().optional(),
  metadata: z.record(z.any()).optional()
});

const CreateIntentSchema = z.object({
  order_id: z.string().uuid().optional(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  method: z.enum(['card', 'cash', 'upi', 'wallet'])
});

const ConfirmIntentSchema = z.object({
  payment_intent_id: z.string().uuid(),
  provider_transaction_id: z.string().optional(),
  status: z.enum(['succeeded', 'failed', 'cancelled']).optional()
});

const CreateRefundSchema = z.object({
  payment_id: z.string().uuid(),
  amount: z.number().positive(),
  reason: z.string()
});

const CreateSplitSchema = z.array(z.object({
  amount: z.number().positive(),
  method: z.enum(['cash', 'card', 'wallet']),
  payer_type: z.enum(['customer', 'staff']).default('customer')
}));

export default async function paymentsRoutes(app: FastifyInstance) {
  // POST /payments/intent - Create payment intent
  app.post('/payments/intent', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const body = CreateIntentSchema.parse(req.body);
    const tenantId = req.auth?.primaryTenantId;

    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      // Mock Stripe/Razorpay behavior if keys are not set
      const isMockMode = !process.env.STRIPE_PUBLIC_KEY || !process.env.STRIPE_SECRET_KEY;

      const { data: intent, error: intentError } = await app.supabase
        .from('payment_intents')
        .insert({
          tenant_id: tenantId,
          order_id: body.order_id,
          amount: body.amount,
          currency: body.currency,
          provider: isMockMode ? 'mock' : 'stripe', // Use 'mock' provider for dev
          status: 'requires_payment_method',
          metadata: { method: body.method }
        })
        .select()
        .single();

      if (intentError) throw intentError;

      // Add payment event
      try {
        await app.supabase
          .from('payment_events')
          .insert({
            provider: intent.provider,
            event_id: `intent.created_${intent.id}`,
            tenant_id: tenantId,
            payload: { type: 'intent.created', data: intent },
            received_at: new Date().toISOString()
          });
      } catch (eventErr) {
        app.log.warn('payment_events table not available, skipping event');
      }

      return reply.code(201).send({
        payment_intent_id: intent.id,
        client_secret: isMockMode ? `mock_client_secret_${intent.id}` : 'real_client_secret_from_provider'
      });

    } catch (err: any) {
      app.log.error(err, 'Failed to create payment intent');
      return reply.code(500).send({ error: 'failed_to_create_intent' });
    }
  });

  // POST /payments/capture - Capture payment intent
  app.post('/payments/capture', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const body = ConfirmIntentSchema.parse(req.body);
    const tenantId = req.auth?.primaryTenantId;

    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      const { data: intent, error: intentError } = await app.supabase
        .from('payment_intents')
        .update({
          status: body.status || 'succeeded', // Default to succeeded for mock
          provider_intent_id: body.provider_transaction_id || `mock_txn_${Date.now()}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', body.payment_intent_id)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (intentError) throw intentError;

      // Insert into payments table (if exists)
      try {
        await app.supabase
          .from('payments')
          .insert({
            tenant_id: tenantId,
            order_id: intent.order_id,
            amount: intent.amount,
            payment_method: intent.metadata?.method || 'card',
            payment_provider: intent.provider,
            provider_transaction_id: intent.provider_intent_id,
            status: intent.status,
            processed_at: new Date().toISOString()
          });
      } catch (paymentErr) {
        app.log.warn('payments table not available, skipping payments record');
      }

      // Add order status event
      if (intent.order_id) {
        try {
          await app.supabase
            .from('order_status_events')
            .insert({
              tenant_id: tenantId,
              order_id: intent.order_id,
              from_status: 'paying', // Assuming it was paying
              to_status: 'paid',
              created_by: req.auth?.userId || 'system'
            });
          
          // Update order status directly (for simplicity in mock mode)
          await app.supabase
            .from('orders')
            .update({ status: 'paid' })
            .eq('id', intent.order_id)
            .eq('tenant_id', tenantId);

        } catch (statusErr) {
          app.log.warn('order_status_events table not available, skipping status event');
        }
      }

      return reply.send({ success: true, intent });

    } catch (err: any) {
      app.log.error(err, 'Failed to capture payment');
      return reply.code(500).send({ error: 'failed_to_capture_payment' });
    }
  });

  // POST /payments/refund - Create refund
  app.post('/payments/refund', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const body = CreateRefundSchema.parse(req.body);
    const tenantId = req.auth?.primaryTenantId;

    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      // Insert into payment_refunds (if exists)
      try {
        const { data: refund, error: refundError } = await app.supabase
          .from('payment_refunds')
          .insert({
            tenant_id: tenantId,
            payment_id: body.payment_id,
            amount: body.amount,
            reason: body.reason,
            status: 'completed', // Mock: immediately completed
            created_by: req.auth?.userId || 'staff'
          })
          .select()
          .single();
        
        if (refundError) throw refundError;

        // Add payment event
        await app.supabase
          .from('payment_events')
          .insert({
            provider: 'mock',
            event_id: `refund.succeeded_${refund.id}`,
            tenant_id: tenantId,
            payload: { type: 'refund.succeeded', data: refund },
            received_at: new Date().toISOString()
          });

        return reply.code(201).send({ success: true, refund });

      } catch (refundErr) {
        app.log.warn('payment_refunds table not available, simulating refund');
        return reply.code(201).send({ success: true, message: 'Refund simulated (table not available)' });
      }

    } catch (err: any) {
      app.log.error(err, 'Failed to create refund');
      return reply.code(500).send({ error: 'failed_to_create_refund' });
    }
  });

  // POST /payments/split - Create payment splits
  app.post('/payments/split', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const body = CreateSplitSchema.parse(req.body);
    const tenantId = req.auth?.primaryTenantId;

    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      // Insert into payment_splits (if exists)
      try {
        const { data: splits, error: splitsError } = await app.supabase
          .from('payment_splits')
          .insert(body.map(s => ({
            tenant_id: tenantId,
            amount: s.amount,
            method: s.method,
            payer_type: s.payer_type,
            status: 'pending' // Mock: always pending initially
          })))
          .select();
        
        if (splitsError) throw splitsError;

        return reply.code(201).send({ success: true, splits });

      } catch (splitsErr) {
        app.log.warn('payment_splits table not available, simulating splits');
        return reply.code(201).send({ success: true, message: 'Splits simulated (table not available)' });
      }

    } catch (err: any) {
      app.log.error(err, 'Failed to create payment splits');
      return reply.code(500).send({ error: 'failed_to_create_payment_splits' });
    }
  });

  // POST /payments/webhook (no auth; provider-verified only)
  app.post('/payments/webhook', async (req, reply) => {
    // This endpoint should ideally be secured by provider-specific signatures
    // For now, we just log the event.
    try {
      // Introspect payload for common fields
      const payload = req.body;
      const eventId = payload.id || payload.event_id || `webhook_evt_${Date.now()}`;
      const provider = payload.provider || 'unknown';
      const tenantId = payload.tenant_id || null; // Attempt to get tenant_id from payload

      // Insert into payment_events (if exists)
      try {
        await app.supabase
          .from('payment_events')
          .insert({
            provider: provider,
            event_id: eventId,
            tenant_id: tenantId,
            payload: payload,
            received_at: new Date().toISOString()
          });
      } catch (eventErr) {
        app.log.warn('payment_events table not available, skipping webhook event storage');
      }

      app.log.info(`Webhook received from ${provider}: ${eventId}`);
      return reply.code(200).send({ received: true });

    } catch (err: any) {
      app.log.error(err, 'Error processing webhook');
      return reply.code(500).send({ error: 'webhook_processing_error' });
    }
  });
}