// lib/utils/cellSizeCalculator.ts
// Calculate cell sizes in Unreal units (meters) for hierarchical maps

import type { CoordinateSystemConfig } from "./coordinateSystem";

/**
 * Calculate the size of a single cell in Unreal units (meters)
 * This is the source of truth for cell size - images are just visual reference
 */
export function getCellSizeInUnrealMeters(config: CoordinateSystemConfig): {
  width: number; // meters
  height: number; // meters
} {
  // Calculate Unreal units per pixel
  const unrealUnitsPerPixelX = config.unrealWidth / config.imageWidth;
  const unrealUnitsPerPixelY = config.unrealHeight / config.imageHeight;
  
  // Cell size in pixels is baseCellSize
  // Cell size in Unreal units = baseCellSize * unrealUnitsPerPixel
  return {
    width: config.baseCellSize * unrealUnitsPerPixelX,
    height: config.baseCellSize * unrealUnitsPerPixelY,
  };
}

/**
 * Calculate the total number of cells for a map configuration
 * This is ALWAYS fixed regardless of image size - images are just stretched to fit
 */
export function getTotalCells(config: CoordinateSystemConfig): {
  cellsX: number;
  cellsY: number;
  total: number;
} {
  const cellsX = Math.floor(config.imageWidth / config.baseCellSize);
  const cellsY = Math.floor(config.imageHeight / config.baseCellSize);
  return {
    cellsX,
    cellsY,
    total: cellsX * cellsY,
  };
}

/**
 * Calculate nested map configuration from parent region
 * Nested maps get more granular (smaller Unreal units per cell)
 * 
 * @param parentConfig - Parent map's coordinate config
 * @param parentRegionCells - Cells that define the parent region
 * @param nestedMapLevel - Map level for the nested map (determines granularity)
 * @param imageWidth - Optional image width (will be stretched to fit config)
 * @param imageHeight - Optional image height (will be stretched to fit config)
 */
export function calculateNestedMapConfig(
  parentConfig: CoordinateSystemConfig,
  parentRegionCells: Array<{ cellX: number; cellY: number }>,
  nestedMapLevel: "world" | "town" | "interior" | "smallInterior",
  imageWidth?: number,
  imageHeight?: number
): CoordinateSystemConfig {
  // Calculate the Unreal size of the parent region
  const parentCellSize = getCellSizeInUnrealMeters(parentConfig);
  
  // Find bounds of parent region
  const minX = Math.min(...parentRegionCells.map(c => c.cellX));
  const maxX = Math.max(...parentRegionCells.map(c => c.cellX));
  const minY = Math.min(...parentRegionCells.map(c => c.cellY));
  const maxY = Math.max(...parentRegionCells.map(c => c.cellY));
  
  const regionCellsX = maxX - minX + 1;
  const regionCellsY = maxY - minY + 1;
  
  // Calculate Unreal size of the parent region
  const regionUnrealWidth = regionCellsX * parentCellSize.width;
  const regionUnrealHeight = regionCellsY * parentCellSize.height;
  
  // Determine nested map configuration based on level
  // Nested maps should be more granular (smaller Unreal units per cell)
  const nestedConfigs = {
    world: {
      baseCellSize: 16,
      zoneSize: 16,
      defaultImageSize: { width: 4096, height: 4096 },
    },
    town: {
      baseCellSize: 10,
      zoneSize: 10,
      defaultImageSize: { width: 2048, height: 2048 },
    },
    interior: {
      baseCellSize: 8,
      zoneSize: 8,
      defaultImageSize: { width: 1024, height: 1024 },
    },
    smallInterior: {
      baseCellSize: 5,
      zoneSize: 5,
      defaultImageSize: { width: 512, height: 512 },
    },
  };
  
  const nestedConfig = nestedConfigs[nestedMapLevel];
  const defaultSize = nestedConfig.defaultImageSize;
  
  // The nested map's Unreal size should match the parent region's size
  // But with more granular cells (smaller Unreal units per cell)
  return {
    imageWidth: imageWidth || defaultSize.width,
    imageHeight: imageHeight || defaultSize.height,
    unrealWidth: regionUnrealWidth,  // Match parent region's Unreal size
    unrealHeight: regionUnrealHeight, // Match parent region's Unreal size
    baseCellSize: nestedConfig.baseCellSize,
    zoneSize: nestedConfig.zoneSize,
  };
}

/**
 * Get cell size in meters for display/calculation
 * This is the primary metric - pixels are just for visual reference
 */
export function formatCellSizeInMeters(config: CoordinateSystemConfig): string {
  const cellSize = getCellSizeInUnrealMeters(config);
  const avgSize = (cellSize.width + cellSize.height) / 2;
  
  if (avgSize >= 1000) {
    return `${(avgSize / 1000).toFixed(2)}km`;
  } else if (avgSize >= 1) {
    return `${avgSize.toFixed(2)}m`;
  } else {
    return `${(avgSize * 100).toFixed(0)}cm`;
  }
}


