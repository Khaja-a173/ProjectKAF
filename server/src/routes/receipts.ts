import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const SendReceiptSchema = z.object({
  via: z.enum(['email', 'sms']),
  recipient: z.string().optional()
});

export default async function receiptsRoutes(app: FastifyInstance) {
  // POST /receipts/:order_id/send - Send receipt via email or SMS
  app.post('/receipts/:order_id/send', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const params = z.object({
      order_id: z.string().uuid()
    }).parse(req.params);

    const body = SendReceiptSchema.parse(req.body);
    const tenantId = req.auth?.primaryTenantId;

    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      // Verify order exists and belongs to tenant
      const { data: order, error: orderError } = await app.supabase
        .from('orders')
        .select('id, order_number, total_amount, status')
        .eq('id', params.order_id)
        .eq('tenant_id', tenantId)
        .single();

      if (orderError || !order) {
        return reply.code(404).send({ error: 'order_not_found' });
      }

      // Create receipt delivery record (dev-mode simulation)
      const { data: receipt, error: receiptError } = await app.supabase
        .from('receipt_deliveries')
        .insert({
          tenant_id: tenantId,
          order_id: params.order_id,
          via: body.via,
          recipient: body.recipient,
          status: 'queued', // In dev mode, just queue it
          content: {
            order_number: order.order_number,
            total_amount: order.total_amount,
            generated_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (receiptError) throw receiptError;

      app.log.info(`Receipt queued for order ${order.order_number} via ${body.via}`);

      return reply.code(201).send({
        receipt: {
          id: receipt.id,
          order_id: params.order_id,
          via: body.via,
          status: 'queued',
          created_at: receipt.created_at
        }
      });

    } catch (err: any) {
      app.log.error(err, 'Failed to send receipt');
      return reply.code(500).send({ error: 'failed_to_send_receipt' });
    }
  });

  // GET /receipts - List receipt deliveries
  app.get('/receipts', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const query = z.object({
      order_id: z.string().uuid().optional(),
      status: z.string().optional(),
      limit: z.coerce.number().int().positive().max(100).default(50)
    }).parse(req.query);

    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      let queryBuilder = app.supabase
        .from('receipt_deliveries')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(query.limit);

      if (query.order_id) {
        queryBuilder = queryBuilder.eq('order_id', query.order_id);
      }

      if (query.status) {
        queryBuilder = queryBuilder.eq('status', query.status);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;

      return reply.send({ receipts: data || [] });

    } catch (err: any) {
      app.log.error(err, 'Failed to fetch receipts');
      return reply.code(500).send({ error: 'failed_to_fetch_receipts' });
    }
  });
}