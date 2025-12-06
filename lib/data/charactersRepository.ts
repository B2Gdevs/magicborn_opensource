// lib/data/charactersRepository.ts
// Repository layer for characters database operations using Drizzle ORM

import { getDatabase } from "./spells.db";
import { characters } from "./characters.schema";
import type { CharacterDefinition } from "./characters";
import type { AlphabetVector } from "@core/types";
import type { ElementXpMap, ElementAffinityMap } from "@/lib/packages/player/AffinityService";
import type { EffectInstance } from "@core/effects";
import { eq } from "drizzle-orm";

function rowToCharacter(row: typeof characters.$inferSelect): CharacterDefinition {
  const character: CharacterDefinition = {
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
    character.elementXp = JSON.parse(row.elementXp) as ElementXpMap;
  }

  if (row.elementAffinity) {
    character.elementAffinity = JSON.parse(row.elementAffinity) as ElementAffinityMap;
  }

  if (row.controlBonus !== null) {
    character.controlBonus = row.controlBonus;
  }

  if (row.costEfficiency !== null) {
    character.costEfficiency = row.costEfficiency;
  }

  if (row.imagePath) {
    character.imagePath = row.imagePath;
  }

  return character;
}

function characterToRow(character: CharacterDefinition): typeof characters.$inferInsert {
  return {
    id: character.id,
    name: character.name,
    description: character.description,
    mana: character.mana,
    maxMana: character.maxMana,
    hp: character.hp,
    maxHp: character.maxHp,
    affinity: JSON.stringify(character.affinity),
    elementXp: character.elementXp ? JSON.stringify(character.elementXp) : null,
    elementAffinity: character.elementAffinity ? JSON.stringify(character.elementAffinity) : null,
    effects: JSON.stringify(character.effects),
    controlBonus: character.controlBonus ?? null,
    costEfficiency: character.costEfficiency ?? null,
    imagePath: character.imagePath || null,
    storyIds: JSON.stringify(character.storyIds),
  };
}

export class CharactersRepository {
  private db = getDatabase();

  listAll(): CharacterDefinition[] {
    const rows = this.db
      .select()
      .from(characters)
      .orderBy(characters.name)
      .all();
    return rows.map(rowToCharacter);
  }

  getById(id: string): CharacterDefinition | null {
    const row = this.db
      .select()
      .from(characters)
      .where(eq(characters.id, id))
      .get();
    return row ? rowToCharacter(row) : null;
  }

  create(character: CharacterDefinition): void {
    const row = characterToRow(character);
    this.db.insert(characters).values(row).run();
  }

  update(character: CharacterDefinition): void {
    const row = characterToRow(character);
    this.db
      .update(characters)
      .set(row)
      .where(eq(characters.id, character.id))
      .run();
  }

  delete(id: string): void {
    this.db.delete(characters).where(eq(characters.id, id)).run();
  }

  exists(id: string): boolean {
    const result = this.db
      .select({ id: characters.id })
      .from(characters)
      .where(eq(characters.id, id))
      .get();
    return !!result;
  }
}

// Singleton instance
let repositoryInstance: CharactersRepository | null = null;

export function getCharactersRepository(): CharactersRepository {
  if (!repositoryInstance) {
    repositoryInstance = new CharactersRepository();
  }
  return repositoryInstance;
}

