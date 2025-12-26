// lib/hooks/useCodexEntries.ts
// React Query hooks for fetching codex entries

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CodexCategory, CATEGORY_TO_COLLECTION } from "@lib/content-editor/constants";

interface CodexEntry {
  id: string;
  name: string;
}

interface UseCodexEntriesOptions {
  categoryId: CodexCategory;
  projectId: string;
  enabled?: boolean;
}

/**
 * Fetch codex entries for a specific category
 */
export function useCodexEntries({ categoryId, projectId, enabled = true }: UseCodexEntriesOptions) {
  const collection = CATEGORY_TO_COLLECTION[categoryId];

  return useQuery<CodexEntry[]>({
    queryKey: ["codexEntries", categoryId, projectId],
    queryFn: async () => {
      if (!collection) return [];

      const response = await fetch(
        `/api/payload/${collection}?where[project][equals]=${projectId}&limit=50`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ${categoryId} entries`);
      }

      const result = await response.json();
      const entries = result.docs?.map((doc: any) => {
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
          id: String(doc.id), // Payload numeric ID as string
          name: displayName,
        };
      }) || [];

      return entries;
    },
    enabled: enabled && !!collection,
    staleTime: 30 * 1000, // 30 seconds - entries don't change that often
  });
}

/**
 * Hook to invalidate codex entries for a category
 */
export function useInvalidateCodexEntries() {
  const queryClient = useQueryClient();

  return (categoryId: CodexCategory, projectId: string) => {
    queryClient.invalidateQueries({
      queryKey: ["codexEntries", categoryId, projectId],
    });
  };
}




