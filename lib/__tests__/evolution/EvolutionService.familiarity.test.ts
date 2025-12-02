// lib/__tests__/evolution/EvolutionService.familiarity.test.ts
import { describe, it, expect } from "vitest";
import type { Spell } from "@core/types";
import { makeTestPlayer, makeTestSpell } from "@/lib/test/testFactories";
import {
  EvolutionService,
  type SpellEvolutionOption,
} from "@pkg/evolution/evolutionService";
import { CombatStatsService } from "@pkg/combat/CombatStatsService";
import { RuneFamiliarityService } from "@pkg/player/RuneFamiliarityService";
import { RC } from "@pkg/runes";
import {
  EMBER_RAY_BLUEPRINT,
  SEARING_EMBER_RAY_BLUEPRINT,
} from "@data/namedSpells";

describe("EvolutionService – familiarity-gated evolution", () => {
  const evolution = new EvolutionService();
  const statsService = new CombatStatsService();

  function makeEmberRayLikeSpellForPlayer(ownerId: string): {
    player: ReturnType<typeof makeTestPlayer>;
    spell: Spell;
  } {
    const player = makeTestPlayer();
    player.id = ownerId;

    const spell: Spell = makeTestSpell({
      ownerId,
      name: EMBER_RAY_BLUEPRINT.name,
      runes: [RC.Fire, RC.Air, RC.Ray],
      profile: {
        [RC.Fire]: 1 / 3,
        [RC.Air]: 1 / 3,
        [RC.Ray]: 1 / 3,
      },
    });

    statsService.derive(spell, player);

    // eslint-disable-next-line no-console
    console.log(
      "[Test] makeEmberRayLikeSpellForPlayer – spell",
      { name: spell.name, runes: spell.runes, combat: spell.combat }
    );

    return { player, spell };
  }

  it("does NOT allow Searing Ember Ray evolution before familiarity/flags", () => {
    const player = makeTestPlayer();
    const { spell } = makeEmberRayLikeSpellForPlayer(player.id);

    const achievements = new Set<string>();

    const options: SpellEvolutionOption[] = evolution.listPossibleEvolutions(
      spell,
      player,
      achievements
    );
    const ids = options.map((opt) => opt.blueprint.id);

    // eslint-disable-next-line no-console
    console.log("[Test] options before familiarity", ids);

    expect(ids).toContain("ember_ray");
    expect(ids).not.toContain("searing_ember_ray");
  });

  it("allows Searing Ember Ray after enough Ember Ray casts + achievement flag", () => {
    const player = makeTestPlayer();
    const { spell } = makeEmberRayLikeSpellForPlayer(player.id);

    for (let i = 0; i < 80; i++) {
      RuneFamiliarityService.recordSpellCast(player, spell);
    }

    const fireFam = RuneFamiliarityService.getRuneFamiliarity(player, RC.Fire);
    const airFam = RuneFamiliarityService.getRuneFamiliarity(player, RC.Air);
    const rayFam = RuneFamiliarityService.getRuneFamiliarity(player, RC.Ray);

    // eslint-disable-next-line no-console
    console.log(
      "[Test] familiarity after 80 casts",
      { fireFam, airFam, rayFam }
    );

    const achievements = new Set<string>(["boss_fire_1_defeated"]);

    const options: SpellEvolutionOption[] = evolution.listPossibleEvolutions(
      spell,
      player,
      achievements
    );
    const ids = options.map((opt) => opt.blueprint.id);

    // eslint-disable-next-line no-console
    console.log("[Test] options after familiarity + flag", ids);

    expect(ids).toContain("searing_ember_ray");
  });

  it("evolves Ember Ray → Searing Ember Ray while preserving stats", () => {
    const player = makeTestPlayer();
    const { spell } = makeEmberRayLikeSpellForPlayer(player.id);

    for (let i = 0; i < 80; i++) {
      RuneFamiliarityService.recordSpellCast(player, spell);
    }
    const achievements = new Set<string>(["boss_fire_1_defeated"]);

    const evolved = evolution.evolveSpell(
      spell,
      "searing_ember_ray",
      player,
      achievements
    );

    // eslint-disable-next-line no-console
    console.log("[Test] evolved spell", evolved);

    expect(evolved).not.toBeNull();
    if (!evolved) return;

    expect(evolved.id).not.toBe(spell.id);
    expect(evolved.evolvedFrom).toBe(spell.id);
    expect(evolved.name).toBe(SEARING_EMBER_RAY_BLUEPRINT.name);
    expect(evolved.runes).toEqual(spell.runes);
    expect(evolved.growth.power).toBeGreaterThanOrEqual(spell.growth.power);
  });
});
