// lib/core/spellTier.ts
import type { Spell } from "@core/types";

export enum SpellTier {
  Nameless = 0,
  NamedTier1 = 1,
  NamedTier2Plus = 2,
}

export function getSpellTier(spell: Spell): SpellTier {
  if (!spell.name) return SpellTier.Nameless;
  // Later, you can store evolution depth or inspect history; for now:
  if (!spell.evolvedFrom) return SpellTier.NamedTier1;
  return SpellTier.NamedTier2Plus;
}

/** Multiplier for how much affinity XP we grant when casting this spell. */
export function getAffinityWeightForSpell(spell: Spell): number {
  switch (getSpellTier(spell)) {
    case SpellTier.Nameless:
      return 0.4;     // low gain: discourages infinite grinding of junk
    case SpellTier.NamedTier1:
      return 1.0;     // “normal” gain once you discover a proper spell
    case SpellTier.NamedTier2Plus:
      return 1.3;     // reward advanced evolutions with faster growth
    default:
      return 1.0;
  }
}
