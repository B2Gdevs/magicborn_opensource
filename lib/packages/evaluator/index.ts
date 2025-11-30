import type { Player, RuneCode, Spell } from "@core/types";
import { RuneTag } from "@core/enums";
import { RUNES } from "@pkg/runes";
import { SpellTraits } from "@pkg/spell/traits";
import { computeSpellManaCost } from "@pkg/cost";

const VOWELS = new Set<RuneCode>(["A","E","I","O","U","Y"]);

export class EvaluatorService {
  evaluate(spell: Spell, player: Player) {
    const t = new SpellTraits(spell);

    let basePower = 0, baseControl = 0, baseInstab = 0;
    const tags = new Set<RuneTag>();

    for (const r of spell.runes) {
      const d = RUNES[r];
      const aff = clamp(player.affinity[r] ?? 0, 0, 1);
      const affPower = 1 + 0.5 * aff;
      const affControl = 1 + 0.25 * aff;
      const affInstabMit = 1 - 0.35 * aff;

      basePower += d.powerFactor * affPower;
      baseControl += d.controlFactor * affControl;
      baseInstab += d.instabilityBase * affInstabMit;
      d.tags.forEach(tag => tags.add(tag));
    }

    const formPenalty = formationPenalty(spell.runes);

    const controlGrowthMit = 1 - clamp(spell.growth.control / 200, 0, 0.6);
    const stabilityGrowthMit = 1 - clamp(spell.growth.stability / 200, 0, 0.6);

    const meanInstab = baseInstab / Math.max(1, spell.runes.length);
    const instability = round3(Math.max(0, meanInstab * (1 + formPenalty)) * stabilityGrowthMit);

    const power = round2(basePower);
    const synergy = round3(synergyScore(t));

    const cost = computeSpellManaCost(player, spell);

    const result = {
      power,
      cost,
      instability,
      synergy,
      effects: Array.from(tags),
    };

    spell.lastEval = result;
    return result;
  }
}

function formationPenalty(seq: RuneCode[]): number {
  if (seq.length === 0) return 0;
  let v = 0, c = 0;
  for (const r of seq) (VOWELS.has(r) ? v++ : c++);
  const ratio = v / (v + c);
  const vowelPenalty = ratio < 0.4 ? (0.3 * (0.4 - ratio) / 0.4) : 0;

  let clash = 0;
  for (let i = 1; i < seq.length; i++) {
    const a = seq[i-1], b = seq[i];
    if ((a === "F" && (b === "W" || b === "I")) || (b === "F" && (a === "W" || a === "I"))) clash += 0.04;
    if ((a === "L" && b === "V") || (a === "V" && b === "L")) clash += 0.04;
  }
  return Math.min(0.35, vowelPenalty + clash);
}

function synergyScore(_t: SpellTraits): number { return 0; }
const round2 = (n: number) => Math.round(n * 100) / 100;
const round3 = (n: number) => Math.round(n * 1000) / 1000;
function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
