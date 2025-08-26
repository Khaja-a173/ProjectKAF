import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

// Time window utility
function getTimeWindow(window: string): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  let start: Date;

  switch (window) {
    case '7d':
      start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'mtd':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'qtd':
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    case 'ytd':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  return { start, end };
}

function getDateLabel(date: Date, granularity: string): string {
  switch (granularity) {
    case 'day':
      return date.toISOString().split('T')[0];
    case 'week':
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return weekStart.toISOString().split('T')[0];
    case 'month':
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    default:
      return date.toISOString().split('T')[0];
  }
}

export default async function analyticsRoutes(app: FastifyInstance) {
  // GET /analytics/summary
  app.get('/analytics/summary', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(403).send({ error: 'no tenant context' });
    }

    const query = z.object({
      window: z.enum(['7d', '30d', '90d', 'mtd', 'qtd', 'ytd']).default('7d')
    }).parse(req.query);

    const { start, end } = getTimeWindow(query.window);

    try {
      // Try RPC first
      const { data: rpcData, error: rpcError } = await app.supabase
        .rpc('kpi_summary', { 
          p_tenant_id: tenantId, 
          p_window: query.window 
        })
        .single();

      if (!rpcError && rpcData) {
        return reply.send({
          window: query.window,
          orders: rpcData.orders || 0,
          revenue: rpcData.revenue || "0.00",
          dine_in: rpcData.dine_in || 0,
          takeaway: rpcData.takeaway || 0
        });
      }

      // Fallback to manual queries
      const { data: orders, error: ordersError } = await app.supabase
        .from('orders')
        .select('order_type')
        .eq('tenant_id', tenantId)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (ordersError) {
        throw app.httpErrors.internalServerError(ordersError.message);
      }

      const { data: payments, error: paymentsError } = await app.supabase
        .from('payments')
        .select('amount, status')
        .eq('tenant_id', tenantId)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (paymentsError) {
        throw app.httpErrors.internalServerError(paymentsError.message);
      }

      const totalOrders = orders?.length || 0;
      const dineIn = orders?.filter(o => o.order_type === 'dine_in').length || 0;
      const takeaway = orders?.filter(o => o.order_type === 'takeaway').length || 0;

      const revenue = (payments || []).reduce((sum, p) => {
        const amount = parseFloat(p.amount?.toString() || '0');
        if (p.status === 'completed') return sum + amount;
        if (p.status === 'refunded') return sum - Math.abs(amount);
        return sum;
      }, 0);

      return reply.send({
        window: query.window,
        orders: totalOrders,
        revenue: revenue.toFixed(2),
        dine_in: dineIn,
        takeaway: takeaway
      });

    } catch (err: any) {
      app.log.error(err, 'Analytics summary failed');
      throw app.httpErrors.internalServerError(err.message);
    }
  });

  // GET /analytics/revenue
  app.get('/analytics/revenue', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(403).send({ error: 'no tenant context' });
    }

    const query = z.object({
      window: z.enum(['7d', '30d', '90d', 'mtd', 'qtd', 'ytd']).default('30d'),
      granularity: z.enum(['day', 'week', 'month']).default('day')
    }).parse(req.query);

    const { start, end } = getTimeWindow(query.window);

    try {
      const { data: payments, error } = await app.supabase
        .from('payments')
        .select('amount, status, created_at')
        .eq('tenant_id', tenantId)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at');

      if (error) {
        throw app.httpErrors.internalServerError(error.message);
      }

      // Group by time bucket
      const buckets = new Map<string, number>();
      
      (payments || []).forEach(payment => {
        const date = new Date(payment.created_at);
        const label = getDateLabel(date, query.granularity);
        const amount = parseFloat(payment.amount?.toString() || '0');
        
        let revenue = 0;
        if (payment.status === 'completed') revenue = amount;
        else if (payment.status === 'refunded') revenue = -Math.abs(amount);
        
        buckets.set(label, (buckets.get(label) || 0) + revenue);
      });

      // Convert to series array
      const series = Array.from(buckets.entries())
        .map(([label, revenue]) => ({
          label,
          revenue: revenue.toFixed(2)
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      const total = Array.from(buckets.values())
        .reduce((sum, val) => sum + val, 0);

      return reply.send({
        window: query.window,
        granularity: query.granularity,
        series,
        total: total.toFixed(2)
      });

    } catch (err: any) {
      app.log.error(err, 'Analytics revenue failed');
      throw app.httpErrors.internalServerError(err.message);
    }
  });

  // GET /analytics/top-items
  app.get('/analytics/top-items', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(403).send({ error: 'no tenant context' });
    }

    const query = z.object({
      window: z.enum(['7d', '30d', '90d', 'mtd', 'qtd', 'ytd']).default('30d'),
      limit: z.coerce.number().int().min(1).max(50).default(10)
    }).parse(req.query);

    const { start, end } = getTimeWindow(query.window);

    try {
      // Join order_items with menu_items and orders for tenant filtering
      const { data: items, error } = await app.supabase
        .from('order_items')
        .select(`
          menu_item_id,
          quantity,
          menu_items!inner(name),
          orders!inner(tenant_id, created_at)
        `)
        .eq('orders.tenant_id', tenantId)
        .gte('orders.created_at', start.toISOString())
        .lte('orders.created_at', end.toISOString());

      if (error) {
        throw app.httpErrors.internalServerError(error.message);
      }

      // Group by menu item
      const itemMap = new Map<string, { name: string; qty: number }>();
      
      (items || []).forEach((item: any) => {
        const menuItemId = item.menu_item_id;
        const name = item.menu_items?.name || 'Unknown Item';
        const qty = parseInt(item.quantity?.toString() || '0');
        
        if (itemMap.has(menuItemId)) {
          const existing = itemMap.get(menuItemId)!;
          existing.qty += qty;
        } else {
          itemMap.set(menuItemId, { name, qty });
        }
      });

      // Convert to sorted array
      const topItems = Array.from(itemMap.entries())
        .map(([menu_item_id, data]) => ({
          menu_item_id,
          name: data.name,
          qty: data.qty
        }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, query.limit);

      return reply.send({
        window: query.window,
        items: topItems
      });

    } catch (err: any) {
      app.log.error(err, 'Analytics top-items failed');
      throw app.httpErrors.internalServerError(err.message);
    }
  });
}