// server/src/routes/zones.ts
import type { FastifyPluginCallback, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import crypto from 'crypto';

const UpsertSchema = z.object({
  rows: z.array(z.object({
    zone_id: z.string().min(1),
    name: z.string().min(1),
    color: z.string().min(1),
    ord: z.number().int().nonnegative(),
  })).min(1),
});

const DeleteSchema = z.object({
  zone_ids: z.array(z.string().min(1)).min(1),
});

const zonesRoutes: FastifyPluginCallback = (fastify, _opts, done) => {
  const supabase = (fastify as any).supabase as import('@supabase/supabase-js').SupabaseClient;
  const redis = (fastify as any).redis;
  const ns = (fastify as any).redisNS;

  const requireTenant = (req: FastifyRequest, rep: FastifyReply): string | null => {
    const hdr = req.headers['x-tenant-id'];
    const tenantId = typeof hdr === 'string' ? hdr : Array.isArray(hdr) ? hdr[0] : undefined;
    if (!tenantId) { rep.code(400).send({ error: 'Missing X-Tenant-Id' }); return null; }
    return tenantId;
  };

  // GET /api/zones
  fastify.get('/', async (req, rep) => {
    const tenantId = requireTenant(req, rep); if (!tenantId) return;
    const key = `${ns}:zones:${tenantId}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        const etag = parsed.etag;
        if (req.headers['if-none-match'] === etag) {
          rep.code(304).send();
          return;
        }
        rep.header('x-cache', 'HIT');
        rep.header('etag', etag);
        rep.header('cache-control', 'public, max-age=60');
        rep.header('vary', 'Origin, X-Tenant-Id');
        rep.send(parsed.data);
        return;
      }
    } catch (err) {
      // fallback to DB if Redis fails
      fastify.log.error({ err }, 'redis get failed');
    }

    const { data, error } = await supabase
      .from('zones')
      .select('zone_id,name,color,ord')
      .eq('tenant_id', tenantId)
      .order('ord', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      fastify.log.error({ err: error }, 'zones list failed');
      return rep.code(500).send({ error: 'zones list failed' });
    }

    const safeData = data ?? [];
    const etag = crypto.createHash('sha1').update(JSON.stringify(safeData)).digest('hex');

    try {
      await redis.set(key, JSON.stringify({ etag, data: safeData }), 'EX', 60);
    } catch (err) {
      fastify.log.error({ err }, 'redis set failed');
    }

    if (req.headers['if-none-match'] === etag) {
      rep.code(304).send();
      return;
    }

    rep.header('x-cache', 'MISS');
    rep.header('etag', etag);
    rep.header('cache-control', 'public, max-age=60');
    rep.header('vary', 'Origin, X-Tenant-Id');
    return rep.send(safeData);
  });

  // POST /api/zones/bulk
  fastify.post('/bulk', async (req, rep) => {
    const tenantId = requireTenant(req, rep); if (!tenantId) return;
    const parsed = UpsertSchema.safeParse(req.body);
    if (!parsed.success) return rep.code(400).send({ error: parsed.error.flatten() });

    // attach tenant_id to every row
    const rows = parsed.data.rows.map(r => ({ ...r, tenant_id: tenantId }));
    const { data, error } = await supabase
      .from('zones')
      .upsert(rows, { onConflict: 'tenant_id,zone_id' })
      .select('zone_id,name,color,ord');

    if (error) {
      fastify.log.error({ err: error }, 'zones bulk upsert failed');
      return rep.code(500).send({ error: 'zones bulk upsert failed' });
    }

    const key = `${ns}:zones:${tenantId}`;
    try {
      await redis.del(key);
    } catch (err) {
      fastify.log.error({ err }, 'redis del failed');
    }

    return rep.send(data ?? []);
  });

  // POST /api/zones/delete-bulk
  // POST /api/zones/delete-bulk
  fastify.post('/delete-bulk', async (req, rep) => {
    const tenantId = requireTenant(req, rep); if (!tenantId) return;

    const parsed = DeleteSchema.safeParse(req.body);
    if (!parsed.success) return rep.code(400).send({ error: parsed.error.flatten() });

    const zoneIds = parsed.data.zone_ids;

    // 1) Strict count of tables for THIS tenant in these zones.
    //    We store tables.zone as the ZONE ID (e.g., "main-hall"), not the display name.
    //    Also ignore NULL zone fields so they don't count against deletion.
    const { count: tblCount, error: tblErr } = await supabase
      .from('tables')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .not('zone', 'is', null)
      .in('zone', zoneIds);

    if (tblErr) {
      fastify.log.error({ err: tblErr }, 'zones delete-bulk: tables count failed');
      return rep.code(500).send({ error: 'zones delete-bulk count failed' });
    }

    if ((tblCount ?? 0) > 0) {
      // Optional: lookup zone names for nicer message
      const { data: zones, error: zErr } = await supabase
        .from('zones')
        .select('zone_id,name')
        .eq('tenant_id', tenantId)
        .in('zone_id', zoneIds);

      const names = (zones ?? []).map(z => z.name);
      const friendly = names.length ? names.join(', ') : `${zoneIds.length} zone(s)`;
      return rep.code(409).send({
        error: 'zones_have_tables',
        message: `Cannot delete zone(s): ${friendly}. Please move or delete ${tblCount} table(s) first.`
      });
    }

    // 2) Safe delete now that there are no tables
    const { error, count } = await supabase
      .from('zones')
      .delete({ count: 'exact' })
      .eq('tenant_id', tenantId)
      .in('zone_id', zoneIds);

    if (error) {
      fastify.log.error({ err: error }, 'zones delete-bulk failed');
      return rep.code(500).send({ error: 'zones delete-bulk failed' });
    }

    const key = `${ns}:zones:${tenantId}`;
    try {
      await redis.del(key);
    } catch (err) {
      fastify.log.error({ err }, 'redis del failed');
    }

    return rep.send({ deleted: count ?? 0 });
  });

  done();
};

export default zonesRoutes;