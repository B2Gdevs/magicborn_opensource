// spell.ts
// Spell entity transformers

import type { NamedSpellBlueprint } from "@/lib/data/namedSpells";

/**
 * Transform Payload API response to SpellForm data
 */
export function payloadToSpell(payload: unknown): Partial<NamedSpellBlueprint> | undefined {
  if (typeof payload !== "object" || !payload) return undefined;
  
  const p = payload as Record<string, unknown>;
  
  return {
    id: (p.spellId as string) || (p.id?.toString() || ""),
    name: (p.name as string) || "",
    description: (p.description as string) || "",
    tags: (p.tags as NamedSpellBlueprint["tags"]) || [],
    requiredRunes: p.requiredRunes as NamedSpellBlueprint["requiredRunes"],
    allowedExtraRunes: p.allowedExtraRunes as NamedSpellBlueprint["allowedExtraRunes"],
    minDamageFocus: p.minDamageFocus as NamedSpellBlueprint["minDamageFocus"],
    minTotalPower: p.minTotalPower as number,
    requiresNamedSourceId: p.requiresNamedSourceId as string,
    minRuneFamiliarity: p.minRuneFamiliarity as NamedSpellBlueprint["minRuneFamiliarity"],
    minTotalFamiliarityScore: p.minTotalFamiliarityScore as number,
    requiredFlags: p.requiredFlags as NamedSpellBlueprint["requiredFlags"],
    effects: p.effects as NamedSpellBlueprint["effects"],
    hidden: p.hidden as boolean,
    hint: p.hint as string,
    imageId:
      typeof p.image === "object" && p.image && "id" in p.image
        ? (p.image.id as number)
        : typeof p.image === "number"
          ? p.image
          : undefined,
  };
}

/**
 * Transform SpellForm data to Payload API format
 */
export function spellToPayload(
  spell: NamedSpellBlueprint,
  projectId: string
): Record<string, unknown> {
  return {
    project: parseInt(projectId, 10),
    ...(spell.id && spell.id.trim() ? { spellId: spell.id } : {}),
    name: spell.name,
    description: spell.description,
    tags: spell.tags,
    requiredRunes: spell.requiredRunes,
    allowedExtraRunes: spell.allowedExtraRunes,
    minDamageFocus: spell.minDamageFocus,
    minTotalPower: spell.minTotalPower,
    requiresNamedSourceId: spell.requiresNamedSourceId,
    minRuneFamiliarity: spell.minRuneFamiliarity,
    minTotalFamiliarityScore: spell.minTotalFamiliarityScore,
    requiredFlags: spell.requiredFlags,
    effects: spell.effects,
    hidden: spell.hidden,
    hint: spell.hint,
    ...(spell.imageId ? { image: spell.imageId } : {}),
  };
}

