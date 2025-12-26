// useCodexCommands.ts
// Command layer for codex operations
// Handles: API calls, history tracking, toast notifications, query invalidation

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CodexCategory, CATEGORY_TO_ENTRY_TYPE } from "@lib/content-editor/constants";
import { toast } from "@/lib/hooks/useToast";
import { useCodexSidebarStore } from "@/components/content-editor/codex/store/codexSidebar.store";
import { useCodexHistoryStore } from "@lib/content-editor/codex/store/codexHistory.store";
import {
  trashEntry,
  restoreEntry,
  createEntry,
  updateEntry,
  getEntry,
  bulkTrash,
  bulkRestore,
  getCollectionFromCategory,
} from "../api/codexApi";
import type { CodexEntry } from "../types/codex.types";

interface UseCodexCommandsArgs {
  projectId: string;
  invalidateCategory: (categoryId: CodexCategory) => void;
  getEntries: (categoryId: CodexCategory) => CodexEntry[];
  clearSelection?: () => void;
}

/**
 * Centralized command API for codex operations
 * All mutations go through this layer
 */
export function useCodexCommands({
  projectId,
  invalidateCategory,
  getEntries,
  clearSelection,
}: UseCodexCommandsArgs) {
  const queryClient = useQueryClient();
  const {
    openEditEntry,
    openNewEntry,
    closeContextMenu,
    expandCategory,
  } = useCodexSidebarStore();
  const { push: pushHistory, undo: popUndo, redo: popRedo } = useCodexHistoryStore();

  // Helper to invalidate and refresh
  const invalidateAndRefresh = useCallback(
    (categoryId: CodexCategory) => {
      invalidateCategory(categoryId);
      queryClient.invalidateQueries({
        queryKey: ["codexEntries", categoryId, projectId],
      });
    },
    [invalidateCategory, queryClient, projectId]
  );

  /**
   * Trash a single entry with undo toast
   */
  const trashOne = useCallback(
    async (categoryId: CodexCategory, entryId: string, name?: string) => {
      try {
        const collection = getCollectionFromCategory(categoryId);
        await trashEntry({ collection, id: entryId });

        // Push to history
        pushHistory({
          type: "trash",
          collection,
          categoryId,
          entryIds: [entryId],
          names: name ? [name] : undefined,
        });

        // Invalidate queries
        invalidateAndRefresh(categoryId);

        // Show toast with undo action
        const displayName = name || "entry";
        toast.success(`Deleted ${displayName}`, {
          action: {
            label: "Undo",
            onClick: async () => {
              try {
                await restoreEntry({ collection, id: entryId });
                pushHistory({
                  type: "restore",
                  collection,
                  categoryId,
                  entryIds: [entryId],
                  names: name ? [name] : undefined,
                });
                invalidateAndRefresh(categoryId);
                toast.success(`Restored ${displayName}`);
              } catch (error) {
                toast.error("Failed to restore entry");
              }
            },
          },
        });
      } catch (error) {
        toast.error("Failed to delete entry");
        throw error;
      }
    },
    [pushHistory, invalidateAndRefresh]
  );

  /**
   * Restore a single entry
   */
  const restoreOne = useCallback(
    async (categoryId: CodexCategory, entryId: string, name?: string) => {
      try {
        const collection = getCollectionFromCategory(categoryId);
        await restoreEntry({ collection, id: entryId });

        pushHistory({
          type: "restore",
          collection,
          categoryId,
          entryIds: [entryId],
          names: name ? [name] : undefined,
        });

        invalidateAndRefresh(categoryId);
        toast.success(`Restored ${name || "entry"}`);
      } catch (error) {
        toast.error("Failed to restore entry");
        throw error;
      }
    },
    [pushHistory, invalidateAndRefresh]
  );

  /**
   * Trash multiple entries with undo toast
   */
  const trashMany = useCallback(
    async (
      categoryId: CodexCategory,
      entryIds: string[],
      names?: string[]
    ) => {
      try {
        const collection = getCollectionFromCategory(categoryId);
        await bulkTrash({ collection, ids: entryIds });

        pushHistory({
          type: "trash",
          collection,
          categoryId,
          entryIds,
          names,
        });

        invalidateAndRefresh(categoryId);
        clearSelection?.();

        const count = entryIds.length;
        toast.success(`Deleted ${count} ${count === 1 ? "item" : "items"}`, {
          action: {
            label: "Undo",
            onClick: async () => {
              try {
                await bulkRestore({ collection, ids: entryIds });
                pushHistory({
                  type: "restore",
                  collection,
                  categoryId,
                  entryIds,
                  names,
                });
                invalidateAndRefresh(categoryId);
                toast.success(`Restored ${count} ${count === 1 ? "item" : "items"}`);
              } catch (error) {
                toast.error("Failed to restore entries");
              }
            },
          },
        });
      } catch (error) {
        toast.error("Failed to delete entries");
        throw error;
      }
    },
    [pushHistory, invalidateAndRefresh, clearSelection]
  );

  /**
   * Duplicate a single entry
   */
  const duplicateOne = useCallback(
    async (categoryId: CodexCategory, entryId: string) => {
      try {
        const collection = getCollectionFromCategory(categoryId);
        const original = (await getEntry(collection, entryId)) as any;

        // Remove id and create new entry
        const { id, ...data } = original;
        const duplicated = await createEntry({
          collection,
          data: {
            ...data,
            project: parseInt(projectId, 10),
          },
        });

        invalidateAndRefresh(categoryId);
        toast.success("Entry duplicated");
        return duplicated;
      } catch (error) {
        toast.error("Failed to duplicate entry");
        throw error;
      }
    },
    [projectId, invalidateAndRefresh]
  );

  /**
   * Bulk duplicate entries
   */
  const bulkDuplicate = useCallback(
    async (entriesByCategory: Map<CodexCategory, string[]>) => {
      try {
        const promises: Promise<unknown>[] = [];
        entriesByCategory.forEach((entryIds, categoryId) => {
          entryIds.forEach((entryId) => {
            promises.push(duplicateOne(categoryId, entryId));
          });
        });

        await Promise.all(promises);
        clearSelection?.();

        const totalCount = Array.from(entriesByCategory.values()).reduce(
          (sum, ids) => sum + ids.length,
          0
        );
        toast.success(
          `Duplicated ${totalCount} ${totalCount === 1 ? "entry" : "entries"}`
        );
      } catch (error) {
        toast.error("Failed to duplicate some entries");
        throw error;
      }
    },
    [duplicateOne, clearSelection]
  );

  /**
   * Bulk delete (trash) entries across categories
   */
  const bulkDelete = useCallback(
    async (entriesByCategory: Map<CodexCategory, string[]>) => {
      try {
        const allEntryIds: string[] = [];
        const allNames: string[] = [];
        const promises: Promise<void>[] = [];

        entriesByCategory.forEach((entryIds, categoryId) => {
          const collection = getCollectionFromCategory(categoryId);
          const entries = getEntries(categoryId);
          const names = entries
            .filter((e) => entryIds.includes(e.id))
            .map((e) => e.name);

          allEntryIds.push(...entryIds);
          allNames.push(...names);
          promises.push(bulkTrash({ collection, ids: entryIds }));
        });

        await Promise.all(promises);

        // Push history for first category (we track all IDs together)
        const firstCategory = entriesByCategory.keys().next().value;
        if (firstCategory) {
          pushHistory({
            type: "trash",
            collection: getCollectionFromCategory(firstCategory),
            categoryId: firstCategory,
            entryIds: allEntryIds,
            names: allNames.length > 0 ? allNames : undefined,
          });
        }

        // Invalidate all affected categories
        entriesByCategory.forEach((_, categoryId) => {
          invalidateAndRefresh(categoryId);
        });

        clearSelection?.();

        const totalCount = allEntryIds.length;
        toast.success(
          `Deleted ${totalCount} ${totalCount === 1 ? "entry" : "entries"}`,
          {
            action: {
              label: "Undo",
              onClick: async () => {
                try {
                  // Restore all entries
                  const restorePromises: Promise<unknown>[] = [];
                  entriesByCategory.forEach((entryIds, categoryId) => {
                    const collection = getCollectionFromCategory(categoryId);
                    entryIds.forEach((entryId) => {
                      restorePromises.push(restoreEntry({ collection, id: entryId }));
                    });
                  });

                  await Promise.all(restorePromises);

                  if (firstCategory) {
                    pushHistory({
                      type: "restore",
                      collection: getCollectionFromCategory(firstCategory),
                      categoryId: firstCategory,
                      entryIds: allEntryIds,
                      names: allNames.length > 0 ? allNames : undefined,
                    });
                  }

                  entriesByCategory.forEach((_, categoryId) => {
                    invalidateAndRefresh(categoryId);
                  });

                  toast.success(
                    `Restored ${totalCount} ${totalCount === 1 ? "entry" : "entries"}`
                  );
                } catch (error) {
                  toast.error("Failed to restore entries");
                }
              },
            },
          }
        );
      } catch (error) {
        toast.error("Failed to delete entries");
        throw error;
      }
    },
    [getEntries, pushHistory, invalidateAndRefresh, clearSelection]
  );

  // UI trigger commands
  const newEntryForCategory = useCallback(
    (categoryId: CodexCategory) => {
      const entryType = CATEGORY_TO_ENTRY_TYPE[categoryId];
      openNewEntry(entryType || categoryId);
      closeContextMenu();
    },
    [openNewEntry, closeContextMenu]
  );

  const editEntryCommand = useCallback(
    (categoryId: CodexCategory, entryId: string) => {
      openEditEntry(categoryId, entryId);
      closeContextMenu();
      clearSelection?.();
    },
    [openEditEntry, closeContextMenu, clearSelection]
  );

  const deleteAllInCategory = useCallback(
    (categoryId: CodexCategory) => {
      const entries = getEntries(categoryId);
      const entryIds = entries.map((e) => e.id);
      const names = entries.map((e) => e.name);
      if (entryIds.length > 0) {
        trashMany(categoryId, entryIds, names);
      }
      closeContextMenu();
    },
    [getEntries, trashMany, closeContextMenu]
  );

  return {
    // CRUD operations
    trashOne,
    restoreOne,
    trashMany,
    duplicateOne,
    bulkDuplicate,
    bulkDelete,
    createEntry: async (categoryId: CodexCategory, data: Record<string, unknown>) => {
      const collection = getCollectionFromCategory(categoryId);
      const result = await createEntry({ collection, data });
      invalidateAndRefresh(categoryId);
      return result;
    },
    updateEntry: async (
      categoryId: CodexCategory,
      entryId: string,
      data: Record<string, unknown>
    ) => {
      const collection = getCollectionFromCategory(categoryId);
      const result = await updateEntry({ collection, id: entryId, data });
      invalidateAndRefresh(categoryId);
      return result;
    },
    getEntry: async (categoryId: CodexCategory, entryId: string) => {
      const collection = getCollectionFromCategory(categoryId);
      return getEntry(collection, entryId);
    },
    // UI triggers
    newEntryForCategory,
    editEntry: editEntryCommand,
    deleteAllInCategory,
    // Undo/Redo
    undoLast: async () => {
      const op = popUndo();
      if (!op) {
        toast.info("Nothing to undo");
        return;
      }

      try {
        if (op.type === "trash") {
          // Undo trash = restore
          await Promise.all(
            op.entryIds.map((id) => restoreEntry({ collection: op.collection, id }))
          );
          toast.success(
            `Restored ${op.entryIds.length} ${op.entryIds.length === 1 ? "entry" : "entries"}`
          );
        } else if (op.type === "restore") {
          // Undo restore = trash
          await Promise.all(
            op.entryIds.map((id) => trashEntry({ collection: op.collection, id }))
          );
          toast.success(
            `Trashed ${op.entryIds.length} ${op.entryIds.length === 1 ? "entry" : "entries"}`
          );
        }
        invalidateAndRefresh(op.categoryId);
      } catch (error) {
        toast.error("Failed to undo operation");
        // Re-push to undo stack to allow retry
        pushHistory(op);
      }
    },
    redoLast: async () => {
      const op = popRedo();
      if (!op) {
        toast.info("Nothing to redo");
        return;
      }

      try {
        if (op.type === "trash") {
          // Redo trash = trash again
          await Promise.all(
            op.entryIds.map((id) => trashEntry({ collection: op.collection, id }))
          );
          toast.success(
            `Trashed ${op.entryIds.length} ${op.entryIds.length === 1 ? "entry" : "entries"}`
          );
        } else if (op.type === "restore") {
          // Redo restore = restore again
          await Promise.all(
            op.entryIds.map((id) => restoreEntry({ collection: op.collection, id }))
          );
          toast.success(
            `Restored ${op.entryIds.length} ${op.entryIds.length === 1 ? "entry" : "entries"}`
          );
        }
        invalidateAndRefresh(op.categoryId);
      } catch (error) {
        toast.error("Failed to redo operation");
      }
    },
  };
}

