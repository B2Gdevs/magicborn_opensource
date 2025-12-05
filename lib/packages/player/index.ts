import { AlphabetVector, Player } from "@core/types";

export class PlayerService {
  create(id: string, name: string, initialAffinity?: Partial<AlphabetVector>): Player {
    return {
      id,
      name,
      affinity: { ...(initialAffinity ?? {}) },
      mana: 100,
      maxMana: 100,
      controlBonus: 0,
      costEfficiency: 0,
      hp: 100,
      maxHp: 100,
      effects: [],
      elementXp: {},
      elementAffinity: {},
    };
  }

  validate(p: Player): string[] {
    const errs: string[] = [];
    if (!p.id.trim()) errs.push("Player ID is required.");
    if (!p.name.trim()) errs.push("Player name is required.");
    for (const k of Object.keys(p.affinity)) {
      const v = (p.affinity as any)[k];
      if (typeof v !== "number" || Number.isNaN(v)) errs.push(`Affinity ${k} must be a number.`);
      if (v < 0 || v > 1) errs.push(`Affinity ${k} must be in [0,1].`);
    }
    return errs;
    }
}
