// components/environment/AreaInfoDisplay.tsx
// Reusable area and bounds information display

"use client";

import { getCellSizeInUnrealMeters, formatCellSizeInMeters } from "@/lib/utils/cellSizeCalculator";
import type { CoordinateSystemConfig } from "@/lib/utils/coordinateSystem";

interface AreaInfoDisplayProps {
  estimatedAreaInUnreal: number; // Square meters
  unrealBounds?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  coordinateConfig?: CoordinateSystemConfig; // Optional: show cell size in meters
}

export function AreaInfoDisplay({ estimatedAreaInUnreal, unrealBounds, coordinateConfig }: AreaInfoDisplayProps) {
  const cellSizeFormatted = coordinateConfig ? formatCellSizeInMeters(coordinateConfig) : null;
  const cellSize = coordinateConfig ? getCellSizeInUnrealMeters(coordinateConfig) : null;

  return (
    <div className="mb-3 p-2 bg-void rounded text-sm">
      <div className="text-text-secondary">
        <strong>Area:</strong> {(estimatedAreaInUnreal / 1000000).toFixed(2)} km²
      </div>
      {cellSizeFormatted && cellSize && (
        <div className="text-text-secondary text-xs mt-1">
          <strong>Cell Size:</strong> {cellSizeFormatted} ({cellSize.width.toFixed(2)}m × {cellSize.height.toFixed(2)}m)
        </div>
      )}
      {unrealBounds && (
        <div className="text-text-muted text-xs mt-1">
          Bounds: {unrealBounds.minX.toFixed(0)}m × {unrealBounds.minY.toFixed(0)}m
          {" → "}
          {unrealBounds.maxX.toFixed(0)}m × {unrealBounds.maxY.toFixed(0)}m
        </div>
      )}
    </div>
  );
}

