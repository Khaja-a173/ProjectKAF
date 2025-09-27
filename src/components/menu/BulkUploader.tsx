import { useState, useCallback } from "react";
import { menuApi } from "@/lib/api";
import { useTenant } from "@/contexts/TenantContext";
import { BulkUploadItem, BulkUploadResult } from "../../types/menu";
import { Upload, Download, X, CheckCircle, AlertTriangle } from "lucide-react";

interface BulkUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (items: BulkUploadItem[]) => Promise<BulkUploadResult>;
}

type AnyObj = Record<string, any>;

type NormalizedItem = {
  // IDs or names (server will resolve where allowed)
  section_id?: string | null;
  section_name?: string | null;
  category_id?: string | null;
  category_name?: string | null;
  // required
  name: string;
  price: number;
  // optional
  ord?: number | null;
  is_available?: boolean;
  image_url?: string | null;
  description?: string | null;
  tags?: string[];
  calories?: number | null;
  spicy_level?: number | null;
  preparation_time?: number | null;
  // passthrough legacy fields (ignored by server if not used)
  cost?: number | null;
};

function toBool(v: any): boolean | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  if (typeof v === "boolean") return v;
  const s = String(v).trim().toLowerCase();
  if (["1", "true", "yes", "y"].includes(s)) return true;
  if (["0", "false", "no", "n"].includes(s)) return false;
  return undefined;
}

function toNum(v: any): number | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function parseTags(v: any): string[] | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  const s = String(v).trim();
  if (s.startsWith("[") && s.endsWith("]")) {
    try {
      const arr = JSON.parse(s);
      if (Array.isArray(arr)) return arr.map((x) => String(x).trim()).filter(Boolean);
    } catch {}
  }
  // support a|b|c OR comma/semicolon separated
  return s
    .split(/[|;,]/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

// very small CSV parser that supports quoted fields (double quotes) and commas within quotes
function parseCsv(text: string): AnyObj[] {
  const rows: AnyObj[] = [];
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) return rows;

  const parseLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        out.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out.map((v) => v.trim());
  };

  const headerCells = parseLine(lines[0]);
  const headers = headerCells.map((h) => h.trim());

  for (let r = 1; r < lines.length; r++) {
    const cells = parseLine(lines[r]);
    const obj: AnyObj = {};
    headers.forEach((h, i) => {
      obj[h] = cells[i] ?? "";
    });
    rows.push(obj);
  }
  return rows;
}

function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/-/g, "")
    .replace(/\./g, "")
    .replace(/imageurl/, "image_url")
    .replace(/imgurl/, "image_url")
    .replace(/^section$/, "section_name") // legacy "section" means section name
    .replace(/^isavailable$/, "is_available")
    .replace(/^available$/, "is_available")
    .replace(/^spicylevel$/, "spicy_level")
    .replace(/^preptime$/, "preparation_time")
    .replace(/^prep_time$/, "preparation_time");
}

function normalizeRow(row: AnyObj): NormalizedItem | null {
  const out: NormalizedItem = {
    name: "",
    price: 0,
  };

  for (const key of Object.keys(row)) {
    const norm = normalizeHeader(key);
    const val = row[key];
    switch (norm) {
      case "section_id":
        out.section_id = String(val || "").trim() || null;
        break;
      case "section_name":
        out.section_name = String(val || "").trim() || null;
        break;
      case "category_id":
        out.category_id = String(val || "").trim() || null;
        break;
      case "category_name":
        out.category_name = String(val || "").trim() || null;
        break;
      case "name":
        out.name = String(val || "").trim();
        break;
      case "description":
        out.description = String(val || "").trim() || null;
        break;
      case "price": {
        const n = toNum(val);
        if (n !== undefined) out.price = n;
        break;
      }
      case "ord": {
        const n = toNum(val);
        out.ord = n ?? null;
        break;
      }
      case "is_available": {
        const b = toBool(val);
        if (b !== undefined) out.is_available = b;
        break;
      }
      case "image_url":
        out.image_url = String(val || "").trim() || null;
        break;
      case "tags": {
        const t = parseTags(val);
        if (t) out.tags = t;
        break;
      }
      case "calories": {
        const n = toNum(val);
        out.calories = n ?? null;
        break;
      }
      case "spicy_level": {
        const n = toNum(val);
        out.spicy_level = n ?? null;
        break;
      }
      case "preparation_time": {
        const n = toNum(val);
        out.preparation_time = n ?? null;
        break;
      }
      case "cost": {
        const n = toNum(val);
        out.cost = n ?? null;
        break;
      }
      default:
        // ignore other columns
        break;
    }
  }

  if (!out.name || !(Number.isFinite(out.price) && out.price >= 0)) return null;
  // require at least a section identifier (id or name) — caller can enforce if necessary
  if (!out.section_id && !out.section_name) return null;
  return out;
}

export default function BulkUploader({ isOpen, onClose, onUpload }: BulkUploaderProps) {
  const { tenantId } = useTenant();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<NormalizedItem[]>([]);
  const [result, setResult] = useState<BulkUploadResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = (event.target?.result as string) || "";
        let items: NormalizedItem[] = [];

        if (uploadedFile.name.toLowerCase().endsWith(".json")) {
          const data = JSON.parse(content);
          const arr = Array.isArray(data) ? data : Array.isArray((data as AnyObj).rows) ? (data as AnyObj).rows : [];
          items = arr
            .map((row: AnyObj) => normalizeRow(row))
            .filter((x): x is NormalizedItem => !!x);
        } else if (uploadedFile.name.toLowerCase().endsWith(".csv")) {
          const rawRows = parseCsv(content);
          items = rawRows
            .map((row) => normalizeRow(row))
            .filter((x): x is NormalizedItem => !!x);
        } else {
          alert("Unsupported file type. Please upload .csv or .json");
          return;
        }

        setPreview(items);
      } catch (err) {
        console.error("Bulk parse failed:", err);
        alert("Error parsing file. Please check the format.");
      }
    };

    reader.readAsText(uploadedFile);
  }, []);

  const handleUpload = async () => {
    if (preview.length === 0) return;
    if (!tenantId) {
      alert("Tenant not selected. Please select a tenant and try again.");
      return;
    }
    setLoading(true);
    try {
      // Collect names that still need resolution (when *_id is missing)
      const sectionNames = Array.from(
        new Set(
          preview
            .map((i) => (!i.section_id ? (i.section_name || "").trim() : ""))
            .filter((v) => !!v)
        )
      );
      const categoryNames = Array.from(
        new Set(
          preview
            .map((i) => (!i.category_id ? (i.category_name || "").trim() : ""))
            .filter((v) => !!v)
        )
      );

      let secMap: Record<string, string> = {};
      let catMap: Record<string, string> = {};

      if (sectionNames.length > 0 || categoryNames.length > 0) {
        const resolved = await menuApi.resolveMenuRefs(tenantId, {
          sections: sectionNames,
          categories: categoryNames,
          options: { autoCreateMissing: true },
        });
        secMap = Object.fromEntries(
          (resolved.sections || []).map((r) => [String(r.name).toLowerCase(), r.id])
        );
        catMap = Object.fromEntries(
          (resolved.categories || []).map((r) => [String(r.name).toLowerCase(), r.id])
        );
      }

      // Rewrite items with resolved IDs (IDs win over names if both provided)
      const itemsWithIds = preview.map((it) => {
        const section_id = it.section_id || (it.section_name ? secMap[(it.section_name || "").toLowerCase()] : undefined);
        const category_id = it.category_id || (it.category_name ? catMap[(it.category_name || "").toLowerCase()] : undefined);
        return {
          ...it,
          section_id: section_id ?? null,
          category_id: category_id ?? null,
        } as NormalizedItem;
      });

      // Final validation: every row must have a section_id after resolution
      const unresolved = itemsWithIds.filter((r) => !r.section_id);
      if (unresolved.length > 0) {
        const missing = Array.from(
          new Set(
            unresolved
              .map((r) => (r.section_name ? r.section_name : "(missing section)"))
              .filter(Boolean)
          )
        );
        alert(
          `Couldn't resolve these section names to IDs: \n- ${missing.join(
            "\n- "
          )}\n\nPlease fix the names (or ensure you have access) and try again.`
        );
        setLoading(false);
        return;
      }

      // Cast to API type to keep compatibility
      const uploadResult = await onUpload(itemsWithIds as unknown as BulkUploadItem[]);
      setResult(uploadResult);
    } catch (err) {
      console.error("Bulk upload failed:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = [
      // header (names only)
      "section_name,category_name,name,description,price,is_available,image_url,tags,calories,spicy_level,preparation_time",
      // samples
      "Starters,Appetizers,Garlic Bread,Toasted bread with garlic butter,3.50,true,https://picsum.photos/seed/garlic/200,vegetarian|starter,220,0,5",
      "Starters,Appetizers,Bruschetta,Grilled bread with tomato & basil,4.50,true,https://picsum.photos/seed/bruschetta/200,vegan|starter,180,0,7",
      "Salads,Healthy,Caesar Salad,Crisp romaine with parmesan,7.99,true,https://picsum.photos/seed/caesar/200,gluten_free|healthy,250,1,10",
      "Mains,Pizza,Margherita Pizza,Classic cheese & tomato pizza,9.99,true,https://picsum.photos/seed/margherita/200,vegetarian|pizza,500,1,15",
      "Desserts,Cakes,Cheesecake,Creamy cheesecake with berry topping,6.00,true,https://picsum.photos/seed/cheesecake/200,dessert|sweet,420,0,6",
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "menu_items_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Bulk Upload Menu Items</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!result ? (
            <div className="space-y-6">
              {/* Upload Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Upload Instructions</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Supported formats: CSV, JSON</li>
                  <li>• Required fields: <b>section_id</b> or <b>section_name</b>, <b>name</b>, <b>price</b></li>
                  <li>• Optional fields: category_id / category_name, ord, is_available, image_url, description, tags, calories, spicy_level, preparation_time</li>
                  <li>• <b>tags</b>: use <code>a|b|c</code> or JSON array like <code>["a","b"]</code></li>
                  <li>• Booleans accept yes/no, true/false, 1/0</li>
                </ul>
                <button onClick={downloadTemplate} className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1">
                  <Download className="w-4 h-4" />
                  <span>Download CSV Template</span>
                </button>
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input type="file" accept=".csv,.json" onChange={handleFileUpload} className="hidden" id="bulk-upload" />
                <label htmlFor="bulk-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">{file ? file.name : "Choose file to upload"}</p>
                  <p className="text-sm text-gray-600">CSV or JSON files up to 10MB</p>
                </label>
              </div>

              {/* Preview */}
              {preview.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Preview ({preview.length} items)</h4>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Section</th>
                          <th className="px-3 py-2 text-left">Section ID</th>
                          <th className="px-3 py-2 text-left">Name</th>
                          <th className="px-3 py-2 text-left">Price</th>
                          <th className="px-3 py-2 text-left">Available</th>
                          <th className="px-3 py-2 text-left">Tags</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.slice(0, 10).map((item, index) => (
                          <tr key={index} className="border-t border-gray-200">
                            <td className="px-3 py-2">{item.section_name || ""}</td>
                            <td className="px-3 py-2">{item.section_id || ""}</td>
                            <td className="px-3 py-2">{item.name}</td>
                            <td className="px-3 py-2">${item.price}</td>
                            <td className="px-3 py-2">{String(item.is_available ?? true)}</td>
                            <td className="px-3 py-2">{(item.tags || []).join(", ")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {preview.length > 10 && (
                      <div className="p-3 text-center text-sm text-gray-500 border-t border-gray-200">... and {preview.length - 10} more items</div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleUpload} disabled={preview.length === 0 || loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{loading ? "Uploading..." : `Upload ${preview.length} Items`}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Upload Results */
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Upload Complete!</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{result.created}</div>
                  <div className="text-sm text-green-800">Created</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{result.updated}</div>
                  <div className="text-sm text-blue-800">Updated</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{result.skipped}</div>
                  <div className="text-sm text-gray-800">Skipped</div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-900 mb-3 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Errors ({result.errors.length})
                  </h4>
                  <div className="max-h-32 overflow-y-auto border border-red-200 rounded-lg">
                    {result.errors.map((error, index) => (
                      <div key={index} className="p-3 border-b border-red-200 last:border-b-0">
                        <div className="text-sm text-red-800">Row {error.row}: {error.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button onClick={onClose} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
