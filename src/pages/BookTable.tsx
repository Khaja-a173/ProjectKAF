import { useEffect, useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
import {
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  User,
  MapPin,
  CheckCircle,
  QrCode,
  Camera,
} from "lucide-react";

import { useTenant } from "@/contexts/TenantContext";
import { useZones } from "@/contexts/ZonesContext";
import { subscribeTables, subscribeReservations, subscribeZones } from "@/lib/realtime";
import { listTables as sbListTables } from "@/lib/api";
import { searchAvailableTables as sbSearchAvailableTables } from "@/lib/api";


export default function BookTable() {
  // Strict tenant filter: accept rows only when tenant_id matches current tenant
  const belongsToTenant = (row: any, tenantId?: string) => {
    if (!tenantId) return false;
    const rid = row?.tenant_id ?? row?.tenantId ?? row?.tenant;
    return String(rid) === String(tenantId);
  };
  const navigate = useNavigate();
  const { tenantId } = useTenant();
  const { zones, reloadZones } = useZones();

  const [activeSection, setActiveSection] = useState("qr-scanner");
  const [selectedTable, setSelectedTable] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: "2",
    occasion: "",
    specialRequests: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const scannedOnceRef = useRef(false);

  const timeSlots = [
    "5:00 PM",
    "5:30 PM",
    "6:00 PM",
    "6:30 PM",
    "7:00 PM",
    "7:30 PM",
    "8:00 PM",
    "8:30 PM",
    "9:00 PM",
    "9:30 PM",
    "10:00 PM",
  ];

  const occasions = [
    "Birthday",
    "Anniversary",
    "Date Night",
    "Business Meeting",
    "Family Gathering",
    "Celebration",
    "Other",
  ];

  // Build a time window from the form or default to "now → now + 90 mins"
  function buildTimeWindow(form: { date: string; time: string }) {
    try {
      if (form.date && form.time) {
        // Convert "h:mm AM/PM" or "HH:mm" into a Date on the selected day (local tz)
        const [raw, ampm] = form.time.trim().split(" ");
        const [hh, mm] = raw.split(":").map((s) => parseInt(s, 10));
        let H = hh;
        if (ampm) {
          const upper = ampm.toUpperCase();
          if (upper === "PM" && H !== 12) H += 12;
          if (upper === "AM" && H === 12) H = 0;
        }
        const start = new Date(form.date + "T00:00:00");
        start.setHours(H, isNaN(mm) ? 0 : mm, 0, 0);
        const end = new Date(start.getTime() + 90 * 60 * 1000); // +90 mins
        return { starts_at: start, ends_at: end };
      }
    } catch {}
    const now = new Date();
    const end = new Date(now.getTime() + 90 * 60 * 1000);
    return { starts_at: now, ends_at: end };
  }

  // Last-chance server-side check to avoid double booking
  async function isTableAvailableServerSide(
    tableCodeOrId: string,
    guests: number,
    form: { date: string; time: string }
  ): Promise<{ ok: true } | { ok: false; nextAvailableAt?: string }> {
    // Use sbSearchAvailableTables, which expects (tenantId, { party_size })
    try {
      const res: any = await sbSearchAvailableTables(tenantId || "", { party_size: guests });
      // Handle both { available: [] } and [] shapes
      const list = Array.isArray(res?.available) ? res.available : Array.isArray(res) ? res : [];
      const wanted = tableCodeOrId.toString();
      const found = list.some((row) => {
        const code = (row.code || row.table_number || row.id || "").toString();
        return code === wanted;
      });
      if (found) return { ok: true };
      return { ok: false, nextAvailableAt: res?.nextAvailableAt };
    } catch (e) {
      console.error("Availability check failed:", e);
      return { ok: false };
    }
  }

  type UITable = { id: string; seats: number; zoneId?: string; location: string; status: string };
  const [availableTables, setAvailableTables] = useState<UITable[]>([]);
  const zoneNameFor = (z?: string) => {
    if (!z) return "—";
    const hit = zones.find(zz => zz.id === z);
    return hit?.name || z || "—";
  };
  const [reservedCodes, setReservedCodes] = useState<Set<string>>(new Set());
  const [tableIdToCode, setTableIdToCode] = useState<Record<string, string>>({});
  // New: codeToId, allowedCodes, availabilityReady
  const [codeToId, setCodeToId] = useState<Record<string, string>>({});
  const [allowedCodes, setAllowedCodes] = useState<Set<string>>(new Set());
  const [availabilityReady, setAvailabilityReady] = useState(false);
  const tableCodeMapRef = useRef<Record<string, string>>({});
  useEffect(() => { tableCodeMapRef.current = tableIdToCode; }, [tableIdToCode]);
  // Clear all state on tenant switch to avoid cross-tenant leakage
  useEffect(() => {
    setAvailableTables([]);
    setReservedCodes(new Set());
    setTableIdToCode({});
    setSelectedTable("");
    setActiveSection("qr-scanner");
  }, [tenantId]);
  // Only show tables that are allowed (if ready), not reserved/occupied/locked
  const visibleTables = availableTables;

  // QR Scanner integration
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  const handleScan = (data: any) => {
    if (!data) return;
    if (scannedOnceRef.current) return; // prevent duplicate triggers from decoder
    const scannedTable = typeof data === "string" ? data.trim() : (data?.text ? String(data.text).trim() : "");
    if (!scannedTable) return;

    // Guard before any state updates to avoid double-fire
    scannedOnceRef.current = true;

    // Close scanner UI first for iOS/Safari stability, then navigate on next tick
    setShowQrScanner(false);
    setIsScanning(false);

    // Light feedback so users see something even if navigation lags a frame
    toast.loading(`Connecting to table ${scannedTable}…`, { duration: 1200 });

    // Defer navigation to the microtask queue to avoid conflicts with unmount
    setTimeout(() => {
      try {
        pickTable(scannedTable, "qr");
      } catch (e) {
        console.error("pickTable error:", e);
        toast.error("Could not connect to the table. Please try again.");
        scannedOnceRef.current = false; // allow retry on failure
      }
    }, 0);
  };

  const handleStartScanning = () => {
    scannedOnceRef.current = false; // allow a fresh scan
    setShowQrScanner(true);
    setQrError(null);
    setIsScanning(true);
  };

  // Helper to extract table code/id from a URL or query string
  function extractTableFromUrl(raw: string): string | null {
    // Try standard URL first
    try {
      const u = new URL(raw);
      const paramNames = ["table", "table_id", "tableId", "code", "t"];
      for (const p of paramNames) {
        const v = u.searchParams.get(p);
        if (v) return v;
      }
      // Also check hash fragment like #/menu?table=...
      if (u.hash && u.hash.includes("?")) {
        const qs = u.hash.substring(u.hash.indexOf("?") + 1);
        const sp = new URLSearchParams(qs);
        for (const p of paramNames) {
          const v = sp.get(p);
          if (v) return v;
        }
      }
    } catch {}

    // Fallback: if it looks like a query string itself
    if (raw.includes("?")) {
      const qs = raw.substring(raw.indexOf("?") + 1);
      const sp = new URLSearchParams(qs);
      const keys = ["table", "table_id", "tableId", "code", "t"];
      for (const k of keys) {
        const v = sp.get(k);
        if (v) return v;
      }
    }

    return null;
  }

  // Shared selector function for both QR and layout
  const pickTable = (tableIdOrCodeOrUrl: string, source: "qr" | "layout") => {
    const raw = String(tableIdOrCodeOrUrl).trim();

    // 1) If it's a URL with a recognizable table param, navigate immediately
    const fromUrl = extractTableFromUrl(raw);
    if (fromUrl) {
      const codeMaybe = tableIdToCode[fromUrl] || fromUrl; // prefer code (e.g., T01) if URL carried a UUID
      navigate(`/menu?table=${codeMaybe}&source=${source}`);
      return;
    }

    // 2) Try to resolve UUID<->code using our maps (case-insensitive for codes)
    let uuid = "";
    let code = raw;

    // If raw matches a known table UUID directly
    if (tableIdToCode[raw]) {
      uuid = raw;
      code = tableIdToCode[raw];
    } else {
      // Attempt code lookups in multiple casings
      const byExact = codeToId[raw];
      const byUpper = codeToId[raw.toUpperCase?.() ?? raw];
      const byLower = codeToId[raw.toLowerCase?.() ?? raw];
      uuid = (byExact || byUpper || byLower || "").toString();
      if (!uuid) {
        // No preloaded map hit; keep code as typed and continue
        code = raw;
      } else {
        // We found uuid for this code; keep code as-is for display
        code = tableIdToCode[uuid] || code;
      }
    }

    // 3) Find by code in our UI list (case-insensitive)
    const codeUpper = code.toUpperCase();
    const table = availableTables.find((t) => String(t.id).toUpperCase() === codeUpper);

    // If we can't match locally, still proceed per finalized flow
    if (!table) {
      toast.loading(`Connecting to table ${raw}…`, { duration: 1200 });
      navigate(`/menu?table=${raw}&source=${source}`);
      return;
    }

    if (reservedCodes.has(table.id) || table.status !== "available") {
      toast.error(`Table ${table.id} is not available.`);
      return;
    }

    setSelectedTable(table.id);
    toast.success(`Table ${table.id} selected! Redirecting to menu…`);

    const navId = table.id; // always pass code to Menu so it shows TXX
    navigate(`/menu?table=${navId}&source=${source}`);
  };

  const handleScanError = (err: any) => {
    scannedOnceRef.current = false; // allow retry on error
    setQrError("QR scan error. Please try again.");
    setShowQrScanner(false);
    setIsScanning(false);
    console.error("QR scan error:", err);
  };

  const handleTableSelect = async (tableId: string) => {
    setShowQrScanner(false);
    setIsScanning(false);
    pickTable(tableId, 'layout');
  };
  // Helper to refresh allowed tables for the selected guests (debounced)
  const refreshTimer = useRef<number | null>(null);
  async function refreshServerAvailability() {
    if (!tenantId) return;
    setAvailabilityReady(false);
    try {
      const res: any = await sbSearchAvailableTables(
        tenantId,
        { party_size: parseInt(formData.guests) || 2 }
      );
      const list = Array.isArray(res?.available) ? res.available
                : Array.isArray(res)           ? res
                : [];

      const mapped: UITable[] = list.map((r: any) => {
        const zoneId = (r.zone_id || r.zone || r.location || "") as string;
        const rawStatus = String(r.computed_status || r.status || (r.is_occupied ? "occupied" : "available"));
        const normStatus = ["occupied", "cleaning"].includes(rawStatus) ? rawStatus : "available";
        return {
          id: String(r.code || r.table_number || r.label || r.id),
          seats: Number(r.seats ?? r.capacity ?? 2),
          zoneId,
          location: zoneNameFor(zoneId),
          status: normStatus,
        };
      });

      setAvailableTables(mapped);
    } catch (e) {
      console.error("Failed to refresh availability:", e);
      setAvailableTables([]);
    } finally {
      setAvailabilityReady(true);
    }
  }

  // When tenant, date, time, guests, or zones change, refresh allowed tables (debounced)
  useEffect(() => {
    if (!tenantId) return;
    const t = window.setTimeout(() => {
      refreshServerAvailability();
    }, 500); // debounce quick successive state changes
    return () => window.clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, formData.date, formData.time, formData.guests, zones]);

  const handleCreateSession = async (tableId: string) => {
    try {
      // No server session creation here; Menu page handles cart/bootstrap.
      navigate(`/menu?table=${tableId}&source=form`);
    } catch (err) {
      console.error("❌ Failed to navigate to menu:", err);
      alert("Failed to proceed to menu. Please try again.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTable) {
      handleCreateSession(selectedTable);
    } else {
      alert("Please select a table first");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    if (!tenantId) return;

    // Initial load from API (tenant-scoped)
    (async () => {
      try {
        await reloadZones();
        const rows: any[] = await sbListTables(tenantId);
        const own = rows.filter((r: any) => belongsToTenant(r, tenantId));
        // Build code map (table UUID -> code like "T01")
        setTableIdToCode(Object.fromEntries(own.map((r: any) => [String(r.id), String(r.code || r.table_number || r.label || r.id)])));
        setCodeToId(Object.fromEntries(own.map((r: any) => {
          const code = String(r.code || r.table_number || r.label || r.id);
          return [code, String(r.id)];
        })));
        // Normalize into UI shape
        const mapped: UITable[] = own.map((r: any) => {
          const zoneId = (r.zone_id || r.zone || r.location || "") as string;
          const rawStatus = String(r.computed_status || r.status || (r.is_occupied ? "occupied" : "available"));
          const normStatus = rawStatus === "occupied" || rawStatus === "cleaning" ? rawStatus : "available";
          return {
            id: String(r.code || r.table_number || r.label || r.id),
            seats: Number(r.seats ?? r.capacity ?? 2),
            zoneId,
            location: zoneNameFor(zoneId),
            status: normStatus,
          };
        });
        if (!mapped.length) {
          console.warn("No tables returned, keeping current view (empty)");
          setAvailableTables([]);
        } else {
          setAvailableTables(mapped);
        }
        if (mapped.length) setActiveSection("table-layout");
      } catch (e) {
        console.error("Failed to load tables:", e);
        setAvailableTables([]);
      }
    })();

    // Subscribe to TABLES (insert/update/delete)
    const unsubTables = subscribeTables(tenantId, (evt) => {
      const { type, new: newRow, old: oldRow } = evt;
      if (type === "INSERT" || type === "UPDATE") {
        if (!belongsToTenant(newRow, tenantId)) return;
        // Expecting payload with fields: id (uuid), code (e.g., "T01"), seats, location?, is_occupied?, status?
        const code = (newRow.code || newRow.table_number || newRow.label || newRow.id || "").toString();
        const seats = Number(newRow.seats || newRow.capacity || 2);
        const zoneId = (newRow.zone_id || newRow.zone || newRow.location || "") as string;
        const location = zoneNameFor(zoneId);
        const is_occupied = !!newRow.is_occupied;
        const rawStatus = String(newRow.computed_status || newRow.status || (is_occupied ? "occupied" : "available"));
        const status = rawStatus === "occupied" || rawStatus === "cleaning" ? rawStatus : "available";

        setTableIdToCode((m) => ({ ...m, [newRow.id]: code }));
        setCodeToId((m) => ({ ...m, [code]: String(newRow.id) }));

        setAvailableTables((prev) => {
          const idx = prev.findIndex((t) => t.id === code);
          const updated: UITable = { id: code, seats, zoneId, location, status };
          if (idx === -1) return [...prev, updated];
          const copy = prev.slice();
          copy[idx] = updated;
          return copy;
        });
      } else if (type === "DELETE") {
        if (!belongsToTenant(oldRow, tenantId)) return;
        const oldId = oldRow?.id;
        let code = oldRow?.code;
        if (!code && oldId) code = tableCodeMapRef.current[oldId];
        if (!code) return;
        setAvailableTables((prev) => prev.filter((t) => t.id !== code));
        setReservedCodes((set) => {
          const next = new Set(set);
          next.delete(code);
          return next;
        });
        setTableIdToCode((m) => {
          const { [oldId]: _omit, ...rest } = m;
          return rest;
        });
        setCodeToId((m) => {
          if (!code) return m;
          const { [code]: _omit, ...rest } = m;
          return rest;
        });
      }
    });


    // Subscribe to RESERVATIONS (add/remove/update)
    const unsubRes = subscribeReservations(tenantId, (evt) => {
      const { type, new: newRow, old: oldRow } = evt;

      // Helper to map reservation row to table code using our map
      const toCode = (row: any) => {
        const tid = row?.table_id;
        return tid ? tableCodeMapRef.current[tid] : undefined;
        // Note: if code unresolved yet (no tables payload), we skip; next table event will reconcile.
      };

      if (type === "INSERT" || type === "UPDATE") {
        if (!belongsToTenant(newRow, tenantId)) return;
        const code = toCode(newRow);
        const confirmed = (newRow?.status || "").toString().toLowerCase() === "confirmed";
        if (!code) return;
        if (confirmed) {
          setReservedCodes((set) => new Set(set).add(code));
        } else {
          setReservedCodes((set) => {
            const next = new Set(set);
            next.delete(code);
            return next;
          });
        }
      } else if (type === "DELETE") {
        if (!belongsToTenant(oldRow, tenantId)) return;
        const code = toCode(oldRow);
        if (!code) return;
        setReservedCodes((set) => {
          const next = new Set(set);
          next.delete(code);
          return next;
        });
      }
    });

    return () => {
      try { unsubTables(); } catch {}
      try { unsubRes(); } catch {}
    };
  }, [tenantId]);

  useEffect(() => {
    // When zone names change (rename/reorder), refresh the label shown for each table
    setAvailableTables(prev => prev.map(t => ({
      ...t,
      location: zoneNameFor(t.zoneId || undefined)
    })));
  }, [zones]);

  // Zones realtime: reload zones and relabel current tables live
  useEffect(() => {
    if (!tenantId) return;
    const unsub = subscribeZones(tenantId, async () => {
      await reloadZones();
      setAvailableTables(prev => prev.map(t => ({
        ...t,
        location: zoneNameFor(t.zoneId)
      })));
    });
    return () => { try { unsub(); } catch {} };
  }, [tenantId, reloadZones]);

  if (isSubmitted) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Booking Confirmed!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for your reservation. We've sent a confirmation email to{" "}
              {formData.email}. We look forward to serving you!
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <strong>Table:</strong> {selectedTable}
                </p>
                <p>
                  <strong>Date:</strong> {formData.date}
                </p>
                <p>
                  <strong>Time:</strong> {formData.time}
                </p>
                <p>
                  <strong>Guests:</strong> {formData.guests}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSubmitted(false)}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-colors"
            >
              Make Another Booking
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Toaster />
      <Header />

      {/* Hero Section */}
      <section className="relative h-64 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=1920)",
          }}
        ></div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Book a Table</h1>
          <p className="text-xl">Reserve your perfect dining experience</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Unified Section: QR Scanner (30%) & Available Tables (70%) */}
        <div className="mb-12 flex flex-col lg:flex-row gap-8">
          {/* QR Scanner - 30% */}
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full lg:w-[30%] flex flex-col justify-start items-center">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Connect to Table
              </h2>
              <p className="text-gray-600">
                Scan QR code on your table to start ordering
              </p>
            </div>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Scan QR Code
              </h3>
              <p className="text-gray-600 mb-6">
                Point your camera at the QR code on your table
              </p>
              <button
                onClick={handleStartScanning}
                disabled={showQrScanner}
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <Camera className="w-5 h-5" />
                <span>{showQrScanner ? "Scanning..." : "Start Scanning"}</span>
              </button>
              {/* QR Scanner Modal */}
              {showQrScanner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                  <div className="bg-white rounded-xl shadow-lg p-6 relative w-[90vw] max-w-md flex flex-col items-center">
                    <button
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                      onClick={() => setShowQrScanner(false)}
                    >
                      ×
                    </button>
                    <h4 className="mb-4 text-lg font-semibold text-gray-800">Scan Table QR</h4>
                    <div className="w-72 h-72 max-w-full mb-4">
                      {/* Version-safe alias to avoid prop-type mismatches across @yudiel/react-qr-scanner releases */}
                      <p className="text-xs text-gray-500 mb-1">Scanner active — align QR within the frame</p>
                      {(() => {
                        const QRScanner = Scanner as unknown as any;
                        return (
                          <QRScanner
                            onDecode={(text: any) => {
                              try {
                                const s = String(text ?? "").trim();
                                if (s) handleScan(s);
                              } catch {}
                            }}
                            onResult={(result: any) => {
                              try {
                                const s = typeof result === "string" ? result : result?.text;
                                const t = String(s ?? "").trim();
                                if (t) handleScan(t);
                              } catch {}
                            }}
                            onError={handleScanError}
                            style={{ width: "100%", height: "100%" }}
                            constraints={{ facingMode: { ideal: "environment" } }}
                          />
                        );
                      })()}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Align the QR code within the frame</p>
                    {qrError && (
                      <div className="text-red-600 text-sm mb-2">{qrError}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Available Tables - 70% */}
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full lg:w-[70%]">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Available Tables  
              </h3>
              <p className="text-gray-600">
                Click on any available table to select it
              </p>
              <p className="text-sm text-gray-500">
                (Showing {visibleTables.length} available table{visibleTables.length === 1 ? "" : "s"} — updates automatically)
              </p>
            </div>
            {/* Horizontal Table Layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
              {visibleTables.length === 0 ? (
                <div className="col-span-2 md:col-span-4 lg:col-span-7 text-center text-gray-500 py-6">
                  No tables available right now. Please try again shortly or adjust your time.
                </div>
              ) : (
                visibleTables.map((table) => {
                  return (
                    <div
                      key={table.id}
                      onClick={() => {
                        if (reservedCodes.has(table.id) || table.status !== "available") {
                          toast.error("That table is not available right now.");
                          return;
                        }
                        pickTable(table.id, 'layout');
                      }}
                      className={
                        `p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${selectedTable === table.id
                          ? "border-orange-500 bg-orange-50"
                          : ((reservedCodes.has(table.id) || table.status === "occupied" || table.status === "cleaning")
                              ? "border-gray-200 bg-gray-100 cursor-not-allowed opacity-60"
                              : "border-gray-200 hover:border-orange-300 bg-white")}`
                      }
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900 mb-1">
                          {table.id}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          {table.seats} seats
                        </div>
                        <div className="text-xs text-gray-500">
                          {table.location}
                        </div>
                        <div className="text-xs mt-1">
                          {reservedCodes.has(table.id) ? (
                            <span className="text-red-600 font-medium">Reserved</span>
                          ) : table.status === "occupied" ? (
                            <span className="text-yellow-600 font-medium">Occupied</span>
                          ) : table.status === "cleaning" ? (
                            <span className="text-orange-600 font-medium">Cleaning</span>
                          ) : (
                            <span className="text-green-600 font-medium">Available</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="text-center mb-6">
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Hide Available Tables
              </button>
            </div>
            {/* Need Help Section */}
            <div className="bg-blue-50 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Need Help?
              </h4>
              <p className="text-gray-600 mb-4">
                Can't find your table or having trouble? View all available
                tables or ask our staff for assistance.
              </p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                View Available Tables
              </button>
              <p className="text-xs text-gray-500 mt-2">
                For special table arrangements, please contact our staff
                directly.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Booking Form (Existing) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Booking Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Make a Reservation
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Your phone number"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Reservation Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select time</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Guests *
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      name="guests"
                      value={formData.guests}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "Guest" : "Guests"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Occasion
                  </label>
                  <select
                    name="occasion"
                    value={formData.occasion}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select occasion</option>
                    {occasions.map((occasion) => (
                      <option key={occasion} value={occasion}>
                        {occasion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedTable && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-green-800 font-medium">
                    Selected Table: {selectedTable}
                  </p>
                  <p className="text-green-600 text-sm">
                    {availableTables.find((t) => t.id === selectedTable)?.seats}{" "}
                    seats •{" "}
                    {
                      availableTables.find((t) => t.id === selectedTable)
                        ?.location
                    }
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Any dietary restrictions, seating preferences, or special requests..."
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingSession}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl text-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-colors"
              >
                {isCreatingSession
                  ? "Creating Session..."
                  : "Continue to Menu"}
              </button>
            </form>
          </div>

          {/* Restaurant Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Restaurant Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-orange-500 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Address</p>
                    <p className="text-gray-600">
                      123 Gourmet Street, Culinary District, CD 12345
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-orange-500 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-orange-500 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Hours</p>
                    <div className="text-gray-600 text-sm">
                      <p>Monday - Thursday: 5:00 PM - 10:00 PM</p>
                      <p>Friday - Saturday: 5:00 PM - 11:00 PM</p>
                      <p>Sunday: 4:00 PM - 9:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-4">Reservation Policy</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  • Reservations are held for 15 minutes past the reserved time
                </li>
                <li>
                  • Cancellations must be made at least 2 hours in advance
                </li>
                <li>• Large parties (8+) may require a deposit</li>
                <li>
                  • We accommodate dietary restrictions with advance notice
                </li>
                <li>• Smart casual dress code preferred</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}