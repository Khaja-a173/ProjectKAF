import { request, requestWithFallback, requireTenantId, tenantHeaders, HttpError, UUID } from "@/lib/api";

/* ---------- Types ---------- */
export interface DiningTable {
  id: UUID;
  code: string;            // e.g., T01, VIP2
  label?: string | null;   // human-friendly label
  seats: number;
  status?: 'available' | 'held' | 'occupied' | 'cleaning' | 'out-of-service' | string;
  type?: 'standard' | 'window' | 'vip' | 'outdoor' | 'booth' | string;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TableSearchParams {
  date: string;        // YYYY-MM-DD
  time: string;        // HH:mm
  guests: number;
  preference?: string; // type or area hint
}

export interface TableSession {
  id: UUID;
  tenantId?: UUID;
  locationId?: string | null;
  status?: "active" | "closed" | "cancelled" | string;
  mode?: "dine-in" | "take-away" | "delivery" | string | null;
  tableId?: string | null;     // human code like T01
  table_id?: string | null;
  tableCode?: string | null;
  table_code?: string | null;
  created_at?: string;
  updated_at?: string;
}

/* ---------- Table Hold / Promote / Release ---------- */

export async function createTableHold(tenantId: string, tableIdOrCode: string): Promise<DiningTable> {
  const id = requireTenantId(tenantId);
  const looksLikeUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tableIdOrCode);
  const body = looksLikeUuid ? { table_id: tableIdOrCode } : { table_code: tableIdOrCode };
  return request<DiningTable>("/api/tables/hold", { method: "POST", headers: tenantHeaders(id), body });
}

export async function promoteTableHold(tenantId: string, tableId: UUID): Promise<DiningTable> {
  const id = requireTenantId(tenantId);
  return request<DiningTable>("/api/tables/promote", { method: "POST", headers: tenantHeaders(id), body: { table_id: tableId } });
}

export async function releaseTable(tenantId: string, tableId: UUID): Promise<DiningTable> {
  const id = requireTenantId(tenantId);
  return request<DiningTable>("/api/tables/release", { method: "POST", headers: tenantHeaders(id), body: { table_id: tableId } });
}

/* ---------- Tables (CRUD + Search) ---------- */

export async function listTables(tenantId?: string): Promise<DiningTable[]> {
  const id = requireTenantId(tenantId);
  const resp = await request<DiningTable[]>("/api/tables", { method: "GET", headers: tenantHeaders(id) });
  return Array.isArray(resp) ? resp : [];
}

export async function upsertTablesBulk(
  tenantId: string,
  rows: Array<{ id?: UUID; code: string; label?: string | null; seats: number; type?: DiningTable["type"]; notes?: string | null; location?: string; status?: string; table_number?: string; }>
): Promise<DiningTable[]> {
  const id = requireTenantId(tenantId);
  if (!Array.isArray(rows) || rows.length === 0) return [];
  const resp = await request<any>("/api/tables/bulk", { method: "POST", headers: tenantHeaders(id), body: { rows } });
  if (Array.isArray(resp)) return resp as DiningTable[];
  if (resp && Array.isArray(resp.tables)) return resp.tables as DiningTable[];
  return [];
}

export async function deleteTablesBulk(tenantId: string, ids: UUID[]): Promise<{ ok: true }> {
  const id = requireTenantId(tenantId);
  if (!Array.isArray(ids) || ids.length === 0) return { ok: true } as const;
  await request("/api/tables/delete-bulk", { method: "POST", headers: tenantHeaders(id), body: { ids } });
  return { ok: true } as const;
}

export async function searchAvailableTables(
  tenantId: string,
  payload: { starts_at?: string; ends_at?: string; party_size?: number; zone?: string }
): Promise<DiningTable[]> {
  const id = requireTenantId(tenantId);
  const resp = await request<any>("/api/tables/search-available", { method: "POST", body: payload, headers: tenantHeaders(id) });
  if (Array.isArray(resp)) return resp as DiningTable[];
  if (resp && Array.isArray(resp.available)) return resp.available as DiningTable[];
  return [];
}

/* ---------- Reservations + Orders ---------- */

export function createReservation(input: { table_id: UUID; customer_name: string; guest_count: number; starts_at: string; ends_at: string; note?: string }) {
  return requestWithFallback<{ id: UUID; status: string }>(["/api/reservations", "/reservations"], { method: "POST", body: input });
}

export function createOrderForTable(input: { table_id?: UUID; tableId?: UUID; mode?: "dine_in" | "takeaway" | "delivery"; note?: string; }): Promise<{ id: UUID; status: string; table_id: UUID }>;
export function createOrderForTable(tenantId: string, input: { table_id?: UUID; tableId?: UUID; mode?: "dine_in" | "takeaway" | "delivery"; note?: string; }): Promise<{ id: UUID; status: string; table_id: UUID }>;
export function createOrderForTable(a: any, b?: any) {
  const isOverload = typeof a === "string";
  const tenantId: string | undefined = isOverload ? a : undefined;
  const input = (isOverload ? b : a) as { table_id?: UUID; tableId?: UUID; mode?: "dine_in" | "takeaway" | "delivery"; note?: string };
  const body = { ...input, table_id: input.table_id ?? input.tableId };
  return request<{ id: UUID; status: string; table_id: UUID }>("/api/orders", { method: "POST", body, headers: tenantHeaders(tenantId) });
}

export function closeOrderForTable(orderId: UUID, outcome: "paid" | "cancelled" | "voided", note?: string, tenantId?: string) {
  return request<{ ok: true; order_id: UUID; status: string }>(`/api/orders/${orderId}/close`, { method: "POST", body: { outcome, note }, headers: tenantHeaders(tenantId) });
}

/* ---------- Aggregated Export ---------- */
export const tableApi = {
  createTableHold,
  promoteTableHold,
  releaseTable,
  listTables,
  upsertTablesBulk,
  deleteTablesBulk,
  searchAvailableTables,
  createReservation,
  createOrderForTable,
  closeOrderForTable,
};