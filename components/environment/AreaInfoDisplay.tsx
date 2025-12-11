// components/environment/AreaInfoDisplay.tsx
// Reusable area and bounds information display

"use client";

interface AreaInfoDisplayProps {
  estimatedAreaInUnreal: number; // Square meters
  unrealBounds?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

export function AreaInfoDisplay({ estimatedAreaInUnreal, unrealBounds }: AreaInfoDisplayProps) {
  return (
    <div className="mb-3 p-2 bg-void rounded text-sm">
      <div className="text-text-secondary">
        <strong>Area:</strong> {(estimatedAreaInUnreal / 1000000).toFixed(2)} km²
      </div>
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
