// lib/data/characters.schema.ts
// Drizzle ORM schema for characters

import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const characters = sqliteTable("characters", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  
  // Resource pools
  mana: real("mana").notNull(),
  maxMana: real("max_mana").notNull(),
  
  // Vitality
  hp: real("hp").notNull(),
  maxHp: real("max_hp").notNull(),
  
  // Rune familiarity (JSON)
  affinity: text("affinity").notNull(), // JSON: AlphabetVector
  
  // Element-based growth / resistance (JSON, optional)
  elementXp: text("element_xp"), // JSON: ElementXpMap
  elementAffinity: text("element_affinity"), // JSON: ElementAffinityMap
  
  // Active status effects (JSON)
  effects: text("effects").notNull(), // JSON: EffectInstance[]
  
  // Player-specific fields (optional)
  controlBonus: real("control_bonus"), // reduces instability
  costEfficiency: real("cost_efficiency"), // reduces mana cost (0..0.3 typical)
  
  // Character-specific metadata
  imagePath: text("image_path"), // Path to image in public/game-content/characters/
  storyIds: text("story_ids").notNull(), // JSON array of story file names
  
  // Metadata
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export type CharacterRow = typeof characters.$inferSelect;
export type NewCharacterRow = typeof characters.$inferInsert;

