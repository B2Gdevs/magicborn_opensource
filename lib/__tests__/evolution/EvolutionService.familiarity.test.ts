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
} from "@/lib/data/namedSpells";
import { AchievementFlag } from "@/lib/data/achievements";

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

    // Ensure combat stats exist so totalPower / focus checks behave consistently.
    statsService.derive(spell, player);

    return { player, spell };
  }

  it("does NOT allow Searing Ember Ray evolution before familiarity/flags", () => {
    const player = makeTestPlayer();
    const { spell } = makeEmberRayLikeSpellForPlayer(player.id);

    const achievements = new Set<AchievementFlag>(); // no boss kill yet

    const options: SpellEvolutionOption[] = evolution.listPossibleEvolutions(
      spell,
      player,
      achievements
    );

    const ids = options.map((opt) => opt.blueprint.id);

    // base Ember Ray line should still be a valid named evolution
    expect(ids).toContain("ember_ray");
    // tier-2 Searing Ember Ray should be locked
    expect(ids).not.toContain("searing_ember_ray");
  });

  it("allows Searing Ember Ray after enough Ember Ray casts + achievement flag", () => {
    const player = makeTestPlayer();
    const { spell } = makeEmberRayLikeSpellForPlayer(player.id);

    // simulate the player spamming Ember Ray a bunch of times
    for (let i = 0; i < 80; i++) {
      RuneFamiliarityService.recordSpellCast(player, spell);
    }

    // mark the boss defeat achievement
    const achievements = new Set<AchievementFlag>([
      AchievementFlag.BossFire1Defeated,
    ]);

    const options: SpellEvolutionOption[] = evolution.listPossibleEvolutions(
      spell,
      player,
      achievements
    );
    const ids = options.map((opt) => opt.blueprint.id);

    expect(ids).toContain("searing_ember_ray");
  });

  it("evolves Ember Ray → Searing Ember Ray while preserving stats", () => {
    const player = makeTestPlayer();
    const { spell } = makeEmberRayLikeSpellForPlayer(player.id);

    // boost familiarity + unlock achievement
    for (let i = 0; i < 80; i++) {
      RuneFamiliarityService.recordSpellCast(player, spell);
    }
    const achievements = new Set<AchievementFlag>([
      AchievementFlag.BossFire1Defeated,
    ]);

    const evolved = evolution.evolveSpell(
      spell,
      "searing_ember_ray",
      player,
      achievements
    );

    expect(evolved).not.toBeNull();
    if (!evolved) return;

    expect(evolved.id).not.toBe(spell.id);
    expect(evolved.evolvedFrom).toBe(spell.id);
    expect(evolved.name).toBe(SEARING_EMBER_RAY_BLUEPRINT.name);

    // sanity: core pattern should be preserved
    expect(evolved.runes).toEqual(spell.runes);

    // growth / combat should not reset to nonsense
    expect(evolved.growth.power).toBeGreaterThanOrEqual(spell.growth.power);
  });
});
