// codexSidebar.store.ts
// Zustand store for CodexSidebar UI state (not server data)

import { create } from "zustand";
import { CodexCategory } from "@lib/content-editor/constants";
import type { ContextMenuState, EditEntryState } from "../types/codex.types";

type EntityTypeModalState =
  | { mode: "create" }
  | { mode: "edit"; typeId: string }
  | null;

type CustomEntityModalState =
  | { mode: "create"; typeId: string }
  | { mode: "edit"; typeId: string; entityId: string }
  | null;

type CodexSidebarState = {
  // UI state
  isCollapsed: boolean;
  searchQuery: string;
  expanded: Record<CodexCategory, boolean>;
  expandedEntityTypes: Record<string, boolean>;
  contextMenu: ContextMenuState;
  triggerNewEntry: string | null;
  editEntry: EditEntryState;
  entityTypeModal: EntityTypeModalState;
  customEntityModal: CustomEntityModalState;

  // Actions
  setCollapsed: (v: boolean) => void;
  setSearchQuery: (v: string) => void;
  toggleCategory: (categoryId: CodexCategory) => void;
  expandCategory: (categoryId: CodexCategory) => void;
  collapseCategory: (categoryId: CodexCategory) => void;
  toggleEntityType: (typeId: string) => void;
  openContextMenu: (state: Exclude<ContextMenuState, null>) => void;
  closeContextMenu: () => void;
  openNewEntry: (trigger: string) => void;
  clearNewEntryTrigger: () => void;
  openEditEntry: (categoryId: CodexCategory, entryId: string) => void;
  closeEditEntry: () => void;
  openCreateEntityType: () => void;
  openEditEntityType: (typeId: string) => void;
  closeEntityTypeModal: () => void;
  openCreateCustomEntity: (typeId: string) => void;
  openEditCustomEntity: (typeId: string, entityId: string) => void;
  closeCustomEntityModal: () => void;
};

export const useCodexSidebarStore = create<CodexSidebarState>((set) => ({
  // Initial state
  isCollapsed: false,
  searchQuery: "",
  expanded: {} as Record<CodexCategory, boolean>,
  expandedEntityTypes: {},
  contextMenu: null,
  triggerNewEntry: null,
  editEntry: null,
  entityTypeModal: null,
  customEntityModal: null,

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

  toggleEntityType: (typeId) =>
    set((s) => ({
      expandedEntityTypes: {
        ...s.expandedEntityTypes,
        [typeId]: !s.expandedEntityTypes[typeId],
      },
    })),

  openContextMenu: (state) => set({ contextMenu: state }),
  closeContextMenu: () => set({ contextMenu: null }),

  openNewEntry: (trigger) => set({ triggerNewEntry: trigger }),
  clearNewEntryTrigger: () => set({ triggerNewEntry: null }),

  openEditEntry: (categoryId, entryId) =>
    set({ editEntry: { categoryId, entryId } }),
  closeEditEntry: () => set({ editEntry: null }),

  openCreateEntityType: () => set({ entityTypeModal: { mode: "create" } }),
  openEditEntityType: (typeId) => set({ entityTypeModal: { mode: "edit", typeId } }),
  closeEntityTypeModal: () => set({ entityTypeModal: null }),

  openCreateCustomEntity: (typeId) =>
    set({ customEntityModal: { mode: "create", typeId } }),
  openEditCustomEntity: (typeId, entityId) =>
    set({ customEntityModal: { mode: "edit", typeId, entityId } }),
  closeCustomEntityModal: () => set({ customEntityModal: null }),
}));

