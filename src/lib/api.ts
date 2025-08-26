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