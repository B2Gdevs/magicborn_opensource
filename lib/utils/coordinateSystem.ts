// lib/utils/coordinateSystem.ts
// Core coordinate system math for map editor
// Maps between pixel coordinates, grid cells, zones, and Unreal units

import { PrecisionLevel } from "@core/mapEnums";

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
 */
export function pixelToCell(
  pixel: PixelCoordinates,
  config: CoordinateSystemConfig,
  zoom: number = 1
): CellCoordinates {
  const cellSize = config.baseCellSize / zoom;
  return {
    cellX: Math.floor(pixel.x / cellSize),
    cellY: Math.floor(pixel.y / cellSize),
  };
}

/**
 * Get pixel coordinates from cell coordinates
 */
export function cellToPixel(
  cell: CellCoordinates,
  config: CoordinateSystemConfig,
  zoom: number = 1
): PixelCoordinates {
  const cellSize = config.baseCellSize / zoom;
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
 * Get default coordinate system config for a map
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

