// lib/packages/runes/index.ts
// Re-exports for backward compatibility
// RuneDef has been moved to @data/runes
// Service functions are in RuneService.ts
// Hardcoded fallback data is in fallbackData.ts

import type { RuneCode } from "@core/types";
import type { RuneDefinition } from "@/lib/data/runes";
import { getRunesSync } from "./RuneService";
import { HARDCODED_RUNES } from "./fallbackData";

// Re-export types (RuneDef kept for backward compatibility)
export type { RuneDefinition, RuneDef, OverchargeEffect } from "@/lib/data/runes";

// Re-export constants
export { RC } from "./constants";

// Re-export service functions (excluding listRunes - we'll define our own for backward compat)
export { getRunes, getRunesSync, clearRunesCache } from "./RuneService";

// Backward compatibility: getRUNES() - synchronous version using fallback
let _cachedRunes: Record<RuneCode, RuneDefinition> | null = null;

export function getRUNES(): Record<RuneCode, RuneDefinition> {
  if (!_cachedRunes) {
    _cachedRunes = getRunesSync(HARDCODED_RUNES);
  }
  return _cachedRunes;
}

// Backward compatibility: RUNES proxy
export const RUNES: Record<RuneCode, RuneDefinition> = new Proxy({} as Record<RuneCode, RuneDefinition>, {
  get(target, prop) {
    const runes = getRUNES();
    return runes[prop as RuneCode];
  },
  ownKeys() {
    return Object.keys(getRUNES());
  },
  has(target, prop) {
    return prop in getRUNES();
  },
  getOwnPropertyDescriptor(target, prop) {
    return Object.getOwnPropertyDescriptor(getRUNES(), prop);
  },
});

// Backward compatibility: listRunes() function
export function listRunes(): RuneDefinition[] {
  return Object.values(getRUNES());
}
