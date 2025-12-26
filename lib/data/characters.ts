// lib/data/characters.ts
// Character definitions - extends CombatActor with description, image, and stories

import type { CombatActor, BaseEntity } from "@core/types";
import type { Player } from "@core/types";
import type { AlphabetVector } from "@core/types";
import type { ElementXpMap, ElementAffinityMap } from "@/lib/packages/player/AffinityService";
import type { EffectInstance } from "@core/effects";

/**
 * Character definition - a named character that can be a combatant.
 * Extends CombatActor and BaseEntity with character-specific fields.
 */
export interface CharacterDefinition extends CombatActor, BaseEntity {
  // Character-specific metadata
  storyIds: string[]; // Array of story file names from mordreds_legacy/stories (e.g., ["the-breath-between-footsteps"])

  // Player-specific fields (optional, for player-like characters)
  controlBonus?: number;   // reduces instability
  costEfficiency?: number; // reduces mana cost (0..0.3 typical)
}

