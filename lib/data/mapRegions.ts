// lib/data/mapRegions.ts
// Map region definitions - cell selections that define nested maps/environments

import type { CellCoordinates } from "@/lib/utils/coordinateSystem";

/**
 * Map region - a selection of cells that defines a nested map/environment
 * The boundaries of selected cells define the area boundaries
 */
export interface MapRegion {
  id: string;
  mapId: string; // Parent map
  parentRegionId?: string; // Parent region (if nested within another region)
  
  // Region definition - stored as a square (all regions are squares)
  name: string;
  description?: string;
  minX: number; // Left edge of square (cell X coordinate)
  minY: number; // Top edge of square (cell Y coordinate)
  width: number; // Width of square in cells
  height: number; // Height of square in cells
  
  // Associated nested map (if created)
  nestedMapId?: string; // Link to nested map created from this region
  environmentId?: string; // Associated environment
  
  // Visual properties
  color: string; // Unique color for this region (hex)
  
  // Metadata
  metadata: {
    biome?: string;
    climate?: string;
    dangerLevel?: number;
    completion?: {
      totalCells: number;
      completedCells: number; // Cells with content
      percentage: number;
    };
  };
}

/**
 * Generate a unique color for a region based on its ID
 * Returns HSL color string that can be used with opacity
 */
export function generateRegionColor(regionId: string): string {
  // Generate a consistent color from the ID
  let hash = 0;
  for (let i = 0; i < regionId.length; i++) {
    hash = regionId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate hue (0-360) from hash
  const hue = Math.abs(hash % 360);
  
  // Use high saturation and medium lightness for visibility
  // Return as HSL string that works with CSS opacity syntax
  return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Convert HSL color to RGB for use with opacity
 */
export function hslToRgba(hsl: string, alpha: number = 1): string {
  // Parse HSL string like "hsl(120, 70%, 50%)"
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return hsl;
  
  const h = parseInt(match[1]) / 360;
  const s = parseInt(match[2]) / 100;
  const l = parseInt(match[3]) / 100;
  
  // Convert HSL to RGB
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`;
}

/**
 * Get region bounds from square definition
 */
export function getRegionBounds(region: MapRegion): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  return {
    minX: region.minX,
    maxX: region.minX + region.width - 1,
    minY: region.minY,
    maxY: region.minY + region.height - 1,
  };
}

/**
 * Get all cells in a square region
 */
export function getRegionCells(region: MapRegion): CellCoordinates[] {
  const cells: CellCoordinates[] = [];
  for (let y = region.minY; y < region.minY + region.height; y++) {
    for (let x = region.minX; x < region.minX + region.width; x++) {
      cells.push({ cellX: x, cellY: y });
    }
  }
  return cells;
}

/**
 * Check if a cell is within a region
 */
export function isCellInRegion(
  cell: CellCoordinates,
  region: MapRegion
): boolean {
  const bounds = getRegionBounds(region);
  return (
    cell.cellX >= bounds.minX &&
    cell.cellX <= bounds.maxX &&
    cell.cellY >= bounds.minY &&
    cell.cellY <= bounds.maxY
  );
}

/**
 * Check if a cell is on the boundary of a region
 */
export function isCellOnBoundary(
  cell: CellCoordinates,
  region: MapRegion
): boolean {
  const bounds = getRegionBounds(region);
  return (
    cell.cellX === bounds.minX ||
    cell.cellX === bounds.maxX ||
    cell.cellY === bounds.minY ||
    cell.cellY === bounds.maxY
  );
}

