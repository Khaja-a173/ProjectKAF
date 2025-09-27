// Helpers: fetch tenant tax effective config and compute tax breakdown amounts
async function getTenantTaxEffective(fastify, tenantId) {
    const { data, error } = await fastify.supabase
        .from('v_tenant_tax_effective')
        .select('effective_rate, breakdown, mode, currency')
        .eq('tenant_id', tenantId)
        .maybeSingle();
    if (error || !data) {
        return { effective_rate: 0, breakdown: [{ name: 'Tax', rate: 0 }], mode: 'single', currency: 'INR' };
    }
    const br = Array.isArray(data.breakdown) && data.breakdown.length
        ? data.breakdown
        : [{ name: 'Tax', rate: data.effective_rate ?? 0 }];
    return { effective_rate: data.effective_rate ?? 0, breakdown: br, mode: data.mode, currency: data.currency || 'INR' };
}
function computeTaxBreakdownFromOrderTax(taxTotal, breakdown) {
    const safeTax = Number.isFinite(taxTotal) ? Number(taxTotal) : 0;
    const rates = (breakdown || []).map(b => ({ name: String(b.name || 'Tax'), rate: Number(b.rate) || 0 }));
    if (!rates.length)
        return [{ name: 'Tax', rate: 0, amount: 0 }];
    const sumRate = rates.reduce((s, r) => s + r.rate, 0) || 1;
    let allocated = 0;
    const parts = rates.map((r, i) => {
        const isLast = i === rates.length - 1;
        const raw = isLast ? (safeTax - allocated) : Number((safeTax * (r.rate / sumRate)).toFixed(6));
        const amt = Number(isLast ? raw.toFixed(6) : raw.toFixed(6));
        allocated = Number((allocated + amt).toFixed(6));
        return { name: r.name, rate: r.rate, amount: amt };
    });
    return parts;
}
export default async function ordersRoutes(fastify) {
    // GET /api/orders — tenant-scoped list with pagination
    fastify.get('/api/orders', { preHandler: [fastify.requireTenant] }, async (request, reply) => {
        const start = Date.now();
        const tenantId = request.tenantId || request.headers['x-tenant-id'];
        const q = request.query;
        const limit = Math.min(Math.max(parseInt(q.limit || '20', 10), 1), 100);
        const offset = Math.max(parseInt(q.offset || '0', 10), 0);
        const includeBreakdown = String(request.query?.include_breakdown || '').toLowerCase() === 'true' || request.query?.include_breakdown === '1';
        // Validate date filters if present
        const isIso = (v) => !!v && !Number.isNaN(Date.parse(v));
        if (q.from && !isIso(q.from)) {
            fastify.log.info({ tenantId, from: q.from }, 'orders_list_invalid_from');
            return reply.code(400).send({ error: 'INVALID_FROM_DATE' });
        }
        if (q.to && !isIso(q.to)) {
            fastify.log.info({ tenantId, to: q.to }, 'orders_list_invalid_to');
            return reply.code(400).send({ error: 'INVALID_TO_DATE' });
        }
        let query = fastify.supabase
            .from('orders')
            .select('id, tenant_id, user_id, status, currency, subtotal, tax, total, created_at, mode, table_code', { count: 'exact' })
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (q.status)
            query = query.eq('status', q.status);
        if (q.from)
            query = query.gte('created_at', q.from);
        if (q.to)
            query = query.lte('created_at', q.to);
        if (q.mode)
            query = query.eq('mode', q.mode);
        if (q.table_code)
            query = query.eq('table_code', q.table_code);
        const { data, error, count } = await query;
        if (error) {
            fastify.log.error({ tenantId, err: error, ms: Date.now() - start }, 'orders_list_failed');
            return reply.code(500).send({ error: 'ORDERS_LIST_FAILED', details: error.message });
        }
        let items = data || [];
        if (includeBreakdown && items.length) {
            const taxCfg = await getTenantTaxEffective(fastify, tenantId);
            items = items.map((o) => ({
                ...o,
                tax_breakdown: computeTaxBreakdownFromOrderTax(Number(o.tax || 0), taxCfg.breakdown),
                currency: o.currency || taxCfg.currency || 'INR',
            }));
        }
        fastify.log.info({ tenantId, count: count ?? (items.length ?? 0), ms: Date.now() - start }, 'orders_list_ok');
        reply.header('Cache-Control', 'private, max-age=10');
        return reply.send({ items, count: count ?? (items.length ?? 0), limit, offset });
    });
    // GET /api/orders/:id — tenant-scoped order details
    fastify.get("/api/orders/:id", { preHandler: [fastify.requireTenant] }, async (request, reply) => {
        const start = Date.now();
        const tenantId = request.tenantId || request.headers["x-tenant-id"];
        const { id } = request.params;
        if (!id) {
            fastify.log.info({ tenantId, ms: Date.now() - start }, 'orders_detail_missing_id');
            return reply.code(400).send({ error: "ORDER_ID_REQUIRED" });
        }
        const supabase = fastify.supabase;
        // 1) Fetch order (scoped to tenant)
        const { data: order, error: orderErr } = await supabase
            .from('orders')
            .select('id, tenant_id, user_id, status, currency, subtotal, tax, total, created_at, mode, table_code')
            .eq('tenant_id', tenantId)
            .eq('id', id)
            .single();
        if (orderErr || !order) {
            fastify.log.info({ tenantId, order_id: id, ms: Date.now() - start }, 'orders_detail_not_found');
            return reply.code(404).send({ error: "ORDER_NOT_FOUND" });
        }
        // 2) Fetch order items (scoped to tenant & order)
        const { data: items, error: itemsErr } = await supabase
            .from('order_items')
            .select('order_id, menu_item_id, name, qty, price, total')
            .eq('tenant_id', tenantId)
            .eq('order_id', id);
        if (itemsErr) {
            fastify.log.error({ tenantId, order_id: id, err: itemsErr, ms: Date.now() - start }, 'orders_items_fetch_failed');
            return reply
                .code(500)
                .send({ error: "ORDER_ITEMS_FETCH_FAILED", details: itemsErr.message });
        }
        fastify.log.info({ tenantId, order_id: id, count: (items?.length ?? 0), ms: Date.now() - start }, 'orders_detail_ok');
        reply.header('Cache-Control', 'private, max-age=10');
        const taxCfg = await getTenantTaxEffective(fastify, tenantId);
        const tax_breakdown = computeTaxBreakdownFromOrderTax(Number(order.tax || 0), taxCfg.breakdown);
        const enrichedOrder = { ...order, currency: order.currency || taxCfg.currency || 'INR', tax_breakdown };
        return reply.send({ order: enrichedOrder, items: items || [] });
    });
    // POST /api/orders/archive — archive completed/cancelled older orders
    fastify.post("/api/orders/archive", { preHandler: [fastify.requireTenant] }, async (request, reply) => {
        const tenantId = request.tenantId || request.headers["x-tenant-id"];
        const body = request.body ?? {};
        const beforeDays = Number.isFinite(body.beforeDays) ? body.beforeDays : 7;
        const allowedStatuses = [
            "pending",
            "confirmed",
            "preparing",
            "ready",
            "served",
            "cancelled",
            "paid",
            "processing",
            "placed",
        ];
        const requested = Array.isArray(body.statuses) && body.statuses.length ? body.statuses : ["paid", "served", "cancelled"];
        const statuses = requested.filter((s) => allowedStatuses.includes(s));
        if (!statuses.length) {
            return reply.code(400).send({ error: "INVALID_STATUS", details: "Provide at least one valid order_status (e.g., paid, served, cancelled)." });
        }
        const { error, count } = await fastify.supabase
            .from("orders")
            .update({ archived_at: new Date().toISOString() })
            .eq("tenant_id", tenantId)
            .is("archived_at", null)
            .in("status", statuses)
            .lt("created_at", new Date(Date.now() - beforeDays * 24 * 60 * 60 * 1000).toISOString());
        if (error) {
            fastify.log.error({ tenantId, err: error }, "orders_archive_failed");
            return reply.code(500).send({ error: "ORDERS_ARCHIVE_FAILED", details: error.message });
        }
        return reply.send({ archived: count ?? 0, beforeDays, statuses });
    });
    // GET /api/orders/archived — list archived orders
    fastify.get("/api/orders/archived", { preHandler: [fastify.requireTenant] }, async (request, reply) => {
        const tenantId = request.tenantId || request.headers["x-tenant-id"];
        const q = request.query;
        const limit = Math.min(Math.max(parseInt(q.limit || "50", 10), 1), 200);
        const offset = Math.max(parseInt(q.offset || "0", 10), 0);
        const { data, error } = await fastify.supabase
            .from("orders")
            .select("id, tenant_id, status, currency, total, created_at, archived_at, mode", { count: "exact" })
            .eq("tenant_id", tenantId)
            .not("archived_at", "is", null)
            .order("archived_at", { ascending: false })
            .range(offset, offset + limit - 1);
        if (error) {
            fastify.log.error({ tenantId, err: error }, "orders_archived_list_failed");
            return reply.code(500).send({ error: "ORDERS_ARCHIVED_LIST_FAILED", details: error.message });
        }
        return reply.send({ orders: data || [], limit, offset, count: data?.length ?? 0 });
    });
}
