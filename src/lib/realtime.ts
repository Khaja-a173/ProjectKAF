import { supabase } from './supabase';

// -----------------------------
// Shared Types
// -----------------------------
export interface RealtimeEvent<T = any> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  new?: T;
  old?: T;
  errors?: any;
}

export interface OrdersSubscriptionOptions {
  tenantId: string;
  onInsert?: (event: RealtimeEvent) => void;
  onUpdate?: (event: RealtimeEvent) => void;
  onDelete?: (event: RealtimeEvent) => void;
}

export interface OrderStatusEventsSubscriptionOptions {
  tenantId: string;
  onInsert?: (event: RealtimeEvent) => void;
}

export interface PaymentIntentsSubscriptionOptions {
  tenantId: string;
  onInsert?: (event: RealtimeEvent) => void;
  onUpdate?: (event: RealtimeEvent) => void;
}

// -----------------------------
// Safe callback wrapper
// -----------------------------
const safeCallback = (callback?: (event: RealtimeEvent) => void) => {
  return (payload: any) => {
    if (!callback) return;
    try {
      const event: RealtimeEvent = {
        eventType: payload.eventType || payload.type || '*',
        new: payload.new,
        old: payload.old,
        errors: (payload as any)?.errors
      };
      callback(event);
    } catch (error) {
      console.error('Realtime callback error:', error);
    }
  };
};

// -----------------------------
// BACK-COMPAT SIMPLE SUBSCRIPTIONS (ProjectKAF original API)
// -----------------------------
/**
 * Generic helper to subscribe to a tenant-scoped table.
 * Keeps the existing API shape intact (returns RealtimeChannel),
 * and allows us to add more tables without duplication.
 */
export function subscribeGeneric(
  table: string,
  tenantId: string,
  handler: (payload: any) => void,
  channelPrefix: string = table
) {
  return supabase
    .channel(`${channelPrefix}-rtc:${tenantId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table, filter: `tenant_id=eq.${tenantId}` },
      handler
    )
    .subscribe();
}

// For external callers that expect an unsubscribe signature
export type RealtimeUnsubscribe = () => void;

export function subscribeOrders(tenantId: string, handler: (payload: any) => void) {
  return supabase
    .channel(`orders-rtc:${tenantId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders', filter: `tenant_id=eq.${tenantId}` },
      handler
    )
    .subscribe();
}

export function subscribeMenuItems(tenantId: string, handler: (payload: any) => void) {
  return supabase
    .channel(`menu-rtc:${tenantId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'menu_items', filter: `tenant_id=eq.${tenantId}` },
      handler
    )
    .subscribe();
}

export function subscribeTables(tenantId: string, handler: (payload: any) => void) {
  return supabase
    .channel(`tables-rtc:${tenantId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'restaurant_tables', filter: `tenant_id=eq.${tenantId}` },
      handler
    )
    .subscribe();
}

/**
 * Live updates for reservations (floor / booking flows)
 * Table name assumed: 'reservations'
 */
export function subscribeReservations(tenantId: string, handler: (payload: any) => void) {
  return subscribeGeneric('reservations', tenantId, handler, 'reservations');
}

/**
 * Live updates for active table sessions (seat/occupancy UI)
 * Table name assumed: 'table_sessions'
 */
export function subscribeTableSessions(tenantId: string, handler: (payload: any) => void) {
  return subscribeGeneric('table_sessions', tenantId, handler, 'table-sessions');
}

/**
 * Live updates for per-tenant branding/customization
 * Table name assumed: 'customizations'
 */
export function subscribeCustomizations(tenantId: string, handler: (payload: any) => void) {
  return subscribeGeneric('customizations', tenantId, handler, 'customizations');
}

/**
 * Live updates for staff roster/roles
 * Table name assumed: 'staff'
 */
export function subscribeStaff(tenantId: string, handler: (payload: any) => void) {
  return subscribeGeneric('staff', tenantId, handler, 'staff');
}

/**
 * Live updates for payment provider toggles/config
 * Table name assumed: 'payment_providers'
 */
export function subscribePaymentProviders(tenantId: string, handler: (payload: any) => void) {
  return subscribeGeneric('payment_providers', tenantId, handler, 'payment-providers');
}

// -----------------------------
// ADVANCED / OPTIONS-BASED SUBSCRIPTIONS (Part2 compatible)
// -----------------------------
// Returns an unsubscribe function (same as Part2)
export const subscribeOrdersDetailed = (options: OrdersSubscriptionOptions): (() => void) => {
  const { tenantId, onInsert, onUpdate, onDelete } = options;
  const channel = supabase
    .channel(`orders:tenant:${tenantId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'orders', filter: `tenant_id=eq.${tenantId}` },
      safeCallback(onInsert)
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'orders', filter: `tenant_id=eq.${tenantId}` },
      safeCallback(onUpdate)
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'orders', filter: `tenant_id=eq.${tenantId}` },
      safeCallback(onDelete)
    )
    .subscribe();

  return () => {
    try { supabase.removeChannel(channel); } catch (err) { console.error('orders unsubscribe error:', err); }
  };
};

export const subscribeOrderStatusEvents = (options: OrderStatusEventsSubscriptionOptions): (() => void) => {
  const { tenantId, onInsert } = options;
  const channel = supabase
    .channel(`order_status_events:tenant:${tenantId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'order_status_events', filter: `tenant_id=eq.${tenantId}` },
      safeCallback(onInsert)
    )
    .subscribe();

  return () => {
    try { supabase.removeChannel(channel); } catch (err) { console.error('order_status_events unsubscribe error:', err); }
  };
};

export const subscribePaymentIntents = (options: PaymentIntentsSubscriptionOptions): (() => void) => {
  const { tenantId, onInsert, onUpdate } = options;
  const channel = supabase
    .channel(`payment_intents:tenant:${tenantId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'payment_intents', filter: `tenant_id=eq.${tenantId}` },
      safeCallback(onInsert)
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'payment_intents', filter: `tenant_id=eq.${tenantId}` },
      safeCallback(onUpdate)
    )
    .subscribe();

  return () => {
    try { supabase.removeChannel(channel); } catch (err) { console.error('payment_intents unsubscribe error:', err); }
  };
};

// -----------------------------
// Debounced utility + Manager (frontend-safe typings)
// -----------------------------
export const createDebouncedCallback = (callback: () => void, delay: number = 300): (() => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      try { callback(); } catch (error) { console.error('Debounced callback error:', error); }
    }, delay);
  };
};

export class RealtimeManager {
  private subscriptions: (() => void)[] = [];
  private debouncedCallbacks: Map<string, () => void> = new Map();

  addSubscription(subscription: () => void): void {
    this.subscriptions.push(subscription);
  }

  createDebounced(key: string, callback: () => void, delay: number = 300): () => void {
    const debouncedFn = createDebouncedCallback(callback, delay);
    this.debouncedCallbacks.set(key, debouncedFn);
    return debouncedFn;
  }

  getDebounced(key: string): (() => void) | undefined {
    return this.debouncedCallbacks.get(key);
  }

  cleanup(): void {
    this.subscriptions.forEach(unsub => {
      try { unsub(); } catch (error) { console.error('Error during subscription cleanup:', error); }
    });
    this.subscriptions = [];
    this.debouncedCallbacks.clear();
  }
}

/**
 * Convenience utility to wire multiple realtime feeds used on dashboards.
 * Usage (example):
 *   const cleanup = wireDashboardRealtime(tenantId, {
 *     onOrders: (e) => refreshOrders(),
 *     onTables: (e) => refreshTables(),
 *     onSessions: (e) => refreshSessions(),
 *     onReservations: (e) => refreshReservations(),
 *   });
 *   // later: cleanup();
 */
export function wireDashboardRealtime(tenantId: string, handlers: {
  onOrders?: (event: RealtimeEvent) => void;
  onTables?: (event: RealtimeEvent) => void;
  onSessions?: (event: RealtimeEvent) => void;
  onReservations?: (event: RealtimeEvent) => void;
  onCustomization?: (event: RealtimeEvent) => void;
  onStaff?: (event: RealtimeEvent) => void;
  onPaymentProviders?: (event: RealtimeEvent) => void;
}): () => void {
  const subs: any[] = [];

  if (handlers.onOrders) {
    subs.push(
      subscribeOrders(tenantId, safeCallback(handlers.onOrders))
    );
  }
  if (handlers.onTables) {
    subs.push(
      subscribeTables(tenantId, safeCallback(handlers.onTables))
    );
  }
  if (handlers.onSessions) {
    subs.push(
      subscribeTableSessions(tenantId, safeCallback(handlers.onSessions))
    );
  }
  if (handlers.onReservations) {
    subs.push(
      subscribeReservations(tenantId, safeCallback(handlers.onReservations))
    );
  }
  if (handlers.onCustomization) {
    subs.push(
      subscribeCustomizations(tenantId, safeCallback(handlers.onCustomization))
    );
  }
  if (handlers.onStaff) {
    subs.push(
      subscribeStaff(tenantId, safeCallback(handlers.onStaff))
    );
  }
  if (handlers.onPaymentProviders) {
    subs.push(
      subscribePaymentProviders(tenantId, safeCallback(handlers.onPaymentProviders))
    );
  }

  // Return a single cleanup
  return () => {
    try {
      subs.forEach((ch) => {
        try { supabase.removeChannel(ch); } catch (e) { /* no-op */ }
      });
    } catch (err) {
      console.error('wireDashboardRealtime cleanup error:', err);
    }
  };
}