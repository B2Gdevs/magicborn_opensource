// lib/data/runes.schema.ts
// Drizzle ORM schema for runes

import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const runes = sqliteTable("runes", {
  code: text("code").primaryKey(), // RuneCode (single letter A-Z)
  concept: text("concept").notNull(), // e.g., "Fire", "Air"
  powerFactor: real("power_factor").notNull(),
  controlFactor: real("control_factor").notNull(),
  instabilityBase: real("instability_base").notNull(), // 0..1
  tags: text("tags").notNull(), // JSON array of RuneTag
  manaCost: real("mana_cost").notNull(),
  
  // Optional JSON fields
  damage: text("damage"), // JSON object: DamageVector
  ccInstant: text("cc_instant"), // JSON array of CrowdControlTag
  pen: text("pen"), // JSON object: Partial<Record<DamageType, number>>
  effects: text("effects"), // JSON array of EffectBlueprint
  overchargeEffects: text("overcharge_effects"), // JSON array of OverchargeEffect
  dotAffinity: real("dot_affinity"), // number (0..1)
  
  // Image
  imagePath: text("image_path"), // Path to image in public/game-content/runes/
  
  // Metadata
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export type RuneRow = typeof runes.$inferSelect;
export type NewRuneRow = typeof runes.$inferInsert;

