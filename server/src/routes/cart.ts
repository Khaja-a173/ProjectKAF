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
  cart_id: z.string(),
  items: z.array(CartItemSchema)
});

const UpdateItemSchema = z.object({
  qty: z.number().int().positive().optional(),
  notes: z.string().optional()
});

const ConfirmOrderSchema = z.object({
  cart_id: z.string(),
  notes: z.string().optional(),
  assign_staff_id: z.string().uuid().optional()
});

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
      
      // Generate cart ID
      const cartId = `cart_${app.crypto.randomUUID()}`;
      
      // Store cart in memory (or DB in production)
      const cart = {
        id: cartId,
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

  // GET /cart/:cart_id - Get cart contents
  app.get('/cart/:cart_id', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const params = z.object({ cart_id: z.string() }).parse(req.params);
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
        items: cart.items,
        totals: { subtotal, tax, total }
      });
      
    } catch (err: any) {
      app.log.error(err, 'Failed to add cart items');
      return reply.code(500).send({ error: 'failed_to_add_items' });
    }
  });

  // POST /orders/confirm - Creates an orders row from cart
  app.post('/orders/confirm', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const body = ConfirmOrderSchema.parse(req.body);
    const tenantId = req.auth?.primaryTenantId;

    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      // Get cart from memory (in production this would be from DB/Redis)
      const cart = cartStorage.get(body.cart_id);
      
      if (!cart || cart.tenant_id !== tenantId) {
        return reply.code(404).send({ error: 'cart_not_found' });
      }

      if (!cart.items || cart.items.length === 0) {
        return reply.code(400).send({ error: 'cart_empty' });
      }

      // Calculate totals
      // TODO: Fetch menu item prices from DB for security
      const subtotal = cart.items.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);
      const tax = subtotal * 0.08;
      const total = subtotal + tax;

      // Generate order number
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

      // Create order
      const { data: order, error: orderError } = await app.supabase
        .from('orders')
        .insert({
          tenant_id: tenantId,
          table_id: cart.table_id,
          staff_id: body.assign_staff_id,
          order_number: orderNumber,
          order_type: cart.mode,
          status: 'pending',
          subtotal: subtotal,
          tax_amount: tax,
          total_amount: total,
          special_instructions: body.notes,
          mode: cart.mode,
          session_id: cart.id // Link to cart session
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.items.map((item: any) => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.qty,
        unit_price: item.price,
        total_price: item.price * item.qty,
        special_instructions: item.notes, // Pass item-level notes
        tenant_id: tenantId
      }));

      const { error: itemsError } = await app.supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Try to insert status event (safe fallback if table missing)
      try {
        const sb = getServiceSupabase(); // Use service role for RLS bypass
        await sb
          .from('order_status_events')
          .insert({
            order_id: order.id,
            from_status: null,
            to_status: 'new',
            created_by: req.auth?.userId || 'customer'
          });
      } catch (statusErr) {
        app.log.warn('order_status_events table not available, skipping event');
      }

      // Clear cart from memory
      cartStorage.delete(body.cart_id);

      app.log.info(`Order created: ${orderNumber} for tenant ${tenantId}`);

      return reply.code(201).send({
        order_id: order.id,
        order_number: orderNumber,
        status: 'new',
        total_amount: order.total_amount
      });

    } catch (err: any) {
      app.log.error(err, 'Failed to confirm order');
      return reply.code(500).send({ error: 'failed_to_confirm_order' });
    }
  });
}