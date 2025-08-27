import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const QrResolveSchema = z.object({
  code: z.string().length(4),
  table: z.string().regex(/^T\d{2}$/)
});

export default async function qrRoutes(app: FastifyInstance) {
  /**
   * GET /qr/resolve?code=<tenantCode>&table=<tableNumber>
   * Public endpoint - no auth required for QR scanning
   */
  app.get('/qr/resolve', {
    schema: {
      querystring: QrResolveSchema
    }
  }, async (req, reply) => {
    try {
      const { code, table } = QrResolveSchema.parse(req.query);
      
      // Resolve tenant by code
      let tenant = null;
      try {
        const { data: tenantData, error: tenantError } = await app.supabase
          .from('tenants')
          .select('id, name, slug')
          .eq('code', code.toUpperCase())
          .single();

        if (tenantError) {
          if (tenantError.code === '42P01') {
            app.log.warn('tenants table not found');
          } else if (tenantError.code === 'PGRST116') {
            return reply.code(404).send({ error: 'Tenant not found' });
          } else {
            throw tenantError;
          }
        } else {
          tenant = tenantData;
        }
      } catch (err) {
        app.log.warn('Failed to resolve tenant:', err);
      }

      // If no tenant found, return error
      if (!tenant) {
        return reply.code(404).send({ error: 'Restaurant not found' });
      }

      // Resolve table by table_number
      let tableData = null;
      try {
        const { data, error } = await app.supabase
          .from('restaurant_tables')
          .select('id, table_number, capacity, location')
          .eq('tenant_id', tenant.id)
          .eq('table_number', table)
          .single();

        if (error) {
          if (error.code === '42P01') {
            app.log.warn('restaurant_tables table not found');
          } else if (error.code === 'PGRST116') {
            return reply.code(404).send({ error: 'Table not found' });
          } else {
            throw error;
          }
        } else {
          tableData = data;
        }
      } catch (err) {
        app.log.warn('Failed to resolve table:', err);
      }

      // If no table found, return error
      if (!tableData) {
        return reply.code(404).send({ error: 'Table not found' });
      }

      // Get branding (optional)
      let branding = {};
      try {
        const { data } = await app.supabase
          .from('tenant_branding')
          .select('*')
          .eq('tenant_id', tenant.id)
          .single();
        
        if (data) {
          branding = {
            logo_url: data.logo_url,
            theme: data.theme || {},
            gallery_urls: data.gallery_urls || []
          };
        }
      } catch (err) {
        // Branding is optional, continue without it
        app.log.debug('No branding found for tenant:', tenant.id);
      }

      // Get menu bootstrap (categories and items)
      let categories = [];
      let items = [];

      try {
        const { data: categoriesData } = await app.supabase
          .from('categories')
          .select('id, name, description, sort_order')
          .eq('tenant_id', tenant.id)
          .eq('is_active', true)
          .order('sort_order');

        categories = categoriesData || [];
      } catch (err) {
        app.log.debug('Categories table not found or error:', err);
      }

      try {
        const { data: itemsData } = await app.supabase
          .from('menu_items')
          .select('id, name, description, price, image_url, category_id, is_available')
          .eq('tenant_id', tenant.id)
          .eq('is_available', true)
          .order('sort_order');

        items = itemsData || [];
      } catch (err) {
        app.log.debug('Menu items table not found or error:', err);
      }

      return reply.send({
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          branding
        },
        table: {
          id: tableData.id,
          table_number: tableData.table_number,
          capacity: tableData.capacity,
          location: tableData.location
        },
        menu_bootstrap: {
          categories,
          items
        }
      });

    } catch (err) {
      app.log.error('QR resolve failed:', err);
      return reply.code(500).send({ error: 'Failed to resolve QR code' });
    }
  });
}