import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('No authentication token available');
  }

  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  };
}

async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error('API request failed:', endpoint, err);
    throw err;
  }
}

export async function getSummary(window: string = '7d') {
  return apiRequest(`/analytics/summary?window=${window}`);
}

export async function getRevenue(window: string = '30d', granularity: string = 'day') {
  return apiRequest(`/analytics/revenue?window=${window}&granularity=${granularity}`);
}

export async function getTopItems(window: string = '30d', limit: number = 10) {
  return apiRequest(`/analytics/top-items?window=${window}&limit=${limit}`);
}

export async function getWhoAmI() {
  return apiRequest('/auth/whoami');
}