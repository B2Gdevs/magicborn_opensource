// components/content-editor/ActChapterPageSelector.tsx
// Act, Chapter, Page selectors for middle navbar section with hover popups

"use client";

import { useState, useRef, useEffect, useCallback, type RefObject } from "react";
import { BookOpen, FileText, File, Plus, Search, ChevronDown, Loader2, ChevronRight, Edit2, Trash2, Copy, Eye } from "lucide-react";
import { SharedNavbarPopup } from "./SharedNavbarPopup";
import { ContextMenu, type ContextMenuItem } from "./ContextMenu";
import { Modal } from "@components/ui/Modal";
import { ActForm, type ActFormData, ActFormFooter } from "./ActForm";
import { ChapterForm, type ChapterFormData, ChapterFormFooter } from "./ChapterForm";
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

interface ActChapterPageSelectorProps {
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
  onEditAct?: (actId: string) => void;
  onEditChapter?: (chapterId: string) => void;
  onEditPage?: (pageId: string) => void;
  onDeleteAct?: (actId: string) => void;
  onDeleteChapter?: (chapterId: string) => void;
  onDeletePage?: (pageId: string) => void;
  onDuplicateAct?: (actId: string) => void;
  onDuplicateChapter?: (chapterId: string) => void;
  onDuplicatePage?: (pageId: string) => void;
  currentPageTitle?: string | null;
  centerNavRef?: RefObject<HTMLDivElement>;
}

export function ActChapterPageSelector({
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
  onEditAct,
  onEditChapter,
  onEditPage,
  onDeleteAct,
  onDeleteChapter,
  onDeletePage,
  onDuplicateAct,
  onDuplicateChapter,
  onDuplicatePage,
  currentPageTitle,
  centerNavRef,
}: ActChapterPageSelectorProps) {
  const [acts, setActs] = useState<Act[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openPopup, setOpenPopup] = useState<"act" | "chapter" | "page" | null>(null);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: "act" | "chapter" | "page"; id: string } | null>(null);
  const [editModal, setEditModal] = useState<{ type: "act" | "chapter" | "page"; id: string } | null>(null);
  const [editData, setEditData] = useState<ActFormData | ChapterFormData | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const actButtonRef = useRef<HTMLButtonElement>(null);
  const chapterButtonRef = useRef<HTMLButtonElement>(null);
  const pageButtonRef = useRef<HTMLButtonElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch acts - sort by updatedAt descending to get latest first
      // Note: Payload uses 'updatedAt' for ascending, '-updatedAt' for descending
      const actsRes = await fetch(
        `/api/payload/acts?where[project][equals]=${projectId}&sort=-updatedAt`
      );
      const actsData = await actsRes.json();
      const actsList = actsData.docs || [];
      setActs(actsList);

      // Auto-select latest act if none selected (only once on initial load)
      if (!hasAutoSelected && !selectedAct && actsList.length > 0 && onActSelect) {
        setHasAutoSelected(true);
        onActSelect(actsList[0].id);
        return; // Will refetch with selected act
      }

      // Fetch chapters - sort by updatedAt descending
      const chaptersRes = await fetch(
        `/api/payload/chapters?where[project][equals]=${projectId}&sort=-updatedAt`
      );
      const chaptersData = await chaptersRes.json();
      const allChapters = chaptersData.docs || [];

      // Filter chapters based on selected act
      let filteredChapters: Chapter[] = [];
      if (selectedAct) {
        filteredChapters = allChapters.filter(
          (ch: any) =>
            (ch.act === selectedAct || ch.act?.id === selectedAct) &&
            ch.type === "chapter"
        );
      } else {
        filteredChapters = allChapters.filter((ch: any) => ch.type === "chapter");
      }
      setChapters(filteredChapters);

      // Auto-select latest chapter if none selected but act is selected (only once)
      if (!hasAutoSelected && selectedAct && !selectedChapter && filteredChapters.length > 0 && onChapterSelect) {
        setHasAutoSelected(true);
        onChapterSelect(filteredChapters[0].id);
        return; // Will refetch with selected chapter
      }

      // Fetch pages if chapter is selected - sort by updatedAt descending
      if (selectedChapter) {
        const pagesRes = await fetch(
          `/api/payload/pages?where[project][equals]=${projectId}&where[chapter][equals]=${selectedChapter}&sort=-updatedAt`
        );
        const pagesData = await pagesRes.json();
        const pagesList = pagesData.docs || [];
        setPages(pagesList);

        // Auto-select latest page if none selected (only once)
        if (!hasAutoSelected && !selectedPage && pagesList.length > 0 && onPageSelect) {
          setHasAutoSelected(true);
          onPageSelect(pagesList[0].id);
        }
      } else {
        setPages([]);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [projectId, selectedAct, selectedChapter, selectedPage, hasAutoSelected, onActSelect, onChapterSelect, onPageSelect]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset auto-selection flag when projectId changes
  useEffect(() => {
    setHasAutoSelected(false);
  }, [projectId]);

  const selectedActTitle = toTitleCase(acts.find((a) => a.id === selectedAct)?.title || "");
  const selectedChapterTitle = toTitleCase(chapters.find((c) => c.id === selectedChapter)?.title || "");
  const selectedPageTitle = toTitleCase(currentPageTitle || pages.find((p) => p.id === selectedPage)?.title || "");

  // Get filtered items based on current popup type
  const getFilteredItems = () => {
    const query = searchQuery.toLowerCase();
    switch (openPopup) {
      case "act":
        return acts.filter((act) => act.title.toLowerCase().includes(query));
      case "chapter":
        return chapters.filter((chapter) => chapter.title.toLowerCase().includes(query));
      case "page":
        return pages.filter((page) => page.title.toLowerCase().includes(query));
      default:
        return [];
    }
  };

  const filteredItems = getFilteredItems();

  // Get popup metadata based on current type
  const getPopupMetadata = () => {
    switch (openPopup) {
      case "act":
        return {
          title: "Acts",
          icon: BookOpen,
          items: filteredItems,
          selectedId: selectedAct,
          onSelect: onActSelect,
          onCreate: onCreateAct,
          emptyMessage: "No acts yet",
          searchPlaceholder: "Search acts...",
        };
      case "chapter":
        return {
          title: "Chapters",
          icon: FileText,
          items: filteredItems,
          selectedId: selectedChapter,
          onSelect: onChapterSelect,
          onCreate: selectedAct && onCreateChapter ? () => onCreateChapter(selectedAct) : undefined,
          emptyMessage: selectedAct ? "No chapters in this act" : "Select an act first",
          searchPlaceholder: "Search chapters...",
        };
      case "page":
        return {
          title: "Pages",
          icon: File,
          items: filteredItems,
          selectedId: selectedPage,
          onSelect: onPageSelect,
          onCreate: selectedChapter && onCreatePage ? () => onCreatePage(selectedChapter) : undefined,
          emptyMessage: selectedChapter ? "No pages in this chapter" : "Select a chapter first",
          searchPlaceholder: "Search pages...",
        };
      default:
        return null;
    }
  };

  const popupMetadata = getPopupMetadata();

  // Load edit data when modal opens
  useEffect(() => {
    if (editModal) {
      setLoadingEdit(true);
      const endpoint = editModal.type === "act" 
        ? `/api/payload/acts/${editModal.id}`
        : editModal.type === "chapter"
        ? `/api/payload/chapters/${editModal.id}`
        : `/api/payload/pages/${editModal.id}`;
      
      fetch(endpoint)
        .then(res => res.json())
        .then(data => {
          const doc = data.doc || data;
          if (editModal.type === "act") {
            setEditData({
              id: doc.slug || doc.id?.toString() || "",
              name: doc.title || "",
              description: doc.description || "",
              imageMediaId: typeof doc.image === 'object' ? doc.image?.id : doc.image,
            } as ActFormData);
          } else if (editModal.type === "chapter") {
            setEditData({
              id: doc.slug || doc.id?.toString() || "",
              name: doc.title || "",
              description: doc.description || "",
              imageMediaId: typeof doc.image === 'object' ? doc.image?.id : doc.image,
              actId: typeof doc.act === 'object' ? doc.act?.id?.toString() : doc.act?.toString(),
            } as ChapterFormData);
          }
        })
        .catch(err => console.error("Failed to fetch edit data:", err))
        .finally(() => setLoadingEdit(false));
    } else {
      setEditData(null);
    }
  }, [editModal]);

  // Handle form submission
  const handleFormSubmit = async (data: ActFormData | ChapterFormData) => {
    if (!editModal) return;
    
    setSaving(true);
    try {
      const endpoint = editModal.type === "act"
        ? `/api/payload/acts/${editModal.id}`
        : `/api/payload/chapters/${editModal.id}`;
      
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.name,
          description: data.description,
          image: (data as any).imageMediaId || undefined,
        }),
      });
      
      if (res.ok) {
        setEditModal(null);
        // Refresh the data
        fetchData();
        // Call the original handler if provided
        if (editModal.type === "act" && onEditAct) {
          onEditAct(editModal.id);
        } else if (editModal.type === "chapter" && onEditChapter) {
          onEditChapter(editModal.id);
        }
      }
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  // Get context menu items based on type
  const getContextMenuItems = (type: "act" | "chapter" | "page", id: string): ContextMenuItem[] => {
    const items: ContextMenuItem[] = [];
    
    if (type === "act") {
      items.push({
        label: "Edit",
        icon: <Edit2 className="w-4 h-4" />,
        onClick: () => {
          setContextMenu(null);
          setEditModal({ type: "act", id });
        },
      });
      if (onDuplicateAct) {
        items.push({
          label: "Duplicate",
          icon: <Copy className="w-4 h-4" />,
          onClick: () => {
            setContextMenu(null);
            onDuplicateAct(id);
          },
        });
      }
      if (onDeleteAct) {
        items.push({ label: "", onClick: () => {}, divider: true });
        items.push({
          label: "Delete",
          icon: <Trash2 className="w-4 h-4" />,
          onClick: () => {
            setContextMenu(null);
            onDeleteAct(id);
          },
          danger: true,
        });
      }
    } else if (type === "chapter") {
      items.push({
        label: "Edit",
        icon: <Edit2 className="w-4 h-4" />,
        onClick: () => {
          setContextMenu(null);
          setEditModal({ type: "chapter", id });
        },
      });
      if (onDuplicateChapter) {
        items.push({
          label: "Duplicate",
          icon: <Copy className="w-4 h-4" />,
          onClick: () => {
            setContextMenu(null);
            onDuplicateChapter(id);
          },
        });
      }
      if (onDeleteChapter) {
        items.push({ label: "", onClick: () => {}, divider: true });
        items.push({
          label: "Delete",
          icon: <Trash2 className="w-4 h-4" />,
          onClick: () => {
            setContextMenu(null);
            onDeleteChapter(id);
          },
          danger: true,
        });
      }
    } else if (type === "page") {
      if (onEditPage) {
        items.push({
          label: "Edit",
          icon: <Edit2 className="w-4 h-4" />,
          onClick: () => {
            setContextMenu(null);
            onEditPage(id);
          },
        });
      }
      if (onDuplicatePage) {
        items.push({
          label: "Duplicate",
          icon: <Copy className="w-4 h-4" />,
          onClick: () => {
            setContextMenu(null);
            onDuplicatePage(id);
          },
        });
      }
      if (onDeletePage) {
        items.push({ label: "", onClick: () => {}, divider: true });
        items.push({
          label: "Delete",
          icon: <Trash2 className="w-4 h-4" />,
          onClick: () => {
            setContextMenu(null);
            onDeletePage(id);
          },
          danger: true,
        });
      }
    }
    
    return items;
  };

  // Render grid popup content
  const renderGridPopup = () => {
    if (!popupMetadata) return null;

    const { title, icon: Icon, items, selectedId, onSelect, onCreate, emptyMessage, searchPlaceholder } = popupMetadata;
    const popupType = openPopup!;

    return (
      <div className="flex flex-col h-full">
        {/* Search bar centered */}
        <div className="flex items-center justify-center px-4 py-3 border-b border-border/50 flex-shrink-0">
          <div className="flex items-center gap-2 w-full max-w-md">
            <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-deep border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-ember/50"
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
        </div>

        {/* Grid of items */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
              {/* Create placeholder card - always first */}
              {onCreate && (
                <button
                  onClick={() => {
                    onCreate();
                    setSearchQuery("");
                  }}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-border/50 bg-deep/30 hover:border-ember/50 hover:bg-deep/50 transition-colors group"
                >
                  <div className="p-3 rounded-lg bg-deep/50 group-hover:bg-ember/20 transition-colors">
                    <Plus className="w-6 h-6 text-text-muted group-hover:text-ember-glow transition-colors" />
                  </div>
                  <span className="text-xs text-text-muted group-hover:text-ember-glow transition-colors">
                    Create {title.slice(0, -1)}
                  </span>
                </button>
              )}

              {/* Item cards */}
              {items.map((item) => {
                const isSelected = selectedId === item.id;
                const contextMenuItems = getContextMenuItems(popupType, item.id);
                const hasContextMenu = contextMenuItems.length > 0;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelect(item.id);
                      setSearchQuery("");
                    }}
                    onContextMenu={(e) => {
                      if (hasContextMenu) {
                        e.preventDefault();
                        setContextMenu({
                          x: e.clientX,
                          y: e.clientY,
                          type: popupType,
                          id: item.id,
                        });
                      }
                    }}
                    style={{ boxSizing: "content-box" }}
                    className={`
                      flex flex-col items-center justify-center gap-2 p-4 rounded-lg border transition-all
                      ${isSelected
                        ? "border-ember/50 bg-ember/10 shadow-lg shadow-ember/20"
                        : "border-border/50 bg-deep/30 hover:border-ember/30 hover:bg-deep/50"
                      }
                    `}
                  >
                    <div
                      className={`
                        p-3 rounded-lg transition-colors
                        ${isSelected ? "bg-ember/30" : "bg-deep/50"}
                      `}
                    >
                      <Icon
                        className={`
                          w-6 h-6 transition-colors
                          ${isSelected ? "text-ember-glow" : "text-text-muted"}
                        `}
                      />
                    </div>
                    <span
                      className={`
                        text-xs text-center line-clamp-2 transition-colors
                        ${isSelected ? "text-ember-glow font-medium" : "text-text-secondary"}
                      `}
                    >
                      {toTitleCase(item.title)}
                    </span>
                  </button>
                );
              })}

              {/* Empty state */}
              {items.length === 0 && !onCreate && (
                <div className="col-span-full flex items-center justify-center py-12">
                  <span className="text-sm text-text-muted">{emptyMessage}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const getCurrentPopupContent = () => {
    return renderGridPopup();
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          ref={actButtonRef}
          onMouseEnter={() => setOpenPopup("act")}
          onClick={() => setOpenPopup(openPopup ? null : "act")}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all
            ${selectedAct
              ? "bg-white/10 text-white"
              : "text-text-secondary hover:text-white hover:bg-white/5"
            }
          `}
        >
          <BookOpen className="w-4 h-4" />
          <span>{selectedActTitle || "Act"}</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {selectedAct && (
          <>
            <ChevronRight className="w-3 h-3 text-text-muted" />
            <button
              ref={chapterButtonRef}
              onMouseEnter={() => setOpenPopup("chapter")}
              onClick={() => setOpenPopup(openPopup ? null : "chapter")}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all
                ${selectedChapter
                  ? "bg-white/10 text-white"
                  : "text-text-secondary hover:text-white hover:bg-white/5"
                }
              `}
            >
              <FileText className="w-4 h-4" />
              <span>{selectedChapterTitle || "Chapter"}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </>
        )}

        {selectedChapter && (
          <>
            <ChevronRight className="w-3 h-3 text-text-muted" />
            <button
              ref={pageButtonRef}
              onMouseEnter={() => setOpenPopup("page")}
              onClick={() => setOpenPopup(openPopup ? null : "page")}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all
                ${selectedPage
                  ? "bg-white/10 text-white"
                  : "text-text-secondary hover:text-white hover:bg-white/5"
                }
              `}
            >
              <File className="w-4 h-4" />
              <span>{selectedPageTitle || "Page"}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </>
        )}
      </div>

      {/* Shared popup in fixed position - shows grid for current nav item */}
      <SharedNavbarPopup
        isOpen={!!openPopup}
        onClose={() => {
          setOpenPopup(null);
          setSearchQuery("");
        }}
        triggerRef={openPopup === "act" ? actButtonRef : openPopup === "chapter" ? chapterButtonRef : pageButtonRef}
        containerRef={centerNavRef}
        padding={8}
      >
        <div
          className="h-full flex flex-col"
          onMouseEnter={() => {
            // Keep popup open when hovering over it
          }}
          onMouseLeave={() => {
            // Close when leaving popup area
            setTimeout(() => {
              setOpenPopup(null);
              setSearchQuery("");
            }, 200);
          }}
        >
          {getCurrentPopupContent()}
        </div>
      </SharedNavbarPopup>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={getContextMenuItems(contextMenu.type, contextMenu.id)}
        />
      )}

      {/* Edit Modal for Act */}
      {editModal?.type === "act" && (
        <Modal
          isOpen={!!editModal}
          onClose={() => setEditModal(null)}
          title="Edit Act"
          maxWidth="4xl"
          footer={
            <ActFormFooter
              isEdit={true}
              saving={saving}
              onCancel={() => setEditModal(null)}
              onSubmit={() => {
                const form = document.querySelector('form');
                if (form) form.requestSubmit();
              }}
            />
          }
        >
          {loadingEdit ? (
            <div className="p-6 text-center text-text-muted">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
              Loading...
            </div>
          ) : editData ? (
            <ActForm
              initialValues={editData as ActFormData}
              isEdit={true}
              onSubmit={handleFormSubmit}
              saving={saving}
              projectId={projectId}
              editEntryId={parseInt(editModal.id, 10)}
            />
          ) : null}
        </Modal>
      )}

      {/* Edit Modal for Chapter */}
      {editModal?.type === "chapter" && (
        <Modal
          isOpen={!!editModal}
          onClose={() => setEditModal(null)}
          title="Edit Chapter"
          maxWidth="4xl"
          footer={
            <ChapterFormFooter
              isEdit={true}
              saving={saving}
              onCancel={() => setEditModal(null)}
              onSubmit={() => {
                const form = document.querySelector('form');
                if (form) form.requestSubmit();
              }}
            />
          }
        >
          {loadingEdit ? (
            <div className="p-6 text-center text-text-muted">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
              Loading...
            </div>
          ) : editData ? (
            <ChapterForm
              initialValues={editData as ChapterFormData}
              isEdit={true}
              onSubmit={handleFormSubmit}
              saving={saving}
              projectId={projectId}
              editEntryId={parseInt(editModal.id, 10)}
              actId={(editData as ChapterFormData).actId}
            />
          ) : null}
        </Modal>
      )}
    </>
  );
}

