// lib/data/spells.schema.ts
// Drizzle ORM schema for named spells

import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const namedSpells = sqliteTable("named_spells", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  hidden: integer("hidden", { mode: "boolean" }).notNull().default(false),
  hint: text("hint").notNull(),
  
  // JSON fields - using snake_case to match existing database
  requiredRunes: text("required_runes").notNull(), // JSON array of RuneCode
  allowedExtraRunes: text("allowed_extra_runes"), // JSON array of RuneCode
  tags: text("tags").notNull(), // JSON array of SpellTag
  
  // Damage focus
  minDamageFocusType: text("min_damage_focus_type"), // DamageType enum value
  minDamageFocusRatio: real("min_damage_focus_ratio"),
  
  // Power requirements
  minTotalPower: real("min_total_power"),
  
  // Evolution chain
  requiresNamedSourceId: text("requires_named_source_id"), // NamedSpellId
  
  // Familiarity requirements (JSON)
  minRuneFamiliarity: text("min_rune_familiarity"), // JSON object: { RuneCode: number }
  minTotalFamiliarityScore: real("min_total_familiarity_score"),
  
  // Achievement flags (JSON)
  requiredFlags: text("required_flags"), // JSON array of AchievementFlag
  
  // Effects (JSON)
  effects: text("effects"), // JSON array of EffectBlueprint
  
  // Image
  imagePath: text("image_path"), // Path to image in public/game-content/spells/
  
  // Metadata
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export type NamedSpellRow = typeof namedSpells.$inferSelect;
export type NewNamedSpellRow = typeof namedSpells.$inferInsert;

