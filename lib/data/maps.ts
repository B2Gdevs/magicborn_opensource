// lib/data/maps.ts
// Map definitions - playable areas within environments (hierarchical)

import type { CoordinateSystemConfig } from "@/lib/utils/coordinateSystem";
import type { CellCoordinates } from "@/lib/utils/coordinateSystem";

/**
 * Map connection - links between maps (doors, paths, etc.)
 */
export interface MapConnection {
  id: string;
  targetMapId: string;
  connectionType: "door" | "path" | "portal" | "other";
  coordinates: CellCoordinates; // Where the connection is on this map
  metadata?: Record<string, any>;
}

/**
 * Environmental modifier - gameplay effect tied to a map
 */
export interface EnvironmentalModifier {
  id: string;
  name: string;
  type: string; // ModifierType enum value
  target: string; // ModifierTarget enum value
  value: number;
  element?: string; // DamageType enum value
  duration?: number;
  conditions?: Record<string, any>;
}

/**
 * Map definition - a specific playable area within an environment
 * Can be nested (World → Town → Shop → Home)
 */
export interface MapDefinition {
  id: string;
  environmentId: string; // Parent environment
  
  // Hierarchical map support
  parentMapId?: string; // If nested map, reference to parent
  parentCellCoordinates?: CellCoordinates; // Where this map is placed on parent
  baseRegionId?: string; // The region that owns this map (becomes base region when editing)
  
  name: string;
  description: string;
  imagePath?: string; // Path to image in public/game-content/maps/
  
  // Coordinate system configuration
  coordinateConfig: CoordinateSystemConfig;
  
  // Scene IDs (scenes within this map)
  sceneIds: string[];
  
  // Connections to other maps
  connections: MapConnection[];
  
  // Environmental modifiers (optional)
  environmentalModifiers?: EnvironmentalModifier[];
}


