// lib/data/spellsRepository.ts
// Repository layer for named spells database operations

import { getDatabase } from "./spells.db";
import type { NamedSpellBlueprint } from "./namedSpells";
import type { RuneCode } from "@core/types";
import { SpellTag, DamageType } from "@core/enums";
import { AchievementFlag } from "./achievements";
import type { EffectBlueprint } from "@core/effects";

interface SpellRow {
  id: string;
  name: string;
  description: string;
  hidden: number; // SQLite stores booleans as integers
  hint: string;
  required_runes: string; // JSON
  allowed_extra_runes: string | null; // JSON
  tags: string; // JSON
  min_damage_focus_type: string | null;
  min_damage_focus_ratio: number | null;
  min_total_power: number | null;
  requires_named_source_id: string | null;
  min_rune_familiarity: string | null; // JSON
  min_total_familiarity_score: number | null;
  required_flags: string | null; // JSON
  effects: string | null; // JSON array of EffectBlueprint
  created_at: string;
  updated_at: string;
}

function rowToBlueprint(row: SpellRow): NamedSpellBlueprint {
  const blueprint: NamedSpellBlueprint = {
    id: row.id as any,
    name: row.name,
    description: row.description,
    hidden: row.hidden === 1,
    hint: row.hint,
    requiredRunes: JSON.parse(row.required_runes) as RuneCode[],
    tags: JSON.parse(row.tags) as SpellTag[],
  };

  if (row.allowed_extra_runes) {
    blueprint.allowedExtraRunes = JSON.parse(row.allowed_extra_runes) as RuneCode[];
  }

  if (row.min_damage_focus_type && row.min_damage_focus_ratio !== null) {
    blueprint.minDamageFocus = {
      type: row.min_damage_focus_type as DamageType,
      ratio: row.min_damage_focus_ratio,
    };
  }

  if (row.min_total_power !== null) {
    blueprint.minTotalPower = row.min_total_power;
  }

  if (row.requires_named_source_id) {
    blueprint.requiresNamedSourceId = row.requires_named_source_id as any;
  }

  if (row.min_rune_familiarity) {
    blueprint.minRuneFamiliarity = JSON.parse(row.min_rune_familiarity) as Partial<
      Record<RuneCode, number>
    >;
  }

  if (row.min_total_familiarity_score !== null) {
    blueprint.minTotalFamiliarityScore = row.min_total_familiarity_score;
  }

  if (row.required_flags) {
    blueprint.requiredFlags = JSON.parse(row.required_flags) as AchievementFlag[];
  }

  if (row.effects) {
    blueprint.effects = JSON.parse(row.effects) as EffectBlueprint[];
  }

  return blueprint;
}

function blueprintToRow(spell: NamedSpellBlueprint): Omit<SpellRow, "created_at" | "updated_at"> {
  return {
    id: spell.id,
    name: spell.name,
    description: spell.description,
    hidden: spell.hidden ? 1 : 0,
    hint: spell.hint,
    required_runes: JSON.stringify(spell.requiredRunes),
    allowed_extra_runes: spell.allowedExtraRunes
      ? JSON.stringify(spell.allowedExtraRunes)
      : null,
    tags: JSON.stringify(spell.tags),
    min_damage_focus_type: spell.minDamageFocus?.type || null,
    min_damage_focus_ratio: spell.minDamageFocus?.ratio || null,
    min_total_power: spell.minTotalPower ?? null,
    requires_named_source_id: spell.requiresNamedSourceId || null,
    min_rune_familiarity: spell.minRuneFamiliarity
      ? JSON.stringify(spell.minRuneFamiliarity)
      : null,
    min_total_familiarity_score: spell.minTotalFamiliarityScore ?? null,
    required_flags: spell.requiredFlags ? JSON.stringify(spell.requiredFlags) : null,
    effects: spell.effects ? JSON.stringify(spell.effects) : null,
  };
}

export class SpellsRepository {
  private db = getDatabase();

  listAll(): NamedSpellBlueprint[] {
    const rows = this.db.prepare("SELECT * FROM named_spells ORDER BY name").all() as SpellRow[];
    return rows.map(rowToBlueprint);
  }

  getById(id: string): NamedSpellBlueprint | null {
    const row = this.db
      .prepare("SELECT * FROM named_spells WHERE id = ?")
      .get(id) as SpellRow | undefined;
    return row ? rowToBlueprint(row) : null;
  }

  create(spell: NamedSpellBlueprint): void {
    const row = blueprintToRow(spell);
    this.db
      .prepare(
        `INSERT INTO named_spells (
        id, name, description, hidden, hint,
        required_runes, allowed_extra_runes, tags,
        min_damage_focus_type, min_damage_focus_ratio, min_total_power,
        requires_named_source_id, min_rune_familiarity, min_total_familiarity_score, required_flags, effects
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        row.id,
        row.name,
        row.description,
        row.hidden,
        row.hint,
        row.required_runes,
        row.allowed_extra_runes,
        row.tags,
        row.min_damage_focus_type,
        row.min_damage_focus_ratio,
        row.min_total_power,
        row.requires_named_source_id,
        row.min_rune_familiarity,
        row.min_total_familiarity_score,
        row.required_flags,
        row.effects
      );
  }

  update(spell: NamedSpellBlueprint): void {
    const row = blueprintToRow(spell);
    this.db
      .prepare(
        `UPDATE named_spells SET
        name = ?, description = ?, hidden = ?, hint = ?,
        required_runes = ?, allowed_extra_runes = ?, tags = ?,
        min_damage_focus_type = ?, min_damage_focus_ratio = ?, min_total_power = ?,
        requires_named_source_id = ?, min_rune_familiarity = ?, min_total_familiarity_score = ?, required_flags = ?, effects = ?
        WHERE id = ?`
      )
      .run(
        row.name,
        row.description,
        row.hidden,
        row.hint,
        row.required_runes,
        row.allowed_extra_runes,
        row.tags,
        row.min_damage_focus_type,
        row.min_damage_focus_ratio,
        row.min_total_power,
        row.requires_named_source_id,
        row.min_rune_familiarity,
        row.min_total_familiarity_score,
        row.required_flags,
        row.effects,
        row.id
      );
  }

  delete(id: string): void {
    this.db.prepare("DELETE FROM named_spells WHERE id = ?").run(id);
  }

  exists(id: string): boolean {
    const result = this.db
      .prepare("SELECT 1 FROM named_spells WHERE id = ?")
      .get(id);
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

