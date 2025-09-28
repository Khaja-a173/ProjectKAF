import { request, HttpError, withTenantHeaders, getTenantId } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { UUID } from "@/lib/api";

// Local helpers to avoid circular imports and match api.ts behavior
const UUID_V4_RE: RegExp = new RegExp(
  "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
  "i"
);

function requireTenantId(tenantId?: string): string {
  const id = tenantId ?? getTenantId();
  if (!id) throw new Error("Missing tenantId");
  return id;
}

async function requestWithFallback<T>(paths: string[], opts: any): Promise<T> {
  let lastError: any;
  for (const p of paths) {
    try {
      return await request<T>(p, opts);
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
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
    { method: "POST", body, headers: withTenantHeaders({}, id) }
  );
}

/** Sessions — get active by table code (client expects human code like T01) */
export async function getActiveSessionByTable(tenantId: string, tableCode: string): Promise<TableSession | null> {
  const id = requireTenantId(tenantId);
  try {
    // primary: REST endpoint
    const data = await requestWithFallback<TableSession | { session: TableSession } | null>(
      ["/api/sessions/by-table"],
      { method: "GET", query: { table: tableCode }, headers: withTenantHeaders({}, id) }
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
    { method: "POST", headers: withTenantHeaders({}, id), body }
  );
  return (data as any).session ? (data as any).session as TableSession : (data as TableSession);
}

export function getMenuCategories(tenantId?: string) {
  const id = requireTenantId(tenantId);
  return request<MenuCategory[]>("/api/menu/categories", { headers: withTenantHeaders({}, id) });
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

  return request<MenuItem[]>("/api/menu/items", { query, headers: withTenantHeaders({}, id) });
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
    { query: { sectionId, active_only: !!activeOnly }, headers: withTenantHeaders({}, id) }
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
    headers: withTenantHeaders({}, id),
  });
}

export async function createMenuItem(
  tenantId: string,
  input: MenuItemBulkUpsert
): Promise<MenuItem> {
  const id = requireTenantId(tenantId);
  const row = mapMenuItemForApi(input);
  const resp = await request<MenuItem[]>("/api/menu/items/bulk", {
    method: "POST",
    body: { rows: [row] },
    headers: withTenantHeaders({}, id),
  });
  return Array.isArray(resp) ? resp[0] : (resp as any);
}

export async function updateMenuItem(
  tenantId: string,
  id: UUID,
  patch: Partial<MenuItemBulkUpsert>
): Promise<MenuItem> {
  const t = requireTenantId(tenantId);
  const sectionId = (patch as any).sectionId ?? (patch as any).section_id;
  if (!sectionId) {
    throw new Error("updateMenuItem requires sectionId");
  }
  if (!UUID_V4_RE.test(sectionId)) {
    throw new Error(`Invalid sectionId: ${sectionId}`);
  }

  const row = mapMenuItemForApi({ id, sectionId, ...(patch as any) });
  const resp = await request<MenuItem[]>("/api/menu/items/bulk", {
    method: "POST",
    body: { rows: [row] },
    headers: withTenantHeaders({}, t),
  });
  return Array.isArray(resp) ? resp[0] : (resp as any);
}

/**
 * Toggle item availability (dedicated backend endpoint).
 * Expects `is_available` as the property in the request body.
 */
export async function toggleItemAvailability(
  tenantId: string,
  id: UUID,
  isAvailable: boolean
): Promise<MenuItem> {
  const t = requireTenantId(tenantId);
  return request<MenuItem>(
    `/api/menu/items/${id}/toggle`,
    {
      method: "PATCH",
      body: { is_available: isAvailable },
      headers: withTenantHeaders({}, t),
    }
  );
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
  if (!item.sectionId) {
    throw new Error("Missing sectionId for menu item");
  }
  if (!UUID_V4_RE.test(item.sectionId)) {
    throw new Error(`Invalid sectionId: ${item.sectionId}`);
  }
  if (!item.name || typeof item.name !== "string" || !item.name.trim()) {
    throw new Error("Menu item must have a valid name");
  }

  const numericPrice = Number(item.price);
  if (!isFinite(numericPrice)) {
    throw new Error("Menu item must have a numeric price");
  }

  return {
    id: item.id ?? undefined,
    section_id: item.sectionId,
    name: item.name.trim(),
    price: numericPrice,
    ord: item.sort_order ?? 0,
    is_available: item.isAvailable ?? true,
    image_url: item.imageUrl?.startsWith("blob:") ? undefined : item.imageUrl ?? undefined,
    description: item.description ?? undefined,
    tags: Array.isArray(item.tags) && item.tags.length > 0 ? item.tags : undefined,
    allergens: Array.isArray(item.allergens) && item.allergens.length > 0 ? item.allergens : undefined,
    dietary: Array.isArray(item.dietary) && item.dietary.length > 0 ? item.dietary : undefined,
    spicy_level: item.spicyLevel ?? undefined,
    calories: item.calories ?? undefined,
    preparation_time: item.preparationTime ?? undefined,
  };
}

export async function bulkUploadMenuItems(
  tenantId: string,
  items: MenuItemBulkUpsert[]
): Promise<MenuItem[]> {
  const id = requireTenantId(tenantId);
  if (!items?.length) throw new Error("No items provided for bulk upload");

  for (const i of items) {
    const numericPrice = Number(i.price);
    if (!i.sectionId) throw new Error("Each item requires sectionId");
    if (!UUID_V4_RE.test(i.sectionId)) throw new Error(`Invalid sectionId: ${i.sectionId}`);
    if (!i.name || !String(i.name).trim()) throw new Error("Each item requires name");
    if (!isFinite(numericPrice)) throw new Error("Each item requires numeric price");
  }

  const body = { rows: items.map(mapMenuItemForApi) };
  return request<MenuItem[]>("/api/menu/items/bulk", {
    method: "POST",
    body,
    headers: withTenantHeaders({}, id),
  });
}

export function upsertMenuItemsBulk(tenantId: string, payload:
  | { items: Array<MenuItemUpsert> }
  | { csv: string }) {
  const id = requireTenantId(tenantId);
  return request<{ imported?: number; upserted?: number; errors?: Array<{ row: number; message: string }> }>(
    "/api/menu/items/bulk",
    { method: "POST", body: payload, headers: withTenantHeaders({}, id) }
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
    headers: withTenantHeaders({}, id),
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
    headers: withTenantHeaders({}, id),
    body: { rows: sections },
  });
}

/** Sections — list */
export function listMenuSections(tenantId: string) {
  const id = requireTenantId(tenantId);
  return request<MenuSection[]>("/api/menu/sections", { headers: withTenantHeaders({}, id) });
}

/** Sections — bulk upsert */
export function upsertMenuSections(tenantId: string, rows: Array<Pick<MenuSection, "id" | "name" | "ord" | "description" | "is_active">>) {
  const id = requireTenantId(tenantId);
  return request<{ upserted: number }>("/api/menu/sections/bulk", {
    method: "POST",
    body: { rows },
    headers: withTenantHeaders({}, id),
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
      headers: withTenantHeaders({}, id),
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
      headers: withTenantHeaders({}, id),
    }
  );
}

/** Sections — bulk delete */
export function deleteMenuSections(tenantId: string, ids: UUID[]) {
  const id = requireTenantId(tenantId);
  return request<{ deleted: number }>("/api/menu/sections/delete-bulk", {
    method: "POST",
    body: { ids },
    headers: withTenantHeaders({}, id),
  });
}

/**
 * Sections — toggle availability of ALL items in a section.
 * Expects `is_available` as the property in the request body.
 */
export function toggleSectionItems(
  tenantId: string,
  sectionId: UUID,
  isAvailable: boolean
): Promise<{ sectionId: UUID; is_available: boolean; updated: number }> {
  const id = requireTenantId(tenantId);
  return request<{ sectionId: UUID; is_available: boolean; updated: number }>(
    `/api/menu/sections/${sectionId}/toggle-items`,
    {
      method: "POST",
      body: { is_available: isAvailable },
      headers: withTenantHeaders({}, id),
    }
  );
}

/** Items — bulk delete */
export function deleteMenuItems(tenantId: string, ids: UUID[]) {
  const id = requireTenantId(tenantId);
  return request<{ deleted: number }>("/api/menu/items/delete-bulk", {
    method: "POST",
    body: { ids },
    headers: withTenantHeaders({}, id),
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
  createMenuItem,
  updateMenuItem,
  toggleItemAvailability,
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
  upsertMenuItemsBulk,
  resolveMenuRefs,
  // Realtime
  subscribeMenu,
};