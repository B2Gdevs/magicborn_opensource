// lib/packages/player/AffinityService.ts
import type { CombatActor, Spell } from "@core/types";
import type { DamageVector } from "@core/combat";
import { DamageType } from "@core/enums";

export type ElementXpMap = Partial<Record<DamageType, number>>;
export type ElementAffinityMap = Partial<Record<DamageType, number>>;

const AFFINITY_SOFT_CAP = 1.0;
const XP_PER_POINT = 100; // tune the pace

export class AffinityService {
  static xpToAffinity(xp: number): number {
    const t = xp / XP_PER_POINT;
    const val = t / (1 + t); // 0 => 0, 100 => ~0.5, 300+ => ~0.75-1
    return Math.min(AFFINITY_SOFT_CAP, val);
  }

  static computeFocus(vec: DamageVector): Partial<Record<DamageType, number>> {
    let total = 0;
    for (const k in vec) {
      total += vec[k as DamageType] ?? 0;
    }
    if (total <= 0) return {};

    const out: Partial<Record<DamageType, number>> = {};
    for (const k in vec) {
      const type = k as DamageType;
      const v = vec[type] ?? 0;
      if (v > 0) out[type] = v / total;
    }
    return out;
  }

  /**
   * Call this when a spell is actually cast to grow elemental XP.
   * Works for any CombatActor (player or creature).
   */
  static recordSpellUse(actor: CombatActor, spell: Spell): void {
    if (!spell.combat) return;

    const burstFocus = this.computeFocus(spell.combat.burst);

    const dotTotal: DamageVector = {} as DamageVector;
    if (spell.combat.dot) {
      for (const k in spell.combat.dot) {
        const type = k as DamageType;
        dotTotal[type] =
          (dotTotal[type] ?? 0) +
          (spell.combat.dot[type] ?? 0) * spell.combat.dotDurationSec;
      }
    }
    const dotFocus = this.computeFocus(dotTotal);

    const xp: ElementXpMap = { ...(actor.elementXp ?? {}) };

    for (const type of Object.values(DamageType)) {
      const b = burstFocus[type] ?? 0;
      const d = dotFocus[type] ?? 0;
      const contribution = b * 1 + d * 0.7;
      if (contribution <= 0) continue;

      const prev = xp[type] ?? 0;
      xp[type] = prev + 10 * contribution; // 10 xp per full-focus cast, scaled

      // TODO: later we can scale this by:
      //  - named spell tier
      //  - rune familiarity
      //  - achievements (cursed ring, goblin kill milestones, etc.)
    }

    actor.elementXp = xp;
    actor.elementAffinity = this.recomputeAffinityMap(xp);
  }

  static recomputeAffinityMap(xp: ElementXpMap): ElementAffinityMap {
    const out: ElementAffinityMap = {};
    for (const type of Object.values(DamageType)) {
      const val = xp[type] ?? 0;
      if (val > 0) {
        out[type] = this.xpToAffinity(val);
      }
    }
    return out;
  }

  static getAffinity(actor: CombatActor, type: DamageType): number {
    const map: ElementAffinityMap = actor.elementAffinity ?? {};
    const val = map[type] ?? 0;
    return Math.max(0, Math.min(1, val));
  }
}
