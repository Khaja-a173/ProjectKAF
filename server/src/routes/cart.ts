import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// In-memory cart storage for dev (replace with DB in production)
const cartStorage = new Map<string, any>();

// Helper to get Supabase client with service role
function getServiceSupabase() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !serviceKey) throw new Error('Supabase URL or Service Role Key missing');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

const CartItemSchema = z.object({
  menu_item_id: z.string().uuid(),
  qty: z.number().int().positive(),
  notes: z.string().optional()
});

const StartCartSchema = z.object({
  mode: z.enum(['dine_in', 'takeaway']),
  table_id: z.string().uuid().nullable().optional()
});

const AddItemsSchema = z.object({
  cart_id: z.string().uuid(),
  items: z.array(CartItemSchema)
});

const UpdateItemSchema = z.object({
  qty: z.number().int().positive().optional(),
  notes: z.string().optional()
});

export default async function cartRoutes(app: FastifyInstance) {
  // POST /public/cart - Create cart session
  app.post('/public/cart', async (req, reply) => {
    const body = StartCartSchema.parse(req.body);
    // For public endpoints, tenant_id must be derived from a trusted source (e.g., QR code payload)
    // For now, we'll use a hardcoded tenant_id for simplicity, but this should be dynamic
    const tenantId = '550e8400-e29b-41d4-a716-446655440000'; // DEMO TENANT ID

    try {
      // Validate table exists if provided
      if (body.table_id) {
        const sb = getServiceSupabase();
        const { data: table, error: tableError } = await sb
          .from('restaurant_tables')
          .select('id, tenant_id, table_number, status')
          .eq('id', body.table_id)
          .eq('tenant_id', tenantId)
          .maybeSingle();
        
        if (tableError || !table) {
          return reply.code(404).send({ error: 'table_not_found' });
        }
      }
      
      // Generate cart ID and session ID
      const cartId = `cart_${app.crypto.randomUUID()}`;
      const sessionId = `session_${app.crypto.randomUUID()}`;
      
      // Store cart in memory (or DB in production)
      const cart = {
        id: cartId,
        session_id: sessionId,
        tenant_id: tenantId,
        table_id: body.table_id,
        mode: body.mode,
        items: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      cartStorage.set(cartId, cart);
      
      return reply.code(201).send({ cart_id: cartId, session_id: sessionId });
      
    } catch (err: any) {
      app.log.error(err, 'Failed to start cart');
      return reply.code(500).send({ error: 'failed_to_start_cart' });
    }
  });

  // GET /public/cart/:cart_id - Get cart contents
  app.get('/public/cart/:cart_id', async (req, reply) => {
    const params = z.object({ cart_id: z.string().uuid() }).parse(req.params);
    const tenantId = '550e8400-e29b-41d4-a716-446655440000'; // DEMO TENANT ID
    
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
        session: { id: cart.session_id, table_id: cart.table_id, mode: cart.mode },
        items: cart.items,
        totals: { subtotal, tax, total }
      });
      
    } catch (err: any) {
      app.log.error(err, 'Failed to get cart');
      return reply.code(500).send({ error: 'failed_to_get_cart' });
    }
  });

  // POST /public/cart/items - Add items to cart
  app.post('/public/cart/items', async (req, reply) => {
    const body = AddItemsSchema.parse(req.body);
    const tenantId = '550e8400-e29b-41d4-a716-446655440000'; // DEMO TENANT ID
    
    try {
      const cart = cartStorage.get(body.cart_id);
      if (!cart || cart.tenant_id !== tenantId) {
        return reply.code(404).send({ error: 'cart_not_found' });
      }
      
      const sb = getServiceSupabase();
      // Validate menu items exist
      const menuItemIds = body.items.map(item => item.menu_item_id);
      const { data: menuItems, error: menuError } = await sb
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
        if (!menuItem) return; // Should not happen due to validation above
        
        const existingIndex = cart.items.findIndex((item: any) => item.menu_item_id === newItem.menu_item_id);
        
        if (existingIndex >= 0) {
          cart.items[existingIndex].qty += newItem.qty;
        } else {
          cart.items.push({
            menu_item_id: newItem.menu_item_id,
            name: menuItem.name,
            price: menuItem.price,
            qty: newItem.qty,
            notes: newItem.notes // Include notes
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
        session: { id: cart.session_id, table_id: cart.table_id, mode: cart.mode },
        items: cart.items,
        totals: { subtotal, tax, total }
      });
      
    } catch (err: any) {
      app.log.error(err, 'Failed to add cart items');
      return reply.code(500).send({ error: 'failed_to_add_items' });
    }
  });

  // PATCH /public/cart/items/:id - Update cart item quantity/notes
  app.patch('/public/cart/items/:id', async (req, reply) => {
    const params = z.object({ id: z.string().uuid() }).parse(req.params);
    const body = UpdateItemSchema.parse(req.body);
    const tenantId = '550e8400-e29b-41d4-a716-446655440000'; // DEMO TENANT ID

    try {
      // Find cart containing the item
      let foundCart: any = null;
      let itemIndex: number = -1;

      for (const cart of cartStorage.values()) {
        if (cart.tenant_id === tenantId) {
          itemIndex = cart.items.findIndex((item: any) => item.menu_item_id === params.id);
          if (itemIndex !== -1) {
            foundCart = cart;
            break;
          }
        }
      }

      if (!foundCart) {
        return reply.code(404).send({ error: 'cart_item_not_found' });
      }

      // Update item
      if (body.qty !== undefined) {
        foundCart.items[itemIndex].qty = body.qty;
      }
      if (body.notes !== undefined) {
        foundCart.items[itemIndex].notes = body.notes;
      }
      foundCart.updated_at = new Date().toISOString();
      cartStorage.set(foundCart.id, foundCart);

      // Calculate totals
      const subtotal = foundCart.items.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);
      const tax = subtotal * 0.08;
      const total = subtotal + tax;

      return reply.send({
        session: { id: foundCart.session_id, table_id: foundCart.table_id, mode: foundCart.mode },
        items: foundCart.items,
        totals: { subtotal, tax, total }
      });

    } catch (err: any) {
      app.log.error(err, 'Failed to update cart item');
      return reply.code(500).send({ error: 'failed_to_update_cart_item' });
    }
  });

  // DELETE /public/cart/items/:id - Remove item from cart
  app.delete('/public/cart/items/:id', async (req, reply) => {
    const params = z.object({ id: z.string().uuid() }).parse(req.params);
    const tenantId = '550e8400-e29b-41d4-a716-446655440000'; // DEMO TENANT ID

    try {
      let foundCart: any = null;
      let itemIndex: number = -1;

      for (const cart of cartStorage.values()) {
        if (cart.tenant_id === tenantId) {
          itemIndex = cart.items.findIndex((item: any) => item.menu_item_id === params.id);
          if (itemIndex !== -1) {
            foundCart = cart;
            break;
          }
        }
      }

      if (!foundCart) {
        return reply.code(404).send({ error: 'cart_item_not_found' });
      }

      foundCart.items.splice(itemIndex, 1); // Remove item
      foundCart.updated_at = new Date().toISOString();
      cartStorage.set(foundCart.id, foundCart);

      // Calculate totals
      const subtotal = foundCart.items.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);
      const tax = subtotal * 0.08;
      const total = subtotal + tax;

      return reply.send({
        session: { id: foundCart.session_id, table_id: foundCart.table_id, mode: foundCart.mode },
        items: foundCart.items,
        totals: { subtotal, tax, total }
      });

    } catch (err: any) {
      app.log.error(err, 'Failed to remove cart item');
      return reply.code(500).send({ error: 'failed_to_remove_cart_item' });
    }
  });
}