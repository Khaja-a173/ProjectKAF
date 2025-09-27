import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { MenuSection, MenuItem } from "../types/menu";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuidV4 = (v?: string | null) => !!v && typeof v === 'string' && UUID_RE.test(v);

export type UseMenuManagementProps = {
  tenantId: string;
  locationId?: string; // reserved (not used yet)
};

export type BulkUploadItem = {
  id?: string;
  sectionId?: string | null;
  sectionName?: string | null;
  name: string;
  price: number | string;
  ord?: number;
  isAvailable?: boolean;
  imageUrl?: string | null;
  description?: string | null;
  tags?: string[];
  calories?: number | null;
  spicyLevel?: number | null;
  preparationTime?: number | null;
};

export type BulkUploadResult = {
  sectionsUpserted: number;
  itemsUpserted: number;
  itemsSkipped: number;
  warnings: string[];
};

const API_BASE = "/api/menu";

async function apiFetch<T = any>(
  tenantId: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  // Pull the latest Supabase session token and attach it to headers (Authorization and x-supabase-auth)
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token || null;

  const res = await fetch(`${API_BASE}${path}`, {
    ...(init || {}),
    headers: {
      "Content-Type": "application/json",
      "X-Tenant-Id": tenantId,
      ...(token ? { Authorization: `Bearer ${token}`, "x-supabase-auth": token } : {}),
      ...(init?.headers || {}),
    },
    credentials: "include",
  });

  // Fast path: 204 No Content
  if (res.status === 204) {
    return undefined as unknown as T;
  }

  // Try to parse JSON once for both success and error cases
  let payload: any = null;
  try {
    payload = await res.json();
  } catch {
    // ignore JSON parse errors (could be empty body for 2xx)
  }

  if (!res.ok) {
    const msg =
      (payload && (payload.error || payload.message || payload.details)) ||
      `${res.status} ${res.statusText}`;
    const err = new Error(msg);
    (err as any).status = res.status;
    (err as any).details = payload || null;
    throw err;
  }

  return (payload ?? (undefined as any)) as T;
}

function sectionCacheKey(tenantId: string) {
  return `pkaf:menu:sections:${tenantId}`;
}

/* ---------- mappers API <-> UI ---------- */

function apiToSection(row: any): MenuSection {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? "",
    locationId: row.location_id ?? null,
    name: row.name,
    ord: row.ord ?? 0,
    sortIndex: row.ord ?? 0,
    isActive: row.is_active ?? true,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
    items: (row.items || []).map(apiToItem),
  } as unknown as MenuSection;
}

function apiToItem(row: any): MenuItem {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? "",
    locationId: row.location_id ?? null,
    sectionId: row.section_id ?? null,
    name: row.name,
    price: row.price,
    ord: row.ord ?? 0,
    isAvailable: row.is_available ?? true,
    imageUrl: row.image_url ?? null,
    description: row.description ?? null,
    tags: row.tags ?? [],
    calories: row.calories ?? null,
    spicyLevel: row.spicy_level ?? null,
    preparationTime: row.preparation_time ?? null,
  } as unknown as MenuItem;
}

function sectionToApi(patch: any): any {
  const out: any = {};
  if (patch.id !== undefined) out.id = patch.id;
  if (patch.name !== undefined) out.name = patch.name;
  // accept either `ord` (legacy) or `sortIndex` (current type)
  if ((patch as any).ord !== undefined) {
    out.ord = (patch as any).ord;
  } else if ((patch as any).sortIndex !== undefined) {
    out.ord = (patch as any).sortIndex;
  }
  if ((patch as any).isActive !== undefined)
    out.is_active = (patch as any).isActive;
  if ((patch as any).locationId !== undefined) out.location_id = (patch as any).locationId;
  return out;
}

function itemToApi(patch: any): any {
  const out: any = {};
  if ((patch as any).id !== undefined) out.id = (patch as any).id;
  if ((patch as any).sectionId !== undefined)
    out.section_id = (patch as any).sectionId;
  if (patch.name !== undefined) out.name = patch.name;
  if ((patch as any).price !== undefined) out.price = (patch as any).price;
  if ((patch as any).ord !== undefined) out.ord = (patch as any).ord;
  if ((patch as any).isAvailable !== undefined)
    out.is_available = (patch as any).isAvailable;
  if ((patch as any).imageUrl !== undefined)
    out.image_url = (patch as any).imageUrl;
  if ((patch as any).description !== undefined)
    out.description = (patch as any).description;
  if ((patch as any).tags !== undefined) out.tags = (patch as any).tags;
  if ((patch as any).calories !== undefined)
    out.calories = (patch as any).calories;
  if ((patch as any).spicyLevel !== undefined)
    out.spicy_level = (patch as any).spicyLevel;
  if ((patch as any).preparationTime !== undefined)
    out.preparation_time = (patch as any).preparationTime;
  return out;
}

function attachItemsToSections(
  sections: MenuSection[],
  itemsBySection: Record<string, MenuItem[]>
): MenuSection[] {
  return sections.map((s) => ({ ...s, items: itemsBySection[s.id] || [] }));
}

/* ---------- hook ---------- */

export function useMenuManagement({ tenantId }: UseMenuManagementProps) {
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bcRef = useRef<BroadcastChannel | null>(null);

  const [filters, setFilters] = useState<{
    query?: string;
    tags?: string[];
    allergens?: string[];
  }>({});

  const notify = () =>
    bcRef.current?.postMessage({ type: "menu-updated", tenantId });

  const persist = (next: MenuSection[]) => {
    setSections(next);
    localStorage.setItem(sectionCacheKey(tenantId), JSON.stringify(next));
    notify();
  };

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    sections.forEach((sec) =>
      sec.items?.forEach((it: any) =>
        (it.tags || []).forEach((t: string) => set.add(t))
      )
    );
    return Array.from(set).sort();
  }, [sections]);

  const availableAllergens = useMemo(() => {
    const set = new Set<string>();
    return Array.from(set).sort();
  }, []);

  // initial load: cache-first, then backend
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const cached = localStorage.getItem(sectionCacheKey(tenantId));
        if (cached) {
          try {
            setSections(JSON.parse(cached));
          } catch {}
        }

        const secsRaw = await apiFetch<any[]>(tenantId, "/sections", {
          method: "GET",
        });
        // Strict tenant isolation: ignore any rows not belonging to this tenant
        const secs = (secsRaw || [])
          .filter((r: any) => (r?.tenant_id ?? tenantId) === tenantId)
          .map(apiToSection);

        const itemsBySection: Record<string, MenuItem[]> = {};
        await Promise.all(
          secs.map(async (s) => {
            if (!isUuidV4(s.id)) {
              itemsBySection[s.id] = [];
              return;
            }
            const listRaw = await apiFetch<any[]>(
              tenantId,
              `/items?sectionId=${encodeURIComponent(s.id)}`,
              { method: "GET" }
            );
            itemsBySection[s.id] = (listRaw || [])
              .filter((r: any) => (r?.tenant_id ?? tenantId) === tenantId && (r?.section_id ?? s.id) === s.id)
              .map(apiToItem);
          })
        );

        const merged = attachItemsToSections(secs, itemsBySection);
        if (!cancelled) {
          setSections(merged);
          localStorage.setItem(sectionCacheKey(tenantId), JSON.stringify(merged));
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load menu");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  // cross-tab sync
  useEffect(() => {
    const bc = new BroadcastChannel(`pkaf:menu:${tenantId}`);
    bcRef.current = bc;
    bc.onmessage = (ev) => {
      if (ev?.data?.type === "menu-updated" && ev?.data?.tenantId === tenantId) {
        try {
          const cached = localStorage.getItem(sectionCacheKey(tenantId));
          if (cached) setSections(JSON.parse(cached));
        } catch {}
      }
    };
    return () => {
      bc.close();
      bcRef.current = null;
    };
  }, [tenantId]);

  // Realtime: subscribe to menu_items changes (granular updates; no full reloads)
  useEffect(() => {
    const channel = supabase
      .channel(`menu-items-${tenantId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_items', filter: `tenant_id=eq.${tenantId}` },
        (payload: any) => {
          try {
            const type = payload?.eventType || payload?.event || '';
            const newRow = payload?.new || payload?.record || null;
            const oldRow = payload?.old || null;
            // Drop cross-tenant events defensively on the client
            const rowTenant = newRow?.tenant_id ?? oldRow?.tenant_id ?? tenantId;
            if (rowTenant !== tenantId) return;

            setSections((prev) => {
              let next = prev;
              if (type === 'INSERT' && newRow) {
                const item = apiToItem(newRow);
                next = prev.map((s) =>
                  s.id === (newRow.section_id ?? null)
                    ? { ...s, items: [...(s.items || []), item] }
                    : s
                );
              } else if (type === 'UPDATE' && newRow) {
                const item = apiToItem(newRow);
                const newSectionId = newRow.section_id ?? null;
                const oldSectionId = oldRow?.section_id ?? newSectionId;
                next = prev.map((s) => {
                  // If section changed, remove from old and add to new
                  if (s.id === oldSectionId && oldSectionId !== newSectionId) {
                    return { ...s, items: (s.items || []).filter((it) => it.id !== item.id) };
                  }
                  if (s.id === newSectionId) {
                    const exists = (s.items || []).some((it) => it.id === item.id);
                    const items = exists
                      ? (s.items || []).map((it) => (it.id === item.id ? item : it))
                      : [ ...(s.items || []), item ];
                    return { ...s, items };
                  }
                  return s;
                });
              } else if (type === 'DELETE' && oldRow) {
                const delId = oldRow.id;
                next = prev.map((s) => ({
                  ...s,
                  items: (s.items || []).filter((it) => it.id !== delId),
                }));
              }
              // Persist cache + notify
              persist(next);
              return next;
            });
          } catch (e) {
            console.error('Realtime granular update failed:', e);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, persist]);


const getSectionOrd = (s: MenuSection) =>
  ((s as any).ord ?? (s as any).sortIndex ?? 0);

  /* sections */

    const createSection = useCallback(
      async (data: Partial<MenuSection>): Promise<MenuSection> => {
        // Find the highest existing ord (fallback to length)
        const currentMax =
          sections.length > 0
            ? Math.max(
                ...sections.map(s => (('ord' in (s as any) && (s as any).ord != null)
                  ? (s as any).ord
                  : (('sortIndex' in (s as any) && (s as any).sortIndex != null) ? (s as any).sortIndex : 0)))
              )
            : 0;

        const nextOrd = currentMax > 0 ? currentMax + 1 : sections.length + 1;

        const rows = [
          sectionToApi({
            id: data.id,                         // allow server to generate if missing
            name: (data.name || 'Untitled').trim(),
            ord: nextOrd,                        // ⬅️ always append at end (1..N)
            isActive: data.isActive !== false,   // default active
          }),
        ];

        const saved = await apiFetch<any[]>(tenantId, "/sections/bulk", {
          method: "POST",
          body: JSON.stringify({ rows }),
        });

        const created = apiToSection(saved[0]);
        const next = [...sections, { ...created, items: [] }];
        persist(next);
        return created;
      },
      [sections, tenantId]
    );

  const updateSection = useCallback(
    async (id: string, patch: Partial<MenuSection>) => {
      const rows = [sectionToApi({ id, ...patch })];
      const saved = await apiFetch<any[]>(tenantId, "/sections/bulk", {
        method: "POST",
        body: JSON.stringify({ rows }),
      });
      const savedById = new Map(saved.map((s: any) => [s.id, apiToSection(s)]));
      const next = sections.map((s) =>
        savedById.has(s.id)
          ? { ...s, ...savedById.get(s.id)!, items: s.items }
          : s
      );
      persist(next);
    },
    [sections, tenantId]
  );

  const refreshMenu = useCallback(async () => {
    const secsRaw = await apiFetch<any[]>(tenantId, "/sections", { method: "GET" });
    const secs = (secsRaw || [])
      .filter((r: any) => (r?.tenant_id ?? tenantId) === tenantId)
      .map(apiToSection);
    const itemsBySection: Record<string, MenuItem[]> = {};
    await Promise.all(
      secs.map(async (s) => {
        if (!isUuidV4(s.id)) {
          itemsBySection[s.id] = [];
          return;
        }
        const listRaw = await apiFetch<any[]>(
          tenantId,
          `/items?sectionId=${encodeURIComponent(s.id)}`,
          { method: "GET" }
        );
        // Strict tenant & section isolation on client mapping
        itemsBySection[s.id] = (listRaw || [])
          .filter((r: any) => (r?.tenant_id ?? tenantId) === tenantId && (r?.section_id ?? s.id) === s.id)
          .map(apiToItem);
      })
    );
    const merged = attachItemsToSections(secs, itemsBySection);
    persist(merged);
  }, [tenantId, persist]);

  // Alias for callers that specifically want to refresh sections (and their items)
  const refreshSections = useCallback(async () => {
    await refreshMenu();
  }, [refreshMenu]);


  const reorderSections = useCallback(
    async (orderedIds: string[]) => {
      // Server: persist order (expects { order: string[] })
      await apiFetch<any[]>(tenantId, "/sections/reorder", {
        method: "POST",
        body: JSON.stringify({ order: orderedIds }),
      });

      // Optimistic local update: reorder sections to match orderedIds and update ord/sortIndex (1-based)
      const indexOf = new Map(orderedIds.map((id, idx) => [id, idx]));
      const next = sections
        .slice()
        .sort((a, b) => (indexOf.get(a.id) ?? 0) - (indexOf.get(b.id) ?? 0))
        .map((s) => {
          const idx = indexOf.get(s.id) ?? 0;
          return { ...s, ord: idx + 1, sortIndex: idx + 1 } as any;
        });
      persist(next);

      // Authoritative refresh: ensure UI matches server truth (avoids drift)
      await refreshSections();
    },
    [sections, tenantId, refreshSections]
  );

  const archiveSection = useCallback(
    async (id: string) => {
      if (!sections.some(s => s.id === id)) {
        throw new Error("Section does not belong to this tenant");
      }
      await apiFetch<{ deleted: number }>(tenantId, "/sections/delete-bulk", {
        method: "POST",
        body: JSON.stringify({ ids: [id] }),
      });
      persist(sections.filter((s) => s.id !== id));
    },
    [sections, tenantId]
  );

  /* items */

  const createItem = useCallback(
    async (data: Partial<MenuItem>): Promise<MenuItem> => {
            // Strict tenant validation: provided section must exist in this tenant snapshot
      const providedSectionId = (data as any).sectionId ?? null;
      if (providedSectionId && !sections.some(s => s.id === providedSectionId)) {
        throw new Error("Invalid section for this tenant");
      }
      const rows = [
        itemToApi({
          id: (data as any).id,
          sectionId: (data as any).sectionId ?? null,
          name: data.name || "Unnamed",
          price: (data as any).price ?? 0,
          ord: typeof (data as any).ord === "number" ? (data as any).ord : 0,
          isAvailable: (data as any).isAvailable !== false,
          imageUrl: (data as any).imageUrl ?? null,
          description: (data as any).description ?? null,
          tags: (data as any).tags ?? [],
          calories: (data as any).calories ?? null,
          spicyLevel: (data as any).spicyLevel ?? null,
          preparationTime: (data as any).preparationTime ?? null,
        }),
      ];
      const saved = await apiFetch<any[]>(tenantId, "/items/bulk", {
        method: "POST",
        body: JSON.stringify({ rows }),
      });
      const created = apiToItem(saved[0]);
      const next = sections.map((s) =>
        s.id === (created as any).sectionId
          ? { ...s, items: [...(s.items || []), created] }
          : s
      );
      persist(next);
      return created;
    },
    [sections, tenantId]
  );

  const updateItem = useCallback(
    async (id: string, patch: Partial<MenuItem>) => {
            // Ensure the item belongs to this tenant snapshot before updating
      if (!sections.flatMap(s => s.items || []).some(it => it.id === id)) {
        throw new Error("Item does not belong to this tenant");
      }
      const rows = [itemToApi({ id, ...patch })];
      const saved = await apiFetch<any[]>(tenantId, "/items/bulk", {
        method: "POST",
        body: JSON.stringify({ rows }),
      });
      const savedById = new Map(saved.map((i: any) => [i.id, apiToItem(i)]));
      const next = sections.map((s) => ({
        ...s,
        items: (s.items || []).map((it) =>
          savedById.get(it.id) ? savedById.get(it.id)! : it
        ),
      }));
      persist(next);
    },
    [sections, tenantId]
  );

  const toggleItemAvailability = useCallback(
    async (id: string) => {
      const cur = sections
        .flatMap((s) => s.items || [])
        .find((i: any) => i.id === id);
      if (!cur) return;

      const updated = await apiFetch<any>(
        tenantId,
        `/items/${encodeURIComponent(id)}/toggle`,
        {
          method: 'PATCH',
          body: JSON.stringify({ is_available: !cur.isAvailable }),
        }
      );
      const updatedItem = apiToItem(updated);
      const next = sections.map((s) => ({
        ...s,
        items: (s.items || []).map((it) => (it.id === id ? updatedItem : it)),
      }));
      persist(next);
    },
    [sections, tenantId]
  );

  const archiveItem = useCallback(
    async (id: string) => {
            // Ensure the item belongs to this tenant snapshot before archiving
      if (!sections.flatMap(s => s.items || []).some(it => it.id === id)) {
        throw new Error("Item does not belong to this tenant");
      }
      await apiFetch<{ deleted: number }>(tenantId, "/items/delete-bulk", {
        method: "POST",
        body: JSON.stringify({ ids: [id] }),
      });
      const next = sections.map((s) => ({
        ...s,
        items: (s.items || []).filter((i) => i.id !== id),
      }));
      persist(next);
    },
    [sections, tenantId]
  );

  const reorderItems = useCallback(
    async (sectionId: string, orderedIds: string[]) => {
      const rows = orderedIds.map((id, idx) => itemToApi({ id, ord: idx }));
      await apiFetch<any[]>(tenantId, "/items/bulk", {
        method: "POST",
        body: JSON.stringify({ rows }),
      });
      const mapOrd = new Map(rows.map((r: any) => [r.id, r.ord!]));
      const next = sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: (s.items || [])
                .slice()
                .sort(
                  (a, b) =>
                    (mapOrd.get(a.id) ?? 0) - (mapOrd.get(b.id) ?? 0)
                ),
            }
          : s
      );
      persist(next);
    },
    [sections, tenantId]
  );

  const moveItem = useCallback(
    async (itemId: string, toSectionId: string, toIndex = 0) => {
            // Ensure destination section exists in this tenant snapshot
      if (!sections.some(s => s.id === toSectionId)) {
        throw new Error("Destination section does not belong to this tenant");
      }
      const rows = [itemToApi({ id: itemId, sectionId: toSectionId, ord: toIndex })];
      await apiFetch<any[]>(tenantId, "/items/bulk", {
        method: "POST",
        body: JSON.stringify({ rows }),
      });

      const cur = sections
        .flatMap((s) => s.items || [])
        .find((i) => i.id === itemId);

      const next = sections.map((s) => {
        let items = s.items || [];
        items = items.filter((i) => i.id !== itemId);
        if (s.id === toSectionId && cur) {
          const copy = items.slice();
          copy.splice(toIndex, 0, { ...cur, sectionId: toSectionId } as any);
          items = copy;
        }
        return { ...s, items };
      });
      persist(next);
    },
    [sections, tenantId]
  );


  const bulkUpload = useCallback(
    async (items: BulkUploadItem[]): Promise<BulkUploadResult> => {
      let sectionsUpserted = 0;
      const rowsToSave: any[] = [];
      // Start from current sections snapshot we can mutate
      let nextSections: MenuSection[] = JSON.parse(JSON.stringify(sections));

      for (const row of items) {
        let sectionId = row.sectionId ?? null;

        // create/find section by name if necessary
        if (!sectionId && row.sectionName) {
          const found = nextSections.find(
            (s) => (s.name || '').trim().toLowerCase() === row.sectionName!.trim().toLowerCase()
          );
          if (found) sectionId = found.id;
          else {
            const createdRaw = await apiFetch<any[]>(tenantId, '/sections/bulk', {
              method: 'POST',
              body: JSON.stringify({
                rows: [
                  sectionToApi({
                    name: row.sectionName,
                    isActive: true,
                    ord: nextSections.length + sectionsUpserted,
                  }),
                ],
              }),
            });
            const created = apiToSection(createdRaw[0]);
            sectionId = created.id;
            sectionsUpserted += 1;
            nextSections = [...nextSections, { ...created, items: [] }];
          }
        }

        rowsToSave.push(
          itemToApi({
            sectionId,
            name: row.name,
            price: Number(row.price) || 0,
            ord: typeof row.ord === 'number' ? row.ord : 0,
            isAvailable: row.isAvailable !== false,
            imageUrl: row.imageUrl ?? null,
            description: row.description ?? null,
            tags: row.tags ?? [],
            calories: row.calories ?? null,
            spicyLevel: row.spicyLevel ?? null,
            preparationTime: row.preparationTime ?? null,
          })
        );
      }

      const saved = await apiFetch<any[]>(tenantId, '/items/bulk', {
        method: 'POST',
        body: JSON.stringify({ rows: rowsToSave }),
      });

      // Merge returned items into local state (upsert per section)
      const savedItems = saved.map(apiToItem);
      for (const it of savedItems) {
        nextSections = nextSections.map((s) => {
          if (s.id !== (it as any).sectionId) return s;
          const exists = (s.items || []).some((i) => i.id === it.id);
          const items = exists
            ? (s.items || []).map((i) => (i.id === it.id ? it : i))
            : [ ...(s.items || []), it ];
          return { ...s, items };
        });
      }

      persist(nextSections);

      return {
        sectionsUpserted,
        itemsUpserted: saved.length,
        itemsSkipped: 0,
        warnings: [],
      };
    },
    [sections, tenantId]
  );



  /**
   * Toggle availability of ALL items inside a section (eye icon behavior)
   * - Keeps the section visible in management
   * - Greys out / re-enables items in the customer Menu
   * - Syncs Manage Sections "Active" pill to item availability
   */
  const toggleSectionItems = useCallback(
    async (sectionId: string, nextAvailable: boolean) => {
      if (!sections.some(s => s.id === sectionId)) {
        throw new Error("Section does not belong to this tenant");
      }
      // 1) Optimistic local update: flip all items + section.isActive
      const optimistic = sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              isActive: !!nextAvailable, // keep pill in sync immediately
              items: (s.items || []).map((it) => ({ ...it, isAvailable: nextAvailable, is_available: nextAvailable })),
            }
          : s
      );
      persist(optimistic);

      try {
        // 2) Server: toggle items availability for the section (scoped by tenant)
        await apiFetch<{ updated: number }>(
          tenantId,
          `/sections/${encodeURIComponent(sectionId)}/toggle-items`,
          {
            method: 'POST',
            body: JSON.stringify({ available: !!nextAvailable }),
          }
        );

        // 3) Best-effort: keep section's is_active in sync (do not fail UX if this errors)
        try {
          await apiFetch<any>(
            tenantId,
            `/sections/${encodeURIComponent(sectionId)}/toggle`,
            {
              method: 'PATCH',
              body: JSON.stringify({ is_active: !!nextAvailable }),
            }
          );
        } catch (syncErr) {
          console.warn('Section is_active sync failed (non-fatal):', syncErr);
        }
        // No full refresh here; optimistic state already applied
      } catch (e) {
        console.error('toggleSectionItems failed, reverting:', e);
        // Revert to server truth as a fallback only
        await refreshSections();
        throw e;
      }
    },
    [sections, tenantId, persist, refreshSections]
  );

  return {
    sections,
    loading,
    error,
    filters,
    setFilters,
    availableTags,
    availableAllergens,
    createSection,
    updateSection,
    reorderSections,
    archiveSection,
    createItem,
    updateItem,
    toggleItemAvailability,
    archiveItem,
    reorderItems,
    moveItem,
    toggleSectionItems,
    bulkUpload,
    refreshSections,
    refreshMenu,
  };
}