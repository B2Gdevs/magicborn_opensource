// lib/utils/coordinateSystem.ts
// Core coordinate system math for map editor
// Maps between pixel coordinates, grid cells, zones, and Unreal units

import { PrecisionLevel, MapLevel } from "@core/mapEnums";

/**
 * Map coordinate system configuration
 */
export interface CoordinateSystemConfig {
  imageWidth: number;      // Pixel width of reference image
  imageHeight: number;     // Pixel height of reference image
  unrealWidth: number;     // Width in Unreal units (e.g., 12000 for 12km)
  unrealHeight: number;    // Height in Unreal units (e.g., 12000 for 12km)
  baseCellSize: number;    // Base cell size in pixels (e.g., 10)
  zoneSize: number;        // Zone size in cells (e.g., 10 cells = 1 zone)
}

/**
 * Pixel coordinates
 */
export interface PixelCoordinates {
  x: number;
  y: number;
}

/**
 * Cell coordinates (grid-based)
 */
export interface CellCoordinates {
  cellX: number;
  cellY: number;
}

/**
 * Zone coordinates (large area)
 */
export interface ZoneCoordinates {
  zoneX: number;
  zoneY: number;
  zoneWidth: number;
  zoneHeight: number;
}

/**
 * Unreal unit coordinates
 */
export interface UnrealCoordinates {
  x: number;
  y: number;
  z?: number;
}

/**
 * Convert pixel coordinates to Unreal units
 * 
 * CRITICAL: This is the ONLY conversion point. All downstream systems
 * (Three.js, Unreal Engine) use Unreal units directly - no further conversion.
 * 
 * @param pixel - Pixel coordinates from 2D map image
 * @param config - Coordinate system configuration
 * @returns Unreal unit coordinates (used directly by Three.js and Unreal)
 */
export function pixelToUnreal(
  pixel: PixelCoordinates,
  config: CoordinateSystemConfig
): UnrealCoordinates {
  const scaleX = config.unrealWidth / config.imageWidth;
  const scaleY = config.unrealHeight / config.imageHeight;
  
  return {
    x: pixel.x * scaleX,
    y: pixel.y * scaleY,
  };
}

/**
 * Convert Unreal units to pixel coordinates
 * 
 * NOTE: This is for display/editing purposes only. The source of truth
 * is always Unreal units. Three.js and Unreal Engine use Unreal units directly.
 * 
 * @param unreal - Unreal unit coordinates (from database/export)
 * @param config - Coordinate system configuration
 * @returns Pixel coordinates (for 2D map editor display only)
 */
export function unrealToPixel(
  unreal: UnrealCoordinates,
  config: CoordinateSystemConfig
): PixelCoordinates {
  const scaleX = config.imageWidth / config.unrealWidth;
  const scaleY = config.imageHeight / config.unrealHeight;
  
  return {
    x: unreal.x * scaleX,
    y: unreal.y * scaleY,
  };
}

/**
 * Get cell coordinates from pixel coordinates
 * Note: Cells are absolute - zoom doesn't affect cell size, only display
 */
export function pixelToCell(
  pixel: PixelCoordinates,
  config: CoordinateSystemConfig,
  zoom: number = 1
): CellCoordinates {
  // Cell size is always baseCellSize - zoom only affects visual display
  const cellSize = config.baseCellSize;
  return {
    cellX: Math.floor(pixel.x / cellSize),
    cellY: Math.floor(pixel.y / cellSize),
  };
}

/**
 * Get pixel coordinates from cell coordinates
 * Note: Cells are absolute - zoom only affects display, not cell positions
 */
export function cellToPixel(
  cell: CellCoordinates,
  config: CoordinateSystemConfig,
  zoom: number = 1
): PixelCoordinates {
  // Cell size is always based on baseCellSize - zoom only affects visual display
  const cellSize = config.baseCellSize;
  return {
    x: cell.cellX * cellSize,
    y: cell.cellY * cellSize,
  };
}

/**
 * Get zone coordinates from cell coordinates
 */
export function cellToZone(
  cell: CellCoordinates,
  config: CoordinateSystemConfig
): ZoneCoordinates {
  return {
    zoneX: Math.floor(cell.cellX / config.zoneSize),
    zoneY: Math.floor(cell.cellY / config.zoneSize),
    zoneWidth: config.zoneSize,
    zoneHeight: config.zoneSize,
  };
}

/**
 * Get cell coordinates from zone coordinates
 */
export function zoneToCell(
  zone: ZoneCoordinates,
  config: CoordinateSystemConfig
): CellCoordinates {
  return {
    cellX: zone.zoneX * config.zoneSize,
    cellY: zone.zoneY * config.zoneSize,
  };
}

/**
 * Calculate Unreal unit size for a given precision level
 */
export function getUnrealSizeForPrecision(
  precision: PrecisionLevel,
  config: CoordinateSystemConfig,
  zoom: number = 1
): { width: number; height: number } {
  const pixelScaleX = config.unrealWidth / config.imageWidth;
  const pixelScaleY = config.unrealHeight / config.imageHeight;
  
  switch (precision) {
    case PrecisionLevel.Zone: {
      const zoneSizePixels = config.baseCellSize * config.zoneSize;
      return {
        width: zoneSizePixels * pixelScaleX,
        height: zoneSizePixels * pixelScaleY,
      };
    }
    case PrecisionLevel.Cell: {
      const cellSizePixels = config.baseCellSize / zoom;
      return {
        width: cellSizePixels * pixelScaleX,
        height: cellSizePixels * pixelScaleY,
      };
    }
    case PrecisionLevel.Pixel: {
      return {
        width: pixelScaleX,
        height: pixelScaleY,
      };
    }
    case PrecisionLevel.UnrealDirect: {
      return { width: 0, height: 0 }; // Direct coordinates, no size
    }
  }
}

/**
 * Check if precision is appropriate for item size
 */
export function isPrecisionAppropriate(
  precision: PrecisionLevel,
  itemSizeInUnreal: { width: number; height: number },
  config: CoordinateSystemConfig,
  zoom: number = 1
): { appropriate: boolean; warning?: string } {
  const precisionSize = getUnrealSizeForPrecision(precision, config, zoom);
  
  // If item is smaller than precision size, warn
  if (itemSizeInUnreal.width < precisionSize.width || 
      itemSizeInUnreal.height < precisionSize.height) {
    return {
      appropriate: false,
      warning: `Item size (${itemSizeInUnreal.width.toFixed(1)}m x ${itemSizeInUnreal.height.toFixed(1)}m) is smaller than precision size (${precisionSize.width.toFixed(1)}m x ${precisionSize.height.toFixed(1)}m). Consider using higher precision or Unreal Direct coordinates.`,
    };
  }
  
  return { appropriate: true };
}

/**
 * Detect map level from coordinate configuration
 */
export function detectMapLevel(config: CoordinateSystemConfig): MapLevel {
  // Detect based on unreal size and cell size
  if (config.unrealWidth >= 10000) return MapLevel.World;
  if (config.unrealWidth >= 1000) return MapLevel.Town;
  if (config.unrealWidth >= 200) return MapLevel.Interior;
  return MapLevel.SmallInterior;
}

/**
 * Get standard coordinate system config for a map level
 */
export function getStandardConfig(
  level: MapLevel,
  imageWidth?: number,
  imageHeight?: number
): CoordinateSystemConfig {
  const standards: Record<MapLevel, Omit<CoordinateSystemConfig, "imageWidth" | "imageHeight">> = {
    [MapLevel.World]: {
      unrealWidth: 12000,  // 12km
      unrealHeight: 12000,
      baseCellSize: 16,    // 16 pixels per cell
      zoneSize: 16,        // 16 cells per zone
    },
    [MapLevel.Town]: {
      unrealWidth: 2000,   // 2km
      unrealHeight: 2000,
      baseCellSize: 10,    // 10 pixels per cell
      zoneSize: 10,        // 10 cells per zone
    },
    [MapLevel.Interior]: {
      unrealWidth: 500,    // 500m
      unrealHeight: 500,
      baseCellSize: 8,     // 8 pixels per cell
      zoneSize: 8,         // 8 cells per zone
    },
    [MapLevel.SmallInterior]: {
      unrealWidth: 100,    // 100m
      unrealHeight: 100,
      baseCellSize: 5,     // 5 pixels per cell
      zoneSize: 5,         // 5 cells per zone
    },
  };
  
  const standard = standards[level];
  const defaultImageSize: Record<MapLevel, { width: number; height: number }> = {
    [MapLevel.World]: { width: 4096, height: 4096 },
    [MapLevel.Town]: { width: 2048, height: 2048 },
    [MapLevel.Interior]: { width: 1024, height: 1024 },
    [MapLevel.SmallInterior]: { width: 512, height: 512 },
  };
  
  const defaultSize = defaultImageSize[level];
  
  return {
    imageWidth: imageWidth || defaultSize.width,
    imageHeight: imageHeight || defaultSize.height,
    ...standard,
  };
}

/**
 * Get default coordinate system config for a map
 * @deprecated Use getStandardConfig() with MapLevel instead
 */
export function getDefaultCoordinateConfig(
  imageWidth: number,
  imageHeight: number,
  unrealSizeKm: number = 12
): CoordinateSystemConfig {
  const unrealSize = unrealSizeKm * 1000; // Convert km to meters (Unreal units)
  
  return {
    imageWidth,
    imageHeight,
    unrealWidth: unrealSize,
    unrealHeight: unrealSize,
    baseCellSize: 10, // 10 pixels per cell at zoom 1
    zoneSize: 10,     // 10 cells per zone
  };
}

