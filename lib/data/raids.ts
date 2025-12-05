// lib/data/raids/tutorialRaid.ts
import type { CombatActor } from "@pkg/combat/EncounterService";
import type { AchievementFlag } from "@/lib/data/achievements";
import { AchievementFlag as AF } from "@/lib/data/achievements";
import { makeNeutralGoblin, makeFireResistantGoblin } from "@/lib/data/creatures";

/**
 * Single encounter definition inside a raid.
 * For now this is extremely minimal; later we can add terrain, hazards, etc.
 */
export interface RaidEncounterDef {
  id: string;
  name: string;
  // Creatures participating in this encounter.
  // At runtime, these will be cloned, not mutated in-place.
  creatures: CombatActor[];
}

/**
 * Raid-level rewards (what we grant on completion).
 */
export interface RaidRewardDef {
  achievementFlags?: AchievementFlag[];
  // later: items, currencies, unlock tokens, etc.
}

/**
 * High-level raid definition.
 */
export interface RaidDef {
  id: string;
  name: string;
  description: string;
  encounters: RaidEncounterDef[];
  rewards: RaidRewardDef;
}

/**
 * A tiny tutorial raid for the fire path:
 * - Encounter 1: neutral goblin (baseline damage check).
 * - Encounter 2: fire-resistant goblin (shows mitigation).
 * - Reward: BossFire1Defeated, which gates Searing Ember Ray.
 *
 * NOTE: This is just data; a future raid runner will drive the actual fights.
 */
export const TUTORIAL_FIRE_RAID: RaidDef = {
  id: "tutorial_fire_raid",
  name: "Tutorial: Ember Trial",
  description:
    "A simple two-room delve: first test your new fire spell on a goblin, then on a fire-hardened foe.",
  encounters: [
    {
      id: "tutorial_fire_raid_room_1",
      name: "Goblin Ambush",
      creatures: [makeNeutralGoblin()],
    },
    {
      id: "tutorial_fire_raid_room_2",
      name: "Fire-Scarred Goblin",
      creatures: [makeFireResistantGoblin()],
    },
  ],
  rewards: {
    achievementFlags: [AF.BossFire1Defeated],
  },
};
