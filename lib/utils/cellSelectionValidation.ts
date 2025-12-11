// lib/utils/cellSelectionValidation.ts
// Validation utilities for cell selection to ensure proper coordinate translation

import type { CellCoordinates } from "./coordinateSystem";
import type { CoordinateSystemConfig } from "./coordinateSystem";
import type { MapPlacement } from "@/lib/data/mapPlacements";
import { pixelToUnreal, cellToPixel } from "./coordinateSystem";
import { detectMapLevel } from "./coordinateSystem";
import { MapLevel } from "@core/mapEnums";

/**
 * Validation result for cell selection
 */
export interface CellSelectionValidationResult {
  valid: boolean;
  warnings: string[];
  recommendations: string[];
  unrealBounds?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  cellCount: number;
  estimatedAreaInUnreal: number; // Square meters
}

/**
 * Validate cell selection for creating nested maps
 */
export function validateCellSelectionForNestedMap(
  selectedCells: CellCoordinates[],
  mapConfig: CoordinateSystemConfig,
  existingPlacements?: MapPlacement[]
): CellSelectionValidationResult {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  if (selectedCells.length === 0) {
    return {
      valid: false,
      warnings: ["No cells selected"],
      recommendations: ["Select at least one cell to create a nested map"],
      cellCount: 0,
      estimatedAreaInUnreal: 0,
    };
  }
  
  // Calculate bounds
  const minX = Math.min(...selectedCells.map((c) => c.cellX));
  const maxX = Math.max(...selectedCells.map((c) => c.cellX));
  const minY = Math.min(...selectedCells.map((c) => c.cellY));
  const maxY = Math.max(...selectedCells.map((c) => c.cellY));
  
  // Convert cell bounds to pixel coordinates
  const topLeftPixel = cellToPixel({ cellX: minX, cellY: minY }, mapConfig);
  const bottomRightPixel = cellToPixel({ cellX: maxX + 1, cellY: maxY + 1 }, mapConfig);
  
  // Convert to Unreal units
  const topLeftUnreal = pixelToUnreal(topLeftPixel, mapConfig);
  const bottomRightUnreal = pixelToUnreal(bottomRightPixel, mapConfig);
  
  const unrealBounds = {
    minX: topLeftUnreal.x,
    minY: topLeftUnreal.y,
    maxX: bottomRightUnreal.x,
    maxY: bottomRightUnreal.y,
  };
  
  // Calculate area in Unreal units (square meters)
  const widthInUnreal = unrealBounds.maxX - unrealBounds.minX;
  const heightInUnreal = unrealBounds.maxY - unrealBounds.minY;
  const areaInUnreal = widthInUnreal * heightInUnreal;
  
  // Check for conflicts with existing placements
  if (existingPlacements && existingPlacements.length > 0) {
    const conflictingPlacements = existingPlacements.filter((placement) => {
      // Check if placement is within selected cell bounds
      // This is a simplified check - you may want more sophisticated collision detection
      if (placement.coordinates && typeof placement.coordinates === 'object' && 'x' in placement.coordinates) {
        const placementPixel = placement.coordinates as { x: number; y: number };
        const placementCell = {
          cellX: Math.floor(placementPixel.x / mapConfig.baseCellSize),
          cellY: Math.floor(placementPixel.y / mapConfig.baseCellSize),
        };
        
        return selectedCells.some(
          (cell) => cell.cellX === placementCell.cellX && cell.cellY === placementCell.cellY
        );
      }
      return false;
    });
    
    if (conflictingPlacements.length > 0) {
      warnings.push(
        `${conflictingPlacements.length} existing placement(s) are within the selected cells. ` +
        `These will be preserved but may need adjustment.`
      );
      recommendations.push("Review existing placements in the selected area before creating nested map");
    }
  }
  
  // Check map level appropriateness
  const mapLevel = detectMapLevel(mapConfig);
  const cellCount = selectedCells.length;
  
  // Recommend appropriate nested map level based on selection size
  if (mapLevel === MapLevel.World) {
    if (areaInUnreal < 1000) { // Less than 1km²
      recommendations.push(
        `Selected area (${(areaInUnreal / 1000000).toFixed(2)} km²) is small for a world-level nested map. ` +
        `Consider using Town or Interior level instead.`
      );
    } else if (areaInUnreal > 10000000) { // More than 10km²
      warnings.push(
        `Selected area (${(areaInUnreal / 1000000).toFixed(2)} km²) is very large. ` +
        `This may impact performance. Consider breaking into smaller nested maps.`
      );
    }
    
    // Recommend Town level for most world-level selections
    if (areaInUnreal >= 1000 && areaInUnreal <= 5000000) {
      recommendations.push("Recommended nested map level: Town (2km × 2km)");
    }
  } else if (mapLevel === MapLevel.Town) {
    if (areaInUnreal < 100) { // Less than 100m²
      recommendations.push(
        `Selected area (${areaInUnreal.toFixed(1)} m²) is small for a town-level nested map. ` +
        `Consider using Interior level instead.`
      );
    }
    
    // Recommend Interior level for town-level selections
    if (areaInUnreal >= 100 && areaInUnreal <= 250000) {
      recommendations.push("Recommended nested map level: Interior (500m × 500m)");
    }
  } else if (mapLevel === MapLevel.Interior) {
    if (areaInUnreal < 10) { // Less than 10m²
      recommendations.push(
        `Selected area (${areaInUnreal.toFixed(1)} m²) is small. ` +
        `Consider using Small Interior level instead.`
      );
    }
    
    // Recommend Small Interior level for interior-level selections
    if (areaInUnreal >= 10 && areaInUnreal <= 10000) {
      recommendations.push("Recommended nested map level: Small Interior (100m × 100m)");
    }
  }
  
  // Check cell count
  if (cellCount === 1) {
    warnings.push("Only one cell selected. Nested maps typically cover multiple cells.");
    recommendations.push("Consider selecting a larger area for better nested map coverage");
  } else if (cellCount > 1000) {
    warnings.push(
      `Large selection (${cellCount} cells). This may create a very large nested map. ` +
      `Consider breaking into smaller areas.`
    );
  }
  
  // Check aspect ratio
  const aspectRatio = widthInUnreal / heightInUnreal;
  if (aspectRatio > 3 || aspectRatio < 1/3) {
    warnings.push(
      `Selection has extreme aspect ratio (${aspectRatio.toFixed(2)}:1). ` +
      `This may cause issues with nested map layout.`
    );
    recommendations.push("Consider selecting a more square-shaped area");
  }
  
  return {
    valid: warnings.length === 0 || warnings.every((w) => !w.includes("No cells")),
    warnings,
    recommendations,
    unrealBounds,
    cellCount,
    estimatedAreaInUnreal: areaInUnreal,
  };
}

/**
 * Get recommended nested map configuration based on cell selection
 */
export function getRecommendedNestedMapConfig(
  selectedCells: CellCoordinates[],
  parentMapConfig: CoordinateSystemConfig
): {
  level: MapLevel;
  unrealSize: number;
  imageSize: { width: number; height: number };
} | null {
  if (selectedCells.length === 0) return null;
  
  // Calculate bounds
  const minX = Math.min(...selectedCells.map((c) => c.cellX));
  const maxX = Math.max(...selectedCells.map((c) => c.cellX));
  const minY = Math.min(...selectedCells.map((c) => c.cellY));
  const maxY = Math.max(...selectedCells.map((c) => c.cellY));
  
  // Convert to pixel coordinates
  const topLeftPixel = cellToPixel({ cellX: minX, cellY: minY }, parentMapConfig);
  const bottomRightPixel = cellToPixel({ cellX: maxX + 1, cellY: maxY + 1 }, parentMapConfig);
  
  // Convert to Unreal units
  const topLeftUnreal = pixelToUnreal(topLeftPixel, parentMapConfig);
  const bottomRightUnreal = pixelToUnreal(bottomRightPixel, parentMapConfig);
  
  const widthInUnreal = bottomRightUnreal.x - topLeftUnreal.x;
  const heightInUnreal = bottomRightUnreal.y - topLeftUnreal.y;
  const maxDimension = Math.max(widthInUnreal, heightInUnreal);
  
  // Recommend based on size
  if (maxDimension >= 10000) {
    // Very large - recommend Town level
    return {
      level: MapLevel.Town,
      unrealSize: 2000, // 2km
      imageSize: { width: 2048, height: 2048 },
    };
  } else if (maxDimension >= 1000) {
    // Large - recommend Interior level
    return {
      level: MapLevel.Interior,
      unrealSize: 500, // 500m
      imageSize: { width: 1024, height: 1024 },
    };
  } else if (maxDimension >= 200) {
    // Medium - recommend Small Interior level
    return {
      level: MapLevel.SmallInterior,
      unrealSize: 100, // 100m
      imageSize: { width: 512, height: 512 },
    };
  } else {
    // Small - still recommend Small Interior
    return {
      level: MapLevel.SmallInterior,
      unrealSize: 100,
      imageSize: { width: 512, height: 512 },
    };
  }
}


