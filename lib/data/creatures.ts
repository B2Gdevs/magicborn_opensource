// lib/data/creatures.ts
import type { CombatActor } from "@pkg/combat/EncounterService";
import { DamageType } from "@core/enums";

/**
 * A simple neutral goblin with no elemental affinity.
 */
export function makeNeutralGoblin(): CombatActor {
  return {
    id: "goblin_neutral",
    name: "Goblin",
    hp: 10,
    maxHp: 10,
    mana: 0,
    maxMana: 0,
    // no elementAffinity / elementXp: treated as neutral by AffinityService.getAffinity
    effects: [],
  };
}

/**
 * A goblin that is naturally resistant to Fire.
 * Used to test/feel affinity-based damage mitigation.
 */
export function makeFireResistantGoblin(): CombatActor {
  return {
    id: "goblin_fire_resistant",
    name: "Fire-Scarred Goblin",
    hp: 10,
    maxHp: 10,
    mana: 0,
    maxMana: 0,
    elementXp: {},

    // AffinityService.getAffinity only reads numeric values;
    // we mimic a "lives in fire" creature by giving it max Fire affinity.
    elementAffinity: {
      [DamageType.Fire]: 1,
    } as any,

    effects: [],
  };
}
