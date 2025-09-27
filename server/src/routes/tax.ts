import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { createHash } from "crypto";
import fp from "fastify-plugin";
import { z } from "zod";

// Schema for single mode
const singleModeSchema = z.object({
  mode: z.literal("single"),
  total_rate: z.number().min(0),
  components: z.array(z.any()).default([]),
  inclusion: z.enum(["inclusive", "exclusive"]).optional(),
});

// Schema for components mode
const componentSchema = z.object({
  name: z.string(),
  rate: z.number().min(0),
});
const componentsModeSchema = z.object({
  mode: z.literal("components"),
  total_rate: z.number().min(0).optional(), // will be calculated
  components: z.array(componentSchema).min(1),
  inclusion: z.enum(["inclusive", "exclusive"]).optional(),
});

const taxConfigSchema = z.union([singleModeSchema, componentsModeSchema]);

const DEFAULT_CONFIG = {
  mode: "single",
  total_rate: 0.08, // fraction (8%)
  components: [],
  inclusion: "inclusive" as const,
};

async function taxRoutes(fastify: FastifyInstance) {
  // GET /api/tax
  fastify.get("/api/tax", async (request: FastifyRequest, reply: FastifyReply) => {
    // Redis read-through + HTTP caching (ETag/Cache-Control/Vary)
    const r = (fastify as any).redis as any;
    const rkey = (fastify as any).rkey as undefined | ((...parts: string[]) => string);
    const ifNoneMatch = (request.headers?.["if-none-match"] as string | undefined) || undefined;
    const setCacheHeaders = (etagValue: string) => {
      reply.header("ETag", etagValue);
      reply.header("Cache-Control", "public, max-age=60");
      reply.header("Vary", "Origin, X-Tenant-Id");
    };

    const tenantId = request.headers["x-tenant-id"];
    if (!tenantId || typeof tenantId !== "string" || !tenantId.trim()) {
      return reply.status(400).send({ error: "Missing X-Tenant-Id header" });
    }
    const tenantIdStr = tenantId as string;
    const cacheKey = r && rkey ? rkey("tenant", tenantIdStr, "tax", "v1") : undefined;

    if (r && cacheKey) {
      try {
        const hit = await r.get(cacheKey);
        if (hit) {
          const bodyStr = typeof hit === "string" ? hit : JSON.stringify(hit);
          const etag = '"' + createHash("sha1").update(bodyStr).digest("hex") + '"';
          setCacheHeaders(etag);
          reply.header("X-Cache", "HIT");
          // Handle multiple/weak ETags for conditional GET
          if (ifNoneMatch) {
            const clientEtags = ifNoneMatch.split(",").map(e => e.trim().replace(/^W\//, ""));
            const currentEtag = etag.replace(/^W\//, "");
            if (clientEtags.includes(currentEtag)) {
              return reply.code(304).header("ETag", etag).send();
            }
          }
          return reply.send(JSON.parse(bodyStr));
        }
      } catch (e: any) {
        fastify.log.warn({ err: e?.message }, "tenant_tax_cache_read_failed");
      }
    }

    const { data, error } = await fastify.supabase
      .from('tenant_tax_config')
      .select('mode,total_rate,components,inclusion')
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) {
      fastify.log.warn({ err: error }, 'tenant_tax_config fetch failed; returning default');
      const payload = { ...DEFAULT_CONFIG };
      const bodyStr = JSON.stringify(payload);
      const etag = '"' + createHash("sha1").update(bodyStr).digest("hex") + '"';
      if (r && cacheKey) {
        try { await r.setex(cacheKey, 600, bodyStr); reply.header("X-Cache", "MISS"); } catch (e: any) {
          fastify.log.warn({ err: e?.message }, "tenant_tax_cache_set_failed");
        }
      }
      setCacheHeaders(etag);
      if (ifNoneMatch) {
        const clientEtags = ifNoneMatch.split(",").map(e => e.trim().replace(/^W\//, ""));
        const currentEtag = etag.replace(/^W\//, "");
        if (clientEtags.includes(currentEtag)) {
          return reply.code(304).header("ETag", etag).send();
        }
      }
      return reply.send(payload);
    }

    if (!data) {
      const payload = { ...DEFAULT_CONFIG };
      const bodyStr = JSON.stringify(payload);
      const etag = '"' + createHash("sha1").update(bodyStr).digest("hex") + '"';
      if (r && cacheKey) {
        try { await r.setex(cacheKey, 600, bodyStr); reply.header("X-Cache", "MISS"); } catch (e: any) {
          fastify.log.warn({ err: e?.message }, "tenant_tax_cache_set_failed");
        }
      }
      setCacheHeaders(etag);
      if (ifNoneMatch) {
        const clientEtags = ifNoneMatch.split(",").map(e => e.trim().replace(/^W\//, ""));
        const currentEtag = etag.replace(/^W\//, "");
        if (clientEtags.includes(currentEtag)) {
          return reply.code(304).header("ETag", etag).send();
        }
      }
      return reply.send(payload);
    }

    // components is JSONB in DB; ensure it's an array
    const components = Array.isArray(data.components) ? data.components : [];
    const inclusion = data.inclusion === 'exclusive' ? 'exclusive' : DEFAULT_CONFIG.inclusion;
    const payload = {
      mode: data.mode ?? DEFAULT_CONFIG.mode,
      total_rate: typeof data.total_rate === 'number' ? data.total_rate : DEFAULT_CONFIG.total_rate,
      components,
      inclusion,
    };
    const bodyStr = JSON.stringify(payload);
    const etag = '"' + createHash("sha1").update(bodyStr).digest("hex") + '"';
    if (r && cacheKey) {
      try { await r.setex(cacheKey, 600, bodyStr); reply.header("X-Cache", "MISS"); } catch (e: any) {
        fastify.log.warn({ err: e?.message }, "tenant_tax_cache_set_failed");
      }
    }
    setCacheHeaders(etag);
    if (ifNoneMatch) {
      const clientEtags = ifNoneMatch.split(",").map(e => e.trim().replace(/^W\//, ""));
      const currentEtag = etag.replace(/^W\//, "");
      if (clientEtags.includes(currentEtag)) {
        return reply.code(304).header("ETag", etag).send();
      }
    }
    return reply.send(payload);
  });

  // POST /api/tax
  fastify.post("/api/tax", async (request: FastifyRequest, reply: FastifyReply) => {
    const tenantId = request.headers["x-tenant-id"];
    if (!tenantId || typeof tenantId !== "string" || !tenantId.trim()) {
      return reply.status(400).send({ error: "Missing X-Tenant-Id header" });
    }
    let parsed;
    try {
      parsed = taxConfigSchema.parse(request.body);
    } catch (err: any) {
      return reply.status(400).send({ error: 'Invalid payload', details: err.errors });
    }

    // Build the row to save
    let row: any = { tenant_id: tenantId, updated_at: new Date().toISOString() };
    // Default to inclusive if not provided
    const inclusion = (parsed as any).inclusion === 'exclusive' ? 'exclusive' : 'inclusive';
    row.inclusion = inclusion;

    if (parsed.mode === 'single') {
      row.mode = 'single';
      row.total_rate = parsed.total_rate;
      row.components = [];
    } else {
      const total = parsed.components.reduce((sum, c) => sum + c.rate, 0);
      row.mode = 'components';
      row.total_rate = total;
      row.components = parsed.components; // JSONB
    }

    const { data, error } = await fastify.supabase
      .from('tenant_tax_config')
      .upsert(row, { onConflict: 'tenant_id' })
      .select('mode,total_rate,components,inclusion')
      .single();

    if (error) {
      fastify.log.error({ err: error }, 'tenant_tax_config upsert failed');
      return reply.status(500).send({ error: 'tax_config_upsert_failed', details: error.message ?? String(error) });
    }

    // Invalidate Redis cache for this tenant's tax config
    try {
      const cacheKey = (fastify as any).rkey?.('tenant', tenantId as string, 'tax', 'v1');
      if ((fastify as any).redis && cacheKey) {
        await (fastify as any).redis.del(cacheKey);
      }
    } catch (e: any) {
      fastify.log.warn({ err: e?.message }, 'tenant_tax_cache_invalidate_failed');
    }

    const components = Array.isArray(data.components) ? data.components : [];
    const inclusionOut = data.inclusion === 'exclusive' ? 'exclusive' : 'inclusive';
    return {
      mode: data.mode,
      total_rate: data.total_rate,
      components,
      inclusion: inclusionOut,
    };
  });
}

export default fp(taxRoutes);