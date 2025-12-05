// lib/__tests__/evolution/EvolutionService.emberRay.test.ts
import { describe, it, expect } from "vitest";
import type { Spell } from "@core/types";
import { DamageType } from "@core/enums";
import { EMBER_RAY_BLUEPRINT } from "@/lib/data/namedSpells";
import type { NamedSpellId } from "@/lib/data/namedSpells";
import { EvolutionService } from "@pkg/evolution/evolutionService";
import {
  makeCombatStats,
  makeTestSpell,
} from "@/lib/test/testFactories";

/**
 * Helper: create a nameless spell that is intended to be a "candidate"
 * for Ember Ray:
 *
 * - Runes: exactly the Ember Ray required runes
 * - Damage: mostly Fire, and strong enough to clear minTotalPower
 * - Name: null (nameless, so it can still evolve)
 */
function makeEmberRayCandidate(): Spell {
  const combat = makeCombatStats({
    burst: {
      [DamageType.Fire]: 12,
    },
    dot: {
      [DamageType.Fire]: 1,
    },
    dotDurationSec: 4,
  });

  return makeTestSpell({
    id: "spell_candidate",
    ownerId: "player_test_ember",
    name: null,
    runes: EMBER_RAY_BLUEPRINT.requiredRunes.slice(),
    combat,
  });
}

describe("EvolutionService – Ember Ray blueprint", () => {
  const service = new EvolutionService();
  const emberId: NamedSpellId = EMBER_RAY_BLUEPRINT.id;

  it("Ember Ray: matching candidate spell is listed as a possible evolution", () => {
    // INPUT:
    //   - Runes: Ember Ray required runes
    //   - Damage: almost entirely fire, enough total power
    const candidate = makeEmberRayCandidate();

    // ACTION:
    const options = service.listPossibleEvolutions(candidate);

    // EXPECTED:
    //   - Ember Ray should be one of the available evolutions
    const ids = options.map((o) => o.blueprint.id);
    expect(ids).toContain(emberId);
  });

  it("Ember Ray: candidate with wrong runes is NOT eligible", () => {
    // INPUT:
    //   - Same as the valid candidate, but we replace one rune so it
    //     no longer contains the exact required set.
    const candidate = makeEmberRayCandidate();
    candidate.runes = ["F", "A", "X"]; // missing the required "R"

    // ACTION:
    const options = service.listPossibleEvolutions(candidate);

    // EXPECTED:
    //   - Ember Ray should NOT appear in evolution options
    const ids = options.map((o) => o.blueprint.id);
    expect(ids).not.toContain(emberId);
  });

  it("Ember Ray: candidate with low fire focus is NOT eligible", () => {
    // INPUT:
    //   - Runes are correct,
    //   - but we add a large amount of non-fire damage so fire is no
    //     longer ≥ required focus ratio.
    const candidate = makeEmberRayCandidate();
    if (!candidate.combat) throw new Error("candidate must have combat");

    // Add huge Physical damage so Fire is no longer dominant.
    candidate.combat.burst[DamageType.Physical] = 999;

    // ACTION:
    const options = service.listPossibleEvolutions(candidate);

    // EXPECTED:
    //   - Ember Ray should NOT appear, because its minDamageFocus is
    //     no longer satisfied.
    const ids = options.map((o) => o.blueprint.id);
    expect(ids).not.toContain(emberId);
  });

  it("Ember Ray: evolveSpell stamps name and evolvedFrom but preserves stats", () => {
    // INPUT:
    //   - A valid Ember Ray candidate spell (see helper).
    const candidate = makeEmberRayCandidate();

    // ACTION:
    const evolved = service.evolveSpell(candidate, emberId);

    // EXPECTED:
    //   - A non-null spell with:
    //       name        = blueprint name
    //       evolvedFrom = original spell id
    //     and core stats (runes, growth, combat) preserved.
    expect(evolved).not.toBeNull();
    if (!evolved) return;

    expect(evolved.name).toBe(EMBER_RAY_BLUEPRINT.name);
    expect(evolved.evolvedFrom).toBe(candidate.id);

    // Core mechanical properties should be preserved.
    expect(evolved.runes).toEqual(candidate.runes);
    expect(evolved.growth).toEqual(candidate.growth);
    expect(evolved.combat).toEqual(candidate.combat);
  });
});
