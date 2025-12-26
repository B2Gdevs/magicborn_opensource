// lib/packages/runes/RuneService.ts
// Service for loading and managing runes

import type { RuneCode } from "@core/types";
import type { RuneDefinition } from "@/lib/data/runes";

/**
 * Load runes from Payload CMS with fallback to hardcoded data.
 * This ensures tests and runtime code continue to work.
 */
async function loadRunesFromPayload(projectId?: number): Promise<Record<RuneCode, RuneDefinition> | null> {
  try {
    // Only load from Payload on server-side
    if (typeof window === "undefined") {
      const queryParts: string[] = [];
      if (projectId) {
        queryParts.push(`where[project][equals]=${projectId}`);
      }
      queryParts.push('limit=100'); // Get all runes
      
      const queryString = queryParts.join('&');
      const url = `/api/payload/runes?${queryString}`;
      
      const res = await fetch(url);
      
      if (res.ok) {
        const data = await res.json();
        const docs = data.docs || data.results || (Array.isArray(data) ? data : []);
        
        if (docs.length > 0) {
          // Convert array to Record<RuneCode, RuneDefinition>
          const runesRecord = {} as Record<RuneCode, RuneDefinition>;
          for (const doc of docs) {
            const code = doc.code as RuneCode;
            if (code && code.length === 1) {
              // Transform Payload document to RuneDefinition
              runesRecord[code] = {
                id: code,
                name: doc.concept || "",
                code,
                concept: doc.concept || "",
                description: doc.description || "",
                powerFactor: doc.powerFactor || 1.0,
                controlFactor: doc.controlFactor || 1.0,
                instabilityBase: doc.instabilityBase || 0,
                tags: doc.tags || [],
                manaCost: doc.manaCost || 0,
                damage: doc.damage,
                ccInstant: doc.ccInstant,
                pen: doc.pen,
                effects: doc.effects,
                overchargeEffects: doc.overchargeEffects,
                dotAffinity: doc.dotAffinity,
                imageId: typeof doc.image === 'object' ? doc.image?.id : doc.image,
                landmarkIconId: typeof doc.landmarkIcon === 'object' ? doc.landmarkIcon?.id : doc.landmarkIcon,
              };
            }
          }
          
          // Ensure all 26 runes exist (A-Z)
          // If Payload is missing some, they'll need to be created
          const allCodes: RuneCode[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
          const missingCodes = allCodes.filter(code => !runesRecord[code]);
          
          if (missingCodes.length > 0) {
            console.warn(`Missing runes in Payload: ${missingCodes.join(", ")}`);
          }
          
          return runesRecord;
        }
      }
    }
  } catch (error) {
    console.warn("Failed to load runes from Payload:", error);
  }
  return null;
}

// Cache for runes
let _cachedRunes: Record<RuneCode, RuneDef> | null = null;
let _cachedProjectId: number | undefined = undefined;

/**
 * Get all runes, loading from Payload if available.
 * Falls back to hardcoded data if Payload is unavailable.
 * 
 * @param projectId Optional project ID to filter runes
 * @param fallbackRunes Fallback hardcoded runes if Payload fails
 */
export async function getRunes(
  projectId?: number,
  fallbackRunes?: Record<RuneCode, RuneDefinition>
): Promise<Record<RuneCode, RuneDefinition>> {
  // Return cached if same project
  if (_cachedRunes && _cachedProjectId === projectId) {
    return _cachedRunes;
  }
  
  // Try to load from Payload
  const payloadRunes = await loadRunesFromPayload(projectId);
  if (payloadRunes) {
    _cachedRunes = payloadRunes;
    _cachedProjectId = projectId;
    return payloadRunes;
  }
  
  // Fallback to hardcoded data
  if (fallbackRunes) {
    _cachedRunes = fallbackRunes;
    _cachedProjectId = projectId;
    return fallbackRunes;
  }
  
  // Last resort: return empty (shouldn't happen)
  console.error("No runes available from Payload or fallback");
  return {} as Record<RuneCode, RuneDefinition>;
}

/**
 * Get all runes synchronously (uses cache or fallback).
 * For client-side use where async isn't available.
 */
export function getRunesSync(fallbackRunes: Record<RuneCode, RuneDefinition>): Record<RuneCode, RuneDefinition> {
  if (_cachedRunes) {
    return _cachedRunes;
  }
  return fallbackRunes;
}

/**
 * List all runes as an array.
 */
export function listRunes(runes: Record<RuneCode, RuneDefinition>): RuneDefinition[] {
  return Object.values(runes);
}

/**
 * Clear the runes cache (useful for testing or after updates).
 */
export function clearRunesCache(): void {
  _cachedRunes = null;
  _cachedProjectId = undefined;
}

