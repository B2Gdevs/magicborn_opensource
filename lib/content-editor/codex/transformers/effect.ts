// effect.ts
// Effect entity transformers

import type { EffectDefinition, EffectCategory } from "@/lib/data/effects";

/**
 * Transform Payload API response to EffectForm data
 */
export function payloadToEffect(payload: unknown): (EffectDefinition & { imageId?: number; landmarkIconId?: number }) | undefined {
  if (typeof payload !== "object" || !payload) return undefined;
  
  const p = payload as Record<string, unknown>;
  
  return {
    id: (p.id as string) || (p.slug as string) || "", // Auto-generated ID from Payload
    effectType: p.effectType as any, // EffectType enum
    name: p.name as string,
    description: p.description as string,
    category: p.category as EffectCategory,
    isBuff: p.isBuff as boolean,
    iconKey: p.iconKey as string,
    maxStacks: p.maxStacks as number,
    blueprint: p.blueprint as any,
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
 * Transform EffectForm data to Payload API format
 */
export function effectToPayload(
  effect: EffectDefinition & { imageId?: number; landmarkIconId?: number },
  projectId: string
): Record<string, unknown> {
  return {
    project: parseInt(projectId, 10),
    effectType: effect.effectType, // Use effectType field, not id
    name: effect.name,
    description: effect.description,
    category: effect.category,
    isBuff: effect.isBuff,
    iconKey: effect.iconKey,
    maxStacks: effect.maxStacks,
    blueprint: effect.blueprint,
    ...(effect.imageId ? { image: effect.imageId } : {}),
    ...(effect.landmarkIconId ? { landmarkIcon: effect.landmarkIconId } : {}),
  };
}

