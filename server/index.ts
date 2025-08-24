import Fastify from 'fastify';
import 'dotenv/config';

const app = Fastify({ logger: false });

app.get('/healthz', async (_req, reply) => {
  return reply.code(200).send({ status: 'ok' });
});

const port = Number(process.env.PORT || 3001);
app.listen({ port, host: '0.0.0.0' }).then(() => {
  console.log(`[healthz] listening on :${port}`);
}).catch(err => {
  console.error(err);
  process.exit(1);
});