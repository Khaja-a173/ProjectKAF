import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const StartCartSchema = z.object({
  mode: z.enum(['dine_in', 'takeaway']),
  table_id: z.string().nullable()
});

const AddItemsSchema = z.object({
  cart_id: z.string().uuid(),
  items: z.array(z.object({
    menu_item_id: z.string().uuid(),
    qty: z.number().min(1)
  }))
});

const ConfirmOrderSchema = z.object({
  cart_id: z.string().uuid(),
  notes: z.string().optional(),
  assign_staff_id: z.string().uuid().optional()
});

export default async function cartRoutes(app: FastifyInstance) {
  /**
   * POST /cart/start
   * Creates or reuses a cart session
   */
  app.post('/cart/start', {
    preHandler: [app.requireAuth],
    schema: {
      body: StartCartSchema
    }
  }, async (req, reply) => {
    try {
      const tenantId = req.auth.primaryTenantId;
      if (!tenantId) {
        return reply.code(401).send({ error: 'No tenant access' });
      }

      const { mode, table_id } = StartCartSchema.parse(req.body);

      // Try to find existing open cart for this user/tenant/mode
      let cartId = null;
      try {
        const { data: existingCart } = await app.supabase
          .from('cart_sessions')
          .select('id')
          .eq('tenant_id', tenantId)
          .eq('user_id', req.auth.userId)
          .eq('mode', mode)
          .eq('status', 'open')
          .single();

        if (existingCart) {
          cartId = existingCart.id;
        }
      } catch (err: any) {
        if (err.code !== '42P01' && err.code !== 'PGRST116') {
          app.log.warn('Error checking existing cart:', err);
        }
      }

      // Create new cart if none exists
      if (!cartId) {
        cartId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        try {
          await app.supabase
            .from('cart_sessions')
            .insert({
              id: cartId,
              tenant_id: tenantId,
              user_id: req.auth.userId,
              mode,
              table_id,
              status: 'open'
            });
        } catch (err: any) {
          if (err.code === '42P01') {
            app.log.warn('cart_sessions table not found, using in-memory cart');
          } else {
            throw err;
          }
        }
      }

      return reply.send({ cart_id: cartId });
    } catch (err) {
      app.log.error('Failed to start cart:', err);
      return reply.code(500).send({ error: 'Failed to start cart' });
    }
  });

  /**
   * POST /cart/items
   * Add/update items in cart
   */
  app.post('/cart/items', {
    preHandler: [app.requireAuth],
    schema: {
      body: AddItemsSchema
    }
  }, async (req, reply) => {
    try {
      const tenantId = req.auth.primaryTenantId;
      if (!tenantId) {
        return reply.code(401).send({ error: 'No tenant access' });
      }

      const { cart_id, items } = AddItemsSchema.parse(req.body);

      // Upsert cart items
      for (const item of items) {
        try {
          await app.supabase
            .from('cart_items')
            .upsert({
              cart_id,
              menu_item_id: item.menu_item_id,
              quantity: item.qty,
              updated_at: new Date().toISOString()
            });
        } catch (err: any) {
          if (err.code === '42P01') {
            app.log.warn('cart_items table not found');
            break;
          } else {
            throw err;
          }
        }
      }

      // Return current cart snapshot
      const cartSnapshot = await getCartSnapshot(app, cart_id, tenantId);
      return reply.send(cartSnapshot);
    } catch (err) {
      app.log.error('Failed to add cart items:', err);
      return reply.code(500).send({ error: 'Failed to add items to cart' });
    }
  });

  /**
   * GET /cart/:cart_id
   * Get cart details
   */
  app.get('/cart/:cart_id', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    try {
      const tenantId = req.auth.primaryTenantId;
      if (!tenantId) {
        return reply.code(401).send({ error: 'No tenant access' });
      }

      const cartId = (req.params as any).cart_id;
      const cartSnapshot = await getCartSnapshot(app, cartId, tenantId);
      return reply.send(cartSnapshot);
    } catch (err) {
      app.log.error('Failed to get cart:', err);
      return reply.code(500).send({ error: 'Failed to get cart' });
    }
  });

  /**
   * POST /orders/confirm
   * Convert cart to order
   */
  app.post('/orders/confirm', {
    preHandler: [app.requireAuth],
    schema: {
      body: ConfirmOrderSchema
    }
  }, async (req, reply) => {
    try {
      const tenantId = req.auth.primaryTenantId;
      if (!tenantId) {
        return reply.code(401).send({ error: 'No tenant access' });
      }

      const { cart_id, notes, assign_staff_id } = ConfirmOrderSchema.parse(req.body);

      // Get cart items
      const cartSnapshot = await getCartSnapshot(app, cart_id, tenantId);
      
      if (!cartSnapshot.items || cartSnapshot.items.length === 0) {
        return reply.code(400).send({ error: 'Cart is empty' });
      }

      // Create order
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

      try {
        // Insert order
        await app.supabase
          .from('orders')
          .insert({
            id: orderId,
            tenant_id: tenantId,
            order_number: orderNumber,
            order_type: cartSnapshot.mode === 'dine_in' ? 'dine_in' : 'takeaway',
            table_id: cartSnapshot.table_id,
            staff_id: assign_staff_id,
            status: 'pending',
            subtotal: cartSnapshot.totals.subtotal,
            tax_amount: cartSnapshot.totals.tax,
            total_amount: cartSnapshot.totals.total,
            special_instructions: notes
          });

        // Insert order items
        for (const item of cartSnapshot.items) {
          await app.supabase
            .from('order_items')
            .insert({
              order_id: orderId,
              menu_item_id: item.menu_item_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total_price
            });
        }

        // Insert status event
        try {
          await app.supabase
            .from('order_status_events')
            .insert({
              order_id: orderId,
              from_status: null,
              to_status: 'new',
              changed_by: req.auth.userId
            });
        } catch (err: any) {
          if (err.code !== '42P01') {
            app.log.warn('Failed to record status event:', err);
          }
        }

        // Clear cart
        try {
          await app.supabase
            .from('cart_sessions')
            .update({ status: 'converted' })
            .eq('id', cart_id);
        } catch (err: any) {
          if (err.code !== '42P01') {
            app.log.warn('Failed to clear cart:', err);
          }
        }

        return reply.send({
          order_id: orderId,
          status: 'new'
        });

      } catch (err: any) {
        if (err.code === '42P01') {
          app.log.warn('Orders table not found, using mock response');
          return reply.send({
            order_id: orderId,
            status: 'new',
            mock: true
          });
        }
        throw err;
      }

    } catch (err) {
      app.log.error('Failed to confirm order:', err);
      return reply.code(500).send({ error: 'Failed to confirm order' });
    }
  });
}

// Helper function to get cart snapshot
async function getCartSnapshot(app: FastifyInstance, cartId: string, tenantId: string) {
  const defaultSnapshot = {
    items: [],
    totals: { subtotal: 0, tax: 0, total: 0 },
    mode: 'takeaway',
    table_id: null
  };

  try {
    // Get cart session
    const { data: cartSession } = await app.supabase
      .from('cart_sessions')
      .select('mode, table_id')
      .eq('id', cartId)
      .eq('tenant_id', tenantId)
      .single();

    // Get cart items with menu item details
    const { data: cartItems } = await app.supabase
      .from('cart_items')
      .select(`
        menu_item_id,
        quantity,
        menu_items (
          name,
          price,
          image_url
        )
      `)
      .eq('cart_id', cartId);

    if (!cartItems || !cartSession) {
      return defaultSnapshot;
    }

    // Calculate totals
    const items = cartItems.map(item => ({
      menu_item_id: item.menu_item_id,
      name: item.menu_items?.name || 'Unknown Item',
      quantity: item.quantity,
      unit_price: item.menu_items?.price || 0,
      total_price: (item.menu_items?.price || 0) * item.quantity,
      image_url: item.menu_items?.image_url
    }));

    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;

    return {
      items,
      totals: { subtotal, tax, total },
      mode: cartSession.mode,
      table_id: cartSession.table_id
    };

  } catch (err: any) {
    if (err.code === '42P01') {
      app.log.warn('Cart tables not found, returning empty cart');
      return defaultSnapshot;
    }
    
    app.log.warn('Failed to get cart snapshot:', err);
    return defaultSnapshot;
  }
}