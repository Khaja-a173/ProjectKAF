import React from "react";
import { Link } from "react-router-dom";
import {
  Grid3X3,
  Users,
  Search as SearchIcon,
  Plus,
  QrCode,
  Eye,
  Lock,
  Unlock,
  RotateCcw,
  Trash2,
} from "lucide-react";

type Props = {
  // data
  tables: any[];
  zones: string[];
  filtered: any[];
  loading: boolean;
  error: string | null;

  // filters
  search: string;
  setSearch: (s: string) => void;
  zoneFilter: string;
  setZoneFilter: (z: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;

  // actions
  onSeat: (t: any) => void;
  onToggleLock: (t: any, lock: boolean) => void;
  onClean: (t: any) => void;
  onReady: (t: any) => void;
  onDelete: (t: any) => void;

  // Add table modal
  showAdd: boolean;
  setShowAdd: (b: boolean) => void;
  newCode: string;
  setNewCode: (s: string) => void;
  newSeats: number;
  setNewSeats: (n: number) => void;
  newZone: string;
  setNewZone: (s: string) => void;
  saving: boolean;
  onCreateTable: () => void;
};

function statusBadgeColor(status: string) {
  switch (status) {
    case "available":
      return "bg-emerald-100 text-emerald-700 ring-emerald-200";
    case "held":
      return "bg-amber-100 text-amber-700 ring-amber-200";
    case "occupied":
      return "bg-blue-100 text-blue-700 ring-blue-200";
    case "cleaning":
      return "bg-orange-100 text-orange-700 ring-orange-200";
    case "out-of-service":
      return "bg-neutral-200 text-neutral-700 ring-neutral-300";
    default:
      return "bg-neutral-200 text-neutral-700 ring-neutral-300";
  }
}

export default function TablesView(props: Props) {
  const {
    tables,
    zones,
    filtered,
    loading,
    error,
    search,
    setSearch,
    zoneFilter,
    setZoneFilter,
    statusFilter,
    setStatusFilter,
    onSeat,
    onToggleLock,
    onClean,
    onReady,
    onDelete,
    showAdd,
    setShowAdd,
    newCode,
    setNewCode,
    newSeats,
    setNewSeats,
    newZone,
    setNewZone,
    saving,
    onCreateTable,
  } = props;

  const zoneCards = React.useMemo(() => {
    const m: Record<
      string,
      { occupied: number; available: number; held: number; cleaning: number; total: number }
    > = {};
    tables.forEach((t: any) => {
      const z = t.zone || "Main Hall";
      m[z] ??= { occupied: 0, available: 0, held: 0, cleaning: 0, total: 0 };
      m[z].total += 1;
      if (t.status === "occupied") m[z].occupied += 1;
      else if (t.status === "held") m[z].held += 1;
      else if (t.status === "cleaning") m[z].cleaning += 1;
      else m[z].available += 1;
    });
    return Object.entries(m)
      .map(([zone, v]) => ({ zone, ...v }))
      .sort((a, b) => a.zone.localeCompare(b.zone));
  }, [tables]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Grid3X3 className="h-6 w-6 text-gray-800" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Table Management</h1>
                <p className="text-sm text-gray-500">Manage tables, sessions, and availability in real-time</p>
              </div>
            </div>
            <Link
              to="/"
              className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-black"
            >
              Home
            </Link>
          </div>

          <div className="mt-4 flex gap-6 text-sm">
            <span className="font-semibold text-gray-900 border-b-2 border-gray-900 pb-2">
              Table Management
            </span>
            <span className="text-gray-500">Floor Management</span>
            <span className="text-gray-500">Active Sessions</span>
            <span className="text-gray-500">Analytics</span>
            <span className="text-gray-500">Settings</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Controls row */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-sm">
            <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Search tables or customer"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
          >
            <option value="all">All Zones</option>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>

          <select
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="held">Held</option>
            <option value="occupied">Occupied</option>
            <option value="cleaning">Cleaning</option>
            <option value="out-of-service">Out of Service</option>
          </select>

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-black"
            >
              <Plus className="h-4 w-4" />
              Add Table
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50">
              <QrCode className="h-4 w-4" />
              Export QR
            </button>
          </div>
        </div>

        {/* Zone cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {zoneCards.map((z) => {
            const occupiedPct = z.total ? (z.occupied / z.total) * 100 : 0;
            return (
              <div key={z.zone} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="text-base font-semibold text-gray-900">{z.zone}</div>
                  <div className="h-2 w-2 rounded-full bg-gray-400" />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Occupied {z.occupied}/{z.total}
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-gray-900"
                    style={{ width: `${occupiedPct}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {z.available} Available
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    {z.held} Held
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    {z.occupied} Occupied
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                    {z.cleaning} Cleaning
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floor layout */}
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-medium text-gray-900">Floor Layout</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {filtered.map((t) => (
              <div key={t.id} className="min-w-[200px] rounded-xl border border-gray-200 bg-white p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md border border-gray-200 p-1">
                      <Grid3X3 className="h-4 w-4 text-gray-700" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">T {t.number}</div>
                      <div className="text-xs text-gray-500">{t.capacity}p</div>
                    </div>
                  </div>
                  <div
                    className={`rounded-full px-2 py-0.5 text-xs ring ${statusBadgeColor(
                      t.status
                    )}`}
                  >
                    {t.status[0].toUpperCase() + t.status.slice(1)}
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-600">
                  {t.session?.customerName ? (
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>
                        {t.session.customerName} · {t.session.partySize || 0} guests
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>No active session</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {t.status === "available" && (
                    <>
                      <button
                        onClick={() => onSeat(t)}
                        className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs hover:bg-gray-50"
                      >
                        Seat
                      </button>
                      {!t.locked ? (
                        <button
                          onClick={() => onToggleLock(t, true)}
                          className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-700 hover:bg-amber-100"
                        >
                          <Lock className="h-3.5 w-3.5" />
                          Hold
                        </button>
                      ) : (
                        <button
                          onClick={() => onToggleLock(t, false)}
                          className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-100"
                        >
                          <Unlock className="h-3.5 w-3.5" />
                          Release
                        </button>
                      )}
                    </>
                  )}

                  {t.status === "occupied" && (
                    <button
                      onClick={() => onReady(t)}
                      className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100"
                    >
                      Close &amp; Ready
                    </button>
                  )}

                  {t.status === "cleaning" && (
                    <button
                      onClick={() => onReady(t)}
                      className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-100"
                    >
                      Ready
                    </button>
                  )}

                  {!["cleaning", "occupied", "available"].includes(t.status) && (
                    <button
                      onClick={() => onClean(t)}
                      className="inline-flex items-center gap-1 rounded-md border border-orange-200 bg-orange-50 px-2 py-1 text-xs text-orange-700 hover:bg-orange-100"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Clean
                    </button>
                  )}

                  <button className="ml-auto rounded-md border border-gray-200 bg-white p-1 hover:bg-gray-50">
                    <Eye className="h-3.5 w-3.5 text-gray-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Details table */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-white">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">Table Details</h3>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-gray-600">Loading…</div>
          ) : error ? (
            <div className="p-6 text-sm text-red-600">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Table</th>
                    <th className="px-4 py-3">Zone</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Session</th>
                    <th className="px-4 py-3">Elapsed</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => {
                    const started =
                      t.session?.startTime &&
                      new Date(t.session.startTime as any).getTime();
                    let elapsed = "-";
                    if (started && Number.isFinite(started)) {
                      const mins = Math.floor((Date.now() - started) / 60000);
                      elapsed = `${mins}m`;
                    }

                    return (
                      <tr key={t.id} className="border-t">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                t.status === "available"
                                  ? "bg-emerald-500"
                                  : t.status === "held"
                                  ? "bg-amber-500"
                                  : t.status === "occupied"
                                  ? "bg-blue-600"
                                  : t.status === "cleaning"
                                  ? "bg-orange-500"
                                  : "bg-gray-400"
                              }`}
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {t.number}
                              </div>
                              <div className="text-xs text-gray-500">
                                {t.capacity} seats
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{t.zone}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ring ${statusBadgeColor(
                              t.status
                            )}`}
                          >
                            {t.status[0].toUpperCase() + t.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {t.session ? (
                            <div className="text-sm text-gray-700">
                              {t.session.customerName || "—"} ·{" "}
                              {t.session.partySize || 0} guests · $
                              {t.session.totalAmount ?? "—"}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">
                              No active session
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">{elapsed}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {t.status === "available" && (
                              <>
                                <button
                                  onClick={() => onSeat(t)}
                                  className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs hover:bg-gray-50"
                                >
                                  Seat
                                </button>
                                {!t.locked ? (
                                  <button
                                    onClick={() => onToggleLock(t, true)}
                                    className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-700 hover:bg-amber-100"
                                  >
                                    <Lock className="h-3.5 w-3.5" />
                                    Hold
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => onToggleLock(t, false)}
                                    className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-100"
                                  >
                                    <Unlock className="h-3.5 w-3.5" />
                                    Release
                                  </button>
                                )}
                              </>
                            )}

                            {t.status === "occupied" && (
                              <button
                                onClick={() => onReady(t)}
                                className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100"
                              >
                                Close &amp; Ready
                              </button>
                            )}

                            {t.status === "cleaning" && (
                              <button
                                onClick={() => onReady(t)}
                                className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-100"
                              >
                                Ready
                              </button>
                            )}

                            {!["cleaning", "occupied", "available"].includes(
                              t.status
                            ) && (
                              <button
                                onClick={() => onClean(t)}
                                className="inline-flex items-center gap-1 rounded-md border border-orange-200 bg-orange-50 px-2 py-1 text-xs text-orange-700 hover:bg-orange-100"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Clean
                              </button>
                            )}

                            <button className="rounded-md border border-gray-200 bg-white p-1 hover:bg-gray-50">
                              <Eye className="h-3.5 w-3.5 text-gray-600" />
                            </button>

                            <button
                              onClick={() => onDelete(t)}
                              className="rounded-md border border-red-200 bg-red-50 p-1 text-red-700 hover:bg-red-100"
                              title="Delete table"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Table modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Add Table</h3>
              <button
                onClick={() => setShowAdd(false)}
                className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs hover:bg-gray-50"
              >
                Close
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs text-gray-600">Table Code / Number</label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="e.g., T01"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">Seats</label>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
                  value={newSeats}
                  onChange={(e) => setNewSeats(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">Zone</label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="e.g., Main Hall"
                  value={newZone}
                  onChange={(e) => setNewZone(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onCreateTable}
                disabled={saving || !newCode.trim()}
                className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
              >
                {saving ? "Saving…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}