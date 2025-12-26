import { EffectType } from "@core/enums";
import type { EffectBlueprint } from "@core/effects";
import type { BaseEntity } from "@core/types";

export enum EffectCategory {
  DamageOverTime = "DamageOverTime",
  CrowdControl = "CrowdControl",
  Defensive = "Defensive",
  OffensiveBuff = "OffensiveBuff",
  Resource = "Resource",
}

export interface EffectDefinition extends BaseEntity {
  id: EffectType;
  category: EffectCategory;
  blueprint: EffectBlueprint;
  maxStacks?: number;
  isBuff: boolean;
  iconKey?: string;
}

export const EFFECT_DEFS: Record<EffectType, EffectDefinition> = {
  [EffectType.Burn]: {
    id: EffectType.Burn,
    name: "Burn",
    description: "Takes periodic fire damage over time.",
    category: EffectCategory.DamageOverTime,
    isBuff: false,
    iconKey: "effect_burn",
    blueprint: {
      type: EffectType.Burn,
      baseMagnitude: 3,
      baseDurationSec: 4,
    },
    maxStacks: 3,
  },
  [EffectType.Slow]: {
    id: EffectType.Slow,
    name: "Slow",
    description: "Movement and attack speed are reduced.",
    category: EffectCategory.CrowdControl,
    isBuff: false,
    iconKey: "effect_slow",
    blueprint: {
      type: EffectType.Slow,
      baseMagnitude: 0.25, // 25% slow
      baseDurationSec: 3,
    },
  },
  [EffectType.Shield]: {
    id: EffectType.Shield,
    name: "Barrier",
    description: "A temporary shield that absorbs damage.",
    category: EffectCategory.Defensive,
    isBuff: true,
    iconKey: "effect_shield",
    blueprint: {
      type: EffectType.Shield,
      baseMagnitude: 40,
      baseDurationSec: 6,
      self: true,
    },
  },
  [EffectType.Regen]: {
    id: EffectType.Regen,
    name: "Regeneration",
    description: "Slowly restores health over time.",
    category: EffectCategory.DamageOverTime,
    isBuff: true,
    iconKey: "effect_regen",
    blueprint: {
      type: EffectType.Regen,
      baseMagnitude: 4,
      baseDurationSec: 5,
      self: true,
    },
  },
  [EffectType.Vulnerable]: {
    id: EffectType.Vulnerable,
    name: "Vulnerable",
    description: "Target takes increased damage from all sources.",
    category: EffectCategory.OffensiveBuff,
    isBuff: false,
    iconKey: "effect_vulnerable",
    blueprint: {
      type: EffectType.Vulnerable,
      baseMagnitude: 0.2,
      baseDurationSec: 4,
    },
  },
  [EffectType.Fortified]: {
    id: EffectType.Fortified,
    name: "Fortified",
    description: "Takes reduced damage from all sources.",
    category: EffectCategory.Defensive,
    isBuff: true,
    iconKey: "effect_fortified",
    blueprint: {
      type: EffectType.Fortified,
      baseMagnitude: 0.2,
      baseDurationSec: 4,
      self: true,
    },
  },
  [EffectType.Poison]: {
    id: EffectType.Poison,
    name: "Poison",
    description: "Takes periodic poison damage over time.",
    category: EffectCategory.DamageOverTime,
    isBuff: false,
    iconKey: "effect_poison",
    blueprint: {
      type: EffectType.Poison,
      baseMagnitude: 2,
      baseDurationSec: 5,
    },
    maxStacks: 3,
  },
  [EffectType.Bleed]: {
    id: EffectType.Bleed,
    name: "Bleed",
    description: "Takes periodic physical damage over time.",
    category: EffectCategory.DamageOverTime,
    isBuff: false,
    iconKey: "effect_bleed",
    blueprint: {
      type: EffectType.Bleed,
      baseMagnitude: 2.5,
      baseDurationSec: 4,
    },
    maxStacks: 3,
  },
  [EffectType.Shock]: {
    id: EffectType.Shock,
    name: "Shock",
    description: "Electric-related debuff that disrupts abilities.",
    category: EffectCategory.CrowdControl,
    isBuff: false,
    iconKey: "effect_shock",
    blueprint: {
      type: EffectType.Shock,
      baseMagnitude: 1.0,
      baseDurationSec: 2,
    },
  },
  [EffectType.Stun]: {
    id: EffectType.Stun,
    name: "Stun",
    description: "Cannot act or move for the duration.",
    category: EffectCategory.CrowdControl,
    isBuff: false,
    iconKey: "effect_stun",
    blueprint: {
      type: EffectType.Stun,
      baseMagnitude: 1.0,
      baseDurationSec: 1,
    },
  },
  [EffectType.Silence]: {
    id: EffectType.Silence,
    name: "Silence",
    description: "Cannot cast spells or use mind abilities.",
    category: EffectCategory.CrowdControl,
    isBuff: false,
    iconKey: "effect_silence",
    blueprint: {
      type: EffectType.Silence,
      baseMagnitude: 1.0,
      baseDurationSec: 3,
    },
  },
};
