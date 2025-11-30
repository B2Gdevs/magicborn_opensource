import { EffectType } from "@core/enums";

export interface EffectBlueprint {
  type: EffectType;
  baseMagnitude: number;    // relative strength (0.0+)
  baseDurationSec: number;  // base duration in seconds
  self?: boolean;           // true = applies to caster by default
}

export interface EffectInstance {
  type: EffectType;
  magnitude: number;        // final scaled strength
  durationSec: number;      // final duration
  self: boolean;            // true = affects caster, false = affects target
}
