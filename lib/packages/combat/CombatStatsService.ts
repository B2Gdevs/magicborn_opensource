// lib/packages/combat/CombatStatsService.ts
import type { CombatActor, RuneCode, Spell } from "@core/types";
import type { CombatStats, DamageVector } from "@core/combat";
import { DamageType } from "@core/enums";
import type { EffectInstance } from "@core/effects";
import { RuneDef, RUNES } from "@pkg/runes";
import { SpellTraits } from "@pkg/spell/traits";

/**
 * Converts:
 *   - spell.runes
 *   - caster rune familiarity (actor.affinity)
 *   - spell growth
 *   - infusions
 * into a CombatStats snapshot and attaches it to the spell.
 */
export class CombatStatsService {
  derive(spell: Spell, caster: CombatActor): CombatStats {
    const traits = new SpellTraits(spell);
    const infusionMap = buildInfusionMap(spell);

    const burst: DamageVector = {} as DamageVector;
    const dot: DamageVector = {} as DamageVector;
    const penetration: Partial<Record<DamageType, number>> = {};
    const ccTags = new Set(spell.combat?.ccTags ?? []);
    const effects: EffectInstance[] = [];

    let burstScale = 1;
    let dotScale = 0;
    let critChance = 0.05;
    let critMult = 1.5;

    const { power: P, control: C, stability: S } = spell.growth;

    // --- per-rune accumulation phase ----------------------------------------
    for (let i = 0; i < spell.runes.length; i++) {
      const rune = spell.runes[i];
      const def = RUNES[rune];
      const extraMana = infusionMap.get(i) ?? 0;

      const affinityMul = computeAffinityMultiplier(caster, rune);
      const overchargeFactor = computeOverchargeFactor(def.manaCost, extraMana);

      accumulateDamageAndPen(
        def,
        affinityMul,
        overchargeFactor,
        burst,
        penetration
      );

      accumulateCrowdControl(def, ccTags);

      accumulateEffectsFromRune(
        def,
        traits,
        P,
        affinityMul,
        overchargeFactor,
        extraMana,
        effects
      );

      if (def.dotAffinity) {
        dotScale += def.dotAffinity;
      }
    }

    // --- global scaling & DoT spillover ------------------------------------
    applyGlobalScaling(traits, P, C, S, {
      burst,
      dot,
      penetration,
      ccTags,
      effects,
      burstScaleRef: { value: burstScale },
      dotScaleRef: { value: dotScale },
      critChanceRef: { value: critChance },
      critMultRef: { value: critMult },
    });

    const dotDurationSec = determineDotDuration(traits);

    const stats: CombatStats = {
      burst,
      dot,
      dotDurationSec: Math.max(0, dotDurationSec),
      penetration,
      critChance: clamp(critChance, 0, 0.6),
      critMult,
      ccTags: Array.from(ccTags),
      effects,
    };

    spell.combat = stats;
    return stats;
  }
}

// ---------------------------------------------------------------------------
// Helper functions (pure-ish) – small and self-documenting
// ---------------------------------------------------------------------------

function buildInfusionMap(spell: Spell): Map<number, number> {
  const map = new Map<number, number>();
  spell.infusions?.forEach((inf) => {
    const prev = map.get(inf.index) ?? 0;
    map.set(inf.index, prev + Math.max(0, inf.extraMana));
  });
  return map;
}

/** 0..1 rune familiarity → 1..1.5 multiplier per rune. */
function computeAffinityMultiplier(actor: CombatActor, rune: RuneCode): number {
  const raw = actor.affinity?.[rune] ?? 0;
  const aff = clamp(raw, 0, 1);
  return 1 + 0.5 * aff;
}

/**
 * Extra mana increases effect scaling and damage from that rune, capped.
 */
function computeOverchargeFactor(baseManaCost: number, extraMana: number): number {
  if (extraMana <= 0) return 1;
  const denom = baseManaCost * 2 || 1;
  const ratio = extraMana / denom;
  return 1 + Math.min(0.75, ratio);
}

function accumulateDamageAndPen(
  def: RuneDef,
  affinityMul: number,
  overchargeFactor: number,
  burst: DamageVector,
  penetration: Partial<Record<DamageType, number>>
) {
  if (def.damage) {
    for (const k in def.damage) {
      const type = k as DamageType;
      const base = def.damage[type] ?? 0;
      const scaled = base * affinityMul * overchargeFactor;
      burst[type] = (burst[type] ?? 0) + scaled;
    }
  }

  if (def.pen) {
    for (const k in def.pen) {
      const type = k as DamageType;
      penetration[type] = clamp(
        (penetration[type] ?? 0) + (def.pen[type] ?? 0),
        0,
        0.95
      );
    }
  }
}

function accumulateCrowdControl(def: RuneDef, ccTags: Set<string>) {
  def.ccInstant?.forEach((c) => ccTags.add(c));
}

function accumulateEffectsFromRune(
  def: RuneDef,
  traits: SpellTraits,
  power: number,
  affinityMul: number,
  overchargeFactor: number,
  extraMana: number,
  outEffects: EffectInstance[]
) {
  const durationMul = traits.hasDuration ? 1.5 : 1.0;
  const magScale = 1 + Math.min(0.5, power / 150);

  // base effects
  if (def.effects && def.effects.length > 0) {
    for (const blueprint of def.effects) {
      outEffects.push({
        type: blueprint.type,
        magnitude:
          blueprint.baseMagnitude * affinityMul * magScale * overchargeFactor,
        durationSec: Math.round(blueprint.baseDurationSec * durationMul),
        self: blueprint.self === true || traits.isSelfTarget,
      });
    }
  }

  // overcharge-only effect tiers
  if (def.overchargeEffects && extraMana > 0) {
    for (const tier of def.overchargeEffects) {
      if (extraMana < tier.minExtraMana) continue;
      outEffects.push({
        type: tier.blueprint.type,
        magnitude:
          tier.blueprint.baseMagnitude *
          affinityMul *
          magScale *
          overchargeFactor,
        durationSec: Math.round(
          tier.blueprint.baseDurationSec * durationMul
        ),
        self: tier.blueprint.self === true || traits.isSelfTarget,
      });
    }
  }
}

function determineDotDuration(traits: SpellTraits): number {
  const base = 3;
  return Math.round(base * (traits.hasDuration ? 1.5 : 1.0));
}

/**
 * Apply global scaling from spell traits & growth to burst/dot/pen, crit, etc.
 */
function applyGlobalScaling(
  traits: SpellTraits,
  power: number,
  control: number,
  stability: number,
  context: {
    burst: DamageVector;
    dot: DamageVector;
    penetration: Partial<Record<DamageType, number>>;
    ccTags: Set<string>;
    effects: EffectInstance[];
    burstScaleRef: { value: number };
    dotScaleRef: { value: number };
    critChanceRef: { value: number };
    critMultRef: { value: number };
  }
) {
  const { burst, dot, penetration } = context;
  let { value: burstScale } = context.burstScaleRef;
  let { value: dotScale } = context.dotScaleRef;
  let { value: critChance } = context.critChanceRef;
  let { value: critMult } = context.critMultRef;

  if (traits.hasDuration) dotScale += 0.15;
  if (traits.isAmplified) {
    burstScale += 0.2;
    critChance += 0.05;
  }
  if (traits.isAOE) burstScale += 0.15;
  if (traits.isBeamLike) burstScale += 0.1;

  burstScale *= 1 + Math.min(0.5, power / 100);
  dotScale *= 1 + Math.min(0.5, power / 150);
  critChance += Math.min(0.15, control / 500);
  critMult += Math.min(0.25, power / 400);

  for (const k in penetration) {
    const type = k as DamageType;
    penetration[type] = clamp(
      (penetration[type] ?? 0) * (1 + Math.min(0.3, stability / 400)),
      0,
      0.95
    );
  }

  const dotDurationSec = determineDotDuration(traits);

  // spill burst into DoT
  for (const k in burst) {
    const type = k as DamageType;
    const total = burst[type] ?? 0;
    const spill = total * clamp(dotScale, 0, 0.6);
    burst[type] = total - spill;
    if (spill > 0) {
      dot[type] =
        (dot[type] ?? 0) + spill / Math.max(1, dotDurationSec);
    }
  }

  // final burst scaling
  for (const k in burst) {
    const type = k as DamageType;
    burst[type] = (burst[type] ?? 0) * burstScale;
  }

  context.burstScaleRef.value = burstScale;
  context.dotScaleRef.value = dotScale;
  context.critChanceRef.value = critChance;
  context.critMultRef.value = critMult;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
