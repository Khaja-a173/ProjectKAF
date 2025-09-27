import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE, getErrorMessage } from '@/lib/api';
import type { RealtimePostgresInsertPayload, RealtimePostgresUpdatePayload, RealtimePostgresDeletePayload } from '@supabase/supabase-js';
import { subscribeTables, subscribeTableSessions } from '@/lib/realtime';
import DashboardHeader from '../components/DashboardHeader';
import {
  Grid3X3,
  Lock,
  Unlock,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Plus,
  Trash2,
} from 'lucide-react';

interface Table {
  id: string;
  table_number: string;
  capacity: number;
  location?: string;
  status: string;
  is_locked: boolean;
  is_occupied: boolean;
  computed_status: string;
  qr_code?: string;
  notes?: string;
}

type RawTable = Partial<Table> & { id: string };

function toTable(row: RawTable): Table {
  return {
    id: row.id,
    table_number: (row as any).table_number ?? (row as any).code ?? '',
    capacity: Number((row as any).capacity ?? (row as any).seats ?? 0),
    location: (row as any).location ?? undefined,
    status: (row as any).status ?? 'available',
    is_locked: Boolean((row as any).is_locked ?? false),
    is_occupied: Boolean((row as any).is_occupied ?? false),
    computed_status: (row as any).computed_status ?? (row as any).status ?? 'available',
    qr_code: (row as any).qr_code ?? undefined,
    notes: (row as any).notes ?? undefined,
  };
}

// Lightweight HTTP helpers (kept local for this page)
async function getJSON<T>(path: string, opts: { signal?: AbortSignal } = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'X-Tenant-Id': (typeof localStorage !== 'undefined' && localStorage.getItem('tenant_id')) || '',
    },
    credentials: 'include',
    signal: opts.signal,
  });
  const text = await res.text();
  let data: any = null; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

async function postJSON<T>(path: string, body: any, opts: { signal?: AbortSignal } = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Tenant-Id': (typeof localStorage !== 'undefined' && localStorage.getItem('tenant_id')) || '',
    },
    credentials: 'include',
    body: JSON.stringify(body),
    signal: opts.signal,
  });
  const text = await res.text();
  let data: any = null; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

async function delJSON<T>(path: string, opts: { signal?: AbortSignal } = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'X-Tenant-Id': (typeof localStorage !== 'undefined' && localStorage.getItem('tenant_id')) || '',
    },
    credentials: 'include',
    signal: opts.signal,
  });
  const text = await res.text();
  let data: any = null; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export default function Tables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Add / Delete UI state
  const [showAdd, setShowAdd] = useState(false);
  const [newTableCode, setNewTableCode] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState<number>(4);
  const [newTableLocation, setNewTableLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const handleCreateTable = async () => {
    if (!newTableCode.trim()) {
      alert('Please enter a table code (e.g., T01)');
      return;
    }
    try {
      setSaving(true);
      // server expects either { code, seats } or { table_number, capacity }
      const body: any = {
        code: newTableCode.trim(),
        seats: Number.isFinite(newTableCapacity) ? Number(newTableCapacity) : 4,
      };
      if (newTableLocation.trim()) body.location = newTableLocation.trim();
      await postJSON('/tables', body);
      // Clear and close; realtime INSERT will append to list
      setNewTableCode('');
      setNewTableCapacity(4);
      setNewTableLocation('');
      setShowAdd(false);
    } catch (err: any) {
      alert('Failed to create table: ' + getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('Delete this table? This cannot be undone.')) return;
    try {
      await delJSON(`/tables/${tableId}`);
      // Realtime DELETE will remove from list; as a fallback:
      setTables(prev => prev.filter(t => t.id !== tableId));
    } catch (err: any) {
      alert('Failed to delete table: ' + getErrorMessage(err));
    }
  };

  useEffect(() => {
    let isMounted = true;

    // initial load
    loadTables();

    const tenantId = localStorage.getItem('tenant_id') || undefined;

    // Keep references to unsubscribe fns
    let unsubscribeTables: (() => void) | null = null;
    let unsubscribeSessions: (() => void) | null = null;

    try {
      if (tenantId) {
        if (typeof subscribeTables === 'function') {
          unsubscribeTables = subscribeTables(tenantId, (payload: any) => {
            if (!isMounted) return;
            try {
              const type = (payload?.eventType || payload?.type || '').toUpperCase();
              const newRow = (payload as RealtimePostgresInsertPayload<any> | RealtimePostgresUpdatePayload<any>)?.new as any;
              const oldRow = (payload as RealtimePostgresUpdatePayload<any> | RealtimePostgresDeletePayload<any>)?.old as any;

              setTables((prev) => {
                switch (type) {
                  case 'INSERT': {
                    if (!newRow?.id) return prev;
                    // avoid duplicate if already present
                    if (prev.some((t) => t.id === newRow.id)) return prev;
                    return [...prev, toTable(newRow)].sort((a, b) => a.table_number.localeCompare(b.table_number, undefined, { numeric: true }));
                  }
                  case 'UPDATE': {
                    if (!newRow?.id) return prev;
                    return prev.map((t) => (t.id === newRow.id ? toTable({ ...t, ...newRow }) : t));
                  }
                  case 'DELETE': {
                    if (!oldRow?.id) return prev;
                    return prev.filter((t) => t.id !== oldRow.id);
                  }
                  default:
                    return prev;
                }
              });
            } catch (_e) {
              // Fallback if payload shape unknown — do a light refresh
              Promise.resolve().then(loadTables);
            }
          });
        }

        if (typeof subscribeTableSessions === 'function') {
          unsubscribeSessions = subscribeTableSessions(tenantId, (payload: any) => {
            if (!isMounted) return;
            try {
              const type = (payload?.eventType || payload?.type || '').toUpperCase();
              const newRow = (payload as RealtimePostgresInsertPayload<any> | RealtimePostgresUpdatePayload<any>)?.new as any;
              const oldRow = (payload as RealtimePostgresUpdatePayload<any> | RealtimePostgresDeletePayload<any>)?.old as any;
              const tableId = (newRow?.table_id ?? oldRow?.table_id) as string | undefined;

              if (!tableId) return;

              setTables((prev) => {
                return prev.map((t) => {
                  if (t.id !== tableId) return t;

                  // Heuristics: session INSERT/UPDATE with active-like status => occupied
                  // DELETE or ended session => free unless locked
                  const statusLike = (newRow?.status || oldRow?.status || '').toString().toLowerCase();
                  const isActive =
                    type === 'INSERT' ||
                    (type === 'UPDATE' && (statusLike === 'active' || statusLike === 'open'));

                  const next: Table = { ...t };
                  next.is_occupied = isActive;

                  // computed priority: locked > occupied > reserved > available
                  if (t.is_locked) {
                    next.computed_status = 'locked';
                  } else if (isActive) {
                    next.computed_status = 'occupied';
                  } else if (t.computed_status === 'reserved') {
                    // keep reserved if UI marked it as such via other channel
                    next.computed_status = 'reserved';
                  } else {
                    next.computed_status = 'available';
                  }

                  return next;
                });
              });
            } catch (_e) {
              // Fallback to refresh if anything goes wrong
              Promise.resolve().then(loadTables);
            }
          });
        }
      }
    } catch (e) {
      console.warn('Tables realtime subscription not available:', e);
    }

    return () => {
      isMounted = false;
      if (unsubscribeTables) unsubscribeTables();
      if (unsubscribeSessions) unsubscribeSessions();
    };
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const data: any = await getJSON<any>('/tables');
      const list: Table[] = Array.isArray(data) ? data : (data?.tables ?? []);
      setTables([...list].sort((a, b) => a.table_number.localeCompare(b.table_number, undefined, { numeric: true })));
      setError(null);
    } catch (err: any) {
      console.error('Failed to load tables:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLock = async (tableId: string, currentLocked: boolean) => {
    try {
      await postJSON(`/tables/${tableId}/lock`, { locked: !currentLocked });
      loadTables(); // Refresh after update
    } catch (err: any) {
      alert('Failed to update table lock: ' + getErrorMessage(err));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'occupied': return 'bg-blue-500';
      case 'locked': return 'bg-red-500';
      case 'reserved': return 'bg-yellow-500';
      case 'maintenance': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4" />;
      case 'occupied': return <Users className="w-4 h-4" />;
      case 'locked': return <Lock className="w-4 h-4" />;
      case 'reserved': return <Clock className="w-4 h-4" />;
      case 'maintenance': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredTables = tables.filter((table) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = table.table_number.toLowerCase().includes(q) ||
      (table.location ? table.location.toLowerCase().includes(q) : false);
    const matchesStatus = statusFilter === 'all' || table.computed_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader title="Table Management" subtitle="Manage table status and occupancy" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tables...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Table Management" subtitle="Manage table status and occupancy" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-8">
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 pb-2">
              Dashboard
            </Link>
            <Link to="/orders" className="text-gray-500 hover:text-gray-700 pb-2">
              Orders
            </Link>
            <Link to="/menu" className="text-gray-500 hover:text-gray-700 pb-2">
              Menu
            </Link>
            <Link to="/tables" className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium">
              Tables
            </Link>
            <Link to="/staff" className="text-gray-500 hover:text-gray-700 pb-2">
              Staff
            </Link>
            <Link to="/kds" className="text-gray-500 hover:text-gray-700 pb-2">
              Kitchen
            </Link>
            <Link to="/branding" className="text-gray-500 hover:text-gray-700 pb-2">
              Branding
            </Link>
          </div>
        </nav>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="locked">Locked</option>
                <option value="reserved">Reserved</option>
              </select>
              <button
                onClick={() => setShowAdd(v => !v)}
                className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                title="Add table"
              >
                <Plus className="w-4 h-4 mr-2" />
                {showAdd ? 'Close' : 'Add Table'}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-green-100 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">Live Updates</span>
              </div>
            </div>
          </div>
          {showAdd && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Table Code</label>
                <input
                  value={newTableCode}
                  onChange={e => setNewTableCode(e.target.value.toUpperCase())}
                  placeholder="T01"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Capacity</label>
                <input
                  type="number"
                  min={1}
                  value={newTableCapacity}
                  onChange={e => setNewTableCapacity(parseInt(e.target.value || '1', 10))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Location (optional)</label>
                <input
                  value={newTableLocation}
                  onChange={e => setNewTableLocation(e.target.value)}
                  placeholder="Patio / Hall A"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleCreateTable}
                  disabled={saving}
                  className="w-full inline-flex items-center justify-center px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Create'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="text-red-800">Error loading tables: {error}</div>
          </div>
        )}

        {/* Tables Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {filteredTables.map((table) => (
            <div
              key={table.id}
              className={`relative p-4 rounded-xl border-2 transition-all hover:shadow-lg ${
                table.computed_status === 'available' ? 'border-green-500 bg-green-50' :
                table.computed_status === 'occupied' ? 'border-blue-500 bg-blue-50' :
                table.computed_status === 'locked' ? 'border-red-500 bg-red-50' :
                'border-gray-300 bg-gray-50'
              }`}
            >
              <div className="text-center">
                <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white ${getStatusColor(table.computed_status)}`}>
                  {getStatusIcon(table.computed_status)}
                </div>
                
                <h3 className="font-semibold text-gray-900">{table.table_number}</h3>
                <p className="text-sm text-gray-600">{table.capacity} seats</p>
                {table.location && (
                  <p className="text-xs text-gray-500">{table.location}</p>
                )}
                
                <div className="mt-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                    table.computed_status === 'available' ? 'bg-green-100 text-green-800' :
                    table.computed_status === 'occupied' ? 'bg-blue-100 text-blue-800' :
                    table.computed_status === 'locked' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {table.computed_status}
                  </span>
                </div>

                <div className="mt-3 flex justify-center space-x-2">
                  <button
                    onClick={() => handleToggleLock(table.id, table.is_locked)}
                    className={`p-2 rounded-lg transition-colors ${
                      table.is_locked 
                        ? 'text-red-600 hover:bg-red-100' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title={table.is_locked ? 'Unlock table' : 'Lock table'}
                  >
                    {table.is_locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDeleteTable(table.id)}
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    title="Delete table"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTables.length === 0 && !loading && (
          <div className="text-center py-12">
            <Grid3X3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tables found</h3>
            <p className="text-gray-600">No tables match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}