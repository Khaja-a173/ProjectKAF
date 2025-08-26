import { supabase } from './supabase';

export function subscribeOrders(tenantId: string, handler: (payload: any) => void) {
  return supabase
    .channel('orders-rtc')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'orders', 
      filter: `tenant_id=eq.${tenantId}` 
    }, handler)
    .subscribe();
}

export function subscribeMenuItems(tenantId: string, handler: (payload: any) => void) {
  return supabase
    .channel('menu-rtc')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'menu_items', 
      filter: `tenant_id=eq.${tenantId}` 
    }, handler)
    .subscribe();
}

export function subscribeTables(tenantId: string, handler: (payload: any) => void) {
  return supabase
    .channel('tables-rtc')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'restaurant_tables', 
      filter: `tenant_id=eq.${tenantId}` 
    }, handler)
    .subscribe();
}