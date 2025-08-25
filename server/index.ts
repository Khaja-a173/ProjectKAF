// ESM-safe .env loader
import { config as loadEnv } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
loadEnv({ path: path.resolve(__dirname, '../.env') });

import Fastify from 'fastify';
import cors from '@fastify/cors';          // ✅ v4-compatible plugin (installed as @fastify/cors@8)
import sensible from '@fastify/sensible';  // ✅ v4-compatible plugin (installed as @fastify/sensible@5)

import supabasePlugin from './plugins/supabase';
import tenantRoutes from './routes/tenants';

const app = Fastify({ logger: true });

// health (namespaced to avoid collisions)
app.get('/_health', async () => ({ ok: true }));

await app.register(cors, { origin: true, credentials: true });
await app.register(sensible);
await app.register(supabasePlugin);
await app.register(tenantRoutes);

// optional: print routes
app.ready(err => {
  if (err) { app.log.error(err); return; }
  app.log.info('--- ROUTES ---\n' + app.printRoutes());
});

const port = Number(process.env.PORT ?? 8080);
const host = process.env.HOST ?? '0.0.0.0';
app.listen({ port, host }).catch(err => { app.log.error(err); process.exit(1); });