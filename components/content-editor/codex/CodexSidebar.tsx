// CodexSidebar.tsx
// Left sidebar with search, filters, and categories (Codex)
// Orchestration component - delegates to hooks, store, and child components

"use client";

import { useMemo, useCallback, useRef, type ReactNode } from "react";
import { useMagicbornMode } from "@lib/payload/hooks/useMagicbornMode";
import { useInvalidateCodexEntries } from "@lib/hooks/useCodexEntries";
import { Settings, Trash2, Plus, Edit, Copy, Download, Upload } from "lucide-react";
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
import { EntityTypeModalHost } from "./modals/EntityTypeModalHost";
import { CustomEntityModalHost } from "./modals/CustomEntityModalHost";
import { useCodexTypeCommands } from "@/lib/content-editor/codex/commands/useCodexTypeCommands";
import { assertValidEntityTypeExport } from "@/lib/content-editor/codex/schema/validate";
import { toExportFile, downloadJson } from "@/lib/content-editor/codex/api/schemaImportExport";
import { toast } from "@/lib/hooks/useToast";
import { useCodexCustomEntityCommands } from "@/lib/content-editor/codex/commands/useCodexCustomEntityCommands";

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
    setSelectedEntries,
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
  const customEntityCommands = useCodexCustomEntityCommands(projectId);

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

    if (contextMenu.type === "sidebar") {
      return [
        {
          label: "Create Entity Type",
          icon: <Plus className="w-4 h-4" />,
          onClick: () => openCreateEntityType(),
        },
        {
          label: "Import Entity Type",
          icon: <Upload className="w-4 h-4" />,
          onClick: () => handleImportTypeClick(),
        },
      ];
    }

    if (contextMenu.type === "customType") {
      const { typeId, typeName, typeDoc } = contextMenu;
      return [
        {
          label: `New ${typeName}`,
          icon: <Plus className="w-4 h-4" />,
          onClick: () => openCreateCustomEntity(typeId),
        },
        { label: "", onClick: () => {}, divider: true },
        {
          label: "Edit Type",
          icon: <Edit className="w-4 h-4" />,
          onClick: () => openEditEntityType(typeId),
        },
        {
          label: "Export Type",
          icon: <Download className="w-4 h-4" />,
          onClick: () => {
            if (typeDoc) {
              const file = toExportFile(typeDoc);
              downloadJson(`${typeDoc.slug || typeDoc.name || "entity-type"}.json`, file);
            }
          },
          disabled: !typeDoc,
        },
        { label: "", onClick: () => {}, divider: true },
        {
          label: "Delete Type",
          icon: <Trash2 className="w-4 h-4" />,
          onClick: () => typeCommands.trashType(typeId),
          danger: true,
        },
      ];
    }

    if (contextMenu.type === "customEntry") {
      const { typeId, entry } = contextMenu;
      return [
        {
          label: "Edit",
          icon: <Edit className="w-4 h-4" />,
          onClick: () => openEditCustomEntity(typeId, entry.id),
        },
        { label: "", onClick: () => {}, divider: true },
        {
          label: "Delete",
          icon: <Trash2 className="w-4 h-4" />,
          onClick: () => customEntityCommands.trashEntity(typeId, entry.id),
          danger: true,
        },
      ];
    }

    // category / entry (system)
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
        onCreateCustomType={openCreateEntityType}
        onImportCustomType={handleImportTypeClick}
        onUndo={commands.undoLast}
        onRedo={commands.redoLast}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <input
        ref={importInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => handleImportTypeFile(e.target.files?.[0] ?? null)}
      />

      <CodexCategoryList
        projectId={projectId}
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
        customTypes={(entityTypesQuery.data ?? []).map((t: any) => ({ id: String(t.id), name: t.name }))}
        expandedCustomTypes={expandedEntityTypes}
        onToggleCustomType={toggleEntityType}
        onSidebarContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          openContextMenu({ x: e.clientX, y: e.clientY, type: "sidebar" });
        }}
        onCustomTypeContextMenu={(e, typeId, typeName) => {
          e.preventDefault();
          e.stopPropagation();
          const typeDoc = (entityTypesQuery.data ?? []).find((t: any) => String(t.id) === typeId);
          openContextMenu({
            x: e.clientX,
            y: e.clientY,
            type: "customType",
            typeId,
            typeName,
            typeDoc,
          });
        }}
        onCustomEntryClick={(e, entryId) => {
          // minimal selection highlight parity
          if ((e.target as HTMLElement).closest("button")) return;
          setSelectedEntries(new Set([entryId]));
        }}
        onCustomEntryDoubleClick={(e, typeId, entryId) => {
          e.preventDefault();
          e.stopPropagation();
          openEditCustomEntity(typeId, entryId);
        }}
        onCustomEntryContextMenu={(e, typeId, entry) => {
          e.preventDefault();
          e.stopPropagation();
          openContextMenu({
            x: e.clientX,
            y: e.clientY,
            type: "customEntry",
            typeId,
            entry,
          });
        }}
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

      {/* Custom Types modals */}
      <EntityTypeModalHost projectId={projectId} />
      <CustomEntityModalHost projectId={projectId} />
    </aside>
  );
}

// CustomTypeRow removed — custom types are rendered inside CodexCategoryList

