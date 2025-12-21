// lib/data/namedSpells.ts
import type { BaseEntity } from "@core/types";
import type { RuneCode } from "@core/types";
import { DamageType, SpellTag } from "@core/enums";
import { RC } from "@pkg/runes";
import { AchievementFlag } from "@/lib/data/achievements";
import type { EffectBlueprint } from "@core/effects";

/**
 * All known named spell IDs in the game.
 *
 * As we add more, extend this union and add them to the index below.
 */
export type NamedSpellId =
  | "ember_ray"
  | "searing_ember_ray"
  | "mind_lance"
  | "tidal_barrier";

/**
 * Spell definition - a named spell that can be evolved/discovered.
 * Extends BaseEntity with spell-specific properties.
 */
export interface SpellDefinition extends BaseEntity {
  id: NamedSpellId;

  // semantic tags for UI / filtering
  tags: SpellTag[];

  // Runes:
  //  - requiredRunes: spell must contain at least these runes
  //  - allowedExtraRunes: optional whitelist for any additional runes
  requiredRunes: RuneCode[];
  allowedExtraRunes?: RuneCode[];

  // “Shape” requirements – there are no levels in this game.
  //  - minDamageFocus: e.g. >= 0.6 Fire of total damage
  //  - minTotalPower: burst + full DoT must exceed this
  minDamageFocus?: {
    type: DamageType;
    ratio: number;
  };
  minTotalPower?: number;

  // Spellbook UX:
  hidden: boolean; // true: not shown until discovered
  hint: string; // guidance shown in spellbook

  // Evolution chain & gates:

  /**
   * If set, this blueprint can ONLY be used to evolve from this named spell.
   * Used for named → named chains (e.g. Ember Ray → Searing Ember Ray).
   */
  requiresNamedSourceId?: NamedSpellId;

  /**
   * Minimum per-rune familiarity for some runes (e.g., F ≥ 0.7, R ≥ 0.5).
   * This is checked via RuneFamiliarityService and Player.runeFamiliarity.
   */
  minRuneFamiliarity?: Partial<Record<RuneCode, number>>;

  /**
   * Minimum total familiarity score across all runes in the spell,
   * as computed by RuneFamiliarityService.getSpellRuneFamiliarityScore.
   */
  minTotalFamiliarityScore?: number;

  /**
   * Achievement / flag gates (e.g., boss kills, artifact acquisition).
   */
  requiredFlags?: AchievementFlag[];

  /**
   * Effects that this spell applies when cast.
   * These are in addition to any effects derived from runes.
   */
  effects?: EffectBlueprint[];
}

// Backward compatibility alias (deprecated - use SpellDefinition)
/** @deprecated Use SpellDefinition instead */
export type NamedSpellBlueprint = SpellDefinition;

/** 🔥 Ember Ray – base named Fire ray */
export const EMBER_RAY_BLUEPRINT: NamedSpellBlueprint = {
  id: "ember_ray",
  name: "Ember Ray",
  description:
    "A focused beam of searing flame that burns through armor and leaves lingering fire.",
  tags: [SpellTag.Fire, SpellTag.Ray, SpellTag.Burn],
  requiredRunes: [RC.Fire, RC.Air, RC.Ray],
  allowedExtraRunes: [RC.Duration, RC.Amplify, RC.Self, RC.Target],
  // Slightly forgiving focus & power so our canonical FAR spells qualify,
  // but still clearly “fire-focused”.
  minDamageFocus: { type: DamageType.Fire, ratio: 0.55 },
  minTotalPower: 1.0,
  hidden: false,
  hint: "Try weaving fire, air, and ray runes into a focused, high-fire pattern.",
};

/** 🔥 Searing Ember Ray – tier-2 evolution of Ember Ray */
export const SEARING_EMBER_RAY_BLUEPRINT: NamedSpellBlueprint = {
  id: "searing_ember_ray",
  name: "Searing Ember Ray",
  description:
    "An intensified Ember Ray that bites deeper into armor and leaves a vicious burn behind.",
  tags: [SpellTag.Fire, SpellTag.Ray, SpellTag.Burn],
  requiredRunes: [RC.Fire, RC.Air, RC.Ray],
  allowedExtraRunes: [RC.Duration, RC.Amplify, RC.Self, RC.Target],
  // We want this to feel like “a stronger Ember Ray”, but we don’t hard-gate
  // it on damage shape; familiarity + flags do the real gating.
  minDamageFocus: { type: DamageType.Fire, ratio: 0.55 },
  minTotalPower: 1.0,

  // This can ONLY be evolved from an already-named Ember Ray.
  requiresNamedSourceId: "ember_ray",

  // Familiarity gates: the player must have “lived” in FAR for a while.
  // (The exact thresholds are tuned by tests via RuneFamiliarityService.)
  minTotalFamiliarityScore: 1.0,

  // Achievement gate: e.g. defeat an early fire boss.
  requiredFlags: [AchievementFlag.BossFire1Defeated],

  hidden: true,
  hint:
    "Mastery with fire, air, and ray – and a hard-won victory over a fire boss – " +
    "can kindle a harsher, searing variant of Ember Ray.",
};

/** 🧠 Mind Lance */
export const MIND_LANCE_BLUEPRINT: NamedSpellBlueprint = {
  id: "mind_lance",
  name: "Mind Lance",
  description:
    "A piercing psychic strike that disrupts concentration and can silence spellcasters.",
  tags: [SpellTag.Mind, SpellTag.Debuff, SpellTag.Silence],
  requiredRunes: [RC.Mind, RC.Ray],
  allowedExtraRunes: [RC.Amplify, RC.Self, RC.Target],
  minDamageFocus: { type: DamageType.Mind, ratio: 0.5 },
  minTotalPower: 1.0,
  hidden: true,
  hint: "Strong mental focus with ray-like precision can manifest as a psychic lance.",
};

/** 🌊 Tidal Barrier */
export const TIDAL_BARRIER_BLUEPRINT: NamedSpellBlueprint = {
  id: "tidal_barrier",
  name: "Tidal Barrier",
  description:
    "A wall of water that absorbs incoming damage and slowly heals those behind it.",
  tags: [SpellTag.Water, SpellTag.Shield, SpellTag.Heal],
  requiredRunes: [RC.Water, RC.Crystal],
  allowedExtraRunes: [RC.Duration, RC.Self, RC.Target],
  minDamageFocus: { type: DamageType.Water, ratio: 0.4 },
  minTotalPower: 1.0,
  hidden: false,
  hint: "Mix water with crystal structure to create a flowing yet solid defense.",
};

// Legacy hardcoded blueprints (fallback if database is not available)
export const NAMED_SPELL_BLUEPRINTS: NamedSpellBlueprint[] = [
  EMBER_RAY_BLUEPRINT,
  SEARING_EMBER_RAY_BLUEPRINT,
  MIND_LANCE_BLUEPRINT,
  TIDAL_BARRIER_BLUEPRINT,
];

const BLUEPRINTS_BY_ID: Record<NamedSpellId, NamedSpellBlueprint> = {
  ember_ray: EMBER_RAY_BLUEPRINT,
  searing_ember_ray: SEARING_EMBER_RAY_BLUEPRINT,
  mind_lance: MIND_LANCE_BLUEPRINT,
  tidal_barrier: TIDAL_BARRIER_BLUEPRINT,
};

// Load from database with fallback to hardcoded data
function loadBlueprintsFromDatabase(): NamedSpellBlueprint[] {
  try {
    // Only load from DB on server-side
    // TODO: Re-enable when spellsRepository is available
    // if (typeof window === "undefined") {
    //   // Dynamic import to avoid bundling database code in client
    //   const { getSpellsRepository } = require("./spellsRepository");
    //   const repo = getSpellsRepository();
    //   const spells = repo.listAll();
    //   // Only use database data if we have valid spells that match known IDs
    //   // This ensures we fall back to hardcoded data if database is empty or corrupted
    //   if (spells.length > 0) {
    //     // Validate that we have at least the core blueprints
    //     const knownIds = new Set(NAMED_SPELL_BLUEPRINTS.map(bp => bp.id));
    //     const hasKnownSpells = spells.some((spell: NamedSpellBlueprint) => knownIds.has(spell.id));
    //     // If database has valid known spells, use it; otherwise fall back
    //     if (hasKnownSpells) {
    //       return spells;
    //     }
    //   }
    // }
  } catch (error) {
    console.warn("Failed to load spells from database, using fallback:", error);
  }
  // Fallback to hardcoded data
  return NAMED_SPELL_BLUEPRINTS;
}

export function listNamedBlueprints(): NamedSpellBlueprint[] {
  return loadBlueprintsFromDatabase();
}

export function getBlueprintById(
  id: NamedSpellId
): NamedSpellBlueprint | undefined {
  const blueprints = loadBlueprintsFromDatabase();
  return blueprints.find((bp) => bp.id === id);
}
