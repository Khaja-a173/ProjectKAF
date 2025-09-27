import React, { useState, useEffect } from "react";
import { taxApi, type SaveTaxBody } from "@/lib/api";

// UI component model (percent-based in the form)
type UITaxComponent = {
  label: string;     // shown as name in backend
  code: string;      // optional tag for admin; NOT used by backend
  rate: number | ""; // percent in UI (e.g., 10), converted to fraction for save
};

type UITaxConfig =
  | { mode: "single"; total: number | ""; currency: string; inclusion: "inclusive" | "exclusive" }
  | { mode: "components"; total: number | ""; currency: string; inclusion: "inclusive" | "exclusive"; components: UITaxComponent[] };

interface TaxConfigModalProps {
  open: boolean;
  onClose: () => void;
  tenantId: string;
}

const toPercent = (fraction: unknown) => {
  const n = Number(fraction);
  if (!Number.isFinite(n)) return "" as const;
  // store a few decimals to avoid UI jitter
  return Number((n * 100).toFixed(6));
};

const toFraction = (percentLike: unknown) => {
  const n = Number(percentLike);
  if (!Number.isFinite(n)) return 0;
  // accept both 10 and 0.10 from UI just in case
  return n > 1 ? n / 100 : n;
};

const upperCurrency = (s: string) => (s || "").trim().toUpperCase();

// -- Accent palette --
const palette = {
  blue: '#2563eb',       // Mode
  purple: '#7c3aed',     // Tax Type
  teal: '#0ea5e9',       // Currency/Save accent
  green: '#16a34a',      // Primary action
  gray900: '#111827',
  gray200: '#e5e7eb',
};

// --- shared styles for a more professional look ---
const styles = {
  overlay: {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(17, 24, 39, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    padding: 16,
  },
  modal: {
    width: "100%",
    maxWidth: 680,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden" as const,
  },
  header: {
    padding: "16px 20px",
    borderBottom: "1px solid #eef2f7",
  },
  title: { fontWeight: 700, fontSize: 18, color: "#111827", margin: 0 },
  subtitle: { marginTop: 4, fontSize: 12, color: "#6b7280" },
  body: {
    maxHeight: "70vh",
    overflowY: "auto" as const,
    overflowX: "hidden" as const,
    padding: "16px 20px",
  },
  row2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginBottom: 16,
    alignItems: "end",
  },
  label: { display: "block", fontSize: 12, color: "#4b5563", marginBottom: 6 },
  input: {
    width: "100%",
    height: 40,
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 14,
    outline: "none",
  },
  pillGroup: { display: "flex", gap: 12, marginTop: 8 },
  pill: (active: boolean, color: string) => ({
    padding: "8px 12px",
    borderRadius: 9999,
    border: `1px solid ${active ? color : "#d1d5db"}`,
    background: active ? color : "#fff",
    color: active ? "#fff" : palette.gray900,
    fontSize: 12,
    cursor: "pointer",
    transition: "all .15s ease",
  }),
  sectionLabel: { display: "block", fontSize: 12, color: "#4b5563", marginBottom: 8 },
  compHeader: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gap: 10,
    marginBottom: 6,
    padding: "0 4px",
    color: "#6b7280",
    fontSize: 12,
  },
  compRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gap: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  compPanel: {
    border: "1px solid #eef2f7",
    borderRadius: 10,
    padding: 12,
    background: "#fafafa",
  },
  sumLine: { marginTop: 6, fontSize: 12, color: "#111827" },
  sumBad: { color: "#dc2626", fontWeight: 600 },
  footer: {
    position: "sticky" as const,
    bottom: 0,
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
    padding: "12px 20px",
    borderTop: "1px solid #eef2f7",
    background: "#fff",
  },
  btnSecondary: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnPrimary: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "none",
    background: palette.green,
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
  errorBox: {
    marginTop: 8,
    padding: "8px 10px",
    borderRadius: 8,
    background: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fee2e2",
    fontSize: 13,
  },
};

// Helper colored section label (top-level, outside `styles`)
const SectionLabel: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#4b5563', marginBottom: 6 }}>
    <span style={{ width: 8, height: 8, borderRadius: 9999, background: color, display: 'inline-block' }} />
    {children}
  </label>
);

export const TaxConfigModal: React.FC<TaxConfigModalProps> = ({ open, onClose, tenantId }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<UITaxConfig>({ mode: "single", total: "", currency: "", inclusion: "inclusive" });
  const [error, setError] = useState<string | null>(null);

  // Load existing config and map FRACTION -> PERCENT for UI
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    taxApi
      .get(tenantId)
      .then((data: any) => {
        // Expected backend shape:
        // { mode: 'single'|'components', total_rate?: number (fraction), components?: [{ name, rate (fraction) }], currency?: string, inclusion?: "inclusive" | "exclusive" }
        const mode = data?.mode === "components" ? "components" : "single";
        const currency = upperCurrency(data?.currency ?? "USD");
        const inclusion: "inclusive" | "exclusive" = data?.inclusion === "exclusive" ? "exclusive" : "inclusive";
        if (mode === "components") {
          const comps = Array.isArray(data?.components)
            ? data.components.map((c: any) => ({
                label: String(c.name ?? c.label ?? ""),
                code: String(c.code ?? ""),
                rate: toPercent(c.rate),
              }))
            : [];
          const total = toPercent(
            typeof data?.total_rate === "number" && data.total_rate > 0
              ? data.total_rate
              : (Array.isArray(data?.components)
                  ? data.components.reduce((s: number, x: any) => s + Number(x?.rate ?? 0), 0)
                  : 0)
          );
          setConfig({ mode, total, currency, inclusion, components: comps });
        } else {
          const total = toPercent(typeof data?.total_rate === "number" ? data.total_rate : 0);
          setConfig({ mode: "single", total, currency, inclusion });
        }
      })
      .catch(() => {
        setConfig({ mode: "single", total: "", currency: "", inclusion: "inclusive" });
      })
      .finally(() => setLoading(false));
  }, [open, tenantId]);

  const handleModeChange = (mode: "single" | "components") => {
    if (mode === config.mode) return;
    setConfig((prev) =>
      mode === "single"
        ? { mode: "single", total: prev.total || "", currency: upperCurrency(prev.currency), inclusion: prev.inclusion }
        : {
            mode: "components",
            total: prev.total || "",
            currency: upperCurrency(prev.currency),
            inclusion: prev.inclusion,
            components: [{ label: "", code: "", rate: "" }],
          }
    );
    setError(null);
  };

  const handleTotalChange = (val: string) => {
    const n = val === "" ? "" : Number(val);
    setConfig((prev) => ({ ...prev, total: n } as UITaxConfig));
    setError(null);
  };

  const handleCurrencyChange = (val: string) => {
    setConfig((prev) => ({ ...prev, currency: upperCurrency(val) } as UITaxConfig));
  };

  const handleComponentChange = (idx: number, field: keyof UITaxComponent, value: string) => {
    if (config.mode !== "components") return;
    const updated = config.components.map((c, i) =>
      i === idx
        ? {
            ...c,
            [field]: field === "rate" ? (value === "" ? "" : Number(value)) : value,
          }
        : c
    );
    setConfig({ ...config, components: updated });
    setError(null);
  };

  const handleAddComponent = () => {
    if (config.mode !== "components") return;
    setConfig({ ...config, components: [...config.components, { label: "", code: "", rate: "" }] });
    setError(null);
  };

  const sumComponentsPercent = () => {
    if (config.mode !== "components") return 0;
    return config.components.reduce((sum, c) => sum + (typeof c.rate === "number" ? c.rate : 0), 0);
  };

  const isCurrencyValid = () => {
    const c = upperCurrency((config as any).currency || "");
    if (c === "") return true; // allow blank; we fallback to USD on save
    return c.length >= 3 && c.length <= 8; // flexible, but prevents nonsense
  };

  const canSave = () => {
    if (!isCurrencyValid()) return false;

    if (config.mode === "single") {
      if (config.total === "" || isNaN(Number(config.total))) return false;
      return Number(config.total) >= 0;
    }

    // components mode
    if (
      config.components.length === 0 ||
      config.components.some(
        (c) => !c.label || c.rate === "" || isNaN(Number(c.rate)) || Number(c.rate) < 0
      )
    )
      return false;

    const sum = sumComponentsPercent();
    if (config.total === "") return true; // allow blank total; backend can derive from components

    const total = Number(config.total);
    return Math.abs(sum - total) < 1e-6;
  };

  const handleInclusionChange = (value: "inclusive" | "exclusive") => {
    setConfig((prev) => ({ ...prev, inclusion: value } as UITaxConfig));
  };

  const handleSave = async () => {
    if (!canSave()) {
      setError(
        config.mode === "components"
          ? "Sum of component rates must equal total, and all names required."
          : "Enter a valid tax percentage and currency."
      );
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const currency = upperCurrency((config as any).currency || "USD");
      if (config.mode === "single") {
        const payload: SaveTaxBody = {
          mode: "single",
          total_rate: toFraction(config.total), // FRACTION
          currency,
          inclusion: config.inclusion,
        };
        await taxApi.save(tenantId, payload);
      } else {
        const components = config.components.map((c) => ({
          name: c.label.trim(),
          rate: toFraction(c.rate), // FRACTION
        }));
        const payload: SaveTaxBody = {
          mode: "components",
          components,
          currency,
          inclusion: config.inclusion,
        };
        await taxApi.save(tenantId, payload);
      }
      onClose();
    } catch (e) {
      setError("Failed to save tax config.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => onClose();

  return !open ? null : (
    <div role="dialog" aria-modal="true" style={styles.overlay} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Configure Tax</h2>
          <p style={styles.subtitle}>Set how tax should be calculated and displayed across your tenant.</p>
        </div>
        <div style={styles.body}>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              {/* First row: Mode and Currency */}
              <div style={styles.row2}>
                <div>
                  <SectionLabel color={palette.blue}>Mode</SectionLabel>
                  <div style={styles.pillGroup}>
                    <button
                      onClick={() => handleModeChange("single")}
                      type="button"
                      style={styles.pill(config.mode === "single", palette.blue)}
                      disabled={saving}
                    >
                      Single Rate
                    </button>
                    <button
                      onClick={() => handleModeChange("components")}
                      type="button"
                      style={styles.pill(config.mode === "components", palette.blue)}
                      disabled={saving}
                    >
                      Components
                    </button>
                  </div>
                </div>
                <div>
                  <SectionLabel color={palette.teal}>Currency</SectionLabel>
                  <input
                    type="text"
                    value={(config as any).currency || ""}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    placeholder="USD"
                    disabled={saving}
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Second row: Tax Type and Total Tax % */}
              <div style={styles.row2}>
                <div>
                  <SectionLabel color={palette.purple}>Tax Type</SectionLabel>
                  <div style={styles.pillGroup}>
                    <button
                      onClick={() => handleInclusionChange("inclusive")}
                      type="button"
                      style={styles.pill(config.inclusion === "inclusive", palette.purple)}
                      disabled={saving}
                    >
                      Inclusive
                    </button>
                    <button
                      onClick={() => handleInclusionChange("exclusive")}
                      type="button"
                      style={styles.pill(config.inclusion === "exclusive", palette.purple)}
                      disabled={saving}
                    >
                      Exclusive
                    </button>
                  </div>
                </div>
                <div>
                  <SectionLabel color={palette.teal}>Total Tax %</SectionLabel>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={
                      config.mode === "components" && config.total === ""
                        ? sumComponentsPercent()
                        : config.total
                    }
                    onChange={(e) => handleTotalChange(e.target.value)}
                    placeholder="10%"
                    disabled={saving}
                    style={styles.input}
                  />
                </div>
              </div>

              {config.mode === "single" ? null : (
                <div style={{ marginBottom: 16 }}>
                  <SectionLabel color={palette.purple}>Components</SectionLabel>
                  <div style={styles.compPanel}>
                    {/* Header row for component fields */}
                    <div style={styles.compHeader}>
                      <span>Label</span>
                      <span>Code</span>
                      <span>Rate %</span>
                    </div>
                    {config.components.map((c, i) => (
                      <div key={i} style={styles.compRow}>
                        <input
                          style={styles.input}
                          placeholder="Label (e.g., CGST)"
                          value={c.label}
                          onChange={(e) => handleComponentChange(i, "label", e.target.value)}
                          disabled={saving}
                        />
                        <input
                          style={styles.input}
                          placeholder="Code (optional)"
                          value={c.code}
                          onChange={(e) => handleComponentChange(i, "code", e.target.value)}
                          disabled={saving}
                        />
                        <input
                          style={styles.input}
                          type="number"
                          min={0}
                          step="any"
                          placeholder="Rate %"
                          value={c.rate}
                          onChange={(e) => handleComponentChange(i, "rate", e.target.value)}
                          disabled={saving}
                        />
                      </div>
                    ))}
                    <button
                      onClick={handleAddComponent}
                      type="button"
                      disabled={saving}
                      style={{ ...styles.btnSecondary, borderColor: palette.purple, color: palette.purple }}
                    >
                      Add Component
                    </button>
                    <div style={styles.sumLine}>
                      <strong>
                        Sum: {sumComponentsPercent()} %{" "}
                        {config.total !== "" && Math.abs(sumComponentsPercent() - Number(config.total)) > 1e-6 && (
                          <span style={styles.sumBad}>(Does not match total)</span>
                        )}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {error && <div style={styles.errorBox}>{error}</div>}
            </>
          )}
        </div>
        <div style={styles.footer}>
          <button onClick={handleCancel} disabled={saving} type="button" style={styles.btnSecondary}>Cancel</button>
          <button onClick={handleSave} disabled={!canSave() || saving} type="button" style={styles.btnPrimary}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};