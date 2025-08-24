// server/index.ts
import 'dotenv/config';
import Fastify, { FastifyInstance } from 'fastify';
import healthDbRoutes from '../src/server/routes/health-db.js';
import tableSessionRoutes from '../src/server/routes/table-session.js';
import ordersRoutes from '../src/server/routes/orders.js';

export function buildServer(): FastifyInstance {
  const app = Fastify({ logger: false });

  // Health for tests
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

// Optional: only start when run directly (NOT during tests)
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT || 3001);
  const app = buildServer();
  app
    .listen({ port, host: '0.0.0.0' })
    .then(() => console.log(`[server] listening on :${port}`))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
export default buildServer;