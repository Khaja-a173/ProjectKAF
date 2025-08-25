// server/index.ts
import 'dotenv/config';
import Fastify from 'fastify';
import healthDbRoutes from '../src/server/routes/health-db.js';
import tableSessionRoutes from '../src/server/routes/table-session.js';
import ordersRoutes from '../src/server/routes/orders.js';
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in server/.env');
}
/**
 * Build (but do not start) the Fastify app.
 * Tests and dev runner are responsible for app.listen().
 */
export function buildServer() {
  const app = Fastify({ logger: false });

  // Define healthz ONLY here to avoid duplicate-route errors
  app.get('/healthz', async (_req, reply) => reply.code(200).send({ status: 'ok' }));

  app.register(healthDbRoutes);
  app.register(tableSessionRoutes);
  app.register(ordersRoutes);

  app.get('/', async (_req, reply) =>
    reply.send({
      status: 'ok',
      service: 'api',
      routes: ['/healthz', '/api/health/db', '/api/table-session/*', '/api/orders/*'],
    })
  );

  return app;
}

export default buildServer;