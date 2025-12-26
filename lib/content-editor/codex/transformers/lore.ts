// lore.ts
// Lore/Story entity transformers

import type { LoreFormData } from "@/components/lore/LoreForm";

/**
 * Transform Payload API response to LoreForm data
 * Lore forms use the payload format directly
 */
export function payloadToLore(payload: unknown): LoreFormData | undefined {
  if (typeof payload !== "object" || !payload) return undefined;
  return payload as LoreFormData;
}

/**
 * Transform LoreForm data to Payload API format
 */
export function loreToPayload(
  data: LoreFormData,
  projectId: string
): Record<string, unknown> {
  return {
    project: parseInt(projectId, 10),
    title: data.title,
    content: data.content,
    category: data.category || "history",
    excerpt: data.content?.substring(0, 200),
    ...(data.slug && data.slug.trim() ? { slug: data.slug } : {}),
    ...(data.featuredImage ? { featuredImage: data.featuredImage } : {}),
  };
}

