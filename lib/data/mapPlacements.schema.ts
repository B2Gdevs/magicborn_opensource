// lib/data/mapPlacements.schema.ts
// Drizzle ORM schema for map placements (props, spawn points, landmarks, etc.)

import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const mapPlacements = sqliteTable("map_placements", {
  id: text("id").primaryKey(),
  mapId: text("map_id").notNull(), // Parent map
  
  // Placement type and item reference
  type: text("type").notNull(), // Enum: PlacementType
  itemId: text("item_id").notNull(), // Reference to prop/spawn point/interactable definition
  
  // Coordinates (JSON) - varies by precision level
  // Zone: { zoneX, zoneY, zoneWidth, zoneHeight }
  // Cell: { cellX, cellY }
  // Pixel: { pixelX, pixelY }
  // UnrealDirect: { x, y, z }
  coordinates: text("coordinates").notNull(), // JSON: PlacementCoordinates
  
  // Precision level
  precisionLevel: text("precision_level").notNull(), // Enum: PrecisionLevel
  
  // Landmark fields (if isLandmark = true)
  isLandmark: text("is_landmark").notNull().default("false"), // Boolean as text
  landmarkType: text("landmark_type"), // Enum: LandmarkType (if isLandmark)
  nestedMapId: text("nested_map_id"), // Link to nested map (if landmark)
  
  // Additional metadata (JSON)
  metadata: text("metadata").notNull().default("{}"), // JSON: Record<string, any>
  
  // Timestamps
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export type MapPlacementRow = typeof mapPlacements.$inferSelect;
export type NewMapPlacementRow = typeof mapPlacements.$inferInsert;

