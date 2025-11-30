// lib/__tests__/combat/CombatStatsService.test.ts
import { describe, it, expect } from "vitest";
import { CombatStatsService } from "@/lib/packages/combat/CombatStatsService";
import { DamageType } from "@core/enums";
import { RUNES } from "@pkg/runes";
import { makeTestSpell } from "@/lib/test/testFactories";
import { makeNeutralPlayer, makeHighFirePlayer } from "@/lib/__tests__/fixtures/players";
import {
  makeFireRayBaseSpell,
  makeFireRayInfusedSpell,
} from "@/lib/__tests__/fixtures/spells";

const service = new CombatStatsService();

describe("CombatStatsService – micro behaviors", () => {
  it("single Fire rune deals only Fire damage for a neutral player", () => {
    const player = makeNeutralPlayer();
    const spell = makeTestSpell({
      runes: ["F"],
      growth: {
        power: 0,
        control: 0,
        stability: 0,
        affinity: 0,
        versatility: 0,
      },
      infusions: [],
    });

    const stats = service.derive(spell, player);

    const fireBurst = stats.burst[DamageType.Fire] ?? 0;
    expect(fireBurst).toBeGreaterThan(0);

    // Any other damage type should be zero, assuming RUNES.F damage is pure Fire.
    Object.values(DamageType).forEach((type) => {
      if (type === DamageType.Fire) return;
      expect(stats.burst[type] ?? 0).toBe(0);
    });
  });

  it("Fire rune gets stronger with Fire affinity", () => {
    const neutral = makeNeutralPlayer();
    const fireSpecialist = makeHighFirePlayer();

    const baseSpell = makeTestSpell({
      runes: ["F"],
      growth: {
        power: 0,
        control: 0,
        stability: 0,
        affinity: 0,
        versatility: 0,
      },
      infusions: [],
    });

    const neutralStats = service.derive(baseSpell, neutral);

    // Clone the spell so we don't reuse the mutated combat from first derive
    const spell2 = makeTestSpell({
      runes: ["F"],
      growth: baseSpell.growth,
      infusions: [],
    });

    const fireStats = service.derive(spell2, fireSpecialist);

    const neutralFire = neutralStats.burst[DamageType.Fire] ?? 0;
    const specialistFire = fireStats.burst[DamageType.Fire] ?? 0;

    expect(specialistFire).toBeGreaterThan(neutralFire);
  });

  it("infusion on Fire rune increases its damage", () => {
    const player = makeNeutralPlayer();

    const noInfusion = makeTestSpell({
      runes: ["F"],
      growth: {
        power: 0,
        control: 0,
        stability: 0,
        affinity: 0,
        versatility: 0,
      },
      infusions: [],
    });

    const statsBase = service.derive(noInfusion, player);
    const baseFire = statsBase.burst[DamageType.Fire] ?? 0;

    const infusedSpell = makeTestSpell({
      runes: ["F"],
      growth: noInfusion.growth,
      infusions: [{ index: 0, extraMana: 3000 }],
    });

    const statsInfused = service.derive(infusedSpell, player);
    const infusedFire = statsInfused.burst[DamageType.Fire] ?? 0;

    expect(infusedFire).toBeGreaterThan(baseFire);
  });
});

describe("CombatStatsService – canonical fixtures", () => {
  it("Fire Ray base spell is primarily Fire damage", () => {
    const { player, spell } = {
      player: makeHighFirePlayer(),
      spell: makeFireRayBaseSpell("player_high_fire"),
    };

    const stats = service.derive(spell, player);

    const fire = stats.burst[DamageType.Fire] ?? 0;
    const totalBurst = Object.values(DamageType).reduce((acc, type) => {
      return acc + (stats.burst[type] ?? 0);
    }, 0);

    expect(fire).toBeGreaterThan(0);
    expect(totalBurst).toBeGreaterThan(0);

    const fireRatio = fire / totalBurst;
    expect(fireRatio).toBeGreaterThan(0.6); // should be clearly fire-focused
  });

  it("Infused Fire Ray is stronger than base Fire Ray", () => {
    const player = makeHighFirePlayer();

    const baseSpell = makeFireRayBaseSpell("player_fire_base");
    const baseStats = service.derive(baseSpell, player);
    const baseFire = baseStats.burst[DamageType.Fire] ?? 0;

    const infusedSpell = makeFireRayInfusedSpell("player_fire_infused", 3000);
    const infusedStats = service.derive(infusedSpell, player);
    const infusedFire = infusedStats.burst[DamageType.Fire] ?? 0;

    expect(infusedFire).toBeGreaterThan(baseFire);
  });
});
