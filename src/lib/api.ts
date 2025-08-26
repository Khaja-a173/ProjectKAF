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