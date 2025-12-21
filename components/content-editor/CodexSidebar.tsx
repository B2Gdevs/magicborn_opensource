// components/content-editor/CodexSidebar.tsx
// Left sidebar with search, filters, and categories (Codex)

"use client";

import { useState, useEffect, ReactNode } from "react";
import { useMagicbornMode } from "@lib/payload/hooks/useMagicbornMode";
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
  ChevronDown,
  FolderOpen,
  ArrowLeft,
  Edit,
  Trash2,
  Copy,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { NewEntryMenu } from "./NewEntryMenu";
import { ContextMenu, ContextMenuItem } from "./ContextMenu";
import { EntryActionsMenu } from "./EntryActionsMenu";

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
  const [categoryEntries, setCategoryEntries] = useState<Record<CodexCategory, { id: string; name: string }[]>>({} as Record<CodexCategory, { id: string; name: string }[]>);
  const [loadingCategories, setLoadingCategories] = useState<Set<CodexCategory>>(new Set());
  
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
    // Clear cache and loading state to force fresh fetch
    setCategoryEntries(prev => {
      const next = { ...prev };
      delete next[categoryId];
      return next;
    });
    setLoadingCategories(prev => {
      const next = new Set(prev);
      next.delete(categoryId);
      return next;
    });
    // Expand category if not already expanded so entries are visible
    if (!expandedCategories.has(categoryId)) {
      setExpandedCategories(prev => new Set(prev).add(categoryId));
    }
    // Force fetch even if category isn't expanded
    fetchCategoryEntries(categoryId, true);
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

  // Fetch entries when a category is expanded
  const fetchCategoryEntries = async (categoryId: CodexCategory, force = false) => {
    // Skip if already loaded and not forcing, or if already loading and not forcing
    if (!force && (categoryEntries[categoryId] || loadingCategories.has(categoryId))) {
      return;
    }

    setLoadingCategories(prev => new Set(prev).add(categoryId));

    try {
      const collection = CATEGORY_TO_COLLECTION[categoryId];
      
      if (collection) {
        const response = await fetch(`/api/payload/${collection}?where[project][equals]=${projectId}&limit=50`);
        
        if (response.ok) {
          const result = await response.json();
          const entries = result.docs?.map((doc: any) => {
            // Handle different name fields for different collections
            let displayName: string;
            if (categoryId === CodexCategory.Runes) {
              displayName = doc.concept || doc.name || `Rune ${doc.code || doc.id}`;
            } else if (categoryId === CodexCategory.Effects) {
              displayName = doc.name || doc.effectType || `Effect ${doc.id}`;
            } else {
              displayName = doc.name || doc.title || `Entry ${doc.id}`;
            }
            return {
              id: String(doc.id), // Payload numeric ID as string
              name: displayName,
            };
          }) || [];
          
          setCategoryEntries(prev => ({
            ...prev,
            [categoryId]: entries,
          }));
        } else {
          setCategoryEntries(prev => ({
            ...prev,
            [categoryId]: [],
          }));
        }
      } else {
        setCategoryEntries(prev => ({
          ...prev,
          [categoryId]: [],
        }));
      }
    } catch (error) {
      console.error(`Failed to fetch entries for ${categoryId}:`, error);
      setCategoryEntries(prev => ({
        ...prev,
        [categoryId]: [],
      }));
    } finally {
      setLoadingCategories(prev => {
        const next = new Set(prev);
        next.delete(categoryId);
        return next;
      });
    }
  };

  const toggleCategory = (categoryId: CodexCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
      fetchCategoryEntries(categoryId);
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
      refreshCategory(categoryId);
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

      refreshCategory(categoryId);
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
      refreshCategory(categoryId);
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
          onClick: () => setTriggerNewEntry(CATEGORY_TO_ENTRY_TYPE[categoryId] || categoryId),
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
  const isLoading = (categoryId: CodexCategory) => loadingCategories.has(categoryId);
  const getEntries = (categoryId: CodexCategory) => categoryEntries[categoryId] || [];

  return (
    <aside className="w-72 border-r border-border bg-shadow flex flex-col h-full">
      {/* Logo and Back to App */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8">
              <Image
                src="/design/logos/magicborn_logo.png"
                alt="Magicborn"
                fill
                className="object-contain"
                sizes="32px"
              />
            </div>
            <span className="font-bold text-glow group-hover:text-ember-glow transition-colors">
              Magicborn
            </span>
          </Link>
          <Link 
            href="/" 
            className="flex items-center gap-1 text-xs text-text-muted hover:text-ember-glow transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to App
          </Link>
        </div>
        
        <h2 className="text-lg font-bold text-glow mb-4 flex items-center gap-2">
          <FolderOpen className="w-5 h-5" />
          Codex
        </h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search all entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-deep border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-ember-glow"
          />
        </div>

        {/* New Entry Menu */}
        <NewEntryMenu
          projectId={projectId}
          isMagicbornMode={isMagicbornMode}
          onEntryCreated={(category) => {
            refreshCategory(category as CodexCategory);
            setEditEntry(null);
          }}
          triggerType={triggerNewEntry}
          onTriggerHandled={() => setTriggerNewEntry(null)}
          editEntry={editEntry}
          onEditClosed={() => setEditEntry(null)}
        />
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {allCategories.map((category) => (
          <div key={category.id}>
            <button
              onClick={() => toggleCategory(category.id)}
              onContextMenu={(e) => handleContextMenu(e, "category", category.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? "bg-ember/20 border border-ember/30 text-ember-glow"
                  : "hover:bg-deep text-text-primary"
              }`}
            >
              <div className="flex items-center gap-2">
                {category.icon}
                <span className="font-medium">{category.name}</span>
              </div>
              {isExpanded(category.id) ? (
                <ChevronDown className="w-4 h-4 text-text-muted" />
              ) : (
                <ChevronRight className="w-4 h-4 text-text-muted" />
              )}
            </button>
            {isExpanded(category.id) && (
              <div className="ml-6 mt-1 space-y-1 border-l border-border pl-2">
                {isLoading(category.id) ? (
                  <div className="text-sm text-text-muted px-3 py-1 animate-pulse">
                    Loading...
                  </div>
                ) : getEntries(category.id).length > 0 ? (
                  getEntries(category.id).map((entry) => (
                    <div
                      key={entry.id}
                      className="group flex items-center justify-between w-full text-sm text-text-secondary hover:text-ember-glow px-3 py-1 rounded hover:bg-deep/50"
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
                  <div className="text-sm text-text-muted px-3 py-1 italic">
                    No entries yet
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Links */}
      <div className="p-4 border-t border-border space-y-1">
        <Link
          href={`/content-editor/${projectId}/settings`}
          className="flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-ember-glow hover:bg-deep rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
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
    </aside>
  );
}
