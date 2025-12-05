// lib/data/achievements.ts

/**
 * Central place for world / achievement flags.
 *
 * These are used by evolution blueprints (e.g. Searing Ember Ray)
 * and later by raids, story events, etc.
 */
export enum AchievementFlag {
    // First fire boss in the early game / tutorial raid.
    BossFire1Defeated = "boss_fire_1_defeated",
  
    // Future examples (not wired yet, but reserved):
    // Killed100Goblins = "killed_100_goblins",
    // ClearedTutorialRaidNoHit = "cleared_tutorial_raid_no_hit",
    // FoundCursedRingOfEmbers = "found_cursed_ring_of_embers",
  }
  
  /**
   * Convenience alias for a set of achievement flags.
   */
  export type AchievementFlagSet = Set<AchievementFlag>;
  