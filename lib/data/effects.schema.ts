// lib/data/effects.schema.ts
// Drizzle ORM schema for effect definitions

import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const effectDefinitions = sqliteTable("effect_definitions", {
  id: text("id").primaryKey(), // EffectType enum value
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // EffectCategory enum value
  isBuff: integer("is_buff", { mode: "boolean" }).notNull(),
  iconKey: text("icon_key"), // Optional icon key
  
  // Blueprint (JSON)
  blueprint: text("blueprint").notNull(), // JSON: EffectBlueprint
  
  // Optional fields
  maxStacks: integer("max_stacks"),
  
  // Image
  imagePath: text("image_path"), // Path to image in public/game-content/effects/
  
  // Metadata
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export type EffectDefinitionRow = typeof effectDefinitions.$inferSelect;

