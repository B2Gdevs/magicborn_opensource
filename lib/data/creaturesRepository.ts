// lib/data/creaturesRepository.ts
// Repository layer for creatures database operations using Drizzle ORM

import { getDatabase } from "./spells.db";
import { creatures } from "./creatures.schema";
import type { CreatureDefinition } from "./creatures";
import type { AlphabetVector } from "@core/types";
import type { ElementXpMap, ElementAffinityMap } from "@/lib/packages/player/AffinityService";
import type { EffectInstance } from "@core/effects";
import { eq } from "drizzle-orm";

function rowToCreature(row: typeof creatures.$inferSelect): CreatureDefinition {
  const creature: CreatureDefinition = {
    id: row.id,
    name: row.name,
    description: row.description,
    mana: row.mana,
    maxMana: row.maxMana,
    hp: row.hp,
    maxHp: row.maxHp,
    affinity: JSON.parse(row.affinity) as AlphabetVector,
    effects: JSON.parse(row.effects) as EffectInstance[],
    storyIds: JSON.parse(row.storyIds) as string[],
  };

  if (row.elementXp) {
    creature.elementXp = JSON.parse(row.elementXp) as ElementXpMap;
  }

  if (row.elementAffinity) {
    creature.elementAffinity = JSON.parse(row.elementAffinity) as ElementAffinityMap;
  }

  if (row.imagePath) {
    creature.imagePath = row.imagePath;
  }

  return creature;
}

function creatureToRow(creature: CreatureDefinition): typeof creatures.$inferInsert {
  return {
    id: creature.id,
    name: creature.name,
    description: creature.description,
    mana: creature.mana,
    maxMana: creature.maxMana,
    hp: creature.hp,
    maxHp: creature.maxHp,
    affinity: JSON.stringify(creature.affinity),
    elementXp: creature.elementXp ? JSON.stringify(creature.elementXp) : null,
    elementAffinity: creature.elementAffinity ? JSON.stringify(creature.elementAffinity) : null,
    effects: JSON.stringify(creature.effects),
    imagePath: creature.imagePath || null,
    storyIds: JSON.stringify(creature.storyIds),
  };
}

export class CreaturesRepository {
  private db = getDatabase();

  listAll(): CreatureDefinition[] {
    const rows = this.db
      .select()
      .from(creatures)
      .orderBy(creatures.name)
      .all();
    return rows.map(rowToCreature);
  }

  getById(id: string): CreatureDefinition | null {
    const row = this.db
      .select()
      .from(creatures)
      .where(eq(creatures.id, id))
      .get();
    return row ? rowToCreature(row) : null;
  }

  create(creature: CreatureDefinition): void {
    this.db.insert(creatures).values(creatureToRow(creature)).run();
  }

  update(creature: CreatureDefinition): void {
    this.db
      .update(creatures)
      .set({
        ...creatureToRow(creature),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(creatures.id, creature.id))
      .run();
  }

  delete(id: string): void {
    this.db.delete(creatures).where(eq(creatures.id, id)).run();
  }

  exists(id: string): boolean {
    const row = this.db
      .select()
      .from(creatures)
      .where(eq(creatures.id, id))
      .get();
    return row !== null;
  }
}

let repositoryInstance: CreaturesRepository | null = null;

export function getCreaturesRepository(): CreaturesRepository {
  if (!repositoryInstance) {
    repositoryInstance = new CreaturesRepository();
  }
  return repositoryInstance;
}

