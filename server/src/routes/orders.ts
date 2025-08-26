// /home/project/src/lib/api.ts
import { supabase } from './supabase';

const API_BASE = '/api';
// small helper to join safely
const join = (base: string, path: string) => `${base}${path.startsWith('/') ? path : `/${path}`}`;

async function waitForSessionToken(timeoutMs = 3000): Promise<string | null> {
  const start = Date.now();
  // try immediate
  let { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) return session.access_token;

  // subscribe and wait until a token arrives or timeout
  return await new Promise((resolve) => {
    const { data: sub } = supabase.auth.onAuthStateChange(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        sub.subscription?.unsubscribe();
        resolve(session.access_token);
      } else if (Date.now() - start > timeoutMs) {
        sub.subscription?.unsubscribe();
        resolve(null);
      }
    });
    // hard timeout fallback
    setTimeout(async () => {
      sub.subscription?.unsubscribe();
      const { data: { session } } = await supabase.auth.getSession();
      resolve(session?.access_token ?? null);
    }, timeoutMs);
  });
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  // First, try immediate session
  let { data: { session } } = await supabase.auth.getSession();
  let token = session?.access_token;

  // If not ready yet, wait briefly
  if (!token) token = await waitForSessionToken(3000);
  if (!token) throw new Error('No authentication token available');

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

async function buildAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }
  return {};
}

async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  { requireAuth = true }: { requireAuth?: boolean } = {}
): Promise<any> {
  let headers: Record<string, string>;
  
  if (requireAuth) {
    headers = { ...(await getAuthHeaders()), ...(options.headers as Record<string, string> | undefined) };
  } else {
    headers = { 'Content-Type': 'application/json', ...(options.headers as Record<string, string> | undefined) };
  }

  const res = await fetch(join(API_BASE, endpoint), { ...options, headers });

  // Try to parse JSON either way for better errors
  const tryJson = async () => {
    try { return await res.json(); } catch { return null; }
  };

  if (!res.ok) {
    const body = await tryJson();
    const msg = (body && (body.error || body.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  const data = await tryJson();
  return data;
}

/** Analytics APIs */
export function getSummary(window = '7d') {
  return apiRequest(`/analytics/summary?window=${encodeURIComponent(window)}`);
}

export function getRevenue(window = '30d', granularity = 'day') {
  return apiRequest(`/analytics/revenue?window=${encodeURIComponent(window)}&granularity=${encodeURIComponent(granularity)}`);
}

export function getTopItems(window = '30d', limit = 10) {
  return apiRequest(`/analytics/top-items?window=${encodeURIComponent(window)}&limit=${limit}`);
}

/** Auth – whoami should NOT require a token (lets UI show logged-out state cleanly) */
export function getWhoAmI() {
  return apiRequest('/auth/whoami', {}, { requireAuth: false });
}

/** Orders APIs */
export function getOrders(params?: { status?: string; since?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.since) searchParams.set('since', params.since);
  const query = searchParams.toString();
  return apiRequest(`/orders${query ? `?${query}` : ''}`);
}

export function createOrder(data: any) {
  return apiRequest('/orders', { method: 'POST', body: JSON.stringify(data) });
}

export function updateOrder(id: string, data: any) {
  return apiRequest(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function cancelOrder(id: string) {
  return apiRequest(`/orders/${id}`, { method: 'DELETE' });
}

/** Menu APIs */
export function getMenuCategories() {
  return apiRequest('/menu/categories');
}

export function createMenuCategory(data: any) {
  return apiRequest('/menu/categories', { method: 'POST', body: JSON.stringify(data) });
}

export function getMenuItems(params?: { category_id?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.category_id) searchParams.set('category_id', params.category_id);
  const query = searchParams.toString();
  return apiRequest(`/menu/items${query ? `?${query}` : ''}`);
}

export function createMenuItem(data: any) {
  return apiRequest('/menu/items', { method: 'POST', body: JSON.stringify(data) });
}

export function updateMenuItem(id: string, data: any) {
  return apiRequest(`/menu/items/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function bulkImportMenuItems(csv: string) {
  return apiRequest('/menu/items:bulk', { method: 'POST', body: JSON.stringify({ csv }) });
}

/** Tables APIs */
export function getTables() {
  return apiRequest('/tables');
}

export function lockTable(id: string, isLocked: boolean) {
  return apiRequest(`/tables/${id}/lock`, { method: 'PATCH', body: JSON.stringify({ is_locked: isLocked }) });
}

/** Staff APIs */
export function getStaff() {
  return apiRequest('/staff');
}

export function addStaff(data: any) {
  return apiRequest('/staff', { method: 'POST', body: JSON.stringify(data) });
}

export function removeStaff(userId: string) {
  return apiRequest(`/staff/${userId}`, { method: 'DELETE' });
}

export function getShifts() {
  return apiRequest('/staff/shifts');
}

/** KDS APIs */
export function getKdsOrders(state?: string) {
  const query = state ? `?state=${state}` : '';
  return apiRequest(`/kds/orders${query}`);
}

export function updateKitchenState(orderId: string, kitchenState: string) {
  return apiRequest(`/kds/orders/${orderId}/state`, { 
    method: 'PATCH', 
    body: JSON.stringify({ kitchen_state: kitchenState }) 
  });
}

/** Branding APIs */
export function getBranding() {
  return apiRequest('/branding');
}

export function updateBranding(data: any) {
  return apiRequest('/branding', { method: 'PATCH', body: JSON.stringify(data) });
}

/** Payment APIs */
export function getPaymentProviders() {
  return apiRequest('/payments/providers');
}

export function createPaymentProvider(data: any) {
  return apiRequest('/payments/providers', { method: 'POST', body: JSON.stringify(data) });
}

export function updatePaymentProvider(id: string, data: any) {
  return apiRequest(`/payments/providers/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function listPaymentIntents(filters?: { order_id?: string; status?: string; limit?: number; page?: number }) {
  const searchParams = new URLSearchParams();
  if (filters?.order_id) searchParams.set('order_id', filters.order_id);
  if (filters?.status) searchParams.set('status', filters.status);
  if (filters?.limit) searchParams.set('limit', filters.limit.toString());
  if (filters?.page) searchParams.set('page', filters.page.toString());
  const query = searchParams.toString();
  return apiRequest(`/payments/intents${query ? `?${query}` : ''}`);
}

export function createPaymentIntent(data: any) {
  return apiRequest('/payments/intents', { method: 'POST', body: JSON.stringify(data) });
}

export function updatePaymentIntent(id: string, data: any) {
  return apiRequest(`/payments/intents/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function listPaymentEvents() {
  return apiRequest('/payments/events');
}

/** QR & Cart APIs (Public) */
export function resolveQR(code: string, table: string, sig: string, exp: number) {
  return apiRequest(`/qr/resolve?code=${code}&table=${table}&sig=${sig}&exp=${exp}`, {}, { requireAuth: false });
}

export function createCartSession(data: any) {
  return apiRequest('/cart/session', { method: 'POST', body: JSON.stringify(data) }, { requireAuth: false });
}

export function getCart(sessionId: string) {
  return apiRequest(`/cart/session/${sessionId}`, {}, { requireAuth: false });
}

export function addCartItem(data: any) {
  return apiRequest('/cart/items', { method: 'POST', body: JSON.stringify(data) }, { requireAuth: false });
}

export function updateCartItem(id: string, data: any) {
  return apiRequest(`/cart/items/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, { requireAuth: false });
}

export function removeCartItem(id: string) {
  return apiRequest(`/cart/items/${id}`, { method: 'DELETE' }, { requireAuth: false });
}

export function placeOrderFromCart(data: any) {
      }
      
      if (!session.cart_items || session.cart_items.length === 0) {
        return reply.code(400).send({ error: 'cart_is_empty' });
      }
      
      // Calculate totals
      const subtotal = session.cart_items.reduce((sum: number, item: any) => {
        const price = item.menu_items?.price || 0;
        return sum + (price * item.qty);
      }, 0);
      
      const taxAmount = subtotal * 0.08; // 8% tax
      const totalAmount = subtotal + taxAmount;
      
      // Generate order number
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
      
      // Create order
      const { data: order, error: orderError } = await app.supabase
        .from('orders')
        .insert({
          tenant_id: session.tenant_id,
          table_id: session.table_id,
          staff_id: body.assigned_staff_id,
          order_number: orderNumber,
          order_type: session.mode === 'dine_in' ? 'dine_in' : 'takeaway',
          status: 'pending',
          subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          session_id: session.id
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Create order items
      const orderItems = session.cart_items.map((item: any) => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.qty,
        unit_price: item.menu_items?.price || 0,
        total_price: (item.menu_items?.price || 0) * item.qty,
        special_instructions: item.notes,
        tenant_id: session.tenant_id
      }));
      
      const { error: itemsError } = await app.supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      // Create status event
      await app.supabase
        .from('order_status_events')
        .insert({
          tenant_id: session.tenant_id,
          order_id: order.id,
          status: 'pending',
          created_by: body.assigned_staff_id || 'customer'
        });
      
      // Mark cart session as completed
      await app.supabase
        .from('cart_sessions')
        .update({ status: 'completed' })
        .eq('id', body.session_id);
      
      // If dine_in, optionally mark table as occupied
      if (session.mode === 'dine_in' && session.table_id) {
        await app.supabase
          .from('restaurant_tables')
          .update({ status: 'occupied' })
          .eq('id', session.table_id);
      }
      
      return reply.code(201).send({
        order: {
          id: order.id,
          number: order.order_number,
          status: order.status,
          totals: {
            subtotal,
            tax: taxAmount,
            total: totalAmount
          }
        }
      });
      
    } catch (err: any) {
      app.log.error(err, 'Failed to place order from cart');
      return reply.code(500).send({ error: 'failed_to_place_order' });
    }
  });

  // POST /orders/:id/assign - Assign staff to order
  app.post('/orders/:id/assign', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const params = z.object({
      id: z.string().uuid()
    }).parse(req.params);

    const body = AssignStaffSchema.parse(req.body);
    const tenantId = req.auth?.primaryTenantId;

    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      // Verify staff belongs to tenant
      const { data: staff, error: staffError } = await app.supabase
        .from('staff')
        .select('id, user_id')
        .eq('user_id', body.staff_user_id)
        .eq('tenant_id', tenantId)
        .single();

      if (staffError || !staff) {
        return reply.code(404).send({ error: 'staff_not_found' });
      }

      // Update order with assigned staff
      const { data: order, error: updateError } = await app.supabase
        .from('orders')
        .update({ staff_id: body.staff_user_id })
        .eq('id', params.id)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (updateError) {
        if (updateError.code === 'PGRST116') {
          return reply.code(404).send({ error: 'order_not_found' });
        }
        throw updateError;
      }

      return reply.send({ order });

    } catch (err: any) {
      app.log.error(err, 'Failed to assign staff to order');
      return reply.code(500).send({ error: 'failed_to_assign_staff' });
    }
  });