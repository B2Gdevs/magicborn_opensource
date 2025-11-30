// lib/test/testFactories.ts
import type { CombatActor, Player, Spell, RuneCode } from "@core/types";
import type { CombatStats, DamageVector } from "@core/combat";
import { DamageType } from "@core/enums";

let playerCounter = 0;
let spellCounter = 0;

// ----- Damage helpers -----

export function makeEmptyDamageVector(): DamageVector {
  return {
    [DamageType.Physical]: 0,
    [DamageType.Fire]: 0,
    [DamageType.Ice]: 0,
    [DamageType.Water]: 0,
    [DamageType.Electric]: 0,
    [DamageType.Light]: 0,
    [DamageType.Void]: 0,
    [DamageType.Gravity]: 0,
    [DamageType.Mind]: 0,
    [DamageType.Heal]: 0,
  };
}

export function makeFireCombatStats(
  burstFire: number,
  dotFire = 0,
  dotDurationSec = 0
): CombatStats {
  const burst: DamageVector = makeEmptyDamageVector();
  const dot: DamageVector = makeEmptyDamageVector();

  burst[DamageType.Fire] = burstFire;
  if (dotDurationSec > 0 && dotFire > 0) {
    dot[DamageType.Fire] = dotFire;
  }

  return {
    burst,
    dot,
    dotDurationSec,
    penetration: {},
    critChance: 0.05,
    critMult: 1.5,
    ccTags: [],
    effects: [],
  };
}

// ----- Player / Spell factories -----

export function makeTestPlayer(overrides: Partial<Player> = {}): Player {
  playerCounter += 1;

  const base: Player = {
    id: `player_test_${playerCounter}`,
    name: "Test Mage",
    mana: 9999,
    maxMana: 9999,
    hp: 100,
    maxHp: 100,
    affinity: {},
    elementXp: {},
    elementAffinity: {},
    effects: [],
    controlBonus: 0,
    costEfficiency: 0,
    ...overrides,
  };

  return base;
}

export function makeTestSpell(overrides: Partial<Spell> = {}): Spell {
  spellCounter += 1;

  const combat: CombatStats =
    overrides.combat ?? makeFireCombatStats(0, 0, 0);

  const base: Spell = {
    id: `spell_test_${spellCounter}`,
    ownerId: overrides.ownerId ?? "player_test_1",
    name: overrides.name ?? null,
    runes: overrides.runes ?? ([] as RuneCode[]),
    profile: overrides.profile ?? {},
    infusions: overrides.infusions ?? [],
    growth:
      overrides.growth ??
      {
        power: 0,
        control: 0,
        stability: 0,
        affinity: 0,
        versatility: 0,
      },
    lastEval: overrides.lastEval,
    combat,
    craftCost: overrides.craftCost,
    evolvedFrom: overrides.evolvedFrom,
  };

  return base;
}

/** handy helper: a fire-only spell with preconfigured combat stats */
export function makeFireSpell(
  burstFire: number,
  dotFire = 0,
  dotDurationSec = 0,
  overrides: Partial<Spell> = {}
): Spell {
  return makeTestSpell({
    combat: makeFireCombatStats(burstFire, dotFire, dotDurationSec),
    ...overrides,
  });
}

export function makeCombatStats(partial?: Partial<CombatStats>): CombatStats {
  return {
    burst: {
      [DamageType.Physical]: 0,
      [DamageType.Fire]: 0,
      [DamageType.Ice]: 0,
      [DamageType.Water]: 0,
      [DamageType.Electric]: 0,
      [DamageType.Light]: 0,
      [DamageType.Void]: 0,
      [DamageType.Gravity]: 0,
      [DamageType.Mind]: 0,
      [DamageType.Heal]: 0,
      ...(partial?.burst ?? {}),
    },
    dot: {
      [DamageType.Physical]: 0,
      [DamageType.Fire]: 0,
      [DamageType.Ice]: 0,
      [DamageType.Water]: 0,
      [DamageType.Electric]: 0,
      [DamageType.Light]: 0,
      [DamageType.Void]: 0,
      [DamageType.Gravity]: 0,
      [DamageType.Mind]: 0,
      [DamageType.Heal]: 0,
      ...(partial?.dot ?? {}),
    },
    dotDurationSec: partial?.dotDurationSec ?? 0,
    penetration: partial?.penetration ?? {},
    critChance: partial?.critChance ?? 0,
    critMult: partial?.critMult ?? 1.5,
    ccTags: partial?.ccTags ?? [],
    effects: partial?.effects ?? [],
  };
}
