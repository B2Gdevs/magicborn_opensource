// hooks/useCodexSelection.ts
// Selection logic for codex entries

import { useState, useEffect, useRef, useCallback } from "react";
import { CodexCategory } from "@lib/content-editor/constants";

export function useCodexSelection() {
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<{
    categoryId: CodexCategory;
    index: number;
  } | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  const handleEntryClick = useCallback((
    e: React.MouseEvent,
    categoryId: CodexCategory,
    entryId: string,
    index: number,
    getEntries: (categoryId: CodexCategory) => { id: string; name: string }[]
  ) => {
    // Don't interfere with context menu or action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    const isMetaKey = e.metaKey || e.ctrlKey;
    const isShiftKey = e.shiftKey;

    if (isMetaKey) {
      // Cmd/Ctrl + click: toggle selection
      setSelectedEntries(prev => {
        const next = new Set(prev);
        if (next.has(entryId)) {
          next.delete(entryId);
        } else {
          next.add(entryId);
        }
        return next;
      });
      setLastSelectedIndex({ categoryId, index });
    } else if (isShiftKey && lastSelectedIndex && lastSelectedIndex.categoryId === categoryId) {
      // Shift + click: range selection
      const entries = getEntries(categoryId);
      const start = Math.min(lastSelectedIndex.index, index);
      const end = Math.max(lastSelectedIndex.index, index);
      const rangeIds = entries.slice(start, end + 1).map(e => e.id);
      
      setSelectedEntries(prev => {
        const next = new Set(prev);
        rangeIds.forEach(id => next.add(id));
        return next;
      });
    } else {
      // Regular click: single selection
      setSelectedEntries(new Set([entryId]));
      setLastSelectedIndex({ categoryId, index });
    }
  }, [lastSelectedIndex]);

  const clearSelection = useCallback(() => {
    setSelectedEntries(new Set());
    setLastSelectedIndex(null);
  }, []);

  const selectAllInCategories = useCallback((
    expandedCategories: Set<CodexCategory>,
    getEntries: (categoryId: CodexCategory) => { id: string; name: string }[]
  ) => {
    const allEntryIds = new Set<string>();
    expandedCategories.forEach(categoryId => {
      getEntries(categoryId).forEach(entry => {
        allEntryIds.add(entry.id);
      });
    });
    setSelectedEntries(allEntryIds);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when sidebar is focused or when no input is focused
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }

      // Escape: clear selection
      if (e.key === 'Escape') {
        clearSelection();
        return;
      }

      // Delete/Backspace: handled by parent component
      // (We don't handle it here to avoid circular dependencies)
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEntries, clearSelection]);

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

