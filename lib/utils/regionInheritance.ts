// lib/utils/regionInheritance.ts
// Utility functions for calculating region inheritance and parent relationships

import type { MapRegion } from "@/lib/data/mapRegions";
import type { EnvironmentDefinition } from "@/lib/data/environments";
import type { CellCoordinates } from "./coordinateSystem";

/**
 * Find the parent region for a given set of cells
 */
export function findParentRegion(
  cells: CellCoordinates[],
  regions: MapRegion[],
  mapId: string
): MapRegion | null {
  if (cells.length === 0) return null;
  
  // Find if any region contains all selected cells
  return regions.find(r => 
    r.mapId === mapId && 
    cells.every(sc => 
      r.cells.some(rc => rc.cellX === sc.cellX && rc.cellY === sc.cellY)
    )
  ) || null;
}

/**
 * Find the base region for a map
 */
export function findBaseRegion(
  regions: MapRegion[],
  mapId: string
): MapRegion | null {
  return regions.find(
    r => r.mapId === mapId && r.name === "Base Region"
  ) || null;
}

/**
 * Get the environment that should be inherited for a region
 * Checks parent region first, then base region
 */
export function getInheritedEnvironment(
  parentRegion: MapRegion | null,
  baseRegion: MapRegion | null,
  environments: EnvironmentDefinition[]
): EnvironmentDefinition | null {
  if (parentRegion?.environmentId) {
    return environments.find(e => e.id === parentRegion.environmentId) || null;
  }
  // If no parent region, check base region
  if (baseRegion?.environmentId) {
    return environments.find(e => e.id === baseRegion.environmentId) || null;
  }
  return null;
}

/**
 * Calculate effective environment ID (selected or inherited)
 */
export function getEffectiveEnvironmentId(
  selectedEnvironmentId: string | null,
  inheritedEnvironment: EnvironmentDefinition | null
): string | null {
  return selectedEnvironmentId !== null 
    ? selectedEnvironmentId 
    : (inheritedEnvironment?.id || null);
}

