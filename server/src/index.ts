// server/src/index.ts

import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';   // ✅ add this

// Keep extension-less imports; tsx resolves .ts at runtime
import supabasePlugin from './plugins/supabase';
import authPlugin from './plugins/auth';
import tenantRoutes from './routes/tenants';
import authRoutes from './routes/auth';
import analyticsRoutes from './routes/analytics.js';

const app = Fastify({ logger: true });


// Plugins
await app.register(cors, { origin: true, credentials: true });
await app.register(sensible); 
await app.register(supabasePlugin);
await app.register(authPlugin);
await app.register(tenantRoutes);
await app.register(authRoutes);
await app.register(analyticsRoutes);
// Single, namespaced health endpoint (avoid collisions)
app.get('/_health', async () => ({ ok: true }));


// Print all routes at startup so we can see what's registered
app.ready(err => {
  if (err) {
    app.log.error('app.ready error:', err);
    return;
  }
  app.log.info('--- ROUTES ---\n' + app.printRoutes());
});

// Listen
const port = Number(process.env.PORT ?? 8080);
const host = process.env.HOST ?? '0.0.0.0';

app.listen({ port, host }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});