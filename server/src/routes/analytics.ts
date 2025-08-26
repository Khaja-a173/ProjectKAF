// server/src/routes/analytics.ts
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AnalyticsService } from '../services/analytics.service.js';

export default async function analyticsRoutes(app: FastifyInstance) {
  const svc = new AnalyticsService(app);

  // All analytics require auth + tenant context
  app.get('/analytics/summary', { preHandler: [app.requireAuth] }, async (req, reply) => {
    // Choose primary tenant (first membership)
    const tenantId = req.user?.tenant_ids?.[0];
    if (!tenantId) return reply.code(403).send({ error: 'No tenant context' });

    const q = z.object({ window: z.string().optional().default('7d') }).parse(req.query);
    const data = await svc.kpiSummary(tenantId, q.window);
    return reply.send(data);
  });

  app.get('/analytics/revenue', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = req.user?.tenant_ids?.[0];
    if (!tenantId) return reply.code(403).send({ error: 'No tenant context' });

    const q = z.object({
      window: z.string().optional().default('30d'),
      granularity: z.enum(['day','week','month']).optional().default('day'),
    }).parse(req.query);

    const data = await svc.revenueSeries(tenantId, q.window, q.granularity);
    return reply.send(data);
  });

  app.get('/analytics/top-items', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = req.user?.tenant_ids?.[0];
    if (!tenantId) return reply.code(403).send({ error: 'No tenant context' });

    const q = z.object({
      window: z.string().optional().default('30d'),
      limit: z.coerce.number().int().min(1).max(50).optional().default(10),
    }).parse(req.query);

    const data = await svc.topItems(tenantId, q.window, q.limit);
    return reply.send(data);
  });
}