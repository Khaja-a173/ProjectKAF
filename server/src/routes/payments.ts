import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { PaymentsService } from '../services/payments.service.js';
import type { CreateIntentInput, CaptureInput, RefundInput, SplitInput } from '../types/payments.js';

const ConfigSchema = z.object({
  provider: z.enum(['stripe', 'razorpay', 'mock']),
  live_mode: z.boolean(),
  currency: z.string().length(3),
  enabled_methods: z.array(z.string()),
  publishable_key: z.string().optional(),
  secret_key: z.string().optional()
});

const CreateIntentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
  order_id: z.string().optional(),
  method: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

const CaptureSchema = z.object({
  intent_id: z.string(),
  provider: z.enum(['stripe', 'razorpay', 'mock']),
  metadata: z.record(z.any()).optional()
});

const RefundSchema = z.object({
  payment_id: z.string(),
  amount: z.number().positive(),
  reason: z.string().optional(),
  provider: z.enum(['stripe', 'razorpay', 'mock'])
});

const SplitSchema = z.object({
  total: z.number().positive(),
  currency: z.string().length(3),
  splits: z.array(z.object({
    amount: z.number().positive(),
    payer_type: z.enum(['customer', 'staff']),
    note: z.string().optional()
  }))
});

export default async function paymentsRoutes(app: FastifyInstance) {
  const service = new PaymentsService(app);

  /**
   * GET /payments/config
   * Get tenant payment configuration
   */
  app.get('/payments/config', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    try {
      const tenantId = req.auth.primaryTenantId;
      if (!tenantId) {
        return reply.code(401).send({ error: 'No tenant access' });
      }

      const { configured, config } = await service.getConfig(tenantId);
      
      if (!configured) {
        return reply.send({ configured: false });
      }

      return reply.send({
        configured: true,
        config: service.maskConfig(config!)
      });
    } catch (err) {
      app.log.error('Failed to get payment config:', err);
      return reply.code(500).send({ error: 'Failed to get payment config' });
    }
  });

  /**
   * PUT /payments/config
   * Update tenant payment configuration
   */
  app.put('/payments/config', {
    preHandler: [app.requireAuth],
    schema: {
      body: ConfigSchema
    }
  }, async (req, reply) => {
    try {
      const tenantId = req.auth.primaryTenantId;
      if (!tenantId) {
        return reply.code(401).send({ error: 'No tenant access' });
      }

      const payload = ConfigSchema.parse(req.body);
      const config = await service.upsertConfig(tenantId, payload);

      return reply.send({
        configured: true,
        config: service.maskConfig(config)
      });
    } catch (err) {
      app.log.error('Failed to update payment config:', err);
      return reply.code(500).send({ error: 'Failed to update payment config' });
    }
  });

  /**
   * POST /payments/intent
   * Create payment intent
   */
  app.post('/payments/intent', {
    preHandler: [app.requireAuth],
    schema: {
      body: CreateIntentSchema
    }
  }, async (req, reply) => {
    try {
      const tenantId = req.auth.primaryTenantId;
      if (!tenantId) {
        return reply.code(401).send({ error: 'No tenant access' });
      }

      const body = CreateIntentSchema.parse(req.body) as CreateIntentInput;
      const intent = await service.createIntent(tenantId, body);

      return reply.send(intent);
    } catch (err: any) {
      if (err.statusCode === 501) {
        return reply.code(501).send({ error: err.message });
      }
      
      app.log.error('Failed to create payment intent:', err);
      return reply.code(500).send({ error: 'Failed to create payment intent' });
    }
  });

  /**
   * POST /payments/capture
   * Capture payment intent
   */
  app.post('/payments/capture', {
    preHandler: [app.requireAuth],
    schema: {
      body: CaptureSchema
    }
  }, async (req, reply) => {
    try {
      const tenantId = req.auth.primaryTenantId;
      if (!tenantId) {
        return reply.code(401).send({ error: 'No tenant access' });
      }

      const body = CaptureSchema.parse(req.body) as CaptureInput;
      const capture = await service.capture(tenantId, body);

      return reply.send(capture);
    } catch (err: any) {
      if (err.statusCode === 501) {
        return reply.code(501).send({ error: err.message });
      }
      
      app.log.error('Failed to capture payment:', err);
      return reply.code(500).send({ error: 'Failed to capture payment' });
    }
  });

  /**
   * POST /payments/refund
   * Create payment refund
   */
  app.post('/payments/refund', {
    preHandler: [app.requireAuth],
    schema: {
      body: RefundSchema
    }
  }, async (req, reply) => {
    try {
      const tenantId = req.auth.primaryTenantId;
      if (!tenantId) {
        return reply.code(401).send({ error: 'No tenant access' });
      }

      const body = RefundSchema.parse(req.body) as RefundInput;
      const refund = await service.refund(tenantId, body);

      return reply.send(refund);
    } catch (err: any) {
      if (err.statusCode === 501) {
        return reply.code(501).send({ error: err.message });
      }
      
      app.log.error('Failed to create refund:', err);
      return reply.code(500).send({ error: 'Failed to create refund' });
    }
  });

  /**
   * POST /payments/split
   * Create payment split
   */
  app.post('/payments/split', {
    preHandler: [app.requireAuth],
    schema: {
      body: SplitSchema
    }
  }, async (req, reply) => {
    try {
      const tenantId = req.auth.primaryTenantId;
      if (!tenantId) {
        return reply.code(401).send({ error: 'No tenant access' });
      }

      const body = SplitSchema.parse(req.body) as SplitInput;
      const split = await service.split(tenantId, body);

      return reply.send(split);
    } catch (err) {
      app.log.error('Failed to create payment split:', err);
      return reply.code(500).send({ error: 'Failed to create payment split' });
    }
  });

  /**
   * POST /payments/webhook/:provider
   * Handle payment provider webhooks
   */
  app.post('/payments/webhook/:provider', async (req, reply) => {
    try {
      const provider = (req.params as any).provider;
      
      if (!['stripe', 'razorpay', 'mock'].includes(provider)) {
        return reply.code(400).send({ error: 'Unsupported provider' });
      }

      // For mock provider, just log and accept
      if (provider === 'mock') {
        app.log.info('Mock webhook received:', req.body);
        return reply.code(202).send({ received: true });
      }

      // For real providers, we'd verify signature here
      // For now, just log and accept
      app.log.info(`${provider} webhook received:`, req.body);

      // Try to record webhook event if table exists
      try {
        await app.supabase
          .from('payment_events')
          .insert({
            provider,
            event_id: `evt_${Date.now()}`,
            payload: req.body,
            received_at: new Date().toISOString()
          });
      } catch (err: any) {
        if (err.code === '42P01') {
          app.log.warn('payment_events table not found');
        } else {
          app.log.warn('Failed to record webhook event:', err);
        }
      }

      return reply.code(202).send({ received: true });
    } catch (err) {
      app.log.error('Webhook processing failed:', err);
      return reply.code(202).send({ received: true }); // Always accept webhooks
    }
  });
}