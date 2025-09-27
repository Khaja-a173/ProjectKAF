// PATCH Section Toggle Schema
const SectionToggleParamsSchema = z.object({ id: z.string().uuid() });
const SectionToggleBodySchema = z.object({ is_active: z.boolean() });
import { z } from "zod";
import { randomUUID } from "crypto";
// NOTE: All handlers in this file are tenant-scoped via preHandler: [fastify.requireTenant].
// Do not read X-Tenant-Id manually here; use (req as any).tenantId set by the auth plugin.
// Unified logger context helper
function logCtx(base, start) {
    return { ...base, ms: Date.now() - start };
}
// -------- Helper functions for DB normalization --------
function asBool(v, def = false) { return typeof v === 'boolean' ? v : def; }
function asInt(v, def = 0) { const n = Number(v); return Number.isFinite(n) ? n : def; }
function sanitizeSectionRow(r) {
    return {
        id: (typeof r?.id === 'string' && r.id.trim()) ? r.id : null,
        name: (typeof r?.name === 'string' && r.name.trim()) ? r.name.trim() : 'Untitled',
        ord: asInt(r?.ord ?? r?.position, 0),
        is_active: asBool(r?.is_active, true),
    };
}
const sendDbError = (fastify, rep, label, error) => {
    const payload = {
        error: label,
        details: (error && (error.message || error.details)) || undefined,
        hint: error && (error.hint || error.code) || undefined,
    };
    fastify.log.error({ err: error, label }, `${label}: %o`, payload);
    return rep.code(500).send(payload);
};
// Schemas
const SectionsUpsertSchema = z.object({
    rows: z.array(z.object({
        id: z.string().uuid().optional(),
        name: z.string().min(1),
        // accept either ord or position from clients; both map to DB column `position`
        ord: z.number().int().nonnegative().optional(),
        position: z.number().int().nonnegative().optional(),
        is_active: z.boolean().optional(),
    })).min(1),
});
const SectionsDeleteSchema = z.object({
    ids: z.array(z.string().uuid()).min(1),
});
const SectionsUpdateSchema = z.object({
    rows: z.array(z.object({
        id: z.string().uuid(),
        is_active: z.boolean(),
    })).min(1),
});
const ItemRowBase = z.object({
    id: z.string().uuid().optional(),
    section_id: z.string().uuid().nullable().optional(),
    category_id: z.string().uuid().nullable().optional(),
    name: z.string().min(1).optional(),
    price: z.number().nonnegative().optional(),
    ord: z.number().int().nonnegative().optional(),
    is_available: z.boolean().optional(),
    image_url: z.string().url().nullable().optional(),
    description: z.string().nullable().optional(),
    tags: z.union([z.array(z.string()), z.string()]).optional(),
    calories: z.number().int().nonnegative().nullable().optional(),
    spicy_level: z.number().int().min(0).max(5).nullable().optional(),
    preparation_time: z.number().int().nonnegative().nullable().optional(),
});
const ItemsUpsertSchema = z.object({
    rows: z.array(ItemRowBase.refine((r) => {
        // allow partial update if id is present
        if (r.id)
            return true;
        // otherwise require minimum fields for create
        return !!(r.name && typeof r.price === "number");
    }, {
        message: "Each row must include id for partial update, or include both name and price for create.",
    })).min(1),
});
const ItemsDeleteSchema = z.object({
    ids: z.array(z.string().uuid()).min(1),
});
const ItemsQuerySchema = z.object({
    sectionId: z.string().uuid().optional(),
    section_id: z.string().uuid().optional(),
    uncategorized: z.preprocess((v) => {
        if (typeof v === 'string')
            return v === 'true' || v === '1';
        if (typeof v === 'number')
            return v === 1;
        if (typeof v === 'boolean')
            return v;
        return false;
    }, z.boolean().optional()),
});
const ResolveRefsSchema = z.object({
    sections: z.array(z.string()).optional().default([]),
    categories: z.array(z.string()).optional().default([]),
    options: z.object({ autoCreateMissing: z.boolean().optional().default(true) }).optional().default({ autoCreateMissing: true }),
});
const ToggleItemsParamsSchema = z.object({ id: z.string().uuid() });
const ToggleItemsBodySchema = z.object({ available: z.boolean() });
// PATCH Item Toggle Schema
const ItemToggleParamsSchema = z.object({ id: z.string().uuid() });
const ItemToggleBodySchema = z.object({ is_available: z.boolean() });
const menuRoutes = (fastify, _opts, done) => {
    const supabase = fastify.supabase;
    if (!supabase) {
        fastify.log.error("Supabase client not found on fastify instance");
        // Ensure JSON response in case of misconfiguration
        fastify.get("/*", async (_req, rep) => rep.code(500).send({ error: "supabase_not_initialized" }));
        fastify.post("/*", async (_req, rep) => rep.code(500).send({ error: "supabase_not_initialized" }));
    }
    // -------- Sections --------
    // -------- Sections (resilient to position/ord schema) --------
    // -------- Sections (resilient to position/ord schema, clear errors) --------
    // -------- Sections (resilient select: position → ord fallback, clear errors) --------
    fastify.get("/sections", { preHandler: [fastify.requireTenant] }, async (req, rep) => {
        const start = Date.now();
        const reqId = randomUUID();
        const rawTenant = req.tenantId || req.headers?.["x-tenant-id"] || req.headers?.["X-Tenant-Id"];
        const tenantCheck = z.string().uuid();
        const parsedTenant = tenantCheck.safeParse(rawTenant);
        if (!parsedTenant.success) {
            fastify.log.warn({ reqId, route: 'GET /menu/sections', rawTenant }, 'missing_or_invalid_tenant_header');
            return rep.code(400).send({ error: 'TENANT_HEADER_INVALID' });
        }
        const tenantId = parsedTenant.data;
        const includeInactive = (() => {
            const q = req.query || {};
            const v = q.include_inactive;
            if (typeof v === 'string')
                return v === '1' || v.toLowerCase() === 'true';
            if (typeof v === 'number')
                return v === 1;
            if (typeof v === 'boolean')
                return v;
            return false;
        })();
        const fail = (status, code, extra) => {
            fastify.log[status >= 500 ? 'error' : 'warn']({ reqId, route: 'GET /menu/sections', tenantId, code, extra, ms: Date.now() - start }, 'menu_sections_failed');
            return rep.code(status).send({ error: code });
        };
        try {
            // Attempt 1: assume DB has `position`
            const baseSel = fastify.supabase
                .from("menu_sections")
                .select(`
          id,
          tenant_id,
          name,
          position,
          is_active
        `)
                .eq("tenant_id", tenantId)
                .order("position", { ascending: true })
                .order("name", { ascending: true });
            const { data, error } = await baseSel;
            if (error) {
                const msg = error.message?.toLowerCase() || "";
                const code = error.code;
                // RLS/permission → 403 (not 500)
                if (msg.includes('permission denied') || msg.includes('row-level security') || code === '42501') {
                    return fail(403, 'TENANT_POLICY_DENIED', { supabase: error.message });
                }
                // Column missing → fallback to `ord`
                if (code === '42703' || msg.includes('column') && msg.includes('does not exist')) {
                    const baseSelOrd = fastify.supabase
                        .from("menu_sections")
                        .select(`
              id,
              tenant_id,
              name,
              ord,
              is_active
            `)
                        .eq("tenant_id", tenantId)
                        .order("ord", { ascending: true })
                        .order("name", { ascending: true });
                    const { data: dataOrd, error: errOrd } = await baseSelOrd;
                    if (errOrd) {
                        const msg2 = errOrd.message?.toLowerCase() || "";
                        const code2 = errOrd.code;
                        if (msg2.includes('permission denied') || msg2.includes('row-level security') || code2 === '42501') {
                            return fail(403, 'TENANT_POLICY_DENIED', { supabase: errOrd.message });
                        }
                        return rep.code(500).send({
                            error: 'MENU_SECTIONS_FETCH_FAILED',
                            details: errOrd?.message || null,
                            code: errOrd?.code || null,
                        });
                    }
                    const mapped = (dataOrd ?? []).map((r) => ({
                        id: r.id,
                        tenant_id: r.tenant_id,
                        name: r.name,
                        position: r.ord ?? 0, // map ord → position for the client
                        is_active: r.is_active,
                    }));
                    fastify.log.info({ reqId, route: "GET /menu/sections", tenantId, count: mapped.length, includeInactive, ms: Date.now() - start });
                    return rep.code(200).send(mapped);
                }
                // other DB error → 500 with hint in logs
                return rep.code(500).send({ error: 'MENU_SECTIONS_FETCH_FAILED', details: error?.message || null, code: error?.code || null });
            }
            fastify.log.info({ reqId, route: "GET /menu/sections", tenantId, count: (data?.length || 0), includeInactive, ms: Date.now() - start });
            return rep.code(200).send(data ?? []);
        }
        catch (ex) {
            return fail(500, 'MENU_SECTIONS_FETCH_FAILED', { ex: ex?.message });
        }
    });
    fastify.post("/sections/bulk", { preHandler: [fastify.requireTenant] }, async (req, rep) => {
        const start = Date.now();
        const reqId = randomUUID();
        const rawTenant = req.tenantId || req.headers?.["x-tenant-id"] || req.headers?.["X-Tenant-Id"];
        const tenantCheck = z.string().uuid();
        const parsedTenant = tenantCheck.safeParse(rawTenant);
        if (!parsedTenant.success) {
            return rep.code(400).send({ error: 'TENANT_HEADER_INVALID' });
        }
        const tenantId = parsedTenant.data;
        const parsed = SectionsUpsertSchema.safeParse(req.body);
        if (!parsed.success) {
            return rep.code(400).send({ error: "invalid sections payload", issues: parsed.error.flatten() });
        }
        const rows = parsed.data.rows.map(sanitizeSectionRow);
        if (rows.length === 0)
            return rep.send([]);
        const payload = rows.map(r => ({
            ...(r.id ? { id: r.id } : {}),
            tenant_id: tenantId,
            name: r.name,
            ord: r.ord,
            is_active: r.is_active,
        }));
        const { data, error } = await supabase
            .from("menu_sections")
            .upsert(payload, { onConflict: "id" })
            .select("id, tenant_id, name, ord, is_active, created_at, updated_at");
        if (error) {
            fastify.log.error({ reqId, error }, "menu_sections_bulk_upsert_failed");
            return sendDbError(fastify, rep, "menu sections bulk upsert failed", error);
        }
        const mapped = (data || []).map((r) => ({
            id: r.id,
            tenant_id: r.tenant_id,
            name: r.name,
            position: r.ord, // keep UI contract
            is_active: r.is_active,
            created_at: r.created_at,
            updated_at: r.updated_at,
        }));
        fastify.log.info(logCtx({ reqId, route: "POST /menu/sections/bulk", tenantId, upserted: mapped.length }, start), "menu_sections_upsert_done");
        return rep.send(mapped);
    });
    fastify.post("/sections/delete-bulk", { preHandler: [fastify.requireTenant] }, async (req, rep) => {
        const start = Date.now();
        const reqId = randomUUID();
        const rawTenant = req.tenantId || req.headers?.["x-tenant-id"] || req.headers?.["X-Tenant-Id"];
        const tenantCheck = z.string().uuid();
        const parsedTenant = tenantCheck.safeParse(rawTenant);
        if (!parsedTenant.success) {
            return rep.code(400).send({ error: 'TENANT_HEADER_INVALID' });
        }
        const tenantId = parsedTenant.data;
        const parsed = SectionsDeleteSchema.safeParse(req.body);
        if (!parsed.success) {
            return rep.code(400).send({ error: "invalid sections delete payload", issues: parsed.error.flatten() });
        }
        const ids = parsed.data.ids;
        if (ids.length === 0)
            return rep.send({ deletedSections: 0, deletedItems: 0, archivedItems: 0 });
        // Find item ids in these sections for this tenant
        const { data: items, error: itemsErr } = await supabase
            .from("menu_items")
            .select("id")
            .eq("tenant_id", tenantId)
            .in("section_id", ids);
        if (itemsErr)
            return sendDbError(fastify, rep, "fetch items for sections failed", itemsErr);
        const itemIds = (items || []).map((r) => r.id);
        let deletedItems = 0;
        if (itemIds.length > 0) {
            // Delete dependents referencing those items
            const { error: cErr } = await supabase
                .from("cart_items")
                .delete()
                .eq("tenant_id", tenantId)
                .in("menu_item_id", itemIds);
            if (cErr)
                return sendDbError(fastify, rep, "delete cart_items for sections failed", cErr);
            // Delete items
            const { data: di, error: iErr } = await supabase
                .from("menu_items")
                .delete()
                .eq("tenant_id", tenantId)
                .in("id", itemIds)
                .select("id");
            if (iErr)
                return sendDbError(fastify, rep, "delete menu_items for sections failed", iErr);
            deletedItems = (di || []).length;
        }
        // Finally delete sections
        const { data: ds, error: sErr } = await supabase
            .from("menu_sections")
            .delete()
            .eq("tenant_id", tenantId)
            .in("id", ids)
            .select("id");
        if (sErr)
            return sendDbError(fastify, rep, "delete menu_sections failed", sErr);
        const deletedSections = (ds || []).length;
        fastify.log.info(logCtx({ reqId, route: 'POST /menu/sections/delete-bulk', tenantId, deletedSections, deletedItems }, start), 'menu_sections_delete_done');
        return rep.send({ deletedSections, deletedItems, archivedItems: 0 });
    });
    fastify.post("/sections/update-bulk", { preHandler: [fastify.requireTenant] }, async (req, rep) => {
        const start = Date.now();
        const reqId = randomUUID();
        // Tenant (plugin + header fallback + UUID validation)
        const rawTenant = req.tenantId ||
            req.headers?.["x-tenant-id"] ||
            req.headers?.["X-Tenant-Id"];
        const tenantCheck = z.string().uuid();
        const parsedTenant = tenantCheck.safeParse(rawTenant);
        if (!parsedTenant.success) {
            return rep.code(400).send({ error: "TENANT_HEADER_INVALID" });
        }
        const tenantId = parsedTenant.data;
        // Accept any of these bodies:
        //  A) { ids: string[], is_active: boolean }
        //  B) { updates: { id: string, is_active: boolean }[] }
        //  C) { rows: { id: string, is_active: boolean }[] }  // legacy
        const body = req.body || {};
        let ids = Array.isArray(body?.ids) ? body.ids : undefined;
        let isActive = typeof body?.is_active === "boolean" ? body.is_active : undefined;
        const pickFromArray = (arr) => {
            const validIds = arr.map((u) => u?.id).filter((v) => typeof v === "string");
            const firstIsActive = arr.find((u) => typeof u?.is_active === "boolean")?.is_active;
            return { validIds, firstIsActive };
        };
        if ((!ids || ids.length === 0) && Array.isArray(body?.updates) && body.updates.length > 0) {
            const { validIds, firstIsActive } = pickFromArray(body.updates);
            ids = validIds;
            if (typeof firstIsActive === "boolean")
                isActive = firstIsActive;
        }
        if ((!ids || ids.length === 0) && Array.isArray(body?.rows) && body.rows.length > 0) {
            const { validIds, firstIsActive } = pickFromArray(body.rows);
            ids = validIds;
            if (typeof firstIsActive === "boolean")
                isActive = firstIsActive;
        }
        if (!ids || ids.length === 0) {
            return rep.code(400).send({ error: "INVALID_PAYLOAD", details: "Provide ids[] or updates[]/rows[]" });
        }
        if (typeof isActive !== "boolean") {
            return rep.code(400).send({ error: "INVALID_PAYLOAD", details: "Provide is_active boolean" });
        }
        // Update via Supabase (tenant-scoped)
        const { data, error } = await supabase
            .from("menu_sections")
            .update({ is_active: isActive })
            .eq("tenant_id", tenantId)
            .in("id", ids)
            .select("id, tenant_id, name, ord, is_active, updated_at");
        if (error) {
            fastify.log.error({ reqId, error }, "menu_sections_update_bulk_failed");
            return sendDbError(fastify, rep, "menu sections update-bulk failed", error);
        }
        const results = (data || []).map((r) => ({
            id: r.id,
            tenant_id: r.tenant_id,
            name: r.name,
            position: r.ord, // map ord → position for clients
            is_active: r.is_active,
            updated_at: r.updated_at,
        }));
        fastify.log.info(logCtx({ reqId, route: "POST /menu/sections/update-bulk", tenantId, count: results.length, is_active: isActive }, start), "menu_sections_update_bulk_done");
        // Keep legacy response shape: array of updated rows
        return rep.send(results);
    });
    // -------- Items --------
    fastify.get("/items", { preHandler: [fastify.requireTenant] }, async (req, rep) => {
        const start = Date.now();
        const reqId = randomUUID();
        const tenantId = req.tenantId;
        const parsedQ = ItemsQuerySchema.safeParse(req.query);
        if (!parsedQ.success) {
            return rep.code(400).send({ error: "invalid query", issues: parsedQ.error.flatten() });
        }
        const { sectionId, section_id, uncategorized } = parsedQ.data;
        let sec = sectionId ?? section_id;
        // sanitize common bogus values coming from the UI
        if (sec === 'undefined' || sec === 'null' || sec === '') {
            sec = undefined;
        }
        // validate UUID shape explicitly; if not valid, treat as no section filter
        if (typeof sec === 'string') {
            const validUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sec);
            if (!validUuid)
                sec = undefined;
        }
        // sanitize common bogus values coming from the UI
        if (sec === 'undefined' || sec === 'null' || sec === '') {
            sec = undefined;
        }
        const fail = (status, code, extra) => {
            fastify.log[status >= 500 ? 'error' : 'warn']({ reqId, route: 'GET /menu/items', tenantId, code, extra, ms: Date.now() - start }, 'menu_items_failed');
            return rep.code(status).send({ error: code, ...extra });
        };
        const FULL_ITEM_COLS = "id,tenant_id,section_id,category_id,name,price,ord,is_available,image_url,description,tags,calories,spicy_level,preparation_time,created_at,updated_at";
        const MIN_ITEM_COLS = "id,tenant_id,section_id,category_id,name,price,ord,is_available,image_url,description,tags";
        // Items are now independent of section visibility. The UI will grey out items when `is_available` is false.
        // Case A: Explicit section filter
        if (sec) {
            // ensure the section exists for this tenant
            const { data: secRow, error: secErr } = await supabase
                .from("menu_sections")
                .select("id")
                .eq("tenant_id", tenantId)
                .eq("id", sec)
                .maybeSingle();
            if (secErr) {
                return fail(500, 'MENU_ITEMS_FETCH_FAILED', { details: secErr?.message, code: secErr?.code });
            }
            if (!secRow) {
                return fail(404, 'section_not_found', { sectionId: sec });
            }
            const { data, error } = await supabase
                .from("menu_items")
                .select(FULL_ITEM_COLS)
                .eq("tenant_id", tenantId)
                .eq("section_id", sec)
                .order("ord", { ascending: true })
                .order("name", { ascending: true });
            if (!error) {
                fastify.log.info(logCtx({ reqId, route: 'GET /menu/items', tenantId, section: sec, count: (data?.length || 0) }, start), 'menu_items_list_done');
            }
            if (error) {
                const msg = error?.message?.toLowerCase() || '';
                const code = error?.code;
                if (msg.includes('permission denied') || msg.includes('row-level security') || code === '42501') {
                    return fail(403, 'TENANT_POLICY_DENIED', { details: error?.message, code });
                }
                if (code === '42703' || (msg.includes('column') && msg.includes('does not exist'))) {
                    const { data: d2, error: e2 } = await supabase
                        .from('menu_items')
                        .select(MIN_ITEM_COLS)
                        .eq('tenant_id', tenantId)
                        .eq('section_id', sec)
                        .order('ord', { ascending: true })
                        .order('name', { ascending: true });
                    if (e2) {
                        const msg2 = e2?.message?.toLowerCase() || '';
                        const code2 = e2?.code;
                        if (msg2.includes('permission denied') || msg2.includes('row-level security') || code2 === '42501') {
                            return fail(403, 'TENANT_POLICY_DENIED', { details: e2?.message, code: code2 });
                        }
                        return fail(500, 'MENU_ITEMS_FETCH_FAILED', { details: e2?.message, code: code2 });
                    }
                    return rep.send(d2 ?? []);
                }
                return fail(500, 'MENU_ITEMS_FETCH_FAILED', { details: error?.message, code });
            }
            return rep.send(data ?? []);
        }
        // Case B: Uncategorized explicitly requested
        if (uncategorized) {
            const { data, error } = await supabase
                .from("menu_items")
                .select(FULL_ITEM_COLS)
                .eq("tenant_id", tenantId)
                .is("section_id", null)
                .order("ord", { ascending: true })
                .order("name", { ascending: true });
            if (!error) {
                fastify.log.info(logCtx({ reqId, route: 'GET /menu/items', tenantId, uncategorized: true, count: (data?.length || 0) }, start), 'menu_items_list_done');
            }
            if (error) {
                const msg = error?.message?.toLowerCase() || '';
                const code = error?.code;
                if (msg.includes('permission denied') || msg.includes('row-level security') || code === '42501') {
                    return fail(403, 'TENANT_POLICY_DENIED', { details: error?.message, code });
                }
                if (code === '42703' || (msg.includes('column') && msg.includes('does not exist'))) {
                    const { data: d2, error: e2 } = await supabase
                        .from('menu_items')
                        .select(MIN_ITEM_COLS)
                        .eq('tenant_id', tenantId)
                        .is('section_id', null)
                        .order('ord', { ascending: true })
                        .order('name', { ascending: true });
                    if (e2) {
                        const msg2 = e2?.message?.toLowerCase() || '';
                        const code2 = e2?.code;
                        if (msg2.includes('permission denied') || msg2.includes('row-level security') || code2 === '42501') {
                            return fail(403, 'TENANT_POLICY_DENIED', { details: e2?.message, code: code2 });
                        }
                        return fail(500, 'MENU_ITEMS_FETCH_FAILED', { details: e2?.message, code: code2 });
                    }
                    return rep.send(d2 ?? []);
                }
                return fail(500, 'MENU_ITEMS_FETCH_FAILED', { details: error?.message, code });
            }
            return rep.send(data ?? []);
        }
        // Case C: No section filter -> return all items for tenant (client can group by section)
        const { data, error } = await supabase
            .from("menu_items")
            .select(FULL_ITEM_COLS)
            .eq("tenant_id", tenantId)
            .order("ord", { ascending: true })
            .order("name", { ascending: true });
        if (!error) {
            fastify.log.info(logCtx({ reqId, route: 'GET /menu/items', tenantId, all: true, count: (data?.length || 0) }, start), 'menu_items_list_done');
        }
        if (error) {
            const msg = error?.message?.toLowerCase() || '';
            const code = error?.code;
            if (msg.includes('permission denied') || msg.includes('row-level security') || code === '42501') {
                return fail(403, 'TENANT_POLICY_DENIED', { details: error?.message, code });
            }
            if (code === '42703' || (msg.includes('column') && msg.includes('does not exist'))) {
                const { data: d2, error: e2 } = await supabase
                    .from('menu_items')
                    .select(MIN_ITEM_COLS)
                    .eq('tenant_id', tenantId)
                    .order('ord', { ascending: true })
                    .order('name', { ascending: true });
                if (e2) {
                    const msg2 = e2?.message?.toLowerCase() || '';
                    const code2 = e2?.code;
                    if (msg2.includes('permission denied') || msg2.includes('row-level security') || code2 === '42501') {
                        return fail(403, 'TENANT_POLICY_DENIED', { details: e2?.message, code: code2 });
                    }
                    return fail(500, 'MENU_ITEMS_FETCH_FAILED', { details: e2?.message, code: code2 });
                }
                return rep.send(d2 ?? []);
            }
            return fail(500, 'MENU_ITEMS_FETCH_FAILED', { details: error?.message, code });
        }
        return rep.send(data ?? []);
    });
    // -------- Section Items Toggle --------
    fastify.post("/sections/:id/toggle-items", { preHandler: [fastify.requireTenant] }, async (req, rep) => {
        const start = Date.now();
        const reqId = randomUUID();
        const tenantId = req.tenantId;
        const paramsParsed = ToggleItemsParamsSchema.safeParse(req.params);
        if (!paramsParsed.success) {
            return rep.code(400).send({ error: "invalid params", issues: paramsParsed.error.flatten() });
        }
        const bodyParsed = ToggleItemsBodySchema.safeParse(req.body);
        if (!bodyParsed.success) {
            return rep.code(400).send({ error: "invalid body", issues: bodyParsed.error.flatten() });
        }
        const sectionId = paramsParsed.data.id;
        const available = bodyParsed.data.available;
        // Ensure section belongs to tenant (and exists)
        const { data: secRow, error: secErr } = await supabase
            .from("menu_sections")
            .select("id")
            .eq("tenant_id", tenantId)
            .eq("id", sectionId)
            .maybeSingle();
        if (secErr)
            return sendDbError(fastify, rep, "toggle-items section lookup failed", secErr);
        if (!secRow)
            return rep.code(404).send({ error: "section_not_found" });
        const { data, error } = await supabase
            .from("menu_items")
            .update({ is_available: available })
            .eq("tenant_id", tenantId)
            .eq("section_id", sectionId)
            .select("id");
        if (error)
            return sendDbError(fastify, rep, "toggle-items update failed", error);
        fastify.log.info(logCtx({ reqId, route: 'POST /menu/sections/:id/toggle-items', tenantId, sectionId, available, updated: (data?.length || 0) }, start), 'menu_section_toggle_items_done');
        return rep.send({ sectionId, available, updated: data?.length ?? 0 });
    });
    fastify.post("/items/bulk", { preHandler: [fastify.requireTenant] }, async (req, rep) => {
        const start = Date.now();
        const reqId = randomUUID();
        const tenantId = req.tenantId;
        const parsed = ItemsUpsertSchema.safeParse(req.body);
        if (!parsed.success) {
            return rep.code(400).send({ error: "invalid items payload", issues: parsed.error.flatten() });
        }
        // Prepare and validate foreign keys up-front (no async in mappers)
        const incomingRows = parsed.data.rows;
        const providedSectionIds = Array.from(new Set(incomingRows
            .map((r) => (r.section_id ? String(r.section_id) : null))
            .filter((v) => !!v)));
        const providedCategoryIds = Array.from(new Set(incomingRows
            .map((r) => (r.category_id ? String(r.category_id) : null))
            .filter((v) => !!v)));
        let validSectionSet = new Set();
        if (providedSectionIds.length > 0) {
            const { data: validSec, error: validSecErr } = await supabase
                .from("menu_sections")
                .select("id")
                .eq("tenant_id", tenantId)
                .in("id", providedSectionIds);
            if (validSecErr)
                return sendDbError(fastify, rep, "menu items bulk upsert: validate sections failed", validSecErr);
            validSectionSet = new Set((validSec ?? []).map((r) => r.id));
        }
        let validCategorySet = new Set();
        if (providedCategoryIds.length > 0) {
            const { data: validCat, error: validCatErr } = await supabase
                .from("categories")
                .select("id")
                .eq("tenant_id", tenantId)
                .in("id", providedCategoryIds);
            if (validCatErr)
                return sendDbError(fastify, rep, "menu items bulk upsert: validate categories failed", validCatErr);
            validCategorySet = new Set((validCat ?? []).map((r) => r.id));
        }
        // Build normalized rows (invalidate cross-tenant FKs, normalize tags/numbers)
        const rows = incomingRows.map((r) => {
            // normalize tags
            let tags;
            if (Array.isArray(r.tags)) {
                tags = r.tags.filter((t) => !!t);
            }
            else if (typeof r.tags === "string") {
                tags = r.tags
                    .split(/[|,;]/g)
                    .map((t) => t.trim())
                    .filter(Boolean);
            }
            const normalizedSectionId = r.section_id && !validSectionSet.has(String(r.section_id)) ? null : r.section_id ?? null;
            const normalizedCategoryId = r.category_id && !validCategorySet.has(String(r.category_id)) ? null : r.category_id ?? null;
            const out = {
                tenant_id: tenantId,
            };
            if (r.id)
                out.id = r.id;
            if ("section_id" in r)
                out.section_id = normalizedSectionId;
            if ("category_id" in r)
                out.category_id = normalizedCategoryId;
            if ("name" in r)
                out.name = r.name;
            if ("price" in r)
                out.price = typeof r.price === "number" && Number.isFinite(r.price) ? r.price : 0;
            if ("ord" in r)
                out.ord = typeof r.ord === "number" && Number.isInteger(r.ord) && r.ord >= 0 ? r.ord : 0;
            if ("is_available" in r)
                out.is_available = r.is_available;
            if ("image_url" in r)
                out.image_url = r.image_url ?? null;
            if ("description" in r)
                out.description = r.description ?? null;
            if (tags)
                out.tags = tags;
            if ("calories" in r)
                out.calories = r.calories ?? null;
            if ("spicy_level" in r)
                out.spicy_level = r.spicy_level ?? null;
            if ("preparation_time" in r)
                out.preparation_time = r.preparation_time ?? null;
            return out;
        });
        // If any rows are updates (have id), prefetch current values to merge
        const rowsWithId = rows.filter((r) => !!r.id);
        let existingMap = new Map();
        if (rowsWithId.length > 0) {
            const { data: existing, error: existingErr } = await supabase
                .from("menu_items")
                .select("id, section_id, category_id, name, price, ord, is_available, image_url, description, tags, calories, spicy_level, preparation_time")
                .eq("tenant_id", tenantId)
                .in("id", rowsWithId.map((r) => r.id));
            if (existingErr) {
                return sendDbError(fastify, rep, "menu items bulk upsert prefetch failed", existingErr);
            }
            (existing ?? []).forEach((row) => {
                existingMap.set(row.id, row);
            });
        }
        // Ensure category_id is always set to a VALID category (FK-safe)
        // Strategy: use provided category_id; otherwise, use/create a per-tenant default category ("General")
        const DEFAULT_CATEGORY_NAME = "General";
        // 1) Try to find the default category for this tenant
        let defaultCategoryId = null;
        {
            const { data: cat, error: catErr } = await supabase
                .from("categories")
                .select("id")
                .eq("tenant_id", tenantId)
                .eq("name", DEFAULT_CATEGORY_NAME)
                .maybeSingle();
            if (catErr) {
                return sendDbError(fastify, rep, "menu default category lookup failed", catErr);
            }
            if (cat?.id) {
                defaultCategoryId = cat.id;
            }
            else {
                // 2) Create it if missing (minimal fields only; avoid optional columns)
                const { data: created, error: createErr } = await supabase
                    .from("categories")
                    .insert({
                    tenant_id: tenantId,
                    name: DEFAULT_CATEGORY_NAME
                })
                    .select("id")
                    .single();
                if (createErr) {
                    return sendDbError(fastify, rep, "menu default category create failed", createErr);
                }
                defaultCategoryId = created.id;
            }
        }
        // 3) Normalize rows: merge with existing DB row for updates, preserve required columns, apply default category if needed
        const normalizedRows = rows.map((item) => {
            // If updating, merge with existing DB row so required columns (e.g., name) are preserved
            const base = item.id ? (existingMap.get(item.id) || {}) : {};
            // Important: never overwrite with undefined; only set when provided or keep existing
            const merged = {
                tenant_id: tenantId,
                id: item.id ?? base.id,
                // section/category: prefer incoming, else keep existing, else allow null/default
                section_id: (Object.prototype.hasOwnProperty.call(item, "section_id") ? item.section_id : base.section_id) ?? null,
                category_id: (Object.prototype.hasOwnProperty.call(item, "category_id") ? item.category_id : base.category_id) ?? defaultCategoryId,
                // required on table: ensure these exist after merge
                name: Object.prototype.hasOwnProperty.call(item, "name") ? item.name : base.name,
                price: Object.prototype.hasOwnProperty.call(item, "price")
                    ? (typeof item.price === "number" && Number.isFinite(item.price) ? item.price : 0)
                    : base.price,
                // optional fields (carry existing forward if not provided)
                ord: Object.prototype.hasOwnProperty.call(item, "ord")
                    ? (typeof item.ord === "number" && Number.isInteger(item.ord) && item.ord >= 0 ? item.ord : 0)
                    : (base.ord ?? 0),
                is_available: Object.prototype.hasOwnProperty.call(item, "is_available") ? item.is_available : (base.is_available ?? true),
                image_url: Object.prototype.hasOwnProperty.call(item, "image_url") ? (item.image_url ?? null) : (base.image_url ?? null),
                description: Object.prototype.hasOwnProperty.call(item, "description") ? (item.description ?? null) : (base.description ?? null),
                tags: Object.prototype.hasOwnProperty.call(item, "tags") ? (item.tags ?? base.tags ?? []) : (base.tags ?? []),
                calories: Object.prototype.hasOwnProperty.call(item, "calories") ? (item.calories ?? null) : (base.calories ?? null),
                spicy_level: Object.prototype.hasOwnProperty.call(item, "spicy_level") ? (item.spicy_level ?? null) : (base.spicy_level ?? null),
                preparation_time: Object.prototype.hasOwnProperty.call(item, "preparation_time") ? (item.preparation_time ?? null) : (base.preparation_time ?? null),
            };
            return merged;
        });
        // Split rows: creates (no id) vs updates (with id)
        const createRows = normalizedRows.filter((r) => !r.id);
        const updateRows = normalizedRows.filter((r) => !!r.id);
        // Ensure DB NOT NULL id constraint is satisfied for inserts (when table has no default)
        const createRowsWithIds = createRows.map((r) => ({
            ...r,
            id: r.id ?? randomUUID(),
        }));
        let out = [];
        // 1) INSERT for creates (let DB generate id defaults)
        if (createRows.length > 0) {
            const { data: d1, error: e1 } = await supabase
                .from("menu_items")
                .insert(createRowsWithIds)
                .select("id,tenant_id,section_id,category_id,name,price,ord,is_available,image_url,description,tags,calories,spicy_level,preparation_time,created_at,updated_at");
            if (e1) {
                if (e1.code === "23505") {
                    return rep.code(409).send({
                        error: "duplicate_item_name",
                        details: "An item with this name already exists in this section"
                    });
                }
                return sendDbError(fastify, rep, "menu items bulk insert failed", e1);
            }
            out = out.concat(d1 || []);
        }
        // 2) UPSERT for updates (by id)
        if (updateRows.length > 0) {
            const { data: d2, error: e2 } = await supabase
                .from("menu_items")
                .upsert(updateRows, { onConflict: "id" })
                .select("id,tenant_id,section_id,category_id,name,price,ord,is_available,image_url,description,tags,calories,spicy_level,preparation_time,created_at,updated_at");
            if (e2) {
                if (e2.code === "23505") {
                    return rep.code(409).send({
                        error: "duplicate_item_name",
                        details: "An item with this name already exists in this section"
                    });
                }
                return sendDbError(fastify, rep, "menu items bulk upsert failed", e2);
            }
            out = out.concat(d2 || []);
        }
        // Only return the inserted/updated rows, not all items.
        fastify.log.info(logCtx({ reqId, route: 'POST /menu/items/bulk', tenantId, inserted: (createRowsWithIds.length || 0), upserted: (updateRows.length || 0), total: out.length }, start), 'menu_items_upsert_done');
        return rep.send(out);
    });
    fastify.post("/items/delete-bulk", { preHandler: [fastify.requireTenant] }, async (req, rep) => {
        const start = Date.now();
        const reqId = randomUUID();
        const rawTenant = req.tenantId || req.headers?.["x-tenant-id"] || req.headers?.["X-Tenant-Id"];
        const tenantCheck = z.string().uuid();
        const parsedTenant = tenantCheck.safeParse(rawTenant);
        if (!parsedTenant.success) {
            return rep.code(400).send({ error: 'TENANT_HEADER_INVALID' });
        }
        const tenantId = parsedTenant.data;
        const parsed = ItemsDeleteSchema.safeParse(req.body);
        if (!parsed.success) {
            return rep.code(400).send({ error: "invalid items delete payload", issues: parsed.error.flatten() });
        }
        const ids = parsed.data.ids;
        if (ids.length === 0)
            return rep.send({ deleted: 0, archived: 0, deletedIds: [], archivedIds: [] });
        // Remove dependents first
        const { error: depErr } = await supabase
            .from("cart_items")
            .delete()
            .eq("tenant_id", tenantId)
            .in("menu_item_id", ids);
        if (depErr)
            return sendDbError(fastify, rep, "delete cart_items failed", depErr);
        // Now delete items
        const { data: deleted, error: delErr } = await supabase
            .from("menu_items")
            .delete()
            .eq("tenant_id", tenantId)
            .in("id", ids)
            .select("id");
        if (delErr)
            return sendDbError(fastify, rep, "menu items delete-bulk failed", delErr);
        const deletedIds = (deleted || []).map((r) => r.id);
        const archivedIds = []; // none archived in this approach
        fastify.log.info(logCtx({ reqId, route: 'POST /menu/items/delete-bulk', tenantId, deleted: deletedIds.length }, start), 'menu_items_delete_done');
        return rep.send({
            deleted: deletedIds.length,
            archived: 0,
            deletedIds,
            archivedIds,
            message: "Items deleted successfully."
        });
    });
    // -------- Item Toggle (PATCH /items/:id/toggle) --------
    fastify.patch("/items/:id/toggle", { preHandler: [fastify.requireTenant] }, async (req, rep) => {
        const start = Date.now();
        const reqId = randomUUID();
        const tenantId = req.tenantId;
        // Validate params
        const paramsParsed = ItemToggleParamsSchema.safeParse(req.params);
        if (!paramsParsed.success) {
            return rep.code(400).send({ error: "invalid params", issues: paramsParsed.error.flatten() });
        }
        // Validate body
        const bodyParsed = ItemToggleBodySchema.safeParse(req.body);
        if (!bodyParsed.success) {
            return rep.code(400).send({ error: "invalid body", issues: bodyParsed.error.flatten() });
        }
        const itemId = paramsParsed.data.id;
        const isAvailable = bodyParsed.data.is_available;
        // Ensure item exists and belongs to tenant
        const { data: itemRow, error: itemErr } = await supabase
            .from("menu_items")
            .select("id")
            .eq("tenant_id", tenantId)
            .eq("id", itemId)
            .maybeSingle();
        if (itemErr)
            return sendDbError(fastify, rep, "toggle item lookup failed", itemErr);
        if (!itemRow)
            return rep.code(404).send({ error: "item_not_found" });
        // Update only is_available
        const { data: updated, error: updErr } = await supabase
            .from("menu_items")
            .update({ is_available: isAvailable })
            .eq("tenant_id", tenantId)
            .eq("id", itemId)
            .select("id, tenant_id, section_id, category_id, name, price, ord, is_available, image_url, description, tags, calories, spicy_level, preparation_time, created_at, updated_at")
            .maybeSingle();
        if (updErr)
            return sendDbError(fastify, rep, "toggle item update failed", updErr);
        if (!updated)
            return rep.code(404).send({ error: "item_not_found" });
        fastify.log.info(logCtx({ reqId, route: 'PATCH /menu/items/:id/toggle', tenantId, itemId, isAvailable }, start), 'menu_item_toggle_done');
        return rep.send(updated);
    });
    // -------- Name -> ID Resolver (sections/categories) --------
    fastify.post("/resolve", { preHandler: [fastify.requireTenant] }, async (req, rep) => {
        const start = Date.now();
        const reqId = randomUUID();
        const tenantId = req.tenantId;
        const parsed = ResolveRefsSchema.safeParse(req.body);
        if (!parsed.success) {
            return rep.code(400).send({ error: "invalid resolve payload", issues: parsed.error.flatten() });
        }
        const inputSections = (parsed.data.sections || []).map((n) => String(n).trim()).filter(Boolean);
        const inputCategories = (parsed.data.categories || []).map((n) => String(n).trim()).filter(Boolean);
        const autoCreate = parsed.data.options?.autoCreateMissing !== false;
        // dedupe while preserving first-case
        const dedupe = (arr) => Array.from(new Map(arr.map((v) => [v.toLowerCase(), v])).values());
        const sectionNames = dedupe(inputSections);
        const categoryNames = dedupe(inputCategories);
        const result = { sections: [], categories: [] };
        // --- resolve sections ---
        if (sectionNames.length > 0) {
            const { data: existingSec, error: secErr } = await supabase
                .from("menu_sections")
                .select("id,name")
                .eq("tenant_id", tenantId)
                .in("name", sectionNames);
            if (secErr)
                return sendDbError(fastify, rep, "menu resolve sections failed", secErr);
            const existingMap = new Map();
            (existingSec || []).forEach((r) => existingMap.set(String(r.name).toLowerCase(), r.id));
            const missing = sectionNames.filter((n) => !existingMap.has(n.toLowerCase()));
            if (autoCreate && missing.length > 0) {
                const rows = missing.map((name) => ({ tenant_id: tenantId, name, is_active: true, ord: 0 }));
                // try upsert first
                let createdSec = null;
                let createErr = null;
                const upsertRes = await supabase
                    .from("menu_sections")
                    .upsert(rows, { onConflict: "tenant_id,name" })
                    .select("id,name");
                if (upsertRes.error) {
                    createErr = upsertRes.error;
                    // fallback if no unique constraint exists
                    if (createErr.code === "42P10") {
                        createdSec = [];
                        for (const row of rows) {
                            // try insert
                            const ins = await supabase.from("menu_sections").insert(row).select("id,name").single();
                            if (ins.error) {
                                // if duplicate (another concurrent insert), fetch existing
                                if (ins.error.code === "23505") {
                                    const sel = await supabase
                                        .from("menu_sections")
                                        .select("id,name")
                                        .eq("tenant_id", tenantId)
                                        .eq("name", row.name)
                                        .maybeSingle();
                                    if (!sel.error && sel.data)
                                        createdSec.push(sel.data);
                                }
                                else {
                                    return sendDbError(fastify, rep, "menu resolve sections create failed", ins.error);
                                }
                            }
                            else if (ins.data) {
                                createdSec.push(ins.data);
                            }
                        }
                    }
                    else {
                        return sendDbError(fastify, rep, "menu resolve sections create failed", createErr);
                    }
                }
                else {
                    createdSec = upsertRes.data || [];
                }
                (createdSec || []).forEach((r) => {
                    existingMap.set(String(r.name).toLowerCase(), r.id);
                });
            }
            for (const name of sectionNames) {
                const id = existingMap.get(name.toLowerCase());
                if (id) {
                    const created = inputSections.includes(name) && !((existingSec || []).some((r) => String(r.name).toLowerCase() === name.toLowerCase()));
                    result.sections.push({ name, id, created });
                }
            }
        }
        // --- resolve categories ---
        if (categoryNames.length > 0) {
            const { data: existingCat, error: catErr } = await supabase
                .from("categories")
                .select("id,name")
                .eq("tenant_id", tenantId)
                .in("name", categoryNames);
            if (catErr)
                return sendDbError(fastify, rep, "menu resolve categories failed", catErr);
            const existingMap = new Map();
            (existingCat || []).forEach((r) => existingMap.set(String(r.name).toLowerCase(), r.id));
            const missing = categoryNames.filter((n) => !existingMap.has(n.toLowerCase()));
            if (autoCreate && missing.length > 0) {
                const rows = missing.map((name) => ({ tenant_id: tenantId, name }));
                // try upsert first
                let createdCat = null;
                let createErr = null;
                const upsertRes = await supabase
                    .from("categories")
                    .upsert(rows, { onConflict: "tenant_id,name" })
                    .select("id,name");
                if (upsertRes.error) {
                    createErr = upsertRes.error;
                    // fallback if no unique constraint exists
                    if (createErr.code === "42P10") {
                        createdCat = [];
                        for (const row of rows) {
                            const ins = await supabase.from("categories").insert(row).select("id,name").single();
                            if (ins.error) {
                                if (ins.error.code === "23505") {
                                    const sel = await supabase
                                        .from("categories")
                                        .select("id,name")
                                        .eq("tenant_id", tenantId)
                                        .eq("name", row.name)
                                        .maybeSingle();
                                    if (!sel.error && sel.data)
                                        createdCat.push(sel.data);
                                }
                                else {
                                    return sendDbError(fastify, rep, "menu resolve categories create failed", ins.error);
                                }
                            }
                            else if (ins.data) {
                                createdCat.push(ins.data);
                            }
                        }
                    }
                    else {
                        return sendDbError(fastify, rep, "menu resolve categories create failed", createErr);
                    }
                }
                else {
                    createdCat = upsertRes.data || [];
                }
                (createdCat || []).forEach((r) => {
                    existingMap.set(String(r.name).toLowerCase(), r.id);
                });
            }
            for (const name of categoryNames) {
                const id = existingMap.get(name.toLowerCase());
                if (id) {
                    const created = inputCategories.includes(name) && !((existingCat || []).some((r) => String(r.name).toLowerCase() === name.toLowerCase()));
                    result.categories.push({ name, id, created });
                }
            }
        }
        fastify.log.info(logCtx({ reqId, route: 'POST /menu/resolve', tenantId, sections: (result.sections.length), categories: (result.categories.length) }, start), 'menu_resolve_done');
        return rep.send(result);
    });
    // -------- Sections Reorder --------
    fastify.post("/sections/reorder", { preHandler: [fastify.requireTenant] }, async (req, rep) => {
        const start = Date.now();
        const reqId = randomUUID();
        const tenantId = req.tenantId;
        const body = req.body || {};
        const order = Array.isArray(body?.order) ? body.order : [];
        if (order.length === 0) {
            return rep.code(400).send({ error: "INVALID_PAYLOAD", details: "Body must include { order: string[] }" });
        }
        try {
            // Verify that all section IDs belong to this tenant
            const { data: sections, error: secErr } = await supabase
                .from("menu_sections")
                .select("id")
                .eq("tenant_id", tenantId)
                .in("id", order);
            if (secErr)
                return sendDbError(fastify, rep, "reorder sections validate failed", secErr);
            const validIds = new Set((sections || []).map((r) => r.id));
            const pairs = order
                .map((id, idx) => (validIds.has(id) ? { id, ord: idx + 1 } : null))
                .filter(Boolean);
            if (pairs.length === 0) {
                return rep.code(400).send({ error: "NO_VALID_SECTIONS" });
            }
            const updated = [];
            for (const p of pairs) {
                const { data, error } = await supabase
                    .from("menu_sections")
                    .update({ ord: p.ord })
                    .eq("tenant_id", tenantId)
                    .eq("id", p.id)
                    .select("id, tenant_id, name, ord, is_active, created_at, updated_at")
                    .maybeSingle();
                if (error)
                    return sendDbError(fastify, rep, "menu sections reorder failed", error);
                if (data)
                    updated.push(data);
            }
            fastify.log.info(logCtx({ reqId, route: "POST /menu/sections/reorder", tenantId, count: updated.length }, start), "menu_sections_reorder_done");
            return rep.send(updated);
        }
        catch (ex) {
            return sendDbError(fastify, rep, "menu sections reorder failed", ex);
        }
    });
    // -------- Section Toggle (PATCH /sections/:id/toggle) --------
    fastify.patch("/sections/:id/toggle", { preHandler: [fastify.requireTenant] }, async (req, rep) => {
        const start = Date.now();
        const reqId = randomUUID();
        const tenantId = req.tenantId;
        // Validate params
        const paramsParsed = SectionToggleParamsSchema.safeParse(req.params);
        if (!paramsParsed.success) {
            return rep.code(400).send({ error: "invalid params", issues: paramsParsed.error.flatten() });
        }
        // Validate body
        const bodyParsed = SectionToggleBodySchema.safeParse(req.body);
        if (!bodyParsed.success) {
            return rep.code(400).send({ error: "invalid body", issues: bodyParsed.error.flatten() });
        }
        const sectionId = paramsParsed.data.id;
        const isActive = bodyParsed.data.is_active;
        // Check section exists and belongs to tenant
        const { data: secRow, error: secErr } = await supabase
            .from("menu_sections")
            .select("id")
            .eq("tenant_id", tenantId)
            .eq("id", sectionId)
            .maybeSingle();
        if (secErr)
            return sendDbError(fastify, rep, "toggle section lookup failed", secErr);
        if (!secRow)
            return rep.code(404).send({ error: "section_not_found" });
        // Update only is_active
        const { data: updated, error: updErr } = await supabase
            .from("menu_sections")
            .update({ is_active: isActive })
            .eq("tenant_id", tenantId)
            .eq("id", sectionId)
            .select("id, tenant_id, name, ord, is_active, created_at, updated_at")
            .maybeSingle();
        if (updErr)
            return sendDbError(fastify, rep, "toggle section update failed", updErr);
        if (!updated)
            return rep.code(404).send({ error: "section_not_found" });
        fastify.log.info(logCtx({ reqId, route: 'PATCH /menu/sections/:id/toggle', tenantId, sectionId, isActive }, start), 'menu_section_toggle_done');
        return rep.send(updated);
    });
    done();
};
export default menuRoutes;
