// lib/packages/player/RuneFamiliarityService.ts
import type { Player, RuneCode, Spell, AlphabetVector } from "@core/types";

/**
 * Rune familiarity is stored directly on Player.affinity (AlphabetVector).
 *
 * Semantics:
 *  - 0.0 .. 1.0 per rune.
 *  - Increases when that rune appears in a cast spell.
 *  - Growth is slower for nameless spells, faster for evolved/named spells.
 *
 * This is separate from elementAffinity (DamageType-based) which grows via
 * AffinityService using actual damage vectors.
 */
export class RuneFamiliarityService {
  // Tunable constants
  private static readonly BASE_STEP = 0.02;   // full-focus cast → +0.02 at tier 1
  private static readonly NAMELESS_MULT = 0.5;
  private static readonly NAMED_MULT = 1.0;
  private static readonly EVOLVED_MULT = 1.3;
  private static readonly MAX_FAMILIARITY = 1.0;

  /**
   * Record a spell cast and increment familiarity for all runes used.
   *
   * Uses spell.profile if present, otherwise derives it from spell.runes.
   * profile is a normalized frequency vector: sum(weights) ≈ 1.
   */
  static recordSpellCast(player: Player, spell: Spell): void {
    const profile = this.ensureProfile(spell);
    const tierMul = this.computeTierMultiplier(spell);

    const current: AlphabetVector = { ...(player.affinity ?? {}) };
    let changed = false;

    for (const key in profile) {
      const rune = key as RuneCode;
      const weight = profile[rune] ?? 0;
      if (weight <= 0) continue;

      const gain = this.BASE_STEP * weight * tierMul;
      if (gain <= 0) continue;

      const prev = current[rune] ?? 0;
      const next = clamp(prev + gain, 0, this.MAX_FAMILIARITY);

      if (next !== prev) {
        current[rune] = next;
        changed = true;
      }
    }

    if (changed) {
      player.affinity = current;
    }
  }

  /**
   * Get familiarity for a single rune (0..1).
   * Handy for evolution gates that specify minRuneFamiliarity per letter.
   */
  static getRuneFamiliarity(player: Player, rune: RuneCode): number {
    const fam = player.affinity ?? {};
    const val = fam[rune] ?? 0;
    return clamp(val, 0, this.MAX_FAMILIARITY);
  }

  /**
   * Sum familiarity over the runes in a spell.
   * This is what matches your `getSpellRuneFamiliarityScore(...)` usage
   * in EvolutionService.
   */
  static getSpellRuneFamiliarityScore(player: Player, spell: Spell): number {
    return this.totalFamiliarityForSpell(player, spell);
  }

  /**
   * Same as getSpellRuneFamiliarityScore, but kept public in case we want
   * a more descriptive name elsewhere.
   */
  static totalFamiliarityForSpell(player: Player, spell: Spell): number {
    const fam = player.affinity ?? {};
    let total = 0;

    for (const r of spell.runes) {
      total += fam[r] ?? 0;
    }
    return total;
  }

  /**
   * Ensure we have a normalized rune profile.
   * Falls back to deriving it from the rune sequence if spell.profile
   * is missing or empty.
   */
  private static ensureProfile(spell: Spell): AlphabetVector {
    if (spell.profile && Object.keys(spell.profile).length > 0) {
      return spell.profile;
    }

    const counts: Partial<Record<RuneCode, number>> = {};
    for (const r of spell.runes) {
      counts[r] = (counts[r] ?? 0) + 1;
    }

    const total = spell.runes.length || 0;
    if (total <= 0) return {};

    const profile: AlphabetVector = {};
    for (const key in counts) {
      const rune = key as RuneCode;
      const c = counts[rune] ?? 0;
      if (c > 0) {
        profile[rune] = c / total;
      }
    }

    return profile;
  }

  /**
   * Spells that are:
   *  - nameless        → slow growth
   *  - first-tier named→ normal growth
   *  - evolved chain   → slightly faster
   *
   * This gives strong incentive to evolve and use higher-tier spells
   * instead of spamming nameless ones forever.
   */
  private static computeTierMultiplier(spell: Spell): number {
    if (!spell.name) {
      return this.NAMELESS_MULT;
    }
    if (spell.evolvedFrom) {
      return this.EVOLVED_MULT;
    }
    return this.NAMED_MULT;
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
