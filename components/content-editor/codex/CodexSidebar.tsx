// CodexSidebar.tsx
// Left sidebar with search, filters, and categories (Codex)
// Orchestration component - delegates to hooks, store, and child components

"use client";

import { useMemo, useCallback, useRef, type ReactNode } from "react";
import { useMagicbornMode } from "@lib/payload/hooks/useMagicbornMode";
import { useInvalidateCodexEntries } from "@lib/hooks/useCodexEntries";
import { Settings, Trash2, Plus, Edit, Copy, ChevronDown, ChevronRight, Upload, Download } from "lucide-react";
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
import { useCodexEntityTypes } from "@/lib/content-editor/codex/hooks/useCodexEntityTypes";
import { useCodexEntitiesByType } from "@/lib/content-editor/codex/hooks/useCodexEntitiesByType";
import { EntityTypeModalHost } from "./modals/EntityTypeModalHost";
import { CustomEntityModalHost } from "./modals/CustomEntityModalHost";
import { useCodexTypeCommands } from "@/lib/content-editor/codex/commands/useCodexTypeCommands";
import { assertValidEntityTypeExport } from "@/lib/content-editor/codex/schema/validate";
import { toExportFile, downloadJson } from "@/lib/content-editor/codex/api/schemaImportExport";
import { toast } from "@/lib/hooks/useToast";

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
  const importInputRef = useRef<HTMLInputElement | null>(null);

  // Zustand store for UI state
  const {
    isCollapsed,
    expanded,
    expandedEntityTypes,
    searchQuery,
    contextMenu,
    triggerNewEntry,
    editEntry,
    toggleCategory,
    expandCategory,
    toggleEntityType,
    setCollapsed,
    setSearchQuery,
    openContextMenu,
    closeContextMenu,
    openCreateEntityType,
    openEditEntityType,
    openCreateCustomEntity,
    openEditCustomEntity,
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

  // Custom Types hooks
  const typeCommands = useCodexTypeCommands(projectId);
  const entityTypesQuery = useCodexEntityTypes(projectId);

  // History state for undo/redo buttons
  const canUndo = useCodexHistoryStore((s) => s.undoStack.length > 0);
  const canRedo = useCodexHistoryStore((s) => s.redoStack.length > 0);

  const handleImportTypeClick = () => {
    importInputRef.current?.click();
  };

  const handleImportTypeFile = async (file: File | null) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      assertValidEntityTypeExport(parsed);

      // Create as a new type (no overwrite behavior yet)
      await typeCommands.createType({
        project: parseInt(projectId, 10),
        name: parsed.name,
        slug: parsed.slug,
        icon: parsed.icon,
        schema: parsed.schema,
        uiSchema: parsed.uiSchema,
        version: parsed.version ?? 1,
        isSystem: false,
      });
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to import Entity Type");
    } finally {
      if (importInputRef.current) {
        importInputRef.current.value = "";
      }
    }
  };

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

  // NOTE: Intentionally no keyboard shortcuts in Codex (per product decision).

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

      {/* Custom Types */}
      <div className="px-2 pb-2">
        <div
          className={`flex items-center ${
            isCollapsed ? "justify-center" : "justify-between"
          } px-2 py-1.5 text-xs font-semibold text-text-muted`}
        >
          {!isCollapsed && <span>Custom Types</span>}
          <div className={`flex items-center gap-1 ${isCollapsed ? "flex-col" : ""}`}>
            <button
              type="button"
              className="p-1 rounded hover:bg-deep text-text-secondary hover:text-text-primary"
              title="Import Entity Type"
              onClick={handleImportTypeClick}
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1 rounded hover:bg-deep text-text-secondary hover:text-text-primary"
              title="Create Entity Type"
              onClick={openCreateEntityType}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <input
          ref={importInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => handleImportTypeFile(e.target.files?.[0] ?? null)}
        />

        {!entityTypesQuery.isLoading && (entityTypesQuery.data?.length ?? 0) === 0 && !isCollapsed && (
          <div className="px-2 py-2 text-xs text-text-muted">No custom types yet.</div>
        )}

        <div className="space-y-1">
          {(entityTypesQuery.data ?? []).map((t: any) => (
            <CustomTypeRow
              key={String(t.id)}
              projectId={projectId}
              typeDoc={t}
              isCollapsed={isCollapsed}
              isExpanded={!!expandedEntityTypes[String(t.id)]}
              onToggle={() => toggleEntityType(String(t.id))}
              onCreateEntry={() => openCreateCustomEntity(String(t.id))}
              onEditType={() => openEditEntityType(String(t.id))}
              onExport={() => {
                const file = toExportFile(t);
                downloadJson(`${t.slug || t.name || "entity-type"}.json`, file);
              }}
              onEditEntry={(entityId) => openEditCustomEntity(String(t.id), entityId)}
            />
          ))}
        </div>
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

      {/* Custom Types modals */}
      <EntityTypeModalHost projectId={projectId} />
      <CustomEntityModalHost projectId={projectId} />
    </aside>
  );
}

function CustomTypeRow({
  projectId,
  typeDoc,
  isCollapsed,
  isExpanded,
  onToggle,
  onCreateEntry,
  onEditType,
  onExport,
  onEditEntry,
}: {
  projectId: string;
  typeDoc: any;
  isCollapsed: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onCreateEntry: () => void;
  onEditType: () => void;
  onExport: () => void;
  onEditEntry: (entityId: string) => void;
}) {
  const typeId = String(typeDoc.id);
  const entitiesQuery = useCodexEntitiesByType(projectId, typeId, isExpanded);

  return (
    <div className="rounded border border-border/30 bg-deep/10">
      <div
        className={`flex items-center ${
          isCollapsed ? "justify-center" : "justify-between"
        } px-2 py-1.5`}
      >
        <button
          type="button"
          className={`flex items-center ${
            isCollapsed ? "" : "gap-2"
          } text-xs text-text-secondary hover:text-text-primary`}
          onClick={onToggle}
          title={typeDoc.name}
        >
          {isCollapsed ? (
            <span className="text-sm font-semibold">{typeDoc.name?.[0] ?? "T"}</span>
          ) : (
            <>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <span className="truncate">{typeDoc.name}</span>
            </>
          )}
        </button>

        {!isCollapsed && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-1 rounded hover:bg-deep text-text-secondary hover:text-text-primary"
              title="Create Entry"
              onClick={onCreateEntry}
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1 rounded hover:bg-deep text-text-secondary hover:text-text-primary"
              title="Edit Type"
              onClick={onEditType}
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1 rounded hover:bg-deep text-text-secondary hover:text-text-primary"
              title="Export Type"
              onClick={onExport}
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {isExpanded && !isCollapsed && (
        <div className="px-2 pb-2">
          {entitiesQuery.isLoading ? (
            <div className="py-2 text-xs text-text-muted">Loading...</div>
          ) : (entitiesQuery.data?.length ?? 0) === 0 ? (
            <div className="py-2 text-xs text-text-muted">No entries.</div>
          ) : (
            <div className="space-y-1">
              {(entitiesQuery.data ?? []).map((e: any) => (
                <button
                  key={String(e.id)}
                  type="button"
                  className="w-full text-left px-2 py-1 rounded hover:bg-deep/40 text-xs text-text-secondary hover:text-text-primary"
                  onClick={() => onEditEntry(String(e.id))}
                  title={e.name}
                >
                  <span className="truncate block">{e.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

