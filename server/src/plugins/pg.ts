// server/src/plugins/pg.ts
import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import { Pool } from 'pg';
import { promises as dnsPromises } from 'node:dns';
import dns from 'node:dns';

declare module 'fastify' {
  interface FastifyInstance {
    pg: { pool: Pool };
  }
}

/**
 * Custom Postgres plugin
 * - Uses DATABASE_URL (parsed) + Pool options
 * - Forces IPv4 by resolving host to an A record at startup (no Pool.lookup needed)
 * - Sensible SSL defaults for Supabase and production
 * - Exposes fastify.pg.pool
 */
const pgPlugin: FastifyPluginAsync = fp(async (fastify) => {
  const urlStr = process.env.DATABASE_URL;
  // Important: Supabase may require IPv4 fallback. Use db-ipv4.<project>.supabase.co in DATABASE_URL
  if (!urlStr) {
    fastify.log.error('[pg] DATABASE_URL is not set');
    throw new Error('DATABASE_URL is required');
  }

  // Parse DATABASE_URL to components
  const original = new URL(urlStr);
  // Allow PGHOST env to override original.hostname
  let host = process.env.PGHOST || original.hostname; // e.g., db.<project>.supabase.co
  const port = Number(original.port || '5432');
  const database = original.pathname.replace(/^\//, '');
  const user = decodeURIComponent(original.username || '');
  const password = decodeURIComponent(original.password || '');

  // Pool tuning
  const max = Number(process.env.PG_POOL_MAX ?? 10);
  const idleTimeoutMillis = Number(process.env.PG_IDLE_MS ?? 10_000);
  const connectionTimeoutMillis = Number(process.env.PG_CONN_MS ?? 5_000);

  // SSL defaults:
  //  - Force SSL for supabase and production unless PG_SSL explicitly "false"
  const isSupabase = /supabase\.co$/i.test(host);
  const pgSslEnv = (process.env.PG_SSL || '').toLowerCase();
  const useSsl = pgSslEnv === 'true' || (pgSslEnv !== 'false' && (isSupabase || process.env.NODE_ENV === 'production'));
  const ssl = useSsl ? { rejectUnauthorized: false } : undefined;

  // Resolve to IPv4 once at startup (avoids EHOSTUNREACH on IPv6-only paths)
  try {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
  } catch {}
  try {
    const addrs = await dnsPromises.resolve4(host);
    if (Array.isArray(addrs) && addrs.length > 0) {
      fastify.log.info({ host, ipv4: addrs[0] }, '[pg] Using IPv4 A record (resolve4)');
      host = addrs[0];
    } else {
      fastify.log.warn({ host }, '[pg] No A records returned; using original host');
    }
  } catch (e) {
    fastify.log.warn({ err: String(e), host }, '[pg] resolve4 failed; using original host');
  }

  // Create pool
  const pool = new Pool({
    host,
    port,
    database,
    user,
    password,
    ssl,
    max,
    idleTimeoutMillis,
    connectionTimeoutMillis,
    allowExitOnIdle: true,
  });

  // Prevent unhandled pool errors from crashing the process (e.g., Supabase pooler resets)
  pool.on('error', (err) => {
    fastify.log.warn({ err }, '[pg] pool error (handled, client will be discarded)');
  }); 

  // Warm connection (fail fast; if pooled port 6543 fails with network error, retry 5432)
  try {
    const client = await pool.connect();
    client.release();
    fastify.log.info('[pg] pool connected');
  } catch (err: any) {
    const isNetErr = err?.code === 'EHOSTUNREACH' || err?.code === 'ETIMEDOUT' || err?.code === 'ECONNREFUSED';
    const isPooledPort = port === 6543;
    fastify.log.warn({ err, host, port }, '[pg] initial connect failed');
    if (isNetErr && isPooledPort) {
      fastify.log.warn({ host, retryPort: 5432 }, '[pg] retrying Postgres connect on port 5432');
      const retryPool = new Pool({
        host,
        port: 5432,
        database,
        user,
        password,
        ssl,
        max,
        idleTimeoutMillis,
        connectionTimeoutMillis,
      });
      retryPool.on('error', (err) => {
        fastify.log.warn({ err }, '[pg] retry pool error (handled, client will be discarded)');
      });
      const client2 = await retryPool.connect();
      client2.release();
      fastify.log.info('[pg] pool connected on port 5432; using retry pool');
      // replace pool reference and register close hook for retry pool
      fastify.decorate('pg', { pool: retryPool });
      fastify.addHook('onClose', async () => {
        try { await retryPool.end(); } catch {}
        fastify.log.info('[pg] retry pool closed');
      });
      return;
    }
    throw err;
  }

  // Decorate and add shutdown hook (only if not replaced by retry path)
  if (!(fastify as any).pg) {
    fastify.decorate('pg', { pool });
    fastify.addHook('onClose', async () => {
      try { await pool.end(); } catch {}
      fastify.log.info('[pg] pool closed');
    });
  }
});

export default pgPlugin;