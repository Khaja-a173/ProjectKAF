import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { PaymentsService } from '../services/payments.service';

const PaymentConfigSchema = z.object({
  provider: z.enum(['stripe', 'razorpay', 'mock']),
  live_mode: z.boolean().default(false),
  currency: z.string().default('USD'),
  enabled_methods: z.array(z.string()).default(['card']),
  publishable_key: z.string().optional(),
  secret_key: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

const CreateIntentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  order_id: z.string().uuid().optional(),
  method: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

const CaptureSchema = z.object({
  intent_id: z.string(),
  provider: z.enum(['stripe', 'razorpay', 'mock']),
  provider_transaction_id: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

const RefundSchema = z.object({
  payment_id: z.string(),
  amount: z.number().positive(),
  provider: z.enum(['stripe', 'razorpay', 'mock']),
  reason: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

const SplitSchema = z.object({
  total: z.number().positive(),
  currency: z.string().default('USD'),
  splits: z.array(z.object({
    amount: z.number().positive(),
    payer_type: z.enum(['customer', 'staff']),
    method: z.string(),
    note: z.string().optional()
  }))
});

export default async function paymentsRoutes(app: FastifyInstance) {
  const service = new PaymentsService(app);

  // GET /payments/config
  app.get('/payments/config', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(401).send({ error: 'tenant_context_missing' });
    }

    try {
      const result = await service.getConfig(tenantId);
      return reply.send(result);
    } catch (err: any) {
      app.log.error(err, 'Failed to get payment config');
      return reply.code(500).send({ error: 'failed_to_get_config' });
    }
  });

  // PUT /payments/config
  app.put('/payments/config', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(401).send({ error: 'tenant_context_missing' });
    }

    try {
      const body = PaymentConfigSchema.parse(req.body);
      const config = await service.upsertConfig(tenantId, body);
      
      return reply.send({
        configured: true,
        config: config
      });
    } catch (err: any) {
      app.log.error(err, 'Failed to update payment config');
      return reply.code(500).send({ error: 'failed_to_update_config' });
    }
  });

  // POST /payments/intent
  app.post('/payments/intent', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(401).send({ error: 'tenant_context_missing' });
    }

    try {
      const body = CreateIntentSchema.parse(req.body);
      const result = await service.createIntent(tenantId, body);
      
      if (result.error) {
        const statusCode = result.status || 400;
        return reply.code(statusCode).send(result);
      }
      
      return reply.code(201).send(result);
    } catch (err: any) {
      app.log.error(err, 'Failed to create payment intent');
      return reply.code(500).send({ error: 'failed_to_create_intent' });
    }
  });

  // POST /payments/capture
  app.post('/payments/capture', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(401).send({ error: 'tenant_context_missing' });
    }

    try {
      const body = CaptureSchema.parse(req.body);
      const result = await service.capture(tenantId, body);
      
      if (result.error) {
        const statusCode = result.status || 400;
        return reply.code(statusCode).send(result);
      }
      
      return reply.send(result);
    } catch (err: any) {
      app.log.error(err, 'Failed to capture payment');
      return reply.code(500).send({ error: 'failed_to_capture_payment' });
    }
  });

  // POST /payments/refund
  app.post('/payments/refund', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(401).send({ error: 'tenant_context_missing' });
    }

    try {
      const body = RefundSchema.parse(req.body);
      const result = await service.refund(tenantId, body);
      
      if (result.error) {
        const statusCode = result.status || 400;
        return reply.code(statusCode).send(result);
      }
      
      return reply.send(result);
    } catch (err: any) {
      app.log.error(err, 'Failed to process refund');
      return reply.code(500).send({ error: 'failed_to_process_refund' });
    }
  });

  // POST /payments/split
  app.post('/payments/split', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(401).send({ error: 'tenant_context_missing' });
    }

    try {
      const body = SplitSchema.parse(req.body);
      const result = await service.split(tenantId, body);
      
      if (result.error) {
        const statusCode = result.status || 400;
        return reply.code(statusCode).send(result);
      }
      
      return reply.send(result);
    } catch (err: any) {
      app.log.error(err, 'Failed to process split payment');
      return reply.code(500).send({ error: 'failed_to_process_split' });
    }
  });

  // POST /payments/webhook/:provider
  app.post('/payments/webhook/:provider', async (req, reply) => {
    const params = z.object({
      provider: z.enum(['stripe', 'razorpay', 'mock'])
    }).parse(req.params);

    try {
      const payload = req.body;
      const eventId = payload.id || payload.event_id || `webhook_${Date.now()}`;
      
      // Try to store webhook event
      try {
        await app.supabase
          .from('payment_events')
          .insert({
            provider: params.provider,
            event_id: eventId,
            tenant_id: payload.tenant_id || null,
            payload: payload,
            received_at: new Date().toISOString()
          });
      } catch (err: any) {
        if (err.code === '42P01') {
          app.log.warn('payment_events table not available, skipping webhook storage');
        }
      }

      app.log.info(`Webhook received from ${params.provider}: ${eventId}`);
      return reply.code(202).send({ received: true });
    } catch (err: any) {
      app.log.error(err, 'Failed to process webhook');
      return reply.code(500).send({ error: 'webhook_processing_failed' });
    }
  });
}