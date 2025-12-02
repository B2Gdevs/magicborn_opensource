// lib/packages/evolution/evolutionService.ts
import type { Player, Spell } from "@core/types";
import type { RuneCode } from "@core/types";
import { DamageType } from "@core/enums";
import {
  listNamedBlueprints,
  getBlueprintById,
  type NamedSpellBlueprint,
  type NamedSpellId,
} from "@data/namedSpells";
import { RuneFamiliarityService } from "@pkg/player/RuneFamiliarityService";

/**
 * A single possible evolution for a spell:
 * - the matching named spell blueprint
 * - a numeric score for “how good” the fit is (for sorting in UI)
 */
export interface SpellEvolutionOption {
  blueprint: NamedSpellBlueprint;
  score: number;
}

/**
 * Extra context used for familiarity / flag gating.
 */
export interface EvolutionContext {
  player?: Player;
  playerFlags?: Set<string>;
}

/**
 * Sum all damage (burst + full DoT) for a spell.
 * Used for minTotalPower and scoring.
 */
function totalDamage(spell: Spell): number {
  if (!spell.combat) return 0;

  const { burst, dot, dotDurationSec } = spell.combat;
  let total = 0;

  for (const type of Object.values(DamageType)) {
    total += (burst[type] ?? 0) + (dot[type] ?? 0) * dotDurationSec;
  }

  return total;
}

/**
 * For a given DamageType, compute its share of total damage (0..1).
 * Used to enforce “fire-focused”, “mind-focused”, etc. blueprints.
 */
function damageFocusRatio(spell: Spell, type: DamageType): number {
  if (!spell.combat) return 0;
  const all = totalDamage(spell);
  if (all <= 0) return 0;

  const { burst, dot, dotDurationSec } = spell.combat;
  const contrib =
    (burst[type] ?? 0) + (dot[type] ?? 0) * dotDurationSec;

  return contrib / all;
}

/**
 * True if the spell's rune list contains all the required runes
 * (respecting multiplicity when needed).
 */
function containsAllRunes(spell: Spell, runes: RuneCode[]): boolean {
  const counts: Partial<Record<RuneCode, number>> = {};

  for (const r of spell.runes) {
    counts[r] = (counts[r] ?? 0) + 1;
  }

  for (const r of runes) {
    const have = counts[r] ?? 0;
    if (have <= 0) return false;
    counts[r] = have - 1;
  }

  return true;
}

/**
 * If the blueprint restricts which extra runes are allowed,
 * enforce that every rune in the spell is either:
 *  - one of the required runes, or
 *  - one of the allowed extra runes.
 */
function extrasOnlyAllowed(
  spell: Spell,
  required: RuneCode[],
  allowed?: RuneCode[]
): boolean {
  if (!allowed || allowed.length === 0) return true;

  const reqSet = new Set<RuneCode>(required);
  const allowedSet = new Set<RuneCode>([...required, ...allowed]);

  return spell.runes.every((r) =>
    reqSet.has(r) ? true : allowedSet.has(r)
  );
}

/**
 * Familiarity / achievement / named-source gates.
 */
function matchesAdditionalRequirements(
  spell: Spell,
  bp: NamedSpellBlueprint,
  ctx?: EvolutionContext
): boolean {
  const player = ctx?.player;

  // Named-source requirement (for named → named evolutions).
  if (bp.requiresNamedSourceId) {
    const src = getBlueprintById(bp.requiresNamedSourceId);
    if (!src) return false;

    const ok = spell.name === src.name;
    if (!ok) {
      // debug
      // eslint-disable-next-line no-console
      console.log(
        "[Evolution] named-source gate failed",
        bp.id,
        "requires",
        src.name,
        "but spell.name =",
        spell.name
      );
      return false;
    }
  }

  // Rune familiarity gates.
  if (bp.minRuneFamiliarity || bp.minTotalFamiliarityScore !== undefined) {
    if (!player) {
      // eslint-disable-next-line no-console
      console.log(
        "[Evolution] familiarity gate failed for",
        bp.id,
        "— no player in context"
      );
      return false;
    }

    if (bp.minRuneFamiliarity) {
      for (const key in bp.minRuneFamiliarity) {
        const r = key as RuneCode;
        const needed = bp.minRuneFamiliarity[r] ?? 0;
        const have = RuneFamiliarityService.getRuneFamiliarity(player, r);
        if (have < needed) {
          // eslint-disable-next-line no-console
          console.log(
            "[Evolution] minRuneFamiliarity failed for",
            bp.id,
            "rune",
            r,
            "have=",
            have,
            "need=",
            needed
          );
          return false;
        }
      }
    }

    if (bp.minTotalFamiliarityScore !== undefined) {
      const score = RuneFamiliarityService.getSpellRuneFamiliarityScore(
        player,
        spell
      );
      if (score < bp.minTotalFamiliarityScore) {
        // eslint-disable-next-line no-console
        console.log(
          "[Evolution] minTotalFamiliarityScore failed for",
          bp.id,
          "score=",
          score,
          "need=",
          bp.minTotalFamiliarityScore
        );
        return false;
      }
    }
  }

  // Achievement / flag gates.
  if (bp.requiredFlags?.length) {
    const flags = ctx?.playerFlags ?? new Set<string>();
    for (const flag of bp.requiredFlags) {
      if (!flags.has(flag)) {
        // eslint-disable-next-line no-console
        console.log(
          "[Evolution] flag gate failed for",
          bp.id,
          "missing flag",
          flag
        );
        return false;
      }
    }
  }

  return true;
}

/**
 * Check whether a given spell qualifies for a specific named spell blueprint.
 *
 * NOTE: we **do not** blanket-reject spells that already have a name.
 * Base Ember Ray should still be able to “match” the Ember Ray blueprint,
 * and tier-2 evolutions use `requiresNamedSourceId` to enforce chains.
 */
function matchesBlueprint(
  spell: Spell,
  bp: NamedSpellBlueprint,
  ctx?: EvolutionContext
): boolean {
  if (!containsAllRunes(spell, bp.requiredRunes)) {
    if (bp.id === "ember_ray" || bp.id === "searing_ember_ray") {
      // eslint-disable-next-line no-console
      console.log("[Evolution] rune requirement failed for", bp.id);
    }
    return false;
  }

  if (!extrasOnlyAllowed(spell, bp.requiredRunes, bp.allowedExtraRunes)) {
    if (bp.id === "ember_ray" || bp.id === "searing_ember_ray") {
      // eslint-disable-next-line no-console
      console.log("[Evolution] extra runes not allowed for", bp.id);
    }
    return false;
  }

  if (bp.minDamageFocus) {
    const ratio = damageFocusRatio(spell, bp.minDamageFocus.type);
    if (ratio < bp.minDamageFocus.ratio) {
      if (bp.id === "ember_ray" || bp.id === "searing_ember_ray") {
        // eslint-disable-next-line no-console
        console.log(
          "[Evolution] damage focus too low for",
          bp.id,
          "ratio=",
          ratio,
          "need=",
          bp.minDamageFocus.ratio
        );
      }
      return false;
    }
  }

  if (bp.minTotalPower !== undefined) {
    const power = totalDamage(spell);
    if (power < bp.minTotalPower) {
      if (bp.id === "ember_ray" || bp.id === "searing_ember_ray") {
        // eslint-disable-next-line no-console
        console.log(
          "[Evolution] total power too low for",
          bp.id,
          "power=",
          power,
          "need=",
          bp.minTotalPower
        );
      }
      return false;
    }
  }

  if (!matchesAdditionalRequirements(spell, bp, ctx)) {
    return false;
  }

  return true;
}

/**
 * Very simple scoring:
 *  - higher total damage → higher base score
 *  - exceeding the required damage focus → bonus
 *  - exact rune match (no extra runes) → small bonus
 */
function scoreMatch(spell: Spell, bp: NamedSpellBlueprint): number {
  let score = totalDamage(spell);

  if (bp.minDamageFocus) {
    const ratio = damageFocusRatio(spell, bp.minDamageFocus.type);
    if (ratio > bp.minDamageFocus.ratio) {
      score += (ratio - bp.minDamageFocus.ratio) * 10;
    }
  }

  if (
    spell.runes.length === bp.requiredRunes.length &&
    containsAllRunes(spell, bp.requiredRunes)
  ) {
    score += 5;
  }

  return score;
}

/**
 * EvolutionService:
 * - listPossibleEvolutions: "What named spells could this spell become?"
 * - evolveSpell: "Evolve into this specific named spell if it qualifies."
 */
export class EvolutionService {
  listPossibleEvolutions(
    spell: Spell,
    player?: Player,
    achievements?: Set<string>
  ): SpellEvolutionOption[] {
    const ctx: EvolutionContext | undefined =
      player || (achievements && achievements.size > 0)
        ? { player, playerFlags: achievements }
        : undefined;

    const blueprints = listNamedBlueprints();

    // eslint-disable-next-line no-console
    console.log(
      "[Evolution] listPossibleEvolutions – spell.name=",
      spell.name,
      "runes=",
      spell.runes.join(""),
      "blueprints=",
      blueprints.map((b) => b.id)
    );

    const candidates: SpellEvolutionOption[] = [];

    for (const bp of blueprints) {
      const ok = matchesBlueprint(spell, bp, ctx);
      // eslint-disable-next-line no-console
      console.log("[Evolution] check", bp.id, "=>", ok);
      if (ok) {
        candidates.push({
          blueprint: bp,
          score: scoreMatch(spell, bp),
        });
      }
    }

    candidates.sort((a, b) => b.score - a.score);

    // eslint-disable-next-line no-console
    console.log(
      "[Evolution] candidates =>",
      candidates.map((c) => c.blueprint.id)
    );

    return candidates;
  }

  evolveSpell(
    spell: Spell,
    blueprintId: NamedSpellId,
    player?: Player,
    achievements?: Set<string>
  ): Spell | null {
    const bp = getBlueprintById(blueprintId);
    if (!bp) return null;

    const ctx: EvolutionContext | undefined =
      player || (achievements && achievements.size > 0)
        ? { player, playerFlags: achievements }
        : undefined;

    if (!matchesBlueprint(spell, bp, ctx)) {
      // eslint-disable-next-line no-console
      console.log(
        "[Evolution] evolveSpell – matchesBlueprint failed for",
        blueprintId
      );
      return null;
    }

    const newId = `${spell.id}::${bp.id}`;

    const evolved: Spell = {
      ...spell,
      id: newId,
      name: bp.name,
      evolvedFrom: spell.id,
    };

    // eslint-disable-next-line no-console
    console.log(
      "[Evolution] evolveSpell – success",
      "from",
      spell.id,
      "to",
      evolved.id
    );

    return evolved;
  }
}
