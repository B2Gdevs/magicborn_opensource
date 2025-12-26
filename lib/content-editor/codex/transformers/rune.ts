// rune.ts
// Rune entity transformers

import type { RuneDef } from "@/lib/packages/runes";

/**
 * Transform Payload API response to RuneForm data
 */
export function payloadToRune(payload: unknown): Partial<RuneDef> {
  if (typeof payload !== "object" || !payload) return {};
  
  const p = payload as Record<string, unknown>;
  
  return {
    code: p.code as RuneDef["code"],
    concept: p.concept as string,
    powerFactor: p.powerFactor as number,
    controlFactor: p.controlFactor as number,
    instabilityBase: p.instabilityBase as number,
    tags: (p.tags as RuneDef["tags"]) || [],
    manaCost: p.manaCost as number,
    damage: p.damage as RuneDef["damage"],
    ccInstant: p.ccInstant as RuneDef["ccInstant"],
    pen: p.pen as RuneDef["pen"],
    effects: p.effects as RuneDef["effects"],
    overchargeEffects: p.overchargeEffects as RuneDef["overchargeEffects"],
    dotAffinity: p.dotAffinity as RuneDef["dotAffinity"],
    imageId:
      typeof p.image === "object" && p.image && "id" in p.image
        ? (p.image.id as number)
        : typeof p.image === "number"
          ? p.image
          : undefined,
  };
}

/**
 * Transform RuneForm data to Payload API format
 */
export function runeToPayload(
  rune: RuneDef,
  projectId: string
): Record<string, unknown> {
  return {
    project: parseInt(projectId, 10),
    code: rune.code,
    concept: rune.concept,
    powerFactor: rune.powerFactor,
    controlFactor: rune.controlFactor,
    instabilityBase: rune.instabilityBase,
    tags: rune.tags,
    manaCost: rune.manaCost,
    damage: rune.damage || null,
    ccInstant: rune.ccInstant || null,
    pen: rune.pen || null,
    effects: rune.effects || null,
    overchargeEffects: rune.overchargeEffects || null,
    dotAffinity: rune.dotAffinity || null,
    ...(rune.imageId ? { image: rune.imageId } : {}),
  };
}

