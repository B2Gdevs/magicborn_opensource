// lib/utils/mapCompletion.ts
// Calculate map completion percentage compared to Elden Ring

import type { MapDefinition } from "@/lib/data/maps";
import type { MapRegion } from "@/lib/data/mapRegions";
import type { MapPlacement } from "@/lib/data/mapPlacements";
import { detectMapLevel } from "./coordinateSystem";
import { MapLevel } from "@core/mapEnums";

/**
 * Elden Ring reference sizes
 */
const ELDEN_RING_WORLD_SIZE = {
  totalArea: 79, // km²
  totalCells: 256 * 256, // Estimated cell count (assuming 12km × 12km with 16px cells)
};

/**
 * Calculate completion percentage for a map
 */
export interface MapCompletionResult {
  totalCells: number;
  regionsWithContent: number;
  totalRegions: number;
  cellsWithContent: number;
  completionPercentage: number;
  eldenRingComparison: {
    eldenRingCells: number;
    ourCells: number;
    percentage: number;
  };
}

export function calculateMapCompletion(
  map: MapDefinition,
  regions: MapRegion[],
  placements: MapPlacement[]
): MapCompletionResult {
  const config = map.coordinateConfig;
  const totalCellsX = Math.floor(config.imageWidth / config.baseCellSize);
  const totalCellsY = Math.floor(config.imageHeight / config.baseCellSize);
  const totalCells = totalCellsX * totalCellsY;
  
  // Count cells that have content (regions or placements)
  // Regions are squares, so calculate cells from minX, minY, width, height
  const cellsWithRegions = new Set<string>();
  regions.forEach((region) => {
    for (let y = region.minY; y < region.minY + region.height; y++) {
      for (let x = region.minX; x < region.minX + region.width; x++) {
        cellsWithRegions.add(`${x},${y}`);
      }
    }
  });
  
  // Count cells with placements (approximate - placements might not cover full cells)
  const cellsWithPlacements = new Set<string>();
  placements.forEach((placement) => {
    if (placement.coordinates && typeof placement.coordinates === 'object') {
      if ('cellX' in placement.coordinates) {
        const cell = placement.coordinates as { cellX: number; cellY: number };
        cellsWithPlacements.add(`${cell.cellX},${cell.cellY}`);
      }
    }
  });
  
  // Combine cells with content
  const allCellsWithContent = new Set([
    ...Array.from(cellsWithRegions),
    ...Array.from(cellsWithPlacements),
  ]);
  
  const cellsWithContent = allCellsWithContent.size;
  const completionPercentage = (cellsWithContent / totalCells) * 100;
  
  // Elden Ring comparison (only for world maps)
  const mapLevel = detectMapLevel(config);
  const eldenRingComparison = mapLevel === MapLevel.World
    ? {
        eldenRingCells: ELDEN_RING_WORLD_SIZE.totalCells,
        ourCells: totalCells,
        percentage: (totalCells / ELDEN_RING_WORLD_SIZE.totalCells) * 100,
      }
    : {
        eldenRingCells: 0,
        ourCells: totalCells,
        percentage: 0,
      };
  
  return {
    totalCells,
    regionsWithContent: regions.length,
    totalRegions: regions.length,
    cellsWithContent,
    completionPercentage,
    eldenRingComparison,
  };
}


