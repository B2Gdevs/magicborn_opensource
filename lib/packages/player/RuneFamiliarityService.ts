// lib/packages/player/RuneFamiliarityService.ts
import type { Player, Spell, RuneCode } from "@core/types";

export type RuneXpMap = Partial<Record<RuneCode, number>>;

const RUNE_XP_PER_POINT = 50;    // tune as needed
const RUNE_SOFT_CAP = 1.0;

function xpToFamiliarity(xp: number): number {
  const t = xp / RUNE_XP_PER_POINT;
  const val = t / (1 + t);
  return Math.min(RUNE_SOFT_CAP, val);
}

export class RuneFamiliarityService {
  /** Aggregate rune counts from a spell’s rune sequence. */
  static countRunes(spell: Spell): Partial<Record<RuneCode, number>> {
    const counts: Partial<Record<RuneCode, number>> = {};
    for (const r of spell.runes) {
      counts[r] = (counts[r] ?? 0) + 1;
    }
    return counts;
  }

  /** Call when a spell is successfully cast. */
  static recordSpellUse(player: Player, spell: Spell, weight = 1): void {
    const counts = this.countRunes(spell);

    // Use a local XP map; we store familiarity directly on player.affinity.
    const xpMap: RuneXpMap = {};
    const current = player.affinity ?? {};

    for (const key in counts) {
      const rune = key as RuneCode;
      const uses = counts[rune] ?? 0;
      if (uses <= 0) continue;

      const currentFamiliarity = current[rune] ?? 0;
      const currentXp = this.familiarityToXpApprox(currentFamiliarity);
      const deltaXp = uses * 5 * weight; // 5 XP per rune occurrence * weight, tune later

      const newXp = currentXp + deltaXp;
      current[rune] = xpToFamiliarity(newXp);
    }

    player.affinity = current;
  }

  /** Helper: approximate inverse of xpToFamiliarity for incremental updates. */
  private static familiarityToXpApprox(f: number): number {
    if (f <= 0) return 0;
    // from f = t / (1 + t) ⇒ t = f / (1 - f)
    const t = f >= 0.999 ? 1e6 : f / (1 - f);
    return t * RUNE_XP_PER_POINT;
  }

  /** Aggregate familiarity score across all runes in a spell. */
  static getSpellRuneFamiliarityScore(player: Player, spell: Spell): number {
    const fam = player.affinity ?? {};
    let total = 0;
    for (const r of spell.runes) {
      total += fam[r] ?? 0;
    }
    return total;
  }
}
