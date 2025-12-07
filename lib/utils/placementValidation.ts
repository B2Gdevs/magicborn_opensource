// lib/utils/placementValidation.ts
// Validation utilities for map placements to ensure proper sizing

import { PrecisionLevel, MapLevel } from "@core/mapEnums";
import type { MapPlacement } from "@/lib/data/mapPlacements";
import type { CoordinateSystemConfig } from "./coordinateSystem";
import { 
  detectMapLevel, 
  getUnrealSizeForPrecision 
} from "./coordinateSystem";

/**
 * Validation result for placement size
 */
export interface PlacementValidationResult {
  valid: boolean;
  warnings: string[];
  recommendations: string[];
}

/**
 * Validate placement size against map configuration
 */
export function validatePlacementSize(
  placement: MapPlacement,
  mapConfig: CoordinateSystemConfig
): PlacementValidationResult {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  const mapLevel = detectMapLevel(mapConfig);
  const cellSize = getUnrealSizeForPrecision(PrecisionLevel.Cell, mapConfig);
  const zoneSize = getUnrealSizeForPrecision(PrecisionLevel.Zone, mapConfig);
  
  // Get item size from metadata if available
  const itemSize = placement.metadata?.sizeInUnreal as 
    | { width: number; height: number } 
    | undefined;
  
  if (itemSize) {
    const minCellSize = Math.min(cellSize.width, cellSize.height);
    const maxCellSize = Math.max(cellSize.width, cellSize.height);
    const minZoneSize = Math.min(zoneSize.width, zoneSize.height);
    
    // Check if item is smaller than cell size
    if (itemSize.width < minCellSize || itemSize.height < minCellSize) {
      warnings.push(
        `Item size (${itemSize.width.toFixed(1)}m × ${itemSize.height.toFixed(1)}m) is smaller than cell size (${minCellSize.toFixed(1)}m). ` +
        `Consider using Unreal Direct precision for precise placement.`
      );
      recommendations.push("Use Unreal Direct precision for items smaller than cell size");
    }
    
    // Check if item is larger than zone size
    if (itemSize.width > minZoneSize || itemSize.height > minZoneSize) {
      warnings.push(
        `Item size (${itemSize.width.toFixed(1)}m × ${itemSize.height.toFixed(1)}m) is larger than zone size (${minZoneSize.toFixed(1)}m). ` +
        `Consider using Zone precision or splitting into multiple placements.`
      );
      recommendations.push("Use Zone precision for items larger than zone size");
    }
    
    // Check if item fits well in cell
    if (itemSize.width <= maxCellSize && itemSize.height <= maxCellSize) {
      if (placement.precisionLevel !== PrecisionLevel.Cell && 
          placement.precisionLevel !== PrecisionLevel.UnrealDirect) {
        recommendations.push("Item size fits well in a cell - consider using Cell precision");
      }
    }
  }
  
  // Check precision appropriateness
  const precisionSize = getUnrealSizeForPrecision(placement.precisionLevel, mapConfig);
  
  if (itemSize) {
    const precisionMinSize = Math.min(precisionSize.width, precisionSize.height);
    const itemMinSize = Math.min(itemSize.width, itemSize.height);
    
    // If precision is too low for item size
    if (itemMinSize < precisionMinSize * 0.5) {
      warnings.push(
        `Precision level "${placement.precisionLevel}" may be too low for item size. ` +
        `Precision covers ${precisionMinSize.toFixed(1)}m, but item is ${itemMinSize.toFixed(1)}m. ` +
        `Consider using higher precision or Unreal Direct.`
      );
      recommendations.push("Use higher precision level or Unreal Direct for better accuracy");
    }
    
    // If precision is too high for item size
    if (itemMinSize > precisionMinSize * 2) {
      recommendations.push(
        `Item size (${itemMinSize.toFixed(1)}m) is larger than precision size (${precisionMinSize.toFixed(1)}m). ` +
        `Consider using lower precision level.`
      );
    }
  }
  
  // Map level specific recommendations
  switch (mapLevel) {
    case MapLevel.World:
      if (itemSize && (itemSize.width < 47 || itemSize.height < 47)) {
        recommendations.push(
          "World maps are best for large items (47m+). Consider placing smaller items on nested maps."
        );
      }
      break;
    case MapLevel.Town:
      if (itemSize && (itemSize.width < 9.8 || itemSize.height < 9.8)) {
        recommendations.push(
          "Town maps are best for medium items (9.8m+). Consider placing smaller items on interior maps."
        );
      }
      break;
    case MapLevel.Interior:
      if (itemSize && (itemSize.width < 3.9 || itemSize.height < 3.9)) {
        recommendations.push(
          "Interior maps are best for small items (3.9m+). Consider using Unreal Direct for tiny items."
        );
      }
      break;
    case MapLevel.SmallInterior:
      if (itemSize && (itemSize.width < 0.98 || itemSize.height < 0.98)) {
        recommendations.push(
          "Small interior maps are best for tiny items (0.98m+). Use Unreal Direct for precise placement."
        );
      }
      break;
  }
  
  return {
    valid: warnings.length === 0,
    warnings,
    recommendations,
  };
}

/**
 * Get recommended precision level for item size
 */
export function getRecommendedPrecision(
  itemSize: { width: number; height: number },
  mapConfig: CoordinateSystemConfig
): PrecisionLevel {
  const cellSize = getUnrealSizeForPrecision(PrecisionLevel.Cell, mapConfig);
  const zoneSize = getUnrealSizeForPrecision(PrecisionLevel.Zone, mapConfig);
  const pixelSize = getUnrealSizeForPrecision(PrecisionLevel.Pixel, mapConfig);
  
  const minItemSize = Math.min(itemSize.width, itemSize.height);
  const minCellSize = Math.min(cellSize.width, cellSize.height);
  const minZoneSize = Math.min(zoneSize.width, zoneSize.height);
  const minPixelSize = Math.min(pixelSize.width, pixelSize.height);
  
  if (minItemSize >= minZoneSize) {
    return PrecisionLevel.Zone;
  } else if (minItemSize >= minCellSize) {
    return PrecisionLevel.Cell;
  } else if (minItemSize >= minPixelSize) {
    return PrecisionLevel.Pixel;
  } else {
    return PrecisionLevel.UnrealDirect;
  }
}

