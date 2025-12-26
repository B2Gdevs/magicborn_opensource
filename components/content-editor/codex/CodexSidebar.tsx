// CodexSidebar.tsx
// Left sidebar with search, filters, and categories (Codex)
// Orchestration component - delegates to hooks, store, and child components

"use client";

import { useMemo, useCallback, useEffect, type ReactNode } from "react";
import { useMagicbornMode } from "@lib/payload/hooks/useMagicbornMode";
import { useInvalidateCodexEntries } from "@lib/hooks/useCodexEntries";
import { Settings, Trash2, Plus, Edit, Copy } from "lucide-react";
import Link from "next/link";
import { CodexContextMenu, type CodexContextMenuItem } from "./CodexContextMenu";
import { NewEntryMenu } from "../NewEntryMenu";
import { CodexSidebarHeader } from "./CodexSidebarHeader";
import { CodexCategoryList } from "./CodexCategoryList";
import { CodexBulkActions } from "./CodexBulkActions";
import { useCodexSelection } from "../hooks/useCodexSelection";
import { useCodexEntriesByCategory } from "./hooks/useCodexEntriesByCategory";
import { useCodexCommands } from "@lib/content-editor/codex/commands/useCodexCommands";
import { useCodexSidebarStore } from "./store/codexSidebar.store";
import { useCodexHistoryStore } from "@lib/content-editor/codex/store/codexHistory.store";
import { CodexCategory, EntryType, CATEGORY_TO_ENTRY_TYPE } from "@lib/content-editor/constants";
import { getAllEntryTypes, getDisplayName, useProjectConfigs } from "@lib/content-editor/entry-config";
import type { CodexEntry } from "./types/codex.types";

interface Category {
  id: CodexCategory;
  name: string;
  icon: ReactNode;
}

interface CodexSidebarProps {
  projectId: string;
  selectedCategory: CodexCategory | null;
  onCategorySelect: (category: CodexCategory | null) => void;
}

export function CodexSidebar({ projectId, selectedCategory, onCategorySelect }: CodexSidebarProps) {
  const { isMagicbornMode } = useMagicbornMode(projectId);
  const projectConfigs = useProjectConfigs(projectId);
  const invalidateCodexEntries = useInvalidateCodexEntries();

  // Zustand store for UI state
  const {
    isCollapsed,
    expanded,
    searchQuery,
    contextMenu,
    triggerNewEntry,
    editEntry,
    toggleCategory,
    expandCategory,
    setCollapsed,
    setSearchQuery,
    openContextMenu,
    closeContextMenu,
  } = useCodexSidebarStore();

  // Get all categories from entry-config (single source of truth) with project overrides
  // Filter out Act, Chapter, Page (content structure types, not codex entries)
  // Deduplicate by category ID
  const allCategories: Category[] = useMemo(() => {
    const entryTypes = getAllEntryTypes(isMagicbornMode);
    const codexEntryTypes = entryTypes.filter(
      (config) =>
        config.id !== EntryType.Act &&
        config.id !== EntryType.Chapter &&
        config.id !== EntryType.Page
    );

    // Deduplicate by category ID
    const categoryMap = new Map<CodexCategory, Category>();
    codexEntryTypes.forEach((config) => {
      if (!categoryMap.has(config.category)) {
        categoryMap.set(config.category, {
          id: config.category,
          name: getDisplayName(config.id, projectConfigs),
          icon: config.icon,
        });
      }
    });

    return Array.from(categoryMap.values());
  }, [isMagicbornMode, projectConfigs]);

  // Get category IDs for queries
  const categoryIds = useMemo(
    () => allCategories.map((c) => c.id),
    [allCategories]
  );

  // Fetch entries for all categories using useQueries
  const { getEntries, isLoading } = useCodexEntriesByCategory({
    projectId,
    categories: categoryIds,
    expanded,
    isMagicbornMode,
  });

  // Invalidate helper
  const invalidateCategory = useCallback(
    (categoryId: CodexCategory) => {
      invalidateCodexEntries(categoryId, projectId);
    },
    [invalidateCodexEntries, projectId]
  );

  // Refresh category (invalidate + expand)
  const refreshCategory = useCallback(
    (categoryId: CodexCategory) => {
      invalidateCategory(categoryId);
      expandCategory(categoryId);
    },
    [invalidateCategory, expandCategory]
  );

  // Selection hook
  const {
    selectedEntries,
    sidebarRef,
    handleEntryClick: handleSelectionClick,
    clearSelection,
    selectAllInCategories,
  } = useCodexSelection();

  // Commands hook
  const commands = useCodexCommands({
    projectId,
    invalidateCategory,
    getEntries,
    clearSelection,
  });

  // History state for undo/redo buttons
  const canUndo = useCodexHistoryStore((s) => s.undoStack.length > 0);
  const canRedo = useCodexHistoryStore((s) => s.redoStack.length > 0);

  // Handle category toggle
  const handleToggleCategory = useCallback(
    (categoryId: CodexCategory) => {
      toggleCategory(categoryId);
      onCategorySelect(categoryId);
    },
    [toggleCategory, onCategorySelect]
  );

  // Handle context menu
  const handleContextMenu = useCallback(
    (
      e: React.MouseEvent,
      type: "category" | "entry",
      categoryId: CodexCategory,
      entry?: CodexEntry
    ) => {
      e.preventDefault();
      e.stopPropagation();
      openContextMenu({
        x: e.clientX,
        y: e.clientY,
        type,
        categoryId,
        entry,
      });
    },
    [openContextMenu]
  );

  // Wrap handleEntryClick to include selection logic
  const handleEntryClick = useCallback(
    (
      e: React.MouseEvent,
      categoryId: CodexCategory,
      entryId: string,
      index: number
    ) => {
      handleSelectionClick(e, categoryId, entryId, index, getEntries);
    },
    [handleSelectionClick, getEntries]
  );

  const handleEntryDoubleClick = useCallback(
    (e: React.MouseEvent, categoryId: CodexCategory, entryId: string) => {
      e.preventDefault();
      e.stopPropagation();
      commands.editEntry(categoryId, entryId);
    },
    [commands]
  );

  // Handle bulk operations for selected entries
  const handleBulkDeleteSelected = useCallback(async () => {
    if (selectedEntries.size === 0) return;

    // Group selected entries by category with names
    const entriesByCategory = new Map<CodexCategory, string[]>();

    allCategories.forEach((category) => {
      const entries = getEntries(category.id);
      const selected = entries.filter((e) => selectedEntries.has(e.id));
      if (selected.length > 0) {
        entriesByCategory.set(category.id, selected.map((e) => e.id));
      }
    });

    try {
      await commands.bulkDelete(entriesByCategory);
    } catch (error) {
      console.error("Failed to delete entries:", error);
    }
  }, [selectedEntries, allCategories, getEntries, commands]);

  const handleBulkDuplicateSelected = useCallback(async () => {
    if (selectedEntries.size === 0) return;

    // Group selected entries by category
    const entriesByCategory = new Map<CodexCategory, string[]>();

    allCategories.forEach((category) => {
      const entries = getEntries(category.id);
      const selected = entries.filter((e) => selectedEntries.has(e.id));
      if (selected.length > 0) {
        entriesByCategory.set(category.id, selected.map((e) => e.id));
      }
    });

    try {
      await commands.bulkDuplicate(entriesByCategory);
      clearSelection();
    } catch (error) {
      console.error("Failed to duplicate entries:", error);
    }
  }, [selectedEntries, allCategories, getEntries, commands, clearSelection]);

  // Build context menu items
  const getContextMenuItems = (): CodexContextMenuItem[] => {
    if (!contextMenu) return [];

    const { type, categoryId, entry } = contextMenu;
    const categoryName =
      allCategories.find((c) => c.id === categoryId)?.name || categoryId;
    const singularName = categoryName.endsWith("s")
      ? categoryName.slice(0, -1)
      : categoryName;

    if (type === "category") {
      const entries = getEntries(categoryId);
      return [
        {
          label: `New ${singularName}`,
          icon: <Plus className="w-4 h-4" />,
          onClick: () => commands.newEntryForCategory(categoryId),
        },
        ...(entries.length > 0
          ? [
              { label: "", onClick: () => {}, divider: true },
              {
                label: `Delete All ${categoryName} (${entries.length})`,
                icon: <Trash2 className="w-4 h-4" />,
                onClick: () => commands.deleteAllInCategory(categoryId),
                danger: true,
              },
            ]
          : []),
      ];
    }

    // Entry context menu
    return [
      {
        label: "Edit",
        icon: <Edit className="w-4 h-4" />,
        onClick: () => entry && commands.editEntry(categoryId, entry.id),
      },
      {
        label: "Duplicate",
        icon: <Copy className="w-4 h-4" />,
        onClick: () => entry && commands.duplicateOne(categoryId, entry.id),
      },
      { label: "", onClick: () => {}, divider: true },
      {
        label: "Delete",
        icon: <Trash2 className="w-4 h-4" />,
        onClick: () => entry && commands.trashOne(categoryId, entry.id, entry.name),
        danger: true,
      },
    ];
  };

  // Handle Cmd/Ctrl+A for select all
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "a") {
        e.preventDefault();
        // Convert expanded Record to Set for selectAllInCategories
        const expandedSet = new Set<CodexCategory>();
        Object.entries(expanded).forEach(([cat, isExp]) => {
          if (isExp) expandedSet.add(cat as CodexCategory);
        });
        selectAllInCategories(expandedSet, getEntries);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [expanded, getEntries, selectAllInCategories]);

  return (
    <aside
      ref={sidebarRef}
      className={`${
        isCollapsed ? "w-16" : "w-56"
      } flex flex-col transition-all duration-200`}
    >
      <CodexSidebarHeader
        isCollapsed={isCollapsed}
        searchQuery={searchQuery}
        onToggleCollapsed={() => setCollapsed(!isCollapsed)}
        onSearchChange={setSearchQuery}
        onUndo={commands.undoLast}
        onRedo={commands.redoLast}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <CodexCategoryList
        categories={allCategories}
        selectedCategory={selectedCategory}
        expanded={expanded}
        onToggleCategory={handleToggleCategory}
        onContextMenu={handleContextMenu}
        getEntries={getEntries}
        isLoading={isLoading}
        selectedEntries={selectedEntries}
        onEntryClick={handleEntryClick}
        onEntryDoubleClick={handleEntryDoubleClick}
        onEdit={commands.editEntry}
        onDuplicate={commands.duplicateOne}
        onDelete={(categoryId, entryId) => {
          const entries = getEntries(categoryId);
          const entry = entries.find((e) => e.id === entryId);
          commands.trashOne(categoryId, entryId, entry?.name);
        }}
        isCollapsed={isCollapsed}
      />

      <CodexBulkActions
        selectedCount={selectedEntries.size}
        onClear={clearSelection}
        onDuplicate={handleBulkDuplicateSelected}
        onDelete={handleBulkDeleteSelected}
        isCollapsed={isCollapsed}
      />

      <div className="p-2">
        <Link
          href={`/content-editor/${projectId}/settings`}
          className={`flex items-center ${
            isCollapsed ? "justify-center" : "gap-2"
          } px-2 py-1.5 text-text-secondary hover:text-ember-glow hover:bg-deep rounded transition-colors`}
          title={isCollapsed ? "Settings" : undefined}
        >
          <Settings className="w-4 h-4" />
          {!isCollapsed && <span className="text-sm">Settings</span>}
        </Link>
      </div>

      {contextMenu && (
        <CodexContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={closeContextMenu}
          items={getContextMenuItems()}
        />
      )}

      <NewEntryMenu
        projectId={projectId}
        isMagicbornMode={isMagicbornMode}
        onEntryCreated={(category) => {
          const categoryId = category.toLowerCase() as CodexCategory;
          refreshCategory(categoryId);
        }}
        triggerType={triggerNewEntry}
        onTriggerHandled={() => {
          const { clearNewEntryTrigger } = useCodexSidebarStore.getState();
          clearNewEntryTrigger();
        }}
        editEntry={
          editEntry
            ? {
                categoryId: editEntry.categoryId,
                entryId: editEntry.entryId,
              }
            : null
        }
        onEditClosed={() => {
          const { closeEditEntry } = useCodexSidebarStore.getState();
          const currentEdit = editEntry;
          closeEditEntry();
          if (currentEdit) {
            refreshCategory(currentEdit.categoryId);
          }
        }}
      />
    </aside>
  );
}

