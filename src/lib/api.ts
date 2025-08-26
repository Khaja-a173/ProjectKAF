// /home/project/src/lib/api.ts
import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

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
  const baseHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
  const authHeader = requireAuth ? await buildAuthHeader() : {};
  const headers = { ...baseHeaders, ...authHeader, ...(options.headers as Record<string, string> | undefined) };

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

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