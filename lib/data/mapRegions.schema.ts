// lib/data/mapRegions.schema.ts
// Drizzle ORM schema for map regions (cell selections that define nested maps)

import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const mapRegions = sqliteTable("map_regions", {
  id: text("id").primaryKey(),
  mapId: text("map_id").notNull(), // Parent map
  
  // Region definition
  name: text("name").notNull(),
  description: text("description"),
  cells: text("cells").notNull(), // JSON array of CellCoordinates
  
  // Associated nested map/environment
  nestedMapId: text("nested_map_id"), // Link to nested map (if created)
  environmentId: text("environment_id"), // Associated environment
  
  // Visual properties
  color: text("color").notNull(), // Hex color for this region
  
  // Metadata (JSON)
  metadata: text("metadata").notNull().default("{}"), // JSON: Record<string, any>
  
  // Timestamps
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export type MapRegionRow = typeof mapRegions.$inferSelect;

