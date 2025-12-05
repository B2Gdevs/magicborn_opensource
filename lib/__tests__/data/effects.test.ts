import { describe, it, expect } from "vitest";
import { EffectType } from "@core/enums";
import { EFFECT_DEFS } from "@/lib/data/effects";
import { RUNES } from "@pkg/runes";

describe("Effect definitions – enum coverage", () => {
  it("every EffectType has a corresponding entry in EFFECT_DEFS", () => {
    const allTypes = Object.values(EffectType);

    for (const t of allTypes) {
      const def = EFFECT_DEFS[t];
      expect(def).toBeDefined();
      expect(def.id).toBe(t);
    }
  });
});

describe("Effect definitions – magnitude and duration sanity", () => {
  it("each effect definition has non-zero magnitude and reasonable duration", () => {
    const defs = Object.values(EFFECT_DEFS);

    for (const def of defs) {
      const { baseMagnitude, baseDurationSec } = def.blueprint;

      // magnitude should be non-zero (buffs/debuffs should do something)
      expect(baseMagnitude).not.toBe(0);

      // duration should be > 0 and not absurdly large
      expect(baseDurationSec).toBeGreaterThan(0);
      expect(baseDurationSec).toBeLessThanOrEqual(600);
    }
  });
});

describe("Effect definitions – all rune effects reference known EffectTypes", () => {
  it("every effect and overcharge effect used by runes has a definition", () => {
    const effectKeys = new Set(Object.keys(EFFECT_DEFS));

    // We don't care about exact RuneDefinition type here – we just
    // inspect the shape used by CombatStatsService: effects + overchargeEffects.
    const runeDefs = Object.values(RUNES) as any[];

    for (const rune of runeDefs) {
      const effects = (rune?.effects ?? []) as { type: EffectType }[];
      const overchargeEffects = (rune?.overchargeEffects ?? []) as {
        blueprint: { type: EffectType };
      }[];

      for (const eff of effects) {
        expect(effectKeys.has(eff.type)).toBe(true);
      }

      for (const tier of overchargeEffects) {
        const t = tier.blueprint.type;
        expect(effectKeys.has(t)).toBe(true);
      }
    }
  });
});
