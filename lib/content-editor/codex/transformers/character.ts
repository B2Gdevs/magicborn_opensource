// character.ts
// Character entity transformers
// Convert between Payload API format and form data format

import type { CharacterDefinition } from "@/lib/data/characters";
import type { EffectInstance } from "@core/effects";

/**
 * Transform Payload API response to CharacterForm data
 */
export function payloadToCharacter(payload: unknown): Partial<CharacterDefinition> {
  if (typeof payload !== "object" || !payload) return {};
  
  const p = payload as Record<string, unknown>;
  const combatStats = ((p.combatStats as Record<string, unknown>) || {}) as {
    hp?: number;
    maxHp?: number;
    mana?: number;
    maxMana?: number;
    affinity?: Record<string, number>;
    elementXp?: Record<string, number>;
    elementAffinity?: Record<string, number>;
    controlBonus?: number;
    costEfficiency?: number;
    effects?: Array<{
      type: string;
      magnitude: number;
      durationSec: number;
      stacks?: number;
      appliedAt?: number;
      self?: boolean;
    }>;
  };

  return {
    id: (p.slug as string) || (p.id?.toString() || ""),
    name: (p.name as string) || "",
    description: (p.description as string) || "",
    hp: combatStats.hp ?? 0,
    maxHp: combatStats.maxHp ?? 0,
    mana: combatStats.mana ?? 0,
    maxMana: combatStats.maxMana ?? 0,
    affinity: combatStats.affinity || {},
    elementXp: combatStats.elementXp,
    elementAffinity: combatStats.elementAffinity,
    controlBonus: combatStats.controlBonus,
    costEfficiency: combatStats.costEfficiency,
    effects: (combatStats.effects || []).map(
      (eff): EffectInstance => ({
        type: eff.type as EffectInstance["type"],
        magnitude: eff.magnitude ?? 0,
        durationSec: eff.durationSec ?? 0,
        self: eff.self ?? false,
      })
    ),
    imageId:
      typeof p.image === "object" && p.image && "id" in p.image
        ? (p.image.id as number)
        : typeof p.image === "number"
          ? p.image
          : undefined,
    storyIds: [],
  };
}

/**
 * Transform CharacterForm data to Payload API format
 */
export function characterToPayload(
  data: CharacterDefinition,
  projectId: string
): Record<string, unknown> {
  return {
    project: parseInt(projectId, 10),
    slug: data.id || undefined,
    name: data.name,
    description: data.description || "",
    image: data.imageId || null,
    combatStats: {
      hp: data.hp ?? 0,
      maxHp: data.maxHp ?? 0,
      mana: data.mana ?? 0,
      maxMana: data.maxMana ?? 0,
      affinity: data.affinity || {},
      elementXp: data.elementXp || {},
      elementAffinity: data.elementAffinity || {},
      controlBonus: data.controlBonus,
      costEfficiency: data.costEfficiency,
    },
  };
}

