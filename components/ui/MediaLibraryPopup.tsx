// components/ui/MediaLibraryPopup.tsx
// Reusable media library popup for selecting or uploading media
// Used by StandardMediaUpload component

"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { X, ImageIcon, Search, Upload, Check, Loader2 } from "lucide-react";
import { SidebarNav, type SidebarNavItem } from "@components/ui/SidebarNav";

// Media item from Payload CMS
export interface MediaItem {
  id: number;
  filename: string;
  url: string;
  mimeType?: string;
  width?: number;
  height?: number;
}

// Individual media grid item component (for hover state)
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
      onClick={() => onSelect(item)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all group ${
        isSelected
          ? "border-ember ring-2 ring-ember/30 scale-105"
          : "border-border/30 hover:border-ember/50 hover:scale-105"
      }`}
    >
      {/* Lazy loading - only loads when visible */}
      <img
        src={item.url}
        alt={item.filename}
        className="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />
      
      {/* Filename overlay on hover */}
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
  onSelect: (media: MediaItem) => void; // Called when user selects media from library
  onUpload: (file: File) => void; // Called when user uploads new file
  currentMediaId?: number; // Currently selected media ID (for highlighting)
  mediaType?: "image" | "video" | "audio" | "all"; // Filter by media type
}

export function MediaLibraryPopup({
  isOpen,
  onClose,
  onSelect,
  onUpload,
  currentMediaId,
  mediaType = "image",
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
  const loadingRef = useRef(false); // Use ref to avoid stale closures
  
  // Grid configuration
  const COLUMNS = 5;
  const GAP = 8; // gap-2 = 8px
  const ITEMS_PER_PAGE = 20; // Load 20 images at a time

  // Fetch media from Payload CMS with pagination
  const fetchMediaLibrary = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    if (loadingRef.current) return; // Prevent concurrent requests
    
    loadingRef.current = true;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/payload/media?limit=${ITEMS_PER_PAGE}&page=${pageNum}&sort=-createdAt`
      );
      const data = await res.json();
      
      // Filter by media type
      let items = data.docs || [];
      if (mediaType === "image") {
        items = items.filter((doc: any) => doc.mimeType?.startsWith("image/"));
      } else if (mediaType === "video") {
        items = items.filter((doc: any) => doc.mimeType?.startsWith("video/"));
      } else if (mediaType === "audio") {
        items = items.filter((doc: any) => doc.mimeType?.startsWith("audio/"));
      }
      
      // Map to MediaItem format
      const mediaItems: MediaItem[] = items.map((doc: any) => ({
        id: doc.id,
        filename: doc.filename,
        url: doc.url || `/media/${doc.filename}`,
        mimeType: doc.mimeType,
        width: doc.width,
        height: doc.height,
      }));
      
      if (reset) {
        setMediaLibrary(mediaItems);
      } else {
        setMediaLibrary((prev) => [...prev, ...mediaItems]);
      }
      
      // Check if there are more pages
      // Since we filter client-side, we need to check the original data
      // If we got a full page of raw docs, there might be more
      // Also check hasNextPage if available from Payload
      const rawDocsCount = (data.docs || []).length;
      const hasMorePages = data.hasNextPage === true || (data.hasNextPage !== false && rawDocsCount >= ITEMS_PER_PAGE);
      setHasMore(hasMorePages);
      
      // Debug logging
      console.log('Media fetch:', {
        page: pageNum,
        rawDocs: rawDocsCount,
        filteredItems: items.length,
        hasNextPage: data.hasNextPage,
        hasMore: hasMorePages,
        totalLoaded: reset ? items.length : mediaLibrary.length + items.length
      });
    } catch (error) {
      console.error("Failed to fetch media library:", error);
      if (reset) {
        setMediaLibrary([]);
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [mediaType]);

  // Fetch media library when popup opens (must be after fetchMediaLibrary is defined)
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setHasMore(true);
      fetchMediaLibrary(1, true); // Reset and load first page
      setPreviewMedia(null);
      setActiveTab("image");
      setSearch("");
    }
  }, [isOpen, fetchMediaLibrary]);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await fetch("/api/payload/media", {
        method: "POST",
        body: formData,
      });
      
      if (res.ok) {
        const data = await res.json();
        const uploadedItem: MediaItem = {
          id: data.id,
          filename: data.filename,
          url: data.url || `/media/${data.filename}`,
          mimeType: data.mimeType,
        };
        
        // Automatically select the uploaded image (no "Use This" confirmation needed)
        try {
          onSelect(uploadedItem);
          // Close popup after a brief delay to ensure callback completes
          setTimeout(() => {
            onClose();
          }, 100);
        } catch (error) {
          console.error("Error selecting uploaded media:", error);
        }
        
        // Refresh library - reset to first page (for next time popup opens)
        setPage(1);
        setHasMore(true);
        fetchMediaLibrary(1, true);
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    }
  };

  // Handle drag and drop
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
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle selecting media from library
  const handleSelectMedia = (item: MediaItem) => {
    setPreviewMedia(item);
    setActiveTab("image");
  };

  // Confirm selection
  const handleConfirmSelection = () => {
    if (previewMedia) {
      try {
        // Call onSelect first, then close
        onSelect(previewMedia);
        // Use setTimeout to ensure the callback completes before closing
        setTimeout(() => {
          onClose();
        }, 0);
      } catch (error) {
        console.error("Error selecting media:", error);
        // Don't close if there's an error
      }
    }
  };

  // Filter media by search (client-side filtering of loaded items)
  // Note: For large libraries, you might want server-side search with pagination
  const filteredMedia = useMemo(() => {
    return search
      ? mediaLibrary.filter((m) =>
          m.filename.toLowerCase().includes(search.toLowerCase())
        )
      : mediaLibrary;
  }, [mediaLibrary, search]);
  
  // Reset pagination when search changes (if implementing server-side search)
  // For now, we filter client-side, so pagination continues normally

  // Calculate rows for virtual scrolling (5 columns per row)
  const rows = useMemo(() => {
    const rowCount = Math.ceil(filteredMedia.length / COLUMNS);
    const rows: MediaItem[][] = [];
    for (let i = 0; i < rowCount; i++) {
      const start = i * COLUMNS;
      const end = start + COLUMNS;
      rows.push(filteredMedia.slice(start, end));
    }
    return rows;
  }, [filteredMedia]);

  // Calculate row height helper function
  const calculateRowHeight = useCallback(() => {
    if (parentRef.current && parentRef.current.clientWidth > 0) {
      const containerWidth = parentRef.current.clientWidth;
      const availableWidth = containerWidth - 8; // Account for padding (px-1 = 4px each side)
      const totalGaps = GAP * (COLUMNS - 1); // 4 gaps between 5 items
      const itemWidth = (availableWidth - totalGaps) / COLUMNS;
      const rowHeight = itemWidth + GAP;
      return Math.max(rowHeight, 100); // Ensure minimum 100px
    }
    // Fallback - assume ~500px container width
    return 100;
  }, []);

  // Virtual scrolling for grid
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: calculateRowHeight,
    overscan: 5, // Render 5 extra rows above/below viewport for smooth scrolling
  });

  // Load more when scrolling near bottom - observe last few rows
  useEffect(() => {
    if (!parentRef.current || !hasMore || loading || rows.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMore && !loading && !loadingRef.current) {
            console.log('Loading more media, page:', page + 1, 'Total rows:', rows.length);
            const nextPage = page + 1;
            setPage(nextPage);
            fetchMediaLibrary(nextPage, false);
          }
        });
      },
      {
        root: parentRef.current,
        rootMargin: "300px", // Start loading 300px before bottom
        threshold: 0.1,
      }
    );

    // Observe the last 2-3 rows (they should be rendered by virtualizer)
    const lastRowIndices = [rows.length - 1, rows.length - 2, rows.length - 3].filter(i => i >= 0);
    
    const observeRows = () => {
      lastRowIndices.forEach((rowIndex) => {
        const rowElement = parentRef.current?.querySelector(`[data-index="${rowIndex}"]`);
        if (rowElement) {
          observer.observe(rowElement);
        }
      });
    };

    // Try to observe rows immediately and also after a delay
    observeRows();
    const timeoutId = setTimeout(observeRows, 200);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [rows.length, hasMore, loading, page, fetchMediaLibrary]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-void/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-shadow border border-border rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-medium text-text-primary">Select Media</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-deep/50 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* Sidebar Navigation */}
          <SidebarNav
            items={[
              { id: "image", label: "Preview", icon: ImageIcon },
              { id: "library", label: "Library", icon: Search },
            ]}
            activeId={activeTab}
            onItemClick={(id) => {
              setActiveTab(id as "image" | "library");
            }}
            width="sm"
            showBorder={true}
            showBackground={false}
            sticky={false}
            size="sm"
            className="bg-shadow/40"
            activeClassName="bg-ember/10 text-ember-glow"
            inactiveClassName="text-text-muted hover:text-text-primary hover:bg-deep/30"
          />

          {/* Content */}
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
                      <img
                        src={previewMedia.url}
                        alt={previewMedia.filename}
                        className="w-full h-full object-contain"
                      />

                      <div
                        className={`absolute bottom-3 right-3 flex items-center gap-2 transition-opacity duration-200 ${
                          isHovered ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <button
                          onClick={() => setPreviewMedia(null)}
                          className="px-3 py-1.5 text-xs bg-void/90 backdrop-blur-sm border border-border/50 rounded-lg hover:border-ember/50 text-text-primary hover:text-ember-glow transition-colors"
                        >
                          Cancel
                        </button>
                        <button
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
                        isDragging
                          ? "border-ember-glow bg-ember/10"
                          : "border-border/50 hover:border-ember/30"
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
                          <p className="text-sm font-medium text-text-primary mb-1">
                            No media selected
                          </p>
                          <p className="text-xs text-text-muted">
                            {isDragging ? "Drop file here" : "Click to upload or pick from library"}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`absolute bottom-3 right-3 flex items-center gap-2 transition-opacity duration-200 ${
                          isHovered ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <button
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
                {/* Search - Always visible at top */}
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

                {/* Media Grid with Virtual Scrolling */}
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
                    }}
                    className="scrollbar-hide"
                  >
                    <div
                      style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: "100%",
                        position: "relative",
                      }}
                    >
                      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const row = rows[virtualRow.index];
                        if (!row) return null;

                        // Calculate row height based on container width
                        const containerWidth = parentRef.current?.clientWidth || 500;
                        const availableWidth = containerWidth - 8; // Account for padding
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
                                isSelected={
                                  previewMedia?.id === item.id ||
                                  currentMediaId === item.id
                                }
                                onSelect={handleSelectMedia}
                              />
                            ))}
                            {/* Fill empty cells in last row */}
                            {row.length < COLUMNS &&
                              Array.from({ length: COLUMNS - row.length }).map(
                                (_, idx) => (
                                  <div key={`empty-${idx}`} className="aspect-square" />
                                )
                              )}
                          </div>
                        );
                      })}
                    </div>
                    {/* Loading indicator at bottom when loading more */}
                    {loading && page > 1 && (
                      <div className="flex items-center justify-center py-4" style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }}>
                        <Loader2 className="w-4 h-4 animate-spin text-ember-glow" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center min-h-[400px]">
                    <div className="text-center py-12">
                      <ImageIcon className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
                      <p className="text-sm text-text-muted">
                        {search
                          ? "No matching media found"
                          : mediaLibrary.length === 0
                          ? "No media in library"
                          : "No results"}
                      </p>
                      {loading && mediaLibrary.length > 0 && (
                        <div className="mt-4 flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-ember-glow" />
                          <span className="text-xs text-text-muted">Searching...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={mediaType === "image" ? "image/*" : "*"}
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    </div>
  );
}

