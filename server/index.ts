// server/index.ts
import 'dotenv/config';
import Fastify from 'fastify';
import tableSessionRoutes from '../src/server/routes/table-session'; // adjust if your folder layout differs
import healthDbRoutes from '../src/server/routes/health-db';
import ordersRoutes from '../src/server/routes/orders';

const app = Fastify({ logger: false });

// Minimal root route so Bolt preview at "/" doesn't 404
app.get('/', async (_req, reply) => {
  return reply.code(200).send({
    status: 'ok',
    service: 'api',
    routes: ['/healthz', '/api/health/db', '/api/table-session/*']
  });
});

// Health check
app.get('/healthz', async (_req, reply) => reply.code(200).send({ status: 'ok' }));

// Register health DB route
app.register(healthDbRoutes);

// Register table-session API
app.register(tableSessionRoutes);
app.register(ordersRoutes);

const port = Number(process.env.PORT || 3001);
app
  .listen({ port, host: '0.0.0.0' })
  .then(() => console.log(`[server] listening on :${port}`))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });