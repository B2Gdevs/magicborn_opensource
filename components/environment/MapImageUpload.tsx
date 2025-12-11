// components/environment/MapImageUpload.tsx
// Reusable map image upload with square snapping for regions

"use client";

import { useState, useRef, useEffect } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { MapDefinition } from "@/lib/data/maps";
import type { CoordinateSystemConfig } from "@/lib/utils/coordinateSystem";

interface MapImageUploadProps {
  currentImagePath?: string | null;
  map: MapDefinition;
  onImageUploaded: (imagePath: string) => void;
  onCellsSnapped?: (cells: Array<{ cellX: number; cellY: number }>) => void;
  disabled?: boolean;
}

export function MapImageUpload({
  currentImagePath,
  map,
  onImageUploaded,
  onCellsSnapped,
  disabled = false,
}: MapImageUploadProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [displayImagePath, setDisplayImagePath] = useState<string | null>(currentImagePath || null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Update display path when currentImagePath prop changes
  useEffect(() => {
    setDisplayImagePath(currentImagePath || null);
  }, [currentImagePath]);

  // Handle image file (for drag & drop or file upload) - snaps region to square
  const handleImageFile = async (imageFile: File) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(imageFile);
    
    img.onload = async () => {
      // Get image dimensions
      const imageWidth = img.width;
      const imageHeight = img.height;
      
      // All maps are square, so use the smaller dimension
      const squareSize = Math.min(imageWidth, imageHeight);
      
      // Calculate cells based on the square size
      const config = map.coordinateConfig;
      const cellSize = config.baseCellSize;
      const cellsPerSide = Math.floor(squareSize / cellSize);
      
      // Center the square region on the map
      const maxCellsX = Math.floor(config.imageWidth / cellSize);
      const maxCellsY = Math.floor(config.imageHeight / cellSize);
      
      // Calculate center position
      const centerX = Math.floor(maxCellsX / 2);
      const centerY = Math.floor(maxCellsY / 2);
      
      // Calculate bounds for square region
      const halfCells = Math.floor(cellsPerSide / 2);
      const minX = Math.max(0, centerX - halfCells);
      const minY = Math.max(0, centerY - halfCells);
      const maxX = Math.min(maxCellsX - 1, centerX + halfCells - (cellsPerSide % 2 === 0 ? 1 : 0));
      const maxY = Math.min(maxCellsY - 1, centerY + halfCells - (cellsPerSide % 2 === 0 ? 1 : 0));
      
      // Generate square region cells
      const newCells: Array<{ cellX: number; cellY: number }> = [];
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          newCells.push({ cellX: x, cellY: y });
        }
      }
      
      // Notify parent of snapped cells
      if (onCellsSnapped) {
        onCellsSnapped(newCells);
      }
      
      // Upload image to server
      try {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("contentType", "maps");
        formData.append("entityId", `map-${map.id}`);
        
        const response = await fetch("/api/game-data/images/upload", {
          method: "POST",
          body: formData,
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to upload image");
        }
        
        const data = await response.json();
        const imagePath = data.path;
        
        setDisplayImagePath(imagePath);
        onImageUploaded(imagePath);
        URL.revokeObjectURL(objectUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
        alert(`Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`);
        // Keep the preview for now even if upload failed
        setDisplayImagePath(objectUrl);
      }
    };
    
    img.src = objectUrl;
  };

  return (
    <div 
      ref={dropZoneRef}
      className={cn(
        "mb-3 border-2 border-dashed rounded transition-colors cursor-pointer overflow-hidden relative",
        isDraggingOver 
          ? "border-ember-glow bg-ember/10" 
          : "border-border hover:border-ember/50",
        displayImagePath ? "p-0" : "p-4",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={() => !disabled && fileInputRef.current?.click()}
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
          setIsDraggingOver(false);
        }
      }}
      onDrop={async (e) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
        
        // Handle dropped map image
        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find(f => f.type.startsWith('image/'));
        
        if (imageFile) {
          await handleImageFile(imageFile);
        }
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && !disabled) {
            handleImageFile(file);
          }
          // Reset input so same file can be selected again
          e.target.value = '';
        }}
      />
      {displayImagePath ? (
        <div className="relative w-full aspect-square">
          <img
            src={displayImagePath.startsWith('/') || displayImagePath.startsWith('blob:') ? displayImagePath : `/game-content/maps/${displayImagePath}`}
            alt="Map preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if image doesn't load
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-center">
            <Upload className="w-6 h-6 text-white" />
            <div className="text-xs text-white px-4">
              <div className="font-semibold mb-1">Click to Change Image</div>
              <div>Or drag & drop a new square map image</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-center">
          <Upload className="w-6 h-6 text-text-muted" />
          <div className="text-xs text-text-muted">
            <div className="font-semibold mb-1">Drag & Drop or Click to Upload Map Image</div>
            <div>Drop or select a square map image to snap region to square</div>
          </div>
        </div>
      )}
    </div>
  );
}
