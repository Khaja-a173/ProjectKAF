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
const toFraction = (n) => (n > 1 ? n / 100 : n);
function normalizePayload(body) {
    const currency = (body.currency || 'INR').toUpperCase();
    if (body.mode === 'single') {
        return {
            mode: 'single',
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
        const err = new Error('components_sum_mismatch');
        err.statusCode = 400;
        err.details = { expected: total_rate, actual: sum };
        throw err;
    }
    return { mode: 'components', total_rate: 0, components: comps, currency };
}
function tenantIdFrom(app, req) {
    const fromDecorator = app?.tenantFromReq?.(req);
    if (fromDecorator)
        return String(fromDecorator);
    const h = (req?.headers || {});
    return String(h['x-tenant-id'] ||
        h['x-tenant'] ||
        req.tenant_id ||
        req.query?.tenant_id ||
        '');
}
export default async function routes(app) {
    const service = new TenantService(app);
    // Create tenant
    app.post("/tenants", async (req, reply) => {
        const parsed = CreateTenantSchema.safeParse(req.body);
        if (!parsed.success) {
            return reply.code(400).send({ error: "Invalid body", details: parsed.error.flatten() });
        }
        try {
            const { name, plan } = parsed.data;
            const created = await service.createTenant(name, plan);
            return reply.code(201).send(created);
        }
        catch (err) {
            app.log.error({ err }, "failed to create tenant");
            return reply.code(500).send({ error: "Failed to create tenant" });
        }
    });
    // Generate QR for a table within a tenant
    app.get("/tenants/:code/qr/:table", async (req, reply) => {
        const parsed = QrParamsSchema.safeParse(req.params);
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
        }
        catch (err) {
            app.log.error({ err, code, table }, "failed to generate tenant table QR");
            return reply.code(500).send({ error: "Failed to generate QR" });
        }
    });
    // Read tenant tax config (raw config table, not the view)
    app.get('/api/tenant/tax', { preHandler: [app.requireTenant] }, async (req, reply) => {
        const tenantId = tenantIdFrom(app, req);
        try {
            const { data, error } = await app.supabase
                .from('tenant_tax_config')
                .select('tenant_id, mode, total_rate, components, currency, updated_at')
                .eq('tenant_id', tenantId)
                .maybeSingle();
            if (error)
                throw error;
            if (!data)
                return reply.send({ mode: 'single', total_rate: 0, components: [], currency: 'INR' });
            return reply.send(data);
        }
        catch (err) {
            app.log.error({ err, tenantId }, 'tax config read failed');
            return reply.code(500).send({ error: 'tax_config_read_failed' });
        }
    });
    // Save/Upsert tenant tax config
    app.post('/api/tenant/tax', { preHandler: [app.requireTenant] }, async (req, reply) => {
        const tenantId = tenantIdFrom(app, req);
        const parsed = SaveTaxBodySchema.safeParse(req.body);
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
            if (error)
                throw error;
            return reply.send(data);
        }
        catch (err) {
            const status = err?.statusCode || 500;
            app.log.error({ err, tenantId }, 'tax config save failed');
            return reply.code(status).send({ error: err?.message || 'tax_config_save_failed', details: err?.details });
        }
    });
}
