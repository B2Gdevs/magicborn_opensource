// lib/data/effectsRepository.ts
// Repository layer for effect definitions database operations using Drizzle ORM

import { getEffectsDatabase } from "./effects.db";
import { effectDefinitions } from "./effects.schema";
import type { EffectDefinition } from "./effects";
import type { EffectBlueprint } from "@core/effects";
import { EffectCategory } from "./effects";
import { EffectType } from "@core/enums";
import { eq } from "drizzle-orm";

function rowToDefinition(row: typeof effectDefinitions.$inferSelect): EffectDefinition {
  const definition: EffectDefinition = {
    id: row.id as EffectType,
    name: row.name,
    description: row.description,
    category: row.category as EffectCategory,
    isBuff: row.isBuff,
    blueprint: JSON.parse(row.blueprint) as EffectBlueprint,
  };

  if (row.maxStacks !== null) {
    definition.maxStacks = row.maxStacks;
  }

  if (row.iconKey) {
    definition.iconKey = row.iconKey;
  }

  if (row.imagePath) {
    definition.imagePath = row.imagePath;
  }

  return definition;
}

function definitionToRow(effect: EffectDefinition): typeof effectDefinitions.$inferInsert {
  return {
    id: effect.id,
    name: effect.name,
    description: effect.description,
    category: effect.category,
    isBuff: effect.isBuff,
    blueprint: JSON.stringify(effect.blueprint),
    maxStacks: effect.maxStacks ?? null,
    iconKey: effect.iconKey || null,
    imagePath: effect.imagePath || null,
  };
}

export class EffectsRepository {
  private db = getEffectsDatabase();

  listAll(): EffectDefinition[] {
    const rows = this.db.select().from(effectDefinitions).orderBy(effectDefinitions.name).all();
    return rows.map(rowToDefinition);
  }

  getById(id: string): EffectDefinition | null {
    const row = this.db.select().from(effectDefinitions).where(eq(effectDefinitions.id, id)).get();
    return row ? rowToDefinition(row) : null;
  }

  create(effect: EffectDefinition): void {
    const row = definitionToRow(effect);
    this.db.insert(effectDefinitions).values(row).run();
  }

  update(effect: EffectDefinition): void {
    const row = definitionToRow(effect);
    this.db
      .update(effectDefinitions)
      .set(row)
      .where(eq(effectDefinitions.id, effect.id))
      .run();
  }

  delete(id: string): void {
    this.db.delete(effectDefinitions).where(eq(effectDefinitions.id, id)).run();
  }

  exists(id: string): boolean {
    const result = this.db
      .select({ id: effectDefinitions.id })
      .from(effectDefinitions)
      .where(eq(effectDefinitions.id, id))
      .get();
    return !!result;
  }
}

// Singleton instance
let repositoryInstance: EffectsRepository | null = null;

export function getEffectsRepository(): EffectsRepository {
  if (!repositoryInstance) {
    repositoryInstance = new EffectsRepository();
  }
  return repositoryInstance;
}

