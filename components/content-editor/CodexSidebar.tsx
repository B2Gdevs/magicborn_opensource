// components/content-editor/CodexSidebar.tsx
// Left sidebar with search, filters, and categories (Codex)

"use client";

import { useState, useEffect, useMemo, useRef, useCallback, type ReactNode } from "react";
import { useMagicbornMode } from "@lib/payload/hooks/useMagicbornMode";
import { useCodexEntries, useInvalidateCodexEntries } from "@lib/hooks/useCodexEntries";
import { 
  Search, 
  Plus, 
  Settings, 
  FileText, 
  Download, 
  Save,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  ArrowLeft,
  Edit,
  Trash2,
  Copy,
  X,
  FolderClosed,
} from "lucide-react";
import Link from "next/link";
import { ContextMenu, ContextMenuItem } from "./ContextMenu";
import { EntryActionsMenu } from "./EntryActionsMenu";
import { NewEntryMenu } from "./NewEntryMenu";
import { Skeleton } from "@/components/ui/Skeleton";

import { CodexCategory, EntryType, CATEGORY_TO_ENTRY_TYPE, CATEGORY_TO_COLLECTION } from "@lib/content-editor/constants";
import { getAllEntryTypes, getDisplayName, useProjectConfigs } from "@lib/content-editor/entry-config";
import { toast } from "@/lib/hooks/useToast";

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
  const projectConfigs = useProjectConfigs(projectId);
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

  // Multi-select state
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<{
    categoryId: CodexCategory;
    index: number;
  } | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  const refreshCategory = (categoryId: CodexCategory) => {
    // Invalidate React Query cache to force refetch
    invalidateCodexEntries(categoryId, projectId);
    // Expand category if not already expanded so entries are visible
    if (!expandedCategories.has(categoryId)) {
      setExpandedCategories(prev => new Set(prev).add(categoryId));
    }
  };

  // Get all categories from entry-config (single source of truth) with project overrides
  const allCategories: Category[] = useMemo(() => {
    return getAllEntryTypes(isMagicbornMode).map((config) => ({
      id: config.category,
      name: getDisplayName(config.id, projectConfigs),
      icon: config.icon,
    }));
  }, [isMagicbornMode, projectConfigs]);

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
      toast.error("Failed to delete some entries. Please try again.");
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

  // Handle entry click for selection
  const handleEntryClick = (
    e: React.MouseEvent,
    categoryId: CodexCategory,
    entryId: string,
    index: number
  ) => {
    // Don't interfere with context menu or action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    const isMetaKey = e.metaKey || e.ctrlKey;
    const isShiftKey = e.shiftKey;

    if (isMetaKey) {
      // Cmd/Ctrl + click: toggle selection
      setSelectedEntries(prev => {
        const next = new Set(prev);
        if (next.has(entryId)) {
          next.delete(entryId);
        } else {
          next.add(entryId);
        }
        return next;
      });
      setLastSelectedIndex({ categoryId, index });
    } else if (isShiftKey && lastSelectedIndex && lastSelectedIndex.categoryId === categoryId) {
      // Shift + click: range selection
      const entries = getEntries(categoryId);
      const start = Math.min(lastSelectedIndex.index, index);
      const end = Math.max(lastSelectedIndex.index, index);
      const rangeIds = entries.slice(start, end + 1).map(e => e.id);
      
      setSelectedEntries(prev => {
        const next = new Set(prev);
        rangeIds.forEach(id => next.add(id));
        return next;
      });
    } else {
      // Regular click: single selection
      setSelectedEntries(new Set([entryId]));
      setLastSelectedIndex({ categoryId, index });
    }
  };

  // Handle double-click to edit
  const handleEntryDoubleClick = (
    e: React.MouseEvent,
    categoryId: CodexCategory,
    entryId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setEditEntry({ categoryId, entryId });
    setSelectedEntries(new Set()); // Clear selection when editing
  };

  // Handle bulk delete
  const handleBulkDeleteSelected = useCallback(async () => {
    if (selectedEntries.size === 0) return;

    // Group selected entries by category
    const entriesByCategory = new Map<CodexCategory, string[]>();
    
    allCategories.forEach(category => {
      const entries = getEntries(category.id);
      const selected = entries.filter(e => selectedEntries.has(e.id));
      if (selected.length > 0) {
        entriesByCategory.set(category.id, selected.map(e => e.id));
      }
    });

    const totalCount = selectedEntries.size;
    if (!confirm(`Are you sure you want to delete ${totalCount} selected ${totalCount === 1 ? 'entry' : 'entries'}?`)) {
      return;
    }

    try {
      // Delete all selected entries in parallel
      const deletePromises: Promise<void>[] = [];
      entriesByCategory.forEach((entryIds, categoryId) => {
        const collection = CATEGORY_TO_COLLECTION[categoryId];
        if (!collection) return;
        
        entryIds.forEach(entryId => {
          deletePromises.push(
            fetch(`/api/payload/${collection}/${entryId}`, { method: "DELETE" })
              .then(() => {})
              .catch(err => console.error(`Failed to delete ${entryId}:`, err))
          );
        });
      });

      await Promise.all(deletePromises);
      
      // Invalidate all affected categories
      entriesByCategory.forEach((_, categoryId) => {
        invalidateCodexEntries(categoryId, projectId);
      });
      
      setSelectedEntries(new Set());
      setLastSelectedIndex(null);
    } catch (error) {
      console.error("Failed to delete entries:", error);
      toast.error("Failed to delete some entries. Please try again.");
    }
  }, [selectedEntries, allCategories, categoryQueries, invalidateCodexEntries, projectId]);

  // Handle bulk duplicate
  const handleBulkDuplicateSelected = useCallback(async () => {
    if (selectedEntries.size === 0) return;

    // Group selected entries by category
    const entriesByCategory = new Map<CodexCategory, string[]>();
    
    allCategories.forEach(category => {
      const entries = getEntries(category.id);
      const selected = entries.filter(e => selectedEntries.has(e.id));
      if (selected.length > 0) {
        entriesByCategory.set(category.id, selected.map(e => e.id));
      }
    });

    try {
      // Duplicate all selected entries
      const duplicatePromises: Promise<void>[] = [];
      entriesByCategory.forEach((entryIds, categoryId) => {
        const collection = CATEGORY_TO_COLLECTION[categoryId];
        if (!collection) return;
        
        entryIds.forEach(entryId => {
          duplicatePromises.push(
            fetch(`/api/payload/${collection}/${entryId}`)
              .then(res => res.json())
              .then(original => {
                const copy = { ...original };
                delete copy.id;
                delete copy.createdAt;
                delete copy.updatedAt;
                if (copy.name) copy.name = `${copy.name} (Copy)`;
                if (copy.title) copy.title = `${copy.title} (Copy)`;
                
                return fetch(`/api/payload/${collection}`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(copy),
                });
              })
              .then(() => {})
              .catch(err => console.error(`Failed to duplicate ${entryId}:`, err))
          );
        });
      });

      await Promise.all(duplicatePromises);
      
      // Invalidate all affected categories
      entriesByCategory.forEach((_, categoryId) => {
        invalidateCodexEntries(categoryId, projectId);
      });
      
      setSelectedEntries(new Set());
      setLastSelectedIndex(null);
    } catch (error) {
      console.error("Failed to duplicate entries:", error);
      toast.error("Failed to duplicate some entries. Please try again.");
    }
  }, [selectedEntries, allCategories, categoryQueries, invalidateCodexEntries, projectId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when sidebar is focused or when no input is focused
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }

      // Escape: clear selection
      if (e.key === 'Escape') {
        setSelectedEntries(new Set());
        setLastSelectedIndex(null);
        return;
      }

      // Cmd/Ctrl+A: select all in expanded categories
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        const allEntryIds = new Set<string>();
        expandedCategories.forEach(categoryId => {
          getEntries(categoryId).forEach(entry => {
            allEntryIds.add(entry.id);
          });
        });
        setSelectedEntries(allEntryIds);
        return;
      }

      // Delete/Backspace: delete selected entries
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedEntries.size > 0) {
        e.preventDefault();
        handleBulkDeleteSelected();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEntries, expandedCategories, categoryQueries, handleBulkDeleteSelected]);

  // Click outside to deselect
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        // Only deselect if clicking outside the sidebar
        // Don't deselect if clicking on modals or dropdowns
        const target = e.target as HTMLElement;
        if (!target.closest('[role="dialog"]') && !target.closest('.absolute')) {
          setSelectedEntries(new Set());
          setLastSelectedIndex(null);
        }
      }
    };

    if (selectedEntries.size > 0) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [selectedEntries]);

  const selectedCount = selectedEntries.size;

  return (
    <aside 
      ref={sidebarRef}
      className={`${isCollapsed ? 'w-16' : 'w-56'} flex flex-col transition-all duration-200`}
    >
      {/* Header */}
      <div className="p-2">
        {!isCollapsed ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FolderOpen className="w-4 h-4 text-text-muted flex-shrink-0 cursor-pointer" 
                onClick={
                  () => {
                      setIsCollapsed(true);
                    }
                  }
                />
                <h2 className="text-sm font-semibold text-glow">Codex</h2>
              </div>
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

            <div className="p-1.5">
              <FolderClosed className="w-6 h-6 text-text-muted cursor-pointer" 
              onClick={
                () => {
                  setIsCollapsed(false);
                }
              }
              />
            </div>
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
                  <div className="space-y-0.5 px-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} variant="text" className="w-full h-4" />
                    ))}
                  </div>
                ) : getEntries(category.id).length > 0 ? (
                  getEntries(category.id).map((entry, index) => {
                    const isSelected = selectedEntries.has(entry.id);
                    return (
                      <div
                        key={entry.id}
                        className={`group flex items-center justify-between w-full text-xs px-2 py-0.5 rounded cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-ember/20 border border-ember/30 text-ember-glow"
                            : "text-text-secondary hover:text-ember-glow hover:bg-deep/50"
                        }`}
                        onClick={(e) => handleEntryClick(e, category.id, entry.id, index)}
                        onDoubleClick={(e) => handleEntryDoubleClick(e, category.id, entry.id)}
                        onContextMenu={(e) => handleContextMenu(e, "entry", category.id, entry)}
                      >
                        <span className="truncate flex-1">{entry.name}</span>
                        <EntryActionsMenu
                          entry={entry}
                          categoryId={category.id}
                          onEdit={() => {
                            setEditEntry({ categoryId: category.id, entryId: entry.id });
                            setSelectedEntries(new Set());
                          }}
                          onDuplicate={() => handleDuplicate(category.id, entry.id)}
                          onDelete={() => handleDelete(category.id, entry.id)}
                        />
                      </div>
                    );
                  })
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

      {/* Bulk Actions Toolbar */}
      {!isCollapsed && selectedCount > 0 && (
        <div className="p-2 border-t border-border bg-deep/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-secondary">
              {selectedCount} {selectedCount === 1 ? 'entry' : 'entries'} selected
            </span>
            <button
              onClick={() => {
                setSelectedEntries(new Set());
                setLastSelectedIndex(null);
              }}
              className="p-1 hover:bg-deep rounded transition-colors"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5 text-text-muted" />
            </button>
          </div>
          <div className="flex gap-1">
            <button
              onClick={handleBulkDuplicateSelected}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs text-text-primary hover:bg-deep rounded transition-colors"
              title="Duplicate selected"
            >
              <Copy className="w-3.5 h-3.5" />
              Duplicate
            </button>
            <button
              onClick={handleBulkDeleteSelected}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded transition-colors"
              title="Delete selected"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Footer Links */}
      <div className="p-2">
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
