import type { Spell } from "@core/types";
import type { DamageVector } from "@core/combat";
import { RuneTag } from "@core/enums";
import { SpellTraits } from "@pkg/spell/traits";

export interface EvolutionRule {
  id: string;
  name: string;           // named spell
  description: string;
  requires: Partial<Record<keyof DamageVector, number>>; // thresholds on derived damage totals
  runeAll?: string[];     // must contain all
  runeAny?: string[];     // must contain at least one
  bonuses: {
    burstMult?: number;   // multiply existing burst numbers
    dotMult?: number;
    addTags?: string[];
  };
}

export const EVOLUTION_RULES: EvolutionRule[] = [
  {
    id: "fire:blazing-ray",
    name: "Blazing Ray",
    description: "A focused beam of searing flame.",
    requires: { fire: 18 },
    runeAll: ["F","R"],
    bonuses: { burstMult: 1.15, addTags: ["burn"] }
  },
  {
    id: "fire:inferno-surge",
    name: "Inferno Surge",
    description: "A surging blast of fire with lingering scorch.",
    requires: { fire: 22 },
    runeAny: ["B","Q","X"],
    bonuses: { burstMult: 1.2, dotMult: 1.1, addTags: ["ignite"] }
  },
  {
    id: "mind:commanding-voice",
    name: "Commanding Voice",
    description: "Compels the target with raw will.",
    requires: { mind: 16 },
    runeAny: ["M","P"],
    bonuses: { burstMult: 1.1, addTags: ["silence"] }
  },
  {
    id: "hybrid:pyro-psychic-lance",
    name: "Pyro-Psychic Lance",
    description: "A lance that burns body and mind.",
    requires: { fire: 18, mind: 18 },
    runeAll: ["F","M","R"],
    bonuses: { burstMult: 1.2, addTags: ["stagger"] }
  },
];

export interface EvolutionOption {
  ruleId: string;
  name: string;
  description: string;
}

export function getAvailableEvolutions(spell: Spell): EvolutionOption[] {
  if (!spell.combat) return [];
  const t = new SpellTraits(spell);
  const options: EvolutionOption[] = [];

  for (const rule of EVOLUTION_RULES) {
    let ok = true;
    for (const k in rule.requires) {
      const type = k as keyof DamageVector;
      // total type output = burst + (dot per sec * duration)
      const total = (spell.combat.burst[type] ?? 0) + (spell.combat.dot[type] ?? 0) * spell.combat.dotDurationSec;
      if (total < (rule.requires[type] ?? 0)) { ok = false; break; }
    }
    if (!ok) continue;

    if (rule.runeAll && !t.hasAll(...(rule.runeAll as any))) continue;
    if (rule.runeAny && !t.hasAny(...(rule.runeAny as any))) continue;

    options.push({ ruleId: rule.id, name: rule.name, description: rule.description });
  }
  return options;
}

export function applyEvolution(spell: Spell, ruleId: string) {
  const rule = EVOLUTION_RULES.find(r => r.id === ruleId);
  if (!rule || !spell.combat) return;

  if (rule.bonuses.burstMult) {
    for (const k in spell.combat.burst) {
      const key = k as keyof DamageVector;
      spell.combat.burst[key] = (spell.combat.burst[key] ?? 0) * rule.bonuses.burstMult;
    }
  }
  if (rule.bonuses.dotMult) {
    for (const k in spell.combat.dot) {
      const key = k as keyof DamageVector;
      spell.combat.dot[key] = (spell.combat.dot[key] ?? 0) * rule.bonuses.dotMult;
    }
  }

  if (rule.bonuses.addTags?.length) {
    const set = new Set([...(spell.lastEval?.effects ?? []), ...rule.bonuses.addTags]);
    if (spell.lastEval) spell.lastEval.effects = Array.from(set) as RuneTag[];
  }

  spell.name = rule.name;
  spell.growth = { power: 0, control: 0, stability: 0, affinity: 0, versatility: 0 };
}
