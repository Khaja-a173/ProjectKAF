import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const SendReceiptSchema = z.object({
  order_id: z.string().uuid(),
  channel: z.enum(['email', 'sms'])
});

export default async function receiptsRoutes(app: FastifyInstance) {
  /**
   * POST /receipts/send
   * Send receipt via email or SMS
   */
  app.post('/receipts/send', {
    preHandler: [app.requireAuth],
    schema: {
      body: SendReceiptSchema
    }
  }, async (req, reply) => {
    try {
      const tenantId = req.auth.primaryTenantId;
      if (!tenantId) {
        return reply.code(401).send({ error: 'No tenant access' });
      }

      const { order_id, channel } = SendReceiptSchema.parse(req.body);

      // Verify order belongs to tenant
      try {
        const { data: order, error } = await app.supabase
          .from('orders')
          .select('id, order_number, total_amount')
          .eq('id', order_id)
          .eq('tenant_id', tenantId)
          .single();

        if (error) {
          if (error.code === '42P01') {
            return reply.send({ queued: true, mock: true });
          }
          if (error.code === 'PGRST116') {
            return reply.code(404).send({ error: 'Order not found' });
          }
          throw error;
        }

        // Try to insert receipt delivery record
        try {
          await app.supabase
            .from('receipt_deliveries')
            .insert({
              tenant_id: tenantId,
              order_id,
              channel,
              status: 'queued',
              sent_by: req.auth.userId
            });
        } catch (err: any) {
          if (err.code === '42P01') {
            app.log.warn('receipt_deliveries table not found');
            return reply.send({ queued: true, mock: true });
          } else {
            throw err;
          }
        }

        return reply.send({
          queued: true,
          order_number: order.order_number,
          channel
        });

      } catch (err: any) {
        if (err.code === '42P01') {
          return reply.send({ queued: true, mock: true });
        }
        throw err;
      }

    } catch (err) {
      app.log.error('Failed to send receipt:', err);
      return reply.code(500).send({ error: 'Failed to send receipt' });
    }
  });

  /**
   * GET /printer/config
   * Get printer configuration for tenant
   */
  app.get('/printer/config', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    try {
      const tenantId = req.auth.primaryTenantId;
      if (!tenantId) {
        return reply.code(401).send({ error: 'No tenant access' });
      }

      try {
        const { data: config, error } = await app.supabase
          .from('printer_configs')
          .select('*')
          .eq('tenant_id', tenantId)
          .single();

        if (error) {
          if (error.code === '42P01' || error.code === 'PGRST116') {
            return reply.send({ enabled: false });
          }
          throw error;
        }

        return reply.send({
          enabled: config.enabled,
          printer_name: config.printer_name,
          paper_size: config.paper_size,
          auto_print: config.auto_print
        });

      } catch (err: any) {
        if (err.code === '42P01') {
          return reply.send({ enabled: false });
        }
        throw err;
      }

    } catch (err) {
      app.log.error('Failed to get printer config:', err);
      return reply.code(500).send({ error: 'Failed to get printer config' });
    }
  });
}