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
  const { selectedCellBounds, getSelectedCells, selectedMap, selectionMode, regions, selectedRegionId, visibleRegionIds } = useMapEditorStore();
  
  // Get selected cells array from bounds
  const selectedCells = useMemo(() => getSelectedCells(), [selectedCellBounds, getSelectedCells]);

  // Early return if no map - but return empty fragment, not null
  // Returning null can cause Konva issues
  if (!selectedMap) {
    console.log("[CellSelectionLayer] No selectedMap, returning empty fragment");
    return <></>;
  }

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

  // Find the base region - the region referenced by the map's baseRegionId
  // The base region is the one that "owns" the map we're editing
  // When a map is loaded, the region with id === map.baseRegionId becomes the base region
  // For editing purposes, we call it "base region" but it keeps its original name and ID
  const baseRegion = useMemo(() => {
    if (!selectedMap || !selectedMap.baseRegionId) return null;
    // Find the region with id matching the map's baseRegionId
    // This is the region that "owns" this map - when we load this map, this region becomes the base
    return regions.find(r => r.id === selectedMap.baseRegionId) || null;
  }, [regions, selectedMap]);

  // Check if a region is the base region
  // If baseRegion is null (map has no baseRegionId or region not loaded), no region is considered base
  const isBaseRegion = (region: typeof regions[0]): boolean => {
    if (!baseRegion || !selectedMap?.baseRegionId) return false;
    return baseRegion.id === region.id;
  };

  // Render persistent regions (each with unique color)
  // Show regions at all zoom levels - they scale with zoom
  const regionRects = useMemo(() => {
    console.log("[CellSelectionLayer] Computing regionRects:", {
      hasSelectedMap: !!selectedMap,
      hasBaseRegion: !!baseRegion,
      regionsCount: regions.length,
      visibleRegionIdsCount: visibleRegionIds.size
    });
    
    if (!selectedMap) {
      console.log("[CellSelectionLayer] Missing selectedMap, returning empty array");
      return [];
    }
    
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

    // Show all regions on this map except the base region
    // The base region is the one referenced by map.baseRegionId
    regions
      .filter((r) => {
        // Must be on the current map
        if (r.mapId !== selectedMap.id) return false;
        
        // NEVER render base region - it should always be hidden
        // Base region represents the entire map being edited, not a visible region
        if (isBaseRegion(r)) return false;
        
        // Only render if visible (checked in visibility controls)
        if (!visibleRegionIds.has(r.id)) return false;
        
        return true;
      })
      .forEach((region) => {
        const isSelected = region.id === selectedRegionId;
        
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

          // Child regions get different opacity based on selection state
          // Base region is never rendered (filtered out above)
          const opacity = isSelected ? 0.5 : 0.3;  // Selected: 50%, Normal: 30%
          const strokeOpacity = isBoundary ? 1.0 : 0.7;  // Boundary: 100%, Interior: 70%

          // Cell size is absolute - Konva Stage handles zoom transformation
          // Don't scale manually, let Konva's scaleX/scaleY handle it
          rects.push({
            x: pixel.x, // Absolute position - Konva will scale
            y: pixel.y, // Absolute position - Konva will scale
            width: cellSize, // Absolute size - Konva will scale
            height: cellSize, // Absolute size - Konva will scale
            fill: hslToRgba(region.color, opacity),
            stroke: hslToRgba(region.color, strokeOpacity),
            regionId: region.id,
            isSelected,
            isBoundary,
          });
        });
      });

    console.log("[CellSelectionLayer] Computed", rects.length, "region rects");
    return rects;
  }, [regions, selectedMap, selectedRegionId, config, cellSize, actualMaxCellsX, actualMaxCellsY, visibleRegionIds, baseRegion]);

  // Render temporary selection (blue, only when actively selecting and NOT a region)
  // Show at all zoom levels - Konva Stage handles scaling
  const tempSelectionRects = useMemo(() => {
    if (selectionMode !== "cell" || selectedCells.length === 0) {
      return [];
    }

    // Show selection at all zoom levels - Konva Stage scales it automatically

    // Don't show temp selection if we're viewing a selected region
    // Also check if the selected cells match an existing region - if so, don't show temp selection
    if (selectedRegionId) {
      return [];
    }
    
    // Check if selected cells match an existing region - if so, don't show temp selection
    if (!selectedMap) return [];
    
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
        // Don't scale manually - Konva Stage handles zoom transformation
        return {
          x: pixel.x, // Absolute position - Konva will scale
          y: pixel.y, // Absolute position - Konva will scale
          width: cellSize, // Absolute size - Konva will scale
          height: cellSize, // Absolute size - Konva will scale
          cellX: cell.cellX,
          cellY: cell.cellY,
        };
      });
  }, [selectedCells, selectionMode, selectedRegionId, regions, selectedMap?.id, config, cellSize, actualMaxCellsX, actualMaxCellsY]);
  
  console.log("[CellSelectionLayer] Rendering with", regionRects.length, "region rects and", tempSelectionRects.length, "temp selection rects");

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

