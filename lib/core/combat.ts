import type { RuneCode } from "./types";
import { DamageType, CrowdControlTag } from "./enums";
import type { EffectInstance } from "./effects";

export type DamageVector = Partial<Record<DamageType, number>>;
export type ResistVector  = Partial<Record<DamageType, number>>; // 0..1

export interface CombatStats {
  burst: DamageVector;       // instant damage per type
  dot: DamageVector;         // per-second damage per type
  dotDurationSec: number;    // DoT ticks length
  penetration: Partial<Record<DamageType, number>>; // 0..1 reduces target resist
  critChance: number;        // 0..1
  critMult: number;          // 1.0+
  ccTags: CrowdControlTag[]; // instantaneous CC tags
  effects: EffectInstance[]; // status buffs/debuffs applied on hit
}

export interface Entity {
  id: string;
  name: string;
  affinity: Partial<Record<RuneCode, number>>;
  resist: ResistVector;
  damageAmp?: number;
  damageMit?: number;
}

export { DamageType } from "./enums";
