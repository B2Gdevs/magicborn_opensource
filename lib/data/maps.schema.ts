// lib/data/maps.schema.ts
// Drizzle ORM schema for map definitions (hierarchical - can be nested)

import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const maps = sqliteTable("maps", {
  id: text("id").primaryKey(),
  environmentId: text("environment_id").notNull(), // Parent environment
  parentMapId: text("parent_map_id"), // If nested map, reference to parent
  parentCellX: real("parent_cell_x"), // Where this map is placed on parent (cell X)
  parentCellY: real("parent_cell_y"), // Where this map is placed on parent (cell Y)
  
  name: text("name").notNull(),
  description: text("description").notNull(),
  imagePath: text("image_path"), // Path to image in public/game-content/maps/
  
  // Coordinate system configuration (JSON)
  // Stores: { imageWidth, imageHeight, unrealWidth, unrealHeight, baseCellSize, zoneSize }
  coordinateConfig: text("coordinate_config").notNull(), // JSON: CoordinateSystemConfig
  
  // Scene IDs (JSON array)
  sceneIds: text("scene_ids").notNull().default("[]"), // JSON array of scene IDs
  
  // Connections to other maps (JSON array)
  connections: text("connections").notNull().default("[]"), // JSON array of MapConnection
  
  // Environmental modifiers (JSON array, optional)
  environmentalModifiers: text("environmental_modifiers"), // JSON array of EnvironmentalModifier
  
  // Timestamps
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export type MapRow = typeof maps.$inferSelect;
export type NewMapRow = typeof maps.$inferInsert;


