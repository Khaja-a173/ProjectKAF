import React, { useState, useEffect } from "react";
import { Eye, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import type { MenuSection } from "../../types/menu";

export interface SectionListProps {
  sections: MenuSection[];
  selectedSection: string | null;
  onSelectSection: (id: string | null) => void;
  onCreateSection: () => void;
  onEditSection: (section: MenuSection) => void;
  onArchiveSection: (sectionId: string) => Promise<any> | void;
  onReorderSections: (order: string[]) => Promise<any> | void;
  onToggleSectionActive: (id: string, isActive: boolean) => Promise<any> | void;
  onToggleSectionItems: (sectionId: string, nextAvailable: boolean) => Promise<any> | void;
}

// Lightweight, prop-driven Section List used by MenuManagement (left sidebar)
export default function SectionList({
  sections,
  selectedSection,
  onSelectSection,
  onCreateSection,
  onEditSection,
  onArchiveSection,
  onReorderSections,
  onToggleSectionActive,
  onToggleSectionItems,
}: SectionListProps) {
  const [localSections, setLocalSections] = useState(sections);

  useEffect(() => {
    setLocalSections(sections);
  }, [sections]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 flex items-center justify-between border-b">
        <h3 className="text-sm font-semibold text-gray-800">Sections</h3>
        <button
          type="button"
          onClick={onCreateSection}
          className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          + Add
        </button>
      </div>

      <ul className="divide-y">
        <li
          key="all-sections"
          className={`flex items-center justify-between px-3 py-2 ${selectedSection === null ? "bg-blue-50" : ""}`}
        >
          <button
            type="button"
            onClick={() => onSelectSection(null)}
            className="flex-1 text-left"
            title="All Sections"
          >
            <div className="text-sm font-medium text-gray-900 truncate">All Sections</div>
          </button>
        </li>
        {localSections.map((s) => {
          const itemsAvailable = (s.items ?? []).every((it: any) => it?.isAvailable !== false && it?.is_available !== false);
          return (
            <li
              key={s.id}
              className={`flex items-center justify-between gap-2 min-h-[48px] px-3 py-2 ${selectedSection === s.id ? "bg-blue-50" : ""}`}
            >
              <button
                type="button"
                onClick={() => {
                  if (selectedSection === s.id) {
                    onSelectSection(null);
                  } else {
                    onSelectSection(s.id);
                  }
                }}
                className="flex-1 min-w-0 text-left"
                title={s.name}
              >
                <div className="text-sm font-medium text-gray-900 truncate">{s.name}</div>
                <div className="text-[11px] text-gray-500 truncate">{(s.items?.length ?? 0)} items</div>
              </button>
              <div className="shrink-0 w-40 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const idx = localSections.findIndex(ls => ls.id === s.id);
                    if (idx > 0) {
                      const updated = [...localSections];
                      [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
                      setLocalSections(updated);
                    }
                  }}
                  className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
                  aria-label="Move up"
                  title="Move up"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const idx = localSections.findIndex(ls => ls.id === s.id);
                    if (idx < localSections.length - 1) {
                      const updated = [...localSections];
                      [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
                      setLocalSections(updated);
                    }
                  }}
                  className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
                  aria-label="Move down"
                  title="Move down"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const nextAvailable = !itemsAvailable;
                      await onToggleSectionItems(s.id, nextAvailable);
                    } catch (err) {
                      console.error("Failed to toggle section items availability", err);
                    }
                  }}
                  className={`h-8 w-8 p-0 inline-flex items-center justify-center rounded-full border transition-colors ${
                    itemsAvailable
                      ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  }`}
                  aria-label={itemsAvailable ? "Make all items unavailable" : "Make all items available"}
                  title={itemsAvailable ? "Make all items unavailable" : "Make all items available"}
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onEditSection(s)}
                  className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50"
                  aria-label="Edit section"
                  title="Edit section"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onArchiveSection(s.id)}
                  className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-full border border-red-200 text-red-700 hover:bg-red-50"
                  aria-label="Delete section"
                  title="Delete section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          );
        })}
        {localSections.length === 0 && (
          <li className="px-3 py-4 text-sm text-gray-500">No sections yet. Click “Add” to create one.</li>
        )}
      </ul>

      {localSections.length > 1 && (
        <div className="p-3 border-t text-right">
          <button
            type="button"
            onClick={() => onReorderSections(localSections.map((s) => s.id))}
            className="text-xs px-3 py-1 rounded border border-gray-200 hover:bg-gray-50"
          >
            Save Order
          </button>
        </div>
      )}
    </div>
  );
}
