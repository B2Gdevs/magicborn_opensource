// lib/__tests__/player/RuneFamiliarityService.test.ts
import { describe, it, expect } from "vitest";
import { RuneFamiliarityService } from "@pkg/player/RuneFamiliarityService";
import type { RuneCode } from "@core/types";
import { makeTestPlayer, makeTestSpell } from "@/lib/test/testFactories";

describe("RuneFamiliarityService", () => {
  it("gains familiarity for runes used in a spell", () => {
    const player = makeTestPlayer();
    const spell = makeTestSpell({
      runes: ["F", "R", "F"] as RuneCode[],
    });

    // cast a few times
    for (let i = 0; i < 5; i++) {
      RuneFamiliarityService.recordSpellCast(player, spell);
    }

    const fam = player.affinity ?? {};
    const f = fam["F"] ?? 0;
    const r = fam["R"] ?? 0;
    const g = fam["G"] ?? 0;

    expect(f).toBeGreaterThan(0);
    expect(r).toBeGreaterThan(0);
    // F appears twice as often as R, so it should grow more
    expect(f).toBeGreaterThan(r);
    // unrelated rune stays at zero
    expect(g).toBe(0);
  });

  it("named spells grow familiarity faster than nameless spells", () => {
    const pNameless = makeTestPlayer();
    const pNamed = makeTestPlayer();

    const runes = ["F", "R", "F"] as RuneCode[];

    const nameless = makeTestSpell({
      name: null,
      runes,
    });

    const named = makeTestSpell({
      name: "Ember Ray",
      runes,
      evolvedFrom: "dummy_base_id",
    });

    // same number of casts for both
    const casts = 10;
    for (let i = 0; i < casts; i++) {
      RuneFamiliarityService.recordSpellCast(pNameless, nameless);
      RuneFamiliarityService.recordSpellCast(pNamed, named);
    }

    const fNameless = pNameless.affinity?.["F"] ?? 0;
    const fNamed = pNamed.affinity?.["F"] ?? 0;

    expect(fNameless).toBeGreaterThan(0);
    expect(fNamed).toBeGreaterThan(0);
    expect(fNamed).toBeGreaterThan(fNameless);
  });

  it("totalFamiliarityForSpell only sums runes present in the spell", () => {
    const player = makeTestPlayer({
      affinity: {
        F: 0.8,
        R: 0.4,
        G: 1.0,
      },
    });

    const spell = makeTestSpell({
      runes: ["F", "R"] as RuneCode[],
    });

    const total = RuneFamiliarityService.totalFamiliarityForSpell(player, spell);

    // should be F + R only
    expect(total).toBeCloseTo(0.8 + 0.4, 5);
  });
});
