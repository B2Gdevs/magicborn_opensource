// lib/test/creatureFactories.ts
import { DamageType } from "@core/enums";
import type { Creature } from "@core/creature";

let creatureCounter = 0;

export function makeGoblin(overrides: Partial<Creature> = {}): Creature {
  creatureCounter += 1;
  return {
    id: `goblin_${creatureCounter}`,
    name: "Goblin",
    mana: 50,
    maxMana: 50,
    affinity: {},          // no rune familiarity yet
    elementXp: {},
    elementAffinity: {},
    hp: 30,
    maxHp: 30,
    effects: [],
    ...overrides,
  };
}

export function makeFireResistantGoblin(): Creature {
  return makeGoblin({
    name: "Fire-Resistant Goblin",
  });
}
