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
import authPlugin from './plugins/auth';

import tenantRoutes from './routes/tenants';
import authRoutes from './routes/auth';
import analyticsRoutes from './routes/analytics';
import qrRoutes from './routes/qr'; // New QR routes
import cartRoutes from './routes/cart'; // New Cart routes
import kdsRoutes from './routes/kds'; // New KDS routes
import paymentsRoutes from './routes/payments'; // New Payments routes
import receiptsRoutes from './routes/receipts'; // New Receipts routes
import menuRoutes from './routes/menu';
import ordersRoutes from './routes/orders';
import tablesRoutes from './routes/tables';
import staffRoutes from './routes/staff';
import brandingRoutes from './routes/branding';


const ENV_PATH = path.resolve(process.cwd(), '.env'); // ← resolves to /home/project/server/.env when you run from /home/project/server
loadEnv({ path: ENV_PATH });

// debug: prove we're loading the right file
console.log('ENV_PATH:', ENV_PATH, fs.existsSync(ENV_PATH) ? '✅ exists' : '❌ missing');
console.log('DEBUG SUPABASE_URL:', process.env.SUPABASE_URL ?? 'undefined');
console.log('DEBUG SUPABASE_SERVICE_ROLE:', process.env.SUPABASE_SERVICE_ROLE ? '***SET***' : 'MISSING');

const app = Fastify({ logger: true });

// ---------------------------
// Register Plugins
// ---------------------------
await app.register(cors, { origin: true, credentials: true });
await app.register(sensible);
await app.register(supabasePlugin);
await app.register(authPlugin); // ✅ Register auth once

// ---------------------------
// Register Routes
// ---------------------------
await app.register(tenantRoutes);
await app.register(authRoutes);
await app.register(analyticsRoutes);
await app.register(qrRoutes); // Register new QR routes
await app.register(cartRoutes); // Register new Cart routes
await app.register(kdsRoutes); // Register new KDS routes
await app.register(paymentsRoutes); // Register new Payments routes
await app.register(receiptsRoutes); // Register new Receipts routes
await app.register(menuRoutes);
await app.register(ordersRoutes);
await app.register(tablesRoutes);
await app.register(staffRoutes);
await app.register(brandingRoutes);


// health (namespaced to avoid collisions)
app.get('/_health', async () => ({ ok: true }));

// optional: print routes
app.ready(err => {
  if (err) { app.log.error(err); return; }
  app.log.info('--- ROUTES ---\n' + app.printRoutes());
});

const port = Number(process.env.PORT ?? 8080);
const host = process.env.HOST ?? '0.0.0.0';
app.listen({ port, host }).catch(err => { app.log.error(err); process.exit(1); });