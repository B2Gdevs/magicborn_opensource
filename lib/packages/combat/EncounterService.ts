// lib/packages/combat/EncounterService.ts
import { DamageType } from "@core/enums";
import type { Spell, Player } from "@core/types";
import type { DamageVector } from "@core/combat";
import type { EffectInstance } from "@core/effects";
import { CombatStatsService } from "@pkg/combat/CombatStatsService";
import { AffinityService } from "@pkg/player/AffinityService";

export interface CombatActor {
  id: string;
  name: string;

  hp: number;
  maxHp: number;

  // resource pool – minimal for now
  mana: number;
  maxMana: number;

  // element-based resistance/identity (same shape as Player/Creature)
  elementAffinity?: ReturnType<typeof AffinityService["recomputeAffinityMap"]>;
  elementXp?: Record<string, number>;

  // active status effects
  effects: EffectInstance[];
}

export interface SpellHitResult {
  casterId: string;
  targetId: string;

  perType: DamageVector;
  totalDamage: number;

  targetHpBefore: number;
  targetHpAfter: number;
}

const ZERO_DAMAGE_VECTOR: DamageVector = {
  [DamageType.Physical]: 0,
  [DamageType.Fire]: 0,
  [DamageType.Ice]: 0,
  [DamageType.Water]: 0,
  [DamageType.Electric]: 0,
  [DamageType.Light]: 0,
  [DamageType.Void]: 0,
  [DamageType.Gravity]: 0,
  [DamageType.Mind]: 0,
  [DamageType.Heal]: 0,
};

export class EncounterService {
  private readonly stats: CombatStatsService;

  constructor(statsService?: CombatStatsService) {
    this.stats = statsService ?? new CombatStatsService();
  }

  /**
   * Resolve a single spell hit from `caster` to `target`.
   *
   * Responsibilities:
   *  - Ensure the spell has up-to-date CombatStats (burst / dot / effects).
   *  - Apply elementAffinity-based resistance for the target.
   *  - Reduce target HP accordingly.
   *  - Attach on-hit effects (Burn, etc.) to the target.
   */
  resolveSpellHit(
    caster: CombatActor | Player,
    spell: Spell,
    target: CombatActor
  ): SpellHitResult {
    // 1) Ensure combat snapshot exists AND has effects.
    //    If the spell came from a test factory with a hand-made `combat`
    //    (no effects), we still want to derive rune-based effects at least once.
    if (!spell.combat || !spell.combat.effects || spell.combat.effects.length === 0) {
      this.stats.derive(spell, caster as Player);
    }

    const combat = spell.combat!;
    const perType: DamageVector = { ...ZERO_DAMAGE_VECTOR };
    let totalDamage = 0;

    // 2) Apply per-type damage with resistance from elementAffinity.
    for (const type of Object.values(DamageType)) {
      const base = combat.burst[type] ?? 0;
      if (base <= 0) continue;

      const defensiveAffinity = AffinityService.getAffinity(target as any, type);
      const mitigation = computeDefensiveMultiplier(defensiveAffinity);
      const applied = base * mitigation;

      if (applied > 0) {
        perType[type] = (perType[type] ?? 0) + applied;
        totalDamage += applied;
      }
    }

    const targetHpBefore = target.hp;
    const targetHpAfter = Math.max(0, targetHpBefore - totalDamage);
    target.hp = targetHpAfter;

    // 3) Apply on-hit effects from the spell to the target.
    if (combat.effects && combat.effects.length > 0) {
      for (const eff of combat.effects) {
        // shallow copy is fine for now
        target.effects.push({ ...eff });
      }
    }

    return {
      casterId: caster.id,
      targetId: target.id,
      perType,
      totalDamage,
      targetHpBefore,
      targetHpAfter,
    };
  }
}

/**
 * 0 affinity  -> 1.0 (no mitigation)
 * 1 affinity  -> 0.5 (50% damage taken)
 * scales linearly between.
 */
function computeDefensiveMultiplier(affinity: number): number {
  const a = clamp(affinity, 0, 1);
  return 1 - 0.5 * a;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
