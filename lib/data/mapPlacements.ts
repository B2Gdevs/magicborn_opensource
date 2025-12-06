// lib/data/mapPlacements.ts
// Map placement definitions - items placed on maps

import { PlacementType, PrecisionLevel, LandmarkType } from "@core/mapEnums";
import type { 
  PixelCoordinates, 
  CellCoordinates, 
  ZoneCoordinates, 
  UnrealCoordinates 
} from "@/lib/utils/coordinateSystem";

/**
 * Placement coordinates - varies by precision level
 */
export type PlacementCoordinates = 
  | ZoneCoordinates
  | CellCoordinates
  | PixelCoordinates
  | UnrealCoordinates;

/**
 * Map placement - any item placed on a map
 * Most placements are landmarks that link to nested maps
 */
export interface MapPlacement {
  id: string;
  mapId: string; // Parent map
  
  // Placement type and item reference
  type: PlacementType;
  itemId: string; // Reference to prop/spawn point/interactable definition
  
  // Coordinates (varies by precision level)
  coordinates: PlacementCoordinates;
  precisionLevel: PrecisionLevel;
  
  // Landmark fields (if isLandmark = true)
  isLandmark: boolean;
  landmarkType?: LandmarkType; // If isLandmark
  nestedMapId?: string; // Link to nested map (if landmark)
  
  // Additional metadata
  metadata: Record<string, any>;
}

