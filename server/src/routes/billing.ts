

import type { FastifyInstance } from 'fastify';

export default async function billingRoutes(fastify: FastifyInstance) {
  // POST /api/billing/checkout
  fastify.post('/api/billing/checkout', async (req: any, reply) => {
    const { tenant_id, plan_code } = req.body || {};
    if (!tenant_id || !plan_code) {
      return reply.status(400).send({ error: 'missing_tenant_or_plan_code' });
    }

    // Simulate checkout redirect URL
    return reply.send({
      url: `https://billing.projectkaf.com/checkout?tenant=${tenant_id}&plan=${plan_code}`
    });
  });

  // POST /api/billing/portal
  fastify.post('/api/billing/portal', async (req: any, reply) => {
    const { tenant_id } = req.body || {};
    if (!tenant_id) {
      return reply.status(400).send({ error: 'missing_tenant_id' });
    }

    // Simulate portal URL
    return reply.send({
      url: `https://billing.projectkaf.com/portal?tenant=${tenant_id}`
    });
  });

  // POST /api/billing/webhook
  fastify.post('/api/billing/webhook', async (req: any, reply) => {
    const { provider, event_id, event_type, payload } = req.body || {};
    if (!provider || !event_id || !event_type || !payload) {
      return reply.status(400).send({ error: 'missing_fields' });
    }

    try {
      await fastify.pg.pool.query(
        `insert into public.billing_webhooks (provider, event_id, event_type, payload, status, received_at)
         values ($1, $2, $3, $4, 'received', now())
         on conflict (provider, event_id) do nothing`,
        [provider, event_id, event_type, payload]
      );

      return reply.status(200).send({ ok: true });
    } catch (err) {
      fastify.log.error({ err }, '[billing.webhook] insert failed');
      return reply.status(500).send({ error: 'webhook_store_failed' });
    }
  });
}