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