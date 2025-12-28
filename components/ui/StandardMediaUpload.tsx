// components/ui/StandardMediaUpload.tsx
"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { MediaLibraryPopup, type MediaItem } from "./MediaLibraryPopup";
import { isValidImageFile } from "@/lib/utils/image-validation";
import { toast } from "@/lib/hooks/useToast";

export type MediaUploadSize = "thumbnail" | "full" | "inline";
export type MediaType = "image" | "video" | "audio" | "all";

interface StandardMediaUploadProps {
  currentMediaId?: number;
  currentMediaUrl?: string;

  onMediaSelected: (mediaId: number | undefined) => void;

  size?: MediaUploadSize;
  mediaType?: MediaType;
  label?: string;
  disabled?: boolean;

  className?: string;

  /**
   * If true, and currentMediaId is present but currentMediaUrl is not,
   * StandardMediaUpload will fetch `/api/payload/media/:id` to resolve the URL.
   */
  resolveUrlFromId?: boolean;

  /**
   * Project scoping for media (stored on media docs).
   * We pass this through as a query param (NOT a header).
   */
  projectId?: string | number;
}

function withProjectId(url: string, projectId?: string | number) {
  if (projectId === undefined || projectId === null || String(projectId).length === 0) return url;
  const u = new URL(url, window.location.origin);
  u.searchParams.set("projectId", String(projectId));
  return u.pathname + u.search;
}

export function StandardMediaUpload({
  currentMediaId,
  currentMediaUrl,
  onMediaSelected,
  size = "full",
  mediaType = "image",
  label,
  disabled = false,
  className = "",
  resolveUrlFromId = true,
  projectId,
}: StandardMediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resolvedUrl, setResolvedUrl] = useState<string | undefined>(undefined);

  // Resolve URL for edit-mode when only id is provided
  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (!resolveUrlFromId) return;

      // If we have a URL from parent or from a new upload, don't fetch
      if (previewUrl || currentMediaUrl) {
        setResolvedUrl(undefined);
        return;
      }

      if (!currentMediaId) {
        setResolvedUrl(undefined);
        return;
      }

      try {
        const url = withProjectId(`/api/payload/media/${currentMediaId}`, projectId);
        const res = await fetch(url);
        if (!res.ok) {
          if (!cancelled) setResolvedUrl(undefined);
          return;
        }
        const data = await res.json();
        const finalUrl = data?.url || (data?.filename ? `/media/${data.filename}` : undefined);
        if (!cancelled) setResolvedUrl(finalUrl);
      } catch {
        if (!cancelled) setResolvedUrl(undefined);
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [currentMediaId, currentMediaUrl, previewUrl, resolveUrlFromId, projectId]);

  const displayUrl = previewUrl || currentMediaUrl || resolvedUrl;
  const hasMedia = !!displayUrl;

  const accept = useMemo(() => {
    if (mediaType === "image") return "image/*";
    if (mediaType === "video") return "video/*";
    if (mediaType === "audio") return "audio/*";
    return "*";
  }, [mediaType]);

  const zoneSizeClasses = useMemo(() => {
    switch (size) {
      case "thumbnail":
        return "w-20 h-20";
      case "inline":
        return "w-24 h-24";
      case "full":
      default:
        return "w-full aspect-square";
    }
  }, [size]);

  const zoneClasses = useMemo(() => {
    const base = `relative ${zoneSizeClasses} border-2 border-dashed rounded-lg overflow-hidden transition-all cursor-pointer`;
    const state =
      isDragging
        ? "border-ember-glow bg-ember/10 scale-[1.02]"
        : hasMedia
        ? "border-border bg-deep"
        : "border-border/50 bg-deep/30 hover:border-ember/50 hover:bg-deep/50";

    const disabledState = disabled ? "cursor-not-allowed opacity-50" : "";
    const uploadingState = uploading ? "cursor-wait" : "";
    const compact = size === "thumbnail" || size === "inline" ? "flex-shrink-0" : "";

    return `${base} ${state} ${disabledState} ${uploadingState} ${compact}`;
  }, [zoneSizeClasses, isDragging, hasMedia, disabled, uploading, size]);

  const uploadFile = useCallback(
    async (file: File) => {
      if (disabled) return;

      if (mediaType === "image") {
        const ok = await isValidImageFile(file);
        if (!ok) {
          toast.warning("Please select a valid image file (PNG, JPEG, GIF, WebP, BMP, or SVG)");
          return;
        }
      }

      if (projectId === undefined || projectId === null || String(projectId).length === 0) {
        toast.error("Project is required to upload media.");
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        // Matches your POST handler: /api/payload/media?projectId=#
        const uploadUrl = withProjectId("/api/payload/media", projectId);

        const response = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error((error as any)?.error || "Failed to upload media");
        }

        const data = await response.json();
        const mediaId = typeof data?.id === "number" ? data.id : data?.id ? Number(data.id) : undefined;

        // Display immediately
        if (data?.url) setPreviewUrl(data.url);
        else if (data?.filename) setPreviewUrl(`/media/${data.filename}`);

        // Clear resolvedUrl (edit-mode) since we now have a fresh URL
        setResolvedUrl(undefined);

        onMediaSelected(mediaId);
      } catch (err) {
        console.error("Error uploading media:", err);
        toast.error("Failed to upload media");
      } finally {
        setUploading(false);
      }
    },
    [disabled, mediaType, projectId, onMediaSelected]
  );

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.currentTarget.value = "";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled || uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  function handleClick() {
    if (disabled || uploading) return;
    setShowPopup(true);
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    setPreviewUrl(null);
    setResolvedUrl(undefined);
    onMediaSelected(undefined);
  }

  function handleMediaSelected(media: MediaItem) {
    // Selected from library: we only store the id and let parent resolve if needed
    setPreviewUrl(null);
    setResolvedUrl(undefined);
    onMediaSelected(media.id);
    setShowPopup(false);
  }

  function handleMediaUploaded(file: File) {
    uploadFile(file);
  }

  const wrapperLayout = size === "full" ? "w-full" : "flex items-center gap-3";

  const showTopLabel = size === "full" && !!label;
  const showSideLabel = (size === "thumbnail" || size === "inline") && !!label;

  const showThumbnailX = size === "thumbnail" && hasMedia && !disabled && isHovered;
  const showOverlayActions = (size === "inline" || size === "full") && hasMedia && !disabled && isHovered;

  return (
    <>
      <div className={`${wrapperLayout} ${className}`}>
        {showTopLabel && (
          <label className="block text-sm font-semibold text-text-secondary mb-1">{label}</label>
        )}

        <div
          ref={dropZoneRef}
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={zoneClasses}
        >
          {displayUrl ? (
            <>
              <img src={displayUrl} alt={label || "Media"} className="w-full h-full object-cover" />

              {showThumbnailX && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-1 right-1 w-5 h-5 bg-ember/90 hover:bg-ember rounded-full flex items-center justify-center text-white text-xs"
                  aria-label="Remove media"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              {showOverlayActions && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPopup(true);
                      }}
                      className={
                        size === "full"
                          ? "px-3 py-1.5 bg-ember/90 hover:bg-ember text-white rounded text-xs font-semibold transition-colors"
                          : "px-2 py-1 text-xs bg-ember/90 hover:bg-ember text-white rounded"
                      }
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemove}
                      className={
                        size === "full"
                          ? "px-3 py-1.5 bg-red-500/90 hover:bg-red-500 text-white rounded text-xs font-semibold transition-colors"
                          : "px-2 py-1 text-xs bg-red-500/90 hover:bg-red-500 text-white rounded"
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <div
                className={
                  size === "thumbnail"
                    ? "w-10 h-10 rounded-full bg-deep/50 flex items-center justify-center"
                    : size === "inline"
                    ? "w-12 h-12 rounded-full bg-deep/50 flex items-center justify-center"
                    : "w-16 h-16 mx-auto mb-4 rounded-full bg-deep/50 flex items-center justify-center"
                }
              >
                <ImageIcon
                  className={
                    size === "thumbnail"
                      ? "w-5 h-5 text-text-muted"
                      : size === "inline"
                      ? "w-6 h-6 text-text-muted"
                      : "w-8 h-8 text-text-muted"
                  }
                />
              </div>

              {size === "full" && (
                <>
                  <p className="text-text-secondary font-semibold mb-2">
                    {isDragging ? "Drop media here" : "Click to choose or drag to upload"}
                  </p>
                  {mediaType === "image" && <p className="text-xs text-text-muted">PNG, JPEG, WebP, GIF, or SVG</p>}
                </>
              )}
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-deep/80 flex items-center justify-center">
              <div
                className={
                  size === "full"
                    ? "animate-spin rounded-full h-8 w-8 border-2 border-ember border-t-transparent"
                    : "animate-spin rounded-full h-6 w-6 border-2 border-ember border-t-transparent"
                }
              />
            </div>
          )}
        </div>

        {showSideLabel && (
          <div className="flex-1">
            <label className="block text-sm font-semibold text-text-secondary">{label}</label>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      <MediaLibraryPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onSelect={handleMediaSelected}
        onUpload={handleMediaUploaded}
        currentMediaId={currentMediaId}
        mediaType={mediaType}
        projectId={projectId}
      />
    </>
  );
}
