import type { FastifyPluginCallback, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';

const tmSettingsRoutes: FastifyPluginCallback = (fastify, _opts, done) => {
  // Use the Supabase client you already initialize in supabasePlugin
  const supabase = (fastify as any).supabase as import('@supabase/supabase-js').SupabaseClient;
  const redis = (fastify as any).redis as import("ioredis").Redis;

  if (!supabase) {
    fastify.log.error('[tm-settings] Supabase client not found. Ensure supabasePlugin is registered in server/src/index.ts before routes.');
    done();
    return;
  }

  if (!redis) {
    fastify.log.error('[tm-settings] Redis client not found. Ensure redis plugin is registered.');
    done();
    return;
  }

  const requireTenant = (req: FastifyRequest, rep: FastifyReply): string | null => {
    const hdr = req.headers['x-tenant-id'];
    const tenantId = typeof hdr === 'string' ? hdr : Array.isArray(hdr) ? hdr[0] : undefined;
    if (!tenantId) { rep.code(400).send({ error: 'Missing X-Tenant-Id' }); return null; }
    return tenantId;
  };

  // GET /api/tm-settings -> returns {} if no row yet
  fastify.get('/', async (req, rep) => {
    const tenantId = requireTenant(req, rep); if (!tenantId) return;
    const cacheKey = `projectkaf:tmsettings:${tenantId}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const cachedData = JSON.parse(cached);
        const etag = crypto.createHash('sha1').update(cached).digest('hex');
        rep.header('Cache-Control', 'public, max-age=300');
        rep.header('ETag', etag);
        rep.header('Vary', 'X-Tenant-Id');
        rep.header('X-Cache', 'HIT');
        return rep.send(cachedData);
      }
    } catch (err) {
      fastify.log.error({ err }, '[tm-settings] Redis GET failed');
    }

    const { data, error } = await supabase
      .from('tm_settings')
      .select('data')
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) {
      fastify.log.error({ tenantId, error }, '[tm-settings] GET failed');
      return rep.code(500).send({ error: 'tm-settings get failed', details: error.message });
    }

    const responseData = data?.data ?? {};
    const responseStr = JSON.stringify(responseData);
    try {
      await redis.set(cacheKey, responseStr, 'EX', 300);
    } catch (err) {
      fastify.log.error({ err }, '[tm-settings] Redis SET failed');
    }

    const etag = crypto.createHash('sha1').update(responseStr).digest('hex');
    rep.header('Cache-Control', 'public, max-age=300');
    rep.header('ETag', etag);
    rep.header('Vary', 'X-Tenant-Id');
    rep.header('X-Cache', 'MISS');
    return rep.send(responseData);
  });

  // POST /api/tm-settings (debug mode)
  fastify.post('/', async (req, rep) => {
    const tenantId = requireTenant(req, rep); if (!tenantId) return;
    const bodyRaw = req.body;
    const body = (bodyRaw && typeof bodyRaw === 'object') ? (bodyRaw as Record<string, unknown>) : {};

    const { error } = await supabase
      .from('tm_settings')
      .upsert({ tenant_id: tenantId, data: body }, { onConflict: 'tenant_id' });

    if (error) {
      fastify.log.error({ tenantId, error }, '[tm-settings] POST failed');
      return rep.code(500).send({ error: 'tm-settings upsert failed', details: error.message });
    }

    const cacheKey = `projectkaf:tmsettings:${tenantId}`;
    try {
      await redis.del(cacheKey);
    } catch (err) {
      fastify.log.error({ err }, '[tm-settings] Redis DEL failed');
    }

    return rep.send(body);
  });

  done();
};

export default tmSettingsRoutes;