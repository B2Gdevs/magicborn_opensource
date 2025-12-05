// lib/data/spellsRepository.ts
// Repository layer for named spells database operations using Drizzle ORM

import { getDatabase } from "./spells.db";
import { namedSpells } from "./spells.schema";
import type { NamedSpellBlueprint } from "./namedSpells";
import type { RuneCode } from "@core/types";
import { SpellTag, DamageType } from "@core/enums";
import { AchievementFlag } from "./achievements";
import type { EffectBlueprint } from "@core/effects";
import { eq } from "drizzle-orm";

function rowToBlueprint(row: typeof namedSpells.$inferSelect): NamedSpellBlueprint {
  const blueprint: NamedSpellBlueprint = {
    id: row.id as any,
    name: row.name,
    description: row.description,
    hidden: row.hidden,
    hint: row.hint,
    requiredRunes: JSON.parse(row.requiredRunes) as RuneCode[],
    tags: JSON.parse(row.tags) as SpellTag[],
  };

  if (row.allowedExtraRunes) {
    blueprint.allowedExtraRunes = JSON.parse(row.allowedExtraRunes) as RuneCode[];
  }

  if (row.minDamageFocusType && row.minDamageFocusRatio !== null) {
    blueprint.minDamageFocus = {
      type: row.minDamageFocusType as DamageType,
      ratio: row.minDamageFocusRatio,
    };
  }

  if (row.minTotalPower !== null) {
    blueprint.minTotalPower = row.minTotalPower;
  }

  if (row.requiresNamedSourceId) {
    blueprint.requiresNamedSourceId = row.requiresNamedSourceId as any;
  }

  if (row.minRuneFamiliarity) {
    blueprint.minRuneFamiliarity = JSON.parse(row.minRuneFamiliarity) as Partial<
      Record<RuneCode, number>
    >;
  }

  if (row.minTotalFamiliarityScore !== null) {
    blueprint.minTotalFamiliarityScore = row.minTotalFamiliarityScore;
  }

  if (row.requiredFlags) {
    blueprint.requiredFlags = JSON.parse(row.requiredFlags) as AchievementFlag[];
  }

  if (row.effects) {
    blueprint.effects = JSON.parse(row.effects) as EffectBlueprint[];
  }

  if (row.imagePath) {
    blueprint.imagePath = row.imagePath;
  }

  return blueprint;
}

function blueprintToRow(spell: NamedSpellBlueprint): typeof namedSpells.$inferInsert {
  return {
    id: spell.id,
    name: spell.name,
    description: spell.description,
    hidden: spell.hidden,
    hint: spell.hint,
    requiredRunes: JSON.stringify(spell.requiredRunes),
    allowedExtraRunes: spell.allowedExtraRunes
      ? JSON.stringify(spell.allowedExtraRunes)
      : null,
    tags: JSON.stringify(spell.tags),
    minDamageFocusType: spell.minDamageFocus?.type || null,
    minDamageFocusRatio: spell.minDamageFocus?.ratio || null,
    minTotalPower: spell.minTotalPower ?? null,
    requiresNamedSourceId: spell.requiresNamedSourceId || null,
    minRuneFamiliarity: spell.minRuneFamiliarity
      ? JSON.stringify(spell.minRuneFamiliarity)
      : null,
    minTotalFamiliarityScore: spell.minTotalFamiliarityScore ?? null,
    requiredFlags: spell.requiredFlags ? JSON.stringify(spell.requiredFlags) : null,
    effects: spell.effects ? JSON.stringify(spell.effects) : null,
    imagePath: spell.imagePath || null,
  };
}

export class SpellsRepository {
  private db = getDatabase();

  listAll(): NamedSpellBlueprint[] {
    const rows = this.db.select().from(namedSpells).orderBy(namedSpells.name).all();
    return rows.map(rowToBlueprint);
  }

  getById(id: string): NamedSpellBlueprint | null {
    const row = this.db.select().from(namedSpells).where(eq(namedSpells.id, id)).get();
    return row ? rowToBlueprint(row) : null;
  }

  create(spell: NamedSpellBlueprint): void {
    const row = blueprintToRow(spell);
    this.db.insert(namedSpells).values(row).run();
  }

  update(spell: NamedSpellBlueprint): void {
    const row = blueprintToRow(spell);
    this.db
      .update(namedSpells)
      .set(row)
      .where(eq(namedSpells.id, spell.id))
      .run();
  }

  delete(id: string): void {
    this.db.delete(namedSpells).where(eq(namedSpells.id, id)).run();
  }

  exists(id: string): boolean {
    const result = this.db
      .select({ id: namedSpells.id })
      .from(namedSpells)
      .where(eq(namedSpells.id, id))
      .get();
    return !!result;
  }
}

// Singleton instance
let repositoryInstance: SpellsRepository | null = null;

export function getSpellsRepository(): SpellsRepository {
  if (!repositoryInstance) {
    repositoryInstance = new SpellsRepository();
  }
  return repositoryInstance;
}

