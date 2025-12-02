// lib/data/namedSpells.ts
import type { RuneCode } from "@core/types";
import { DamageType, SpellTag } from "@core/enums";
import { RC } from "@pkg/runes";

export type NamedSpellId =
  | "ember_ray"
  | "searing_ember_ray"
  | "mind_lance"
  | "tidal_barrier";

export interface NamedSpellBlueprint {
  id: NamedSpellId;
  name: string;
  description: string;

  // semantic tags for UI / filtering
  tags: SpellTag[];

  // Runes:
  //  - requiredRunes: spell must contain at least these runes
  //  - allowedExtraRunes: optional whitelist for any additional runes
  requiredRunes: RuneCode[];
  allowedExtraRunes?: RuneCode[];

  // “Shape” requirements – there are no levels in this game.
  //  - minDamageFocus: e.g. >= 0.6 Fire of total damage
  //  - minTotalPower:  burst + full DoT must exceed this
  minDamageFocus?: {
    type: DamageType;
    ratio: number;
  };
  minTotalPower?: number;

  // Spellbook UX:
  hidden: boolean; // true: not shown until discovered
  hint: string;    // guidance shown in spellbook

  // Evolution / progression gates

  // If set, this blueprint can ONLY be used to evolve from this named spell.
  // Used for named → named tier-2 evolutions.
  requiresNamedSourceId?: NamedSpellId;

  // Minimum per-rune familiarity for some runes (e.g., F ≥ 0.7, R ≥ 0.5).
  minRuneFamiliarity?: Partial<Record<RuneCode, number>>;

  // Minimum total familiarity score across all runes in the spell.
  minTotalFamiliarityScore?: number;

  // Achievement / flag gates (cursed ring, raid feats, etc.).
  requiredFlags?: string[];
}

/** 🔥 Ember Ray – base named spell */
export const EMBER_RAY_BLUEPRINT: NamedSpellBlueprint = {
  id: "ember_ray",
  name: "Ember Ray",
  description:
    "A focused beam of searing flame that burns through armor and leaves lingering fire.",
  tags: [SpellTag.Fire, SpellTag.Ray, SpellTag.Burn],
  requiredRunes: [RC.Fire, RC.Air, RC.Ray],
  allowedExtraRunes: [RC.Duration, RC.Amplify, RC.Self, RC.Target],
  // Your F–A–R test spell logs show ~0.588 Fire focus; keep requirement just under that.
  minDamageFocus: { type: DamageType.Fire, ratio: 0.55 },
  // Test Ember Ray total power ≈ 1.836; keep a lower gate so it qualifies.
  minTotalPower: 1.5,
  hidden: false,
  hint: "Try weaving fire, air, and ray runes into a focused, high-fire pattern.",
};

/** 🔥🔥 Searing Ember Ray – tier-2 evolution of Ember Ray */
export const SEARING_EMBER_RAY_BLUEPRINT: NamedSpellBlueprint = {
  id: "searing_ember_ray",
  name: "Searing Ember Ray",
  description:
    "An intensified Ember Ray that burns hotter, bites deeper, and leaves longer-lasting flame.",
  tags: [SpellTag.Fire, SpellTag.Ray, SpellTag.Burn],
  requiredRunes: [RC.Fire, RC.Air, RC.Ray],
  allowedExtraRunes: [RC.Duration, RC.Amplify, RC.Self, RC.Target],
  // Same general “fire-focused” requirement – still rewards fire-heavy patterns.
  minDamageFocus: { type: DamageType.Fire, ratio: 0.55 },
  // Slightly above base Ember Ray, but still below the test spell’s ≈1.836 power.
  minTotalPower: 1.7,
  hidden: true,
  hint:
    "Only casters who have mastered Ember Ray and survived true fire trials " +
    "can unlock this searing refinement.",
  // Must come from an Ember Ray spell (named → named evolution).
  requiresNamedSourceId: "ember_ray",
  // Familiarity gates – tuned so ~80 F–A–R casts in the test satisfy this.
  minRuneFamiliarity: {
    [RC.Fire]: 0.5,
    [RC.Air]: 0.4,
    [RC.Ray]: 0.4,
  },
  // Aggregate familiarity threshold across the spell’s runes.
  minTotalFamiliarityScore: 1.3,
  // Achievement flag gate: e.g. first fire boss defeated.
  requiredFlags: ["boss_fire_1_defeated"],
};

/** 🧠 Mind Lance */
export const MIND_LANCE_BLUEPRINT: NamedSpellBlueprint = {
  id: "mind_lance",
  name: "Mind Lance",
  description:
    "A piercing psychic strike that disrupts concentration and can silence spellcasters.",
  tags: [SpellTag.Mind, SpellTag.Debuff, SpellTag.Silence],
  requiredRunes: [RC.Mind, RC.Ray],
  allowedExtraRunes: [RC.Amplify, RC.Self, RC.Target, "P" as RuneCode, "N" as RuneCode],
  minDamageFocus: { type: DamageType.Mind, ratio: 0.5 },
  minTotalPower: 7,
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
  minTotalPower: 5,
  hidden: false,
  hint: "Mix water with crystal structure to create a flowing yet solid defense.",
};

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

export function listNamedBlueprints(): NamedSpellBlueprint[] {
  return NAMED_SPELL_BLUEPRINTS;
}

export function getBlueprintById(id: NamedSpellId): NamedSpellBlueprint | undefined {
  return BLUEPRINTS_BY_ID[id];
}
