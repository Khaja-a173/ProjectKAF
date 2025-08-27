@@ .. @@
 import supabasePlugin from './plugins/supabase.js';
 import tenantRoutes from './routes/tenants.js';
+import qrRoutes from './routes/qr.js';
+import cartRoutes from './routes/cart.js';
+import kdsRoutes from './routes/kds.js';
+import paymentsRoutes from './routes/payments.js';
+import receiptsRoutes from './routes/receipts.js';
+import ordersRoutes from './routes/orders.js';
 
 const app = Fastify({ logger: true });
 
@@ .. @@
 // Register routes
 await app.register(tenantRoutes);
+await app.register(qrRoutes);
+await app.register(cartRoutes);
+await app.register(kdsRoutes);
+await app.register(paymentsRoutes);
+await app.register(receiptsRoutes);
+await app.register(ordersRoutes);
 
 // Health check endpoint