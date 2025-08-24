// server/index.ts
import 'dotenv/config';
import Fastify from 'fastify';
import healthDbRoutes from '../src/server/routes/health-db.js';
import tableSessionRoutes from '../src/server/routes/table-session.js';
import ordersRoutes from '../src/server/routes/orders.js';

export function buildServer() {
  const app = Fastify({ logger: false });

  // Single health endpoint defined only here
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

// No app.listen() here – tests and dev runner will do that.
export default buildServer;