import { FastifyInstance } from "fastify";
import { getRedisClient, buildRedisKey } from "../plugins/redis";

// Helpers: fetch tenant tax effective config and compute tax breakdown amounts
async function getTenantTaxEffective(fastify: FastifyInstance, tenantId: string) {
  const { data, error } = await fastify.supabase
    .from('v_tenant_tax_effective')
    .select('effective_rate, breakdown, mode, currency')
    .eq('tenant_id', tenantId)
    .maybeSingle();
  if (error || !data) {
    return { effective_rate: 0, breakdown: [{ name: 'Tax', rate: 0 }], mode: 'single', currency: 'INR' } as any;
  }
  const br = Array.isArray((data as any).breakdown) && (data as any).breakdown.length
    ? (data as any).breakdown
    : [{ name: 'Tax', rate: (data as any).effective_rate ?? 0 }];
  return { effective_rate: (data as any).effective_rate ?? 0, breakdown: br, mode: (data as any).mode, currency: (data as any).currency || 'INR' } as any;
}

function computeTaxBreakdownFromOrderTax(taxTotal: number, breakdown: Array<{ name: string; rate: number }>) {
  const safeTax = Number.isFinite(taxTotal) ? Number(taxTotal) : 0;
  const rates = (breakdown || []).map(b => ({ name: String(b.name || 'Tax'), rate: Number(b.rate) || 0 }));
  if (!rates.length) return [{ name: 'Tax', rate: 0, amount: 0 }];
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

export default async function ordersRoutes(fastify: FastifyInstance) {
  const redis = getRedisClient(fastify) as import('ioredis').Redis | undefined;

  // --- Helpers: publish tenant-scoped order events and choose staff ---
  async function publishOrderEvent(
    tenantId: string,
    type: string,
    payload: Record<string, any>
  ) {
    try {
      const ch = `orders:events:${tenantId}`;
      if (redis) {
        await redis.publish(ch, JSON.stringify({ type, ts: Date.now(), tenant_id: tenantId, ...payload }));
      }
    } catch (e: any) {
      fastify.log.warn({ tenantId, type, err: e }, 'orders_event_publish_failed');
    }
  }

  async function chooseStaffForOrder(
    tenantId: string,
    mode: string // 'dinein' | 'takeaway' | others
  ): Promise<{ id: string } | null> {
    const role = mode === 'dinein' ? 'waiter' : 'counter';

    // Pool of available staff for this tenant & role
    const { data: pool, error: poolErr } = await fastify.supabase
      .from('staff')
      .select('id, role, status')
      .eq('tenant_id', tenantId)
      .eq('role', role)
      .eq('status', 'available')
      .limit(25);

    if (poolErr) {
      fastify.log.warn({ tenantId, err: poolErr }, 'staff_pool_query_failed');
      return null;
    }
    if (!pool || !pool.length) return null;

    // Simple least-load: pick staff with the fewest active orders
    // Active = orders with status not in ('paid','cancelled','archived') and not archived_at
    try {
      let best: { staff_id: string; load: number } | null = null;
      for (const s of pool as Array<{ id: string }>) {
        const staffId = s.id;
        const { count, error: cntErr } = await fastify.supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .eq('staff_id', staffId)
          .not('status', 'in', '(paid,cancelled)')
          .is('archived_at', null);

        const load = cntErr ? 9999 : (count ?? 0);
        if (!best || load < best.load) {
          best = { staff_id: staffId, load };
        }
      }
      if (best) return { id: best.staff_id };
      // fallback: first pool entry's id
      return { id: (pool[0] as any).id };
    } catch (e: any) {
      fastify.log.warn({ tenantId, err: e }, 'staff_least_load_failed');
      return { id: (pool[0] as any).id };
    }
  }

  // GET /api/orders — tenant-scoped list with pagination
  fastify.get('/api/orders', { preHandler: [fastify.requireTenant] }, async (request, reply) => {
    const start = Date.now();
    const tenantId = (request as any).tenantId || (request.headers['x-tenant-id'] as string);
    const q = request.query as { status?: string; from?: string; to?: string; limit?: string; offset?: string };
    const limit = Math.min(Math.max(parseInt(q.limit || '20', 10), 1), 100);
    const offset = Math.max(parseInt(q.offset || '0', 10), 0);
    const includeBreakdown = String((request.query as any)?.include_breakdown || '').toLowerCase() === 'true' || (request.query as any)?.include_breakdown === '1';

    // Validate date filters if present
    const isIso = (v?: string) => !!v && !Number.isNaN(Date.parse(v));
    if (q.from && !isIso(q.from)) {
      fastify.log.info({ tenantId, from: q.from }, 'orders_list_invalid_from');
      return reply.code(400).send({ error: 'INVALID_FROM_DATE' });
    }
    if (q.to && !isIso(q.to)) {
      fastify.log.info({ tenantId, to: q.to }, 'orders_list_invalid_to');
      return reply.code(400).send({ error: 'INVALID_TO_DATE' });
    }

    const cacheKey = buildRedisKey('orders:list', tenantId, JSON.stringify({ ...q, includeBreakdown }));
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          reply.header('X-Cache', 'HIT');
          fastify.log.info({ tenantId, ms: Date.now() - start }, 'orders_list_cache_hit');
          return reply.send(JSON.parse(cached));
        }
      } catch (e: any) {
        fastify.log.warn({ tenantId, err: e }, 'orders_list_cache_error');
      }
    }

    let query = fastify.supabase
      .from('orders')
      .select('id, tenant_id, user_id, status, currency, subtotal, tax_amount, total_amount, created_at, mode, table_code', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (q.status) query = query.eq('status', q.status);
    if (q.from) query = query.gte('created_at', q.from);
    if (q.to) query = query.lte('created_at', q.to);
    if ((q as any).mode) query = query.eq('mode', (q as any).mode);
    if ((q as any).table_code) query = query.eq('table_code', (q as any).table_code);

    const { data, error, count } = await query;
    if (error) {
      fastify.log.error({ tenantId, err: error, ms: Date.now() - start }, 'orders_list_failed');
      return reply.code(500).send({ error: 'ORDERS_LIST_FAILED', details: error.message });
    }

    // Map DB columns (tax_amount, total_amount) to response fields (tax, total)
    let items = (data || []).map((o: any) => ({
      ...o,
      tax: Number((o as any).tax_amount ?? 0),
      total: Number((o as any).total_amount ?? 0),
    }));
    if (includeBreakdown && items.length) {
      const taxCfg = await getTenantTaxEffective(fastify, tenantId);
      items = items.map((o: any) => {
        const taxValue = Number((o as any).tax ?? (o as any).tax_amount ?? 0);
        return {
          ...o,
          tax_breakdown: computeTaxBreakdownFromOrderTax(taxValue, taxCfg.breakdown),
          currency: (o as any).currency || taxCfg.currency || 'INR',
        };
      });
    }

    const responsePayload = { items, count: count ?? (items.length ?? 0), limit, offset };
    if (redis) {
      try {
        await redis.setex(cacheKey, 30, JSON.stringify(responsePayload));
      } catch (e: any) {
        fastify.log.warn({ tenantId, err: e }, 'orders_list_cache_set_failed');
      }
    }

    fastify.log.info({ tenantId, count: count ?? (items.length ?? 0), ms: Date.now() - start }, 'orders_list_ok');
    reply.header('Cache-Control', 'private, max-age=10');
    reply.header('X-Cache', 'MISS');
    return reply.send(responsePayload);
  });

  // GET /api/orders/:id — tenant-scoped order details
  fastify.get("/api/orders/:id", { preHandler: [fastify.requireTenant] }, async (request, reply) => {
    const start = Date.now();
    const tenantId = (request as any).tenantId || (request.headers["x-tenant-id"] as string);
    const { id } = request.params as { id: string };
    if (!id) {
      fastify.log.info({ tenantId, ms: Date.now() - start }, 'orders_detail_missing_id');
      return reply.code(400).send({ error: "ORDER_ID_REQUIRED" });
    }

    const cacheKey = buildRedisKey('orders:detail', tenantId, id);
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          reply.header('X-Cache', 'HIT');
          fastify.log.info({ tenantId, order_id: id, ms: Date.now() - start }, 'orders_detail_cache_hit');
          return reply.send(JSON.parse(cached));
        }
      } catch (e: any) {
        fastify.log.warn({ tenantId, order_id: id, err: e }, 'orders_detail_cache_error');
      }
    }

    const supabase = fastify.supabase;

    // 1) Fetch order (scoped to tenant)
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, tenant_id, user_id, status, currency, subtotal, tax_amount, total_amount, created_at, mode, table_code')
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .single();

    if (orderErr || !order) {
      fastify.log.info({ tenantId, order_id: id, ms: Date.now() - start }, 'orders_detail_not_found');
      return reply.code(404).send({ error: "ORDER_NOT_FOUND" });
    }

    // 2) Fetch order items (scoped to tenant & order)
    const { data: itemsRaw, error: itemsErr } = await supabase
      .from('order_items')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('order_id', id);

    if (itemsErr) {
      fastify.log.error({ tenantId, order_id: id, err: itemsErr, ms: Date.now() - start }, 'orders_items_fetch_failed');
      return reply
        .code(500)
        .send({ error: "ORDER_ITEMS_FETCH_FAILED", details: itemsErr.message });
    }

    // Normalize items (robust: compute total if missing/zero)
    const items = (itemsRaw || []).map((row: any) => {
      const order_id = row.order_id;
      const menu_item_id = row.menu_item_id;
      const name =
        row.name ??
        row.item_name ??
        row.menu_item_name ??
        row.title ??
        null;

      const qty = Number(row.qty ?? row.quantity ?? 0);
      const price = Number(row.price ?? row.unit_price ?? 0);

      // Prefer stored total if it's a positive finite number; otherwise compute
      const storedTotal = Number(row.total ?? row.line_total ?? NaN);
      const total =
        Number.isFinite(storedTotal) && storedTotal > 0
          ? storedTotal
          : Number((qty * price).toFixed(2));

      return { order_id, menu_item_id, name, qty, price, total };
    });

    fastify.log.info({ tenantId, order_id: id, count: (items?.length ?? 0), ms: Date.now() - start }, 'orders_detail_ok');
    reply.header('Cache-Control', 'private, max-age=10');
    const ord: any = order as any;
    const taxValue = Number(ord.tax_amount ?? 0);
    const totalValue = Number(ord.total_amount ?? 0);
    const taxCfg = await getTenantTaxEffective(fastify, tenantId);
    const tax_breakdown = computeTaxBreakdownFromOrderTax(taxValue, taxCfg.breakdown);
    const enrichedOrder = {
      ...(order as any),
      tax: taxValue,
      total: totalValue,
      currency: (ord.currency || taxCfg.currency || 'INR'),
      tax_breakdown,
    } as any;
    const responsePayload = { order: enrichedOrder, items: items || [] };

    if (redis) {
      try {
        await redis.setex(cacheKey, 60, JSON.stringify(responsePayload));
      } catch (e: any) {
        fastify.log.warn({ tenantId, order_id: id, err: e }, 'orders_detail_cache_set_failed');
      }
    }

    reply.header('X-Cache', 'MISS');
    return reply.send(responsePayload);
  });

  // POST /api/orders/:id/confirm — idempotent confirm + auto-assign staff + events
  fastify.post('/api/orders/:id/confirm', { preHandler: [fastify.requireTenant] }, async (request, reply) => {
    const start = Date.now();
    const tenantId = (request as any).tenantId || (request.headers['x-tenant-id'] as string);
    const { id } = request.params as { id: string };
    const lockKey = buildRedisKey('assign:lock', tenantId, id);

    if (!id) {
      return reply.code(400).send({ error: 'ORDER_ID_REQUIRED' });
    }

    // Load order
    const { data: order, error: orderErr } = await fastify.supabase
      .from('orders')
      .select('id, tenant_id, status, mode, staff_id, table_code, created_at')
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .single();

    if (orderErr || !order) {
      fastify.log.info({ tenantId, order_id: id }, 'order_confirm_not_found');
      return reply.code(404).send({ error: 'ORDER_NOT_FOUND' });
    }

    // If already confirmed (or beyond) return idempotently
    if (['confirmed', 'preparing', 'ready', 'served', 'paid'].includes(String(order.status))) {
      reply.header('X-Idempotent', '1');
      return reply.send({ status: order.status, staff_id: order.staff_id ?? null });
    }

    // Acquire short lock to avoid concurrent assignment
    let haveLock = false;
    try {
      if (redis) {
        const res = await (redis as any).set(lockKey, '1', 'NX', 'EX', 10);
        haveLock = res === 'OK';
      }
    } catch (e: any) {
      fastify.log.warn({ tenantId, order_id: id, err: e }, 'order_confirm_lock_error');
    }

    // If no lock, re-read and return current state (idempotent path)
    if (!haveLock) {
      const { data: re } = await fastify.supabase
        .from('orders')
        .select('status, staff_id')
        .eq('tenant_id', tenantId)
        .eq('id', id)
        .single();
      reply.header('Retry-After', '2');
      return reply.send({ status: re?.status ?? order.status, staff_id: re?.staff_id ?? order.staff_id ?? null });
    }

    try {
      // Pick staff if possible (do not fail hard if none)
      let staffId: string | null = null;
      const picked = await chooseStaffForOrder(tenantId, String(order.mode || 'dinein'));
      if (picked?.id) {
        staffId = picked.id;
      }

      // Update order → confirmed + optional staff
      let upd = fastify.supabase
        .from('orders')
        .update({ status: 'confirmed', staff_id: staffId })
        .eq('tenant_id', tenantId)
        .eq('id', id);

      const { data: updated, error: updErr } = await upd.select('id, status, staff_id').single();
      if (updErr) {
        fastify.log.error({ tenantId, order_id: id, err: updErr }, 'order_confirm_update_failed');
        return reply.code(500).send({ error: 'ORDER_CONFIRM_FAILED', details: updErr.message });
      }

      // Invalidate caches for orders list/details
      if (redis) {
        try {
          // detail
          await redis.del(buildRedisKey('orders:detail', tenantId, id));
          // lists
          const pattern = buildRedisKey('orders:list', tenantId, '*');
          let cursor = '0';
          do {
            const [next, keys] = await (redis as any).scan(cursor, 'MATCH', pattern, 'COUNT', 100);
            cursor = next;
            if (keys.length) await (redis as any).del(...keys);
          } while (cursor !== '0');
        } catch (e: any) {
          fastify.log.warn({ tenantId, order_id: id, err: e }, 'order_confirm_cache_invalidate_failed');
        }
      }

      // Publish events
      await publishOrderEvent(tenantId, 'order.confirmed', { order_id: id, status: 'confirmed', staff_id: staffId });
      if (staffId) {
        await publishOrderEvent(tenantId, 'staff.assigned', { order_id: id, staff_id: staffId });
      }

      reply.header('X-Assigned', staffId ? '1' : '0');
      return reply.send({ status: 'confirmed', staff_id: staffId });
    } finally {
      // best-effort unlock (let TTL expire if any error)
      try { if (redis) await redis.del(lockKey); } catch {}
      fastify.log.info({ tenantId, order_id: id, ms: Date.now() - start }, 'order_confirm_ok');
    }
  });

  // --- Status transitions (KDS/Admin) ---
  const ORDER_STATES = [
    'pending','confirmed','queued','preparing','ready','served','handed_over','completed','paid','cancelled','archived'
  ] as const;
  type OrderState = typeof ORDER_STATES[number];

  function isValidTransition(current: OrderState, next: OrderState, mode: string): boolean {
    if (current === next) return true; // idempotent
    const dine = ['pending','confirmed','queued','preparing','ready','served','completed','paid'];
    const take = ['pending','confirmed','queued','preparing','ready','handed_over','completed','paid'];
    const flow = (mode === 'takeaway') ? take : dine;
    const idxC = flow.indexOf(current as any);
    const idxN = flow.indexOf(next as any);
    if (idxC === -1 || idxN === -1) return false;
    // allow forward-only moves (no back), and skip-ahead by one step max except paid/completed can be direct from ready
    if (next === 'paid') return idxN >= idxC; // server-side checks will ensure payment success
    if (next === 'completed') return idxN >= idxC; // allow direct complete from ready/served/handed_over
    return idxN === idxC + 1; // strict next step
  }

  async function invalidateOrderCaches(tenantId: string, orderId: string) {
    if (!redis) return;
    try {
      await redis.del(buildRedisKey('orders:detail', tenantId, orderId));
      const pattern = buildRedisKey('orders:list', tenantId, '*');
      let cursor = '0';
      do {
        const [next, keys] = await (redis as any).scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = next;
        if (keys.length) await (redis as any).del(...keys);
      } while (cursor !== '0');
    } catch (e:any) {
      fastify.log.warn({ tenantId, order_id: orderId, err: e }, 'order_cache_invalidate_failed');
    }
  }

  // POST /api/orders/:id/status — advance order through state machine (idempotent)
  fastify.post('/api/orders/:id/status', { preHandler: [fastify.requireTenant] }, async (request, reply) => {
    const start = Date.now();
    const tenantId = (request as any).tenantId || (request.headers['x-tenant-id'] as string);
    const { id } = request.params as { id: string };
    const { to } = (request.body as any) || {};

    if (!id || !to || !ORDER_STATES.includes(to)) {
      return reply.code(400).send({ error: 'INVALID_TRANSITION', details: 'Provide valid order id and target state in body { to }.' });
    }

    const { data: order, error: orderErr } = await fastify.supabase
      .from('orders')
      .select('id, tenant_id, status, mode')
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .single();

    if (orderErr || !order) {
      return reply.code(404).send({ error: 'ORDER_NOT_FOUND' });
    }

    const current = String(order.status) as OrderState;
    const next = String(to) as OrderState;
    if (current === next) {
      reply.header('X-Idempotent', '1');
      return reply.send({ status: current });
    }
    if (!isValidTransition(current, next, String(order.mode || 'dinein'))) {
      return reply.code(409).send({ error: 'INVALID_STATE_TRANSITION', from: current, to: next });
    }

    const { error: updErr } = await fastify.supabase
      .from('orders')
      .update({ status: next })
      .eq('tenant_id', tenantId)
      .eq('id', id);

    if (updErr) {
      fastify.log.error({ tenantId, order_id: id, err: updErr }, 'order_status_update_failed');
      return reply.code(500).send({ error: 'ORDER_STATUS_UPDATE_FAILED', details: updErr.message });
    }

    await invalidateOrderCaches(tenantId, id);

    const eventName = `order.${next}`;
    await publishOrderEvent(tenantId, eventName, { order_id: id, status: next });

    fastify.log.info({ tenantId, order_id: id, from: current, to: next, ms: Date.now() - start }, 'order_status_update_ok');
    return reply.send({ status: next });
  });

  // POST /api/orders/archive — archive completed/cancelled older orders
  fastify.post("/api/orders/archive", { preHandler: [fastify.requireTenant] }, async (request, reply) => {
    const tenantId = (request as any).tenantId || (request.headers["x-tenant-id"] as string);
    const body = (request as any).body ?? {};
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
    ] as const;

    const requested = Array.isArray(body.statuses) && body.statuses.length ? body.statuses : ["paid", "served", "cancelled"];
    const statuses = requested.filter((s: string) => allowedStatuses.includes(s as any));
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

    // Invalidate caches
    if (redis) {
      try {
        const pattern = buildRedisKey('orders:list', tenantId, '*');
        let cursor = '0';
        do {
          const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
          cursor = nextCursor;
          if (keys.length) {
            await redis.del(...keys);
          }
        } while (cursor !== '0');
        // Detail cache invalidation skipped (IDs unknown)
      } catch (e: any) {
        fastify.log.warn({ tenantId, err: e }, 'orders_archive_cache_invalidation_failed');
      }
    }

    return reply.send({ archived: count ?? 0, beforeDays, statuses });
  });

  // GET /api/orders/archived — list archived orders
  fastify.get("/api/orders/archived", { preHandler: [fastify.requireTenant] }, async (request, reply) => {
    const tenantId = (request as any).tenantId || (request.headers["x-tenant-id"] as string);
    const q = request.query as { limit?: string; offset?: string };
    const limit = Math.min(Math.max(parseInt(q.limit || "50", 10), 1), 200);
    const offset = Math.max(parseInt(q.offset || "0", 10), 0);

    const cacheKey = buildRedisKey('orders:archived', tenantId, JSON.stringify({ limit, offset }));
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          reply.header('X-Cache', 'HIT');
          return reply.send(JSON.parse(cached));
        }
      } catch (e: any) {
        fastify.log.warn({ tenantId, err: e }, 'orders_archived_cache_error');
      }
    }

    const { data, error } = await fastify.supabase
      .from("orders")
      .select("id, tenant_id, status, currency, total_amount, created_at, archived_at, mode", { count: "exact" })
      .eq("tenant_id", tenantId)
      .not("archived_at", "is", null)
      .order("archived_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      fastify.log.error({ tenantId, err: error }, "orders_archived_list_failed");
      return reply.code(500).send({ error: "ORDERS_ARCHIVED_LIST_FAILED", details: error.message });
    }

    const orders = (data || []).map((o: any) => ({
      ...o,
      total: Number(o.total_amount ?? 0),
    }));
    const responsePayload = { orders, limit, offset, count: orders.length };
    if (redis) {
      try {
        await redis.setex(cacheKey, 30, JSON.stringify(responsePayload));
      } catch (e: any) {
        fastify.log.warn({ tenantId, err: e }, 'orders_archived_cache_set_failed');
      }
    }

    reply.header('X-Cache', 'MISS');
    return reply.send(responsePayload);
  });
}
