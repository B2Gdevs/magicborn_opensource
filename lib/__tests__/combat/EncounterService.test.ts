// lib/__tests__/combat/EncounterService.test.ts
import { describe, it, expect } from "vitest";

import { DamageType, EffectType } from "@core/enums";
import type { Spell, Player } from "@core/types";
import type { EffectInstance } from "@core/effects";

import { EncounterService, type CombatActor } from "@pkg/combat/EncounterService";
import { CombatStatsService } from "@pkg/combat/CombatStatsService";

import {
  makeTestPlayer,
  makeTestSpell,
} from "@/lib/test/testFactories";

// Simple goblin factory that matches CombatActor shape.
function makeGoblin(overrides: Partial<CombatActor> = {}): CombatActor {
  return {
    id: overrides.id ?? "goblin",
    name: overrides.name ?? "Goblin",

    hp: overrides.hp ?? 50,
    maxHp: overrides.maxHp ?? 50,

    mana: overrides.mana ?? 0,
    maxMana: overrides.maxMana ?? 0,

    elementAffinity: overrides.elementAffinity,
    elementXp: overrides.elementXp,

    effects: (overrides.effects as EffectInstance[]) ?? [],
  };
}

// Helper to create a “fire-heavy” spell by runes and then
// derive its CombatStats so damage + effects come from our rune defs.
function makeDerivedFireSpell(player: Player): Spell {
  const spell = makeTestSpell({
    // Single Fire rune – all damage + Burn effect come from RUNES.F
    runes: ["F"],
    // Give it some power so the numbers aren’t microscopic
    growth: {
      power: 50,
      control: 0,
      stability: 0,
      affinity: 0,
      versatility: 0,
    },
  });

  const stats = new CombatStatsService();
  stats.derive(spell, player);

  return spell;
}

describe("EncounterService – simple spell vs creature", () => {
  const statsService = new CombatStatsService();
  const encounter = new EncounterService(statsService);

  it("Fire-heavy spell deals full damage to a neutral goblin", () => {
    const player = makeTestPlayer();
    const spell = makeDerivedFireSpell(player);

    const goblin = makeGoblin({
      // no elementAffinity => neutral to everything
      elementAffinity: {},
    });

    const result = encounter.resolveSpellHit(player as unknown as CombatActor, spell, goblin);

    const fire = result.perType[DamageType.Fire] ?? 0;

    expect(result.totalDamage).toBeGreaterThan(0);
    expect(fire).toBeGreaterThan(0);
    expect(result.targetHpAfter).toBeLessThan(result.targetHpBefore);
  });

  it("Fire-resistant goblin takes less Fire damage than a normal goblin", () => {
    const player = makeTestPlayer();
    const spell = makeDerivedFireSpell(player);

    const neutralGoblin = makeGoblin({
      elementAffinity: {}, // neutral
    });

    const fireGoblin = makeGoblin({
      id: "goblin_fire",
      // maxed Fire affinity => strong mitigation
      elementAffinity: { [DamageType.Fire]: 1 },
    });

    const hitNeutral = encounter.resolveSpellHit(
      player as unknown as CombatActor,
      spell,
      neutralGoblin
    );
    const hitResistant = encounter.resolveSpellHit(
      player as unknown as CombatActor,
      spell,
      fireGoblin
    );

    const fireNormal = hitNeutral.perType[DamageType.Fire] ?? 0;
    const fireResistant = hitResistant.perType[DamageType.Fire] ?? 0;

    expect(fireNormal).toBeGreaterThan(0);
    expect(fireResistant).toBeGreaterThan(0);
    expect(fireResistant).toBeLessThan(fireNormal);
  });

  it("Fire rune applies Burn effect to target", () => {
    const player = makeTestPlayer();
    const spell = makeDerivedFireSpell(player);

    const goblin = makeGoblin();

    encounter.resolveSpellHit(player as unknown as CombatActor, spell, goblin);

    const hasBurn = goblin.effects.some(
      (e: EffectInstance) => e.type === EffectType.Burn
    );
    expect(hasBurn).toBe(true);
  });
});
