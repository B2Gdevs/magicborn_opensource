// lib/utils/cellUtils.ts
// Utility functions for working with cell selections

import type { CellCoordinates } from "./coordinateSystem";

/**
 * Convert bounding box to array of cells
 */
export function boundsToCells(bounds: { minX: number; minY: number; maxX: number; maxY: number }): CellCoordinates[] {
  const cells: CellCoordinates[] = [];
  for (let x = bounds.minX; x <= bounds.maxX; x++) {
    for (let y = bounds.minY; y <= bounds.maxY; y++) {
      cells.push({ cellX: x, cellY: y });
    }
  }
  return cells;
}

/**
 * Convert array of cells to bounding box
 */
export function cellsToBounds(cells: CellCoordinates[]): { minX: number; minY: number; maxX: number; maxY: number } | null {
  if (cells.length === 0) return null;
  
  const xs = cells.map(c => c.cellX);
  const ys = cells.map(c => c.cellY);
  
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  };
}

/**
 * Get cell count from bounding box
 */
export function getCellCount(bounds: { minX: number; minY: number; maxX: number; maxY: number }): number {
  return (bounds.maxX - bounds.minX + 1) * (bounds.maxY - bounds.minY + 1);
}


