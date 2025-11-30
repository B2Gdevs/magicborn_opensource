// lib/core/enums.ts

export enum DamageType {
  Physical = "physical",
  Fire = "fire",
  Ice = "ice",
  Water = "water",
  Electric = "electric",
  Light = "light",
  Void = "void",
  Gravity = "gravity",
  Mind = "mind",
  Heal = "heal",
}

// high-level rune category tags
export enum RuneTag {
  Damage = "Damage",
  Heal = "Heal",
  Buff = "Buff",
  Debuff = "Debuff",
  Utility = "Utility",
  AOE = "AOE",
  CC = "CC",
  DOT = "DOT",
  Silence = "Silence",
}

// crowd control tags (instant, on-hit)
export enum CrowdControlTag {
  Push = "push",
  Slow = "slow",
  Stun = "stun",
  Knockdown = "knockdown",
  Silence = "silence",
}

// status / ongoing / buff/debuff effects
export enum EffectType {
  Burn = "burn",
  Poison = "poison",
  Bleed = "bleed",
  Shock = "shock",
  Slow = "slow",
  Stun = "stun",
  Silence = "silence",
  Shield = "shield",
  Regen = "regen",
  Vulnerable = "vulnerable",
  Fortified = "fortified",
}

/**
 * Tags you can hang on spells for UI / filtering / flavor.
 * We’ll still store them as strings at the edges, but internally
 * we reference this enum instead of raw string literals.
 */
export enum SpellTag {
  Fire = "Fire",
  Ray = "Ray",
  Burn = "Burn",
  Mind = "Mind",
  Debuff = "Debuff",
  Silence = "Silence",
  Water = "Water",
  Shield = "Shield",
  Heal = "Heal",
}
