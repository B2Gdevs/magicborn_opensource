// lib/content-editor/entry-type-config-types.ts
// TypeScript types for entry type configuration overrides

import { EntryType } from "./constants";

/**
 * Configuration override for a single entry type
 */
export interface EntryTypeConfigOverride {
  displayName?: string;
  // Future: could add icon, category, etc. if needed
}

/**
 * Project-level entry type configuration overrides
 * Maps EntryType to its override config
 */
export type EntryTypeConfigs = Partial<Record<EntryType, EntryTypeConfigOverride>>;

/**
 * Type guard to validate entry type configs structure
 */
export function isValidEntryTypeConfigs(value: unknown): value is EntryTypeConfigs {
  if (!value || typeof value !== "object") {
    return false;
  }

  const configs = value as Record<string, unknown>;
  
  // Check that all keys are valid EntryType values
  const validEntryTypes = Object.values(EntryType);
  for (const key in configs) {
    if (!validEntryTypes.includes(key as EntryType)) {
      return false;
    }
    
    const override = configs[key];
    if (override && typeof override === "object") {
      const overrideObj = override as Record<string, unknown>;
      // Check that displayName is a string if present
      if ("displayName" in overrideObj && typeof overrideObj.displayName !== "string") {
        return false;
      }
    } else if (override !== undefined && override !== null) {
      return false;
    }
  }
  
  return true;
}

