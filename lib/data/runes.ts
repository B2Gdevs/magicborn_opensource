// lib/data/runes.ts
// Rune entity definition - extends BaseEntity

import type { RuneCode, BaseEntity } from "@core/types";
import { DamageType, RuneTag, CrowdControlTag } from "@core/enums";
import type { DamageVector } from "@core/combat";
import type { EffectBlueprint } from "@core/effects";

export interface OverchargeEffect {
  minExtraMana: number;
  blueprint: EffectBlueprint;
}

/**
 * Rune definition - a single letter (A-Z) in the magic alphabet.
 * Extends BaseEntity with rune-specific properties.
 * 
 * Note: For runes, `code` is the unique ID (single letter A-Z).
 * - BaseEntity.id maps to code
 * - BaseEntity.name maps to concept
 */
export interface RuneDefinition extends BaseEntity {
  // For runes, code is the unique ID (single letter A-Z)
  // BaseEntity.id maps to code
  // BaseEntity.name maps to concept
  code: RuneCode; // This is the id for runes
  concept: string; // This is the name for runes
  
  // Rune properties
  powerFactor: number;
  controlFactor: number;
  instabilityBase: number; // 0..1
  tags: RuneTag[];
  manaCost: number;
  
  // Optional properties
  damage?: DamageVector;
  ccInstant?: CrowdControlTag[];
  pen?: Partial<Record<DamageType, number>>;
  effects?: EffectBlueprint[];
  overchargeEffects?: OverchargeEffect[];
  dotAffinity?: number;
}

// Backward compatibility alias (deprecated - use RuneDefinition)
/** @deprecated Use RuneDefinition instead */
export type RuneDef = RuneDefinition;

