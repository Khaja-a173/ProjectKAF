import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { listZones, upsertZones, deleteZones, listTables } from "@/lib/api";
import { subscribeZones } from "@/lib/realtime";

export type Zone = { id: string; name: string; color: string; ord: number };

type Ctx = {
  zones: Zone[];
  setZones: React.Dispatch<React.SetStateAction<Zone[]>>;
  persistZones: () => Promise<void>;               // push to backend + cache
  removeZones: (ids: string[]) => Promise<void>;   // delete in backend + cache
  reloadZones: () => Promise<void>;                // pull fresh from backend or cache
};

const ZonesContext = createContext<Ctx | undefined>(undefined);

export const ZonesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tenantId = "" } = useTenant();
  const storageKey = useMemo(() => (tenantId ? `pkaf:tm:zones:${tenantId}` : null), [tenantId]);
  const [zones, setZones] = useState<Zone[]>([]);

  const reloadZones = useCallback(async () => {
    const cacheKey = storageKey;

    // 1) Backend first
    if (tenantId) {
      try {
        const rows = await listZones(tenantId);
        if (Array.isArray(rows)) {
          const z = rows
            .map(r => ({ id: r.zone_id, name: r.name, color: r.color, ord: r.ord ?? 0 }))
            .sort((a, b) => a.ord - b.ord);
          setZones(z);
          try { if (cacheKey) localStorage.setItem(cacheKey, JSON.stringify(z)); } catch {}
          return;
        }
      } catch (e: any) {
        console.warn("listZones failed, falling back to cache", e);
      }
    }

    // 2) Cache fallback (tenant-scoped)
    if (cacheKey) {
      try {
        const raw = localStorage.getItem(cacheKey);
        if (raw) {
          const cached = JSON.parse(raw);
          if (Array.isArray(cached)) {
            setZones(cached);
            return;
          }
        }
      } catch (e) { console.warn('Failed to parse cached zones', e); }
    }
    // 3) Keep current zones as-is
  }, [storageKey, tenantId]);

  // Initial load: backend first, then cache fallback (non-destructive)
  useEffect(() => { reloadZones(); }, [reloadZones]);

  // cross-tab sync (same-tenant only)
  useEffect(() => {
    if (!storageKey) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== storageKey) return;
      if (typeof e.newValue !== 'string') return;
      try {
        const next = JSON.parse(e.newValue);
        if (Array.isArray(next)) setZones(next);
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [storageKey]);

  useEffect(() => {
    if (!tenantId) return;
    const unsub = subscribeZones(tenantId, () => reloadZones());
    return () => {
      try { unsub(); } catch (e) { console.error('unsubscribe failed', e); }
    };
  }, [tenantId, reloadZones]);

  const persistZones = async () => {
    const payload = zones
      .map((z, idx) => ({
        zone_id: z.id,
        name: z.name,
        color: z.color,
        ord: typeof z.ord === 'number' ? z.ord : idx,
      }))
      .sort((a, b) => a.ord - b.ord);

    // 1) Backend is source of truth now
    try {
      if (tenantId) {
        await upsertZones(tenantId, payload);
      }
    } catch (e) {
      console.error('upsertZones failed', e);
      // Do not throw; continue to cache so UI remains usable
    }

    // 2) Update cache for fast reloads
    try { if (storageKey) localStorage.setItem(storageKey, JSON.stringify(zones)); } catch {}

    // 3) Reload from backend (or cache fallback) to ensure canonical order
    await reloadZones();
  };

  const removeZones = async (ids: string[]) => {
    if (!ids?.length) return;

    // Check for tables assigned to these zones
    try {
      if (tenantId) {
        const res: any = await listTables(tenantId);
        const rows: any[] = Array.isArray(res?.tables)
          ? res.tables
          : Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : [];

        const tablesInZones = rows.filter((t: any) => ids.includes(t.zone));
        if (tablesInZones.length > 0) {
          const zoneNames = ids
            .map((zid) => zones.find((z) => z.id === zid)?.name || zid)
            .join(", ");
          alert(
            `Cannot delete zone(s): ${zoneNames}. Please move or delete ${tablesInZones.length} table(s) first.`
          );
          return; // Abort deletion
        }
      }
    } catch (err) {
      console.error("Failed to validate tables before deletion", err);
      alert("Unable to validate tables for this zone. Please try again.");
      return;
    }

    // --- optimistic remove + reindex ord ---
    const toDelete = new Set(ids);
    const prev = zones;
    const next = prev
      .filter((z) => !toDelete.has(z.id))
      .map((z, idx) => ({ ...z, ord: idx }));

    setZones(next);
    try {
      if (storageKey) localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {}

    try {
      if (tenantId) {
        await deleteZones(tenantId, ids);
        if (next.length) {
          await upsertZones(
            tenantId,
            next.map((z) => ({
              zone_id: z.id,
              name: z.name,
              color: z.color,
              ord: z.ord,
            }))
          );
        }
      }
      await reloadZones();
    } catch (e) {
      // rollback on failure (most likely backend issue). Keep UI consistent.
      setZones(prev);
      try { if (storageKey) localStorage.setItem(storageKey, JSON.stringify(prev)); } catch {}
      console.error('removeZones failed', e);
    }
  };

  return (
    <ZonesContext.Provider value={{ zones, setZones, persistZones, removeZones, reloadZones }}>
      {children}
    </ZonesContext.Provider>
  );
};

export const useZones = () => {
  const ctx = useContext(ZonesContext);
  if (!ctx) throw new Error("useZones must be used within ZonesProvider");
  return ctx;
};