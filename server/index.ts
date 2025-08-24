import Fastify from 'fastify';
import 'dotenv/config';
import tableSessionRoutes from '../src/server/routes/table-session';

const app = Fastify({ logger: false });

app.get('/healthz', async (_req, reply) => reply.code(200).send({ status: 'ok' }));

// Register table-session API
app.register(tableSessionRoutes);

const port = Number(process.env.PORT || 3001);
app.listen({ port, host: '0.0.0.0' }).then(() => {
  console.log(`[server] listening on :${port}`);
}).catch(err => { console.error(err); process.exit(1); });