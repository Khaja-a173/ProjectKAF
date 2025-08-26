import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createHmac, timingSafeEqual } from 'crypto';

const QrResolveSchema = z.object({
  code: z.string().length(4),
  table: z.string().regex(/^T\d{2}$/),
  sig: z.string(),
  exp: z.coerce.number().int().positive()
});

function verifyQrSignature(code: string, table: string, exp: number, signature: string): boolean {
  const secret = process.env.QR_SECRET;
  if (!secret) return false;
  
  const payload = `${code}:${table}:${exp}`;
  const expectedSig = createHmac('sha256', secret).update(payload).digest('hex');
  
  try {
    return timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSig, 'hex'));
  } catch {
    return false;
  }
}

export default async function qrRoutes(app: FastifyInstance) {
  // GET /qr/resolve - Resolve QR code to tenant, table, menu, and branding
  app.get('/qr/resolve', async (req, reply) => {
    const query = QrResolveSchema.parse(req.query);
    const { code, table, sig, exp } = query;
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (exp <= now) {
      return reply.code(400).send({ error: 'qr_expired' });
    }
    
    // Verify signature
    if (!verifyQrSignature(code, table, exp, sig)) {
      return reply.code(400).send({ error: 'invalid_signature' });
    }
    
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
      
      // Get branding
      const { data: branding } = await app.supabase
        .from('customization')
        .select('theme, logo_url, hero_video')
        .eq('tenant_id', tenant.id)
        .maybeSingle();
      
      // Get menu categories and items
      const { data: categories, error: categoriesError } = await app.supabase
        .from('categories')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('is_active', true)
        .order('sort_order');
      
      if (categoriesError) {
        app.log.error(categoriesError, 'Failed to fetch categories');
      }
      
      const { data: items, error: itemsError } = await app.supabase
        .from('menu_items')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('active', true)
        .order('sort_order');
      
      if (itemsError) {
        app.log.error(itemsError, 'Failed to fetch menu items');
      }
      
      return reply.send({
        tenant,
        table: tableData,
        branding: branding || { theme: {}, logo_url: null, hero_video_url: null },
        menu: {
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