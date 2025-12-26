// region.ts
// Region entity transformers

import type { RegionFormData } from "@/components/region/RegionForm";

/**
 * Transform Payload API response to RegionForm data
 * Region forms use the payload format directly
 */
export function payloadToRegion(payload: unknown): RegionFormData | undefined {
  if (typeof payload !== "object" || !payload) return undefined;
  return payload as RegionFormData;
}

/**
 * Transform RegionForm data to Payload API format
 */
export function regionToPayload(
  data: RegionFormData,
  projectId: string
): Record<string, unknown> {
  const payload: Record<string, unknown> = { 
    ...data,
    project: parseInt(projectId, 10),
  };
  
  // Only include slug if provided (for new entries, server generates it)
  if (!payload.slug || (typeof payload.slug === "string" && !payload.slug.trim())) {
    delete payload.slug;
  }
  
  return payload;
}

