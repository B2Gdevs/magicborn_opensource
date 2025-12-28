// hooks/useCodexSelection.ts
// Selection logic for codex entries
// Uses composite keys: `${categoryId}:${entryId}` to avoid cross-category collisions

import { useState, useEffect, useRef, useCallback } from "react";
import { CodexCategory } from "@lib/content-editor/constants";

// Helper to create a composite selection key
export function makeSelectionKey(categoryId: CodexCategory | string, entryId: string): string {
  return `${categoryId}:${entryId}`;
}

// Helper to parse a composite selection key
export function parseSelectionKey(key: string): { categoryId: string; entryId: string } {
  const idx = key.indexOf(":");
  return { categoryId: key.slice(0, idx), entryId: key.slice(idx + 1) };
}

export function useCodexSelection() {
  // Selection keys are composite: `${categoryId}:${entryId}`
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<{
    categoryId: CodexCategory | string;
    index: number;
  } | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  const handleEntryClick = useCallback((
    e: React.MouseEvent,
    categoryId: CodexCategory | string,
    entryId: string,
    index: number,
    getEntries: (categoryId: CodexCategory | string) => { id: string; name: string }[]
  ) => {
    // Don't interfere with context menu or action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    const selectionKey = makeSelectionKey(categoryId, entryId);
    const isMetaKey = e.metaKey || e.ctrlKey;
    const isShiftKey = e.shiftKey;

    if (isMetaKey) {
      // Cmd/Ctrl + click: toggle selection
      setSelectedEntries(prev => {
        const next = new Set(prev);
        if (next.has(selectionKey)) {
          next.delete(selectionKey);
        } else {
          next.add(selectionKey);
        }
        return next;
      });
      setLastSelectedIndex({ categoryId, index });
    } else if (isShiftKey && lastSelectedIndex && lastSelectedIndex.categoryId === categoryId) {
      // Shift + click: range selection (only within same category)
      const entries = getEntries(categoryId);
      const start = Math.min(lastSelectedIndex.index, index);
      const end = Math.max(lastSelectedIndex.index, index);
      const rangeKeys = entries.slice(start, end + 1).map(e => makeSelectionKey(categoryId, e.id));
      
      setSelectedEntries(prev => {
        const next = new Set(prev);
        rangeKeys.forEach(key => next.add(key));
        return next;
      });
    } else {
      // Regular click: single selection
      setSelectedEntries(new Set([selectionKey]));
      setLastSelectedIndex({ categoryId, index });
    }
  }, [lastSelectedIndex]);

  const clearSelection = useCallback(() => {
    setSelectedEntries(new Set());
    setLastSelectedIndex(null);
  }, []);

  const selectAllInCategories = useCallback((
    expandedCategories: Set<CodexCategory | string>,
    getEntries: (categoryId: CodexCategory | string) => { id: string; name: string }[]
  ) => {
    const allKeys = new Set<string>();
    expandedCategories.forEach(categoryId => {
      getEntries(categoryId).forEach(entry => {
        allKeys.add(makeSelectionKey(categoryId, entry.id));
      });
    });
    setSelectedEntries(allKeys);
  }, []);

  // NOTE: Intentionally no keyboard shortcuts in Codex (per product decision).

  // Click outside to deselect
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        // Only deselect if clicking outside the sidebar
        // Don't deselect if clicking on modals or dropdowns
        const target = e.target as HTMLElement;
        if (!target.closest('[role="dialog"]') && !target.closest('.absolute')) {
          clearSelection();
        }
      }
    };

    if (selectedEntries.size > 0) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [selectedEntries, clearSelection]);

  return {
    selectedEntries,
    lastSelectedIndex,
    sidebarRef,
    handleEntryClick,
    clearSelection,
    selectAllInCategories,
    setSelectedEntries,
  };
}

