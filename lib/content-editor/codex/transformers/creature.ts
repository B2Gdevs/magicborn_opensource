// creature.ts
// Creature entity transformers

import type { CreatureDefinition } from "@/lib/data/creatures";

const DEFAULT_CREATURE: CreatureDefinition = {
  id: "",
  name: "",
  description: "",
  hp: 100,
  maxHp: 100,
  mana: 50,
  maxMana: 50,
  affinity: {},
  effects: [],
  storyIds: [],
};

/**
 * Transform Payload API response to CreatureForm data
 */
export function payloadToCreature(payload: unknown): CreatureDefinition {
  if (typeof payload !== "object" || !payload) {
    return { ...DEFAULT_CREATURE };
  }

  const p = payload as Record<string, unknown>;
  const combatStats = ((p.combatStats as Record<string, unknown>) || {}) as {
    hp?: number;
    maxHp?: number;
    mana?: number;
    maxMana?: number;
    affinity?: Record<string, number>;
    elementXp?: Record<string, number>;
    elementAffinity?: Record<string, number>;
  };

  return {
    id: (p.slug as string) || (p.id?.toString() || ""),
    name: (p.name as string) || "",
    description: (p.description as string) || "",
    hp: combatStats.hp ?? 100,
    maxHp: combatStats.maxHp ?? 100,
    mana: combatStats.mana ?? 50,
    maxMana: combatStats.maxMana ?? 50,
    affinity: combatStats.affinity || {},
    elementXp: combatStats.elementXp,
    elementAffinity: combatStats.elementAffinity,
    effects: [],
    storyIds: [],
    imageId:
      typeof p.image === "object" && p.image && "id" in p.image
        ? (p.image.id as number)
        : typeof p.image === "number"
          ? p.image
          : undefined,
    landmarkIconId:
      typeof p.landmarkIcon === "object" && p.landmarkIcon && "id" in p.landmarkIcon
        ? (p.landmarkIcon.id as number)
        : typeof p.landmarkIcon === "number"
          ? p.landmarkIcon
          : undefined,
  };
}

/**
 * Transform CreatureForm data to Payload API format
 */
export function creatureToPayload(
  creature: CreatureDefinition,
  projectId: string
): Record<string, unknown> {
  return {
    project: parseInt(projectId, 10),
    ...(creature.id && creature.id.trim() ? { slug: creature.id.trim().toLowerCase() } : {}),
    name: creature.name.trim(),
    description: (creature.description || "").trim(),
    combatStats: {
      hp: creature.hp,
      maxHp: creature.maxHp,
      mana: creature.mana,
      maxMana: creature.maxMana,
      affinity: creature.affinity,
      ...(creature.elementXp && { elementXp: creature.elementXp }),
      ...(creature.elementAffinity && { elementAffinity: creature.elementAffinity }),
    },
    ...(creature.imageId ? { image: creature.imageId } : {}),
    ...(creature.landmarkIconId ? { landmarkIcon: creature.landmarkIconId } : {}),
  };
}

