// lib/data/creatures.schema.ts
// Drizzle ORM schema for creature definitions

import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const creatures = sqliteTable("creatures", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imagePath: text("image_path"), // Path to image in public/game-content/creatures/
  storyIds: text("story_ids").notNull().default("[]"), // JSON array of story IDs

  // CombatActor fields
  hp: real("hp").notNull(),
  maxHp: real("max_hp").notNull(),
  mana: real("mana").notNull(),
  maxMana: real("max_mana").notNull(),
  affinity: text("affinity").notNull().default("{}"), // JSON: AlphabetVector
  elementXp: text("element_xp"), // JSON: ElementXpMap
  elementAffinity: text("element_affinity"), // JSON: ElementAffinityMap
  effects: text("effects").notNull().default("[]"), // JSON array of EffectInstance

  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export type CreatureRow = typeof creatures.$inferSelect;
export type NewCreatureRow = typeof creatures.$inferInsert;

