// lib/utils/id-generation.ts
// Shared utility for converting names to IDs
// Standardizes ID generation across the codebase

/**
 * Converts a name to a URL-safe ID by:
 * - Converting to lowercase
 * - Replacing non-alphanumeric characters with underscores
 * - Removing leading/trailing underscores
 * 
 * Examples:
 * - "Ember Ray" -> "ember_ray"
 * - "Fire & Ice" -> "fire_ice"
 * - "  Test  " -> "test"
 */
export function nameToId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}


