// lib/data/creatures.ts
// Creature definitions - extends CombatActor with description, image, and stories

import type { CombatActor, BaseEntity } from "@core/types";
import { DamageType } from "@core/enums";
import type { ElementAffinityMap } from "@/lib/packages/player/AffinityService";

/**
 * Creature definition - a named creature/enemy that can be a combatant.
 * Extends CombatActor and BaseEntity with creature-specific fields.
 * Similar to CharacterDefinition but for enemies/creatures.
 */
export interface CreatureDefinition extends CombatActor, BaseEntity {
  // Creature-specific metadata
  imagePath?: string; // Path to image in public/game-content/creatures/ (legacy, use imageId instead)
  storyIds: string[]; // Array of story file names from mordreds_legacy/stories
}

/**
 * Factory functions for creating test creatures (used by raids)
 */
export function makeNeutralGoblin(): CombatActor {
  return {
    id: "goblin_neutral",
    name: "Goblin",
    hp: 50,
    maxHp: 50,
    mana: 0,
    maxMana: 0,
    affinity: {},
    elementAffinity: {}, // Neutral to all elements
    effects: [],
  };
}

export function makeFireResistantGoblin(): CombatActor {
  const fireAffinity: ElementAffinityMap = {
    [DamageType.Fire]: 1.0, // Max fire resistance
  };
  
  return {
    id: "goblin_fire_resistant",
    name: "Fire-Resistant Goblin",
    hp: 50,
    maxHp: 50,
    mana: 0,
    maxMana: 0,
    affinity: {},
    elementAffinity: fireAffinity,
    effects: [],
  };
}
