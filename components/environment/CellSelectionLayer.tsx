// components/environment/CellSelectionLayer.tsx
// Renders selected cells and persistent regions with unique colors

"use client";

import { useMemo } from "react";
import { Rect } from "react-konva";
import { useMapEditorStore } from "@/lib/store/mapEditorStore";
import { cellToPixel } from "@/lib/utils/coordinateSystem";
import { isCellOnBoundary, hslToRgba } from "@/lib/data/mapRegions";
import type { CellCoordinates } from "@/lib/utils/coordinateSystem";
import type { MapRegion } from "@/lib/data/mapRegions";

interface CellSelectionLayerProps {
  zoom: number;
  actualImageWidth?: number;
  actualImageHeight?: number;
}

export function CellSelectionLayer({ zoom, actualImageWidth, actualImageHeight }: CellSelectionLayerProps) {
  const { selectedCellBounds, getSelectedCells, selectedMap, selectionMode, regions, selectedRegionId, showRegions } = useMapEditorStore();
  
  // Get selected cells array from bounds
  const selectedCells = useMemo(() => getSelectedCells(), [selectedCellBounds, getSelectedCells]);

  if (!selectedMap) return null;

  const config = selectedMap.coordinateConfig;
  // Use config dimensions for rendering
  const imageWidth = config.imageWidth;
  const imageHeight = config.imageHeight;
  // Cell size is absolute - zoom only affects visual scale, not cell size
  const cellSize = config.baseCellSize;
  
  // Calculate max cells based on config (what we render)
  const maxCellsX = Math.floor(imageWidth / config.baseCellSize);
  const maxCellsY = Math.floor(imageHeight / config.baseCellSize);
  
  // Calculate actual image cells (for validation/clipping) - use actual image if provided
  const actualMaxCellsX = actualImageWidth ? Math.floor(actualImageWidth / config.baseCellSize) : maxCellsX;
  const actualMaxCellsY = actualImageHeight ? Math.floor(actualImageHeight / config.baseCellSize) : maxCellsY;

  // Check if a region is the base region (covers entire map and has no overrides)
  const isBaseRegion = (region: typeof regions[0]): boolean => {
    if (!selectedMap) return false;
    // Base region is always named "Base Region"
    const isBaseRegionName = region.name === "Base Region";
    const hasNoOverrides = !region.metadata?.biome && !region.metadata?.climate && region.metadata?.dangerLevel === undefined;
    // Also check if it covers all expected cells (base region should cover all config cells)
    const configCellsX = Math.floor(config.imageWidth / config.baseCellSize);
    const configCellsY = Math.floor(config.imageHeight / config.baseCellSize);
    const expectedCellCount = configCellsX * configCellsY;
    const coversAllCells = region.cells.length >= (expectedCellCount * 0.9); // Allow some tolerance
    return isBaseRegionName && hasNoOverrides && coversAllCells;
  };

  // Render persistent regions (each with unique color)
  // Show regions at all zoom levels - they scale with zoom
  const regionRects = useMemo(() => {
    // Don't render regions if visibility is off
    if (!showRegions) return [];
    
    const rects: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      fill: string;
      stroke: string;
      regionId: string;
      isSelected: boolean;
      isBoundary: boolean;
    }> = [];

    regions
      .filter((r) => r.mapId === selectedMap.id)
      .forEach((region) => {
        const isSelected = region.id === selectedRegionId;
        const isBase = isBaseRegion(region);
        
        // Only render base region when it's selected - don't render it when deselected
        // This prevents the orange tint on the grid
        if (isBase && !isSelected) {
          return; // Skip rendering base region when not selected
        }
        
        region.cells.forEach((cell) => {
          // Filter out cells that are beyond actual image bounds (if image is smaller than config)
          if (cell.cellX >= actualMaxCellsX || cell.cellY >= actualMaxCellsY) {
            return;
          }
          
          const pixel = cellToPixel(cell, config); // Cells are absolute, zoom doesn't affect position
          // Create a full MapRegion object for boundary check (store region has optional metadata)
          const fullRegion: MapRegion = {
            id: region.id,
            mapId: region.mapId,
            name: region.name,
            cells: region.cells,
            color: region.color,
            metadata: region.metadata || {
              // Default empty metadata - will be populated when environment properties form is added
            },
          };
          const isBoundary = isCellOnBoundary(cell, fullRegion);

          // Base region gets subtle styling, other regions more visible
          const opacity = isBase ? 0.1 : (isSelected ? 0.5 : 0.3);
          const strokeOpacity = isBase ? 0.2 : (isBoundary ? 1.0 : 0.7);

          // Cell size scales with zoom for visual display (but we're at 100% so it's just cellSize)
          const displayCellSize = cellSize * zoom;

          rects.push({
            x: pixel.x * zoom, // Scale position with zoom
            y: pixel.y * zoom,
            width: displayCellSize,
            height: displayCellSize,
            fill: hslToRgba(region.color, opacity),
            stroke: hslToRgba(region.color, strokeOpacity),
            regionId: region.id,
            isSelected,
            isBoundary,
          });
        });
      });

    return rects;
  }, [regions, selectedMap, selectedRegionId, config, zoom, cellSize, actualMaxCellsX, actualMaxCellsY, showRegions]);

  // Render temporary selection (blue, only when actively selecting and NOT a region)
  // Only show at 100% zoom
  const tempSelectionRects = useMemo(() => {
    if (selectionMode !== "cell" || selectedCells.length === 0) {
      return [];
    }

    // Only show selection at 100% zoom (allow small tolerance for floating point)
    if (Math.abs(zoom - 1.0) > 0.01) {
      return [];
    }

    // Don't show temp selection if we're viewing a selected region
    // Also check if the selected cells match an existing region - if so, don't show temp selection
    if (selectedRegionId) {
      return [];
    }
    
    // Check if selected cells match an existing region - if so, don't show temp selection
    const matchesRegion = regions
      .filter((r) => r.mapId === selectedMap.id)
      .some((region) => {
        // Check if all selected cells are in this region
        const regionCellSet = new Set(region.cells.map(c => `${c.cellX},${c.cellY}`));
        return selectedCells.every(sc => regionCellSet.has(`${sc.cellX},${sc.cellY}`));
      });
    
    if (matchesRegion) {
      return [];
    }

    return selectedCells
      .filter((cell) => {
        // Filter out cells beyond actual image bounds (if image is smaller than config)
        return cell.cellX < actualMaxCellsX && cell.cellY < actualMaxCellsY;
      })
      .map((cell) => {
        const pixel = cellToPixel(cell, config); // Cells are absolute
        const displayCellSize = cellSize * zoom; // Scale for display
        return {
          x: pixel.x * zoom, // Scale position with zoom
          y: pixel.y * zoom,
          width: displayCellSize,
          height: displayCellSize,
          cellX: cell.cellX,
          cellY: cell.cellY,
        };
      });
  }, [selectedCells, selectionMode, selectedRegionId, regions, selectedMap.id, config, zoom, cellSize, actualMaxCellsX, actualMaxCellsY]);

  return (
    <>
      {/* Render persistent regions */}
      {regionRects.map((rect, index) => (
        <Rect
          key={`region-${rect.regionId}-${index}`}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          fill={rect.fill}
          stroke={rect.stroke}
          strokeWidth={rect.isBoundary ? 2 : 1}
          listening={false}
        />
      ))}

      {/* Render temporary selection */}
      {tempSelectionRects.map((rect, index) => (
        <Rect
          key={`temp-${rect.cellX}-${rect.cellY}-${index}`}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          fill="rgba(59, 130, 246, 0.3)" // Blue for temporary selection
          stroke="rgba(59, 130, 246, 0.8)"
          strokeWidth={1}
          listening={false}
        />
      ))}
    </>
  );
}

