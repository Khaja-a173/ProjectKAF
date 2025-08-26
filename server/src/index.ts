// server/src/index.ts

import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';

import supabasePlugin from './plugins/supabase';
import authPlugin from './plugins/auth';
import tenantRoutes from './routes/tenants';
import authRoutes from './routes/auth';
import analyticsRoutes from './routes/analytics';
import ordersRoutes from './routes/orders';
import menuRoutes from './routes/menu';
import tablesRoutes from './routes/tables';
import staffRoutes from './routes/staff';
import kdsRoutes from './routes/kds';
import brandingRoutes from './routes/branding';
import paymentsRoutes from './routes/payments';
import ordersRoutes from './routes/orders';
import menuRoutes from './routes/menu';
import tablesRoutes from './routes/tables';
import staffRoutes from './routes/staff';
import kdsRoutes from './routes/kds';
import brandingRoutes from './routes/branding';

const app = Fastify({ logger: true });

// ---------------------------
// Register Plugins
// ---------------------------
await app.register(cors, { origin: true, credentials: true });
await app.register(sensible);
await app.register(supabasePlugin);
await app.register(authPlugin); // ✅ Register auth once

// ---------------------------
// Register Routes
// ---------------------------
await app.register(tenantRoutes);
await app.register(authRoutes);
await app.register(analyticsRoutes);
await app.register(ordersRoutes);
await app.register(menuRoutes);
await app.register(tablesRoutes);
await app.register(staffRoutes);
await app.register(kdsRoutes);
await app.register(brandingRoutes);
await app.register(paymentsRoutes);
await app.register(ordersRoutes);
await app.register(menuRoutes);
await app.register(tablesRoutes);
await app.register(staffRoutes);
await app.register(kdsRoutes);
await app.register(brandingRoutes);

// Health endpoint
app.get('/_health', async () => ({ ok: true }));

// Print registered routes for debugging
app.ready((err) => {
  if (err) {
    app.log.error('app.ready error:', err);
    return;
  }
  app.log.info('--- ROUTES ---\n' + app.printRoutes());
});

// Start server
const port = Number(process.env.PORT ?? 8080);
const host = process.env.HOST ?? '0.0.0.0';

app.listen({ port, host }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});