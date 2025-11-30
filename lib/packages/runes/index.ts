// lib/packages/runes/index.ts
import type { RuneCode } from "@core/types";
import { DamageType, RuneTag, CrowdControlTag, EffectType } from "@core/enums";
import type { DamageVector } from "@core/combat";
import type { EffectBlueprint } from "@core/effects";

export interface OverchargeEffect {
  minExtraMana: number;
  blueprint: EffectBlueprint;
}

export interface RuneDef {
  code: RuneCode;
  concept: string;
  powerFactor: number;
  controlFactor: number;
  instabilityBase: number; // 0..1
  tags: RuneTag[];
  manaCost: number;
  damage?: DamageVector;
  ccInstant?: CrowdControlTag[];
  pen?: Partial<Record<DamageType, number>>;
  effects?: EffectBlueprint[];
  overchargeEffects?: OverchargeEffect[];
  dotAffinity?: number;
}

/**
 * Convenience aliases so we don't scatter raw "F", "A", etc. literals.
 * Keep this in sync with `RUNES` below.
 */
export const RC = {
  Air: "A" as RuneCode,
  Burst: "B" as RuneCode,
  Crystal: "C" as RuneCode,
  Duration: "D" as RuneCode,
  Energy: "E" as RuneCode,
  Fire: "F" as RuneCode,
  Gravity: "G" as RuneCode,
  Heal: "H" as RuneCode,
  Ice: "I" as RuneCode,
  Jolt: "J" as RuneCode,
  Kinetic: "K" as RuneCode,
  Light: "L" as RuneCode,
  Mind: "M" as RuneCode,
  Null: "N" as RuneCode,
  Order: "O" as RuneCode,
  Persuasion: "P" as RuneCode,
  Quake: "Q" as RuneCode,
  Ray: "R" as RuneCode,
  Self: "S" as RuneCode,
  Target: "T" as RuneCode,
  Unbind: "U" as RuneCode,
  Void: "V" as RuneCode,
  Water: "W" as RuneCode,
  Amplify: "X" as RuneCode,
  Yield: "Y" as RuneCode,
  Zeal: "Z" as RuneCode,
};

export const RUNES: Record<RuneCode, RuneDef> = {
  A: {
    code: "A",
    concept: "Air",
    powerFactor: 0.9,
    controlFactor: 0.7,
    instabilityBase: 0.06,
    tags: [RuneTag.Utility],
    manaCost: 3,
    damage: { [DamageType.Physical]: 0.2 },
    ccInstant: [CrowdControlTag.Push],
  },
  B: {
    code: "B",
    concept: "Burst",
    powerFactor: 1.0,
    controlFactor: 0.6,
    instabilityBase: 0.07,
    tags: [RuneTag.AOE],
    manaCost: 6,
    damage: { [DamageType.Physical]: 0.4 },
  },
  C: {
    code: "C",
    concept: "Crystal",
    powerFactor: 0.8,
    controlFactor: 0.8,
    instabilityBase: 0.04,
    tags: [RuneTag.Buff],
    manaCost: 3,
    damage: { [DamageType.Physical]: 0.2 },
  },
  D: {
    code: "D",
    concept: "Duration",
    powerFactor: 0.5,
    controlFactor: 1.0,
    instabilityBase: 0.03,
    tags: [RuneTag.Buff],
    manaCost: 4,
    dotAffinity: 0.1,
  },
  E: {
    code: "E",
    concept: "Energy",
    powerFactor: 1.1,
    controlFactor: 0.9,
    instabilityBase: 0.08,
    tags: [RuneTag.Damage],
    manaCost: 5,
    damage: { [DamageType.Electric]: 0.8 },
  },
  F: {
    code: "F",
    concept: "Fire",
    powerFactor: 1.2,
    controlFactor: 0.6,
    instabilityBase: 0.1,
    tags: [RuneTag.Damage, RuneTag.DOT],
    manaCost: 7,
    damage: { [DamageType.Fire]: 1.0 },
    dotAffinity: 0.2,
    effects: [
      { type: EffectType.Burn, baseMagnitude: 1.0, baseDurationSec: 4 },
    ],
    overchargeEffects: [
      {
        minExtraMana: 4,
        blueprint: {
          type: EffectType.Burn,
          baseMagnitude: 0.7,
          baseDurationSec: 3,
        },
      },
      {
        minExtraMana: 8,
        blueprint: {
          type: EffectType.Vulnerable,
          baseMagnitude: 0.4,
          baseDurationSec: 3,
        },
      },
    ],
  },
  G: {
    code: "G",
    concept: "Gravity",
    powerFactor: 1.1,
    controlFactor: 0.7,
    instabilityBase: 0.09,
    tags: [RuneTag.CC],
    manaCost: 6,
    damage: { [DamageType.Gravity]: 0.7 },
    ccInstant: [CrowdControlTag.Slow],
  },
  H: {
    code: "H",
    concept: "Heal",
    powerFactor: 0.9,
    controlFactor: 0.8,
    instabilityBase: 0.02,
    tags: [RuneTag.Heal, RuneTag.Buff],
    manaCost: 5,
    damage: { [DamageType.Heal]: 0.9 },
    dotAffinity: 0.1,
    effects: [
      {
        type: EffectType.Regen,
        baseMagnitude: 1.0,
        baseDurationSec: 4,
        self: true,
      },
    ],
    overchargeEffects: [
      {
        minExtraMana: 4,
        blueprint: {
          type: EffectType.Shield,
          baseMagnitude: 0.6,
          baseDurationSec: 4,
          self: true,
        },
      },
    ],
  },
  I: {
    code: "I",
    concept: "Ice",
    powerFactor: 1.0,
    controlFactor: 0.7,
    instabilityBase: 0.05,
    tags: [RuneTag.Debuff],
    manaCost: 6,
    damage: { [DamageType.Ice]: 0.9 },
    dotAffinity: 0.1,
    ccInstant: [CrowdControlTag.Slow],
    effects: [
      { type: EffectType.Slow, baseMagnitude: 0.8, baseDurationSec: 3 },
    ],
    overchargeEffects: [
      {
        minExtraMana: 5,
        blueprint: {
          type: EffectType.Vulnerable,
          baseMagnitude: 0.4,
          baseDurationSec: 3,
        },
      },
    ],
  },
  J: {
    code: "J",
    concept: "Jolt",
    powerFactor: 1.1,
    controlFactor: 0.7,
    instabilityBase: 0.08,
    tags: [RuneTag.Damage, RuneTag.CC],
    manaCost: 6,
    damage: { [DamageType.Electric]: 1.0 },
    ccInstant: [CrowdControlTag.Stun],
    effects: [
      { type: EffectType.Shock, baseMagnitude: 1.0, baseDurationSec: 2 },
    ],
  },
  K: {
    code: "K",
    concept: "Kinetic",
    powerFactor: 1.0,
    controlFactor: 0.6,
    instabilityBase: 0.06,
    tags: [RuneTag.Damage, RuneTag.CC],
    manaCost: 5,
    damage: { [DamageType.Physical]: 0.8 },
    dotAffinity: 0.1,
    effects: [
      { type: EffectType.Bleed, baseMagnitude: 0.6, baseDurationSec: 3 },
    ],
  },
  L: {
    code: "L",
    concept: "Light",
    powerFactor: 0.9,
    controlFactor: 0.8,
    instabilityBase: 0.04,
    tags: [RuneTag.Utility, RuneTag.Debuff],
    manaCost: 4,
    damage: { [DamageType.Light]: 0.7 },
  },
  M: {
    code: "M",
    concept: "Mind",
    powerFactor: 0.7,
    controlFactor: 1.0,
    instabilityBase: 0.07,
    tags: [RuneTag.Debuff, RuneTag.Utility, RuneTag.Buff],
    manaCost: 5,
    damage: { [DamageType.Mind]: 0.8 },
    ccInstant: [CrowdControlTag.Silence],
    effects: [
      { type: EffectType.Silence, baseMagnitude: 1.0, baseDurationSec: 2 },
      { type: EffectType.Vulnerable, baseMagnitude: 0.5, baseDurationSec: 3 },
    ],
    overchargeEffects: [
      {
        minExtraMana: 5,
        blueprint: {
          type: EffectType.Silence,
          baseMagnitude: 0.5,
          baseDurationSec: 3,
        },
      },
    ],
  },
  N: {
    code: "N",
    concept: "Null",
    powerFactor: 0.6,
    controlFactor: 1.1,
    instabilityBase: 0.09,
    tags: [RuneTag.Silence, RuneTag.Debuff],
    manaCost: 4,
    damage: {},
    ccInstant: [CrowdControlTag.Silence],
    effects: [
      { type: EffectType.Silence, baseMagnitude: 1.0, baseDurationSec: 3 },
    ],
  },
  O: {
    code: "O",
    concept: "Order",
    powerFactor: 0.6,
    controlFactor: 1.1,
    instabilityBase: 0.03,
    tags: [RuneTag.Buff],
    manaCost: 3,
    effects: [
      {
        type: EffectType.Fortified,
        baseMagnitude: 0.6,
        baseDurationSec: 4,
        self: true,
      },
    ],
  },
  P: {
    code: "P",
    concept: "Persuasion",
    powerFactor: 0.6,
    controlFactor: 1.0,
    instabilityBase: 0.05,
    tags: [RuneTag.Buff, RuneTag.Debuff],
    manaCost: 4,
    damage: { [DamageType.Mind]: 0.5 },
  },
  Q: {
    code: "Q",
    concept: "Quake",
    powerFactor: 1.2,
    controlFactor: 0.7,
    instabilityBase: 0.09,
    tags: [RuneTag.AOE, RuneTag.CC, RuneTag.Damage],
    manaCost: 7,
    damage: { [DamageType.Physical]: 1.2 },
    ccInstant: [CrowdControlTag.Knockdown],
  },
  R: {
    code: "R",
    concept: "Ray",
    powerFactor: 0.8,
    controlFactor: 0.9,
    instabilityBase: 0.04,
    tags: [RuneTag.Damage],
    manaCost: 3,
    damage: { [DamageType.Light]: 0.5 },
  },
  S: {
    code: "S",
    concept: "Self",
    powerFactor: 0.0,
    controlFactor: 0.8,
    instabilityBase: 0.0,
    tags: [RuneTag.Buff, RuneTag.Heal, RuneTag.Utility],
    manaCost: 2,
  },
  T: {
    code: "T",
    concept: "Target",
    powerFactor: 0.0,
    controlFactor: 0.8,
    instabilityBase: 0.0,
    tags: [RuneTag.Damage, RuneTag.Debuff, RuneTag.Heal, RuneTag.Utility],
    manaCost: 2,
  },
  U: {
    code: "U",
    concept: "Unbind",
    powerFactor: 0.5,
    controlFactor: 1.0,
    instabilityBase: 0.06,
    tags: [RuneTag.Utility],
    manaCost: 3,
  },
  V: {
    code: "V",
    concept: "Void",
    powerFactor: 1.2,
    controlFactor: 0.6,
    instabilityBase: 0.12,
    tags: [RuneTag.Damage, RuneTag.Debuff, RuneTag.Silence],
    manaCost: 7,
    damage: { [DamageType.Void]: 1.1 },
    dotAffinity: 0.1,
    ccInstant: [CrowdControlTag.Silence],
    pen: { [DamageType.Void]: 0.2 },
    effects: [
      { type: EffectType.Vulnerable, baseMagnitude: 0.8, baseDurationSec: 3 },
    ],
    overchargeEffects: [
      {
        minExtraMana: 5,
        blueprint: {
          type: EffectType.Burn,
          baseMagnitude: 0.4,
          baseDurationSec: 3,
        },
      },
    ],
  },
  W: {
    code: "W",
    concept: "Water",
    powerFactor: 0.9,
    controlFactor: 0.8,
    instabilityBase: 0.04,
    tags: [RuneTag.Utility, RuneTag.Heal],
    manaCost: 4,
    damage: { [DamageType.Water]: 0.7 },
    dotAffinity: 0.05,
    effects: [
      {
        type: EffectType.Regen,
        baseMagnitude: 0.7,
        baseDurationSec: 4,
        self: true,
      },
    ],
  },
  X: {
    code: "X",
    concept: "Amplify",
    powerFactor: 1.4,
    controlFactor: 0.5,
    instabilityBase: 0.14,
    tags: [RuneTag.Buff],
    manaCost: 6,
  },
  Y: {
    code: "Y",
    concept: "Yield",
    powerFactor: 0.6,
    controlFactor: 1.0,
    instabilityBase: 0.03,
    tags: [RuneTag.Buff, RuneTag.Utility],
    manaCost: 3,
  },
  Z: {
    code: "Z",
    concept: "Zeal",
    powerFactor: 1.0,
    controlFactor: 0.7,
    instabilityBase: 0.08,
    tags: [RuneTag.Buff],
    manaCost: 4,
  },
};

export function listRunes() {
  return Object.values(RUNES);
}
