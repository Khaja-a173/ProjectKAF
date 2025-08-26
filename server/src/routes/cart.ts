import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const CreateSessionSchema = z.object({
  tenant_id: z.string().uuid(),
  table_id: z.string().uuid().optional(),
  mode: z.enum(['dine_in', 'takeaway']),
  customer_name: z.string().optional(),
  party_size: z.number().int().positive().default(2)
});

const AddItemSchema = z.object({
  session_id: z.string().uuid(),
  menu_item_id: z.string().uuid(),
  qty: z.number().int().positive(),
  notes: z.string().optional()
});

const UpdateItemSchema = z.object({
  qty: z.number().int().positive().optional(),
  notes: z.string().optional()
});

export default async function cartRoutes(app: FastifyInstance) {
  // POST /cart/session - Create cart session
  app.post('/cart/session', async (req, reply) => {
    const body = CreateSessionSchema.parse(req.body);
    
    try {
      // Verify tenant exists
      const { data: tenant, error: tenantError } = await app.supabase
        .from('tenants')
        .select('id, name')
        .eq('id', body.tenant_id)
        .single();
      
      if (tenantError || !tenant) {
        return reply.code(404).send({ error: 'tenant_not_found' });
      }
      
      // Create cart session
      const { data: session, error: sessionError } = await app.supabase
        .from('cart_sessions')
        .insert({
          tenant_id: body.tenant_id,
          table_id: body.table_id,
          mode: body.mode,
          customer_name: body.customer_name,
          party_size: body.party_size,
          status: 'active'
        })
        .select()
        .single();
      
      if (sessionError) throw sessionError;
      
      return reply.code(201).send({
        session,
        items: [],
        totals: { subtotal: 0, tax: 0, total: 0 }
      });
      
    } catch (err: any) {
      app.log.error(err, 'Failed to create cart session');
      return reply.code(500).send({ error: 'failed_to_create_session' });
    }
  });
  
  // GET /cart/session/:session_id - Get cart with items
  app.get('/cart/session/:session_id', async (req, reply) => {
    const params = z.object({
      session_id: z.string().uuid()
    }).parse(req.params);
    
    try {
      // Get session
      const { data: session, error: sessionError } = await app.supabase
        .from('cart_sessions')
        .select('*')
        .eq('id', params.session_id)
        .single();
      
      if (sessionError || !session) {
        return reply.code(404).send({ error: 'session_not_found' });
      }
      
      // Get cart items with menu item details
      const { data: items, error: itemsError } = await app.supabase
        .from('cart_items')
        .select(`
          *,
          menu_items (
            id,
            name,
            price,
            image_url
          )
        `)
        .eq('session_id', params.session_id)
        .order('created_at');
      
      if (itemsError) throw itemsError;
      
      // Calculate totals
      const subtotal = (items || []).reduce((sum, item) => {
        const price = item.menu_items?.price || 0;
        return sum + (price * item.qty);
      }, 0);
      
      const tax = subtotal * 0.08; // 8% tax
      const total = subtotal + tax;
      
      return reply.send({
        session,
        items: items || [],
        totals: { subtotal, tax, total }
      });
      
    } catch (err: any) {
      app.log.error(err, 'Failed to get cart session');
      return reply.code(500).send({ error: 'failed_to_get_session' });
    }
  });
  
  // POST /cart/items - Add item to cart
  app.post('/cart/items', async (req, reply) => {
    const body = AddItemSchema.parse(req.body);
    
    try {
      // Verify session exists and is active
      const { data: session, error: sessionError } = await app.supabase
        .from('cart_sessions')
        .select('id, tenant_id, status')
        .eq('id', body.session_id)
        .eq('status', 'active')
        .single();
      
      if (sessionError || !session) {
        return reply.code(404).send({ error: 'session_not_found_or_inactive' });
      }
      
      // Verify menu item exists and belongs to tenant
      const { data: menuItem, error: menuError } = await app.supabase
        .from('menu_items')
        .select('id, name, price, active')
        .eq('id', body.menu_item_id)
        .eq('tenant_id', session.tenant_id)
        .eq('active', true)
        .single();
      
      if (menuError || !menuItem) {
        return reply.code(404).send({ error: 'menu_item_not_found' });
      }
      
      // Check if item already in cart
      const { data: existingItem } = await app.supabase
        .from('cart_items')
        .select('id, qty')
        .eq('session_id', body.session_id)
        .eq('menu_item_id', body.menu_item_id)
        .maybeSingle();
      
      if (existingItem) {
        // Update existing item quantity
        const { data: updatedItem, error: updateError } = await app.supabase
          .from('cart_items')
          .update({
            qty: existingItem.qty + body.qty,
            notes: body.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        
        // Return full cart
        const cartResponse = await fetch(`${req.protocol}://${req.hostname}/cart/session/${body.session_id}`);
        const cart = await cartResponse.json();
        return reply.send(cart);
      } else {
        // Add new item
        const { data: newItem, error: insertError } = await app.supabase
          .from('cart_items')
          .insert({
            session_id: body.session_id,
            menu_item_id: body.menu_item_id,
            qty: body.qty,
            notes: body.notes,
            unit_price: menuItem.price
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        
        // Return full cart
        const cartResponse = await fetch(`${req.protocol}://${req.hostname}/cart/session/${body.session_id}`);
        const cart = await cartResponse.json();
        return reply.send(cart);
      }
      
    } catch (err: any) {
      app.log.error(err, 'Failed to add cart item');
      return reply.code(500).send({ error: 'failed_to_add_item' });
    }
  });
  
  // PATCH /cart/items/:id - Update cart item
  app.patch('/cart/items/:id', async (req, reply) => {
    const params = z.object({
      id: z.string().uuid()
    }).parse(req.params);
    
    const body = UpdateItemSchema.parse(req.body);
    
    try {
      const { data: item, error } = await app.supabase
        .from('cart_items')
        .update({
          ...body,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
        .select('session_id')
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return reply.code(404).send({ error: 'cart_item_not_found' });
        }
        throw error;
      }
      
      // Return full cart
      const cartResponse = await fetch(`${req.protocol}://${req.hostname}/cart/session/${item.session_id}`);
      const cart = await cartResponse.json();
      return reply.send(cart);
      
    } catch (err: any) {
      app.log.error(err, 'Failed to update cart item');
      return reply.code(500).send({ error: 'failed_to_update_item' });
    }
  });
  
  // DELETE /cart/items/:id - Remove cart item
  app.delete('/cart/items/:id', async (req, reply) => {
    const params = z.object({
      id: z.string().uuid()
    }).parse(req.params);
    
    try {
      const { data: item, error } = await app.supabase
        .from('cart_items')
        .delete()
        .eq('id', params.id)
        .select('session_id')
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return reply.code(404).send({ error: 'cart_item_not_found' });
        }
        throw error;
      }
      
      // Return full cart
      const cartResponse = await fetch(`${req.protocol}://${req.hostname}/cart/session/${item.session_id}`);
      const cart = await cartResponse.json();
      return reply.send(cart);
      
    } catch (err: any) {
      app.log.error(err, 'Failed to remove cart item');
      return reply.code(500).send({ error: 'failed_to_remove_item' });
    }
  });
}