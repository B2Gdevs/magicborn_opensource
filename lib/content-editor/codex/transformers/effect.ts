// effect.ts
// Effect entity transformers

import type { EffectDefinition } from "@/lib/data/effects";

/**
 * Transform Payload API response to EffectForm data
 */
export function payloadToEffect(payload: unknown): (EffectDefinition & { image?: number }) | undefined {
  if (typeof payload !== "object" || !payload) return undefined;
  return payload as EffectDefinition & { image?: number };
}

/**
 * Transform EffectForm data to Payload API format
 */
export function effectToPayload(
  effect: EffectDefinition & { image?: number },
  projectId: string
): Record<string, unknown> {
  return {
    project: parseInt(projectId, 10),
    effectType: effect.id,
    name: effect.name,
    description: effect.description,
    category: effect.category,
    isBuff: effect.isBuff,
    iconKey: effect.iconKey,
    maxStacks: effect.maxStacks,
    blueprint: effect.blueprint,
    ...(effect.image ? { image: effect.image } : {}),
  };
}

