// lib/data/namedSpells.ts
import type { RuneCode } from "@core/types";
import { DamageType, SpellTag } from "@core/enums";
import { RC } from "@pkg/runes";

export type NamedSpellId =
  | "ember_ray"
  | "mind_lance"
  | "tidal_barrier";

export interface NamedSpellBlueprint {
  id: NamedSpellId;
  name: string;
  description: string;

  // semantic tags for UI / filtering
  tags: SpellTag[];

  // Rune requirements:
  //  - requiredRunes: spell must contain at least these runes
  //  - allowedExtraRunes: optional whitelist for additional runes
  requiredRunes: RuneCode[];
  allowedExtraRunes?: RuneCode[];

  // “Shape” requirements – there are no character levels in this game.
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

  // Evolution gates – not fully enforced yet, but the data model is ready.
  requiresNamedSourceId?: NamedSpellId;                 // named → named evolutions
  minRuneFamiliarity?: Partial<Record<RuneCode, number>>;
  minTotalFamiliarityScore?: number;
  requiredFlags?: string[];                             // achievements / story flags
}

/** 🔥 Ember Ray */
export const EMBER_RAY_BLUEPRINT: NamedSpellBlueprint = {
  id: "ember_ray",
  name: "Ember Ray",
  description:
    "A focused beam of searing flame that burns through armor and leaves lingering fire.",
  tags: [SpellTag.Fire, SpellTag.Ray, SpellTag.Burn],
  requiredRunes: [RC.Fire, RC.Air, RC.Ray],
  allowedExtraRunes: [RC.Duration, RC.Amplify, RC.Self, RC.Target],
  minDamageFocus: { type: DamageType.Fire, ratio: 0.6 },
  minTotalPower: 8,
  hidden: false,
  hint: "Try weaving fire, air, and ray runes into a focused, high-fire pattern.",
};

/** 🧠 Mind Lance */
export const MIND_LANCE_BLUEPRINT: NamedSpellBlueprint = {
  id: "mind_lance",
  name: "Mind Lance",
  description:
    "A piercing psychic strike that disrupts concentration and can silence spellcasters.",
  tags: [SpellTag.Mind, SpellTag.Debuff, SpellTag.Silence],
  requiredRunes: [RC.Mind, RC.Ray],
  allowedExtraRunes: [RC.Amplify, RC.Self, RC.Target, RC.Persuasion, RC.Null],
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
  MIND_LANCE_BLUEPRINT,
  TIDAL_BARRIER_BLUEPRINT,
];

const BLUEPRINTS_BY_ID: Record<NamedSpellId, NamedSpellBlueprint> = {
  ember_ray: EMBER_RAY_BLUEPRINT,
  mind_lance: MIND_LANCE_BLUEPRINT,
  tidal_barrier: TIDAL_BARRIER_BLUEPRINT,
};

export function listNamedBlueprints(): NamedSpellBlueprint[] {
  return NAMED_SPELL_BLUEPRINTS;
}

export function getBlueprintById(
  id: NamedSpellId
): NamedSpellBlueprint | undefined {
  return BLUEPRINTS_BY_ID[id];
}
