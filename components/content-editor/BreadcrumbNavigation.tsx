// components/content-editor/BreadcrumbNavigation.tsx
// Breadcrumb navigation with dropdowns for Acts, Chapters, and Pages

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronRight, Plus, ChevronDown, Loader2, BookOpen, FileText, File, Search, Edit2, Eye, Copy, Trash2, MoreVertical, X } from "lucide-react";
import { DetailToolbar, DetailTab } from "./DetailToolbar";
import { ContextMenu, ContextMenuItem } from "./ContextMenu";
import { toTitleCase } from "@lib/utils/titleCase";

interface Act {
  id: string;
  title: string;
  order: number;
}

interface Chapter {
  id: string;
  title: string;
  type: "chapter" | "prologue" | "epilogue";
  act?: string;
  order: number;
}

interface Page {
  id: string;
  title: string;
  chapter: string;
  order: number;
}

interface BreadcrumbNavigationProps {
  projectId: string;
  selectedAct?: string | null;
  selectedChapter?: string | null;
  selectedPage?: string | null;
  onActSelect: (actId: string | null) => void;
  onChapterSelect: (chapterId: string | null) => void;
  onPageSelect: (pageId: string | null) => void;
  onCreateAct?: () => void;
  onCreateChapter?: (actId?: string) => void;
  onCreatePage?: (chapterId: string) => void;
  activeTab?: DetailTab;
  onTabChange?: (tab: DetailTab) => void;
  showButtons?: boolean;
  currentPageTitle?: string | null;
}

export function BreadcrumbNavigation({
  projectId,
  selectedAct,
  selectedChapter,
  selectedPage,
  onActSelect,
  onChapterSelect,
  onPageSelect,
  onCreateAct,
  onCreateChapter,
  onCreatePage,
  activeTab,
  onTabChange,
  showButtons = true,
  currentPageTitle,
}: BreadcrumbNavigationProps) {
  const [acts, setActs] = useState<Act[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<"act" | "chapter" | "page" | null>(null);
  const [searchQuery, setSearchQuery] = useState<{ act: string; chapter: string; page: string }>({ act: "", chapter: "", page: "" });
  const [editingItem, setEditingItem] = useState<{ type: "act" | "chapter" | "page"; id: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: "act" | "chapter" | "page"; id: string } | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch acts
      const actsRes = await fetch(
        `/api/payload/acts?where[project][equals]=${projectId}&sort=order`
      );
      const actsData = await actsRes.json();
      setActs(actsData.docs || []);

      // Fetch chapters
      const chaptersRes = await fetch(
        `/api/payload/chapters?where[project][equals]=${projectId}&sort=order`
      );
      const chaptersData = await chaptersRes.json();
      const allChapters = chaptersData.docs || [];
      
      // Filter chapters based on selected act
      if (selectedAct) {
        setChapters(
          allChapters.filter(
            (ch: any) =>
              (ch.act === selectedAct || ch.act?.id === selectedAct) &&
              ch.type === "chapter"
          )
        );
      } else {
        // Show prologue/epilogue if no act selected
        const prologueEpilogue = allChapters.filter(
          (ch: any) => ch.type === "prologue" || ch.type === "epilogue"
        );
        setChapters(prologueEpilogue);
      }

      // Fetch pages if chapter is selected
      if (selectedChapter) {
        const pagesRes = await fetch(
          `/api/payload/pages?where[project][equals]=${projectId}&where[chapter][equals]=${selectedChapter}&sort=order`
        );
        const pagesData = await pagesRes.json();
        const pagesList = (pagesData.docs || []).map((p: any) => ({
          ...p,
          id: p.id?.toString() || p.id,
        }));
        setPages(pagesList);
      } else {
        setPages([]);
      }
    } catch (error) {
      console.error("Failed to fetch breadcrumb data:", error);
    } finally {
      setLoading(false);
    }
  }, [projectId, selectedAct, selectedChapter]);

  // Fetch all data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh pages when selectedPage changes (new page created)
  useEffect(() => {
    if (selectedChapter && selectedPage) {
      // Only refresh pages, not all data
      const refreshPages = async () => {
        try {
          const pagesRes = await fetch(
            `/api/payload/pages?where[project][equals]=${projectId}&where[chapter][equals]=${selectedChapter}&sort=order`
          );
          const pagesData = await pagesRes.json();
          const pagesList = (pagesData.docs || []).map((p: any) => ({
            ...p,
            id: p.id?.toString() || p.id,
          }));
          setPages(pagesList);
        } catch (error) {
          console.error("Failed to refresh pages:", error);
        }
      };
      refreshPages();
    }
  }, [projectId, selectedChapter, selectedPage]);

  const selectedActTitle = toTitleCase(acts.find((a) => a.id === selectedAct)?.title || "");
  const selectedChapterTitle = toTitleCase(chapters.find((c) => c.id === selectedChapter)?.title || "");
  const selectedPageTitle = toTitleCase(currentPageTitle || pages.find((p) => p.id === selectedPage)?.title || "");

  const handleActSelect = (actId: string | null) => {
    onActSelect(actId);
    onChapterSelect(null);
    onPageSelect(null);
    setOpenDropdown(null);
  };

  const handleChapterSelect = (chapterId: string | null) => {
    onChapterSelect(chapterId);
    onPageSelect(null);
    setOpenDropdown(null);
  };

  const handlePageSelect = (pageId: string | null) => {
    onPageSelect(pageId);
    setOpenDropdown(null);
  };

  const handleRename = async (type: "act" | "chapter" | "page", id: string, newTitle: string) => {
    try {
      const collection = type === "act" ? "acts" : type === "chapter" ? "chapters" : "pages";
      const titleCased = toTitleCase(newTitle);
      await fetch(`/api/payload/${collection}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titleCased }),
      });
      fetchData();
      setEditingItem(null);
    } catch (error) {
      console.error("Failed to rename:", error);
    }
  };

  const handleDelete = async (type: "act" | "chapter" | "page", id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      const collection = type === "act" ? "acts" : type === "chapter" ? "chapters" : "pages";
      await fetch(`/api/payload/${collection}/${id}`, {
        method: "DELETE",
      });
      fetchData();
      if (type === "act") onActSelect(null);
      if (type === "chapter") onChapterSelect(null);
      if (type === "page") onPageSelect(null);
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const handleDuplicate = async (type: "act" | "chapter" | "page", id: string) => {
    try {
      const collection = type === "act" ? "acts" : type === "chapter" ? "chapters" : "pages";
      const res = await fetch(`/api/payload/${collection}/${id}`);
      const original = await res.json();
      const copy = { ...(original.doc || original) };
      delete copy.id;
      delete copy.createdAt;
      delete copy.updatedAt;
      if (copy.title) copy.title = `${copy.title} (Copy)`;
      
      await fetch(`/api/payload/${collection}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(copy),
      });
      fetchData();
    } catch (error) {
      console.error("Failed to duplicate:", error);
    }
  };

  const filteredActs = acts.filter(a => 
    a.title.toLowerCase().includes(searchQuery.act.toLowerCase())
  );
  const filteredChapters = chapters.filter(c => 
    c.title.toLowerCase().includes(searchQuery.chapter.toLowerCase())
  );
  const filteredPages = pages.filter(p => 
    p.title.toLowerCase().includes(searchQuery.page.toLowerCase())
  );

  useEffect(() => {
    if (editingItem && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingItem]);

  return (
    <div className={`flex items-center ${showButtons ? 'justify-between' : 'justify-start'} gap-2 ${showButtons ? 'px-4 py-1.5 bg-shadow border-b border-border' : 'w-full'}`}>
      <div className={`flex items-center gap-1.5 ${showButtons ? 'flex-1' : ''}`}>
      {/* Act Dropdown */}
      <div className="relative">
        <button
          onClick={() => setOpenDropdown(openDropdown === "act" ? null : "act")}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-deep/50 transition-colors text-xs"
        >
          <BookOpen className="w-3 h-3 text-text-muted flex-shrink-0" />
          <span className={`${selectedAct ? "text-text-primary" : "text-text-muted"} hidden sm:inline`}>
            {selectedActTitle || "Act"}
          </span>
          <ChevronDown className="w-3 h-3 text-text-muted flex-shrink-0 hidden sm:block" />
        </button>
        {openDropdown === "act" && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => {
                setOpenDropdown(null);
                setSearchQuery(prev => ({ ...prev, act: "" }));
              }}
            />
            <div className="absolute top-full left-0 mt-1 w-72 bg-void border border-border rounded-lg shadow-xl z-20 max-h-80 overflow-hidden flex flex-col">
              {/* Search */}
              <div className="p-2 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search acts..."
                    value={searchQuery.act}
                    onChange={(e) => setSearchQuery(prev => ({ ...prev, act: e.target.value }))}
                    className="w-full pl-7 pr-2 py-1.5 text-xs bg-deep border border-border rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-ember-glow"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              
              {/* List */}
              <div className="overflow-y-auto flex-1">
                {loading ? (
                  <div className="flex items-center justify-center gap-2 px-3 py-4 text-text-muted">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs">Loading...</span>
                  </div>
                ) : filteredActs.length === 0 ? (
                  <div className="px-3 py-4 text-center text-xs text-text-muted">
                    {searchQuery.act ? "No acts found" : "No acts"}
                  </div>
                ) : (
                  <div className="p-1">
                    {filteredActs
                      .sort((a, b) => a.title.localeCompare(b.title))
                      .map((act) => (
                        <div
                          key={act.id}
                          className={`group relative flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                            selectedAct === act.id
                              ? "bg-ember/10 text-ember-glow"
                              : "hover:bg-deep/50 text-text-primary"
                          }`}
                        >
                          {editingItem?.type === "act" && editingItem.id === act.id ? (
                            <input
                              ref={editInputRef}
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => {
                                if (editValue.trim()) {
                                  handleRename("act", act.id, editValue.trim());
                                } else {
                                  setEditingItem(null);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  if (editValue.trim()) {
                                    handleRename("act", act.id, editValue.trim());
                                  }
                                } else if (e.key === "Escape") {
                                  setEditingItem(null);
                                }
                              }}
                              className="flex-1 px-2 py-0.5 bg-deep border border-ember-glow rounded text-text-primary text-xs focus:outline-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <>
                              <button
                                onClick={() => handleActSelect(act.id)}
                                className="flex-1 text-left truncate"
                              >
                                {toTitleCase(act.title)}
                              </button>
                              <button
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setContextMenu({ x: e.clientX, y: e.clientY, type: "act", id: act.id });
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-deep rounded transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setContextMenu({ x: e.clientX, y: e.clientY, type: "act", id: act.id });
                                }}
                              >
                                <MoreVertical className="w-3 h-3 text-text-muted" />
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
              
              {/* Create Button */}
              {onCreateAct && (
                <div className="p-2 border-t border-border">
                  <button
                    onClick={() => {
                      onCreateAct();
                      setOpenDropdown(null);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs text-ember-glow hover:bg-ember/10 rounded transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Act
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Chapter Dropdown - show if act is selected or prologue/epilogue exists */}
      {(selectedAct || chapters.length > 0) && (
        <>
          <ChevronRight className="w-3 h-3 text-text-muted flex-shrink-0 hidden sm:block" />
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === "chapter" ? null : "chapter")}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-deep/50 transition-colors text-xs"
            >
              <FileText className="w-3 h-3 text-text-muted flex-shrink-0" />
              <span className={`${selectedChapter ? "text-text-primary" : "text-text-muted"} hidden sm:inline`}>
                {selectedChapterTitle || "Chapter"}
              </span>
              <ChevronDown className="w-3 h-3 text-text-muted flex-shrink-0 hidden sm:block" />
            </button>
            {openDropdown === "chapter" && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => {
                    setOpenDropdown(null);
                    setSearchQuery(prev => ({ ...prev, chapter: "" }));
                  }}
                />
                <div className="absolute top-full left-0 mt-1 w-72 bg-void border border-border rounded-lg shadow-xl z-20 max-h-80 overflow-hidden flex flex-col">
                  <div className="p-2 border-b border-border">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                      <input
                        type="text"
                        placeholder="Search chapters..."
                        value={searchQuery.chapter}
                        onChange={(e) => setSearchQuery(prev => ({ ...prev, chapter: e.target.value }))}
                        className="w-full pl-7 pr-2 py-1.5 text-xs bg-deep border border-border rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-ember-glow"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2 px-3 py-4 text-text-muted">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs">Loading...</span>
                      </div>
                    ) : filteredChapters.length === 0 ? (
                      <div className="px-3 py-4 text-center text-xs text-text-muted">
                        {searchQuery.chapter ? "No chapters found" : "No chapters"}
                      </div>
                    ) : (
                      <div className="p-1">
                        {filteredChapters
                          .sort((a, b) => a.title.localeCompare(b.title))
                          .map((chapter) => (
                            <div
                              key={chapter.id}
                              className={`group relative flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                                selectedChapter === chapter.id
                                  ? "bg-ember/10 text-ember-glow"
                                  : "hover:bg-deep/50 text-text-primary"
                              }`}
                            >
                              {editingItem?.type === "chapter" && editingItem.id === chapter.id ? (
                                <input
                                  ref={editInputRef}
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() => {
                                    if (editValue.trim()) {
                                      handleRename("chapter", chapter.id, editValue.trim());
                                    } else {
                                      setEditingItem(null);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      if (editValue.trim()) {
                                        handleRename("chapter", chapter.id, editValue.trim());
                                      }
                                    } else if (e.key === "Escape") {
                                      setEditingItem(null);
                                    }
                                  }}
                                  className="flex-1 px-2 py-0.5 bg-deep border border-ember-glow rounded text-text-primary text-xs focus:outline-none"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleChapterSelect(chapter.id)}
                                    className="flex-1 text-left truncate"
                                  >
                                    {toTitleCase(chapter.title)}
                                  </button>
                                  <button
                                    onContextMenu={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setContextMenu({ x: e.clientX, y: e.clientY, type: "chapter", id: chapter.id });
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-deep rounded transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setContextMenu({ x: e.clientX, y: e.clientY, type: "chapter", id: chapter.id });
                                    }}
                                  >
                                    <MoreVertical className="w-3 h-3 text-text-muted" />
                                  </button>
                                </>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  {onCreateChapter && (
                    <div className="p-2 border-t border-border">
                      <button
                        onClick={() => {
                          onCreateChapter(selectedAct || undefined);
                          setOpenDropdown(null);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs text-ember-glow hover:bg-ember/10 rounded transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        New Chapter
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Page Dropdown - only show if chapter is selected */}
      {selectedChapter && (
        <>
          <ChevronRight className="w-3 h-3 text-text-muted flex-shrink-0 hidden sm:block" />
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === "page" ? null : "page")}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-deep/50 transition-colors text-xs"
            >
              <File className="w-3 h-3 text-text-muted flex-shrink-0" />
              <span className={`${selectedPage ? "text-text-primary" : "text-text-muted"} hidden sm:inline`}>
                {selectedPageTitle || "Page"}
              </span>
              <ChevronDown className="w-3 h-3 text-text-muted flex-shrink-0 hidden sm:block" />
            </button>
            {openDropdown === "page" && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => {
                    setOpenDropdown(null);
                    setSearchQuery(prev => ({ ...prev, page: "" }));
                  }}
                />
                <div className="absolute top-full left-0 mt-1 w-72 bg-void border border-border rounded-lg shadow-xl z-20 max-h-80 overflow-hidden flex flex-col">
                  <div className="p-2 border-b border-border">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                      <input
                        type="text"
                        placeholder="Search pages..."
                        value={searchQuery.page}
                        onChange={(e) => setSearchQuery(prev => ({ ...prev, page: e.target.value }))}
                        className="w-full pl-7 pr-2 py-1.5 text-xs bg-deep border border-border rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-ember-glow"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2 px-3 py-4 text-text-muted">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs">Loading...</span>
                      </div>
                    ) : filteredPages.length === 0 ? (
                      <div className="px-3 py-4 text-center text-xs text-text-muted">
                        {searchQuery.page ? "No pages found" : "No pages"}
                      </div>
                    ) : (
                      <div className="p-1">
                        {filteredPages
                          .sort((a, b) => (a.order || 0) - (b.order || 0))
                          .map((page) => (
                            <div
                              key={page.id}
                              className={`group relative flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                                selectedPage === page.id || selectedPage === page.id.toString()
                                  ? "bg-ember/10 text-ember-glow"
                                  : "hover:bg-deep/50 text-text-primary"
                              }`}
                            >
                              {editingItem?.type === "page" && editingItem.id === page.id ? (
                                <input
                                  ref={editInputRef}
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() => {
                                    if (editValue.trim()) {
                                      handleRename("page", page.id, editValue.trim());
                                    } else {
                                      setEditingItem(null);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      if (editValue.trim()) {
                                        handleRename("page", page.id, editValue.trim());
                                      }
                                    } else if (e.key === "Escape") {
                                      setEditingItem(null);
                                    }
                                  }}
                                  className="flex-1 px-2 py-0.5 bg-deep border border-ember-glow rounded text-text-primary text-xs focus:outline-none"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <>
                                  <button
                                    onClick={() => handlePageSelect(page.id)}
                                    className="flex-1 text-left truncate"
                                  >
                                    {toTitleCase(page.title)}
                                  </button>
                                  <button
                                    onContextMenu={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setContextMenu({ x: e.clientX, y: e.clientY, type: "page", id: page.id });
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-deep rounded transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setContextMenu({ x: e.clientX, y: e.clientY, type: "page", id: page.id });
                                    }}
                                  >
                                    <MoreVertical className="w-3 h-3 text-text-muted" />
                                  </button>
                                </>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  {onCreatePage && (
                    <div className="p-2 border-t border-border">
                      <button
                        onClick={() => {
                          onCreatePage(selectedChapter);
                          setOpenDropdown(null);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs text-ember-glow hover:bg-ember/10 rounded transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        New Page
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
      </div>
      
      {/* Detail Toolbar Tabs - only show if something is selected and showButtons is true */}
      {showButtons && (selectedAct || selectedChapter || selectedPage) && activeTab !== undefined && onTabChange && (
        <div className="flex items-center gap-0 ml-auto bg-deep/30 rounded-lg p-0.5 border border-border">
          <DetailToolbar activeTab={activeTab} onTabChange={onTabChange} />
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={[
            {
              label: "Rename",
              icon: <Edit2 className="w-4 h-4" />,
              onClick: () => {
                const item = contextMenu.type === "act" 
                  ? acts.find(a => a.id === contextMenu.id)
                  : contextMenu.type === "chapter"
                  ? chapters.find(c => c.id === contextMenu.id)
                  : pages.find(p => p.id === contextMenu.id);
                if (item) {
                  setEditingItem({ type: contextMenu.type, id: contextMenu.id });
                  setEditValue(item.title);
                  setContextMenu(null);
                  setOpenDropdown(null);
                }
              },
            },
            {
              label: "View Details",
              icon: <Eye className="w-4 h-4" />,
              onClick: () => {
                // Navigate to the item
                if (contextMenu.type === "act") handleActSelect(contextMenu.id);
                if (contextMenu.type === "chapter") handleChapterSelect(contextMenu.id);
                if (contextMenu.type === "page") handlePageSelect(contextMenu.id);
                setContextMenu(null);
              },
            },
            {
              label: "Duplicate",
              icon: <Copy className="w-4 h-4" />,
              onClick: () => {
                handleDuplicate(contextMenu.type, contextMenu.id);
                setContextMenu(null);
              },
            },
            { label: "", onClick: () => {}, divider: true },
            {
              label: "Delete",
              icon: <Trash2 className="w-4 h-4" />,
              onClick: () => {
                handleDelete(contextMenu.type, contextMenu.id);
                setContextMenu(null);
              },
              danger: true,
            },
          ]}
        />
      )}
    </div>
  );
}

