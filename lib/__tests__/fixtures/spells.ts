// lib/test/fixtures/spells.ts
import type { Spell, RuneCode } from "@core/types";
import { SpellFactory } from "@pkg/spellFactory";
import { makeNeutralPlayer, makeHighFirePlayer, makeHighMindPlayer } from "./players";

const factory = new SpellFactory();

/**
 * Base Fire Ray:
 * - runes: F, A, R
 * - no infusions
 * - neutral player recommended for pure rune behavior tests.
 */
export function makeFireRayBaseSpell(ownerId: string = "player_fire_base"): Spell {
  const runes: RuneCode[] = ["F", "A", "R"];
  return factory.createNameless(ownerId, runes);
}

/**
 * Fire Ray with overcharge/infusions on the first rune.
 * - demonstrates infusion behavior.
 */
export function makeFireRayInfusedSpell(
  ownerId: string = "player_fire_infused",
  extraMana: number = 3000
): Spell {
  const spell = makeFireRayBaseSpell(ownerId);
  spell.infusions = [
    {
      index: 0,      // first rune "F"
      extraMana,
    },
  ];
  return spell;
}

/**
 * Water Wall:
 * - runes: W, C, S (and optionally D if you want explicit duration)
 * - defensive spell: we expect more Shield/Regen, lower damage.
 */
export function makeWaterWallSpell(ownerId: string = "player_water_wall"): Spell {
  const runes: RuneCode[] = ["W", "C", "S"];
  return factory.createNameless(ownerId, runes);
}

/**
 * Mind Lance:
 * - runes: M, R
 * - intended to be Mind burst, possibly silence/stun.
 */
export function makeMindLanceBaseSpell(ownerId: string = "player_mind_lance"): Spell {
  const runes: RuneCode[] = ["M", "R"];
  return factory.createNameless(ownerId, runes);
}

/**
 * Convenience combos for integration tests later on.
 */
export function makeFireRayWithHighFirePlayer() {
  return {
    player: makeHighFirePlayer(),
    spell: makeFireRayBaseSpell("player_high_fire"),
  };
}

export function makeMindLanceWithHighMindPlayer() {
  return {
    player: makeHighMindPlayer(),
    spell: makeMindLanceBaseSpell("player_high_mind"),
  };
}
