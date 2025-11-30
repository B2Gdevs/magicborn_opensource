import type { Player, Spell } from "@core/types";
import { RUNES } from "@pkg/runes";

export function computeSpellManaCost(player: Player, spell: Spell): number {
  let base = 0;
  for (const r of spell.runes) {
    base += RUNES[r].manaCost;
  }

  const extra =
    spell.infusions?.reduce((sum, inf) => sum + Math.max(0, inf.extraMana), 0) ?? 0;

  const raw = base + extra;

  const eff = clamp(1 - (player.costEfficiency ?? 0), 0.7, 1.0);
  return Math.round(raw * eff);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
