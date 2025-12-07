// components/environment/CellSelectionLayer.tsx
// Renders selected cells and persistent regions with unique colors

"use client";

import { useMemo } from "react";
import { Rect } from "react-konva";
import { useMapEditorStore } from "@/lib/store/mapEditorStore";
import { cellToPixel } from "@/lib/utils/coordinateSystem";
import { isCellOnBoundary, hslToRgba } from "@/lib/data/mapRegions";
import type { CellCoordinates } from "@/lib/utils/coordinateSystem";

interface CellSelectionLayerProps {
  zoom: number;
}

export function CellSelectionLayer({ zoom }: CellSelectionLayerProps) {
  const { selectedCells, selectedMap, selectionMode, regions, selectedRegionId } = useMapEditorStore();

  if (!selectedMap) return null;

  const config = selectedMap.coordinateConfig;
  const cellSize = config.baseCellSize / zoom;

  // Render persistent regions (each with unique color)
  const regionRects = useMemo(() => {
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
        
        region.cells.forEach((cell) => {
          const pixel = cellToPixel(cell, config, zoom);
          const isBoundary = isCellOnBoundary(cell, {
            id: region.id,
            mapId: region.mapId,
            name: region.name,
            cells: region.cells,
            color: region.color,
          });

          rects.push({
            x: pixel.x,
            y: pixel.y,
            width: cellSize,
            height: cellSize,
            fill: isSelected
              ? hslToRgba(region.color, 0.4) // More opaque when selected
              : hslToRgba(region.color, 0.2), // Less opaque when not selected
            stroke: isBoundary
              ? region.color // Full color on boundary
              : hslToRgba(region.color, 0.6), // Lighter on interior
            regionId: region.id,
            isSelected,
            isBoundary,
          });
        });
      });

    return rects;
  }, [regions, selectedMap.id, selectedRegionId, config, zoom, cellSize]);

  // Render temporary selection (blue, only when actively selecting and NOT a region)
  const tempSelectionRects = useMemo(() => {
    if (selectionMode !== "cell" || selectedCells.length === 0) {
      return [];
    }

    // Don't show temp selection if we're viewing a selected region
    if (selectedRegionId) {
      return [];
    }

    // Check if selected cells match an existing region
    const matchesRegion = regions
      .filter((r) => r.mapId === selectedMap.id)
      .some((region) => {
        if (region.cells.length !== selectedCells.length) return false;
        return region.cells.every((rc) =>
          selectedCells.some((sc) => sc.cellX === rc.cellX && sc.cellY === rc.cellY)
        );
      });

    // Don't show temp selection if it matches an existing region
    if (matchesRegion) {
      return [];
    }

    return selectedCells.map((cell) => {
      const pixel = cellToPixel(cell, config, zoom);
      return {
        x: pixel.x,
        y: pixel.y,
        width: cellSize,
        height: cellSize,
        cellX: cell.cellX,
        cellY: cell.cellY,
      };
    });
  }, [selectedCells, selectionMode, selectedRegionId, regions, selectedMap.id, config, zoom, cellSize]);

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

