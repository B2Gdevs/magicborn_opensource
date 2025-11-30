// lib/core/creature.ts
import type { CombatActor } from "@core/types";

/**
 * Creature is just another combat actor.
 * Anything the player can do in combat (cast spells, gain affinity),
 * a creature can theoretically do as well.
 */
export interface Creature extends CombatActor {
  // Room for extensions:
  // - species: string;
  // - aiTag: "goblin" | "boss" | ...
  // - lootTableId: string;
}
