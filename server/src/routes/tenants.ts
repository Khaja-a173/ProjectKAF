import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import { TenantService } from '../services/tenant.service.js';
import { signQrPayload, generateQrPngUrl } from '../lib/qr.js';

export default async function routes(app: FastifyInstance) {
  const service = new TenantService(app);

  app.post('/tenants', async (req, reply) => {
    const body = z.object({ name: z.string().min(2), plan: z.string().optional() }).parse(req.body);
    const created = await service.createTenant(body.name, body.plan);
    return reply.code(201).send(created);
  });

  app.get('/tenants/:code/qr/:table', async (req, reply) => {
    const params = z.object({ code: z.string().length(4), table: z.string().regex(/^T\d{2}$/) }).parse(req.params);
    const tenant = await service.getTenantByCode(params.code);
    if (!tenant) return reply.code(404).send({ error: 'Tenant not found' });
    const signed = signQrPayload({ tenant_code: params.code, table_code: params.table });
    const png = await generateQrPngUrl(signed);
    return reply.send({ data_url: png, signed });
  });
}