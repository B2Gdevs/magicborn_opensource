// useCodexEntriesByCategory.ts
// Hook to fetch all category entries using useQueries (replaces per-category boilerplate)

import { useQueries } from "@tanstack/react-query";
import { CodexCategory, CATEGORY_TO_COLLECTION } from "@lib/content-editor/constants";
import type { CodexEntry } from "../types/codex.types";

interface UseCodexEntriesByCategoryArgs {
  projectId: string;
  categories: CodexCategory[];
  expanded: Record<CodexCategory, boolean>;
  isMagicbornMode: boolean;
}

/**
 * Fetch entries for all categories using useQueries
 * Only fetches when category is expanded
 */
export function useCodexEntriesByCategory({
  projectId,
  categories,
  expanded,
  isMagicbornMode,
}: UseCodexEntriesByCategoryArgs) {
  const queries = useQueries({
    queries: categories.map((categoryId) => {
      const collection = CATEGORY_TO_COLLECTION[categoryId];
      const isMagicbornOnly =
        categoryId === CodexCategory.Spells ||
        categoryId === CodexCategory.Runes ||
        categoryId === CodexCategory.Effects;

      return {
        queryKey: ["codexEntries", categoryId, projectId],
        queryFn: async (): Promise<CodexEntry[]> => {
          if (!collection) return [];

          // Fetch entries - Payload automatically excludes trashed when trash is enabled
          // For existing data without _status, we'll filter client-side if needed
          const response = await fetch(
            `/api/payload/${collection}?where[project][equals]=${projectId}&limit=50`
          );

          if (!response.ok) {
            throw new Error(`Failed to fetch ${categoryId} entries`);
          }

          const result = await response.json();
          const entries = result.docs
            ?.filter((doc: any) => {
              // Exclude trashed items (if _status exists and is 'trashed')
              return !doc._status || doc._status !== 'trashed';
            })
            ?.map((doc: any) => {
              // Handle different name fields for different collections
              let displayName: string;
              if (categoryId === CodexCategory.Runes) {
                displayName = doc.concept || doc.name || `Rune ${doc.code || doc.id}`;
              } else if (categoryId === CodexCategory.Effects) {
                displayName = doc.name || doc.effectType || `Effect ${doc.id}`;
              } else {
                displayName = doc.name || doc.title || `Entry ${doc.id}`;
              }
              return {
                id: String(doc.id),
                name: displayName,
                parentId: doc.parentId || null, // For future nested Regions
              };
            }) || [];

          return entries;
        },
        enabled:
          expanded[categoryId] === true &&
          !!collection &&
          (!isMagicbornOnly || isMagicbornMode),
        staleTime: 30 * 1000, // 30 seconds
      };
    }),
  });

  // Create lookup maps
  const getEntries = (categoryId: CodexCategory): CodexEntry[] => {
    const index = categories.indexOf(categoryId);
    if (index === -1) return [];
    return queries[index]?.data ?? [];
  };

  const isLoading = (categoryId: CodexCategory): boolean => {
    const index = categories.indexOf(categoryId);
    if (index === -1) return false;
    return queries[index]?.isLoading ?? false;
  };

  return {
    getEntries,
    isLoading,
  };
}

