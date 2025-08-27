import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const CreateCartSchema = z.object({
  items: z.array(z.object({
    menu_item_id: z.string().uuid(),
    qty: z.number().int().positive()
  })),
  order_type: z.enum(['dine_in', 'takeaway']),
  table_id: z.string().uuid().optional()
});

const CheckoutSchema = z.object({
  session_id: z.string().uuid(),
  customer: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional()
  }).optional()
});

// In-memory cart storage for dev (replace with DB in production)
const cartStorage = new Map<string, any>();

export default async function cartRoutes(app: FastifyInstance) {
  // POST /public/cart - Create cart session
  app.post('/public/cart', async (req, reply) => {
    const body = CreateCartSchema.parse(req.body);
    
    try {
      // Generate session IDs
      const cartId = `cart_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      
      // Validate table exists if provided
      if (body.table_id) {
        const { data: table, error: tableError } = await app.supabase
          .from('restaurant_tables')
          .select('id, tenant_id, table_number, status')
          .eq('id', body.table_id)
          .single();
        
        if (tableError || !table) {
          return reply.code(404).send({ error: 'table_not_found' });
        }
      }
      
      // Validate menu items exist
      const menuItemIds = body.items.map(item => item.menu_item_id);
      const { data: menuItems, error: menuError } = await app.supabase
        .from('menu_items')
        .select('id, name, price, tenant_id')
        .in('id', menuItemIds)
        .eq('is_available', true);
      
      if (menuError || !menuItems || menuItems.length !== menuItemIds.length) {
        return reply.code(400).send({ error: 'invalid_menu_items' });
      }
      
      // Ensure all items belong to same tenant
      const tenantIds = [...new Set(menuItems.map(item => item.tenant_id))];
      if (tenantIds.length !== 1) {
        return reply.code(400).send({ error: 'items_from_different_tenants' });
      }
      
      // Store cart in memory
      const cart = {
        cart_id: cartId,
        session_id: sessionId,
        tenant_id: tenantIds[0],
        table_id: body.table_id,
        order_type: body.order_type,
        items: body.items.map(item => {
          const menuItem = menuItems.find(mi => mi.id === item.menu_item_id);
          return {
            menu_item_id: item.menu_item_id,
            name: menuItem?.name,
            price: menuItem?.price,
            qty: item.qty,
            total: (menuItem?.price || 0) * item.qty
          };
        }),
        created_at: new Date().toISOString()
      };
      
      cartStorage.set(sessionId, cart);
      
      return reply.code(201).send({
        cart_id: cartId,
        session_id: sessionId
      });
      
    } catch (err: any) {
      app.log.error(err, 'Failed to create cart');
      return reply.code(500).send({ error: 'failed_to_create_cart' });
    }
  });
  
  // GET /public/cart/:session_id - Get cart contents
  app.get('/public/cart/:session_id', async (req, reply) => {
    const params = z.object({
      session_id: z.string().uuid()
    }).parse(req.params);
    
    try {
      const cart = cartStorage.get(params.session_id);
      
      if (!cart) {
        return reply.code(404).send({ error: 'cart_not_found' });
      }
      
      // Calculate totals
      const subtotal = cart.items.reduce((sum: number, item: any) => sum + item.total, 0);
      const tax = subtotal * 0.08; // 8% tax
      const total = subtotal + tax;
      
      return reply.send({
        session: {
          session_id: cart.session_id,
          tenant_id: cart.tenant_id,
          table_id: cart.table_id,
          order_type: cart.order_type,
          created_at: cart.created_at
        },
        items: cart.items,
        totals: { subtotal, tax, total }
      });
      
    } catch (err: any) {
      app.log.error(err, 'Failed to get cart');
      return reply.code(500).send({ error: 'failed_to_get_cart' });
    }
  });
  
  // POST /public/orders/checkout - Convert cart to order
  app.post('/public/orders/checkout', async (req, reply) => {
    const body = CheckoutSchema.parse(req.body);
    
    try {
      const cart = cartStorage.get(body.session_id);
      
      if (!cart) {
        return reply.code(404).send({ error: 'cart_not_found' });
      }
      
      if (!cart.items || cart.items.length === 0) {
        return reply.code(400).send({ error: 'cart_empty' });
      }
      
      // Calculate totals
      const subtotal = cart.items.reduce((sum: number, item: any) => sum + item.total, 0);
      const tax = subtotal * 0.08;
      const total = subtotal + tax;
      
      // Generate order number
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
      
      // Create order
      const { data: order, error: orderError } = await app.supabase
        .from('orders')
        .insert({
          tenant_id: cart.tenant_id,
          table_id: cart.table_id,
          order_number: orderNumber,
          order_type: cart.order_type,
          status: 'pending',
          subtotal: subtotal,
          tax_amount: tax,
          total_amount: total,
          mode: cart.order_type,
          session_id: body.session_id
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
        total_price: item.total,
        tenant_id: cart.tenant_id
      }));
      
      const { error: itemsError } = await app.supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      // Clear cart from memory
      cartStorage.delete(body.session_id);
      
      app.log.info(`Order created: ${orderNumber} for tenant ${cart.tenant_id}`);
      
      return reply.code(201).send({
        order_id: order.id,
        order_number: orderNumber,
        status: order.status,
        total_amount: order.total_amount
      });
      
    } catch (err: any) {
      app.log.error(err, 'Failed to checkout cart');
      return reply.code(500).send({ error: 'failed_to_checkout' });
    }
  });
}