// components/content-editor/ActDetailView.tsx
// Detail view for Acts - PageEditor-style header with form content

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Info, FileText, Tag, List, Download, MoreVertical, Image as ImageIcon, X, Upload, Search, Check, Plus } from "lucide-react";
import { SidebarNav, type SidebarNavItem } from "@components/ui/SidebarNav";
import { SaveStatus } from "@lib/content-editor/types";
import { toTitleCase } from "@lib/utils/titleCase";

interface ActDetailViewProps {
  projectId: string;
  actId: string;
  onSaveStatusChange?: (status: SaveStatus) => void;
  onLastSavedChange?: (date: Date) => void;
  onTitleChange?: (title: string) => void;
  onCreateChapter?: (actId: string) => void;
  onChapterSelect?: (chapterId: string) => void;
}

// Validation schema for acts
const actSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Title is required"),
  description: z.string().default(""),
  imageMediaId: z.number().optional(),
});

type ActFormData = z.infer<typeof actSchema>;

interface Section {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MediaItem {
  id: number;
  filename: string;
  url: string;
  mimeType?: string;
  width?: number;
  height?: number;
}

const sections: Section[] = [
  { id: "basic", label: "Info", icon: Info },
  { id: "chapters", label: "Chapters", icon: List },
  { id: "content", label: "Content", icon: FileText },
  { id: "metadata", label: "Meta", icon: Tag },
];

export function ActDetailView({
  projectId,
  actId,
  onSaveStatusChange,
  onLastSavedChange,
  onTitleChange,
  onCreateChapter,
  onChapterSelect,
}: ActDetailViewProps) {
  const [act, setAct] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("basic");
  const [isNavHovered, setIsNavHovered] = useState(false);
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [isHoveringChaptersList, setIsHoveringChaptersList] = useState(false);
  const [imageMediaId, setImageMediaId] = useState<number | undefined>(undefined);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [showMediaPopup, setShowMediaPopup] = useState(false);
  const [mediaModalTab, setMediaModalTab] = useState<"image" | "library">("image");
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaSearch, setMediaSearch] = useState("");
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null); // Preview before confirming
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Autosave refs
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const hasUnsavedChangesRef = useRef(false);

  const form = useForm({
    resolver: zodResolver(actSchema),
    defaultValues: {
      id: "",
      name: "",
      description: "",
      imageMediaId: undefined,
    },
  });

  const { register, watch, setValue, formState: { errors } } = form;
  const name = watch("name");
  const description = watch("description");

  // Keep parent synced with title changes
  useEffect(() => {
    if (name) {
      onTitleChange?.(name);
    }
  }, [name, onTitleChange]);

  useEffect(() => {
    hasUnsavedChangesRef.current = false;
    fetchAct();
  }, [actId]);

  // Cleanup autosave timeout on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, []);

  // Fetch media library when popup opens
  useEffect(() => {
    if (showMediaPopup) {
      fetchMediaLibrary();
      setPreviewMedia(null); // Reset preview when opening
      setMediaModalTab("image");
    }
  }, [showMediaPopup]);

  const fetchMediaLibrary = async () => {
    setMediaLoading(true);
    try {
      const res = await fetch(`/api/payload/media?limit=50&sort=-createdAt`);
      const data = await res.json();
      const items = (data.docs || []).filter((doc: any) => 
        doc.mimeType?.startsWith("image/")
      ).map((doc: any) => ({
        id: doc.id,
        filename: doc.filename,
        url: doc.url,
        mimeType: doc.mimeType,
        width: doc.width,
        height: doc.height,
      }));
      setMediaLibrary(items);
    } catch (error) {
      console.error("Failed to fetch media library:", error);
    } finally {
      setMediaLoading(false);
    }
  };

  const fetchAct = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payload/acts/${actId}`);
      const data = await res.json();
      if (data.doc || data.id) {
        const actData = data.doc || data;
        setAct(actData);
        
        if (!hasUnsavedChangesRef.current) {
          setValue("name", actData.title || "");
          setValue("description", actData.description || "");
          setValue("id", actData.slug || actData.id?.toString() || "");
          
          // Handle image
          const imgId = typeof actData.image === 'object' 
            ? actData.image?.id 
            : actData.image;
          if (imgId) {
            setImageMediaId(imgId);
            setValue("imageMediaId", imgId);
            // Fetch image URL
            const imgRes = await fetch(`/api/payload/media/${imgId}`);
            const imgData = await imgRes.json();
            if (imgData.url) {
              setImageUrl(imgData.url);
            }
          }
          
          onTitleChange?.(actData.title || "");
        }
      }
      
      // Fetch chapters for this act
      const chaptersRes = await fetch(
        `/api/payload/chapters?where[project][equals]=${projectId}&where[act][equals]=${actId}&sort=order`
      );
      const chaptersData = await chaptersRes.json();
      setChapters(chaptersData.docs || []);
    } catch (error) {
      console.error("Failed to fetch act:", error);
    } finally {
      setLoading(false);
    }
  };

  const performSave = useCallback(async () => {
    if (isSavingRef.current) return;
    
    isSavingRef.current = true;
    onSaveStatusChange?.(SaveStatus.Saving);
    
    try {
      const res = await fetch(`/api/payload/acts/${actId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.getValues("name"),
          description: form.getValues("description"),
          image: imageMediaId || undefined,
        }),
      });
      
      if (res.ok) {
        hasUnsavedChangesRef.current = false;
        onSaveStatusChange?.(SaveStatus.Saved);
        onLastSavedChange?.(new Date());
      } else {
        onSaveStatusChange?.(SaveStatus.Error);
      }
    } catch (error) {
      console.error("Failed to save act:", error);
      onSaveStatusChange?.(SaveStatus.Error);
    } finally {
      isSavingRef.current = false;
    }
  }, [actId, imageMediaId, form, onSaveStatusChange, onLastSavedChange]);

  const triggerAutosave = useCallback(() => {
    hasUnsavedChangesRef.current = true;
    onSaveStatusChange?.(SaveStatus.Unsaved);
    
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }
    
    autosaveTimeoutRef.current = setTimeout(() => {
      performSave();
    }, 2000);
  }, [performSave, onSaveStatusChange]);

  // Watch for form changes and trigger autosave
  useEffect(() => {
    if (!loading && act) {
      triggerAutosave();
    }
  }, [name, description, imageMediaId]);

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
          url: data.url,
          mimeType: data.mimeType,
        };
        // Preview the uploaded image
        setPreviewMedia(uploadedItem);
        // Refresh library
        fetchMediaLibrary();
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    }
  };

  const handleSelectMedia = (item: MediaItem) => {
    // Preview the selected image instead of immediately applying
    setPreviewMedia(item);
    setMediaModalTab("image");
  };

  const handleConfirmSelection = () => {
    if (previewMedia) {
      setImageMediaId(previewMedia.id);
      setImageUrl(previewMedia.url);
      setValue("imageMediaId", previewMedia.id);
      triggerAutosave();
      setPreviewMedia(null);
      setShowMediaPopup(false);
    }
  };

  const handleCancelPreview = () => {
    setPreviewMedia(null);
  };

  const handleRemoveImage = () => {
    setImageMediaId(undefined);
    setImageUrl(undefined);
    setValue("imageMediaId", undefined);
    triggerAutosave();
    setShowMediaPopup(false);
  };

  const filteredMedia = mediaSearch 
    ? mediaLibrary.filter(m => m.filename.toLowerCase().includes(mediaSearch.toLowerCase()))
    : mediaLibrary;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-void">
        <Loader2 className="w-6 h-6 animate-spin text-ember-glow" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-void">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />

      {/* PageEditor-style Title Bar */}
      <div 
        className="relative flex-shrink-0"
        onMouseEnter={() => setIsTitleHovered(true)}
        onMouseLeave={() => setIsTitleHovered(false)}
      >
        <div className="max-w-2xl mx-auto px-4 pt-2 flex items-center gap-2">
          {/* Start: Thumbnail */}
          <div className={`transition-opacity duration-200 ${isTitleHovered ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={() => setShowMediaPopup(true)}
              className="relative w-7 h-7 rounded overflow-hidden border border-border/50 hover:border-ember/50 transition-colors"
              title={imageUrl ? "Change image" : "Add image"}
            >
              {imageUrl ? (
                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-deep/50 flex items-center justify-center">
                  <ImageIcon className="w-3 h-3 text-text-muted" />
                </div>
              )}
            </button>
          </div>

          {/* Center: Title */}
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setValue("name", e.target.value);
              onTitleChange?.(e.target.value);
              triggerAutosave();
            }}
            className="flex-1 py-1 bg-transparent text-lg font-semibold text-text-primary placeholder-text-muted focus:outline-none"
            placeholder="Act title..."
          />
          
          {/* End: Tools */}
          <div className={`flex items-center gap-1 transition-opacity duration-200 ${isTitleHovered ? 'opacity-100' : 'opacity-0'}`}>
            <button
              className="p-1.5 rounded hover:bg-deep/50 text-text-secondary hover:text-text-primary transition-colors"
              title="Export"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 rounded hover:bg-deep/50 text-text-secondary hover:text-text-primary transition-colors"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Side Navigation - minimal, transparent */}
        <div
          className="flex-shrink-0"
          onMouseEnter={() => setIsNavHovered(true)}
          onMouseLeave={() => setIsNavHovered(false)}
        >
          <div className={`transition-opacity duration-200 ${isNavHovered ? 'opacity-100' : 'opacity-20'}`}>
            <SidebarNav
              items={sections.map((section) => ({
                id: section.id,
                label: section.label,
                icon: section.icon as any, // Lucide icons are compatible
              }))}
              activeId={activeSection}
              onItemClick={(id: string) => setActiveSection(id)}
              width="xs"
              size="sm"
              sticky={false}
              activeClassName="bg-ember/10 text-ember-glow"
              inactiveClassName="text-text-muted hover:text-text-primary hover:bg-deep/30"
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl px-4 py-4">
            {/* Basic Information Section */}
            {activeSection === "basic" && (
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-2">
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    onChange={(e) => {
                      setValue("description", e.target.value);
                      triggerAutosave();
                    }}
                    className="w-full min-h-32 px-3 py-2 bg-transparent border border-border/50 rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-ember/30 resize-none"
                    placeholder="Add a description..."
                  />
                </div>
              </div>
            )}

            {/* Chapters Section */}
            {activeSection === "chapters" && (
              <div 
                className="space-y-0"
                onMouseEnter={() => setIsHoveringChaptersList(true)}
                onMouseLeave={() => setIsHoveringChaptersList(false)}
              >
                {chapters.length > 0 && (
                  <div className="space-y-0.5 mb-2">
                    {chapters.map((chapter, index) => (
                      <button
                        key={chapter.id}
                        onClick={() => onChapterSelect?.(chapter.id.toString())}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-deep/30 transition-colors text-left"
                      >
                        <span className="text-xs text-text-muted w-3 text-right">
                          {index + 1}
                        </span>
                        <span className="text-sm text-text-primary flex-1">
                          {toTitleCase(chapter.title || `Chapter ${index + 1}`)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Create Chapter Input - Always visible, minimal */}
                <div className="relative mt-2">
                  {isHoveringChaptersList && !newChapterTitle && (
                    <button
                      onClick={async () => {
                        if (onCreateChapter) {
                          onCreateChapter(actId);
                        }
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-deep/50 text-text-muted hover:text-ember-glow transition-colors z-10"
                      title="Create new chapter"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <input
                    type="text"
                    value={newChapterTitle}
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter" && newChapterTitle.trim() && onCreateChapter) {
                        e.preventDefault();
                        // Create chapter with custom title
                        try {
                          const res = await fetch("/api/payload/chapters", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              project: parseInt(projectId, 10),
                              act: actId,
                              type: "chapter",
                              title: toTitleCase(newChapterTitle.trim()),
                              order: chapters.length,
                            }),
                          });
                          const data = await res.json();
                          const doc = data.doc || data;
                          if (doc?.id) {
                            setNewChapterTitle("");
                            // Refresh chapters list
                            const updatedChaptersRes = await fetch(
                              `/api/payload/chapters?where[project][equals]=${projectId}&where[act][equals]=${actId}&sort=order`
                            );
                            const updatedChaptersData = await updatedChaptersRes.json();
                            setChapters(updatedChaptersData.docs || []);
                            // Navigate to the new chapter
                            onChapterSelect?.(doc.id.toString());
                          }
                        } catch (error) {
                          console.error("Failed to create chapter:", error);
                        }
                      }
                    }}
                    placeholder={chapters.length === 0 ? "Type chapter name and press Enter..." : "New chapter..."}
                    className={`w-full py-1.5 text-sm bg-transparent text-text-primary placeholder-text-muted/50 focus:outline-none transition-colors ${
                      isHoveringChaptersList && !newChapterTitle ? 'pl-8 pr-2' : 'px-2'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Content Section */}
            {activeSection === "content" && (
              <div className="space-y-4">
                <p className="text-xs text-text-muted">
                  Act notes and content.
                </p>
                <div className="border border-dashed border-border/50 rounded-lg p-6 text-center">
                  <FileText className="w-8 h-8 text-text-muted/50 mx-auto mb-2" />
                  <p className="text-xs text-text-muted">
                    Rich text content coming soon
                  </p>
                </div>
              </div>
            )}

            {/* Metadata Section */}
            {activeSection === "metadata" && (
              <div className="space-y-4 text-xs">
                <div className="flex gap-2">
                  <span className="text-text-muted w-16">ID</span>
                  <span className="text-text-secondary font-mono">{act?.id}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-text-muted w-16">Created</span>
                  <span className="text-text-secondary">
                    {act?.createdAt ? new Date(act.createdAt).toLocaleString() : "—"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-text-muted w-16">Updated</span>
                  <span className="text-text-secondary">
                    {act?.updatedAt ? new Date(act.updatedAt).toLocaleString() : "—"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Media Popup - Modern Social Media Style */}
      {showMediaPopup && (
        <div 
          className="fixed inset-0 bg-void/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowMediaPopup(false)}
        >
          <div 
            className="bg-shadow border border-border rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-medium text-text-primary">Image</h3>
              <button
                onClick={() => setShowMediaPopup(false)}
                className="p-1.5 rounded-lg hover:bg-deep/50 text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body (internal nav + scrollable panel) */}
            <div className="flex flex-1 min-h-0">
              {/* Internal Nav */}
              <SidebarNav
                items={[
                  { id: "image", label: "Image", icon: ImageIcon },
                  { id: "library", label: "Library", icon: Search },
                ]}
                activeId={mediaModalTab}
                onItemClick={(id) => setMediaModalTab(id as "image" | "library")}
                width="sm"
                sticky={false}
                size="sm"
                activeClassName="bg-ember/10 text-ember-glow"
                inactiveClassName="text-text-muted hover:text-text-primary hover:bg-deep/30"
              />

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                {mediaModalTab === "image" ? (
                  <div className="p-5">
                    <div className="flex items-center justify-center bg-deep/20 rounded-xl border border-border/50 p-6 min-h-[320px]">
                      {(previewMedia || imageUrl) ? (
                        <div
                          className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border border-border/50 group"
                          onMouseEnter={() => setIsImageHovered(true)}
                          onMouseLeave={() => setIsImageHovered(false)}
                        >
                          <img
                            src={previewMedia?.url || imageUrl}
                            alt=""
                            className="w-full h-full object-contain cursor-pointer"
                            onClick={() => {
                              // Quick replace on click (like social apps)
                              if (!previewMedia) {
                                fileInputRef.current?.click();
                              }
                            }}
                          />

                          <div
                            className={`absolute bottom-3 right-3 flex items-center gap-2 transition-opacity duration-200 ${
                              previewMedia ? "opacity-100" : isImageHovered ? "opacity-100" : "opacity-0"
                            }`}
                          >
                            {previewMedia ? (
                              <>
                                <button
                                  onClick={handleCancelPreview}
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
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => setMediaModalTab("library")}
                                  className="px-3 py-1.5 text-xs bg-void/90 backdrop-blur-sm border border-border/50 rounded-lg hover:border-ember/50 text-text-primary hover:text-ember-glow transition-colors flex items-center gap-1.5"
                                >
                                  <ImageIcon className="w-3 h-3" />
                                  Library
                                </button>
                                <button
                                  onClick={() => fileInputRef.current?.click()}
                                  className="px-3 py-1.5 text-xs bg-void/90 backdrop-blur-sm border border-border/50 rounded-lg hover:border-ember/50 text-text-primary hover:text-ember-glow transition-colors flex items-center gap-1.5"
                                >
                                  <Upload className="w-3 h-3" />
                                  Upload
                                </button>
                                <button
                                  onClick={handleRemoveImage}
                                  className="px-3 py-1.5 text-xs bg-void/90 backdrop-blur-sm border border-red-500/30 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
                                >
                                  Remove
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div
                          className="w-full max-w-md aspect-video rounded-lg border-2 border-dashed border-border/50 flex flex-col items-center justify-center hover:border-ember/30 transition-colors cursor-pointer relative group"
                          onMouseEnter={() => setIsImageHovered(true)}
                          onMouseLeave={() => setIsImageHovered(false)}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="text-center space-y-3">
                            <div className="w-16 h-16 mx-auto rounded-full bg-deep/50 flex items-center justify-center group-hover:bg-deep transition-colors">
                              <ImageIcon className="w-8 h-8 text-text-muted" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-text-primary mb-1">No image selected</p>
                              <p className="text-xs text-text-muted">Click to upload or pick from library</p>
                            </div>
                          </div>

                          <div
                            className={`absolute bottom-3 right-3 flex items-center gap-2 transition-opacity duration-200 ${
                              isImageHovered ? "opacity-100" : "opacity-0"
                            }`}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMediaModalTab("library");
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
                  <div className="p-4 space-y-4">
                    <div className="sticky top-0 bg-shadow/70 backdrop-blur border border-border rounded-xl p-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                          type="text"
                          value={mediaSearch}
                          onChange={(e) => setMediaSearch(e.target.value)}
                          placeholder="Search your media..."
                          className="w-full pl-10 pr-3 py-2 text-sm bg-deep border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-ember/30 transition-colors"
                        />
                      </div>
                    </div>

                    {mediaLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-5 h-5 animate-spin text-ember-glow" />
                      </div>
                    ) : filteredMedia.length > 0 ? (
                      <div className="grid grid-cols-5 gap-2">
                        {filteredMedia.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleSelectMedia(item)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                              (previewMedia?.id === item.id || imageMediaId === item.id)
                                ? "border-ember ring-2 ring-ember/30 scale-105"
                                : "border-border/30 hover:border-ember/50 hover:scale-105"
                            }`}
                          >
                            <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
                            {(previewMedia?.id === item.id || imageMediaId === item.id) && (
                              <div className="absolute inset-0 bg-ember/10 flex items-center justify-center">
                                <div className="w-6 h-6 rounded-full bg-ember flex items-center justify-center">
                                  <Check className="w-3 h-3 text-void" strokeWidth={3} />
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <ImageIcon className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
                        <p className="text-sm text-text-muted">
                          {mediaSearch ? "No matching images" : "No images uploaded yet"}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
