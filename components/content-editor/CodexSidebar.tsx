// components/content-editor/CodexSidebar.tsx
// Left sidebar with search, filters, and categories (Codex)

"use client";

import { useState, useEffect, ReactNode, useMemo } from "react";
import { useMagicbornMode } from "@lib/payload/hooks/useMagicbornMode";
import { useCodexEntries, useInvalidateCodexEntries } from "@lib/hooks/useCodexEntries";
import { 
  Search, 
  Plus, 
  Settings, 
  FileText, 
  Download, 
  Save,
  User,
  MapPin,
  Package,
  BookOpen,
  Sparkles,
  Gem,
  Zap,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  FolderOpen,
  ArrowLeft,
  Edit,
  Trash2,
  Copy,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ContextMenu, ContextMenuItem } from "./ContextMenu";
import { EntryActionsMenu } from "./EntryActionsMenu";
import { NewEntryMenu } from "./NewEntryMenu";

import { CodexCategory, EntryType, CATEGORY_TO_ENTRY_TYPE, CATEGORY_TO_COLLECTION } from "@lib/content-editor/constants";

interface Category {
  id: CodexCategory;
  name: string;
  icon: ReactNode;
  entries?: { id: string; name: string }[];
}

interface CodexSidebarProps {
  projectId: string;
  selectedCategory: CodexCategory | null;
  onCategorySelect: (category: CodexCategory | null) => void;
}

export function CodexSidebar({ projectId, selectedCategory, onCategorySelect }: CodexSidebarProps) {
  const { isMagicbornMode, loading: modeLoading } = useMagicbornMode(projectId);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<CodexCategory>>(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const invalidateCodexEntries = useInvalidateCodexEntries();
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    type: "category" | "entry";
    categoryId: CodexCategory;
    entry?: { id: string; name: string };
  } | null>(null);
  
  // For triggering NewEntryMenu programmatically
  const [triggerNewEntry, setTriggerNewEntry] = useState<string | null>(null);
  
  // For edit mode
  const [editEntry, setEditEntry] = useState<{
    categoryId: CodexCategory;
    entryId: string;
  } | null>(null);

  const refreshCategory = (categoryId: CodexCategory) => {
    // Invalidate React Query cache to force refetch
    invalidateCodexEntries(categoryId, projectId);
    // Expand category if not already expanded so entries are visible
    if (!expandedCategories.has(categoryId)) {
      setExpandedCategories(prev => new Set(prev).add(categoryId));
    }
  };

  // Core categories (always visible)
  const coreCategories: Category[] = [
    { id: CodexCategory.Characters, name: "Characters", icon: <User className="w-4 h-4" /> },
    { id: CodexCategory.Creatures, name: "Creatures", icon: <User className="w-4 h-4" /> },
    { id: CodexCategory.Regions, name: "Regions", icon: <MapPin className="w-4 h-4" /> },
    { id: CodexCategory.Objects, name: "Objects/Items", icon: <Package className="w-4 h-4" /> },
    { id: CodexCategory.Stories, name: "Lore", icon: <BookOpen className="w-4 h-4" /> },
  ];

  // Magicborn categories (only when mode is ON)
  const magicbornCategories: Category[] = isMagicbornMode
    ? [
        { id: CodexCategory.Spells, name: "Spells", icon: <Sparkles className="w-4 h-4" /> },
        { id: CodexCategory.Runes, name: "Runes", icon: <Gem className="w-4 h-4" /> },
        { id: CodexCategory.Effects, name: "Effects", icon: <Zap className="w-4 h-4" /> },
      ]
    : [];

  const allCategories = [...coreCategories, ...magicbornCategories];

  // Use React Query for all categories (hooks must be called unconditionally)
  // Only fetch when category is expanded
  const charactersQuery = useCodexEntries({
    categoryId: CodexCategory.Characters,
    projectId,
    enabled: expandedCategories.has(CodexCategory.Characters),
  });
  const creaturesQuery = useCodexEntries({
    categoryId: CodexCategory.Creatures,
    projectId,
    enabled: expandedCategories.has(CodexCategory.Creatures),
  });
  const regionsQuery = useCodexEntries({
    categoryId: CodexCategory.Regions,
    projectId,
    enabled: expandedCategories.has(CodexCategory.Regions),
  });
  const objectsQuery = useCodexEntries({
    categoryId: CodexCategory.Objects,
    projectId,
    enabled: expandedCategories.has(CodexCategory.Objects),
  });
  const storiesQuery = useCodexEntries({
    categoryId: CodexCategory.Stories,
    projectId,
    enabled: expandedCategories.has(CodexCategory.Stories),
  });
  const spellsQuery = useCodexEntries({
    categoryId: CodexCategory.Spells,
    projectId,
    enabled: expandedCategories.has(CodexCategory.Spells) && isMagicbornMode,
  });
  const runesQuery = useCodexEntries({
    categoryId: CodexCategory.Runes,
    projectId,
    enabled: expandedCategories.has(CodexCategory.Runes) && isMagicbornMode,
  });
  const effectsQuery = useCodexEntries({
    categoryId: CodexCategory.Effects,
    projectId,
    enabled: expandedCategories.has(CodexCategory.Effects) && isMagicbornMode,
  });

  // Map queries to category IDs
  const categoryQueries: Record<CodexCategory, ReturnType<typeof useCodexEntries>> = {
    [CodexCategory.Characters]: charactersQuery,
    [CodexCategory.Creatures]: creaturesQuery,
    [CodexCategory.Regions]: regionsQuery,
    [CodexCategory.Objects]: objectsQuery,
    [CodexCategory.Stories]: storiesQuery,
    [CodexCategory.Spells]: spellsQuery,
    [CodexCategory.Runes]: runesQuery,
    [CodexCategory.Effects]: effectsQuery,
  };

  const toggleCategory = (categoryId: CodexCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
    onCategorySelect(categoryId);
  };

  const handleContextMenu = (
    e: React.MouseEvent,
    type: "category" | "entry",
    categoryId: CodexCategory,
    entry?: { id: string; name: string }
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, type, categoryId, entry });
  };

  const handleDelete = async (categoryId: CodexCategory, entryId: string) => {
    const collection = CATEGORY_TO_COLLECTION[categoryId];
    if (!collection) return;

    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      await fetch(`/api/payload/${collection}/${entryId}`, {
        method: "DELETE",
      });
      // Invalidate React Query cache to refetch
      invalidateCodexEntries(categoryId, projectId);
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const handleDuplicate = async (categoryId: CodexCategory, entryId: string) => {
    const collection = CATEGORY_TO_COLLECTION[categoryId];
    if (!collection) return;

    try {
      const res = await fetch(`/api/payload/${collection}/${entryId}`);
      const original = await res.json();

      const copy = { ...original };
      delete copy.id;
      delete copy.createdAt;
      delete copy.updatedAt;
      if (copy.name) copy.name = `${copy.name} (Copy)`;
      if (copy.title) copy.title = `${copy.title} (Copy)`;

      await fetch(`/api/payload/${collection}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(copy),
      });

      // Invalidate React Query cache to refetch
      invalidateCodexEntries(categoryId, projectId);
    } catch (error) {
      console.error("Failed to duplicate:", error);
    }
  };

  const handleBulkDelete = async (categoryId: CodexCategory) => {
    const collection = CATEGORY_TO_COLLECTION[categoryId];
    if (!collection) return;

    const entries = getEntries(categoryId);
    if (entries.length === 0) return;

    const categoryName = allCategories.find(c => c.id === categoryId)?.name || categoryId;
    const confirmed = confirm(
      `Are you sure you want to delete all ${entries.length} ${categoryName.toLowerCase()}? This action will be versioned.`
    );

    if (!confirmed) return;

    try {
      // Delete all entries in parallel
      await Promise.all(
        entries.map(entry =>
          fetch(`/api/payload/${collection}/${entry.id}`, {
            method: "DELETE",
          })
        )
      );
      // Invalidate React Query cache to refetch
      invalidateCodexEntries(categoryId, projectId);
    } catch (error) {
      console.error("Failed to delete entries:", error);
      alert("Failed to delete some entries. Please try again.");
    }
  };

  const getContextMenuItems = (): ContextMenuItem[] => {
    if (!contextMenu) return [];

    const { type, categoryId, entry } = contextMenu;
    const categoryName = allCategories.find(c => c.id === categoryId)?.name || categoryId;
    const singularName = categoryName.endsWith("s") ? categoryName.slice(0, -1) : categoryName;

    if (type === "category") {
      const entries = getEntries(categoryId);
      return [
        {
          label: `New ${singularName}`,
          icon: <Plus className="w-4 h-4" />,
          onClick: () => {
            const entryType = CATEGORY_TO_ENTRY_TYPE[categoryId];
            setTriggerNewEntry(entryType || categoryId);
            setContextMenu(null);
          },
        },
        ...(entries.length > 0 ? [
          { label: "", onClick: () => {}, divider: true },
          {
            label: `Delete All ${categoryName} (${entries.length})`,
            icon: <Trash2 className="w-4 h-4" />,
            onClick: () => handleBulkDelete(categoryId),
            danger: true,
          },
        ] : []),
      ];
    }

    // Entry context menu
    return [
      {
        label: "Edit",
        icon: <Edit className="w-4 h-4" />,
        onClick: () => {
          if (entry) {
            setEditEntry({ categoryId, entryId: entry.id });
            setContextMenu(null);
          }
        },
      },
      {
        label: "Duplicate",
        icon: <Copy className="w-4 h-4" />,
        onClick: () => entry && handleDuplicate(categoryId, entry.id),
      },
      { label: "", onClick: () => {}, divider: true },
      {
        label: "Delete",
        icon: <Trash2 className="w-4 h-4" />,
        onClick: () => entry && handleDelete(categoryId, entry.id),
        danger: true,
      },
    ];
  };

  const isExpanded = (categoryId: CodexCategory) => expandedCategories.has(categoryId);
  const isLoading = (categoryId: CodexCategory) => categoryQueries[categoryId]?.isLoading ?? false;
  const getEntries = (categoryId: CodexCategory) => categoryQueries[categoryId]?.data ?? [];

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-56'} border-r border-border bg-shadow flex flex-col h-full transition-all duration-200`}>
      {/* Header */}
      <div className="p-2">
        {!isCollapsed ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <Link href="/" className="flex items-center gap-2 group flex-1 min-w-0">
                <div className="relative w-6 h-6 flex-shrink-0">
                  <Image
                    src="/design/logos/magicborn_logo.png"
                    alt="Magicborn"
                    fill
                    className="object-contain"
                    sizes="24px"
                  />
                </div>
                <span className="font-bold text-sm text-glow group-hover:text-ember-glow transition-colors truncate">
                  Magicborn
                </span>
              </Link>
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1 hover:bg-deep rounded transition-colors flex-shrink-0"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4 text-text-muted" />
              </button>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <FolderOpen className="w-4 h-4 text-text-muted flex-shrink-0" />
              <h2 className="text-sm font-semibold text-glow">Codex</h2>
            </div>
            
            {/* Minimal Search */}
            <div className="relative">
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 grid grid-cols-3 gap-0.5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 h-0.5 bg-ember-glow rounded-sm"
                  />
                ))}
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 text-sm bg-deep border border-border rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-ember-glow transition-colors"
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-1.5 hover:bg-deep rounded transition-colors"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </button>
            <Link href="/" className="p-1.5 hover:bg-deep rounded transition-colors">
              <div className="relative w-6 h-6">
                <Image
                  src="/design/logos/magicborn_logo.png"
                  alt="Magicborn"
                  fill
                  className="object-contain"
                  sizes="24px"
                />
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {allCategories.map((category) => (
          <div key={category.id}>
            <button
              onClick={() => toggleCategory(category.id)}
              onContextMenu={(e) => handleContextMenu(e, "category", category.id)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-2 py-1.5 rounded transition-colors ${
                selectedCategory === category.id
                  ? "bg-ember/20 border border-ember/30 text-ember-glow"
                  : "hover:bg-deep text-text-primary"
              }`}
              title={isCollapsed ? category.name : undefined}
            >
              <div className="flex items-center gap-2">
                {category.icon}
                {!isCollapsed && <span className="font-medium text-sm">{category.name}</span>}
              </div>
              {!isCollapsed && (isExpanded(category.id) ? (
                <ChevronDown className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
              ))}
            </button>
            {!isCollapsed && isExpanded(category.id) && (
              <div className="ml-5 mt-0.5 space-y-0.5 border-l border-border pl-2">
                {isLoading(category.id) ? (
                  <div className="text-xs text-text-muted px-2 py-0.5 animate-pulse">
                    Loading...
                  </div>
                ) : getEntries(category.id).length > 0 ? (
                  getEntries(category.id).map((entry) => (
                    <div
                      key={entry.id}
                      className="group flex items-center justify-between w-full text-xs text-text-secondary hover:text-ember-glow px-2 py-0.5 rounded hover:bg-deep/50"
                      onContextMenu={(e) => handleContextMenu(e, "entry", category.id, entry)}
                    >
                      <span className="truncate flex-1">{entry.name}</span>
                      <EntryActionsMenu
                        entry={entry}
                        categoryId={category.id}
                        onEdit={() => setEditEntry({ categoryId: category.id, entryId: entry.id })}
                        onDuplicate={() => handleDuplicate(category.id, entry.id)}
                        onDelete={() => handleDelete(category.id, entry.id)}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-text-muted px-2 py-0.5 italic">
                    No entries yet
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Links */}
      <div className="p-2 border-t border-border">
        <Link
          href={`/content-editor/${projectId}/settings`}
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} px-2 py-1.5 text-text-secondary hover:text-ember-glow hover:bg-deep rounded transition-colors`}
          title={isCollapsed ? "Settings" : undefined}
        >
          <Settings className="w-4 h-4" />
          {!isCollapsed && <span className="text-sm">Settings</span>}
        </Link>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={getContextMenuItems()}
        />
      )}

      {/* New Entry Menu */}
      <NewEntryMenu
        projectId={projectId}
        isMagicbornMode={isMagicbornMode}
        onEntryCreated={(category) => {
          const categoryId = category.toLowerCase() as CodexCategory;
          refreshCategory(categoryId);
        }}
        triggerType={triggerNewEntry}
        onTriggerHandled={() => setTriggerNewEntry(null)}
        editEntry={editEntry ? {
          categoryId: editEntry.categoryId,
          entryId: editEntry.entryId,
        } : null}
        onEditClosed={() => {
          setEditEntry(null);
          if (editEntry) {
            refreshCategory(editEntry.categoryId);
          }
        }}
      />
    </aside>
  );
}
