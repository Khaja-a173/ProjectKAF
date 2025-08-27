import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createHmac, timingSafeEqual } from 'crypto';

const QrResolveSchema = z.object({
  code: z.string().min(1).max(10),
  table: z.string().regex(/^T\d{2}$/)
});

export default async function qrRoutes(app: FastifyInstance) {
  // GET /qr/resolve - Resolve QR code to tenant, table, menu, and branding
  app.get('/qr/resolve', async (req, reply) => {
    const query = QrResolveSchema.parse(req.query);
    const { code, table } = query;
    
    try {
      // Lookup tenant by code
      const { data: tenant, error: tenantError } = await app.supabase
        .from('tenants')
        .select('id, name, slug, code')
        .eq('code', code.toUpperCase())
        .single();
      
      if (tenantError || !tenant) {
        return reply.code(404).send({ error: 'tenant_not_found' });
      }
      
      // Lookup table by table_number
      const { data: tableData, error: tableError } = await app.supabase
        .from('restaurant_tables')
        .select('id, table_number, status, capacity')
        .eq('tenant_id', tenant.id)
        .eq('table_number', table)
        .single();
      
      if (tableError || !tableData) {
        return reply.code(404).send({ error: 'table_not_found' });
      }
      
      // Get branding (safe fallback if missing)
      const { data: branding } = await app.supabase
        .from('customization')
        .select('theme, logo_url, hero_video')
        .eq('tenant_id', tenant.id)
        .maybeSingle();
      
      // Get menu categories (safe fallback)
      const { data: categories } = await app.supabase
        .from('categories')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('is_active', true)
        .order('sort_order');
      
      // Get menu items (safe fallback)
      const { data: items } = await app.supabase
        .from('menu_items')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('is_available', true)
        .order('sort_order');
      
      return reply.send({
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          code: tenant.code
        },
        table: {
          id: tableData.id,
          table_number: tableData.table_number,
          status: tableData.status,
          capacity: tableData.capacity
        },
        branding: branding || { theme: {}, logo_url: null, hero_video_url: null },
        menu_bootstrap: {
          categories: categories || [],
          items: items || []
        }
      });
      
    } catch (err: any) {
      app.log.error(err, 'QR resolve failed');
      return reply.code(500).send({ error: 'qr_resolve_failed' });
    }
  });
}