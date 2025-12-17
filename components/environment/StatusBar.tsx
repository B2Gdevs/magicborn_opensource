// components/environment/StatusBar.tsx
// Professional status bar showing coordinates, zoom, selection count, etc.

"use client";

import { useMemo } from "react";
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
    selectedCellBounds,
    getSelectedCells,
    selectionMode,
    regions,
    selectedRegionId,
    showGrid,
    snapToGrid,
    gridSize,
    selectedMap,
  } = useMapEditorStore();
  
  const selectedCells = useMemo(() => getSelectedCells(), [selectedCellBounds, getSelectedCells]);
  
  const currentMapRegions = regions.filter((r) => r.mapId === selectedMap?.id);
  
  // Calculate Unreal coordinates from pixel coordinates
  const unrealCoords = mouseCoords && selectedMap?.coordinateConfig
    ? pixelToUnreal(mouseCoords, selectedMap.coordinateConfig)
    : null;
  
  // Calculate cell coordinates from pixel coordinates
  // Cells are absolute - zoom doesn't affect cell size
  const cellCoords = mouseCoords && selectedMap?.coordinateConfig
    ? (() => {
        const cellSize = selectedMap.coordinateConfig.baseCellSize;
        return {
          cellX: Math.floor(mouseCoords.x / cellSize),
          cellY: Math.floor(mouseCoords.y / cellSize),
        };
      })()
    : null;
  
  const zoomPercent = Math.round(zoom * 100);
  const selectedPlacementCount = selectedPlacementIds.length;
  const selectedCellCount = selectedCells.length;
  
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
              {cellCoords && (
                <> | Cell: ({cellCoords.cellX}, {cellCoords.cellY})</>
              )}
            </span>
          ) : (
            <span className="text-text-muted">Hover over map</span>
          )}
        </div>
        
        {/* Selection mode with color coding */}
        <div className="flex items-center gap-2">
          <span className="text-text-muted">Mode:</span>
          <span
            className={`font-semibold px-2 py-0.5 rounded ${
              selectionMode === "cell"
                ? "text-blue-400 bg-blue-400/20 border border-blue-400/40"
                : "text-ember-glow bg-ember-glow/20 border border-ember-glow/40"
            }`}
          >
            {selectionMode === "cell" ? "Cell Selection" : "Placement"}
          </span>
        </div>
        
        {/* Zoom */}
        <div className="flex items-center gap-2">
          <span className="text-text-muted">Zoom:</span>
          <span className="font-mono text-text-primary">{zoomPercent}%</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Selection count */}
        {selectionMode === "placement" && selectedPlacementCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-text-muted">Placements:</span>
            <span className="font-mono text-text-primary">{selectedPlacementCount}</span>
          </div>
        )}
        {selectionMode === "cell" && (
          <>
            {selectedCellCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-text-muted">Cells:</span>
                <span className="font-mono text-blue-400">{selectedCellCount}</span>
              </div>
            )}
            {currentMapRegions.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-text-muted">Regions:</span>
                <span className="font-mono text-text-primary">{currentMapRegions.length}</span>
              </div>
            )}
          </>
        )}
        
        {/* Grid status */}
        <div className="flex items-center gap-2">
          <span className="text-text-muted">Grid:</span>
          <span className={showGrid ? "text-moss-glow" : "text-text-muted"}>
            {showGrid ? "ON" : "OFF"}
          </span>
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

