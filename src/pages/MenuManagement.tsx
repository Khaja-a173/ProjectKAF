import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useMenuManagement } from "../hooks/useMenuManagement";
import { useTenant } from "../contexts/TenantContext";
import SectionList from "../components/menu/SectionList";
import ItemGrid from "../components/menu/ItemGrid";
import ItemEditor from "../components/menu/ItemEditor";
import BulkUploader from "../components/menu/BulkUploader";
import { TaxConfigModal } from "../components/menu/TaxConfigModal";
import MenuFilters from "../components/menu/MenuFilters";
import {
  ChefHat,
  Plus,
  Upload,
  Download,
  BarChart3,
  Eye,
  Zap,
  List,
  Check,
  X,
  Trash2,
  Percent,
  Pencil,
  CornerUpLeft,
  ChevronDown,
} from "lucide-react";
import { MenuSection, MenuItem } from "../types/menu";
import { menuApi } from "../lib/api/menuApi";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuidV4 = (v?: string | null) => !!v && typeof v === 'string' && UUID_RE.test(v);


export default function MenuManagement() {
  const tenant = useTenant?.();
  const tenantId = tenant?.tenantId ?? "";
  const locationId = (tenant as any)?.locationId ?? "";
  const {
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
      bulkUpload,
      refreshSections,   // ✅ added
    } = useMenuManagement({
      tenantId: tenantId || "",
      locationId: locationId || "",
    });

  // If tenant is not yet resolved, avoid rendering hook-driven UI prematurely
  if (!tenantId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tenant...</p>
          </div>
        </div>
      </div>
    );
  }

  // Ensure the currently selected section remains valid as sections update
  useEffect(() => {
    if (!selectedSection) return;
    if (!isUuidV4(selectedSection) || !sections.some(s => s.id === selectedSection)) {
      setSelectedSection(null);
    }
  }, [sections]); // eslint-disable-line react-hooks/exhaustive-deps

  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  // Add Section Modal state
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  // Draft rows for adding new sections inside modal
  type NewSectionRow = { tempId: string; name: string; ord: number; isActive: boolean };
  const [newRows, setNewRows] = useState<NewSectionRow[]>([]);
  // Track inline edits for existing sections; commit on header Save
  const [editedNames, setEditedNames] = useState<Record<string, string>>({});

  // Global filters (simple): search + availability
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available" | "unavailable">("all");

  // Keep modal draft names in sync with live sections while modal is open
  useEffect(() => {
    if (!showAddSectionModal) return;
    setEditedNames((prev) => {
      const next = { ...prev } as Record<string, string>;
      sections.forEach((s) => {
        if (next[s.id] === undefined) next[s.id] = s.name;
      });
      return next;
    });
  }, [sections, showAddSectionModal]);

  const addNewSectionRow = () => {
    // Do not allow adding another draft if there is an empty-name draft present
    const hasEmptyDraft = newRows.some(r => !r.name || !r.name.trim());
    if (hasEmptyDraft) {
      console.warn("Please fill the current section name before adding another.");
      toast.warning("Please fill the current section name before adding another.");
      return;
    }
    const nextOrd =
      sections.length > 0
        ? Math.max(...sections.map((s: any) => (s.ord ?? s.sortIndex ?? 0))) + newRows.length + 1
        : 0;
    setNewRows((prev) => [
      ...prev,
      { tempId: String(Date.now() + Math.random()), name: "", ord: nextOrd, isActive: true },
    ]);
  };


  const cancelNewRow = (tempId: string) => {
    setNewRows((prev) => prev.filter((r) => r.tempId !== tempId));
  };
  const [showItemEditor, setShowItemEditor] = useState(false);
  const [showBulkUploader, setShowBulkUploader] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [qaOpen, setQaOpen] = useState(false);

  // Get items for selected section or all items
  const displayItems = selectedSection
    ? sections.find((s) => s.id === selectedSection)?.items || []
    : sections.flatMap((s) => s.items || []);

  // Apply global filters to the items list shown on the right
  const filteredItems = useMemo(() => {
    const q = String((filters as any)?.query || "").trim().toLowerCase();
    const avail = availabilityFilter; // "all" | "available" | "unavailable"

    const matchesSearch = (it: any) => {
      if (!q) return true;
      const name = (it?.name || "").toLowerCase();
      const desc = (it?.description || "").toLowerCase();
      const tags = Array.isArray(it?.tags) ? it.tags.join(" ").toLowerCase() : "";
      return name.includes(q) || desc.includes(q) || tags.includes(q);
    };

    const isAvail = (it: any) =>
      it?.isAvailable !== false && it?.is_available !== false;

    return (displayItems || [])
      .filter((it: any) => matchesSearch(it))
      .filter((it: any) => {
        if (avail === "all") return true;
        if (avail === "available") return isAvail(it);
        // unavailable
        return !isAvail(it);
      });
  }, [displayItems, filters, availabilityFilter]);

  const selectedSectionData = selectedSection
    ? sections.find((s) => s.id === selectedSection)
    : null;

  // Section is active only if ALL items are available
  const sectionActiveMap = useMemo(() => {
    return new Map(
      sections.map((s) => [
        s.id,
        (s.items ?? []).every((it: any) => it?.isAvailable !== false && it?.is_available !== false),
      ])
    );
  }, [sections]);

  const liveItemCount = sections.reduce((total, section) => total + (section.items?.length || 0), 0);
  const livePriceSum = sections.reduce(
    (total, section) => total + (section.items?.reduce((sum, item) => sum + (Number(item.price) || 0), 0) || 0),
    0
  );
  const stats = {
    totalItems: liveItemCount,
    availableItems: sections.reduce(
      (total, section) => total + (section.items?.filter((item) => item.isAvailable).length || 0),
      0
    ),
    totalSections: Array.from(sectionActiveMap.values()).filter(Boolean).length,
    avgPrice: liveItemCount > 0 ? livePriceSum / liveItemCount : 0,
  };

  // Bridge hook filters (query/tags/allergens) to UI filters shape expected by MenuFilters
  const uiFilters: any = {
    search: (filters as any)?.query ?? "",
    section: selectedSection ?? "all",
    availability: availabilityFilter,
    dietary: {
      tags: (filters as any)?.tags ?? [],
      allergens: (filters as any)?.allergens ?? [],
    },
  };

  // Adapter to map MenuFilters changes back to the hook's filter shape
  const onUiFiltersChange = (f: any) => {
    setFilters({
      query: f?.search ?? "",
      tags: f?.dietary?.tags ?? [],
      allergens: f?.dietary?.allergens ?? [],
    } as any);

    if (typeof f?.availability === "string") {
      setAvailabilityFilter(
        f.availability === "available" || f.availability === "unavailable" ? f.availability : "all"
      );
    }

    // Sync section filter -> left sidebar selection (toggleable)
    if (f?.section === "all" || f?.section == null) {
      setSelectedSection(null);
    } else if (typeof f.section === "string" && UUID_RE.test(f.section)) {
      // Selecting a specific section
      setSelectedSection(f.section);
    }
  };

  const openAddSection = () => {
    setShowAddSectionModal(true);
    setNewRows((prev) => {
      if (prev.some(r => !r.name || !r.name.trim())) return prev; // avoid multiple blanks
      if (prev.length) return prev;
      return [
        {
          tempId: String(Date.now() + Math.random()),
          name: "",
          ord:
            sections.length > 0
              ? Math.max(...sections.map((s: any) => (s.ord ?? s.sortIndex ?? 0))) + 1
              : 0,
          isActive: true,
        },
      ];
    });
  };


  const handleEditSection = (section: MenuSection) => {
    // Open the Manage Sections modal and preload the section's current name for inline editing
    setShowAddSectionModal(true);
    setSelectedSection(section.id);
    setEditedNames((prev) => {
      // Only set if not already being edited, so we don't clobber in-progress typing
      if (prev[section.id] === undefined) {
        return { ...prev, [section.id]: section.name };
      }
      return prev;
    });
  };



  const onToggleActive = async (id: string, nextAllItemsAvailable: boolean) => {
    try {
      // Toggle availability of all items under this section
      await handleToggleSectionItems(id, nextAllItemsAvailable);
    } catch (e) {
      console.error("Toggle section items failed:", e);
      console.warn("Failed to update section items availability.");
      toast.error("Failed to update section items availability.");
    }
  };

  const handleToggleSectionItems = async (sectionId: string, nextAvailable: boolean) => {
    try {
      if (!isUuidV4(sectionId)) {
        console.warn('[MenuManagement] skipping toggleSectionItems — invalid sectionId:', sectionId);
        return;
      }
      // Use authenticated API helper (adds Authorization/tenant headers), minimal payload
      await menuApi.toggleSectionItems(tenantId, sectionId as any, nextAvailable);
      // Fetch fresh data from server to avoid any stale item attributes (no bulk upsert here)
      await refreshSections();
    } catch (e) {
      console.error('Toggle section items failed:', e);
      console.warn('Failed to update section items availability.');
      toast.error("Failed to update section items availability.");
    }
  };


  // Show sections sorted by name (ascending) in the modal
  const sortedSections = useMemo(
    () => [...sections].sort((a, b) => (a.name || "").localeCompare(b.name || "")),
    [sections]
  );

  const handleCreateItem = () => {
    setEditingItem(null);
    setShowItemEditor(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setShowItemEditor(true);
  };


  const handleSaveItem = async (itemData: Partial<MenuItem>) => {
    // Always require name and price to be present and valid
    if (!itemData.name || !String(itemData.name).trim()) {
      toast.warning("Item name is required.");
      return;
    }
    let numericPrice = Number(itemData.price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      toast.warning("Valid numeric item price is required.");
      return;
    }
    itemData.price = numericPrice;

    try {
      if (editingItem) {
        // For edit: ensure name and numeric price are present (API expects both), fill from editingItem if missing
        if (!itemData.name) {
          itemData.name = editingItem.name;
        }
        if (
          itemData.price === undefined ||
          itemData.price === null ||
          isNaN(Number(itemData.price))
        ) {
          itemData.price = Number(editingItem.price);
        }
        if (!itemData.sectionId) {
          itemData.sectionId = editingItem.sectionId;
        }
        if (!itemData.sectionId || !isUuidV4(itemData.sectionId)) {
          toast.warning("Valid section is required.");
          return;
        }
        if (!(itemData as any).categoryId) {
          delete (itemData as any).categoryId;
        }
        await updateItem(editingItem.id, itemData);
      } else {
        // For create: require name, sectionId, and numeric price
        if (!itemData.name || !String(itemData.name).trim()) {
          toast.warning("Item name is required.");
          return;
        }
        if (!itemData.sectionId) {
          if (selectedSection && sections.some(s => s.id === selectedSection)) {
            itemData.sectionId = selectedSection;
          } else {
            const fallback = sections.find(s => s.isActive) || sections[0];
            if (fallback) {
              itemData.sectionId = fallback.id;
            }
          }
        }
        if (!itemData.sectionId || !isUuidV4(itemData.sectionId)) {
          toast.warning("Please select or create a valid section before adding an item.");
          return;
        }
        // Coerce price to number again (defensive)
        itemData.price = Number(itemData.price);
        if (isNaN(itemData.price) || itemData.price <= 0) {
          toast.warning("Valid numeric item price is required.");
          return;
        }
        if (!(itemData as any).categoryId) {
          delete (itemData as any).categoryId;
        }
        await createItem(itemData);
      }
      await refreshSections();
      setShowItemEditor(false); // close only on success
    } catch (err) {
      console.error("Failed to save item:", err);
      toast.error("Failed to save item. Please try again.");
    }
  };

  const handleArchiveItem = async (itemId: string) => {
    if (confirm("Are you sure you want to remove this item?")) {
      try {
        await archiveItem(itemId);
        await refreshSections();
      } catch (err) {
        console.error("Failed to archive item:", err);
        console.warn("Failed to remove item. Please try again.");
        toast.error("Failed to remove item. Please try again.");
      }
    }
  };

  const handleArchiveSection = async (sectionId: string) => {
    if (
      confirm(
        "Are you sure you want to archive this section? Items will be hidden from customers.",
      )
    ) {
      try {
        await archiveSection(sectionId);
        await refreshSections();
        if (selectedSection === sectionId) {
          setSelectedSection(null);
        }
      } catch (err) {
        console.error("Failed to archive section:", err);
        console.warn("Failed to archive section. Please try again.");
        toast.error("Failed to archive section. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading menu management...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error loading menu: {error}</div>
          <button
            onClick={async () => { try { await refreshSections(); } catch {} }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!sections.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-6">
        <img src="/empty-menu.svg" alt="No sections" className="max-w-xs mb-6" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Get started with your menu</h2>
        <p className="text-gray-600 mb-4">Add your first section to start building your menu.</p>
        <button
          onClick={openAddSection}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          + Add Section
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <List className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Menu Management</h1>
              <p className="text-sm text-gray-500">Items & categories</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-600 text-white hover:bg-orange-700 transition-colors shadow-sm"
            >
              <CornerUpLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <div className="relative">
              <button
                type="button"
                onClick={() => setQaOpen((v) => !v)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm"
              >
                <span>Quick actions</span>
                <ChevronDown className="w-4 h-4 opacity-90" />
              </button>
              {qaOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10">
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 hover:bg-gray-50 text-sm"
                    onClick={() => setQaOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/menu-management"
                    className="block px-4 py-2 hover:bg-gray-50 text-sm"
                    onClick={() => setQaOpen(false)}
                  >
                    Menu Management
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 hover:bg-gray-50 text-sm"
                    onClick={() => setQaOpen(false)}
                  >
                    Orders
                  </Link>
                  <Link
                    to="/table-management"
                    className="block px-4 py-2 hover:bg-gray-50 text-sm"
                    onClick={() => setQaOpen(false)}
                  >
                    Table Management
                  </Link>
                  <Link
                    to="/staff"
                    className="block px-4 py-2 hover:bg-gray-50 text-sm"
                    onClick={() => setQaOpen(false)}
                  >
                    Staff Management
                  </Link>
                  <Link
                    to="/kds"
                    className="block px-4 py-2 hover:bg-gray-50 text-sm"
                    onClick={() => setQaOpen(false)}
                  >
                    Kitchen Dashboard
                  </Link>
                  <Link
                    to="/analytics"
                    className="block px-4 py-2 hover:bg-gray-50 text-sm"
                    onClick={() => setQaOpen(false)}
                  >
                    Analytics
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 hover:bg-gray-50 text-sm"
                    onClick={() => setQaOpen(false)}
                  >
                    Settings
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalItems}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.availableItems}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sections</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalSections}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.avgPrice.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={openAddSection}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Section</span>
              </button>

              <button
                onClick={handleCreateItem}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>

              <button
                onClick={() => setShowBulkUploader(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Bulk Upload</span>
              </button>
              
            </div>

            <div className="flex items-center space-x-2">
              <Link
                to="/menu"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>View Customer Menu</span>
              </Link>
              <button
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                onClick={() => {/* TODO: hook up real export later */}}
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            <div title="Configure tax percentages for menu items">
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                onClick={() => setShowTaxModal(true)}
              >
                <Percent className="w-4 h-4" />
                <span>Tax %</span>
              </button>
            </div>
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Sections & Filters */}
          <div className="lg:col-span-1 space-y-6">
            <SectionList
              sections={sections}
              selectedSection={selectedSection}
              onSelectSection={setSelectedSection}
              onCreateSection={openAddSection}
              onEditSection={handleEditSection}
              onArchiveSection={handleArchiveSection}
              onReorderSections={(orderedIds) => {
                // `orderedIds` is a string[] matching /api/menu/sections/reorder { order }
                return reorderSections(orderedIds);
              }}
              onToggleSectionActive={onToggleActive}
              onToggleSectionItems={handleToggleSectionItems}
            />

            <MenuFilters
              filters={uiFilters}
              onFiltersChange={onUiFiltersChange}
              availableTags={availableTags ?? []}
              availableAllergens={availableAllergens ?? []}
            />
          </div>

          {/* Main Content - Items Grid */}
          <div className="lg:col-span-3">
            <ItemGrid
              section={selectedSectionData || null}
              items={filteredItems}
              onEditItem={handleEditItem}
              onToggleAvailability={toggleItemAvailability}
              onArchiveItem={handleArchiveItem}
              onReorderItems={(sectionId, order) => {
                const orderedIds = Array.isArray(order) ? order.map(o => o.id) : [];
                return reorderItems(sectionId, orderedIds);
              }}
            />
          </div>
        </div>

        {/* Modals */}

        {/* Add Section Modal */}
        {showAddSectionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Manage Sections</h3>
                <div className="flex items-center gap-2">
                  {/* Save (green) */}
                  <button
                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                    onClick={async () => {
                      try {
                        // 1) Create ONLY the new rows with non-empty names
                        for (const r of newRows) {
                          const name = (r.name || '').trim();
                          if (name) {
                            await createSection({ name, isActive: r.isActive, sortIndex: r.ord });
                          }
                        }

                        // 2) Update ONLY sections whose name actually changed
                        const renamePairs = sections
                          .map(s => ({ id: s.id, oldName: s.name, newName: (editedNames[s.id] ?? '').trim() }))
                          .filter(p => p.newName && p.newName !== p.oldName);

                        for (const p of renamePairs) {
                          await updateSection(p.id, { name: p.newName });
                        }

                        // 3) Refresh sections after save
                        await refreshSections();
                        setNewRows([]);
                        setEditedNames({});
                        setShowAddSectionModal(false);
                      } catch (e) {
                        console.error('Save sections failed:', e);
                        console.warn('Failed to save sections. Please try again.');
                        toast.error("Failed to save sections. Please try again.");
                      }
                    }}
                  >
                    Save
                  </button>
                  {/* Add Section (blue) */}
                  <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={addNewSectionRow}>
                    + Add Section
                  </button>
                  {/* Close (X) */}
                  <button
                    aria-label="Close"
                    className="p-2 rounded hover:bg-gray-100"
                    onClick={() => setShowAddSectionModal(false)}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Sections table (moved from page into modal) */}
              <div className="overflow-x-auto border-t pt-4 mt-2">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-gray-600">
                    <tr>
                      <th className="py-2 pr-3 w-28">Order</th>
                      <th className="py-2 pr-3">Name</th>
                      <th className="py-2 pr-3 w-28">Active</th>
                      <th className="py-2 pr-3 w-36">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="align-top">
                    {/* New draft rows (inline) */}
                    {newRows.map((r, newIdx) => (
                      <tr key={r.tempId} className="border-t border-gray-100 bg-blue-50/40">
                        <td className="py-2 pr-3">
                          <span className="text-gray-700">{newIdx + 1}</span>
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            value={r.name}
                            onChange={(e) =>
                              setNewRows((prev) =>
                                prev.map((x) => (x.tempId === r.tempId ? { ...x, name: e.target.value } : x)),
                              )
                            }
                            className="w-full border rounded px-2 py-1"
                            placeholder="Section name"
                            autoFocus={newIdx === 0}
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <span
                            className={`inline-flex items-center justify-center h-8 min-w-[88px] px-3 rounded-md text-sm font-medium border transition-colors bg-red-50 border-red-200 text-red-700`}
                          >
                            Inactive
                          </span>
                        </td>
                        <td className="py-2 pr-3">
                          <button
                            onClick={() => cancelNewRow(r.tempId)}
                            className="p-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50"
                            aria-label="Delete draft section"
                            title="Delete draft section"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {sortedSections.map((s, idx) => (
                      <tr key={s.id} className="border-t border-gray-100">
                        <td className="py-2 pr-3">
                          <span className="text-gray-700">{newRows.length + idx + 1}</span>
                        </td>
                        <td className="py-2 pr-3">
                          <div className="flex items-center gap-2">
                            <input
                              id={`sec-name-${s.id}`}
                              value={editedNames[s.id] ?? s.name}
                              onChange={(e) => setEditedNames((prev) => ({ ...prev, [s.id]: e.target.value }))}
                              className="w-full border rounded px-2 py-1"
                              placeholder="Section name"
                            />
                            <button
                              onClick={() => {
                                const el = document.getElementById(`sec-name-${s.id}`) as HTMLInputElement | null;
                                el?.focus();
                                el?.select();
                              }}
                              className="p-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
                              aria-label="Edit section name"
                              title="Edit section name"
                              type="button"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="py-2 pr-3">
                          <button
                            onClick={() => onToggleActive(s.id, !sectionActiveMap.get(s.id))}
                            className={`p-2 rounded-full border transition-colors ${
                              sectionActiveMap.get(s.id)
                                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                                : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                            }`}
                            aria-label={sectionActiveMap.get(s.id) ? 'Set section inactive' : 'Set section active'}
                            title={sectionActiveMap.get(s.id) ? 'Set section inactive' : 'Set section active'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                        <td className="py-2 pr-3">
                          <button
                            onClick={() => handleArchiveSection(s.id)}
                            className="p-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50"
                            aria-label="Delete section"
                            title="Delete section"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <ItemEditor
          item={editingItem}
          sections={sections}
          isOpen={showItemEditor}
          onClose={() => setShowItemEditor(false)}
          onSave={handleSaveItem}
        />

        <BulkUploader
          isOpen={showBulkUploader}
          onClose={() => setShowBulkUploader(false)}
          onUpload={async (items) => {
            try {
              // Ensure every item carries a valid sectionId and let server assign category if missing
              const enrichedItems = (items as any)
                .map((item: any) => {
                  // Skip if name is missing or blank
                  if (!item.name || !String(item.name).trim()) return null;
                  // Coerce price to number
                  item.price = Number(item.price);
                  if (isNaN(item.price) || item.price <= 0) return null;
                  if (!item.sectionId) {
                    let fallback: string | undefined;
                    if (selectedSection && sections.some(s => s.id === selectedSection)) {
                      fallback = selectedSection;
                    } else {
                      const firstActive = sections.find(s => s.isActive) || sections[0];
                      fallback = firstActive?.id;
                    }
                    if (isUuidV4(fallback)) {
                      item.sectionId = fallback;
                    }
                  }
                  // Let the server assign a valid category when not provided
                  if (!item.categoryId) {
                    delete item.categoryId;
                  }
                  if (!isUuidV4(item.sectionId)) {
                    console.warn('[BulkUploader] skipping row with invalid sectionId', item);
                    return null;
                  }
                  return item;
                })
                .filter(Boolean);

              const result = await menuApi.bulkUploadMenuItems(tenantId, enrichedItems as any);
              setShowBulkUploader(false);
              return result as any;
            } catch (err) {
              console.error("Bulk upload failed:", err);
              alert("Bulk upload failed. Please check your CSV and try again.");
              // Return a minimal shape expected by the uploader to satisfy its contract
              return {
                sectionsUpserted: 0,
                itemsUpserted: 0,
                itemsSkipped: 0,
                warnings: ["Bulk upload failed"],
              } as any;
            }
          }}
        />
        <TaxConfigModal
          open={showTaxModal}
          onClose={() => setShowTaxModal(false)}
          tenantId={tenantId}
        />
      </div>
    </div>
  );
}
