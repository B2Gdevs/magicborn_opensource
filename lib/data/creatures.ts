// lib/data/creatures.ts
// Creature definitions - extends CombatActor with description, image, and stories

import type { CombatActor } from "@core/types";

/**
 * Creature definition - a named creature/enemy that can be a combatant.
 * Extends CombatActor with description, image, and associated stories.
 * Similar to CharacterDefinition but for enemies/creatures.
 */
export interface CreatureDefinition extends CombatActor {
  // Creature-specific metadata
  description: string;
  imagePath?: string; // Path to image in public/game-content/creatures/
  storyIds: string[]; // Array of story file names from mordreds_legacy/stories
}
