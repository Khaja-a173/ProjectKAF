import fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import healthRoutes from './routes/health';
import dns from "node:dns";


dns.setDefaultResultOrder("ipv4first");

// 🔐 Core plugins (order matters)
//import fastifyPostgres from '@fastify/postgres'; // Official Postgres plugin
import pgPlugin from './plugins/pg';
import supabasePlugin from './plugins/supabase';
import redisPlugin from './plugins/redis';
import authPlugin from './plugins/auth';

// Routes
import authRoutes from './routes/auth';
import tenantRoutes from './routes/tenants';
import analyticsRoutes from './routes/analytics';
import qrRoutes from './routes/qr';
import menuRoutes from './routes/menu';
import cartRoutes from './routes/cart';
import checkoutRoutes from './routes/checkout';
import kdsRoutes from './routes/kds';
import receiptsRoutes from './routes/receipts';
import ordersRoutes from './routes/orders';
import tablesRoutes from './routes/tables';
import paymentsRoutes from './routes/payments';
import usersRoutes from './routes/users';
import reservationsRoutes from './routes/reservations';
import zonesRoutes from './routes/zones';
import tmSettingsRoutes from './routes/tmSettings';
import taxRoutes from './routes/tax';
import eventsRoutes from './routes/events';
import plansRoutes from './routes/plans';

// Helper: build connection string if DATABASE_URL not provided
function resolvePgConnectionString(): string | undefined {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const host = process.env.PGHOST;
  const port = process.env.PGPORT || '5432';
  const db   = process.env.PGDATABASE;
  const user = process.env.PGUSER;
  const pass = process.env.PGPASSWORD;

  if (host && db && user && pass) {
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${db}`;
  }
  return undefined;
}

export async function buildApp(): Promise<FastifyInstance> {
  const app: FastifyInstance = fastify({
    logger: { level: process.env.LOG_LEVEL || 'info' }
  });

  // ── Base utilities
  await app.register(sensible);
  await app.register(cors, {
    origin: [process.env.CORS_ORIGIN || 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Requested-With',
      'X-Supabase-Auth',
      'X-Tenant-Id',
      'X-User-Id',
      'idempotency-key',
      'Prefer',
      'prefer',
    ],
  });

  // ── PLUGINS (correct boot order)
  // ✅ Register Postgres BEFORE any routes that use fastify.pg
  await app.register(pgPlugin);

  await app.register(supabasePlugin);
  await app.register(redisPlugin);
  await app.register(authPlugin);
  await app.register(healthRoutes);

  // Bind anonymous/public user id from header for cart and public flows
  app.addHook('preHandler', (req, _rep, done) => {
    const hdr = req.headers['x-user-id'];
    if (typeof hdr === 'string' && hdr.trim()) {
      (req as any).userId = hdr.trim();
    } else if (Array.isArray(hdr) && hdr.length > 0) {
      (req as any).userId = String(hdr[0]).trim();
    }
    done();
  });

  app.get('/_health', async () => ({ ok: true }));
  app.get('/', async () => ({ ok: true }));

  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  app.get('/auth/callback', async (req, reply) => {
    const qs = req.raw.url?.split('?')[1] || '';
    const redirectTo = `${FRONTEND_URL}/#/auth/callback${qs ? `?${qs}` : ''}`;
    return reply.redirect(307, redirectTo);
  });

  // ── ROUTES (after plugins)
  await app.register(authRoutes);
  await app.register(tenantRoutes);
  await app.register(analyticsRoutes);
  await app.register(qrRoutes);
  await app.register(menuRoutes, { prefix: '/api/menu' });
  await app.register(cartRoutes);
  await app.register(checkoutRoutes);
  await app.register(kdsRoutes);
  await app.register(receiptsRoutes);
  await app.register(ordersRoutes);
  await app.register(tmSettingsRoutes, { prefix: '/api/tm-settings' });
  await app.register(zonesRoutes, { prefix: '/api/zones' });
  await app.register(tablesRoutes, { prefix: '/api/tables' });
  await app.register(usersRoutes);
  await app.register(reservationsRoutes);
  await app.register(taxRoutes, { prefix: '/api/tax' });
  await app.register(eventsRoutes, { prefix: '/api/events' });
  await app.register(plansRoutes);

  const paymentsEnabled = process.env.ENABLE_PAYMENTS !== 'false';
  if (paymentsEnabled) {
    await app.register(paymentsRoutes, { prefix: '/payments' });
    app.log.info('Payments routes enabled at /payments');
  } else {
    app.log.info('Payment features disabled via ENABLE_PAYMENTS flag');
  }

  return app;
}

// Start the server unless we’re in a test runner
const isTest =
  process.env.NODE_ENV === 'test' ||
  process.env.VITEST ||
  process.env.JEST_WORKER_ID;

if (!isTest) {
  const port = Number(process.env.PORT || 8090);
  const host = process.env.HOST || '0.0.0.0';
  buildApp()
    .then(app => app.listen({ port, host }))
    .then(() => {
      console.log(`[server] listening on http://${host}:${port}`);
    })
    .catch((err) => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });
}