import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const CreateCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  sort_order: z.number().int().default(0)
});

const CreateMenuItemSchema = z.object({
  category_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
  cost: z.number().positive().optional(),
  image_url: z.string().url().optional(),
  video_url: z.string().url().optional(),
  is_available: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  preparation_time: z.number().int().positive().optional(),
  calories: z.number().int().positive().optional()
});

const UpdateMenuItemSchema = CreateMenuItemSchema.partial();

const BulkCsvSchema = z.object({
  csv: z.string().min(1)
});

export default async function menuRoutes(app: FastifyInstance) {
  // GET /menu/categories - List categories
  app.get('/menu/categories', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const tenantIds = req.auth?.tenantIds || [];
    if (tenantIds.length === 0) {
      return reply.code(403).send({ error: 'no_tenant_access' });
    }

    try {
      const { data, error } = await app.supabase
        .from('categories')
        .select('*')
        .in('tenant_id', tenantIds)
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;

      return reply.send({ categories: data || [] });
    } catch (err: any) {
      app.log.error(err, 'Failed to fetch categories');
      return reply.code(500).send({ error: 'failed_to_fetch_categories' });
    }
  });

  // POST /menu/categories - Create category
  app.post('/menu/categories', {
    preHandler: [app.requireAuth, async (req, reply) => {
      await app.requireRole(req, reply, ['admin', 'manager']);
    }]
  }, async (req, reply) => {
    const body = CreateCategorySchema.parse(req.body);
    const tenantId = req.auth?.primaryTenantId;

    if (!tenantId) {
      return reply.code(403).send({ error: 'no_tenant_context' });
    }

    try {
      const { data, error } = await app.supabase
        .from('categories')
        .insert({
          tenant_id: tenantId,
          name: body.name,
          description: body.description,
          sort_order: body.sort_order
        })
        .select()
        .single();

      if (error) throw error;

      return reply.code(201).send({ category: data });
    } catch (err: any) {
      app.log.error(err, 'Failed to create category');
      return reply.code(500).send({ error: 'failed_to_create_category' });
    }
  });

  // GET /menu/items - List menu items
  app.get('/menu/items', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const query = z.object({
      category_id: z.string().uuid().optional()
    }).parse(req.query);

    const tenantIds = req.auth?.tenantIds || [];
    if (tenantIds.length === 0) {
      return reply.code(403).send({ error: 'no_tenant_access' });
    }

    try {
      let queryBuilder = app.supabase
        .from('menu_items')
        .select(`
          *,
          categories (
            id,
            name,
            description
          )
        `)
        .in('tenant_id', tenantIds)
        .order('sort_order');

      if (query.category_id) {
        queryBuilder = queryBuilder.eq('category_id', query.category_id);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;

      return reply.send({ items: data || [] });
    } catch (err: any) {
      app.log.error(err, 'Failed to fetch menu items');
      return reply.code(500).send({ error: 'failed_to_fetch_menu_items' });
    }
  });

  // POST /menu/items - Create menu item
  app.post('/menu/items', {
    preHandler: [app.requireAuth, async (req, reply) => {
      await app.requireRole(req, reply, ['admin', 'manager']);
    }]
  }, async (req, reply) => {
    const body = CreateMenuItemSchema.parse(req.body);
    const tenantId = req.auth?.primaryTenantId;

    if (!tenantId) {
      return reply.code(403).send({ error: 'no_tenant_context' });
    }

    try {
      const { data, error } = await app.supabase
        .from('menu_items')
        .insert({
          tenant_id: tenantId,
          category_id: body.category_id,
          name: body.name,
          description: body.description,
          price: body.price,
          cost: body.cost,
          image_url: body.image_url,
          video_url: body.video_url,
          is_available: body.is_available,
          is_featured: body.is_featured,
          preparation_time: body.preparation_time,
          calories: body.calories
        })
        .select()
        .single();

      if (error) throw error;

      return reply.code(201).send({ item: data });
    } catch (err: any) {
      app.log.error(err, 'Failed to create menu item');
      return reply.code(500).send({ error: 'failed_to_create_menu_item' });
    }
  });

  // PATCH /menu/items/:id - Update menu item
  app.patch('/menu/items/:id', {
    preHandler: [app.requireAuth, async (req, reply) => {
      await app.requireRole(req, reply, ['admin', 'manager']);
    }]
  }, async (req, reply) => {
    const params = z.object({
      id: z.string().uuid()
    }).parse(req.params);

    const body = UpdateMenuItemSchema.parse(req.body);
    const tenantIds = req.auth?.tenantIds || [];

    if (tenantIds.length === 0) {
      return reply.code(403).send({ error: 'no_tenant_access' });
    }

    try {
      const { data, error } = await app.supabase
        .from('menu_items')
        .update(body)
        .eq('id', params.id)
        .in('tenant_id', tenantIds)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return reply.code(404).send({ error: 'menu_item_not_found' });
        }
        throw error;
      }

      return reply.send({ item: data });
    } catch (err: any) {
      app.log.error(err, 'Failed to update menu item');
      return reply.code(500).send({ error: 'failed_to_update_menu_item' });
    }
  });

  // POST /menu/items:bulk - Bulk import from CSV
  app.post('/menu/items:bulk', {
    preHandler: [app.requireAuth, async (req, reply) => {
      await app.requireRole(req, reply, ['admin', 'manager']);
    }]
  }, async (req, reply) => {
    const body = BulkCsvSchema.parse(req.body);
    const tenantId = req.auth?.primaryTenantId;

    if (!tenantId) {
      return reply.code(403).send({ error: 'no_tenant_context' });
    }

    try {
      const lines = body.csv.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const items = [];
      const errors = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        try {
          const item: any = { tenant_id: tenantId };
          
          headers.forEach((header, index) => {
            const value = values[index];
            switch (header) {
              case 'name':
                item.name = value;
                break;
              case 'price':
                item.price = parseFloat(value) || 0;
                break;
              case 'cost':
                item.cost = parseFloat(value) || 0;
                break;
              case 'description':
                item.description = value;
                break;
              case 'image_url':
                item.image_url = value;
                break;
              case 'category':
                // Find category by name
                const { data: categories } = await app.supabase
                  .from('categories')
                  .select('id')
                  .eq('tenant_id', tenantId)
                  .eq('name', value)
                  .limit(1);
                
                if (categories && categories.length > 0) {
                  item.category_id = categories[0].id;
                }
                break;
            }
          });

          if (item.name && item.price && item.category_id) {
            items.push(item);
          } else {
            errors.push({ row: i + 1, error: 'Missing required fields: name, price, category' });
          }
        } catch (err) {
          errors.push({ row: i + 1, error: 'Parse error' });
        }
      }

      // Insert valid items
      let created = 0;
      if (items.length > 0) {
        const { data, error } = await app.supabase
          .from('menu_items')
          .insert(items)
          .select();

        if (error) throw error;
        created = data?.length || 0;
      }

      return reply.send({
        created,
        errors,
        total_processed: lines.length - 1
      });
    } catch (err: any) {
      app.log.error(err, 'Failed to bulk import menu items');
      return reply.code(500).send({ error: 'failed_to_bulk_import' });
    }
  });
}