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
  Home,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { NewEntryMenu } from "./NewEntryMenu";

interface Category {
  id: string;
  name: string;
  icon: ReactNode;
  entries?: { id: string; name: string }[];
}

interface CodexSidebarProps {
  projectId: string;
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

export function CodexSidebar({ projectId, selectedCategory, onCategorySelect }: CodexSidebarProps) {
  const { isMagicbornMode, loading: modeLoading } = useMagicbornMode(projectId);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [categoryEntries, setCategoryEntries] = useState<Record<string, { id: string; name: string }[]>>({});
  const [loadingCategories, setLoadingCategories] = useState<Set<string>>(new Set());
  const refreshCategory = (categoryId: string) => {
    // Clear cached entries to force refetch
    setCategoryEntries(prev => {
      const next = { ...prev };
      delete next[categoryId];
      return next;
    });
    fetchCategoryEntries(categoryId);
  };

  // Core categories (always visible)
  const coreCategories: Category[] = [
    { id: "characters", name: "Characters", icon: <User className="w-4 h-4" /> },
    { id: "regions", name: "Regions", icon: <MapPin className="w-4 h-4" /> },
    { id: "objects", name: "Objects/Items", icon: <Package className="w-4 h-4" /> },
    { id: "stories", name: "Books & Stories", icon: <BookOpen className="w-4 h-4" /> },
  ];

  // Magicborn categories (only when mode is ON)
  const magicbornCategories: Category[] = isMagicbornMode
    ? [
        { id: "spells", name: "Spells", icon: <Sparkles className="w-4 h-4" /> },
        { id: "runes", name: "Runes", icon: <Gem className="w-4 h-4" /> },
        { id: "effects", name: "Effects", icon: <Zap className="w-4 h-4" /> },
      ]
    : [];

  const allCategories = [...coreCategories, ...magicbornCategories];

  // Fetch entries when a category is expanded
  const fetchCategoryEntries = async (categoryId: string) => {
    if (categoryEntries[categoryId] || loadingCategories.has(categoryId)) {
      return;
    }

    setLoadingCategories(prev => new Set(prev).add(categoryId));

    try {
      // Map category to Payload collection
      const collectionMap: Record<string, string> = {
        characters: "characters",
        // Add more mappings as collections are created
      };

      const collection = collectionMap[categoryId];
      
      if (collection) {
        const response = await fetch(`/api/payload/${collection}?where[project][equals]=${projectId}&limit=50`);
        
        if (response.ok) {
          const result = await response.json();
          const entries = result.docs?.map((doc: any) => ({
            id: doc.id,
            name: doc.name || doc.title || `Entry ${doc.id}`,
          })) || [];
          
          setCategoryEntries(prev => ({
            ...prev,
            [categoryId]: entries,
          }));
        } else {
          // No entries or collection doesn't exist yet
          setCategoryEntries(prev => ({
            ...prev,
            [categoryId]: [],
          }));
        }
      } else {
        // Collection not implemented yet
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

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
      // Fetch entries when expanding
      fetchCategoryEntries(categoryId);
    }
    setExpandedCategories(newExpanded);
    onCategorySelect(categoryId);
  };

  const isExpanded = (categoryId: string) => expandedCategories.has(categoryId);
  const isLoading = (categoryId: string) => loadingCategories.has(categoryId);
  const getEntries = (categoryId: string) => categoryEntries[categoryId] || [];

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

        {/* Filter - future: tags will be dynamic based on project */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button className="px-3 py-1 text-sm bg-ember/20 border border-ember/30 rounded text-ember-glow">
            All
          </button>
        </div>

        {/* New Entry Menu */}
        <NewEntryMenu
          projectId={projectId}
          isMagicbornMode={isMagicbornMode}
          onEntryCreated={(category) => refreshCategory(category)}
        />
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {allCategories.map((category) => (
          <div key={category.id}>
            <button
              onClick={() => toggleCategory(category.id)}
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
                    <button
                      key={entry.id}
                      className="w-full text-left text-sm text-text-secondary hover:text-ember-glow px-3 py-1 rounded hover:bg-deep/50 truncate"
                    >
                      {entry.name}
                    </button>
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
        <button className="w-full flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-ember-glow hover:bg-deep rounded-lg transition-colors">
          <FileText className="w-4 h-4" />
          Prompts
        </button>
        <button className="w-full flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-ember-glow hover:bg-deep rounded-lg transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
        <button className="w-full flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-ember-glow hover:bg-deep rounded-lg transition-colors">
          <Save className="w-4 h-4" />
          Saved
        </button>
      </div>
    </aside>
  );
}

