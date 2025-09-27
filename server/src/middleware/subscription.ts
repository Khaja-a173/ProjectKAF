


import type { FastifyRequest, FastifyReply } from 'fastify';

export async function requireActiveSubscription(req: FastifyRequest, reply: FastifyReply) {
  if (process.env.NODE_ENV === 'development') {
    req.log.info('[requireActiveSubscription] Bypassed in development mode');
    return;
  }
  const tenantId = req.headers['x-tenant-id'];

  if (!tenantId || typeof tenantId !== 'string') {
    return reply.status(400).send({ error: 'missing_tenant_id' });
  }

  try {
    const { rows } = await req.server.pg.pool.query(
      `select status from public.tenant_active_subscription_v where tenant_id = $1 limit 1`,
      [tenantId]
    );

    const status = rows?.[0]?.status ?? null;
    const allowed = ['trialing', 'active', 'grace'];

    if (!allowed.includes(status)) {
      return reply.status(403).send({ error: 'subscription_inactive', status });
    }
  } catch (err) {
    req.log.error({ err }, '[requireActiveSubscription] query failed');
    return reply.status(500).send({ error: 'subscription_check_failed' });
  }
}