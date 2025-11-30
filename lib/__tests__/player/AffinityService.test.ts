import { describe, it, expect } from "vitest"; // or jest
import { DamageType } from "@core/enums";
import type { Spell } from "@core/types";
import { AffinityService } from "@pkg/player/AffinityService";
import { makeTestPlayer, makeFireSpell } from "@/lib/test/testFactories";

describe("AffinityService", () => {
  it("starts with zero affinity", () => {
    const player = makeTestPlayer();
    const fireAff = AffinityService.getAffinity(player, DamageType.Fire);
    expect(fireAff).toBe(0);
  });

  it("gains fire affinity from repeated fire spell usage", () => {
    const player = makeTestPlayer();
    const spell: Spell = makeFireSpell(10);

    for (let i = 0; i < 20; i++) {
      AffinityService.recordSpellUse(player, spell);
    }

    const fireAff = AffinityService.getAffinity(player, DamageType.Fire);
    expect(fireAff).toBeGreaterThan(0);
    expect(fireAff).toBeLessThanOrEqual(1);
  });

  it("does not gain affinity for elements not used", () => {
    const player = makeTestPlayer();
    const spell: Spell = makeFireSpell(10);

    for (let i = 0; i < 20; i++) {
      AffinityService.recordSpellUse(player, spell);
    }

    const iceAff = AffinityService.getAffinity(player, DamageType.Ice);
    expect(iceAff).toBe(0);
  });
});
