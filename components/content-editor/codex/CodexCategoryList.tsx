// CodexCategoryList.tsx
// List of categories with entries

"use client";

import { ChevronRight, ChevronDown } from "lucide-react";
import { CodexCategory } from "@lib/content-editor/constants";
import { CodexEntryList } from "./CodexEntryList";
import { Skeleton } from "@/components/ui/Skeleton";
import type { CodexEntry } from "./types/codex.types";

interface Category {
  id: CodexCategory;
  name: string;
  icon: React.ReactNode;
}

interface CodexCategoryListProps {
  categories: Category[];
  selectedCategory: CodexCategory | null;
  expanded: Record<CodexCategory, boolean>;
  onToggleCategory: (categoryId: CodexCategory) => void;
  onContextMenu: (e: React.MouseEvent, type: "category" | "entry", categoryId: CodexCategory, entry?: CodexEntry) => void;
  getEntries: (categoryId: CodexCategory) => CodexEntry[];
  isLoading: (categoryId: CodexCategory) => boolean;
  selectedEntries: Set<string>;
  onEntryClick: (e: React.MouseEvent, categoryId: CodexCategory, entryId: string, index: number) => void;
  onEntryDoubleClick: (e: React.MouseEvent, categoryId: CodexCategory, entryId: string) => void;
  onEdit: (categoryId: CodexCategory, entryId: string) => void;
  onDuplicate: (categoryId: CodexCategory, entryId: string) => void;
  onDelete: (categoryId: CodexCategory, entryId: string) => void;
  isCollapsed: boolean;
}

export function CodexCategoryList({
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
}: CodexCategoryListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
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
    </div>
  );
}

