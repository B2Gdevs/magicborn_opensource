// lib/core/types.ts
import type { RuneTag } from "./enums";
import type { CombatStats } from "./combat";
import type {
  ElementAffinityMap,
  ElementXpMap,
} from "../packages/player/AffinityService";
import type { EffectInstance } from "./effects";

/**
 * All possible rune “letters” in the magic alphabet.
 */
export type RuneCode =
  | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M"
  | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z";

/**
 * Sparse vector of rune weights.
 * Used to describe the normalized “profile” of a spell,
 * and also rune familiarity on actors.
 */
export type AlphabetVector = Partial<Record<RuneCode, number>>;

/**
 * Base combat actor: both Player and Creature share this.
 *
 * There are NO levels:
 * - Element XP / affinity is “progression”.
 * - Rune familiarity is “pattern mastery”.
 */
export interface CombatActor {
  id: string;
  name: string;

  // Resource pools
  mana: number;
  maxMana: number;

  // Vitality
  hp: number;
  maxHp: number;

  // Rune familiarity – how comfortable this actor is with each letter.
  affinity: AlphabetVector;

  // Element-based growth / resistance:
  // High Fire affinity ⇒ strong with Fire and naturally resistant to Fire.
  elementXp?: ElementXpMap;
  elementAffinity?: ElementAffinityMap;

  // Active status effects on the actor.
  effects: EffectInstance[];
}

/**
 * Player: a controllable combat actor.
 * Adds knobs that affect spell evaluation and instability.
 */
export interface Player extends CombatActor {
  controlBonus?: number;   // reduces instability
  costEfficiency?: number; // reduces mana cost (0..0.3 typical)

  // Room for future: inventory, equipped gear IDs, etc.
}

/**
 * Extra mana invested into a specific rune occurrence in a spell.
 * This is how “infusions” / overcharge are represented.
 */
export interface RuneInfusion {
  /** Index into spell.runes (0-based) for this particular rune occurrence. */
  index: number;
  /** Extra mana invested into this rune on top of its base manaCost. */
  extraMana: number;
}

/**
 * Growth values describe how the spell tends to behave once evaluated.
 * These are derived, not leveled.
 */
export interface SpellGrowth {
  power: number;
  control: number;
  stability: number;
  affinity: number;
  versatility: number;
}

/**
 * Snapshot used mostly for UI / log:
 * - power / cost / instability / synergy are scalar scores
 * - effects is a list of high-level tags (not combat effects)
 */
export interface SpellEvalSnapshot {
  power: number;
  cost: number;           // total mana cost (base + extra)
  instability: number;
  synergy: number;
  effects: RuneTag[];
}

/**
 * Spell is a crafted incantation.
 *
 * Important design points:
 * - There is NO level or xp on spells.
 * - name === null/undefined ⇒ “nameless” spell.
 * - Growth comes entirely from usage (actor affinity) + crafting choices.
 */
export interface Spell {
  id: string;
  ownerId: string;

  /** null/undefined => “Nameless” spell; non-null => evolved / named. */
  name?: string | null;

  /** The exact rune sequence used to construct the spell. */
  runes: RuneCode[];

  /** Normalized frequency vector derived from the rune sequence. */
  profile: AlphabetVector;

  /** Growth stats derived when the spell is evaluated. */
  growth: SpellGrowth;

  /**
   * Optional extra mana invested into specific rune slots during crafting.
   * Used to unlock extra effect tiers and scale certain effects.
   */
  infusions?: RuneInfusion[];

  /** Cached evaluation for UI / quick lookup. */
  lastEval?: SpellEvalSnapshot;

  /** Cached combat stats derived from runes + growth + infusions + actor affinity. */
  combat?: CombatStats;

  /** Snapshot of cost at creation, if you want to keep it. */
  craftCost?: number;

  /** If this spell is evolved, track the source spell id. */
  evolvedFrom?: string;
}
