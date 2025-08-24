// server/index.ts
import 'dotenv/config';
import Fastify from 'fastify';

// keep your existing route modules (extensions as in your project)
import healthDbRoutes from '../src/server/routes/health-db.js';
import tableSessionRoutes from '../src/server/routes/table-session.js';
import ordersRoutes from '../src/server/routes/orders.js';

export function buildServer() {
  const app = Fastify({ logger: false });

  // health endpoint used by test harness
  app.get('/healthz', async (_req, reply) => reply.code(200).send({ status: 'ok' }));

  // register your feature routes
  app.register(healthDbRoutes);
  app.register(tableSessionRoutes);
  app.register(ordersRoutes);

  // optional root
  app.get('/', async (_req, reply) =>
    reply.send({
      status: 'ok',
      service: 'api',
      routes: ['/healthz', '/api/health/db', '/api/table-session/*', '/api/orders/*'],
    })
  );

  return app;
}

// IMPORTANT: do NOT auto-listen here.
// Tests (and dev runner if you add one) will call buildServer().listen(...)
export default buildServer;