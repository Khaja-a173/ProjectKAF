import 'dotenv/config';
import Fastify from 'fastify';

import tableSessionRoutes from '../src/server/routes/table-session';
import healthDbRoutes from '../src/server/routes/health-db';
import ordersRoutes from '../src/server/routes/orders'; // ← ADD THIS

const app = Fastify({ logger: false });

// health
app.get('/healthz', async (_req, reply) => reply.code(200).send({ status: 'ok' }));
app.register(healthDbRoutes);

// table-session
app.register(tableSessionRoutes);

// orders
app.register(ordersRoutes); // ← ADD THIS

// root route: show service info
app.get('/', async (_req, reply) =>
  reply.send({ status: 'ok', service: 'api', routes: ['/healthz', '/api/health/db', '/api/table-session/*', '/api/orders/*'] })
);

const port = Number(process.env.PORT || 3001);
app.listen({ port, host: '0.0.0.0' })
  .then(() => console.log(`[server] listening on :${port}`))
  .catch(err => { console.error(err); process.exit(1); });