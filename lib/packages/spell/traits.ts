import type { RuneCode, Spell } from "@core/types";

export class SpellTraits {
  constructor(public spell: Spell) {}

  get set(): Set<RuneCode> { return new Set(this.spell.runes); }
  count(r: RuneCode): number { return this.spell.runes.reduce((n, x) => (x === r ? n + 1 : n), 0); }
  has(r: RuneCode): boolean { return this.set.has(r); }
  hasAny(...rs: RuneCode[]): boolean { return rs.some(r => this.set.has(r)); }
  hasAll(...rs: RuneCode[]): boolean { return rs.every(r => this.set.has(r)); }

  get hasDuration(): boolean { return this.has("D"); }
  get isSelfTarget(): boolean { return this.has("S") && !this.has("T"); }
  get isTargeted(): boolean { return this.has("T"); }
  get isBeamLike(): boolean { return this.has("R"); }
  get isAmplified(): boolean { return this.has("X"); }
  get isAOE(): boolean { return this.hasAny("B","Q"); }
}
