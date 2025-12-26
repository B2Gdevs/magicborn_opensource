// useCodexCommands.ts
// Command layer for codex actions - centralizes all CRUD operations and UI triggers

import { useCallback } from "react";
import { CodexCategory, CATEGORY_TO_ENTRY_TYPE } from "@lib/content-editor/constants";
import { useCodexSidebarStore } from "../store/codexSidebar.store";
import { useCodexActions } from "../../hooks/useCodexActions";
import type { CodexEntry } from "../types/codex.types";

interface UseCodexCommandsArgs {
  projectId: string;
  invalidateCategory: (categoryId: CodexCategory) => void;
  getEntries: (categoryId: CodexCategory) => CodexEntry[];
  clearSelection?: () => void;
}

/**
 * Centralized command API for codex operations
 * All actions and UI triggers go through this
 */
export function useCodexCommands({
  projectId,
  invalidateCategory,
  getEntries,
  clearSelection,
}: UseCodexCommandsArgs) {
  const {
    openEditEntry,
    openNewEntry,
    closeContextMenu,
    expandCategory,
  } = useCodexSidebarStore();

  const { handleDelete, handleDuplicate, handleBulkDelete, handleBulkDuplicate } =
    useCodexActions({
      projectId,
      invalidateCategory,
    });

  const newEntryForCategory = useCallback(
    (categoryId: CodexCategory) => {
      const entryType = CATEGORY_TO_ENTRY_TYPE[categoryId];
      openNewEntry(entryType || categoryId);
      closeContextMenu();
    },
    [openNewEntry, closeContextMenu]
  );

  const editEntry = useCallback(
    (categoryId: CodexCategory, entryId: string) => {
      openEditEntry(categoryId, entryId);
      closeContextMenu();
      clearSelection?.();
    },
    [openEditEntry, closeContextMenu, clearSelection]
  );

  const duplicateEntry = useCallback(
    (categoryId: CodexCategory, entryId: string) => {
      handleDuplicate(categoryId, entryId);
    },
    [handleDuplicate]
  );

  const deleteEntry = useCallback(
    (categoryId: CodexCategory, entryId: string) => {
      handleDelete(categoryId, entryId);
    },
    [handleDelete]
  );

  const deleteAllInCategory = useCallback(
    (categoryId: CodexCategory) => {
      const entries = getEntries(categoryId);
      const entryIds = entries.map((e) => e.id);
      if (entryIds.length > 0) {
        handleBulkDelete(categoryId, entryIds);
      }
      closeContextMenu();
    },
    [getEntries, handleBulkDelete, closeContextMenu]
  );

  const bulkDuplicate = useCallback(
    (entriesByCategory: Map<CodexCategory, string[]>) => {
      const duplicatePromises: Promise<void>[] = [];
      entriesByCategory.forEach((entryIds, categoryId) => {
        duplicatePromises.push(handleBulkDuplicate(categoryId, entryIds));
      });
      return Promise.all(duplicatePromises);
    },
    [handleBulkDuplicate]
  );

  const bulkDelete = useCallback(
    (entriesByCategory: Map<CodexCategory, string[]>) => {
      const deletePromises: Promise<void>[] = [];
      entriesByCategory.forEach((entryIds, categoryId) => {
        deletePromises.push(handleBulkDelete(categoryId, entryIds));
      });
      return Promise.all(deletePromises);
    },
    [handleBulkDelete]
  );

  return {
    newEntryForCategory,
    editEntry,
    duplicateEntry,
    deleteEntry,
    deleteAllInCategory,
    bulkDuplicate,
    bulkDelete,
  };
}

