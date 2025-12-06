// components/environment/StatusBar.tsx
// Professional status bar showing coordinates, zoom, selection count, etc.

"use client";

import { useMapEditorStore } from "@/lib/store/mapEditorStore";
import { useEffect } from "react";
import { pixelToUnreal } from "@/lib/utils/coordinateSystem";
import type { PixelCoordinates } from "@/lib/utils/coordinateSystem";

interface StatusBarProps {
  mouseCoords?: PixelCoordinates | null;
}

export function StatusBar({ mouseCoords = null }: StatusBarProps) {
  const {
    zoom,
    selectedPlacementIds,
    showGrid,
    snapToGrid,
    gridSize,
    selectedMap,
  } = useMapEditorStore();
  
  // Calculate Unreal coordinates from pixel coordinates
  const unrealCoords = mouseCoords && selectedMap?.coordinateConfig
    ? pixelToUnreal(mouseCoords, selectedMap.coordinateConfig)
    : null;
  
  const zoomPercent = Math.round(zoom * 100);
  const selectedCount = selectedPlacementIds.length;
  
  return (
    <div className="absolute bottom-0 left-0 right-0 h-8 bg-deep/95 border-t border-border flex items-center justify-between px-4 text-xs text-text-secondary">
      <div className="flex items-center gap-4">
        {/* Coordinates */}
        <div className="flex items-center gap-2">
          <span className="text-text-muted">Position:</span>
          {mouseCoords ? (
            <span className="font-mono text-text-primary">
              Pixel: ({Math.round(mouseCoords.x)}, {Math.round(mouseCoords.y)})
              {unrealCoords && (
                <> | Unreal: ({Math.round(unrealCoords.x)}, {Math.round(unrealCoords.y)})</>
              )}
            </span>
          ) : (
            <span className="text-text-muted">Hover over map</span>
          )}
        </div>
        
        {/* Zoom */}
        <div className="flex items-center gap-2">
          <span className="text-text-muted">Zoom:</span>
          <span className="font-mono text-text-primary">{zoomPercent}%</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Selection count */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-text-muted">Selected:</span>
            <span className="font-mono text-text-primary">{selectedCount}</span>
          </div>
        )}
        
        {/* Grid status */}
        <div className="flex items-center gap-2">
          <span className="text-text-muted">Grid:</span>
          <span className={showGrid ? "text-moss-glow" : "text-text-muted"}>
            {showGrid ? "ON" : "OFF"}
          </span>
          {showGrid && (
            <>
              <span className="text-text-muted">|</span>
              <span className="text-text-muted">Size: {gridSize}px</span>
            </>
          )}
        </div>
        
        {/* Snap status */}
        {showGrid && (
          <div className="flex items-center gap-2">
            <span className="text-text-muted">Snap:</span>
            <span className={snapToGrid ? "text-moss-glow" : "text-text-muted"}>
              {snapToGrid ? "ON" : "OFF"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

