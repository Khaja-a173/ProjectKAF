import fp from 'fastify-plugin';
import Redis from 'ioredis';
import { URL } from 'url';

export default fp(async (fastify) => {
  const raw = process.env.REDIS_URL || '';
  const url = raw.trim(); // guard against accidental spaces in .env
  if (!url) {
    fastify.log.warn('REDIS_URL not set; Redis features disabled');
    return;
  }

  const ns = process.env.REDIS_NAMESPACE ?? 'projectkaf';

  // Detect TLS only when scheme is rediss:// and set SNI (servername) accordingly
  let options: any = {
    lazyConnect: false,
    maxRetriesPerRequest: 2,
    enableReadyCheck: true,
  };
  let tlsEnabled = false;
  try {
    const u = new URL(url);
    if (u.protocol === 'rediss:') {
      tlsEnabled = true;
      options.tls = {
        servername: u.hostname,
        // If you hit local CA trust issues, you may temporarily allow self-signed certs:
        // rejectUnauthorized: false,
      };
    }
  } catch (e) {
    fastify.log.warn({ err: (e as any)?.message, url }, 'redis_url_parse_warning');
  }

  const redis = new Redis(url, options);

  redis.on('ready', () => fastify.log.info({ url, tls: tlsEnabled }, 'Redis connected'));
  redis.on('error', (err) => fastify.log.error({ err: err?.message, url, tls: tlsEnabled }, 'Redis error'));

  // namespaced key helper
  const rkey = (...parts: (string | number)[]) => [ns, ...parts].join(':');

  fastify.decorate('redis', redis);
  fastify.decorate('rkey', rkey);

  fastify.addHook('onClose', async () => {
    try { await redis.quit(); } catch {}
  });

  fastify.log.info({ ns }, 'Redis plugin ready');
});

declare module 'fastify' {
  interface FastifyInstance {
    redis: import('ioredis').Redis;
    rkey: (...parts: (string | number)[]) => string;
  }
}

export function getRedisClient(fastify: import('fastify').FastifyInstance) {
  return fastify.redis;
}

export function buildRedisKey(...parts: (string | number)[]) {
  const ns = process.env.REDIS_NAMESPACE ?? 'projectkaf';
  return [ns, ...parts].join(':');
}