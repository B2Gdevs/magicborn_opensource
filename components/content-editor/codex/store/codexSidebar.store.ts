// codexSidebar.store.ts
// Zustand store for CodexSidebar UI state (not server data)

import { create } from "zustand";
import { CodexCategory } from "@lib/content-editor/constants";
import type { ContextMenuState, EditEntryState } from "../types/codex.types";

type CodexSidebarState = {
  // UI state
  isCollapsed: boolean;
  searchQuery: string;
  expanded: Record<CodexCategory, boolean>;
  contextMenu: ContextMenuState;
  triggerNewEntry: string | null;
  editEntry: EditEntryState;

  // Actions
  setCollapsed: (v: boolean) => void;
  setSearchQuery: (v: string) => void;
  toggleCategory: (categoryId: CodexCategory) => void;
  expandCategory: (categoryId: CodexCategory) => void;
  collapseCategory: (categoryId: CodexCategory) => void;
  openContextMenu: (state: Exclude<ContextMenuState, null>) => void;
  closeContextMenu: () => void;
  openNewEntry: (trigger: string) => void;
  clearNewEntryTrigger: () => void;
  openEditEntry: (categoryId: CodexCategory, entryId: string) => void;
  closeEditEntry: () => void;
};

export const useCodexSidebarStore = create<CodexSidebarState>((set) => ({
  // Initial state
  isCollapsed: false,
  searchQuery: "",
  expanded: {} as Record<CodexCategory, boolean>,
  contextMenu: null,
  triggerNewEntry: null,
  editEntry: null,

  // Actions
  setCollapsed: (v) => set({ isCollapsed: v }),
  setSearchQuery: (v) => set({ searchQuery: v }),

  toggleCategory: (categoryId) =>
    set((s) => ({
      expanded: { ...s.expanded, [categoryId]: !s.expanded[categoryId] },
    })),

  expandCategory: (categoryId) =>
    set((s) => ({
      expanded: { ...s.expanded, [categoryId]: true },
    })),

  collapseCategory: (categoryId) =>
    set((s) => ({
      expanded: { ...s.expanded, [categoryId]: false },
    })),

  openContextMenu: (state) => set({ contextMenu: state }),
  closeContextMenu: () => set({ contextMenu: null }),

  openNewEntry: (trigger) => set({ triggerNewEntry: trigger }),
  clearNewEntryTrigger: () => set({ triggerNewEntry: null }),

  openEditEntry: (categoryId, entryId) =>
    set({ editEntry: { categoryId, entryId } }),
  closeEditEntry: () => set({ editEntry: null }),
}));

