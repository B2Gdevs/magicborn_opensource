// components/ui/ImageUpload.tsx
// Reusable image upload component for game content with drag & drop

"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

interface ImageUploadProps {
  currentImagePath?: string;
  contentType: "spells" | "effects" | "runes" | "characters" | "creatures" | "environments" | "maps";
  entityId?: string;
  onImageUploaded: (imagePath: string) => void;
  onImageDimensions?: (width: number, height: number) => void;
  label?: string;
  disabled?: boolean;
}

export function ImageUpload({
  currentImagePath,
  contentType,
  entityId,
  onImageUploaded,
  onImageDimensions,
  label = "Image",
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Create preview and get dimensions
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      
      // Get image dimensions
      const img = document.createElement("img");
      img.onload = () => {
        if (onImageDimensions) {
          onImageDimensions(img.naturalWidth, img.naturalHeight);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("contentType", contentType);
      if (entityId) {
        formData.append("entityId", entityId);
      }

      const response = await fetch("/api/game-data/images/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload image");
      }

      const data = await response.json();
      onImageUploaded(data.path);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(`Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`);
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [contentType, entityId, onImageUploaded]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
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
      uploadFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onImageUploaded("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled && !uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const imagePath = preview || currentImagePath;
  const hasImage = !!imagePath;

  return (
    <div className="w-full">
      <div
        ref={dropZoneRef}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative w-full aspect-square border-2 border-dashed rounded-lg overflow-hidden
          transition-all cursor-pointer
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
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
          onChange={handleFileSelect}
          disabled={uploading || disabled}
          className="hidden"
          id={`image-upload-${contentType}-${entityId || "new"}`}
        />

        {hasImage ? (
          <>
            <Image
              src={imagePath}
              alt={label}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 512px"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="opacity-0 hover:opacity-100 transition-opacity flex gap-2">
                  <button
                    type="button"
                    onClick={handleClick}
                    className="px-4 py-2 bg-ember/90 hover:bg-ember text-white rounded-lg font-semibold text-sm transition-colors"
                  >
                    {uploading ? "Uploading..." : "Change"}
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="px-4 py-2 bg-red-500/90 hover:bg-red-500 text-white rounded-lg font-semibold text-sm transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            {uploading ? (
              <div className="space-y-4">
                <div className="w-16 h-16 border-4 border-ember border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-text-secondary font-semibold">Uploading...</p>
              </div>
            ) : (
              <>
                <svg
                  className="w-16 h-16 text-text-muted mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-text-secondary font-semibold mb-2">
                  {isDragging ? "Drop image here" : "Click or drag image here"}
                </p>
                <p className="text-xs text-text-muted">
                  PNG, JPEG, WebP, or GIF
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Recommended: WebP for best compression
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

