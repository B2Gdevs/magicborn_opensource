// CodexCategoryList.tsx
// List of categories with entries

"use client";

import { ChevronRight, ChevronDown, Shapes } from "lucide-react";
import { CodexCategory } from "@lib/content-editor/constants";
import { CodexEntryList } from "./CodexEntryList";
import { Skeleton } from "@/components/ui/Skeleton";
import type { CodexEntry } from "./types/codex.types";
import { useCodexEntitiesByType } from "@/lib/content-editor/codex/hooks/useCodexEntitiesByType";
import { makeSelectionKey } from "@/components/content-editor/hooks/useCodexSelection";

interface Category {
  id: CodexCategory;
  name: string;
  icon: React.ReactNode;
}

interface CodexCategoryListProps {
  projectId: string;
  categories: Category[];
  selectedCategory: CodexCategory | null;
  expanded: Record<CodexCategory, boolean>;
  onToggleCategory: (categoryId: CodexCategory) => void;
  onContextMenu: (e: React.MouseEvent, type: "category" | "entry", categoryId: CodexCategory | string, entry?: CodexEntry) => void;
  getEntries: (categoryId: CodexCategory) => CodexEntry[];
  isLoading: (categoryId: CodexCategory) => boolean;
  selectedEntries: Set<string>;
  onEntryClick: (e: React.MouseEvent, categoryId: CodexCategory | string, entryId: string, index: number) => void;
  onEntryDoubleClick: (e: React.MouseEvent, categoryId: CodexCategory | string, entryId: string) => void;
  onEdit: (categoryId: CodexCategory | string, entryId: string) => void;
  onDuplicate: (categoryId: CodexCategory | string, entryId: string) => void;
  onDelete: (categoryId: CodexCategory | string, entryId: string) => void;
  isCollapsed: boolean;

  // Custom Types (rendered in the same list)
  customTypes?: Array<{ id: string; name: string }>;
  expandedCustomTypes?: Record<string, boolean>;
  onToggleCustomType?: (typeId: string) => void;
  onSidebarContextMenu?: (e: React.MouseEvent) => void;
  onCustomTypeContextMenu?: (e: React.MouseEvent, typeId: string, typeName: string, typeDoc?: any) => void;
  onCustomEntryClick?: (e: React.MouseEvent, typeId: string, entryId: string, index: number) => void;
  onCustomEntryDoubleClick?: (e: React.MouseEvent, typeId: string, entryId: string) => void;
  onCustomEntryContextMenu?: (e: React.MouseEvent, typeId: string, entry: CodexEntry) => void;
}

export function CodexCategoryList({
  projectId,
  categories,
  selectedCategory,
  expanded,
  onToggleCategory,
  onContextMenu,
  getEntries,
  isLoading,
  selectedEntries,
  onEntryClick,
  onEntryDoubleClick,
  onEdit,
  onDuplicate,
  onDelete,
  isCollapsed,
  customTypes = [],
  expandedCustomTypes = {},
  onToggleCustomType,
  onSidebarContextMenu,
  onCustomTypeContextMenu,
  onCustomEntryClick,
  onCustomEntryDoubleClick,
  onCustomEntryContextMenu,
}: CodexCategoryListProps) {
  return (
    <div
      className="flex-1 overflow-y-auto p-2 space-y-0.5"
      onContextMenu={(e) => onSidebarContextMenu?.(e)}
    >
      {categories.map((category) => {
        const isExpanded = expanded[category.id] === true;
        const isSelected = selectedCategory === category.id;

        return (
          <div key={category.id}>
            <button
              onClick={() => onToggleCategory(category.id)}
              onContextMenu={(e) => onContextMenu(e, "category", category.id)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-2 py-1.5 rounded transition-colors ${
                isSelected
                  ? "bg-ember/20 border border-ember/30 text-ember-glow"
                  : "hover:bg-deep text-text-primary"
              }`}
              title={isCollapsed ? category.name : undefined}
            >
              <div className="flex items-center gap-2">
                {category.icon}
                {!isCollapsed && <span className="font-medium text-sm">{category.name}</span>}
              </div>
              {!isCollapsed && (isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
              ))}
            </button>
            {!isCollapsed && isExpanded && (
              <div className="ml-5 mt-0.5 space-y-0.5 border-l border-border pl-2">
                {isLoading(category.id) ? (
                  <div className="space-y-0.5 px-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} variant="text" className="w-full h-4" />
                    ))}
                  </div>
                ) : (
                  <CodexEntryList
                    categoryId={category.id}
                    entries={getEntries(category.id)}
                    selectedEntries={selectedEntries}
                    onEntryClick={onEntryClick}
                    onEntryDoubleClick={onEntryDoubleClick}
                    onContextMenu={onContextMenu}
                    onEdit={onEdit}
                    onDuplicate={onDuplicate}
                    onDelete={onDelete}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Custom Types in the same list (above Settings; no separate bottom section) */}
      {customTypes.length > 0 && (
        <div className="pt-2">
          {!isCollapsed && (
            <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              Custom Types
            </div>
          )}
          {customTypes.map((t) => (
            <CustomTypeRow
              key={t.id}
              projectId={projectId}
              typeId={t.id}
              typeName={t.name}
              isCollapsed={isCollapsed}
              isExpanded={expandedCustomTypes[t.id] === true}
              selectedEntries={selectedEntries}
              onToggle={() => onToggleCustomType?.(t.id)}
              onContextMenu={(e) => onCustomTypeContextMenu?.(e, t.id, t.name)}
              onEntryClick={(e, entryId, index) => onCustomEntryClick?.(e, t.id, entryId, index)}
              onEntryDoubleClick={(e, entryId) => onCustomEntryDoubleClick?.(e, t.id, entryId)}
              onEntryContextMenu={(e, entry) => onCustomEntryContextMenu?.(e, t.id, entry)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CustomTypeRow({
  projectId,
  typeId,
  typeName,
  isCollapsed,
  isExpanded,
  selectedEntries,
  onToggle,
  onContextMenu,
  onEntryClick,
  onEntryDoubleClick,
  onEntryContextMenu,
}: {
  projectId: string;
  typeId: string;
  typeName: string;
  isCollapsed: boolean;
  isExpanded: boolean;
  selectedEntries: Set<string>;
  onToggle: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onEntryClick?: (e: React.MouseEvent, entryId: string, index: number) => void;
  onEntryDoubleClick?: (e: React.MouseEvent, entryId: string) => void;
  onEntryContextMenu?: (e: React.MouseEvent, entry: CodexEntry) => void;
}) {
  const entitiesQuery = useCodexEntitiesByType(projectId, typeId, isExpanded && !isCollapsed);
  const entries: CodexEntry[] = (entitiesQuery.data ?? []).map((d: any) => ({
    id: String(d.id),
    name: d.name,
  }));

  return (
    <div>
      <button
        onClick={onToggle}
        onContextMenu={(e) => onContextMenu(e)}
        className={`w-full flex items-center ${
          isCollapsed ? "justify-center" : "justify-between"
        } px-2 py-1.5 rounded transition-colors hover:bg-deep text-text-primary`}
        title={isCollapsed ? typeName : undefined}
      >
        <div className="flex items-center gap-2">
          <Shapes className="w-4 h-4 text-text-muted" />
          {!isCollapsed && <span className="font-medium text-sm">{typeName}</span>}
        </div>
        {!isCollapsed &&
          (isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
          ))}
      </button>

      {!isCollapsed && isExpanded && (
        <div className="ml-5 mt-0.5 space-y-0.5 border-l border-border pl-2">
          {entitiesQuery.isLoading ? (
            <div className="space-y-0.5 px-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} variant="text" className="w-full h-4" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-xs text-text-muted px-2 py-0.5 italic">No entries yet</div>
          ) : (
            entries.map((entry, index) => {
              // Use composite key for selection to avoid cross-category collisions
              const selectionKey = makeSelectionKey(typeId, entry.id);
              const isSelected = selectedEntries.has(selectionKey);
              return (
                <div
                  key={entry.id}
                  className={`group flex items-center justify-between w-full text-xs px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-ember/20 border border-ember/30 text-ember-glow"
                      : "text-text-secondary hover:text-ember-glow hover:bg-deep/50"
                  }`}
                  onClick={(e) => onEntryClick?.(e, entry.id, index)}
                  onDoubleClick={(e) => onEntryDoubleClick?.(e, entry.id)}
                  onContextMenu={(e) => onEntryContextMenu?.(e, entry)}
                >
                  <span className="truncate flex-1">{entry.name}</span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

