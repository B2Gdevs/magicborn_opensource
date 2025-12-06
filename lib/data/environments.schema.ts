// lib/data/environments.schema.ts
// Drizzle ORM schema for environment definitions

import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const environments = sqliteTable("environments", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imagePath: text("image_path"), // Path to image in public/game-content/environments/
  storyIds: text("story_ids").notNull().default("[]"), // JSON array of story file names
  mapIds: text("map_ids").notNull().default("[]"), // JSON array of map IDs
  
  // Metadata (JSON)
  metadata: text("metadata").notNull().default("{}"), // JSON: { biome, climate, dangerLevel }
  
  // Timestamps
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export type EnvironmentRow = typeof environments.$inferSelect;
export type NewEnvironmentRow = typeof environments.$inferInsert;

