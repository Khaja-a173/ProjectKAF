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
  provider: z.enum(['stripe', 'razorpay', 'other']),
  metadata: z.record(z.any()).optional()
});

const UpdateIntentSchema = z.object({
  status: z.enum(['requires_payment_method', 'processing', 'succeeded', 'failed', 'cancelled']).optional(),
  provider_intent_id: z.string().optional(),
  client_secret_last4: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

export default async function paymentsRoutes(app: FastifyInstance) {
  // GET /payments/providers - List payment providers
  app.get('/payments/providers', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      const { data, error } = await app.supabase
        .from('payment_providers')
        .select('id, provider, display_name, publishable_key, secret_last4, is_live, is_enabled, metadata, created_at, updated_at')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return reply.send({ providers: data || [] });
    } catch (err: any) {
      app.log.error(err, 'Failed to fetch payment providers');
      return reply.code(500).send({ error: 'failed_to_fetch_providers' });
    }
  });

  // POST /payments/providers - Create payment provider
  app.post('/payments/providers', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const body = CreateProviderSchema.parse(req.body);
    const tenantId = req.auth?.primaryTenantId;

    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      const { data, error } = await app.supabase
        .from('payment_providers')
        .insert({
          tenant_id: tenantId,
          provider: body.provider,
          display_name: body.display_name,
          publishable_key: body.publishable_key,
          secret_last4: body.secret_last4,
          is_live: body.is_live,
          is_enabled: body.is_enabled,
          metadata: body.metadata || {}
        })
        .select('id, provider, display_name, publishable_key, secret_last4, is_live, is_enabled, metadata, created_at, updated_at')
        .single();

      if (error) throw error;

      return reply.code(201).send({ provider: data });
    } catch (err: any) {
      app.log.error(err, 'Failed to create payment provider');
      return reply.code(500).send({ error: 'failed_to_create_provider' });
    }
  });

  // PATCH /payments/providers/:id - Update payment provider
  app.patch('/payments/providers/:id', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const params = z.object({
      id: z.string().uuid()
    }).parse(req.params);

    const body = UpdateProviderSchema.parse(req.body);
    const tenantId = req.auth?.primaryTenantId;

    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      const { data, error } = await app.supabase
        .from('payment_providers')
        .update(body)
        .eq('id', params.id)
        .eq('tenant_id', tenantId)
        .select('id, provider, display_name, publishable_key, secret_last4, is_live, is_enabled, metadata, created_at, updated_at')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return reply.code(404).send({ error: 'provider_not_found' });
        }
        throw error;
      }

      return reply.send({ provider: data });
    } catch (err: any) {
      app.log.error(err, 'Failed to update payment provider');
      return reply.code(500).send({ error: 'failed_to_update_provider' });
    }
  });

  // GET /payments/intents - List payment intents
  app.get('/payments/intents', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const query = z.object({
      order_id: z.string().uuid().optional(),
      status: z.string().optional(),
      limit: z.coerce.number().int().positive().max(100).default(50),
      page: z.coerce.number().int().positive().default(1)
    }).parse(req.query);

    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      let queryBuilder = app.supabase
        .from('payment_intents')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (query.order_id) {
        queryBuilder = queryBuilder.eq('order_id', query.order_id);
      }

      if (query.status) {
        queryBuilder = queryBuilder.eq('status', query.status);
      }

      const offset = (query.page - 1) * query.limit;
      queryBuilder = queryBuilder.range(offset, offset + query.limit - 1);

      const { data, error } = await queryBuilder;

      if (error) throw error;

      return reply.send({ 
        intents: data || [], 
        page: query.page, 
        limit: query.limit 
      });
    } catch (err: any) {
      app.log.error(err, 'Failed to fetch payment intents');
      return reply.code(500).send({ error: 'failed_to_fetch_intents' });
    }
  });

  // POST /payments/intents - Create payment intent
  app.post('/payments/intents', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const body = CreateIntentSchema.parse(req.body);
    const tenantId = req.auth?.primaryTenantId;

    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      const { data, error } = await app.supabase
        .from('payment_intents')
        .insert({
          tenant_id: tenantId,
          order_id: body.order_id,
          amount: body.amount,
          currency: body.currency,
          provider: body.provider,
          status: 'requires_payment_method',
          metadata: body.metadata || {}
        })
        .select()
        .single();

      if (error) throw error;

      return reply.code(201).send({ intent: data });
    } catch (err: any) {
      app.log.error(err, 'Failed to create payment intent');
      return reply.code(500).send({ error: 'failed_to_create_intent' });
    }
  });

  // POST /payments/intent - Create payment intent
  app.post('/payments/intent', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const body = z.object({
      order_id: z.string().uuid(),
      amount: z.number().positive(),
      method: z.enum(['card', 'cash', 'upi', 'wallet'])
    }).parse(req.body);

    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      // Verify order exists and belongs to tenant
      const { data: order, error: orderError } = await app.supabase
        .from('orders')
        .select('id, total_amount, status')
        .eq('id', body.order_id)
        .eq('tenant_id', tenantId)
        .single();

      if (orderError || !order) {
        return reply.code(404).send({ error: 'order_not_found' });
      }

      // Create payment intent
      const { data: intent, error: intentError } = await app.supabase
        .from('payment_intents')
        .insert({
          tenant_id: tenantId,
          order_id: body.order_id,
          amount: body.amount,
          currency: 'USD',
          provider: body.method === 'card' ? 'stripe' : 'other',
          status: 'requires_payment_method',
          metadata: { method: body.method }
        })
        .select()
        .single();

      if (intentError) throw intentError;

      return reply.code(201).send({ intent });

    } catch (err: any) {
      app.log.error(err, 'Failed to create payment intent');
      return reply.code(500).send({ error: 'failed_to_create_intent' });
    }
  });

  // POST /payments/intent/:id/confirm - Confirm payment (dev-mode)
  app.post('/payments/intent/:id/confirm', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const params = z.object({
      id: z.string().uuid()
    }).parse(req.params);

    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      // Get payment intent
      const { data: intent, error: intentError } = await app.supabase
        .from('payment_intents')
        .select('*')
        .eq('id', params.id)
        .eq('tenant_id', tenantId)
        .single();

      if (intentError || !intent) {
        return reply.code(404).send({ error: 'intent_not_found' });
      }

      // Update intent to completed
      const { data: updatedIntent, error: updateError } = await app.supabase
        .from('payment_intents')
        .update({
          status: 'succeeded',
          provider_intent_id: `dev_${Date.now()}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Create payment event
      await app.supabase
        .from('payment_events')
        .insert({
          tenant_id: tenantId,
          provider: intent.provider,
          event_id: `dev_payment_confirmed_${Date.now()}`,
          payload: {
            type: 'payment_intent.succeeded',
            data: { id: intent.id, amount: intent.amount }
          }
        });

      // Update order to paid if this was the full amount
      if (intent.order_id) {
        await app.supabase
          .from('orders')
          .update({ status: 'paid', payment_status: 'completed' })
          .eq('id', intent.order_id);

        // Create order status event
        await app.supabase
          .from('order_status_events')
          .insert({
            tenant_id: tenantId,
            order_id: intent.order_id,
            status: 'paid',
            created_by: req.auth?.userId || 'system'
          });
      }

      return reply.send({ intent: updatedIntent });

    } catch (err: any) {
      app.log.error(err, 'Failed to confirm payment intent');
      return reply.code(500).send({ error: 'failed_to_confirm_payment' });
    }
  });

  // POST /payments/:payment_id/splits - Create payment splits
  app.post('/payments/:payment_id/splits', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const params = z.object({
      payment_id: z.string().uuid()
    }).parse(req.params);

    const body = z.array(z.object({
      amount: z.number().positive(),
      method: z.string(),
      payer_type: z.string().optional()
    })).parse(req.body);

    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      // Create payment splits
      const splits = body.map(split => ({
        tenant_id: tenantId,
        payment_id: params.payment_id,
        amount: split.amount,
        method: split.method,
        payer_type: split.payer_type || 'customer',
        status: 'pending'
      }));

      const { data: createdSplits, error: splitsError } = await app.supabase
        .from('payment_splits')
        .insert(splits)
        .select();

      if (splitsError) throw splitsError;

      return reply.code(201).send({ splits: createdSplits });

    } catch (err: any) {
      app.log.error(err, 'Failed to create payment splits');
      return reply.code(500).send({ error: 'failed_to_create_splits' });
    }
  });

  // POST /payments/:payment_id/refunds - Create refund
  app.post('/payments/:payment_id/refunds', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const params = z.object({
      payment_id: z.string().uuid()
    }).parse(req.params);

    const body = z.object({
      amount: z.number().positive(),
      reason: z.string()
    }).parse(req.body);

    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      // Create refund record
      const { data: refund, error: refundError } = await app.supabase
        .from('payment_refunds')
        .insert({
          tenant_id: tenantId,
          payment_id: params.payment_id,
          amount: body.amount,
          reason: body.reason,
          status: 'pending',
          created_by: req.auth?.userId || 'system'
        })
        .select()
        .single();

      if (refundError) throw refundError;

      return reply.code(201).send({ refund });

    } catch (err: any) {
      app.log.error(err, 'Failed to create refund');
      return reply.code(500).send({ error: 'failed_to_create_refund' });
    }
  });

  // PATCH /payments/intents/:id - Update payment intent
  app.patch('/payments/intents/:id', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const params = z.object({
      id: z.string().uuid()
    }).parse(req.params);

    const body = UpdateIntentSchema.parse(req.body);
    const tenantId = req.auth?.primaryTenantId;

    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      const { data, error } = await app.supabase
        .from('payment_intents')
        .update(body)
        .eq('id', params.id)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return reply.code(404).send({ error: 'intent_not_found' });
        }
        throw error;
      }

      return reply.send({ intent: data });
    } catch (err: any) {
      app.log.error(err, 'Failed to update payment intent');
      return reply.code(500).send({ error: 'failed_to_update_intent' });
    }
  });

  // GET /payments/events - List payment events
  app.get('/payments/events', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      const { data, error } = await app.supabase
        .from('payment_events')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('received_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      return reply.send({ events: data || [] });
    } catch (err: any) {
      app.log.error(err, 'Failed to fetch payment events');
      return reply.code(500).send({ error: 'failed_to_fetch_events' });
    }
  });

  // POST /payments/intent - Create payment intent
  app.post('/payments/intent', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const body = z.object({
      order_id: z.string().uuid(),
      amount: z.number().positive(),
      method: z.enum(['card', 'cash', 'upi', 'wallet'])
    }).parse(req.body);

    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      // Verify order exists and belongs to tenant
      const { data: order, error: orderError } = await app.supabase
        .from('orders')
        .select('id, order_number, total_amount, status')
        .eq('id', body.order_id)
        .eq('tenant_id', tenantId)
        .single();

      if (orderError || !order) {
        return reply.code(404).send({ error: 'order_not_found' });
      }

      // Create payment intent
      const { data: intent, error: intentError } = await app.supabase
        .from('payment_intents')
        .insert({
          tenant_id: tenantId,
          order_id: body.order_id,
          amount: body.amount,
          currency: 'USD',
          provider: 'dev',
          status: 'requires_payment_method',
          metadata: { method: body.method }
        })
        .select()
        .single();

      if (intentError) throw intentError;

      return reply.code(201).send({ intent });

    } catch (err: any) {
      app.log.error(err, 'Failed to create payment intent');
      return reply.code(500).send({ error: 'failed_to_create_intent' });
    }
  });

  // POST /payments/intent/:id/confirm - Confirm payment (dev-mode)
  app.post('/payments/intent/:id/confirm', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const params = z.object({
      id: z.string().uuid()
    }).parse(req.params);

    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      // Get payment intent
      const { data: intent, error: intentError } = await app.supabase
        .from('payment_intents')
        .select('*')
        .eq('id', params.id)
        .eq('tenant_id', tenantId)
        .single();

      if (intentError || !intent) {
        return reply.code(404).send({ error: 'intent_not_found' });
      }

      // Update intent to succeeded
      const { data: updatedIntent, error: updateError } = await app.supabase
        .from('payment_intents')
        .update({
          status: 'succeeded',
          provider_intent_id: `dev_${Date.now()}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Create payment event
      await app.supabase
        .from('payment_events')
        .insert({
          provider: 'dev',
          event_id: `evt_${Date.now()}`,
          tenant_id: tenantId,
          payload: {
            type: 'payment_intent.succeeded',
            data: { object: updatedIntent }
          },
          received_at: new Date().toISOString()
        });

      // Update order to paid
      if (intent.order_id) {
        await app.supabase
          .from('orders')
          .update({
            status: 'paid',
            payment_status: 'completed'
          })
          .eq('id', intent.order_id);

        // Create order status event
        await app.supabase
          .from('order_status_events')
          .insert({
            tenant_id: tenantId,
            order_id: intent.order_id,
            status: 'paid',
            created_by: req.auth?.userId || 'system'
          });
      }

      return reply.send({ intent: updatedIntent });

    } catch (err: any) {
      app.log.error(err, 'Failed to confirm payment intent');
      return reply.code(500).send({ error: 'failed_to_confirm_intent' });
    }
  });

  // POST /payments/:payment_id/splits - Create payment splits
  app.post('/payments/:payment_id/splits', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const params = z.object({
      payment_id: z.string().uuid()
    }).parse(req.params);

    const body = z.array(z.object({
      amount: z.number().positive(),
      method: z.enum(['card', 'cash', 'upi', 'wallet']),
      payer_type: z.string().optional()
    })).parse(req.body);

    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      // Create payment splits
      const splits = body.map(split => ({
        tenant_id: tenantId,
        payment_id: params.payment_id,
        amount: split.amount,
        method: split.method,
        payer_type: split.payer_type,
        status: 'pending'
      }));

      const { data, error } = await app.supabase
        .from('payment_splits')
        .insert(splits)
        .select();

      if (error) throw error;

      return reply.code(201).send({ splits: data });

    } catch (err: any) {
      app.log.error(err, 'Failed to create payment splits');
      return reply.code(500).send({ error: 'failed_to_create_splits' });
    }
  });

  // POST /payments/:payment_id/refunds - Create refund
  app.post('/payments/:payment_id/refunds', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const params = z.object({
      payment_id: z.string().uuid()
    }).parse(req.params);

    const body = z.object({
      amount: z.number().positive(),
      reason: z.string()
    }).parse(req.body);

    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      // Create refund record
      const { data: refund, error: refundError } = await app.supabase
        .from('payment_refunds')
        .insert({
          tenant_id: tenantId,
          payment_id: params.payment_id,
          amount: body.amount,
          reason: body.reason,
          status: 'pending',
          created_by: req.auth?.userId
        })
        .select()
        .single();

      if (refundError) throw refundError;

      return reply.code(201).send({ refund });

    } catch (err: any) {
      app.log.error(err, 'Failed to create refund');
      return reply.code(500).send({ error: 'failed_to_create_refund' });
    }
  });

  // POST /payments/webhook/:provider - Webhook handler (placeholder)
  app.post('/payments/webhook/:provider', async (req, reply) => {
    const params = z.object({
      provider: z.enum(['stripe', 'razorpay', 'other'])
    }).parse(req.params);

    try {
      // Store webhook event for debugging/processing
      const { data, error } = await app.supabase
        .from('payment_events')
        .insert({
          provider: params.provider,
          event_id: (req.body as any)?.id || `evt_${Date.now()}`,
          tenant_id: null, // Will be inferred from metadata in future
          payload: req.body,
          received_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        app.log.error(error, 'Failed to store payment event');
        // Don't fail webhook - return success to provider
      }

      app.log.info({ provider: params.provider, event_id: data?.event_id }, 'Payment webhook received');

      return reply.send({ ok: true });
    } catch (err: any) {
      app.log.error(err, 'Payment webhook error');
      return reply.send({ ok: true }); // Always return success to provider
    }
  });
}