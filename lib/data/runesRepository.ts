// lib/data/runesRepository.ts
// Repository layer for runes database operations using Drizzle ORM

import { getDatabase } from "./spells.db";
import { runes } from "./runes.schema";
import type { RuneDef } from "@/lib/packages/runes";
import type { RuneCode } from "@core/types";
import { RuneTag, CrowdControlTag, DamageType } from "@core/enums";
import type { DamageVector } from "@core/combat";
import type { EffectBlueprint } from "@core/effects";
import { eq } from "drizzle-orm";

function rowToRuneDef(row: typeof runes.$inferSelect): RuneDef {
  const rune: RuneDef = {
    code: row.code as RuneCode,
    concept: row.concept,
    powerFactor: row.powerFactor,
    controlFactor: row.controlFactor,
    instabilityBase: row.instabilityBase,
    tags: JSON.parse(row.tags) as RuneTag[],
    manaCost: row.manaCost,
  };

  if (row.damage) {
    rune.damage = JSON.parse(row.damage) as DamageVector;
  }

  if (row.ccInstant) {
    rune.ccInstant = JSON.parse(row.ccInstant) as CrowdControlTag[];
  }

  if (row.pen) {
    rune.pen = JSON.parse(row.pen) as Partial<Record<DamageType, number>>;
  }

  if (row.effects) {
    rune.effects = JSON.parse(row.effects) as EffectBlueprint[];
  }

  if (row.overchargeEffects) {
    rune.overchargeEffects = JSON.parse(row.overchargeEffects) as Array<{
      minExtraMana: number;
      blueprint: EffectBlueprint;
    }>;
  }

  if (row.dotAffinity !== null) {
    rune.dotAffinity = row.dotAffinity;
  }

  if (row.imagePath) {
    rune.imagePath = row.imagePath;
  }

  return rune;
}

function runeDefToRow(rune: RuneDef): typeof runes.$inferInsert {
  return {
    code: rune.code,
    concept: rune.concept,
    powerFactor: rune.powerFactor,
    controlFactor: rune.controlFactor,
    instabilityBase: rune.instabilityBase,
    tags: JSON.stringify(rune.tags),
    manaCost: rune.manaCost,
    damage: rune.damage ? JSON.stringify(rune.damage) : null,
    ccInstant: rune.ccInstant ? JSON.stringify(rune.ccInstant) : null,
    pen: rune.pen ? JSON.stringify(rune.pen) : null,
    effects: rune.effects ? JSON.stringify(rune.effects) : null,
    overchargeEffects: rune.overchargeEffects
      ? JSON.stringify(rune.overchargeEffects)
      : null,
    dotAffinity: rune.dotAffinity ?? null,
    imagePath: rune.imagePath || null,
  };
}

export class RunesRepository {
  private db = getDatabase();

  listAll(): RuneDef[] {
    const rows = this.db
      .select()
      .from(runes)
      .orderBy(runes.code)
      .all();
    return rows.map(rowToRuneDef);
  }

  getByCode(code: RuneCode): RuneDef | null {
    const row = this.db
      .select()
      .from(runes)
      .where(eq(runes.code, code))
      .get();
    return row ? rowToRuneDef(row) : null;
  }

  create(rune: RuneDef): void {
    const row = runeDefToRow(rune);
    this.db.insert(runes).values(row).run();
  }

  update(rune: RuneDef): void {
    const row = runeDefToRow(rune);
    this.db
      .update(runes)
      .set(row)
      .where(eq(runes.code, rune.code))
      .run();
  }

  delete(code: RuneCode): void {
    this.db.delete(runes).where(eq(runes.code, code)).run();
  }

  exists(code: RuneCode): boolean {
    const result = this.db
      .select({ code: runes.code })
      .from(runes)
      .where(eq(runes.code, code))
      .get();
    return !!result;
  }
}

// Singleton instance
let repositoryInstance: RunesRepository | null = null;

export function getRunesRepository(): RunesRepository {
  if (!repositoryInstance) {
    repositoryInstance = new RunesRepository();
  }
  return repositoryInstance;
}

