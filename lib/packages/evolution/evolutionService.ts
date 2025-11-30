// lib/packages/evolution/evolutionService.ts
import type { Player, Spell } from "@core/types";
import type { NamedSpellBlueprint, NamedSpellId } from "@data/namedSpells";
import { listNamedBlueprints, getBlueprintById } from "@data/namedSpells";
import { DamageType } from "@core/enums";
import type { RuneCode } from "@core/types";
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
 * Sum all damage (burst + full DoT) for a spell.
 * Used for minTotalPower and scoring.
 */
function totalDamage(spell: Spell): number {
  if (!spell.combat) return 0;

  const { burst, dot, dotDurationSec } = spell.combat;

  let burstTotal = 0;
  let dotTotal = 0;

  for (const type of Object.values(DamageType)) {
    burstTotal += burst[type] ?? 0;
    dotTotal += (dot[type] ?? 0) * dotDurationSec;
  }

  return burstTotal + dotTotal;
}

/**
 * For a given DamageType, compute its share of total damage (0..1).
 * Used to enforce “fire-focused”, “mind-focused”, etc. blueprints.
 */
function damageFocusRatio(spell: Spell, type: DamageType): number {
  if (!spell.combat) return 0;
  const total = totalDamage(spell);
  if (total <= 0) return 0;

  const { burst, dot, dotDurationSec } = spell.combat;
  const burstAmount = burst[type] ?? 0;
  const dotAmount = (dot[type] ?? 0) * dotDurationSec;
  const contribution = burstAmount + dotAmount;

  return contribution / total;
}

/**
 * True if the spell's rune list contains all the required runes
 * (respecting multiplicity when needed).
 */
function containsAllRunes(spell: Spell, runes: RuneCode[]): boolean {
  const counts: Record<RuneCode, number> = {} as Record<RuneCode, number>;

  for (const r of spell.runes) {
    counts[r] = (counts[r] ?? 0) + 1;
  }

  for (const r of runes) {
    if (!counts[r] || counts[r] <= 0) return false;
    counts[r] -= 1;
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

  return spell.runes.every((r) => (reqSet.has(r) ? true : allowedSet.has(r)));
}

/**
 * Check whether a given spell qualifies for a specific named spell blueprint.
 *
 * A spell can match a blueprint when:
 *  - it is currently nameless (no name set),
 *  - it contains all the required runes,
 *  - any extra runes are allowed by the blueprint,
 *  - its damage focus meets the required ratio (if specified),
 *  - its total damage meets the minimum power (if specified).
 */
function matchesBlueprint(
  spell: Spell,
  bp: NamedSpellBlueprint,
  ctx?: EvolutionContext
): boolean {
  if (spell.name && !bp.requiresNamedSourceId) {
    // If spell is already named and this blueprint is meant for
    // nameless → named, skip.
    return false;
  }

  if (!containsAllRunes(spell, bp.requiredRunes)) return false;
  if (!extrasOnlyAllowed(spell, bp.requiredRunes, bp.allowedExtraRunes)) {
    return false;
  }

  if (bp.minDamageFocus) {
    const ratio = damageFocusRatio(spell, bp.minDamageFocus.type);
    if (ratio < bp.minDamageFocus.ratio) return false;
  }

  if (bp.minTotalPower !== undefined) {
    if (totalDamage(spell) < bp.minTotalPower) return false;
  }

  if (!matchesAdditionalRequirements(spell, bp, ctx)) return false;

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

export interface EvolutionContext {
  playerFlags?: Set<string>;
  player?: Player; // so we can check rune familiarity
}

function matchesAdditionalRequirements(
  spell: Spell,
  bp: NamedSpellBlueprint,
  ctx?: EvolutionContext
): boolean {
  // named-source requirement (for named → named evolutions)
  if (bp.requiresNamedSourceId) {
    if (!spell.name || spell.name !== getBlueprintById(bp.requiresNamedSourceId)?.name) {
      return false;
    }
  }

  // rune familiarity gates
  if (bp.minRuneFamiliarity || bp.minTotalFamiliarityScore !== undefined) {
    if (!ctx?.player) return false;
    const player = ctx.player;
    const fam = player.affinity ?? {};

    if (bp.minRuneFamiliarity) {
      for (const key in bp.minRuneFamiliarity) {
        const r = key as RuneCode;
        const needed = bp.minRuneFamiliarity[r] ?? 0;
        const have = fam[r] ?? 0;
        if (have < needed) return false;
      }
    }

    if (bp.minTotalFamiliarityScore !== undefined) {
      const total = RuneFamiliarityService.getSpellRuneFamiliarityScore(
        player,
        spell
      );
      if (total < bp.minTotalFamiliarityScore) return false;
    }
  }

  // achievement/flag gates
  if (bp.requiredFlags?.length) {
    const flags = ctx?.playerFlags ?? new Set<string>();
    for (const flag of bp.requiredFlags) {
      if (!flags.has(flag)) return false;
    }
  }

  return true;
}


/**
 * EvolutionService:
 * - listPossibleEvolutions: "What named spells could this nameless spell become?"
 * - evolveSpell: "Evolve into this specific named spell if it qualifies."
 */
export class EvolutionService {
  listPossibleEvolutions(spell: Spell): SpellEvolutionOption[] {
    const blueprints = listNamedBlueprints();
    const candidates: SpellEvolutionOption[] = [];

    for (const bp of blueprints) {
      if (matchesBlueprint(spell, bp)) {
        candidates.push({
          blueprint: bp,
          score: scoreMatch(spell, bp),
        });
      }
    }

    candidates.sort((a, b) => b.score - a.score);
    return candidates;
  }

  evolveSpell(spell: Spell, blueprintId: NamedSpellId): Spell | null {
    const bp = getBlueprintById(blueprintId);
    if (!bp) return null;
    if (!matchesBlueprint(spell, bp)) return null;

    return {
      ...spell,
      name: bp.name,
      evolvedFrom: spell.id,
      // No levels in this game; growth/combat remain as-is.
    };
  }
}
