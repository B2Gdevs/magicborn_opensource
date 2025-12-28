// components/ui/MediaLibraryPopup.tsx
"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { X, ImageIcon, Search, Upload, Check, Loader2 } from "lucide-react";
import { SidebarNav } from "@components/ui/SidebarNav";

export interface MediaItem {
  id: number;
  filename: string;
  url: string;
  mimeType?: string;
  width?: number;
  height?: number;
}

function MediaGridItem({
  item,
  isSelected,
  onSelect,
}: {
  item: MediaItem;
  isSelected: boolean;
  onSelect: (item: MediaItem) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all group ${
        isSelected
          ? "border-ember ring-2 ring-ember/30 scale-105"
          : "border-border/30 hover:border-ember/50 hover:scale-105"
      }`}
    >
      <img src={item.url} alt={item.filename} className="w-full h-full object-cover" loading="lazy" decoding="async" />

      {isHovered && (
        <div className="absolute top-0 left-0 right-0 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 truncate z-10">
          {item.filename}
        </div>
      )}

      {isSelected && (
        <div className="absolute inset-0 bg-ember/10 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-ember flex items-center justify-center">
            <Check className="w-3 h-3 text-void" strokeWidth={3} />
          </div>
        </div>
      )}
    </button>
  );
}

interface MediaLibraryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem) => void;
  onUpload: (file: File) => void;
  currentMediaId?: number;
  mediaType?: "image" | "video" | "audio" | "all";
  projectId?: string | number;
}

function getMimeType(doc: any): string | undefined {
  return doc?.mimeType ?? doc?.mime_type ?? doc?.file?.mimeType ?? undefined;
}

function safeString(v: unknown) {
  return v === undefined || v === null ? "" : String(v);
}

export function MediaLibraryPopup({
  isOpen,
  onClose,
  onSelect,
  onUpload,
  currentMediaId,
  mediaType = "image",
  projectId,
}: MediaLibraryPopupProps) {
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [activeTab, setActiveTab] = useState<"image" | "library">("image");
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const COLUMNS = 5;
  const GAP = 8;
  const ITEMS_PER_PAGE = 20;

  const canScope = projectId !== undefined && projectId !== null && safeString(projectId).length > 0;

  const fetchMediaLibrary = useCallback(
    async (pageNum: number = 1, reset: boolean = false) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);

      try {
        const qs = new URLSearchParams();
        qs.set("limit", String(ITEMS_PER_PAGE));
        qs.set("page", String(pageNum));
        qs.set("sort", "-createdAt");

        // MUST match your GET handler’s where parsing and your field name: "project"
        if (canScope) {
          qs.set("where[project][equals]", safeString(projectId));
        }

        const res = await fetch(`/api/payload/media?${qs.toString()}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as any)?.error || (err as any)?.message || `Request failed: ${res.status}`);
        }

        const data = await res.json();
        let docs = data?.docs ?? [];

        // Client-side type filter (keeps server simple)
        if (mediaType !== "all") {
          docs = docs.filter((doc: any) => {
            const mt = (getMimeType(doc) || "").toLowerCase();
            if (mediaType === "image") return mt.startsWith("image/");
            if (mediaType === "video") return mt.startsWith("video/");
            if (mediaType === "audio") return mt.startsWith("audio/");
            return true;
          });
        }

        const items: MediaItem[] = docs.map((doc: any) => ({
          id: Number(doc.id),
          filename: safeString(doc.filename),
          url: doc?.url || (doc?.filename ? `/media/${doc.filename}` : ""),
          mimeType: getMimeType(doc),
          width: doc.width,
          height: doc.height,
        }));

        setMediaLibrary((prev) => (reset ? items : [...prev, ...items]));

        const rawDocsCount = (data?.docs ?? []).length;
        const more =
          data?.hasNextPage === true ||
          (data?.hasNextPage !== false && rawDocsCount >= ITEMS_PER_PAGE);

        setHasMore(Boolean(more));
      } catch (error) {
        console.error("Failed to fetch media library:", error);
        if (reset) setMediaLibrary([]);
        setHasMore(false);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [mediaType, projectId, canScope]
  );

  useEffect(() => {
    if (!isOpen) return;
    setPage(1);
    setHasMore(true);
    setSearch("");
    setPreviewMedia(null);
    setActiveTab("image");
    fetchMediaLibrary(1, true);
  }, [isOpen, fetchMediaLibrary]);

  // Delegate upload to parent (parent is responsible for projectId requirement)
  const handleUploadAndRefresh = useCallback(
    (file: File) => {
      try {
        onUpload(file);
      } finally {
        setTimeout(() => {
          setPage(1);
          setHasMore(true);
          fetchMediaLibrary(1, true);
        }, 350);
      }
    },
    [onUpload, fetchMediaLibrary]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleUploadAndRefresh(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUploadAndRefresh(file);
    e.currentTarget.value = "";
  };

  const handleSelectMedia = (item: MediaItem) => {
    setPreviewMedia(item);
    setActiveTab("image");
  };

  const handleConfirmSelection = () => {
    if (!previewMedia) return;
    try {
      onSelect(previewMedia);
      setTimeout(() => onClose(), 0);
    } catch (error) {
      console.error("Error selecting media:", error);
    }
  };

  const filteredMedia = useMemo(() => {
    if (!search) return mediaLibrary;
    const q = search.toLowerCase();
    return mediaLibrary.filter((m) => (m.filename || "").toLowerCase().includes(q));
  }, [mediaLibrary, search]);

  const rows = useMemo(() => {
    const rowCount = Math.ceil(filteredMedia.length / COLUMNS);
    const out: MediaItem[][] = [];
    for (let i = 0; i < rowCount; i++) {
      out.push(filteredMedia.slice(i * COLUMNS, i * COLUMNS + COLUMNS));
    }
    return out;
  }, [filteredMedia]);

  const calculateRowHeight = useCallback(() => {
    if (parentRef.current && parentRef.current.clientWidth > 0) {
      const containerWidth = parentRef.current.clientWidth;
      const availableWidth = containerWidth - 8;
      const totalGaps = GAP * (COLUMNS - 1);
      const itemWidth = (availableWidth - totalGaps) / COLUMNS;
      return Math.max(itemWidth + GAP, 100);
    }
    return 100;
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: calculateRowHeight,
    overscan: 5,
  });

  useEffect(() => {
    if (!parentRef.current || !hasMore || loading || rows.length === 0) return;

    const rootEl = parentRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (!hasMore || loading || loadingRef.current) continue;

          const next = page + 1;
          setPage(next);
          fetchMediaLibrary(next, false);
          break;
        }
      },
      { root: rootEl, rootMargin: "300px", threshold: 0.1 }
    );

    const lastRowIndices = [rows.length - 1, rows.length - 2, rows.length - 3].filter((i) => i >= 0);

    const observeRows = () => {
      lastRowIndices.forEach((rowIndex) => {
        const el = rootEl.querySelector(`[data-index="${rowIndex}"]`);
        if (el) observer.observe(el);
      });
    };

    observeRows();
    const timeoutId = setTimeout(observeRows, 200);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [rows.length, hasMore, loading, page, fetchMediaLibrary]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-void/90 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-shadow border border-border rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-medium text-text-primary">Select Media</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-deep/50 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          <SidebarNav
            items={[
              { id: "image", label: "Preview", icon: ImageIcon },
              { id: "library", label: "Library", icon: Search },
            ]}
            activeId={activeTab}
            onItemClick={(id) => setActiveTab(id as "image" | "library")}
            width="sm"
            showBorder={true}
            showBackground={false}
            sticky={false}
            size="sm"
            className="bg-shadow/40"
            activeClassName="bg-ember/10 text-ember-glow"
            inactiveClassName="text-text-muted hover:text-text-primary hover:bg-deep/30"
          />

          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === "image" ? (
              <div className="p-5">
                <div className="flex items-center justify-center bg-deep/20 rounded-xl border border-border/50 p-6 min-h-[320px]">
                  {previewMedia ? (
                    <div
                      className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border border-border/50 group"
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      <img src={previewMedia.url} alt={previewMedia.filename} className="w-full h-full object-contain" />

                      <div
                        className={`absolute bottom-3 right-3 flex items-center gap-2 transition-opacity duration-200 ${
                          isHovered ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setPreviewMedia(null)}
                          className="px-3 py-1.5 text-xs bg-void/90 backdrop-blur-sm border border-border/50 rounded-lg hover:border-ember/50 text-text-primary hover:text-ember-glow transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmSelection}
                          className="px-3 py-1.5 text-xs bg-ember/90 backdrop-blur-sm border border-ember/50 rounded-lg hover:bg-ember text-void transition-colors font-medium"
                        >
                          Use This
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`w-full max-w-md aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-colors cursor-pointer relative group ${
                        isDragging ? "border-ember-glow bg-ember/10" : "border-border/50 hover:border-ember/30"
                      }`}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="text-center space-y-3">
                        <div className="w-16 h-16 mx-auto rounded-full bg-deep/50 flex items-center justify-center group-hover:bg-deep transition-colors">
                          <ImageIcon className="w-8 h-8 text-text-muted" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary mb-1">No media selected</p>
                          <p className="text-xs text-text-muted">{isDragging ? "Drop file here" : "Click to upload or pick from library"}</p>
                        </div>
                      </div>

                      <div
                        className={`absolute bottom-3 right-3 flex items-center gap-2 transition-opacity duration-200 ${
                          isHovered ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTab("library");
                          }}
                          className="px-3 py-1.5 text-xs bg-void/90 backdrop-blur-sm border border-border/50 rounded-lg hover:border-ember/50 text-text-primary hover:text-ember-glow transition-colors flex items-center gap-1.5"
                        >
                          <ImageIcon className="w-3 h-3" />
                          Library
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="px-3 py-1.5 text-xs bg-void/90 backdrop-blur-sm border border-border/50 rounded-lg hover:border-ember/50 text-text-primary hover:text-ember-glow transition-colors flex items-center gap-1.5"
                        >
                          <Upload className="w-3 h-3" />
                          Upload
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-shrink-0 p-4 pb-3 bg-shadow/70 backdrop-blur border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search your media..."
                      className="w-full pl-10 pr-3 py-2 text-sm bg-deep border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-ember/30 transition-colors"
                    />
                  </div>
                </div>

                {loading && mediaLibrary.length === 0 ? (
                  <div className="flex items-center justify-center py-12 flex-1">
                    <Loader2 className="w-5 h-5 animate-spin text-ember-glow" />
                  </div>
                ) : filteredMedia.length > 0 ? (
                  <div
                    ref={parentRef}
                    style={{
                      height: "500px",
                      overflowY: "auto",
                      overflowX: "hidden",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                      WebkitOverflowScrolling: "touch",
                      position: "relative",
                    }}
                    className="scrollbar-hide"
                  >
                    <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
                      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const row = rows[virtualRow.index];
                        if (!row) return null;

                        const containerWidth = parentRef.current?.clientWidth || 500;
                        const availableWidth = containerWidth - 8;
                        const totalGaps = GAP * (COLUMNS - 1);
                        const itemWidth = (availableWidth - totalGaps) / COLUMNS;
                        const rowHeight = Math.max(itemWidth + GAP, 100);

                        return (
                          <div
                            key={virtualRow.key}
                            data-index={virtualRow.index}
                            ref={rowVirtualizer.measureElement}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              minHeight: `${rowHeight}px`,
                              transform: `translateY(${virtualRow.start}px)`,
                            }}
                            className="grid grid-cols-5 gap-2 px-1"
                          >
                            {row.map((item) => (
                              <MediaGridItem
                                key={item.id}
                                item={item}
                                isSelected={previewMedia?.id === item.id || currentMediaId === item.id}
                                onSelect={handleSelectMedia}
                              />
                            ))}

                            {row.length < COLUMNS &&
                              Array.from({ length: COLUMNS - row.length }).map((_, idx) => (
                                <div key={`empty-${idx}`} className="aspect-square" />
                              ))}
                          </div>
                        );
                      })}
                    </div>

                    {loading && page > 1 && (
                      <div
                        className="flex items-center justify-center py-4"
                        style={{
                          position: "absolute",
                          bottom: "20px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          pointerEvents: "none",
                        }}
                      >
                        <Loader2 className="w-4 h-4 animate-spin text-ember-glow" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center min-h-[400px]">
                    <div className="text-center py-12">
                      <ImageIcon className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
                      <p className="text-sm text-text-muted">
                        {search ? "No matching media found" : mediaLibrary.length === 0 ? "No media in library" : "No results"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={
            mediaType === "image"
              ? "image/*"
              : mediaType === "video"
              ? "video/*"
              : mediaType === "audio"
              ? "audio/*"
              : "*"
          }
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
