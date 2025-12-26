// hooks/useCodexActions.ts
// CRUD operations for codex entries

import { useCallback } from "react";
import { CodexCategory, CATEGORY_TO_COLLECTION } from "@lib/content-editor/constants";
import { toast } from "@/lib/hooks/useToast";

interface UseCodexActionsProps {
  projectId: string;
  invalidateCategory: (categoryId: CodexCategory) => void;
}

export function useCodexActions({ projectId, invalidateCategory }: UseCodexActionsProps) {
  const handleDelete = useCallback(async (categoryId: CodexCategory, entryId: string) => {
    const collection = CATEGORY_TO_COLLECTION[categoryId];
    if (!collection) return;

    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      await fetch(`/api/payload/${collection}/${entryId}`, {
        method: "DELETE",
      });
      invalidateCategory(categoryId);
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete entry");
    }
  }, [projectId, invalidateCategory]);

  const handleDuplicate = useCallback(async (categoryId: CodexCategory, entryId: string) => {
    const collection = CATEGORY_TO_COLLECTION[categoryId];
    if (!collection) return;

    try {
      const res = await fetch(`/api/payload/${collection}/${entryId}`);
      const original = await res.json();

      const copy = { ...original };
      delete copy.id;
      delete copy.createdAt;
      delete copy.updatedAt;
      if (copy.name) copy.name = `${copy.name} (Copy)`;
      if (copy.title) copy.title = `${copy.title} (Copy)`;

      await fetch(`/api/payload/${collection}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(copy),
      });

      invalidateCategory(categoryId);
    } catch (error) {
      console.error("Failed to duplicate:", error);
      toast.error("Failed to duplicate entry");
    }
  }, [projectId, invalidateCategory]);

  const handleBulkDelete = useCallback(async (
    categoryId: CodexCategory,
    entryIds: string[]
  ) => {
    const collection = CATEGORY_TO_COLLECTION[categoryId];
    if (!collection) return;

    const categoryName = categoryId;
    const confirmed = confirm(
      `Are you sure you want to delete ${entryIds.length} ${categoryName}? This action will be versioned.`
    );

    if (!confirmed) return;

    try {
      await Promise.all(
        entryIds.map(entryId =>
          fetch(`/api/payload/${collection}/${entryId}`, {
            method: "DELETE",
          })
        )
      );
      invalidateCategory(categoryId);
    } catch (error) {
      console.error("Failed to delete entries:", error);
      toast.error("Failed to delete some entries. Please try again.");
    }
  }, [projectId, invalidateCategory]);

  const handleBulkDuplicate = useCallback(async (
    categoryId: CodexCategory,
    entryIds: string[]
  ) => {
    const collection = CATEGORY_TO_COLLECTION[categoryId];
    if (!collection) return;

    try {
      const duplicatePromises = entryIds.map(entryId =>
        fetch(`/api/payload/${collection}/${entryId}`)
          .then(res => res.json())
          .then(original => {
            const copy = { ...original };
            delete copy.id;
            delete copy.createdAt;
            delete copy.updatedAt;
            if (copy.name) copy.name = `${copy.name} (Copy)`;
            if (copy.title) copy.title = `${copy.title} (Copy)`;
            
            return fetch(`/api/payload/${collection}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(copy),
            });
          })
          .catch(err => console.error(`Failed to duplicate ${entryId}:`, err))
      );

      await Promise.all(duplicatePromises);
      invalidateCategory(categoryId);
    } catch (error) {
      console.error("Failed to duplicate entries:", error);
      toast.error("Failed to duplicate some entries. Please try again.");
    }
  }, [projectId, invalidateCategory]);

  return {
    handleDelete,
    handleDuplicate,
    handleBulkDelete,
    handleBulkDuplicate,
  };
}

