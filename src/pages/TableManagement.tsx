import { useState, useEffect } from "react";
import { toast } from 'react-hot-toast';
import React from "react";
import { useTenant } from "../contexts/TenantContext";
import { useZones } from "@/contexts/ZonesContext";
import { Link } from "react-router-dom";
import {
  ChefHat,
  Grid3X3,
  Users,
  Clock,
  MapPin,
  Settings,
  Plus,
  Edit,
  Trash2,
  QrCode,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Timer,
  UserCheck,
  Coffee,
  Utensils,
  Eye,
  RotateCcw,
  Split,
  Merge,
  Bell,
  Download,
  Filter,
  Search,
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  X,
  ArrowLeft,
  CornerUpLeft,
  ChevronDown,
} from "lucide-react";

import {
  listTables as sbListTables,
  upsertTablesBulk as sbUpsertTablesBulk,
  deleteTablesBulk as sbDeleteTablesBulk,
  createOrderForTable as sbCreateOrderForTable,
  closeOrderForTable as sbCloseOrderForTable,
  getTMSettings,
  saveTMSettings,
} from "../lib/api";

import {
  subscribeTables,
  subscribeTableSessions,
  subscribeReservations,
  subscribeZones,
} from "../lib/realtime";
// QR generation is loaded on-demand via dynamic import('qrcode')

interface Table {
  id: string;
  number: string;
  capacity: number;
  zone: string;
  status: "available" | "held" | "occupied" | "cleaning" | "out-of-service";
  session?: TableSession;
  position: { x: number; y: number };
  qrCode: string;
  notes?: string;
  _pendingCreate?: boolean;
  _pendingDelete?: boolean;
}

interface TableSession {
  id: string;
  tableId: string;
  customerName?: string;
  partySize: number;
  startTime: Date;
  status: "pending" | "active" | "paying" | "closed";
  waiter?: string;
  orderCount: number;
  totalAmount: number;
  elapsedTime: string;
}

interface TMSettings {
  holdMinutes: number;
  cleaningMinutes: number;
  allowTransfers: boolean;
  allowMergeSplit: boolean;
  requireManagerOverride: boolean;
}


interface Zone {
  id: string;
  name: string;
  color: string;
  tables: number;
  capacity: number;
  ord?: number; // optional for safety, context provides it
}

// ---------- Zones helpers (tenant-scoped) ----------

const ZONE_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444",
  "#06B6D4", "#D946EF", "#F97316", "#22C55E"
];

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");


export default function TableManagement() {
  const { tenantId = "" } = useTenant?.() || ({} as any);
  const [isSaving, setIsSaving] = useState(false);
  // Persistence state (for Save Changes flow)
  const [dirty, setDirty] = useState(false);
  const [isPersisting, setIsPersisting] = useState(false);
  const [original, setOriginal] = useState<Table[]>([]);
  const [pendingDeletes, setPendingDeletes] = useState<string[]>([]);

  // Table Management settings (tenant-scoped, persisted locally for now)
  const [settings, setSettings] = useState<TMSettings>({
    holdMinutes: 15,
    cleaningMinutes: 10,
    allowTransfers: true,
    allowMergeSplit: true,
    requireManagerOverride: false,
  });
  const [settingsSaveState, setSettingsSaveState] = useState<'idle'|'saving'|'success'|'error'>('idle');
  const [settingsSaveMsg, setSettingsSaveMsg] = useState<string>('');
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  // Quick actions dropdown open state
  const [qaOpen, setQaOpen] = useState(false);

  // Force a re-render every minute for live elapsed/analytics
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 1_000_000), 60_000);
    return () => clearInterval(id);
  }, []);
  // Load settings from backend (fallback to localStorage)
    useEffect(() => {
      let alive = true;
      (async () => {
        const key = `pkaf:tm:settings:${tenantId || 'default'}`;
        try {
          if (tenantId) {
            const s = await getTMSettings(tenantId);
            if (!alive) return;
            if (s) {
              setSettings({
                holdMinutes: s.hold_minutes,
                cleaningMinutes: s.cleaning_minutes,
                allowTransfers: s.allow_transfers,
                allowMergeSplit: s.allow_merge_split,
                requireManagerOverride: s.require_manager_override,
              });
              try {
                localStorage.setItem(
                  key,
                  JSON.stringify({
                    holdMinutes: s.hold_minutes,
                    cleaningMinutes: s.cleaning_minutes,
                    allowTransfers: s.allow_transfers,
                    allowMergeSplit: s.allow_merge_split,
                    requireManagerOverride: s.require_manager_override,
                  })
                );
              } catch {}
              return;
            }
          }
        } catch {}
        // fallback to local
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            setSettings((prev) => ({ ...prev, ...parsed }));
          }
        } catch {}
      })();
      return () => {
        alive = false;
      };
    }, [tenantId]);

  const persistSettings = async () => {
    const key = `pkaf:tm:settings:${tenantId || 'default'}`;
    try {
      if (tenantId) {
        await saveTMSettings(tenantId, {
          hold_minutes: settings.holdMinutes,
          cleaning_minutes: settings.cleaningMinutes,
          allow_transfers: settings.allowTransfers,
          allow_merge_split: settings.allowMergeSplit,
          require_manager_override: settings.requireManagerOverride,
        });
      }
    } catch {}
    try {
      localStorage.setItem(key, JSON.stringify(settings));
    } catch {}
    setSettings({ ...settings }); // force rerender
  };

  // QR Modal state
  const [qrTable, setQrTable] = useState<Table | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  // Quick View (Eye) panel state
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  // Add Tables modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<"single" | "bulk">("single");
  const [formZone, setFormZone] = useState<string>("");
  const [formTableNo, setFormTableNo] = useState<string>("");
  const [formStatus, setFormStatus] = useState<Table["status"]>("available");
  const [bulkZone, setBulkZone] = useState<string>("");
  const [bulkCount, setBulkCount] = useState<number>(1);

  // Seats for add flow
  const [formSeats, setFormSeats] = useState<number>(4);
  const [bulkSeats, setBulkSeats] = useState<number>(4);

  // Build the customer-facing deep link for a table (keeps multi-tenant in mind)
  const buildTableUrl = (t: Table) => {
    const base = window.location.origin;
    // Prefer a dedicated scan/entry route if present in your app
    const path = '/scan-entry';
    const params = new URLSearchParams();
    if (tenantId) params.set('tenantId', tenantId);
    params.set('table', t.id);
    return `${base}${path}?${params.toString()}`;
  };

  // Open QR modal and generate a PNG data URL using the lightweight 'qrcode' lib (loaded lazily)
  const openQrForTable = async (t: Table) => {
    setQrTable(t);
    setQrDataUrl(null);
    setQrLoading(true);
    const url = buildTableUrl(t);
    try {
      const mod: any = await import('qrcode');
      const dataUrl = await mod.toDataURL(url, { width: 240, margin: 1 });
      setQrDataUrl(dataUrl);
    } catch (e) {
      // Fallback: no lib installed – show the URL so user can scan/copy
      setQrDataUrl(`FALLBACK:${url}`);
    } finally {
      setQrLoading(false);
    }
  };

  // Normalize rows from API into our UI shape
  const toTable = (row: any): Table => {
    const id = String(row?.id ?? row?.table_id ?? row?.code ?? row?.table_number);
    const number = String(row?.number ?? row?.table_number ?? row?.code ?? id);
    // If the backend row has no identifier/number, drop it — never fabricate demo codes
    if (!id || !number) {
      throw new Error('Malformed table row: missing id/number');
    }
    const capacity = Number(row?.capacity ?? row?.seats ?? 4);
    const zone = String(row?.zone ?? row?.location ?? "");
    const statusRaw = String(row?.status ?? row?.computed_status ?? "available") as Table["status"];
    const locked = Boolean(row?.locked ?? row?.is_locked);
    const activeSession =
      row?.session ??
      row?.active_session ??
      (Array.isArray(row?.sessions)
        ? row.sessions.find((s: any) => ["active", "pending", "paying"].includes(s?.status))
        : undefined);
    // derive status precedence: occupied > held > cleaning > out-of-service > available
    let status: Table["status"] = statusRaw;
    if (activeSession) status = "occupied";
    else if (locked && status !== "occupied") status = "held";

    return {
      id,
      number,
      capacity,
      zone,
      status,
      position: row?.position ?? { x: 0, y: 0 },
      qrCode: row?.qr_code ?? row?.qrCode ?? "",
      notes: row?.notes,
      session: activeSession
        ? {
            id: String(activeSession?.id ?? activeSession?.session_id),
            tableId: id,
            customerName: activeSession?.customerName ?? activeSession?.customer_name,
            partySize: Number(activeSession?.partySize ?? activeSession?.party_size ?? 0),
            startTime: new Date(activeSession?.startTime ?? activeSession?.start_time ?? Date.now()),
            status: activeSession?.status ?? "active",
            waiter: activeSession?.waiter ?? undefined,
            orderCount: Number(activeSession?.orderCount ?? 0),
            totalAmount: Number(activeSession?.totalAmount ?? activeSession?.total ?? 0),
            elapsedTime: activeSession?.elapsedTime ?? "",
          }
        : undefined,
    };
  };

  // Guard: keep only rows that belong to the current tenant when backend includes tenant_id
  const belongsToTenant = (row: any) => {
    if (!tenantId) return false;
    const rid = row?.tenant_id ?? row?.tenantId ?? row?.tenant;
    // If backend already scopes by tenant header, some rows may omit tenant_id. Accept those.
    if (rid == null) return true;
    return String(rid) === String(tenantId);
  };

  // Initial load
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!tenantId) return;
      try {
        const rows: any[] = await sbListTables(tenantId);
        if (!alive) return;
        const mapped = rows
          .filter(belongsToTenant)
          .map((r) => { try { return toTable(r); } catch { return null as any; } })
          .filter(Boolean) as Table[];
        setTables(mapped as Table[]);
        setOriginal(mapped as Table[]);
        setDirty(false);
        setPendingDeletes([]);
      } catch (_) {
        // Backend unreachable or empty → strictly no defaults
        if (!alive) return;
        setTables([]);
        setOriginal([]);
        setDirty(false);
        setPendingDeletes([]);
      }
    })();
    return () => { alive = false; };
  }, [tenantId]);

  // Realtime subscriptions
  useEffect(() => {
    if (!tenantId) return;
    const unsubTables = (subscribeTables as any)?.(tenantId, {
      onInsert: (row: any) => setTables(prev => {
        if (!belongsToTenant(row)) return prev;
        const next = [...prev, toTable(row)];
        return next.sort((a,b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
      }),
      onUpdate: (row: any) => setTables(prev => {
        if (!belongsToTenant(row)) return prev;
        const rid = String(row?.id ?? row?.table_id);
        return prev.map(t => (t.id === rid) ? toTable({ ...t, ...row }) : t);
      }),
      onDelete: (row: any) => setTables(prev => {
        if (!belongsToTenant(row)) return prev;
        const rid = String(row?.id ?? row?.table_id);
        return prev.filter(t => t.id !== rid);
      }),
    }) ?? (() => {});

    const unsubSessions = (subscribeTableSessions as any)?.(tenantId, {
      onInsert: (s: any) => setTables(prev => {
        if (!belongsToTenant(s) && !belongsToTenant(s?.table)) return prev;
        const tableId = String(s?.tableId ?? s?.table_id);
        return prev.map(t => {
          if (t.id !== tableId) return t;
          return toTable({ ...t, session: s, status: "occupied" });
        });
      }),
      onUpdate: (s: any) => setTables(prev => {
        if (!belongsToTenant(s) && !belongsToTenant(s?.table)) return prev;
        const tableId = String(s?.tableId ?? s?.table_id);
        return prev.map(t => {
          if (t.id !== tableId) return t;
          const status = (s?.status === "closed" ? "available" : "occupied") as Table["status"];
          return toTable({ ...t, session: s, status });
        });
      }),
      onDelete: (s: any) => setTables(prev => {
        if (!belongsToTenant(s) && !belongsToTenant(s?.table)) return prev;
        const tableId = String(s?.tableId ?? s?.table_id);
        return prev.map(t => t.id === tableId ? { ...t, session: undefined, status: "available" } : t);
      }),
    }) ?? (() => {});

    const unsubResv = (subscribeReservations as any)?.(tenantId, {
      onInsert: (r: any) => setTables(prev => {
        if (!belongsToTenant(r)) return prev;
        return prev.map(t => {
          const code = String(r?.table_number ?? r?.code ?? r?.table?.number);
          if (t.number !== code) return t;
          return { ...t, status: t.status === "occupied" ? t.status : "held" };
        });
      }),
      onDelete: (r: any) => setTables(prev => {
        if (!belongsToTenant(r)) return prev;
        return prev.map(t => {
          const code = String(r?.table_number ?? r?.code ?? r?.table?.number);
          if (t.number !== code) return t;
          return { ...t, status: t.session ? "occupied" : "available" };
        });
      }),
    }) ?? (() => {});

    return () => {
      unsubTables?.();
      unsubSessions?.();
      unsubResv?.();
    };
  }, [tenantId]);

  const { zones, setZones, persistZones, reloadZones, removeZones } = useZones();
  // Map zone id -> name for consistent rendering across the page
  const zoneIdToName = React.useMemo(() => new Map(zones.map(z => [z.id, z.name])), [zones]);
  const zoneNameFor = (id?: string) => (id ? (zoneIdToName.get(id) || '—') : '—');
  // Zones realtime subscription for instant updates
  useEffect(() => {
    if (!tenantId) return;
    const unsub = subscribeZones(tenantId, async () => {
      await reloadZones();
      // Also refetch tables so any zone-driven changes are reflected immediately
      try {
        const rows: any[] = await sbListTables(tenantId);
        setTables(
          rows
            .filter(belongsToTenant)
            .map((r:any) => { try { return toTable(r); } catch { return null as any; } })
            .filter(Boolean) as Table[]
        );
      } catch {}
    });
    return () => {
      try { unsub(); } catch {}
    };
  }, [tenantId, reloadZones]);
  const [activeView, setActiveView] = useState<
    "floor" | "sessions" | "analytics" | "settings"
  >("floor");
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  // Initialize form zone selections from current zones/filters
  useEffect(() => {
    if (!zones.length) return;
    const fallback = zones[0].id;
    if (!formZone) setFormZone(selectedZone === 'all' ? fallback : selectedZone);
    if (!bulkZone) setBulkZone(selectedZone === 'all' ? fallback : selectedZone);
  }, [zones, selectedZone]);

  // Loaded from backend (Supabase) + kept in sync via realtime

// Loaded from backend (Supabase) + kept in sync via realtime
  const [tables, setTables] = useState<Table[]>([]);

// Derived counts for each zone (tables/capacity)
const zonesWithMetrics: Zone[] = zones.map(z => {
  const zTables = tables.filter(t => t.zone === z.id);
  return {
    id: z.id,
    name: z.name,
    color: z.color,
    ord: (z as any).ord,
    tables: zTables.length,
    capacity: zTables.reduce((sum, t) => sum + (t.capacity || 0), 0),
  };
});

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "held":
        return "bg-yellow-500";
      case "occupied":
        return "bg-blue-500";
      case "cleaning":
        return "bg-orange-500";
      case "out-of-service":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="w-4 h-4" />;
      case "held":
        return <Timer className="w-4 h-4" />;
      case "occupied":
        return <Users className="w-4 h-4" />;
      case "cleaning":
        return <RotateCcw className="w-4 h-4" />;
      case "out-of-service":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const filteredTables = tables.filter((table) => {
    const matchesZone = selectedZone === "all" || table.zone === selectedZone;
    const matchesStatus =
      selectedStatus === "all" || table.status === selectedStatus;
    const matchesSearch =
      table.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.session?.customerName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesZone && matchesStatus && matchesSearch;
  });

  const handleTableAction = (tableId: string, action: string) => {
    setTables((prev) =>
      prev.map((table) => {
        if (table.id === tableId) {
          switch (action) {
            case "hold":
              // Optimistic UI only — locking is managed via order/session lifecycle
              return { ...table, status: "held" as const };
            case "seat":
              if (tenantId) {
                (sbCreateOrderForTable as any)(tenantId, { tableId: table.id, partySize: 2 }).catch(()=>{});
              }
              return {
                ...table,
                status: "occupied" as const,
                session: {
                  id: `S${Date.now()}`,
                  tableId: table.id,
                  partySize: 2,
                  startTime: new Date(),
                  status: "active" as const,
                  orderCount: 0,
                  totalAmount: 0,
                  elapsedTime: "0m",
                },
              };
            case "clean":
              return { ...table, status: "cleaning" as const, session: undefined };
            case "available":
              if (table.session?.id) {
                (sbCloseOrderForTable as any)(table.session.id, "closed", "Set to Ready").catch(()=>{});
              }
              return { ...table, status: "available" as const, session: undefined };
            case "out-of-service":
              return { ...table, status: "out-of-service" as const, session: undefined };
            default:
              return table;
          }
        }
        return table;
      }),
    );
  };


  // Compute the next numeric suffix across all existing and pending tables
  const nextNumeric = () => {
    const nums = tables
      .map(t => parseInt(t.number.replace(/[^0-9]/g, ''), 10))
      .filter(n => Number.isFinite(n));
    return nums.length ? Math.max(...nums) + 1 : 1;
  };

  const formatTableCode = (n: number) => `T${String(n).padStart(2, '0')}`;

  const minutesBetween = (a?: Date | string, b?: Date | string) => {
    if (!a) return 0;
    const t0 = new Date(a).getTime();
    const t1 = b ? new Date(b).getTime() : Date.now();
    if (!Number.isFinite(t0) || !Number.isFinite(t1)) return 0;
    return Math.max(0, Math.floor((t1 - t0) / 60000));
  };

  const fmtElapsed = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };


  // Small concurrency helper (limit parallel requests)
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

  const handleAddTable = () => {
    if (!zones.length) {
      toast("Please create a zone in Settings first");
      return;
    }
    setAddMode("single");
    const fallback = zones[0]?.id || '';
    const chosen = selectedZone === 'all' ? (formZone || fallback) : selectedZone || fallback;
    setFormZone(chosen);
    setBulkZone(chosen);
    setFormTableNo("");
    setFormStatus("available");
    setFormSeats(4);
    setBulkZone(chosen || fallback);
    setBulkCount(1);
    setBulkSeats(4);
    setShowAddModal(true);
  };

  const handleAddSingleConfirm = () => {
    if (!zones.length) {
      toast("Please create a zone in Settings first");
      return;
    }
    let input = (formTableNo || "").trim().toUpperCase();
    let code: string;
    if (!input) {
      code = formatTableCode(nextNumeric()); // Txx
    } else {
      const asNum = parseInt(input.replace(/[^0-9]/g, ''), 10);
      code = Number.isFinite(asNum) ? formatTableCode(asNum) : input;
    }
    const optimistic: Table = {
      id: code,
      number: code,
      capacity: Math.max(1, Math.floor(formSeats || 1)),
      zone: formZone || zones[0]?.id || "",
      status: formStatus,
      position: { x: 0, y: 0 },
      qrCode: "",
      _pendingCreate: true,
    };
    setTables(prev => {
      if (prev.some(t => t.number === code)) return prev; // prevent duplicates
      return [...prev, optimistic].sort((a,b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
    });
    setDirty(true);
    setShowAddModal(false);
  };

  const handleAddBulkConfirm = () => {
    if (!zones.length) {
      toast("Please create a zone in Settings first");
      return;
    }
    const count = Math.max(1, Math.floor(bulkCount || 0));
    const start = nextNumeric();
    const items: Table[] = [];
    for (let i = 0; i < count; i++) {
      const code = formatTableCode(start + i);
      items.push({
        id: code,
        number: code,
        capacity: Math.max(1, Math.floor(bulkSeats || 1)),
        zone: bulkZone || zones[0]?.id || "",
        status: 'available',
        position: { x: 0, y: 0 },
        qrCode: '',
        _pendingCreate: true,
      });
    }
    setTables(prev => {
      const dedup = [...prev];
      for (const it of items) {
        if (!dedup.some(t => t.number === it.number)) dedup.push(it);
      }
      return dedup.sort((a,b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
    });
    setDirty(true);
    setShowAddModal(false);
  };

  const handleDeleteTable = (tableId: string) => {
    setTables((prev) => prev.filter(t => t.id !== tableId));
    setPendingDeletes((prev) => Array.from(new Set([...prev, tableId])));
    setDirty(true);
  };

  // Optimistically remove all tables in a given zone (for bulk delete)
  const handleClearZone = (zoneId: string) => {
    const idsToDelete = tables.filter(t => t.zone === zoneId).map(t => t.id);
    if (!idsToDelete.length) return;
    if (!confirm(`Remove all ${idsToDelete.length} tables in this zone? This can’t be undone until you Save.`)) return;
    setTables(prev => prev.filter(t => t.zone !== zoneId));
    setPendingDeletes(prev => Array.from(new Set([...prev, ...idsToDelete])));
    setDirty(true);
  };

  const handleSaveChanges = async () => {
    if (!tenantId) return;
    setIsPersisting(true);
    try {
      // Determine creates/updates and deletes relative to the original snapshot
      const current = tables;
      const origIds = new Set(original.map(t => t.id));
      const currIds = new Set(current.map(t => t.id));

      // Pending creates/updates: items present in current (not deleted)
      // (The backend bulk upsert endpoint will create or update as needed)
      const upsertTables = current.map(t => ({
        code: t.number,
        label: t.number,
        seats: t.capacity,
        status: t.status,
        zone: t.zone,
      }));

      // Pending deletes: union of explicit pendingDeletes and items removed from original
      const deletes = [
        ...pendingDeletes,
        ...original.filter(t => !currIds.has(t.id)).map(t => t.id),
      ];
      const uniqueDeletes = Array.from(new Set(deletes));

      // Persist upserts (always via bulk endpoint)
      let upsertedRows: any[] = [];
      if (upsertTables.length) {
        try {
          upsertedRows = await sbUpsertTablesBulk(tenantId, upsertTables as any);
        } catch (e) {
          console.error("Bulk upsert failed", e);
        }
      }

      // Persist deletes (always via bulk endpoint)
      if (uniqueDeletes.length) {
        try {
          // Resolve any optimistic IDs (like 'T01') to real IDs using the original snapshot
          const resolvedIds = uniqueDeletes.map(pid =>
            original.find(o => o.id === pid || o.number === pid)?.id
          ).filter((x): x is string => Boolean(x));
          if (resolvedIds.length) {
            await sbDeleteTablesBulk(tenantId, resolvedIds);
          }
        } catch (e) {
          console.error("Bulk delete failed", e);
        }
      }

      // If API returned upserted rows, try to map and merge immediately to avoid flicker
      let optimisticBase = tables;
      if (upsertedRows && upsertedRows.length) {
        try {
          const mappedUpserted = upsertedRows
            .map(toTable)
            .filter(t => t && t.number);
          const byCode = new Set(mappedUpserted.map(t => t.number));
          const optimisticByCode = new Map(optimisticBase.map(t => [t.number, t] as const));
          const enriched = mappedUpserted.map(mc => {
            const opt = optimisticByCode.get(mc.number);
            return opt ? { ...opt, ...mc } : mc;
          });
          optimisticBase = [
            ...optimisticBase.filter(t => !byCode.has(t.number)),
            ...enriched,
          ]
            .filter(t => !uniqueDeletes.includes(t.id))
            .sort((a,b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
          setTables(optimisticBase);
        } catch {}
      }

      // Fetch with small retries to wait for eventual consistency
      const fetchOnce = async () => {
        const rows: any[] = await sbListTables(tenantId);
        return rows
          .filter(belongsToTenant)
          .map((r:any) => { try { return toTable(r); } catch { return null as any; } })
          .filter(Boolean) as Table[];
      };

      let mapped: Table[] = [];
      const maxAttempts = 5;
      for (let i = 0; i < maxAttempts; i++) {
        mapped = await fetchOnce();
        const backendCodes = new Set(mapped.map(t => t.number));
        let allPresent = true;
        for (const t of upsertTables) { if (!backendCodes.has(t.code)) { allPresent = false; break; } }
        if (allPresent) break;
        await new Promise(r => setTimeout(r, 700));
      }

      if (!mapped.length) {
        mapped = original.length ? original : tables;
      }

      // Merge: keep any optimistic created tables that have not yet appeared from backend
      const backendByCode = new Map(mapped.map(t => [t.number, t] as const));
      const stillMissing = current.filter(t => !backendByCode.has(t.number));
      const merged = [
        ...mapped.filter(t => !uniqueDeletes.includes(t.id)),
        ...stillMissing,
      ]
        .filter((t, idx, arr) => arr.findIndex(x => x.number === t.number) === idx)
        .sort((a,b) => a.number.localeCompare(b.number, undefined, { numeric: true }));

      setTables(merged);
      setOriginal(merged);
      setPendingDeletes([]);
      setDirty(false);
      try { await reloadZones(); } catch {}
    } finally {
      setIsPersisting(false);
    }
  };

  const renderFloorView = () => (
    <div className="space-y-6">
      {/* Floor Controls */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tables or customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Zones</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="held">Held</option>
              <option value="occupied">Occupied</option>
              <option value="cleaning">Cleaning</option>
              <option value="out-of-service">Out of Service</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
                onClick={handleAddTable}
                disabled={!zones.length}
                title={!zones.length ? 'Create a zone in Settings first' : undefined}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${!zones.length ? 'bg-blue-400 cursor-not-allowed text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
              <Plus className="w-4 h-4" />
              <span>Add Table</span>
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export QR</span>
            </button>
            <button onClick={handleSaveChanges} disabled={!dirty || isPersisting || zones.length===0} className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${dirty && zones.length>0 ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-600/40 text-white/70 cursor-not-allowed'}`} title={zones.length===0 ? 'Create at least one zone in Settings first' : undefined}>
              <CheckCircle className="w-4 h-4" />
              <span>{isPersisting ? 'Saving…' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Zone Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {zonesWithMetrics.map((zone) => {
          const zoneTables = tables.filter((t) => t.zone === zone.id);
          const occupied = zoneTables.filter(
            (t) => t.status === "occupied",
          ).length;
          const available = zoneTables.filter(
            (t) => t.status === "available",
          ).length;

          return (
            <div key={zone.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleClearZone(zone.id)}
                    className="text-xs px-2 py-1 rounded-md border border-red-200 text-red-700 hover:bg-red-50"
                    title="Remove all tables in this zone"
                  >
                    Clear Zone
                  </button>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: zone.color }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Occupied</span>
                  <span className="font-medium text-blue-600">
                    {occupied}/{zoneTables.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Available</span>
                  <span className="font-medium text-green-600">
                    {available}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${zoneTables.length ? (occupied / zoneTables.length) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floor Layout & Status (combined) */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Floor Layout &amp; Status</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
              <span>Held</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
              <span>Occupied</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
              <span>Cleaning</span>
            </div>
          </div>
        </div>

        {/* Floor grid */}
        <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl p-4 ring-1 ring-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-4">
            {filteredTables
              .slice()
              .sort((a, b) => a.number.localeCompare(b.number))
              .map((table) => {
                const statusToTailwind = {
                  available: 'bg-green-500',
                  held: 'bg-yellow-500',
                  occupied: 'bg-blue-500',
                  cleaning: 'bg-orange-500',
                  'out-of-service': 'bg-red-500',
                } as const;
                const borderColor = {
                  available: 'border-green-500',
                  held: 'border-yellow-500',
                  occupied: 'border-blue-500',
                  cleaning: 'border-orange-500',
                  'out-of-service': 'border-red-500',
                }[table.status] || 'border-gray-300';
                const dotColor = statusToTailwind[table.status] || 'bg-gray-400';

                return (
                  <div key={table.id} className="group">
                    <div className={`w-full bg-white rounded-lg shadow-sm ring-1 ring-gray-200 border-l-4 ${borderColor} px-4 py-3 min-h-[120px] transition-all duration-200 group-hover:shadow-md`}>
                      {/* Header: status dot + code + capacity pill */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                          <div className="relative mr-3">
                            <span className={`inline-block w-2.5 h-2.5 rounded-full ${dotColor}`}></span>
                            {table.status === 'occupied' && (
                              <span className={`absolute inset-0 rounded-full ${dotColor} opacity-40 animate-ping`}></span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-gray-900">{table.number}</div>
                            <div className="mt-0.5 text-xs text-gray-500">
                              {zoneNameFor(table.zone)}
                            </div>
                          </div>
                        </div>
                        <div className="ml-3 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{table.capacity}p</div>
                      </div>

                      {/* Meta line: status + elapsed + session snippet */}
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <div className="text-gray-600 capitalize">
                          {table.status.replace('-', ' ')}
                          {table.session ? <span className="ml-2 text-gray-400">• {table.session.elapsedTime}</span> : null}
                        </div>
                        <div className="text-gray-700 truncate">
                          {table.session ? (
                            <span>{table.session.customerName || 'Guest'} • {table.session.partySize} guests</span>
                          ) : (
                            <span className="text-gray-400">No session</span>
                          )}
                        </div>
                      </div>

                      {/* Actions tray: conditional status actions + utility icons */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          {table.status === 'available' && (
                            <button onClick={() => handleTableAction(table.id, 'hold')} className="px-2.5 py-1 rounded-md bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200">Hold</button>
                          )}
                          {table.status === 'held' && (
                            <button onClick={() => handleTableAction(table.id, 'seat')} className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200">Seat</button>
                          )}
                          {table.status === 'occupied' && (
                            <button onClick={() => handleTableAction(table.id, 'clean')} className="px-2.5 py-1 rounded-md bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200">Clean</button>
                          )}
                          {table.status === 'cleaning' && (
                            <button onClick={() => handleTableAction(table.id, 'available')} className="px-2.5 py-1 rounded-md bg-green-50 text-green-700 hover:bg-green-100 border border-green-200">Ready</button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openQrForTable(table)}
                            title="Show QR"
                            className="p-2 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedTable(table)}
                            title="View details"
                            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTable(table.id)}
                            title="Remove table"
                            className="p-2 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

      </div>
    </div>
  );

  const renderSessionsView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
          <div className="text-sm text-gray-500">Updates every minute</div>
        </div>

        <div className="space-y-4">
          {tables.filter((t) => t.session && t.status === 'occupied').length === 0 && (
            <div className="text-sm text-gray-500">No active sessions.</div>
          )}

          {tables
            .filter((t) => t.session && t.status === 'occupied')
            .sort((a,b) => {
              const am = minutesBetween(a.session?.startTime as any);
              const bm = minutesBetween(b.session?.startTime as any);
              return bm - am; // longest running first
            })
            .map((table) => {
              const mins = minutesBetween(table.session?.startTime as any);
              const elapsed = fmtElapsed(mins);
              return (
                <div key={table.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg ${getStatusColor(table.status)} flex items-center justify-center text-white font-semibold`}>
                        {table.number}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{table.session?.customerName || 'Guest'}</h4>
                        <p className="text-sm text-gray-500">{table.session?.partySize} guests • {zoneNameFor(table.zone)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">${table.session?.totalAmount ?? 0}</div>
                      <div className="text-sm text-gray-500">{elapsed}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">Waiter: {table.session?.waiter || '—'}</span>
                      <span className="text-sm text-gray-600">Orders: {table.session?.orderCount ?? 0}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button disabled={!settings.allowTransfers} className={`text-blue-600 hover:text-blue-800 text-sm ${settings.allowTransfers ? '' : 'opacity-40 cursor-not-allowed'}`}>Transfer</button>
                      <button disabled={!settings.allowMergeSplit} className={`text-orange-600 hover:text-orange-800 text-sm ${settings.allowMergeSplit ? '' : 'opacity-40 cursor-not-allowed'}`}>Split</button>
                      <button
                        onClick={() => handleTableAction(table.id, 'available')}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >Close &amp; Ready</button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );

  const renderAnalyticsView = () => {
    const total = tables.length || 0;
    const occupied = tables.filter(t => t.status === 'occupied').length;
    const held = tables.filter(t => t.status === 'held').length;
    const cleaning = tables.filter(t => t.status === 'cleaning').length;
    const available = tables.filter(t => t.status === 'available').length;

    const utilization = total ? Math.round((occupied / total) * 100) : 0;

    const sessions = tables.filter(t => t.session && t.status === 'occupied');
    const turnMins = sessions.map(t => minutesBetween(t.session?.startTime as any));
    const avgTurn = turnMins.length ? Math.round(turnMins.reduce((a,b) => a+b, 0) / turnMins.length) : 0;

    const totalRevenue = sessions.reduce((sum, t) => sum + (t.session?.totalAmount || 0), 0);
    const seatHours = sessions.reduce((sum, t) => sum + ((minutesBetween(t.session?.startTime as any) / 60) * (t.capacity || 1)), 0);
    const revenuePerSeatHour = seatHours > 0 ? (totalRevenue / seatHours) : 0;

    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Table Utilization</p>
                <p className="text-2xl font-bold text-gray-900">{utilization}%</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">Occupied {occupied} / {total} tables</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Turn Time</p>
                <p className="text-2xl font-bold text-gray-900">{fmtElapsed(avgTurn)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">Across {sessions.length} active sessions</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue/Seat/Hour</p>
                <p className="text-2xl font-bold text-gray-900">${revenuePerSeatHour.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">Revenue ${totalRevenue.toFixed(2)} today (active)</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Held & Cleaning</p>
                <p className="text-2xl font-bold text-gray-900">{held} / {cleaning}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">Available {available}</div>
          </div>
        </div>

        {/* Utilization by Zone */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilization by Zone</h3>
            <div className="space-y-4">
              {zones.map((zone) => {
                const zoneTables = tables.filter(t => t.zone === zone.id);
                const occ = zoneTables.filter(t => t.status === 'occupied').length;
                const util = zoneTables.length ? Math.round((occ / zoneTables.length) * 100) : 0;
                return (
                  <div key={zone.id}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{zone.name}</span>
                      <span className="text-sm text-gray-600">{util}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${util}%`, backgroundColor: zone.color }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
            <div className="space-y-3">
              {[
                { label: 'Available', value: available, color: 'bg-green-500' },
                { label: 'Held', value: held, color: 'bg-yellow-500' },
                { label: 'Occupied', value: occupied, color: 'bg-blue-500' },
                { label: 'Cleaning', value: cleaning, color: 'bg-orange-500' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`w-3 h-3 rounded-full ${row.color}`}></span>
                    <span className="text-sm text-gray-700">{row.label}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Zones CRUD in settings
const [newZoneName, setNewZoneName] = useState("");

const addZone = () => {
  const name = newZoneName.trim();
  if (!name) return;
  let baseId = slugify(name) || `zone-${zones.length+1}`;
  let id = baseId, i = 2;
  while (zones.some(z => z.id === id)) id = `${baseId}-${i++}`;
  const color = ZONE_COLORS[zones.length % ZONE_COLORS.length];
  setZones(prev => [
    ...prev,
    { id, name, color, tables: 0, capacity: 0, ord: prev.length }
  ]);
  setNewZoneName("");
};

const renameZone = (id: string, name: string) =>
  setZones(prev => prev.map(z => z.id === id ? { ...z, name } : z));

const moveZone = (id: string, dir: -1 | 1) =>
  setZones(prev => {
    const idx = prev.findIndex(z => z.id === id);
    if (idx < 0) return prev;
    const to = idx + dir;
    if (to < 0 || to >= prev.length) return prev;
    const copy = [...prev];
    const [it] = copy.splice(idx,1);
    copy.splice(to,0,it);
    return copy;
  });

  // Handler to delete a single zone
  const handleDeleteZone = async (id: string) => {
    const z = zones.find(zz => zz.id === id);
    const name = z?.name || id;
    if (!confirm(`Delete zone "${name}"? Tables in this zone will remain but lose their zone assignment.`)) return;
    try {
      // Persist deletion via context (backend + cache)
      await removeZones([id]);
      // Detach zone from existing tables locally to avoid orphan rendering
      setTables(prev => prev.map(t => t.zone === id ? { ...t, zone: '' } : t));
      // Reload zones to reflect order/gaps
      await reloadZones();
    } catch (e) {
      console.error('Failed to delete zone', id, e);
      toast('Failed to delete zone. Please try again.');
    }
  };

  const renderSettingsView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Table Management Settings</h3>

        <div className="space-y-6">
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Status Timers</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hold Timer (minutes)</label>
                <input
                  type="number"
                  value={settings.holdMinutes}
                  onChange={(e) => setSettings(s => ({ ...s, holdMinutes: Math.max(0, Number(e.target.value || 0)) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cleaning Timer (minutes)</label>
                <input
                  type="number"
                  value={settings.cleaningMinutes}
                  onChange={(e) => setSettings(s => ({ ...s, cleaningMinutes: Math.max(0, Number(e.target.value || 0)) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Permissions</h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.allowTransfers}
                  onChange={(e) => setSettings(s => ({ ...s, allowTransfers: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Allow table transfers</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.allowMergeSplit}
                  onChange={(e) => setSettings(s => ({ ...s, allowMergeSplit: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Allow session merge/split</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.requireManagerOverride}
                  onChange={(e) => setSettings(s => ({ ...s, requireManagerOverride: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Require manager override for status changes</span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Zones</h4>
          <div className="space-y-3">
            {zones.map((z, idx) => (
              <div key={z.id} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: z.color }}></div>
                <input
                  value={z.name}
                  onChange={(e) => renameZone(z.id, e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveZone(z.id, -1)}
                    disabled={idx===0}
                    className="text-xs px-2 py-1 rounded-md border border-gray-200 text-gray-700 disabled:opacity-30"
                    title="Move up"
                  >
                    Up
                  </button>
                  <button
                    onClick={() => moveZone(z.id, 1)}
                    disabled={idx===zones.length-1}
                    className="text-xs px-2 py-1 rounded-md border border-gray-200 text-gray-700 disabled:opacity-30"
                    title="Move down"
                  >
                    Down
                  </button>
                  <button
                    onClick={() => handleDeleteZone(z.id)}
                    className="text-xs px-2 py-1 rounded-md border border-red-200 text-red-700 hover:bg-red-50"
                    title="Delete zone"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input
              value={newZoneName}
              onChange={(e) => setNewZoneName(e.target.value)}
              placeholder="New zone name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button onClick={addZone} className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200">
              Add Zone
            </button>
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Zone order here controls order across the app. Use Save Settings to persist per-tenant.
          </p>
      </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-xs text-gray-500">Tenant: {tenantId || '—'}</div>

          <div className="flex items-center gap-3">
            {settingsSaveState !== 'idle' && (
              <div className={`text-sm ${settingsSaveState==='success' ? 'text-emerald-600' : settingsSaveState==='error' ? 'text-red-600' : 'text-gray-600'}`}>
                {settingsSaveState==='saving' && (settingsSaveMsg || 'Saving…')}
                {settingsSaveState==='success' && (
                  <>Saved{lastSavedAt ? ` at ${new Date(lastSavedAt).toLocaleTimeString()}` : ''}</>
                )}
                {settingsSaveState==='error' && (settingsSaveMsg || 'Failed to save')}
              </div>
            )}

            <button
              onClick={async () => {
                try {
                  setSettingsSaveState('saving');
                  setSettingsSaveMsg('Saving…');
                  await persistSettings();
                  await persistZones();
                  setLastSavedAt(Date.now());
                  setSettingsSaveState('success');
                  setSettingsSaveMsg('Saved');
                  try {
                  await reloadZones();
                  const rows: any[] = await sbListTables(tenantId);
                  setTables(rows.filter(belongsToTenant).map(toTable));
                  } catch {}
                } catch (e) {
                  setSettingsSaveState('error');
                  setSettingsSaveMsg('Failed to save');
                } finally {
                  // Auto-hide status after a short delay
                  setTimeout(() => setSettingsSaveState('idle'), 2500);
                }
              }}
              disabled={settingsSaveState==='saving'}
              className={`px-6 py-2 rounded-lg transition-colors text-white ${settingsSaveState==='saving' ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {settingsSaveState==='saving' ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header with Dashboard pill + Quick actions */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Grid3X3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
              <p className="mt-1 text-sm text-gray-500">Seating &amp; sessions</p>
            </div>
          </div>

          <div className="relative flex items-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white shadow-sm bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label="Back to Dashboard"
              title="Back to Dashboard"
            >
              <CornerUpLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <button
              type="button"
              onClick={() => setQaOpen((v) => !v)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-haspopup="menu"
              aria-expanded={qaOpen ? 'true' : 'false'}
            >
              Quick actions
              <ChevronDown className={`w-4 h-4 transition-transform ${qaOpen ? 'rotate-180' : ''}`} />
            </button>

            {qaOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-xl bg-white shadow-xl ring-1 ring-black/5 py-2">
                <Link to="/dashboard" onClick={() => setQaOpen(false)} className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50">Dashboard</Link>
                <Link to="/menu-management" onClick={() => setQaOpen(false)} className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50">Menu Management</Link>
                <Link to="/orders" onClick={() => setQaOpen(false)} className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50">Orders</Link>
                <Link to="/table-management" onClick={() => setQaOpen(false)} className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50">Table Management</Link>
                <Link to="/staff" onClick={() => setQaOpen(false)} className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50">Staff Management</Link>
                <Link to="/kds" onClick={() => setQaOpen(false)} className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50">Kitchen Dashboard</Link>
                <Link to="/analytics" onClick={() => setQaOpen(false)} className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50">Analytics</Link>
                <Link to="/settings" onClick={() => setQaOpen(false)} className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50">Settings</Link>
              </div>
            )}
          </div>
        </div>

        {/* Sub-navigation for Table Management */}
        <nav className="mb-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveView("floor")}
              className={`pb-2 font-medium ${activeView === "floor" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Floor Management
            </button>
            <button
              onClick={() => setActiveView("sessions")}
              className={`pb-2 font-medium ${activeView === "sessions" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Active Sessions
            </button>
            <button
              onClick={() => setActiveView("analytics")}
              className={`pb-2 font-medium ${activeView === "analytics" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveView("settings")}
              className={`pb-2 font-medium ${activeView === "settings" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Settings
            </button>
          </div>
        </nav>

        {/* Content */}
        {activeView === "floor" && renderFloorView()}
        {activeView === "sessions" && renderSessionsView()}
        {activeView === "analytics" && renderAnalyticsView()}
        {activeView === "settings" && renderSettingsView()}

        {/* Quick View Drawer */}
        {selectedTable && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="flex-1 bg-black/40"
              onClick={() => setSelectedTable(null)}
            />
            {/* Panel */}
            <div className="w-full max-w-md bg-white h-full shadow-2xl animate-[slideIn_.2s_ease-out]">
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs text-white ${getStatusColor(selectedTable.status)}`}>
                        {selectedTable.status.replace('-', ' ')}
                      </span>
                      <span className="text-xs text-gray-400">{zoneNameFor(selectedTable.zone)}</span>
                    </div>
                    <h3 className="mt-1 text-xl font-semibold text-gray-900">{selectedTable.number}</h3>
                    <p className="text-sm text-gray-500">{selectedTable.capacity} seats</p>
                  </div>
                  <button onClick={() => setSelectedTable(null)} className="text-gray-500 hover:text-gray-900">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                  {/* Session section */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Session</h4>
                    {selectedTable.session ? (
                      <div className="rounded-lg border border-gray-200 p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-800">
                            <div className="font-medium">{selectedTable.session.customerName || 'Guest'}</div>
                            <div className="text-gray-500">{selectedTable.session.partySize} guests</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-900">${selectedTable.session.totalAmount ?? 0}</div>
                            <div className="text-xs text-gray-500">{selectedTable.session.elapsedTime || fmtElapsed(minutesBetween(selectedTable.session.startTime))}</div>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div>Waiter: <span className="text-gray-800">{selectedTable.session.waiter || '—'}</span></div>
                          <div>Orders: <span className="text-gray-800">{selectedTable.session.orderCount ?? 0}</span></div>
                          <div>Started: <span className="text-gray-800">{new Date(selectedTable.session.startTime).toLocaleTimeString()}</span></div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No active session</div>
                    )}
                  </div>

                  {/* Utilities */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Utilities</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openQrForTable(selectedTable)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200"
                      >
                        <QrCode className="w-4 h-4" /> QR Code
                      </button>
                      <Link
                        to={`/orders?table=${encodeURIComponent(selectedTable.id)}`}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => setSelectedTable(null)}
                      >
                        <Utensils className="w-4 h-4" /> View Orders
                      </Link>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedTable.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTable.notes}</p>
                    </div>
                  )}
                </div>

                {/* Footer actions */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-xs text-gray-500">Table ID: {selectedTable.id}</div>
                  <div className="flex items-center gap-2">
                    {selectedTable.status === 'available' && (
                      <button onClick={() => { handleTableAction(selectedTable.id, 'hold'); }} className="px-3 py-2 rounded-md bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200">Hold</button>
                    )}
                    {selectedTable.status === 'held' && (
                      <button onClick={() => { handleTableAction(selectedTable.id, 'seat'); }} className="px-3 py-2 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200">Seat</button>
                    )}
                    {selectedTable.status === 'occupied' && (
                      <button onClick={() => { handleTableAction(selectedTable.id, 'clean'); }} className="px-3 py-2 rounded-md bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200">Clean</button>
                    )}
                    {selectedTable.status === 'cleaning' && (
                      <button onClick={() => { handleTableAction(selectedTable.id, 'available'); }} className="px-3 py-2 rounded-md bg-green-50 text-green-700 hover:bg-green-100 border border-green-200">Ready</button>
                    )}
                    <button onClick={() => { handleDeleteTable(selectedTable.id); setSelectedTable(null); }} className="px-3 py-2 rounded-md bg-red-50 text-red-700 hover:bg-red-100 border border-red-200">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Tables Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add Tables</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => setAddMode('single')}
                  className={`px-3 py-1.5 rounded-lg text-sm ${addMode==='single' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >Single</button>
                <button
                  onClick={() => setAddMode('bulk')}
                  className={`px-3 py-1.5 rounded-lg text-sm ${addMode==='bulk' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >Bulk</button>
              </div>

              {addMode === 'single' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Zone</label>
                    <select
                      value={formZone}
                      onChange={(e) => setFormZone(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      {zones.length === 0 ? (
                        <option value="" disabled>(create a zone in Settings)</option>
                      ) : zones.map((z) => (
                        <option key={z.id} value={z.id}>{z.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Table No (optional)</label>
                    <input
                      value={formTableNo}
                      onChange={(e) => setFormTableNo(e.target.value)}
                      placeholder={`e.g., ${formatTableCode(nextNumeric())}`}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 capitalize"
                    >
                      <option value="available">Available</option>
                      <option value="held">Held</option>
                      <option value="occupied">Occupied</option>
                      <option value="cleaning">Cleaning</option>
                      <option value="out-of-service">Out of Service</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Seats</label>
                    <input
                      type="number"
                      min={1}
                      value={formSeats}
                      onChange={(e) => setFormSeats(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Zone</label>
                    <select
                      value={bulkZone}
                      onChange={(e) => setBulkZone(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      {zones.length === 0 ? (
                        <option value="" disabled>(create a zone in Settings)</option>
                      ) : zones.map((z) => (
                        <option key={z.id} value={z.id}>{z.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">How many tables?</label>
                    <input
                      type="number"
                      min={1}
                      value={bulkCount}
                      onChange={(e) => setBulkCount(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                    <p className="mt-1 text-xs text-gray-500">They will be created as sequential codes starting from {formatTableCode(nextNumeric())}.</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Seats per table</label>
                    <input
                      type="number"
                      min={1}
                      value={bulkSeats}
                      onChange={(e) => setBulkSeats(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-2">
                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700">Cancel</button>
                {addMode === 'single' ? (
                  <button onClick={handleAddSingleConfirm} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Add Table</button>
                ) : (
                  <button onClick={handleAddBulkConfirm} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Add Tables</button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* QR Modal */}
        {qrTable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">QR Code – {qrTable.number}</h3>
                  <p className="text-sm text-gray-500">Scan to open the menu for this table.</p>
                </div>
                <button onClick={() => { setQrTable(null); setQrDataUrl(null); }} className="text-gray-500 hover:text-gray-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col items-center justify-center py-4">
                {qrLoading && <div className="text-sm text-gray-500">Generating…</div>}
                {!qrLoading && qrDataUrl && !qrDataUrl.startsWith('FALLBACK:') && (
                  <img src={qrDataUrl} alt={`QR for ${qrTable.number}`} className="w-60 h-60" />
                )}
                {!qrLoading && qrDataUrl && qrDataUrl.startsWith('FALLBACK:') && (
                  <div className="w-full">
                    <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3 mb-3">
                      The optional <code>qrcode</code> package is not installed. Run <code>npm i qrcode</code> to generate PNGs locally. For now, scan or copy the deep link below.
                    </div>
                    <input readOnly className="w-full px-3 py-2 border rounded-md bg-gray-50" value={qrDataUrl.replace('FALLBACK:', '')} />
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <a
                  href={qrDataUrl && !qrDataUrl.startsWith('FALLBACK:') ? qrDataUrl : buildTableUrl(qrTable)}
                  download={qrDataUrl && !qrDataUrl.startsWith('FALLBACK:') ? `${qrTable.number}.png` : undefined}
                  target={qrDataUrl && qrDataUrl.startsWith('FALLBACK:') ? '_blank' : undefined}
                  rel="noreferrer"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  {qrDataUrl && !qrDataUrl.startsWith('FALLBACK:') ? 'Download PNG' : 'Open Link'}
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(buildTableUrl(qrTable));
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
