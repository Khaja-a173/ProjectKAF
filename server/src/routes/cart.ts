import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const StartCartSchema = z.object({
  mode: z.enum(['dine_in', 'takeaway']),
  table_id: z.string().uuid().nullable()
});

const AddItemsSchema = z.object({
  cart_id: z.string().uuid(),
  items: z.array(z.object({
    menu_item_id: z.string().uuid(),
    qty: z.number().int().positive()
  }))
});

const GetCartSchema = z.object({
  cart_id: z.string().uuid()
});

// In-memory cart storage for dev (replace with DB in production)
const cartStorage = new Map<string, any>();

export default async function cartRoutes(app: FastifyInstance) {
  // POST /cart/start - Create cart session
  app.post('/cart/start', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const body = StartCartSchema.parse(req.body);
    const tenantId = req.auth?.primaryTenantId;
    
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }
    
    try {
      // Validate table exists if provided
      if (body.table_id) {
        const { data: table, error: tableError } = await app.supabase
          .from('restaurant_tables')
          .select('id, tenant_id, table_number, status')
          .eq('id', body.table_id)
          .eq('tenant_id', tenantId)
          .single();
        
        if (tableError || !table) {
          return reply.code(404).send({ error: 'table_not_found' });
        }
      }
      
      // Generate cart ID
      const cartId = `cart_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      
      // Store cart in memory
      const cart = {
        cart_id: cartId,
        tenant_id: tenantId,
        table_id: body.table_id,
        mode: body.mode,
        items: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      cartStorage.set(cartId, cart);
      
      return reply.code(201).send({ cart_id: cartId });
      
    } catch (err: any) {
      app.log.error(err, 'Failed to start cart');
      return reply.code(500).send({ error: 'failed_to_start_cart' });
    }
  });

  // POST /cart/items - Add items to cart
  app.post('/cart/items', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const body = AddItemsSchema.parse(req.body);
    const tenantId = req.auth?.primaryTenantId;
    
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }
    
    try {
      const cart = cartStorage.get(body.cart_id);
      if (!cart || cart.tenant_id !== tenantId) {
        return reply.code(404).send({ error: 'cart_not_found' });
      }
      
      // Validate menu items exist
      const menuItemIds = body.items.map(item => item.menu_item_id);
      const { data: menuItems, error: menuError } = await app.supabase
        .from('menu_items')
        .select('id, name, price, tenant_id')
        .in('id', menuItemIds)
        .eq('tenant_id', tenantId)
        .eq('is_available', true);
      
      if (menuError || !menuItems || menuItems.length !== menuItemIds.length) {
        return reply.code(400).send({ error: 'invalid_menu_items' });
      }
      
      // Update cart items
      body.items.forEach(newItem => {
        const menuItem = menuItems.find(mi => mi.id === newItem.menu_item_id);
        if (!menuItem) return;
        
        const existingIndex = cart.items.findIndex((item: any) => item.menu_item_id === newItem.menu_item_id);
        
        if (existingIndex >= 0) {
          cart.items[existingIndex].qty += newItem.qty;
        } else {
          cart.items.push({
            menu_item_id: newItem.menu_item_id,
            name: menuItem.name,
            price: menuItem.price,
            qty: newItem.qty
          });
        }
      });
      
      cart.updated_at = new Date().toISOString();
      cartStorage.set(body.cart_id, cart);
      
      // Calculate totals
      const subtotal = cart.items.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);
      const tax = subtotal * 0.08; // 8% tax
      const total = subtotal + tax;
      
      return reply.send({
        items: cart.items,
        totals: { subtotal, tax, total }
      });
      
    } catch (err: any) {
      app.log.error(err, 'Failed to add cart items');
      return reply.code(500).send({ error: 'failed_to_add_items' });
    }
  });

  // GET /cart/:cart_id - Get cart contents
  app.get('/cart/:cart_id', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const params = GetCartSchema.parse(req.params);
    const tenantId = req.auth?.primaryTenantId;
    
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }
    
    try {
      const cart = cartStorage.get(params.cart_id);
      if (!cart || cart.tenant_id !== tenantId) {
        return reply.code(404).send({ error: 'cart_not_found' });
      }
      
      // Calculate totals
      const subtotal = cart.items.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);
      const tax = subtotal * 0.08;
      const total = subtotal + tax;
      
      return reply.send({
        items: cart.items,
        totals: { subtotal, tax, total }
      });
      
    } catch (err: any) {
      app.log.error(err, 'Failed to get cart');
      return reply.code(500).send({ error: 'failed_to_get_cart' });
    }
  });
}