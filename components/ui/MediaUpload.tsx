"use client";

import { useState, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { X, Upload } from "lucide-react";

interface MediaUploadProps {
  currentMediaId?: number;
  currentMediaUrl?: string;
  onMediaUploaded: (mediaId: number | undefined) => void;
  onFileSelected?: (file: File | null) => void; // Callback when file is selected (before upload)
  label?: string;
  disabled?: boolean;
  compact?: boolean;
}

export interface MediaUploadRef {
  uploadFile: () => Promise<number | undefined>; // Returns media ID
  clearFile: () => void;
}

export const MediaUpload = forwardRef<MediaUploadRef, MediaUploadProps>(({
  currentMediaId,
  currentMediaUrl,
  onMediaUploaded,
  onFileSelected,
  label = "Media",
  disabled = false,
  compact = false,
}, ref) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Expose upload method via ref
  useImperativeHandle(ref, () => ({
    uploadFile: async () => {
      if (!pendingFile) {
        return currentMediaId;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", pendingFile);

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
        onMediaUploaded(mediaId);
        setPendingFile(null);
        
        // Use URL from response directly (no extra GET request needed)
        if (data.url) {
          const url = data.url;
          // Normalize URL (convert absolute to relative)
          if (url.startsWith('http://localhost') || url.startsWith('https://')) {
            try {
              const urlObj = new URL(url);
              setPreview(urlObj.pathname);
            } catch {
              setPreview(url);
            }
          } else {
            setPreview(url.startsWith('/') ? url : `/${url}`);
          }
        } else if (data.filename) {
          // Fallback: construct URL from filename (Payload's staticURL is /media)
          setPreview(`/media/${data.filename}`);
        }
        
        return mediaId;
      } catch (error) {
        console.error("Error uploading media:", error);
        throw error;
      } finally {
        setUploading(false);
      }
    },
    clearFile: () => {
      setPendingFile(null);
      setPreview(null);
      onMediaUploaded(undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
  }));

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Store file for later upload (on form submission)
    setPendingFile(file);
    
    // Create preview from file (no upload yet)
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Notify parent that file was selected
    onFileSelected?.(file);
  }, [onFileSelected]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

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
      handleFileSelect(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingFile(null);
    setPreview(null);
    onMediaUploaded(undefined);
    onFileSelected?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled && !uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const imageUrl = preview || currentMediaUrl;
  const hasImage = !!imageUrl || !!pendingFile;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          {label}
        </label>
      )}
      <div
        ref={dropZoneRef}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative w-full border-2 border-dashed rounded-lg overflow-hidden
          transition-all cursor-pointer
          ${compact ? "h-32" : "aspect-square"}
          ${isDragging 
            ? "border-ember-glow bg-ember/10 scale-[1.02]" 
            : hasImage 
              ? "border-border bg-deep" 
              : "border-border/50 bg-deep/30 hover:border-ember/50 hover:bg-deep/50"
          }
          ${disabled ? "cursor-not-allowed opacity-50" : ""}
          ${uploading ? "cursor-wait" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
          onChange={handleFileInputChange}
          disabled={uploading || disabled}
          className="hidden"
        />

        {hasImage ? (
          <>
            <img
              src={imageUrl}
              alt={label}
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="opacity-0 hover:opacity-100 transition-opacity flex gap-2">
                  <button
                    type="button"
                    onClick={handleClick}
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
          <div className={`absolute inset-0 flex flex-col items-center justify-center ${compact ? "p-2" : "p-6"} text-center`}>
            <>
              {pendingFile && (
                <p className="text-xs text-ember-glow mb-2">Ready to upload on save</p>
              )}
              <Upload className={`${compact ? "w-8 h-8 mb-1" : "w-16 h-16 mb-4"} text-text-muted`} />
              <p className={`text-text-secondary font-semibold ${compact ? "text-xs mb-1" : "mb-2"}`}>
                {isDragging ? "Drop image here" : "Click or drag to upload"}
              </p>
              {!compact && (
                <p className="text-xs text-text-muted">
                  PNG, JPEG, WebP, GIF, or SVG
                </p>
              )}
            </>
          </div>
        )}
      </div>
    </div>
  );
});

MediaUpload.displayName = "MediaUpload";

