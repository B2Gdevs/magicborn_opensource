// lib/packages/runtime/spellRuntime.ts
import type { Player, Spell } from "@core/types";
import { EncounterService, type CombatActor, type SpellHitResult } from "@pkg/combat/EncounterService";
import { EvolutionService } from "@pkg/evolution/evolutionService";
import type { SpellEvolutionOption } from "@pkg/evolution/evolutionService";
import type { NamedSpellId } from "@/lib/data/namedSpells";

/**
 * SpellRuntime is a thin façade used by the game / UI layer.
 *
 * It hides the low-level services (CombatStatsService, EvolutionService,
 * AffinityService, etc.) behind a small, friendly API that is easy to port
 * to Unity later.
 */
export class SpellRuntime {
  private readonly encounter: EncounterService;
  private readonly evolution: EvolutionService;

  constructor(
    encounterService?: EncounterService,
    evolutionService?: EvolutionService
  ) {
    this.encounter = encounterService ?? new EncounterService();
    this.evolution = evolutionService ?? new EvolutionService();
  }

  /**
   * Cast a spell from `caster` to `target`.
   *
   * UI usage sketch:
   *   const runtime = new SpellRuntime();
   *   const { hit, updatedCaster, updatedTarget } =
   *     runtime.castSpell(spell, player, goblin);
   */
  castSpell(
    spell: Spell,
    caster: Player,
    target: CombatActor
  ): {
    hit: SpellHitResult;
    updatedCaster: Player;
    updatedTarget: CombatActor;
  } {
    const hit = this.encounter.resolveSpellHit(caster, spell, target);

    // Later:
    //  - subtract mana on caster
    //  - call AffinityService.recordSpellUse(caster, spell)
    //  - log combat events, etc.

    return {
      hit,
      updatedCaster: caster,
      updatedTarget: target,
    };
  }

  /**
   * List evolutions a spell could take, given the current player + flags.
   *
   * For now, EvolutionService only needs the spell; we keep `player` and
   * `achievements` parameters so the UI shape is ready for when we start
   * gating by familiarity and achievements.
   */
  listAvailableEvolutions(
    spell: Spell,
    _player: Player,
    _achievements: Set<string>
  ): SpellEvolutionOption[] {
    return this.evolution.listPossibleEvolutions(spell);
  }

  /**
   * Attempt to evolve a spell to a specific named blueprint.
   *
   * Returns the new Spell if evolution is allowed, or null if not.
   * Currently this delegates straight into EvolutionService, which only
   * cares about the spell + evolution id and the rune/damage constraints.
   *
   * Later we’ll:
   *  - check rune familiarity thresholds,
   *  - check `requiresNamedSourceId`,
   *  - check `requiredFlags` / achievements,
   *  - maybe modify growth stats or affinity on success.
   */
  tryEvolveSpell(
    spell: Spell,
    evolutionId: NamedSpellId,
    _player: Player,
    _achievements: Set<string>
  ): Spell | null {
    return this.evolution.evolveSpell(spell, evolutionId);
  }
}
