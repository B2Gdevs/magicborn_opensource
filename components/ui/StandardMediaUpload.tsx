// components/ui/StandardMediaUpload.tsx
// Standardized media upload component used everywhere in the app
// Supports hover interactions, drag-and-drop, and media library popup
// Clean, readable code that's easy to understand

"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { MediaLibraryPopup, type MediaItem } from "./MediaLibraryPopup";
import { isValidImageFile } from "@/lib/utils/image-validation";
import { toast } from "@/lib/hooks/useToast";

// Size variants
export type MediaUploadSize = "thumbnail" | "full" | "inline";

interface StandardMediaUploadProps {
  // Current media state
  currentMediaId?: number;
  currentMediaUrl?: string;
  
  // Callbacks
  onMediaSelected: (mediaId: number | undefined) => void; // Called when media is selected/uploaded/removed
  
  // Configuration
  size?: MediaUploadSize; // Display size: thumbnail (small), full (large), inline (next to elements)
  mediaType?: "image" | "video" | "audio" | "all"; // Filter media type (default: image)
  label?: string; // Optional label (for forms)
  disabled?: boolean; // Disable interactions
  
  // Optional styling
  className?: string;
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
}: StandardMediaUploadProps) {
  // State
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Get the display URL (preview or current)
  const displayUrl = previewUrl || currentMediaUrl;
  const hasMedia = !!displayUrl;

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    // Validate image files
    if (mediaType === "image") {
      const isValid = await isValidImageFile(file);
      if (!isValid) {
        toast.warning("Please select a valid image file (PNG, JPEG, GIF, WebP, BMP, or SVG)");
        return;
      }
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/payload/media", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload media");
      }

      const data = await response.json();
      const mediaId = data.id;
      
      // Update preview URL
      if (data.url) {
        setPreviewUrl(data.url);
      } else if (data.filename) {
        setPreviewUrl(`/media/${data.filename}`);
      }
      
      // Notify parent
      onMediaSelected(mediaId);
    } catch (error) {
      console.error("Error uploading media:", error);
      toast.error("Failed to upload media");
    } finally {
      setUploading(false);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) {
      setIsDragging(true);
    }
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

    if (disabled || uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle click - always open popup (consistent with ActDetailView behavior)
  const handleClick = () => {
    if (disabled || uploading) return;
    // Always open popup - user can upload or select from library
    setShowPopup(true);
  };

  // Handle media selection from popup
  const handleMediaSelected = (media: MediaItem) => {
    try {
      setPreviewUrl(null); // Clear preview
      onMediaSelected(media.id);
      setShowPopup(false); // Close popup after selection
    } catch (error) {
      console.error("Error handling media selection:", error);
      // Keep popup open if there's an error
    }
  };

  // Handle file upload from popup
  const handleMediaUploaded = (file: File) => {
    handleFileUpload(file);
  };

  // Handle remove
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    onMediaSelected(undefined);
  };

  // Size-specific styles
  const getSizeClasses = () => {
    switch (size) {
      case "thumbnail":
        return "w-20 h-20";
      case "inline":
        return "w-24 h-24";
      case "full":
      default:
        return "w-full aspect-square";
    }
  };

  // Render thumbnail size (small, for toolbars/lists)
  if (size === "thumbnail") {
    return (
      <>
        <div className={`flex items-center gap-3 ${className}`}>
          <div
            ref={dropZoneRef}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative ${getSizeClasses()} border-2 border-dashed rounded-lg overflow-hidden
              transition-all cursor-pointer flex-shrink-0
              ${
                isDragging
                  ? "border-ember-glow bg-ember/10 scale-[1.02]"
                  : hasMedia
                  ? "border-border bg-deep"
                  : "border-border/50 bg-deep/30 hover:border-ember/50 hover:bg-deep/50"
              }
              ${disabled ? "cursor-not-allowed opacity-50" : ""}
              ${uploading ? "cursor-wait" : ""}
            `}
          >
            {displayUrl ? (
              <img
                src={displayUrl}
                alt={label || "Media"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-deep/50 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-text-muted" />
                </div>
              </div>
            )}
            
            {displayUrl && !disabled && isHovered && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-1 right-1 w-5 h-5 bg-ember/90 hover:bg-ember rounded-full flex items-center justify-center text-white text-xs"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            
            {uploading && (
              <div className="absolute inset-0 bg-deep/80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-ember border-t-transparent" />
              </div>
            )}
          </div>
          
          {label && (
            <div className="flex-1">
              <label className="block text-sm font-semibold text-text-secondary">
                {label}
              </label>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={mediaType === "image" ? "image/*" : "*"}
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
        />
      </>
    );
  }

  // Render inline size (next to other elements)
  if (size === "inline") {
    return (
      <>
        <div className={`flex items-center gap-3 ${className}`}>
          <div
            ref={dropZoneRef}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative ${getSizeClasses()} border-2 border-dashed rounded-lg overflow-hidden
              transition-all cursor-pointer flex-shrink-0
              ${
                isDragging
                  ? "border-ember-glow bg-ember/10 scale-[1.02]"
                  : hasMedia
                  ? "border-border bg-deep"
                  : "border-border/50 bg-deep/30 hover:border-ember/50 hover:bg-deep/50"
              }
              ${disabled ? "cursor-not-allowed opacity-50" : ""}
              ${uploading ? "cursor-wait" : ""}
            `}
          >
            {displayUrl ? (
              <>
                <img
                  src={displayUrl}
                  alt={label || "Media"}
                  className="w-full h-full object-cover"
                />
                {!disabled && isHovered && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPopup(true);
                        }}
                        className="px-2 py-1 text-xs bg-ember/90 hover:bg-ember text-white rounded"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleRemove}
                        className="px-2 py-1 text-xs bg-red-500/90 hover:bg-red-500 text-white rounded"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-deep/50 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-text-muted" />
                </div>
              </div>
            )}
            
            {uploading && (
              <div className="absolute inset-0 bg-deep/80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-ember border-t-transparent" />
              </div>
            )}
          </div>
          
          {label && (
            <div className="flex-1">
              <label className="block text-sm font-semibold text-text-secondary">
                {label}
              </label>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={mediaType === "image" ? "image/*" : "*"}
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
        />
      </>
    );
  }

  // Render full size (default, large display)
  return (
    <>
      <div className={`w-full ${className}`}>
        {label && (
          <label className="block text-sm font-semibold text-text-secondary mb-1">
            {label}
          </label>
        )}
        
        <div
          ref={dropZoneRef}
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative ${getSizeClasses()} border-2 border-dashed rounded-lg overflow-hidden
            transition-all cursor-pointer
            ${
              isDragging
                ? "border-ember-glow bg-ember/10 scale-[1.02]"
                : hasMedia
                ? "border-border bg-deep"
                : "border-border/50 bg-deep/30 hover:border-ember/50 hover:bg-deep/50"
            }
            ${disabled ? "cursor-not-allowed opacity-50" : ""}
            ${uploading ? "cursor-wait" : ""}
          `}
        >
          {displayUrl ? (
            <>
              <img
                src={displayUrl}
                alt={label || "Media"}
                className="w-full h-full object-cover"
              />
              {!disabled && isHovered && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPopup(true);
                      }}
                      className="px-3 py-1.5 bg-ember/90 hover:bg-ember text-white rounded text-xs font-semibold transition-colors"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemove}
                      className="px-3 py-1.5 bg-red-500/90 hover:bg-red-500 text-white rounded text-xs font-semibold transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-deep/50 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-text-muted" />
              </div>
              <p className="text-text-secondary font-semibold mb-2">
                {isDragging ? "Drop media here" : "Click or drag to upload"}
              </p>
              {mediaType === "image" && (
                <p className="text-xs text-text-muted">
                  PNG, JPEG, WebP, GIF, or SVG
                </p>
              )}
            </div>
          )}
          
          {uploading && (
            <div className="absolute inset-0 bg-deep/80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-ember border-t-transparent" />
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={mediaType === "image" ? "image/*" : "*"}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={uploading || disabled}
      />

      <MediaLibraryPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onSelect={handleMediaSelected}
        onUpload={handleMediaUploaded}
        currentMediaId={currentMediaId}
        mediaType={mediaType}
      />
    </>
  );
}

