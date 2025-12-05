import { describe, it, expect } from "vitest";
import {
  NAMED_SPELL_BLUEPRINTS,
  getBlueprintById,
} from "@/lib/data/namedSpells";

describe("Named spell blueprints – sanity", () => {
  it("all NamedSpellIds are unique and resolvable via getBlueprintById", () => {
    const ids = NAMED_SPELL_BLUEPRINTS.map((b) => b.id);
    const idSet = new Set(ids);

    // No duplicate ids
    expect(idSet.size).toBe(ids.length);

    // Every id in the array can be looked up
    for (const bp of NAMED_SPELL_BLUEPRINTS) {
      const fromMap = getBlueprintById(bp.id);
      expect(fromMap).toBeDefined();
      expect(fromMap?.id).toBe(bp.id);
    }
  });

  it("each named spell blueprint has at least one required rune", () => {
    for (const bp of NAMED_SPELL_BLUEPRINTS) {
      expect(Array.isArray(bp.requiredRunes)).toBe(true);
      expect(bp.requiredRunes.length).toBeGreaterThan(0);
    }
  });
});
