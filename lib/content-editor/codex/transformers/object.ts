// object.ts
// Object entity transformers

import type { ObjectFormData } from "@/components/object/ObjectForm";

/**
 * Transform Payload API response to ObjectForm data
 * Object forms use the payload format directly
 */
export function payloadToObject(payload: unknown): ObjectFormData | undefined {
  if (typeof payload !== "object" || !payload) return undefined;
  return payload as ObjectFormData;
}

/**
 * Transform ObjectForm data to Payload API format
 */
export function objectToPayload(
  data: ObjectFormData,
  projectId: string
): Record<string, unknown> {
  return {
    project: parseInt(projectId, 10),
    name: data.name,
    ...(data.slug && data.slug.trim() ? { slug: data.slug } : {}),
    description: data.description,
    type: data.type,
    rarity: data.rarity,
    weight: data.weight,
    value: data.value,
    ...(data.image ? { image: data.image } : {}),
  };
}

