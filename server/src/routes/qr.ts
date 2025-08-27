import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createHmac } from 'crypto';

const QrResolveSchema = z.object({
  code: z.string().min(1).max(10),
  table: z.string().regex(/^T\d{2}$/),
  sig: z.string().optional(),
  exp: z.coerce.number().int().positive().optional()
});

export default async function qrRoutes(app: FastifyInstance) {
  // GET /qr/resolve?code=<tenantCode>&table=<tableNumber>&sig=<signature>&exp=<expiration>
  app.get('/qr/resolve', async (req, reply) => {
    const query = QrResolveSchema.parse(req.query);
    const { code, table, sig, exp } = query;

    // For now, skip signature validation if not provided (dev mode)
    if (sig && exp) {
      // Verify signature
      const secret = process.env.QR_SECRET;
      if (!secret) {
        return reply.code(500).send({ error: 'QR_SECRET not configured' });
      }

      const dataToSign = `${code}:${table}:${exp}`;
      const expectedSig = createHmac('sha256', secret).update(dataToSign).digest('hex');

      if (expectedSig !== sig) {
        return reply.code(400).send({ error: 'invalid_signature' });
      }

      // Check expiration
      if (exp <= Math.floor(Date.now() / 1000)) {
        return reply.code(400).send({ error: 'qr_expired' });
      }
    }
    
    try {
      // Lookup tenant by code
      const { data: tenant, error: tenantError } = await app.supabase
        .from('tenants')
        .select('id, name, slug')
        .eq('code', code.toUpperCase())
        .maybeSingle();
      
      if (tenantError || !tenant) {
        // Try by slug as fallback
        const { data: tenantBySlug } = await app.supabase
          .from('tenants')
          .select('id, name, slug')
          .eq('slug', code.toLowerCase())
          .maybeSingle();
        
        if (!tenantBySlug) {
          return reply.code(404).send({ error: 'tenant_not_found' });
        }
        
        // Use tenant found by slug
        tenant.id = tenantBySlug.id;
        tenant.name = tenantBySlug.name;
        tenant.slug = tenantBySlug.slug;
      }
      
      // Lookup table by table_number
      const { data: tableData, error: tableError } = await app.supabase
        .from('restaurant_tables')
        .select('id, table_number, status, capacity')
        .eq('tenant_id', tenant.id)
        .eq('table_number', table)
        .maybeSingle();
      
      if (tableError || !tableData) {
        return reply.code(404).send({ error: 'table_not_found' });
      }
      
      // Get branding (safe fallback if missing)
      const { data: branding } = await app.supabase
        .from('tenant_branding')
        .select('theme, logo_url, hero_video_url')
        .eq('tenant_id', tenant.id)
        .maybeSingle();
      
      // Get menu categories (safe fallback)
      const { data: categories } = await app.supabase
        .from('categories')
        .select('id, name, description')
        .eq('tenant_id', tenant.id)
        .eq('is_active', true)
        .order('sort_order');
      
      // Get menu items (safe fallback)
      const { data: items } = await app.supabase
        .from('menu_items')
        .select('id, name, description, price, image_url, is_available, preparation_time, calories, allergens, dietary_info, is_featured, sort_order')
        .eq('tenant_id', tenant.id)
        .eq('is_available', true)
        .order('sort_order');
      
      return reply.send({
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          code: code.toUpperCase()
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