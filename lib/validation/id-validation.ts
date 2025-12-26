// lib/validation/id-validation.ts
// Shared utility for checking ID uniqueness across collections
// Eliminates duplication of validation logic in form components

import { EntryType } from "@lib/content-editor/constants";
import { getCollectionForEntryType } from "@lib/content-editor/entry-config";

/**
 * Field name mapping for each entry type's unique identifier field
 * Different collections use different field names for their IDs
 */
const ENTRY_TYPE_TO_ID_FIELD: Record<EntryType, string> = {
  [EntryType.Character]: "slug",
  [EntryType.Creature]: "slug",
  [EntryType.Region]: "slug",
  [EntryType.Object]: "slug",
  [EntryType.Story]: "slug",
  [EntryType.Spell]: "spellId",
  [EntryType.Rune]: "code",
  [EntryType.Effect]: "effectType",
  [EntryType.Act]: "slug",
  [EntryType.Chapter]: "slug",
  [EntryType.Page]: "slug",
};

/**
 * Checks if an ID is unique within a collection
 * 
 * @param entryType - The entry type (determines collection and field name)
 * @param id - The ID to check
 * @param projectId - Optional project ID to filter by
 * @param excludeId - Optional entry ID to exclude (for edit mode)
 * @returns Object with isUnique boolean and optional error message
 */
export async function checkIdUniqueness(
  entryType: EntryType,
  id: string,
  projectId?: string,
  excludeId?: number
): Promise<{ isUnique: boolean; error?: string }> {
  if (!id.trim()) {
    return { isUnique: true };
  }

  const normalizedId = id.trim().toLowerCase();
  const collection = getCollectionForEntryType(entryType);
  const fieldName = ENTRY_TYPE_TO_ID_FIELD[entryType];

  try {
    const queryParts: string[] = [];
    queryParts.push(`where[${fieldName}][equals]=${encodeURIComponent(normalizedId)}`);

    // Filter by project if provided
    if (projectId) {
      const projectIdNum = typeof projectId === "string" ? parseInt(projectId, 10) : projectId;
      if (!isNaN(projectIdNum)) {
        queryParts.push(`where[project][equals]=${projectIdNum}`);
      }
    }

    // Exclude current entry in edit mode
    if (excludeId) {
      queryParts.push(`where[id][not_equals]=${excludeId}`);
    }

    queryParts.push("limit=1");

    const queryString = queryParts.join("&");
    const url = `/api/payload/${collection}?${queryString}`;

    const res = await fetch(url);

    if (!res.ok) {
      // If error (like 404, 500, etc), log but assume unique (don't block user)
      const errorText = await res.text().catch(() => "");
      console.warn(`ID validation API error (${res.status}) for ID "${normalizedId}":`, errorText);
      return { isUnique: true };
    }

    const data = await res.json();

    // Check response structure - Payload returns { docs: [...], totalDocs: number, ... }
    const docs = data.docs || data.results || (Array.isArray(data) ? data : []);

    // If no docs returned, ID is unique
    if (!Array.isArray(docs) || docs.length === 0) {
      return { isUnique: true };
    }

    // If we got results, verify the field matches exactly (case-insensitive)
    const matchingDoc = docs.find((doc: any) => {
      const docValue = doc[fieldName]?.toLowerCase()?.trim();
      return docValue === normalizedId;
    });

    if (matchingDoc) {
      // Get display name for error message
      const entryTypeName = entryType.charAt(0).toUpperCase() + entryType.slice(1);
      return {
        isUnique: false,
        error: `A ${entryTypeName.toLowerCase()} with ID "${id}" already exists${projectId ? " in this project" : ""}. Please choose a different ID.`,
      };
    }

    return { isUnique: true };
  } catch (error) {
    console.error("Error checking ID uniqueness:", error);
    return { isUnique: true };
  }
}

