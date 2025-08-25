import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import supabasePlugin from './plugins/supabase.js';
import tenantRoutes from './routes/tenants.js';

const app = Fastify({ logger: true });
await app.register(fastifyCors, { origin: true, credentials: true });
await app.register(supabasePlugin);
await app.register(tenantRoutes);

app.get('/health', async () => ({ ok: true }));

const port = Number(process.env.PORT ?? 8080);
app.listen({ port, host: '0.0.0.0' }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});