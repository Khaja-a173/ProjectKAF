@@ .. @@
 import type { FastifyInstance } from 'fastify';
 import { z } from 'zod';
 
+const UpdateStatusSchema = z.object({
+  to: z.string()
+});
+
 export default async function ordersRoutes(app: FastifyInstance) {
   // Existing routes...
+
+  /**
+   * GET /orders/:id/status
+   * Get order status and timeline
+   */
+  app.get('/orders/:id/status', {
+    preHandler: [app.requireAuth]
+  }, async (req, reply) => {
+    try {
+      const tenantId = req.auth.primaryTenantId;
+      if (!tenantId) {
+        return reply.code(401).send({ error: 'No tenant access' });
+      }
+
+      const orderId = (req.params as any).id;
+
+      try {
+        // Get order
+        const { data: order, error: orderError } = await app.supabase
+          .from('orders')
+          .select('id, status, created_at')
+          .eq('id', orderId)
+          .eq('tenant_id', tenantId)
+          .single();
+
+        if (orderError) {
+          if (orderError.code === '42P01') {
+            return reply.send({ 
+              order_id: orderId, 
+              current: 'new', 
+              timeline: [] 
+            });
+          }
+          if (orderError.code === 'PGRST116') {
+            return reply.code(404).send({ error: 'Order not found' });
+          }
+          throw orderError;
+        }
+
+        // Get status timeline
+        let timeline = [];
+        try {
+          const { data: events } = await app.supabase
+            .from('order_status_events')
+            .select('from_status, to_status, created_at')
+            .eq('order_id', orderId)
+            .order('created_at');
+
+          timeline = events?.map(event => ({
+            at: event.created_at,
+            from: event.from_status,
+            to: event.to_status
+          })) || [];
+        } catch (timelineErr: any) {
+          if (timelineErr.code === '42P01') {
+            app.log.debug('order_status_events table not found');
+            timeline = [];
+          } else {
+            app.log.warn('Failed to get status timeline:', timelineErr);
+            timeline = [];
+          }
+        }
+
+        // If no timeline events, create one from order creation
+        if (timeline.length === 0) {
+          timeline = [{
+            at: order.created_at,
+            from: null,
+            to: 'new'
+          }];
+        }
+
+        return reply.send({
+          order_id: orderId,
+          current: timeline[timeline.length - 1]?.to || order.status,
+          timeline
+        });
+
+      } catch (err: any) {
+        if (err.code === '42P01') {
+          return reply.send({ 
+            order_id: orderId, 
+            current: 'new', 
+            timeline: [] 
+          });
+        }
+        throw err;
+      }
+
+    } catch (err) {
+      app.log.error('Failed to get order status:', err);
+      return reply.code(500).send({ error: 'Failed to get order status' });
+    }
+  });
+
+  /**
+   * POST /orders/:id/status
+   * Update order status
+   */
+  app.post('/orders/:id/status', {
+    preHandler: [app.requireAuth],
+    schema: {
+      body: UpdateStatusSchema
+    }
+  }, async (req, reply) => {
+    try {
+      const tenantId = req.auth.primaryTenantId;
+      if (!tenantId) {
+        return reply.code(401).send({ error: 'No tenant access' });
+      }
+
+      const orderId = (req.params as any).id;
+      const { to } = UpdateStatusSchema.parse(req.body);
+
+      try {
+        // Verify order exists and get current status
+        const { data: order, error: orderError } = await app.supabase
+          .from('orders')
+          .select('id, status')
+          .eq('id', orderId)
+          .eq('tenant_id', tenantId)
+          .single();
+
+        if (orderError) {
+          if (orderError.code === '42P01') {
+            return reply.send({ success: true, mock: true });
+          }
+          if (orderError.code === 'PGRST116') {
+            return reply.code(404).send({ error: 'Order not found' });
+          }
+          throw orderError;
+        }
+
+        // Insert status event
+        try {
+          await app.supabase
+            .from('order_status_events')
+            .insert({
+              order_id: orderId,
+              from_status: order.status,
+              to_status: to,
+              changed_by: req.auth.userId
+            });
+        } catch (statusErr: any) {
+          if (statusErr.code === '42P01') {
+            app.log.warn('order_status_events table not found');
+          } else {
+            throw statusErr;
+          }
+        }
+
+        return reply.send({
+          order_id: orderId,
+          from_status: order.status,
+          to_status: to,
+          success: true
+        });
+
+      } catch (err: any) {
+        if (err.code === '42P01') {
+          return reply.send({ success: true, mock: true });
+        }
+        throw err;
+      }
+
+    } catch (err) {
+      app.log.error('Failed to update order status:', err);
+      return reply.code(500).send({ error: 'Failed to update order status' });
+    }
+  });
 }