
import { supabase } from "@/lib/supabase";
const DEV_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

// ======================
// Billing (Checkout & Customer Portal)
// ======================

/**
 * Create a Stripe Checkout session for a given tenant and plan code.
 * Returns: { url: string }
 */
export async function createCheckoutSession(tenantId: string, planCode: string): Promise<{ url: string }> {
  const id = requireTenantId(tenantId);
  return request<{ url: string }>('/api/billing/checkout', {
    method: 'POST',
    headers: tenantHeaders(id),
    body: { tenant_id: id, plan_code: planCode },
  });
}

/**
 * Create a Stripe Customer Portal session for a given tenant.
 * Returns: { url: string }
 */
export async function createCustomerPortalSession(tenantId: string): Promise<{ url: string }> {
  const id = requireTenantId(tenantId);
  return request<{ url: string }>('/api/billing/portal', {
    method: 'POST',
    headers: tenantHeaders(id),
    body: { tenant_id: id },
  });
}
// --- UUID helpers ---
const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function generateUuidV4(): string {
  try {
    if (globalThis.crypto && typeof (globalThis.crypto as any).randomUUID === 'function') {
      return (globalThis.crypto as any).randomUUID();
    }
  } catch {}
  // Fallback: RFC4122 v4-ish generator
  // eslint-disable-next-line no-bitwise
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
// (supabase already imported above)
/**
 * Unified API fetch wrapper that routes relative URLs through API_BASE and attaches auth/tenant headers.
 * Ensures Authorization + X-Tenant-Id are attached and avoids accidental calls to the Vite dev server on port 5173.
 */
export async function apiFetch<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const base = API_BASE.replace(/\/+$/, '');
  const isAbsolute = /^https?:\/\//i.test(url);
  const usesApiBase = isAbsolute && url.startsWith(base + '/');

  // For relative URLs or absolute URLs that already point at our API base,
  // delegate to the `request` helper so auth + tenant headers are attached automatically.
  if (!isAbsolute || usesApiBase) {
    const path = usesApiBase ? url.slice(base.length) : (url.startsWith('/') ? url : `/${url}`);
    return request<T>(path, {
      method: (options.method as HttpMethod) || 'GET',
      headers: options.headers as Record<string, string>,
      body: options.body as any,
      signal: options.signal as AbortSignal,
      keepalive: (options as any).keepalive as boolean | undefined,
    });
  }

  // Foreign hosts: fall back to strict JSON fetch
  return getJSON<T>(url, options);
}
/* ======================
   Table Session Hold/Promote/Release (Enhanced Table Booking)
====================== */

/**
 * Place a temporary hold on a table for the current session.
 * Accepts a table UUID (preferred) or a human code like "T01".
 * Always POSTs to /api/tables/hold with X-Tenant-Id header.
 * Handles both UUID and human-readable codes properly.
 */
export async function createTableHold(
  tenantId: string,
  tableIdOrCode: string
): Promise<DiningTable> {
  const id = requireTenantId(tenantId);
  // UUID v4 regex
  const looksLikeUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tableIdOrCode);
  const body = looksLikeUuid
    ? { table_id: tableIdOrCode }
    : { table_code: tableIdOrCode };
  return request<DiningTable>('/api/tables/hold', {
    method: 'POST',
    headers: tenantHeaders(id),
    body,
  });
}

/**
 * Promote a held table to occupied (e.g., when order starts).
 * POST /api/tables/promote
 * Requires X-Tenant-Id header.
 * Returns updated DiningTable object.
 */
export async function promoteTableHold(tenantId: string, tableId: UUID): Promise<DiningTable> {
  const id = requireTenantId(tenantId);
  return request<DiningTable>(
    '/api/tables/promote',
    {
      method: 'POST',
      headers: tenantHeaders(id),
      body: { table_id: tableId },
    }
  );
}

/**
 * Release a table back to available after payment/feedback.
 * POST /api/tables/release
 * Requires X-Tenant-Id header.
 * Returns updated DiningTable object.
 */
export async function releaseTable(tenantId: string, tableId: UUID): Promise<DiningTable> {
  const id = requireTenantId(tenantId);
  return request<DiningTable>(
    '/api/tables/release',
    {
      method: 'POST',
      headers: tenantHeaders(id),
      body: { table_id: tableId },
    }
  );
}
/* src/lib/api.ts
   Unified frontend API client for ProjectKAF (Vite).
   - Uses VITE_API_URL for the Fastify backend base URL
   - Exposes minimal, stable functions required by current pages
   - Handles auth bearer & optional tenant header
*/

/* Resolve backend base URL robustly (avoid accidental 5173 fetches) */

  function sanitizeBase(base: string): string {
    if (!base) return "";
    base = base.trim().replace(/\/+$/g, ""); // strip trailing slashes
    if (/localhost:5173/.test(base)) {
      console.warn("[api] VITE_API_URL points at 5173 (frontend). Forcing 8090.");
      return "http://localhost:8090";
    }
    return base;
  }

  const RAW_BASE =
    (typeof import.meta !== "undefined" &&
      ((import.meta.env?.VITE_API_BASE as string) ||
        (import.meta.env?.VITE_API_URL as string))) ||
    "";

  /** Final backend base. Never returns trailing slash. Never 5173. */
  export const API_BASE: string = sanitizeBase(RAW_BASE) || "http://localhost:8090";

  if (typeof window !== "undefined") {
    (window as any).__API_BASE__ = API_BASE;
    console.info("[api] API_BASE resolved to", API_BASE);
  }

  function resolveTenantId(init?: RequestInit & { tenantId?: string }): string | undefined {
    const hdr =
      (init?.headers as any)?.["X-Tenant-Id"] ||
      (init?.headers as any)?.["x-tenant-id"];
    if (typeof hdr === "string" && hdr) return hdr;

    if (init && "tenantId" in init && (init as any).tenantId) {
      return (init as any).tenantId;
    }

    try {
      const keys = [
        "pkaf:activeTenantId",
        "activeTenantId",
        "pkaf:tenantId",
        "tenantId",
      ];
      for (const k of keys) {
        const v = localStorage.getItem(k);
        if (v) return v;
      }
    } catch {}
    return undefined;
  }

  async function getAuthHeaders() {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    return token
      ? { Authorization: `Bearer ${token}`, "x-supabase-auth": token }
      : {};
  }

    // optional: expose in devtools
    if (typeof window !== "undefined") {
      (window as any).__API_BASE__ = API_BASE;
      console.info("[api] API_BASE =", API_BASE);
    }

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";


let AUTH_TOKEN: string | null = null;
let TENANT_ID: string | null = null;
let USER_ID: string | null = null;

// Persisted tenant/user binding (for anonymous/public flows and cross-tab sync)
const LS_TENANT_KEY = 'kaf.publicTenantId';
const LS_USER_KEY = 'kaf.publicUserId';
// Initialise TENANT_ID from localStorage on load (no React dependency)
if (typeof window !== 'undefined') {
  try {
    const fromLS = window.localStorage.getItem(LS_TENANT_KEY);
    if (fromLS && !TENANT_ID) TENANT_ID = fromLS;
  } catch {}
  try {
    const uid = window.localStorage.getItem(LS_USER_KEY);
    if (uid && !USER_ID) USER_ID = uid;
  } catch {}
  // Keep TENANT_ID in sync if another tab updates localStorage
  window.addEventListener('storage', (e) => {
    if (e.key === LS_TENANT_KEY) {
      TENANT_ID = e.newValue;
    }
    if (e.key === LS_USER_KEY) {
      USER_ID = e.newValue;
    }
  });
  // Optional custom event bridge for contexts or non-React callers:
  //   window.dispatchEvent(new CustomEvent('kaf:setTenantId', { detail: '<uuid>' }))
  window.addEventListener('kaf:setTenantId', (e: Event) => {
    try {
      const detail = (e as CustomEvent).detail;
      const next = (detail ?? '') as string;
      TENANT_ID = next || '';
      try { window.localStorage.setItem(LS_TENANT_KEY, TENANT_ID); } catch {}
    } catch {}
  });
  window.addEventListener('kaf:setUserId', (e: Event) => {
    try {
      const detail = (e as CustomEvent).detail;
      const next = (detail ?? '') as string;
      USER_ID = next || '';
      try { window.localStorage.setItem(LS_USER_KEY, USER_ID); } catch {}
    } catch {}
  });
}

/** Programmatic binder: call from TenantContext whenever tenant changes. */
export function syncTenantId(tenantId: string | null | undefined) {
  TENANT_ID = tenantId || '';
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LS_TENANT_KEY, TENANT_ID);
    }
  } catch {}
}

/** Read-only accessor (avoids leaking internal mutable var). */
export function getTenantId(): string {
  return TENANT_ID || '';
}

export function setAuthToken(token: string | null) {
  AUTH_TOKEN = token;
}

export function clearAuthToken() {
  AUTH_TOKEN = null;
}

export function setTenantId(tenantId: string | null) {
  TENANT_ID = tenantId;
}

/** Programmatic binder: call from AuthContext whenever user changes. */
export function syncUserId(userId: string | null | undefined) {
  const next = (userId || '').trim();
  USER_ID = UUID_V4_RE.test(next) ? next : generateUuidV4();
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LS_USER_KEY, USER_ID);
    }
  } catch {}
}

/** Read-only accessor */
export function getUserId(): string {
  return USER_ID || '';
}

/** Ensure there is a stable public user id (no auth required). */
function ensureUserIdInternal(): string {
  if (USER_ID && USER_ID.trim()) {
    if (!UUID_V4_RE.test(USER_ID)) {
      USER_ID = generateUuidV4();
      try { if (typeof window !== 'undefined') window.localStorage.setItem(LS_USER_KEY, USER_ID); } catch {}
    }
    return USER_ID;
  }
  try {
    const fromLS =
      (typeof window !== 'undefined' && window.localStorage.getItem(LS_USER_KEY)) ||
      (typeof window !== 'undefined' && window.localStorage.getItem('user_id')) ||
      '';
    if (fromLS && fromLS.trim()) {
      USER_ID = UUID_V4_RE.test(fromLS) ? fromLS : generateUuidV4();
      try { if (typeof window !== 'undefined') window.localStorage.setItem(LS_USER_KEY, USER_ID); } catch {}
      return USER_ID;
    }
  } catch {}
  USER_ID = generateUuidV4();
  try { if (typeof window !== 'undefined') window.localStorage.setItem(LS_USER_KEY, USER_ID); } catch {}
  return USER_ID;
}

export function setUserId(userId: string | null) {
  const next = (userId || '').trim();
  USER_ID = UUID_V4_RE.test(next) ? next : generateUuidV4();
}

export class HttpError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}


function tenantHeaders(tenantId?: string) {
  const id = tenantId || TENANT_ID || DEV_TENANT_ID || '';
  const uid = ensureUserIdInternal();
  return {
    ...(id ? { 'X-Tenant-Id': id } : {}),
    ...(uid ? { 'X-User-Id': uid } : {}),
  } as Record<string, string>;
}

function withTenantHeaders(headers: Record<string, string> = {}, tenantId?: string) {
  return { ...tenantHeaders(tenantId), ...headers };
}

// Strict tenant helpers
function requireTenantId(explicit?: string) {
  const id = explicit || TENANT_ID || '';
  if (!id) throw new HttpError(400, 'Tenant ID required for this operation');
  return id;
}

function filterByTenant<T = any>(rows: any[], tenantId: string): T[] {
  if (!Array.isArray(rows)) return [] as unknown as T[];
  return rows.filter((r) => String(r?.tenant_id ?? r?.tenantId ?? r?.tenant) === tenantId) as T[];
}

function buildQuery(q?: Record<string, unknown>) {
  if (!q) return "";
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) v.forEach((vv) => params.append(k, String(vv)));
    else params.append(k, String(v));
  });
  const s = params.toString();
  return s ? `?${s}` : "";
}

async function request<T>(
  path: string,
  options: {
    method?: HttpMethod;
    query?: Record<string, unknown>;
    body?: any;
    headers?: Record<string, string>;
    signal?: AbortSignal;
    keepalive?: boolean;
  } = {}
): Promise<T> {
  const { method = "GET", query, body, headers, signal, keepalive } = options;

  // Ensure path has a single leading slash
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE.replace(/\/+$/, "")}${cleanPath}${buildQuery(query)}`;
  if (typeof window !== "undefined" && (window as any).__DEV_API_LOGS__) {
    // optional debug flag: window.__DEV_API_LOGS__ = true
    console.debug("[api] request", method, url, { query, body: body && typeof body === "object" ? { ...body, _redacted: true } : body });
  }
  // Attempt to fetch Supabase access token (non-fatal if unavailable)
  let accessToken: string | null = null;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    accessToken = sessionData?.session?.access_token ?? null;
  } catch {}
  const token = AUTH_TOKEN || accessToken;
  const baseHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(getTenantId() ? { 'X-Tenant-Id': getTenantId() } : {}),
    ...(getUserId() ? { 'X-User-Id': getUserId() } : {}),
    ...(token ? { Authorization: `Bearer ${token}`, 'x-supabase-auth': token } : {}),
  };

  let fetchBody: BodyInit | undefined;
  if (body instanceof FormData) {
    fetchBody = body; // browser sets boundary
  } else if (body !== undefined) {
    baseHeaders["Content-Type"] = "application/json";
    fetchBody = JSON.stringify(body);
  }

  const res = await fetch(url, {
    method,
    headers: { ...baseHeaders, ...(headers || {}) },
    body: fetchBody,
    signal,
    credentials: "include",
    keepalive,
  });

  // No content
  if (res.status === 204) return undefined as unknown as T;

  const ctype = res.headers.get('content-type') || '';
  const rawText = await res.text().catch(() => '');

  // Enforce JSON to avoid HTML (e.g., Vite dev server 5173) breaking parsing
  if (!ctype.includes("application/json")) {
    const tip =
      url.includes("localhost:5173") || rawText.startsWith("<!doctype")
        ? " — Did the request accidentally hit the Vite dev server? Check VITE_API_URL and that code uses API_BASE (not relative '/api')."
        : "";
    throw new HttpError(
      res.status,
      `[api] Non-JSON response ${res.status} ${res.statusText} from ${url}. Content-Type=${ctype}. Snippet=${rawText.slice(
        0,
        160
      )}${tip}`,
      rawText.slice(0, 500)
    );
  }

  let data: any = null;
  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    throw new HttpError(
      res.status,
      `[api] Failed to parse JSON from ${url}. Snippet=${rawText.slice(0, 160)}`,
      rawText.slice(0, 500)
    );
  }

  // Normalize backend "missing cart" mis-signals to 404 so callers can recover
  if (!res.ok && res.status === 500 && data) {
    const emsg = String((data.error ?? data.message ?? '')).toLowerCase();
    if (emsg.includes('cart_get_failed') || emsg.includes('cart_not_found')) {
      throw new HttpError(404, 'cart_not_found', data);
    }
  }
  if (!res.ok) {
    const msg =
      (data && (data.error || data.message)) ||
      `HTTP ${res.status} ${res.statusText}`;
    throw new HttpError(res.status, msg, data);
  }

  return data as T;
}

async function requestWithFallback<T>(
  paths: string[],
  options: {
    method?: HttpMethod;
    query?: Record<string, unknown>;
    body?: any;
    headers?: Record<string, string>;
    signal?: AbortSignal;
  } = {}
): Promise<T> {
  let lastErr: any;
  for (const p of paths) {
    try {
      return await request<T>(p, options);
    } catch (e) {
      lastErr = e;
      if (e instanceof HttpError && (e.status === 404 || e.status === 405)) {
        // try next path
        continue;
      }
      throw e;
    }
  }
  // If all tried paths failed with 404/405, propagate the last so callers can decide to return []/null
  throw lastErr;
}

/* ======================
   Types (subset needed)
====================== */

export type UUID = string;

/* ---------- Tables (for reservations) ---------- */
export interface DiningTable {
  id: UUID;
  code: string;            // e.g., T01, VIP2
  label?: string | null;   // human-friendly label
  seats: number;
  status?: 'available' | 'held' | 'occupied' | 'cleaning' | 'out-of-service' | string;
  type?: 'standard' | 'window' | 'vip' | 'outdoor' | 'booth' | string;
  notes?: string | null;   // special description to show in popup
  created_at?: string;
  updated_at?: string;
}

// ---------- Zones & Table Management Settings ----------
export type ZoneRow = {
  zone_id: string;
  name: string;
  color: string;
  ord: number;
};

export type TMSettingsRow = {
  hold_minutes: number;
  cleaning_minutes: number;
  allow_transfers: boolean;
  allow_merge_split: boolean;
  require_manager_override: boolean;
};

export interface TableSearchParams {
  date: string;        // YYYY-MM-DD
  time: string;        // HH:mm
  guests: number;
  preference?: string; // type or area hint
}

export type ReceiptChannel = "email" | "sms" | "whatsapp";

export type PaymentProviderName = "stripe" | "razorpay" | "mock";

export interface PaymentProvider {
  id: UUID;
  tenant_id: UUID;
  provider: PaymentProviderName;
  enabled: boolean;
  config: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentIntent {
  id: UUID;
  order_id: UUID;
  provider: PaymentProviderName;
  status:
    | "requires_confirmation"
    | "processing"
    | "succeeded"
    | "failed"
    | "canceled";
  amount: number;
  currency?: string;
  client_secret?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentEvent {
  id: UUID;
  intent_id: UUID;
  type: string; // e.g., 'payment_succeeded'
  payload?: any;
  created_at?: string;
}


function toStableKey(input: any): string {
  try {
    const json = JSON.stringify(input);
    if (typeof btoa === 'function') return btoa(unescape(encodeURIComponent(json))).slice(0, 44);
    return json.slice(0, 64);
  } catch {
    return String(Date.now());
  }
}

function makeIdempotencyKey(op: string, cartId: string, payload: any) {
  return `${op.toLowerCase()}:${cartId}:${toStableKey(payload)}`;
}

/* ======================
   CART (scoped helpers used by Menu page & Checkout)
====================== */

export type CartMode = 'dine_in' | 'takeaway';

export interface CartLine {
  menu_item_id: UUID;
  name?: string;
  price?: number;       // unit price
  qty: number;
  image_url?: string | null;
}

export interface CartSummary {
  cart_id: string;
  tenant_id: string;
  mode: CartMode;
  table_code?: string | null;
  items: CartLine[];
  subtotal: number;
  tax?: number;
  total: number;
  currency?: string;
  created_at?: string;
  updated_at?: string;
}

/* ========================================================================
   MENU MANAGEMENT — CORE (Client + Admin)
   ------------------------------------------------------------------------
   These types & functions are the ONLY ones the Menu and MenuManagement pages
   should import directly. Everything else below is retained for other modules
   (Tables, Zones, Payments, Analytics, etc.) but is NOT required for Menu.
   Keeping them avoids regressions; import from `menuApi` to stay focused.
   ======================================================================== */
/* ======================
   CART API (server: /api/cart/*)
   All calls are tenant-scoped via X-Tenant-Id.
====================== */

// Internal: normalize server {items, totals} responses into CartSummary for callers.
function normalizeCartSummary(
  resp: any,
  context: { tenantId: string; cartId?: string }
): CartSummary {
  if (!resp) {
    // Minimal 204 or empty body: return a harmless placeholder so callers expecting CartSummary don't break.
    return {
      cart_id: String(context.cartId ?? ''),
      tenant_id: String(context.tenantId),
      mode: 'takeaway',
      items: [],
      subtotal: 0,
      total: 0,
    } as CartSummary;
  }
  if (resp && typeof resp === 'object' && ('cart_id' in resp || 'subtotal' in resp || 'total' in resp)) {
    return resp as CartSummary;
  }
  if (resp && typeof resp === 'object' && 'items' in resp && 'totals' in resp) {
    const items = Array.isArray(resp.items) ? resp.items : [];
    const totals = (resp.totals ?? {}) as any;
    return {
      cart_id: String(resp.cart_id ?? context.cartId ?? ''),
      tenant_id: String(resp.tenant_id ?? context.tenantId),
      mode: (resp.mode === 'dine_in' || resp.mode === 'takeaway')
        ? resp.mode
        : (resp.table_code ? 'dine_in' : 'takeaway'),
      table_code: resp.table_code ?? null,
      items: items
        .map((r: any) => ({
          menu_item_id: String(r.menu_item_id ?? r.id ?? ''),
          name: r.name ?? undefined,
          price: r.price != null ? Number(r.price) : undefined,
          qty: Number(r.qty ?? r.quantity ?? 0),
          image_url: r.image_url ?? null,
        }))
        .filter((x: any) => x.qty > 0),
      subtotal: Number(totals.subtotal ?? 0),
      tax: totals.tax != null ? Number(totals.tax) : undefined,
      total: Number(totals.total ?? totals.subtotal ?? 0),
      currency: resp.currency ?? undefined,
      created_at: resp.created_at ?? undefined,
      updated_at: resp.updated_at ?? undefined,
    };
  }
  return resp as CartSummary;
}

/** Start a cart. If tableCode is provided → dine_in, else takeaway. */

export async function cartStart(
  tenantId: string,
  opts?: { tableCode?: string }
): Promise<{ cart_id: string; mode: CartMode; table_code?: string | null }> {
  if (!tenantId) throw new HttpError(400, "Tenant ID required for cart operation");
  ensureUserIdInternal();
  if (!getUserId()) throw new HttpError(401, "User ID required for cart operation");
  const id = requireTenantId(tenantId);
  const body = opts?.tableCode ? { tableCode: opts.tableCode } : {};
  return request(
    '/api/cart/start',
    { method: 'POST', body, headers: tenantHeaders(id) }
  );
}

/** Get a cart snapshot (lines + totals). Normalizes server {items, totals} to CartSummary shape. */
export async function cartGet(
  tenantId: string,
  cartId: string
): Promise<CartSummary> {
  if (!tenantId) throw new HttpError(400, "Tenant ID required for cart operation");
  ensureUserIdInternal();
  if (!getUserId()) throw new HttpError(401, "User ID required for cart operation");
  const id = requireTenantId(tenantId);
  const resp = await request<any>(
    `/api/cart/${encodeURIComponent(cartId)}`,
    {
      method: 'GET',
      headers: tenantHeaders(id),
    }
  );

  // If server already returns a full CartSummary, pass it through.
  if (resp && typeof resp === 'object' && ('cart_id' in resp || 'subtotal' in resp || 'total' in resp)) {
    return resp as CartSummary;
  }

  // Normalize { items, totals } -> CartSummary
  if (resp && typeof resp === 'object' && 'items' in resp && 'totals' in resp) {
    const items = Array.isArray(resp.items) ? resp.items : [];
    const totals = (resp.totals ?? {}) as any;

    return {
      cart_id: String(resp.cart_id ?? cartId),
      tenant_id: String(resp.tenant_id ?? id),
      mode: (resp.mode === 'dine_in' || resp.mode === 'takeaway')
        ? resp.mode
        : (resp.table_code ? 'dine_in' : 'takeaway'),
      table_code: resp.table_code ?? null,
      items: items
      .map((r: any) => ({
        menu_item_id: String(r.menu_item_id ?? r.id ?? ''),
        name: r.name ?? undefined,
        price: r.price != null ? Number(r.price) : undefined,
        qty: Number(r.qty ?? r.quantity ?? 0),
        image_url: r.image_url ?? null,
      }))
      .filter((x: any) => x.qty > 0),
      subtotal: Number(totals.subtotal ?? 0),
      tax: totals.tax != null ? Number(totals.tax) : undefined,
      total: Number(totals.total ?? totals.subtotal ?? 0),
      currency: resp.currency ?? undefined,
      created_at: resp.created_at ?? undefined,
      updated_at: resp.updated_at ?? undefined,
    };
  }

  // Fallback passthrough (typing guard)
  return resp as CartSummary;
}

/**
 * Add items to cart (increment mode).
 * Calls POST /api/cart/items (increment mode) with { cart_id, items }.
 * Keeps tenant headers.
 * Normalizes response to CartSummary.
 */
export async function cartAddItems(
  tenantId: string,
  cartId: string,
  items: Array<{ menu_item_id: string; qty: number }>
): Promise<CartSummary> {
  if (!tenantId) throw new HttpError(400, "Tenant ID required for cart operation");
  ensureUserIdInternal();
  if (!getUserId()) throw new HttpError(401, "User ID required for cart operation");
  const id = requireTenantId(tenantId);
  if (!items?.length) throw new Error('No items to add');
  const resp = await request<any>(
    '/api/cart/items',
    {
      method: 'POST',
      headers: {
        ...tenantHeaders(id),
        'Idempotency-Key': makeIdempotencyKey('add', cartId, items),
        'Prefer': 'return=minimal',
      },
      body: { cart_id: cartId, items },
      keepalive: true,
    }
  );
  const normalized = normalizeCartSummary(resp, { tenantId: id, cartId });
  // Do not force a GET here; caller may reconcile lazily.
  return normalized;
}

/**
 * Set quantity for a specific line (qty 0 removes it).
 * Always calls /api/cart/items/update (set mode) with the bulk shape.
 */
export async function cartUpdateItem(
  tenantId: string,
  cartId: string,
  menuItemId: string,
  qty: number
): Promise<CartSummary> {
  if (!tenantId) throw new HttpError(400, "Tenant ID required for cart operation");
  ensureUserIdInternal();
  if (!getUserId()) throw new HttpError(401, "User ID required for cart operation");
  const id = requireTenantId(tenantId);
  const body = { cart_id: cartId, items: [{ menu_item_id: menuItemId, qty }] };
  const resp = await request<any>('/api/cart/items/update', {
    method: 'POST',
    headers: {
      ...tenantHeaders(id),
      'Idempotency-Key': makeIdempotencyKey('set', cartId, body),
      'Prefer': 'return=minimal',
    },
    body,
    keepalive: true,
  });
  const normalized = normalizeCartSummary(resp, { tenantId: id, cartId });
  return normalized;
}

/**
 * Remove a line item by sending qty:0.
 * Always calls /api/cart/items/update (set mode) with the bulk shape.
 */
export async function cartRemoveItem(
  tenantId: string,
  cartId: string,
  menuItemId: string
): Promise<CartSummary> {
  if (!tenantId) throw new HttpError(400, "Tenant ID required for cart operation");
  ensureUserIdInternal();
  if (!getUserId()) throw new HttpError(401, "User ID required for cart operation");
  const id = requireTenantId(tenantId);
  const resp = await request<any>(
    '/api/cart/items/update',
    {
      method: 'POST',
      headers: {
        ...tenantHeaders(id),
        'Idempotency-Key': makeIdempotencyKey('set', cartId, { cart_id: cartId, items: [{ menu_item_id: menuItemId, qty: 0 }] }),
        'Prefer': 'return=minimal',
      },
      body: { cart_id: cartId, items: [{ menu_item_id: menuItemId, qty: 0 }] },
      keepalive: true,
    }
  );
  const normalized = normalizeCartSummary(resp, { tenantId: id, cartId });
  return normalized;
}

/**
 * Increment multiple items in cart (batch).
 * Calls POST /api/cart/:cartId/items/increment with [{ menu_item_id, qty }].
 */
export async function cartIncrement(
  tenantId: string,
  cartId: string,
  items: Array<{ menu_item_id: string; qty: number }>
): Promise<CartSummary> {
  if (!tenantId) throw new HttpError(400, "Tenant ID required for cart operation");
  ensureUserIdInternal();
  if (!getUserId()) throw new HttpError(401, "User ID required for cart operation");
  const id = requireTenantId(tenantId);
  if (!items?.length) throw new Error("No items to increment");
  try {
    const resp = await request<any>(
      `/api/cart/${encodeURIComponent(cartId)}/items/increment`,
      {
        method: 'POST',
        headers: {
          ...tenantHeaders(id),
          'Idempotency-Key': makeIdempotencyKey('incr', cartId, items),
          'Prefer': 'return=minimal',
        },
        body: items,
        keepalive: true,
      }
    );
    return normalizeCartSummary(resp, { tenantId: id, cartId });
  } catch (e) {
    console.warn('[cartIncrement] non-fatal error (client will reconcile later):', e);
    return normalizeCartSummary(undefined, { tenantId: id, cartId });
  }
}

/** Checkout a cart and create an order */
export async function cartCheckout(
  tenantId: string,
  cartId: string,
  payload?: { notes?: string; customer_name?: string; customerName?: string; table_code?: string; tableCode?: string }
): Promise<{ order_id: string; cart_id: string; status: string; total: number; currency?: string }> {
  if (!tenantId) throw new HttpError(400, "Tenant ID required for cart operation");
  ensureUserIdInternal();
  if (!getUserId()) throw new HttpError(401, "User ID required for cart operation");
  const id = requireTenantId(tenantId);
  const bodyBase: any = { cart_id: cartId, ...(payload || {}) };
  // Normalize optional camelCase keys to snake_case expected by server
  if (payload?.customerName && !bodyBase.customer_name) bodyBase.customer_name = payload.customerName;
  if (payload?.tableCode && !bodyBase.table_code) bodyBase.table_code = payload.tableCode;

  return request(
    '/api/cart/checkout',
    {
      method: 'POST',
      headers: {
        ...tenantHeaders(id),
        'Content-Type': 'application/json'
      },
      body: bodyBase,
    }
  );
}

/** Confirm / place order for this cart. */
export async function cartConfirm(
  tenantId: string,
  cartId: string,
  payload?: { notes?: string }
): Promise<{ order_id: string; order_number: number; status: string; total_amount: number }> {
  if (!tenantId) throw new HttpError(400, "Tenant ID required for cart operation");
  ensureUserIdInternal();
  if (!getUserId()) throw new HttpError(401, "User ID required for cart operation");
  const id = requireTenantId(tenantId);
  return request(
    '/api/orders/confirm',
    { method: 'POST', headers: tenantHeaders(id), body: { cart_id: cartId, ...(payload || {}) } }
  );
}

/* ======================
   Menu (Admin + Client)
====================== */

/* ---------- Table Sessions (lightweight client shape) ---------- */
export interface TableSession {
  id: UUID;
  tenantId?: UUID;
  locationId?: string | null;
  status?: "active" | "closed" | "cancelled" | string;
  mode?: "dine-in" | "take-away" | "delivery" | string | null;
  // Multiple back-end shapes supported:
  tableId?: string | null;     // human code like T01 (client convention)
  table_id?: string | null;    // server snake_case
  tableCode?: string | null;   // explicit code
  table_code?: string | null;  // explicit code (snake)
  created_at?: string;
  updated_at?: string;
}

export interface MenuSection {
  id: UUID;
  tenant_id?: UUID;
  name: string;
  ord?: number | null;
  description?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MenuCategory {
  id: UUID;
  name: string;
  sort_order?: number;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MenuItem {
  id: UUID;
  name: string;
  description?: string | null;
  price: number; // cents or the smallest currency unit your API uses
  currency?: string;
  image_url?: string | null;
  category_id?: UUID | null;
  sort_order?: number | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type MenuItemUpsert = {
  id?: UUID;
  name: string;
  price: number;
  currency?: string;
  description?: string | null;
  image_url?: string | null;
  section_id?: UUID | null;
  sort_order?: number | null;
  is_active?: boolean;
};

/** Resolve section/category names to IDs (tenant-scoped, idempotent). */
export async function resolveMenuRefs(
  tenantId: string,
  payload: {
    sections?: string[];
    categories?: string[];
    options?: { autoCreateMissing?: boolean };
  }
): Promise<{
  sections: Array<{ name: string; id: string; created: boolean }>;
  categories: Array<{ name: string; id: string; created: boolean }>;
}> {
  const id = requireTenantId(tenantId);
  const body = {
    sections: Array.isArray(payload.sections) ? payload.sections.filter(Boolean) : [],
    categories: Array.isArray(payload.categories) ? payload.categories.filter(Boolean) : [],
    options: { autoCreateMissing: payload.options?.autoCreateMissing !== false },
  };
  return request(
    "/api/menu/resolve",
    { method: "POST", body, headers: tenantHeaders(id) }
  );
}

/** Sessions — get active by table code (client expects human code like T01) */
export async function getActiveSessionByTable(tenantId: string, tableCode: string): Promise<TableSession | null> {
  const id = requireTenantId(tenantId);
  try {
    // primary: REST endpoint
    const data = await requestWithFallback<TableSession | { session: TableSession } | null>(
      ["/api/sessions/by-table"],
      { method: "GET", query: { table: tableCode }, headers: tenantHeaders(id) }
    );
    if (!data) return null;
    // Support both raw and wrapped responses
    return (data as any).session ? (data as any).session as TableSession : (data as TableSession);
  } catch (e) {
    if (e instanceof HttpError && (e.status === 404 || e.status === 405)) {
      // Endpoint not available; let caller treat as no active session
      return null;
    }
    throw e;
  }
}

/** Sessions — create or reuse for a table code (idempotent on server) */
export async function createOrReuseSession(
  tenantId: string,
  tableCode: string,
  init?: {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    partySize?: number;
    mode?: "dine-in" | "take-away";
  }
): Promise<TableSession> {
  const id = requireTenantId(tenantId);
  const body = { table: tableCode, ...(init || {}) };
  const data = await requestWithFallback<TableSession | { session: TableSession }>(
    ["/api/sessions/create-or-reuse"],
    { method: "POST", headers: tenantHeaders(id), body }
  );
  return (data as any).session ? (data as any).session as TableSession : (data as TableSession);
}

export function getMenuCategories(tenantId?: string) {
  const id = requireTenantId(tenantId);
  return request<MenuCategory[]>("/api/menu/categories", { headers: tenantHeaders(id) });
}

export function getMenuItems(tenantId: string, params?: { section_id?: UUID; active_only?: boolean }) {
  const id = requireTenantId(tenantId);

  // accept both section_id and sectionId from callers, normalize to sectionId (server expects camelCase)
  const rawSection = (params as any)?.sectionId ?? params?.section_id;

  // UUID v4 check (keep local and minimal)
  const UUID_RE = UUID_V4_RE;
  const hasSection = typeof rawSection === 'string' && rawSection.trim().length > 0;
  const isValid = hasSection && UUID_RE.test(rawSection);

  // If no section specified, or invalid id, avoid hitting the API (non-visual no-op)
  if (!hasSection) {
    return Promise.resolve([] as MenuItem[]);
  }
  if (!isValid) {
    console.warn('[menuApi] Skipping /api/menu/items fetch — invalid sectionId:', rawSection);
    return Promise.resolve([] as MenuItem[]);
  }

  const query = {
    sectionId: rawSection as string,
    ...(typeof (params as any)?.active_only === 'boolean' ? { active_only: !!(params as any).active_only } : {}),
  };

  return request<MenuItem[]>("/api/menu/items", { query, headers: tenantHeaders(id) });
}

/** Items — list for a specific section */
export function getMenuItemsBySection(
  tenantId: string,
  sectionId: UUID,
  activeOnly?: boolean
) {
  const id = requireTenantId(tenantId);

  // UUID v4 check
  const UUID_RE = UUID_V4_RE;
  if (!sectionId || typeof sectionId !== 'string') {
    return Promise.resolve([] as MenuItem[]);
  }
  if (!UUID_RE.test(sectionId)) {
    console.warn('[menuApi] Skipping /api/menu/items fetch — invalid sectionId:', sectionId);
    return Promise.resolve([] as MenuItem[]);
  }

  return request<MenuItem[]>(
    "/api/menu/items",
    { query: { sectionId, active_only: !!activeOnly }, headers: tenantHeaders(id) }
  );
}

export function createMenuCategory(tenantId: string, input: {
  name: string;
  sort_order?: number;
  description?: string | null;
}) {
  const id = requireTenantId(tenantId);
  return request<MenuCategory>("/api/menu/categories", {
    method: "POST",
    body: input,
    headers: tenantHeaders(id),
  });
}

export function createMenuItem(tenantId: string, input: MenuItemUpsert) {
  const id = requireTenantId(tenantId);
  return request<MenuItem>("/api/menu/items", {
    method: "POST",
    body: input,
    headers: tenantHeaders(id),
  });
}

export function updateMenuItem(tenantId: string, id: UUID, patch: Partial<Omit<MenuItem, "id">>) {
  const t = requireTenantId(tenantId);
  return request<MenuItem>(`/api/menu/items/${id}`, {
    method: "PATCH",
    body: patch,
    headers: tenantHeaders(t),
  });
}

// --- Bulk menu item upload helper ---
export type MenuItemBulkUpsert = {
  id?: UUID;
  sectionId: UUID;
  name: string;
  price: number;
  description?: string | null;
  imageUrl?: string | null;
  isAvailable?: boolean;
  tags?: string[];
  allergens?: string[];
  dietary?: string[];
  sort_order?: number | null;
  spicyLevel?: number | null;
  calories?: number | null;
  preparationTime?: number | null;
};

function mapMenuItemForApi(item: MenuItemBulkUpsert) {
  return {
    id: item.id ?? undefined,
    section_id: item.sectionId,
    name: item.name,
    price: Number(item.price),                     // server expects numeric price (not cents)
    ord: item.sort_order ?? 0,                     // server uses 'ord'
    is_available: item.isAvailable ?? true,
    image_url: item.imageUrl?.startsWith("blob:") ? undefined : item.imageUrl ?? undefined,
    description: item.description ?? undefined,
    tags: item.tags ?? [],
    allergens: item.allergens ?? [],
    dietary: item.dietary ?? [],
    spicy_level: item.spicyLevel ?? undefined,
    calories: item.calories ?? undefined,
    preparation_time: item.preparationTime ?? undefined,
  };
}

export async function bulkUploadMenuItems(tenantId: string, items: MenuItemBulkUpsert[]) {
  const id = requireTenantId(tenantId);
  if (!items?.length) throw new Error("No items provided for bulk upload");

  // Validate required fields early to avoid 400 Bad Request
  const invalid = items.find(i => !i.sectionId || !i.name || typeof i.price !== "number");
  if (invalid) throw new Error("Each item requires sectionId, name, and numeric price");

  const body = { rows: items.map(mapMenuItemForApi) };

  return request<{ imported?: number; upserted?: number; errors?: Array<{ row: number; message: string }> }>(
    "/api/menu/items/bulk",
    { method: "POST", body, headers: tenantHeaders(id) }
  );
}

export function upsertMenuItemsBulk(tenantId: string, payload:
  | { items: Array<MenuItemUpsert> }
  | { csv: string }) {
  const id = requireTenantId(tenantId);
  return request<{ imported?: number; upserted?: number; errors?: Array<{ row: number; message: string }> }>(
    "/api/menu/items/bulk",
    { method: "POST", body: payload, headers: tenantHeaders(id) }
  );
}

// ----- Menu Sections (client helpers) -----
export type MenuSectionUpsert = {
  id?: UUID;
  name: string;
  ord?: number;
  is_active?: boolean;
  description?: string | null;
};

/**
 * Create a single section by delegating to the bulk endpoint.
 * Non-breaking: returns the first row when the server responds with an array,
 * otherwise returns the raw response.
 */
export async function createMenuSection(
  tenantId: string,
  section: MenuSectionUpsert
): Promise<MenuSection | any> {
  const id = requireTenantId(tenantId);
  const resp = await request<any>("/api/menu/sections/bulk", {
    method: "POST",
    headers: tenantHeaders(id),
    body: { rows: [section] },
  });
  if (Array.isArray(resp)) return resp[0];
  if (resp && Array.isArray(resp?.rows)) return resp.rows[0];
  return resp;
}

/**
 * Bulk upsert sections.
 * Non-breaking: returns server response verbatim (array or object), so callers can adapt.
 */
export async function bulkUpsertMenuSections(
  tenantId: string,
  sections: MenuSectionUpsert[]
): Promise<any> {
  const id = requireTenantId(tenantId);
  return request<any>("/api/menu/sections/bulk", {
    method: "POST",
    headers: tenantHeaders(id),
    body: { rows: sections },
  });
}

/** Sections — list */
export function listMenuSections(tenantId: string) {
  const id = requireTenantId(tenantId);
  return request<MenuSection[]>("/api/menu/sections", { headers: tenantHeaders(id) });
}

/** Sections — bulk upsert */
export function upsertMenuSections(tenantId: string, rows: Array<Pick<MenuSection, "id" | "name" | "ord" | "description" | "is_active">>) {
  const id = requireTenantId(tenantId);
  return request<{ upserted: number }>("/api/menu/sections/bulk", {
    method: "POST",
    body: { rows },
    headers: tenantHeaders(id),
  });
}

/** Sections — bulk visibility toggle (hide / re-enable) */
export function bulkUpdateMenuSections(
  tenantId: string,
  rows: Array<{ id: UUID; is_active: boolean }>
): Promise<{ updated: number; sections: MenuSection[] }> {
  const id = requireTenantId(tenantId);
  if (!Array.isArray(rows) || rows.length === 0) {
    return Promise.resolve({ updated: 0, sections: [] });
  }
  return request<{ updated: number; sections: MenuSection[] }>(
    "/api/menu/sections/update-bulk",
    {
      method: "POST",
      body: { rows },
      headers: tenantHeaders(id),
    }
  );
}

/** Sections — set active (single-section convenience) */
export async function setSectionActive(
  tenantId: string,
  sectionId: UUID,
  isActive: boolean
): Promise<{ updated: number; sections?: MenuSection[] }> {
  const id = requireTenantId(tenantId);
  return request<{ updated: number; sections?: MenuSection[] }>(
    "/api/menu/sections/update-bulk",
    {
      method: "POST",
      body: { rows: [{ id: sectionId, is_active: isActive }] },
      headers: tenantHeaders(id),
    }
  );
}

/** Sections — bulk delete */
export function deleteMenuSections(tenantId: string, ids: UUID[]) {
  const id = requireTenantId(tenantId);
  return request<{ deleted: number }>("/api/menu/sections/delete-bulk", {
    method: "POST",
    body: { ids },
    headers: tenantHeaders(id),
  });
}

/** Sections — toggle availability of ALL items in a section */
export function toggleSectionItems(
  tenantId: string,
  sectionId: UUID,
  available: boolean
): Promise<{ sectionId: UUID; available: boolean; updated: number }> {
  const id = requireTenantId(tenantId);
  return request<{ sectionId: UUID; available: boolean; updated: number }>(
    `/api/menu/sections/${sectionId}/toggle-items`,
    {
      method: "POST",
      body: { available },
      headers: tenantHeaders(id),
    }
  );
}

/** Items — bulk delete */
export function deleteMenuItems(tenantId: string, ids: UUID[]) {
  const id = requireTenantId(tenantId);
  return request<{ deleted: number }>("/api/menu/items/delete-bulk", {
    method: "POST",
    body: { ids },
    headers: tenantHeaders(id),
  });
}

/**
 * Subscribe to live menu changes (sections & items) for a tenant.
 * Returns an unsubscribe function.
 */
export function subscribeMenu(tenantId: string, onChange: (payload: { table: "menu_sections" | "menu_items"; type: "INSERT" | "UPDATE" | "DELETE"; new?: any; old?: any; }) => void) {
  const id = requireTenantId(tenantId);
  const ch = supabase
    .channel(`menu:${id}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_sections', filter: `tenant_id=eq.${id}` }, (p: any) => {
      onChange({ table: 'menu_sections', type: p.eventType, new: p.new, old: p.old });
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items', filter: `tenant_id=eq.${id}` }, (p: any) => {
      onChange({ table: 'menu_items', type: p.eventType, new: p.new, old: p.old });
    })
    .subscribe();
  return () => { try { supabase.removeChannel(ch); } catch {} };
}

/* ======================
   Helpers (Concurrency, Chunking)
====================== */

function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0) return [arr];
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function pMap<T, R>(items: T[], limit: number, mapper: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const ret: R[] = new Array(items.length);
  let next = 0;
  const workers = new Array(Math.min(limit, items.length)).fill(0).map(async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) break;
      ret[i] = await mapper(items[i], i);
    }
  });
  await Promise.all(workers);
  return ret;
}

/* ======================
   TAX CONFIG API (server: /api/tax)
   Tenant-scoped config for tax percentages.
====================== */

export interface TaxComponent {
  name: string;        // backend expects `name`
  rate: number;        // fraction e.g., 0.05
  code?: string;       // optional code (e.g., CGST)
  label?: string;      // optional alias kept for backward-compat on reads
}

export interface TenantTaxConfig {
  tenant_id: string;
  mode: 'single' | 'components';
  total_rate: number;          // FRACTION (e.g., 0.10)
  components?: TaxComponent[]; // for mode='components'
  currency?: string;           // e.g., 'INR', 'USD'
  inclusion?: 'inclusive' | 'exclusive'; // tax inclusion type
  updated_at?: string;
}

export type SaveTaxBody =
  | { mode: 'single'; total_rate: number; currency?: string; inclusion?: 'inclusive' | 'exclusive' }
  | { mode: 'components'; components: { name: string; rate: number }[]; total_rate?: number; currency?: string; inclusion?: 'inclusive' | 'exclusive' };

export const taxApi = {
  async get(tenantId: string): Promise<TenantTaxConfig | null> {
    const id = requireTenantId(tenantId);
    try {
      return await request<TenantTaxConfig>('/api/tax', {
        method: 'GET',
        headers: tenantHeaders(id),
      });
    } catch (e) {
      if (e instanceof HttpError && (e.status === 404 || e.status === 405)) {
        return null;
      }
      throw e;
    }
  },

  async save(tenantId: string, payload: SaveTaxBody): Promise<TenantTaxConfig> {
    const id = requireTenantId(tenantId);
    return request<TenantTaxConfig>('/api/tax', {
      method: 'POST',
      headers: tenantHeaders(id),
      body: payload,
    });
  },
};

/* ========================================================================
   CART — FOCUSED EXPORT
   ======================================================================== */
export const cartApi = {
  start: cartStart,
  get: cartGet,
  addItems: cartAddItems,
  updateItem: cartUpdateItem,
  removeItem: cartRemoveItem,
  increment: cartIncrement,
  checkout: cartCheckout,
  confirm: cartConfirm,
  // Ergonomic single-item helpers expected by callers
  addItem: (tenantId: string, cartId: string, menuItemId: string, qty: number) =>
    cartAddItems(tenantId, cartId, [{ menu_item_id: menuItemId, qty }]),
  summary: (tenantId: string, cartId: string) => cartGet(tenantId, cartId),
};

/* ========================================================================
   MENU MANAGEMENT — FOCUSED EXPORT
   Use this in Menu/ MenuManagement pages to avoid accidental coupling.
   Nothing is removed from the file; this is a curated surface area.
   ======================================================================== */
export const menuApi = {
  // Sessions (table-aware menu flows)
  getActiveSessionByTable,
  createOrReuseSession,
  // Sections & Items
  getMenuCategories,
  getMenuItems,
  getMenuItemsBySection,
  // Single + bulk sections
  createMenuSection,
  bulkUpsertMenuSections,
  listMenuSections,
  upsertMenuSections,
  bulkUpdateMenuSections,
  setSectionActive,
  deleteMenuSections,
  toggleSectionItems,
  deleteMenuItems,
  bulkUploadMenuItems,
  resolveMenuRefs,
  // Realtime
  subscribeMenu,
};

/* ========================================================================
   NON-MENU (RETAINED) — Tables, Reservations, and TM Settings
   These are kept for Table Management / BookTable / Reserve modules.
   Not directly required by Menu pages; do not remove.
   ======================================================================== */
/* ======================
   Tables (Search & Details)
====================== */

/** Search tables for a given date/time and party size */
export function searchTables(params: TableSearchParams) {
  // Deprecated endpoint, not maintained for /api/tables; you may implement as needed.
  throw new Error("searchTables is not implemented for /api/tables endpoint.");
}
/** Availability snapshot at a specific datetime (and optional party size) */
export function getAvailableTables(params: { at: string; guests?: number }) {
  // Deprecated endpoint, not maintained for /api/tables; you may implement as needed.
  throw new Error("getAvailableTables is not implemented for /api/tables endpoint.");
}

/** Fetch full details for a specific table (for popup with specialties) */
export function getTableDetails(tableId: UUID) {
  // Deprecated endpoint, not maintained for /api/tables; you may implement as needed.
  throw new Error("getTableDetails is not implemented for /api/tables endpoint.");
}

/**
 * List all tables for the current tenant.
 * Sends GET to /api/tables with proper tenant headers.
 */
export async function listTables(tenantId?: string): Promise<DiningTable[]> {
  const id = requireTenantId(tenantId);
  // Audit log
  console.debug("[api] listTables called", { tenantId: id });
  // Always fetch from /api/tables with tenant headers
  const resp = await request<DiningTable[]>(
    '/api/tables',
    {
      method: 'GET',
      headers: tenantHeaders(id),
    }
  );
  // The backend should return an array of DiningTable objects
  return Array.isArray(resp) ? resp : [];
}

/**
 * Bulk upsert (create or update) tables for a tenant.
 * Always uses POST /api/tables/bulk with { rows } in body.
 * Returns an array of created/updated DiningTable rows.
 * Handles backend responses both as array or wrapped in { tables: [...] }.
 */
export async function upsertTablesBulk(
  tenantId: string,
  rows: Array<{
    id?: UUID;
    code: string;
    label?: string | null;
    seats: number;
    type?: DiningTable['type'];
    notes?: string | null;
    location?: string;
    status?: string;
    table_number?: string;
  }>
): Promise<DiningTable[]> {
  const id = requireTenantId(tenantId);
  if (!Array.isArray(rows) || rows.length === 0) return [];
  // Audit log
  console.debug("[api] upsertTablesBulk called", { tenantId: id, rows });
  // Always wrap in { rows }
  const resp = await request<any>(
    '/api/tables/bulk',
    {
      method: 'POST',
      headers: tenantHeaders(id),
      body: { rows },
    }
  );
  if (Array.isArray(resp)) return resp as DiningTable[];
  if (resp && Array.isArray(resp.tables)) return resp.tables as DiningTable[];
  return [];
}

/**
 * Bulk delete tables by IDs for a tenant.
 * Always uses POST /api/tables/delete-bulk with { ids } in body.
 * Returns { ok: true } when done.
 */
export async function deleteTablesBulk(
  tenantId: string,
  ids: UUID[]
): Promise<{ ok: true }> {
  const id = requireTenantId(tenantId);
  if (!Array.isArray(ids) || ids.length === 0) return { ok: true } as const;
  // Audit log
  console.debug("[api] deleteTablesBulk called", { tenantId: id, ids });
  await request('/api/tables/delete-bulk', {
    method: 'POST',
    headers: tenantHeaders(id),
    body: { ids },
  });
  return { ok: true } as const;
}


// (Removed unused/legacy toggleTableLock implementation)

/**
 * Search available tables (no reservations logic required).
 * Always POSTs /api/tables/search-available with { zone?, party_size? }.
 * Returns resp.available if wrapped, else direct array, else empty.
 */
export async function searchAvailableTables(
  tenantId: string,
  payload: { starts_at?: string; ends_at?: string; party_size?: number; zone?: string }
): Promise<DiningTable[]> {
  const id = requireTenantId(tenantId);
  // Audit log
  console.debug("[api] searchAvailableTables called", { tenantId: id, payload });
  const resp = await request<any>(
    "/api/tables/search-available",
    {
      method: "POST",
      body: payload,
      headers: tenantHeaders(id),
    }
  );
  if (Array.isArray(resp)) return resp as DiningTable[];
  if (resp && Array.isArray(resp.available)) return resp.available as DiningTable[];
  return [];
}


/** Create a reservation for a specific table/window */
export function createReservation(input: {
  table_id: UUID;
  customer_name: string;
  guest_count: number;
  // Prefer starts_at/ends_at; server can adapt to reservation_time if needed
  starts_at: string; // ISO (timestamptz)
  ends_at: string;   // ISO (timestamptz)
  note?: string;
}) {
  return requestWithFallback<{ id: UUID; status: string }>(
    ['/api/reservations', '/reservations'],
    { method: 'POST', body: input }
  );
}

/* ======================
   Zones (tenant-scoped)
====================== */

/** List zones for current tenant (ordered, always uses /api/zones) */
export async function listZones(tenantId?: string): Promise<ZoneRow[]> {
  const id = requireTenantId(tenantId);
  const rows = await request<ZoneRow[]>(`/api/zones`, {
    method: "GET",
    headers: tenantHeaders(id),
  });
  return Array.isArray(rows)
    ? rows.sort((a, b) => (a.ord ?? 0) - (b.ord ?? 0))
    : [];
}

/** Bulk upsert zones (creates/updates and order), always uses /api/zones/bulk */
export async function upsertZones(
  tenantId: string,
  rows: ZoneRow[]
): Promise<{ ok: true }> {
  const id = requireTenantId(tenantId);
  if (!rows?.length) return { ok: true };

  await request(`/api/zones/bulk`, {
    method: "POST",
    headers: tenantHeaders(id),
    body: { rows },
  });
  return { ok: true };
}

/** Bulk delete zones by zone_id, always uses /api/zones/delete-bulk */
export async function deleteZones(
  tenantId: string,
  zoneIds: string[]
): Promise<{ ok: true }> {
  const id = requireTenantId(tenantId);
  if (!zoneIds?.length) return { ok: true };

  await request(`/api/zones/delete-bulk`, {
    method: "POST",
    headers: tenantHeaders(id),
    body: { zone_ids: zoneIds },
  });
  return { ok: true };
}

/* ======================
   Table Management Settings (tenant)
====================== */

export async function getTMSettings(tenantId?: string): Promise<TMSettingsRow | null> {
  try {
    const data = await requestWithFallback<TMSettingsRow | null>([
      '/api/tm-settings',
      '/tm-settings',
      '/tm/settings',
    ], { method: 'GET', headers: tenantHeaders(tenantId) });
    return (data as any) ?? null;
  } catch (e) {
    if (e instanceof HttpError && (e.status === 404 || e.status === 405)) return null;
    throw e;
  }
}

export async function saveTMSettings(tenantId: string, s: TMSettingsRow): Promise<{ ok: true } | void> {
  try {
    await requestWithFallback([
      '/api/tm-settings',
      '/tm-settings',
      '/tm/settings',
    ], { method: 'POST', headers: tenantHeaders(tenantId), body: s });
    return { ok: true } as const;
  } catch (e) {
    if (e instanceof HttpError && (e.status === 404 || e.status === 405)) return { ok: true } as const;
    throw e;
  }
}


/* ---------- Orders (table sessions & lifecycle) ---------- */

/** Start an order for a table; server will open/ensure a table session and lock the table */
export function createOrderForTable(input: { table_id?: UUID; tableId?: UUID; mode?: 'dine_in' | 'takeaway' | 'delivery'; note?: string; }): Promise<{ id: UUID; status: string; table_id: UUID }>;
export function createOrderForTable(tenantId: string, input: { table_id?: UUID; tableId?: UUID; mode?: 'dine_in' | 'takeaway' | 'delivery'; note?: string; }): Promise<{ id: UUID; status: string; table_id: UUID }>;
export function createOrderForTable(a: any, b?: any) {
  const isOverload = typeof a === 'string';
  const tenantId: string | undefined = isOverload ? a : undefined;
  const input = (isOverload ? b : a) as { table_id?: UUID; tableId?: UUID; mode?: 'dine_in' | 'takeaway' | 'delivery'; note?: string; };
  const body = { ...input, table_id: input.table_id ?? input.tableId };
  return request<{ id: UUID; status: string; table_id: UUID }>(
    '/api/orders',
    { method: 'POST', body, headers: tenantHeaders(tenantId) }
  );
}

/** Close an order and release the table lock (server ends session if no other active orders) */
export function closeOrderForTable(orderId: UUID, outcome: 'paid' | 'cancelled' | 'voided', note?: string, tenantId?: string) {
  return request<{ ok: true; order_id: UUID; status: string }>(
    `/api/orders/${orderId}/close`,
    { method: 'POST', body: { outcome, note }, headers: tenantHeaders(tenantId) }
  );
}

/* ========================================================================
   NON-MENU (RETAINED) — Payments (Stripe/Razorpay)
   Used by checkout flows; not required by Menu listing/management UI.
   Retained to avoid breaking other pages.
   ======================================================================== */
/* ======================
   Payments
====================== */

export function getPaymentProviders() {
  return request<PaymentProvider[]>("/api/payments/providers");
}

export function createPaymentProvider(input: {
  provider: PaymentProviderName;
  config: Record<string, any>;
  enabled?: boolean;
}) {
  return request<PaymentProvider>("/api/payments/providers", {
    method: "POST",
    body: input,
  });
}

export function updatePaymentProvider(
  id: UUID,
  patch: Partial<{ config: Record<string, any>; enabled: boolean }>
) {
  return request<PaymentProvider>(`/api/payments/providers/${id}`, {
    method: "PATCH",
    body: patch,
  });
}

// Admin Payments API Wrappers (used by AdminPayments & PaymentSettings pages)
export const listPaymentProviders = () => getPaymentProviders();

export const createTenantPaymentProvider = (body: {
  provider: PaymentProviderName;
  config: Record<string, any>;
  enabled?: boolean;
}) => createPaymentProvider(body);

export const updateTenantPaymentProvider = (
  id: UUID,
  body: Partial<{ config: Record<string, any>; enabled: boolean }>
) => updatePaymentProvider(id, body);

export function createPaymentIntent(input: {
  order_id: UUID;
  amount: number;
  method?: string; // optional hint to provider
}) {
  return request<PaymentIntent>("/api/payments/intents", {
    method: "POST",
    body: input,
  });
}

export function confirmPaymentIntent(id: UUID, body?: Record<string, any>) {
  return request<PaymentIntent>(`/api/payments/intents/${id}/confirm`, {
    method: "POST",
    body,
  });
}

export function refundPaymentIntent(id: UUID, amount?: number) {
  return request<PaymentIntent>(`/api/payments/intents/${id}/refund`, {
    method: "POST",
    body: amount ? { amount } : undefined,
  });
}

export function listPaymentIntents(params?: {
  order_id?: UUID;
  limit?: number;
  cursor?: string;
}) {
  return request<{ data: PaymentIntent[]; next_cursor?: string }>(
    "/api/payments/intents",
    { query: params }
  );
}

export function listPaymentEvents(intentId: UUID) {
  return request<PaymentEvent[]>(`/api/payments/intents/${intentId}/events`);
}

/** Test hook for your mock emitter (kept for parity with your snapshot) */
export function emitPaymentIntentEvent(intentId: UUID, type: string) {
  return request<{ ok: true }>(`/api/payments/intents/${intentId}/emit-event`, {
    method: "POST",
    body: { type },
  });
}

/* ========================================================================
   NON-MENU (RETAINED) — Receipts / Notifications
   ======================================================================== */
/* ======================
   Receipts
====================== */

export function sendReceipt(input: {
  order_id: UUID;
  channel: ReceiptChannel;
  to: string;
}) {
  return request<{ ok: true; message_id?: string }>("/api/receipts/send", {
    method: "POST",
    body: input,
  });
}

/* ========================================================================
   NON-MENU (RETAINED) — KDS / Kitchen Ops
   ======================================================================== */
/* ======================
   KDS (feature-flagged)
====================== */

export function advanceOrder(
  orderId: UUID,
  to_state: "queued" | "preparing" | "ready" | "served" | "completed" | "cancelled"
) {
  return request<{ ok: true; order_id: UUID; status: string }>(
    `/api/kds/orders/${orderId}/advance`,
    { method: "POST", body: { to_state } }
  );
}

/* ========================================================================
   NON-MENU (RETAINED) — Analytics
   ======================================================================== */
/* ======================
   Analytics (subset)
====================== */

export function revenueTimeseries(params: {
  range?: "7d" | "30d" | "90d";
  interval?: "hour" | "day" | "week" | "month";
}) {
  // Call snake_case endpoint and adapt to legacy shape { t, revenue }
  return request<any>("/api/analytics/revenue_timeseries", { query: params as any }).then((resp) => {
    const series: any[] = Array.isArray(resp?.series)
      ? resp.series
      : Array.isArray(resp?.points)
        ? resp.points
        : Array.isArray(resp)
          ? resp
          : [];
    return series.map((p: any) => ({
      t: String(p.bucket ?? p.t ?? p.time ?? p.date ?? ""),
      revenue: Number(p.revenue_total ?? p.revenue ?? p.total_minor ?? 0),
    }));
  });
}

export function paymentConversionFunnel(params?: { range?: "7d" | "30d" | "90d" }) {
  // Call snake_case endpoint and adapt to legacy shape { stage, value }
  return request<any>("/api/analytics/payment_conversion_funnel", { query: params as any }).then((resp) => {
    const rows: any[] = Array.isArray(resp?.rows)
      ? resp.rows
      : Array.isArray(resp)
        ? resp
        : [];
    return rows.map((r: any) => ({
      stage: String(r.stage ?? r.name ?? "unknown"),
      value: Number(r.value ?? r.intents ?? r.count ?? 0),
    }));
  });
}

export function orderFulfillmentTimeline(params?: { range?: "7d" | "30d" | "90d" }) {
  // Call snake_case endpoint and adapt
  return request<any>("/api/analytics/order_fulfillment_timeline", { query: params as any }).then((resp) => {
    const rows: any[] = Array.isArray(resp?.rows)
      ? resp.rows
      : Array.isArray(resp)
        ? resp
        : [];
    return rows.map((r: any) => ({
      step: String(r.step ?? r.name ?? ""),
      p50_ms: Number(r.p50_ms ?? r.p50 ?? 0),
      p95_ms: Number(r.p95_ms ?? r.p95 ?? 0),
    }));
  });
}

/* ======================
   Helpers
====================== */

export function getErrorMessage(err: unknown) {
  if (err instanceof HttpError) return err.message;
  if (err && typeof err === "object" && "message" in err)
    return String((err as any).message);
  return "Something went wrong";
}

/** Quick helper to inspect which base URL the client is using. */
export function logApiBase() {
  console.info("[api] API_BASE =", API_BASE);
  return API_BASE;
}

/**
 * Debug helper: prints and returns the current JWT payload.
 * Usage from DevTools (with Vite):
 *   import { debugJWT } from '/src/lib/api.ts';
 *   debugJWT();
 */
export async function debugJWT() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("[debugJWT] getSession error:", error);
      return null;
    }
    const token = data?.session?.access_token;
    if (!token) {
      console.warn("[debugJWT] No access token (user may be signed out).");
      return null;
    }
    const payload = (function decodeJwt(t: string) {
      try {
        const base64 = t.split(".")[1] || "";
        const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
        // handle unicode
        const utf8 = decodeURIComponent(
          json.split("").map(c => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`).join("")
        );
        return JSON.parse(utf8);
      } catch (e) {
        console.error("[debugJWT] Failed to decode token:", e);
        return null;
      }
    })(token);
    console.log("[debugJWT] payload:", payload);
    return payload;
  } catch (e) {
    console.error("[debugJWT] unexpected error:", e);
    return null;
  }
}

// Debug helpers for browser console
if (typeof window !== "undefined") {
  (window as any).debugJWT = debugJWT;
  (window as any).cartApi = cartApi;
  (window as any).getTenantId = getTenantId;
  (window as any).syncTenantId = syncTenantId;
  (window as any).getUserId = getUserId;
  (window as any).syncUserId = syncUserId;
}

/* Default export for convenience */
const api = {
  setAuthToken,
  clearAuthToken,
  setTenantId,
  syncTenantId,
  getTenantId,
  setUserId,
  syncUserId,
  getUserId,
  // Cart (scoped helpers)
  cart: cartApi,
  getMenuCategories,
  getMenuItems,
  getActiveSessionByTable,
  createOrReuseSession,
  createMenuCategory,
  createMenuItem,
  updateMenuItem,
  upsertMenuItemsBulk,
  // Single + bulk sections
  createMenuSection,
  bulkUpsertMenuSections,
  listMenuSections,
  upsertMenuSections,
  bulkUpdateMenuSections,
  setSectionActive,
  deleteMenuSections,
  toggleSectionItems,
  deleteMenuItems,
  getMenuItemsBySection,
  subscribeMenu,
  resolveMenuRefs,
  getPaymentProviders,
  createPaymentProvider,
  updatePaymentProvider,
  listPaymentProviders,
  createTenantPaymentProvider,
  updateTenantPaymentProvider,
  createPaymentIntent,
  confirmPaymentIntent,
  refundPaymentIntent,
  listPaymentIntents,
  listPaymentEvents,
  emitPaymentIntentEvent,
  sendReceipt,
  advanceOrder,
  revenueTimeseries,
  paymentConversionFunnel,
  orderFulfillmentTimeline,
  // Zones & TM Settings
  listZones,
  upsertZones,
  deleteZones,
  getTMSettings,
  saveTMSettings,
  searchTables,
  getAvailableTables,
  getTableDetails,
  listTables,
  upsertTablesBulk,
  deleteTablesBulk,
  searchAvailableTables,
  createReservation,
  createOrderForTable,
  closeOrderForTable,
  createTableHold,
  promoteTableHold,
  releaseTable,
  getErrorMessage,
  debugJWT,
  logApiBase,
  taxApi,
  withTenantHeaders,
};

// Expose a generic fetch helper for components that need raw access
export { request, withTenantHeaders };

/**
 * Defensive fetch helper: returns JSON, checks .json presence, throws with error details.
 */
export async function getJSON<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const base = API_BASE.replace(/\/+$/, '');
  const isAbsolute = /^https?:\/\//i.test(url);
  const usesApiBase = isAbsolute && url.startsWith(base + '/');

  // For relative URLs or absolute URLs pointing at our API_BASE, delegate to request()
  if (!isAbsolute || usesApiBase) {
    const path = usesApiBase ? url.slice(base.length) : url; // keep leading slash
    return request<T>(path, {
      method: (options.method as HttpMethod) || 'GET',
      headers: options.headers as Record<string, string>,
      body: options.body as any,
      signal: options.signal as AbortSignal,
      keepalive: (options as any).keepalive as boolean | undefined,
    });
  }

  // Absolute URL to a foreign host: fallback to plain fetch with strict JSON checks
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.headers || {}),
    },
  });

  const ctype = res.headers.get('content-type') || '';
  const text = await res.text().catch(() => '');

  if (!ctype.includes('application/json')) {
    throw new HttpError(
      res.status,
      `[api.getJSON] Non-JSON response ${res.status} ${res.statusText} from ${url}. Content-Type=${ctype}. Snippet=${text.slice(0, 160)}`,
      text.slice(0, 500)
    );
  }

  if (!res.ok) {
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch {}
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status} ${res.statusText}`;
    throw new HttpError(res.status, msg, data ?? text.slice(0, 500));
  }

  try {
    return (text ? JSON.parse(text) : null) as T;
  } catch {
    throw new HttpError(
      res.status,
      `[api.getJSON] Failed to parse JSON from ${url}. Snippet=${text.slice(0, 160)}`,
      text.slice(0, 500)
    );
  }
}

export default api;

// (Debug helpers already exposed above)
export async function getBillingPortalUrl(tenantId: string): Promise<{ url: string }> {
  const id = requireTenantId(tenantId);
  return request<{ url: string }>('/api/billing/portal', {
    method: 'POST',
    headers: tenantHeaders(id),
    body: { tenant_id: id },
  });
}