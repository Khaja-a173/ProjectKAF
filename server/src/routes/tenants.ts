// server/src/routes/tenants.ts
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { TenantService } from "../services/tenant.service";
import { signQrPayload, generateQrPngUrl } from "../lib/qr";

const CreateTenantSchema = z.object({
  name: z.string().min(2, "name must be at least 2 characters"),
  plan: z.string().optional()
});

const QrParamsSchema = z.object({
  code: z
    .string()
    .length(4, "tenant code must be 4 characters")
    .transform((s) => s.toUpperCase()),
  table: z
    .string()
    .regex(/^T\d{2}$/, "table must match pattern T\\d{2}")
});

// --- Tax Config Schemas ---
const TaxComponentSchema = z.object({
  label: z.string().min(1, 'component label required'),
  rate: z.number().min(0, 'rate must be >= 0'), // percent or fraction accepted; we normalize
});

const SaveTaxBodySchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('single'),
    total_rate: z.number().min(0), // percent or fraction; we normalize
    currency: z.string().trim().min(3).max(8).optional(),
  }),
  z.object({
    mode: z.literal('components'),
    components: z.array(TaxComponentSchema).min(1),
    total_rate: z.number().min(0).optional(), // ignored; tolerated
    currency: z.string().trim().min(3).max(8).optional(),
  }),
]);

const toFraction = (n: number) => (n > 1 ? n / 100 : n);

function normalizePayload(body: z.infer<typeof SaveTaxBodySchema>) {
  const currency = (body.currency || 'INR').toUpperCase();
  if (body.mode === 'single') {
    return {
      mode: 'single' as const,
      total_rate: toFraction(body.total_rate),
      components: [],
      currency,
    };
  }
  const comps = body.components.map(c => ({ name: c.label.trim(), rate: toFraction(c.rate) }));
  const sum = comps.reduce((s, c) => s + (Number.isFinite(c.rate) ? c.rate : 0), 0);
  const total_rate = typeof body.total_rate === 'number' ? toFraction(body.total_rate) : sum;
  // enforce equivalence within tolerance
  if (Math.abs(sum - total_rate) > 1e-6) {
    const err: any = new Error('components_sum_mismatch');
    err.statusCode = 400;
    err.details = { expected: total_rate, actual: sum };
    throw err;
  }
  return { mode: 'components' as const, total_rate: 0, components: comps, currency };
}

function tenantIdFrom(app: FastifyInstance, req: any): string {
  const fromDecorator = (app as any)?.tenantFromReq?.(req);
  if (fromDecorator) return String(fromDecorator);
  const h = (req?.headers || {}) as Record<string, string | string[]>;
  return String(
    (h['x-tenant-id'] as string) ||
    (h['x-tenant'] as string) ||
    (req as any).tenant_id ||
    (req as any).query?.tenant_id ||
    ''
  );
}

export default async function routes(app: FastifyInstance) {
  const service = new TenantService(app);

  // Create tenant
  app.post("/tenants", async (req, reply) => {
    const parsed = CreateTenantSchema.safeParse((req as any).body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid body", details: parsed.error.flatten() });
    }

    try {
      const { name, plan } = parsed.data;
      const created = await service.createTenant(name, plan);
      return reply.code(201).send(created);
    } catch (err) {
      app.log.error({ err }, "failed to create tenant");
      return reply.code(500).send({ error: "Failed to create tenant" });
    }
  });

  // Generate QR for a table within a tenant
  app.get("/tenants/:code/qr/:table", async (req, reply) => {
    const parsed = QrParamsSchema.safeParse((req as any).params);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid params", details: parsed.error.flatten() });
    }

    const { code, table } = parsed.data;

    try {
      const tenant = await service.getTenantByCode(code);
      if (!tenant) {
        return reply.code(404).send({ error: "Tenant not found" });
      }

      const signed = signQrPayload({ tenant_code: code, table_code: table });
      const png = await generateQrPngUrl(signed);
      return reply.send({ data_url: png, signed });
    } catch (err) {
      app.log.error({ err, code, table }, "failed to generate tenant table QR");
      return reply.code(500).send({ error: "Failed to generate QR" });
    }
  });

  // Read tenant tax config (raw config table, not the view)
  app.get('/api/tenant/tax', { preHandler: [app.requireTenant] }, async (req, reply) => {
    const tenantId = tenantIdFrom(app, req);
    const cacheKey = app.rkey('tenant', tenantId, 'tax:v1');
    try {
      const cached = await app.redis.get(cacheKey);
      if (cached) {
        reply.header("X-Cache", "HIT");
        return reply.send(JSON.parse(cached));
      }

      const { data, error } = await app.supabase
        .from('tenant_tax_config')
        .select('tenant_id, mode, total_rate, components, currency, updated_at')
        .eq('tenant_id', tenantId)
        .maybeSingle();
      if (error) throw error;
      const result = data || { mode: 'single', total_rate: 0, components: [], currency: 'INR' };
      await app.redis.set(cacheKey, JSON.stringify(result), 'EX', 600);
      reply.header("X-Cache", "MISS");
      return reply.send(result);
    } catch (err) {
      app.log.error({ err, tenantId }, 'tax config read failed');
      return reply.code(500).send({ error: 'tax_config_read_failed' });
    }
  });

  // Save/Upsert tenant tax config
  app.post('/api/tenant/tax', { preHandler: [app.requireTenant] }, async (req, reply) => {
    const tenantId = tenantIdFrom(app, req);
    const parsed = SaveTaxBodySchema.safeParse((req as any).body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
    }
    try {
      const norm = normalizePayload(parsed.data);
      const row = {
        tenant_id: tenantId,
        mode: norm.mode,
        total_rate: norm.total_rate,
        components: norm.components,
        currency: norm.currency,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await app.supabase
        .from('tenant_tax_config')
        .upsert(row, { onConflict: 'tenant_id' })
        .select('tenant_id, mode, total_rate, components, currency, updated_at')
        .single();
      if (error) throw error;
      const cacheKey = app.rkey('tenant', tenantId, 'tax:v1');
      await app.redis.del(cacheKey);
      return reply.send(data);
    } catch (err: any) {
      const status = err?.statusCode || 500;
      app.log.error({ err, tenantId }, 'tax config save failed');
      return reply.code(status).send({ error: err?.message || 'tax_config_save_failed', details: err?.details });
    }
  });
}