// lib/packages/spellFactory.ts
import type {
  AlphabetVector,
  RuneCode,
  RuneInfusion,
  Spell,
} from "@core/types";

/**
 * Normalize a sparse rune-count vector into a unit-ish vector,
 * so `profile` expresses proportions of each rune in the pattern.
 */
const normalize = (v: AlphabetVector): AlphabetVector => {
  let sum = 0;
  for (const k in v) {
    const key = k as RuneCode;
    sum += Math.abs(v[key] ?? 0);
  }
  if (!sum) return { ...v };

  const out: AlphabetVector = {};
  for (const k in v) {
    const key = k as RuneCode;
    out[key] = (v[key] ?? 0) / sum;
  }
  return out;
};

export class SpellFactory {
  /**
   * Create a fresh, nameless spell from a rune sequence.
   *
   * - name is null (player hasn't evolved it yet)
   * - profile is the normalized rune frequency vector
   * - growth starts at 0 and will be filled in by the evaluator
   * - combat is intentionally empty until evaluated
   * - infusions default to an empty array unless provided
   */
  createNameless(
    ownerId: string,
    runes: RuneCode[],
    infusions: RuneInfusion[] = []
  ): Spell {
    const profile = this.composeProfile(runes);

    return {
      id: crypto.randomUUID(),
      ownerId,
      name: null,
      runes: runes.slice(),
      profile,
      growth: {
        power: 0,
        control: 0,
        stability: 0,
        affinity: 0,
        versatility: 0,
      },
      infusions: infusions.slice(),
      // combat, lastEval, craftCost, evolvedFrom are filled later
    };
  }

  /**
   * Build a raw rune-count vector, then normalize it.
   */
  composeProfile(runes: RuneCode[]): AlphabetVector {
    const vec: AlphabetVector = {};
    for (const r of runes) {
      vec[r] = (vec[r] ?? 0) + 1;
    }
    return normalize(vec);
  }
}
