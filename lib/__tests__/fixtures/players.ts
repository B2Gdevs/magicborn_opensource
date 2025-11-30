// lib/test/fixtures/players.ts
import type { Player } from "@core/types";
import { makeTestPlayer } from "../../test/testFactories";

/**
 * Neutral player: no affinity, huge mana.
 * Good baseline for most combat tests.
 */
export function makeNeutralPlayer(): Player {
  return makeTestPlayer({
    affinity: {},
    mana: 9999,
    maxMana: 9999,
  });
}

/**
 * Fire specialist: high Fire rune affinity.
 */
export function makeHighFirePlayer(): Player {
  return makeTestPlayer({
    affinity: {
      F: 0.7,
    },
    mana: 9999,
    maxMana: 9999,
  });
}

/**
 * Mind specialist: high Mind rune affinity.
 */
export function makeHighMindPlayer(): Player {
  return makeTestPlayer({
    affinity: {
      M: 0.7,
    },
    mana: 9999,
    maxMana: 9999,
  });
}
