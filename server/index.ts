// server/index.ts (sketch)
import Fastify from 'fastify';
import tableSessionRoutes from '../src/server/routes/table-session.js'; // adjust paths
import ordersRoutes from '../src/server/routes/orders.js';

const app = Fastify({ logger: true });

// health routes...
app.get('/healthz', async () => ({ ok: true }));

// register all API routes
await app.register(tableSessionRoutes);
await app.register(ordersRoutes);

const port = Number(process.env.PORT || 3001);
app.listen({ port, host: '0.0.0.0' }).then(() => {
  app.log.info(`listening on :${port}`);
});