import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createHmac } from 'crypto';

const QrResolveSchema = z.object({
  code: z.string().min(1).max(10),
  table: z.string().regex(/^T\d{2}$/),
  sig: z.string(),
  exp: z.coerce.number().int().positive()
});

export default async function qrRoutes(app: FastifyInstance) {
  // GET /public/qr/resolve?code=<tenantCode>&table=<tableNumber>&sig=<signature>&exp=<expiration>
  app.get('/public/qr/resolve', async (req, reply) => {
    const query = QrResolveSchema.parse(req.query);
    const { code, table, sig, exp } = query;

    // 1. Verify signature
    const secret = process.env.QR_SECRET;
    if (!secret) {
      return reply.code(500).send({ error: 'QR_SECRET not configured' });
    }

    const dataToSign = `${code}:${table}:${exp}`;
    const expectedSig = createHmac('sha256', secret).update(dataToSign).digest('hex');

    if (expectedSig !== sig) {
      return reply.code(400).send({ error: 'invalid_signature' });
    }

    // 2. Check expiration
    if (exp <= Math.floor(Date.now() / 1000)) {
      return reply.code(400).send({ error: 'qr_expired' });
    }
    
    try {
      // 3. Lookup tenant by code
      const { data: tenant, error: tenantError } = await app.supabase
        .from('tenants')
        .select('id, name, slug, code')
        .eq('code', code.toUpperCase())
        .maybeSingle();
      
      if (tenantError || !tenant) {
        return reply.code(404).send({ error: 'tenant_not_found' });
      }
      
      // 4. Lookup table by table_number
      const { data: tableData, error: tableError } = await app.supabase
        .from('restaurant_tables')
        .select('id, table_number, status, capacity')
        .eq('tenant_id', tenant.id)
        .eq('table_number', table)
        .maybeSingle();
      
      if (tableError || !tableData) {
        return reply.code(404).send({ error: 'table_not_found' });
      }
      
      // 5. Get branding (safe fallback if missing)
      const { data: branding } = await app.supabase
        .from('customization')
        .select('theme, logo_url, hero_video')
        .eq('tenant_id', tenant.id)
        .maybeSingle();
      
      // 6. Get menu categories (safe fallback)
      const { data: categories } = await app.supabase
        .from('categories')
        .select('id, name, description')
        .eq('tenant_id', tenant.id)
        .eq('is_active', true)
        .order('sort_order');
      
      // 7. Get menu items (safe fallback)
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
          code: tenant.code
        },
        table: {
          id: tableData.id,
          table_number: tableData.table_number,
          status: tableData.status,
          capacity: tableData.capacity
        },
        branding: branding || { theme: {}, logo_url: null, hero_video: null },
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