// lib/roadmaps/codex-refactor-roadmap.ts
// Codex Sidebar Refactor Roadmap
// Following ChatGPT's refactor plan

import type { RoadmapData } from "./roadmap-types";

export const codexRefactorRoadmap: RoadmapData = {
  name: "Codex Refactor & Modernization",
  description: "Refactor CodexSidebar, integrate shadcn, implement undo/redo, and improve architecture",
  phases: [
    {
      title: "Phase 0: Payload Trash Everywhere",
      priority: "High Priority",
      sections: [
        {
          title: "Enable Soft Delete",
          goal: "Enable Payload trash (soft delete) for all codex collections",
          items: [
            { text: "Set trash: true for all codex collections in Payload configs", completed: true },
            { text: "Ensure codex listing APIs/queries exclude trashed docs by default", completed: true },
            { text: "Implement restore endpoint support (POST /api/payload/:collection/:id/restore)", completed: true },
          ],
        },
      ],
    },
    {
      title: "Phase 1: Codex API Adapter + Command Layer + Undo/Redo",
      priority: "High Priority",
      sections: [
        {
          title: "API Layer",
          goal: "Create pure API functions for Codex operations",
          items: [
            { text: "Create lib/content-editor/codex/api/codexApi.ts with trash, restore, create, update, bulk operations", completed: true },
            { text: "Ensure all API calls are pure (no UI, no toasts, no history)", completed: true },
          ],
        },
        {
          title: "History Store",
          goal: "Implement Zustand-based undo/redo history",
          items: [
            { text: "Create lib/content-editor/codex/store/codexHistory.store.ts with undoStack, redoStack", completed: true },
            { text: "Implement push, undo, redo, clear methods", completed: true },
            { text: "Add MAX_HISTORY_STACK_SIZE limit (50)", completed: true },
          ],
        },
        {
          title: "Command Layer",
          goal: "Refactor useCodexCommands to use codexApi, invalidate React Query, push history, show toasts",
          items: [
            { text: "Refactor useCodexCommands to use codexApi for all mutations", completed: true },
            { text: "Add history tracking (push operations to history store)", completed: true },
            { text: "Add Sonner toasts with Undo action for trash operations", completed: true },
            { text: "Implement undoLast and redoLast methods that execute operations", completed: true },
            { text: "Add undo/redo buttons to sidebar header", completed: true },
          ],
        },
      ],
    },
    {
      title: "Phase 2: Keyboard Shortcuts (Cancelled)",
      priority: "Cancelled",
      sections: [
        {
          title: "Keyboard Shortcuts",
          goal: "Cancelled - would interfere with main content area shortcuts",
          items: [
            { text: "Keyboard shortcuts removed from codex to avoid conflicts", completed: true },
          ],
        },
      ],
    },
    {
      title: "Phase 3: shadcn UI Primitives",
      priority: "High Priority",
      sections: [
        {
          title: "Install shadcn Components",
          goal: "Replace custom UI with shadcn components",
          items: [
            { text: "Install shadcn components: dialog, dropdown-menu, context-menu", completed: true },
            { text: "Create components/ui/AppDialog.tsx wrapper (if needed)", completed: false },
            { text: "Replace custom ContextMenu with shadcn equivalent", completed: true },
            { text: "Replace EntryActionsMenu with shadcn dropdown-menu", completed: true },
            { text: "Fix context menu positioning and visibility", completed: true },
          ],
        },
      ],
    },
    {
      title: "Phase 4: Replace NewEntryMenu with Registry-Driven Modal Host",
      priority: "Medium Priority",
      sections: [
        {
          title: "Modal Host System",
          goal: "Create registry-driven modal system to replace switch-based renderer",
          items: [
            { text: "Create components/content-editor/codex/EntryModalHost.tsx", completed: true },
            { text: "Create lib/content-editor/codex/modals/entryModalRegistry.ts", completed: true },
            { text: "Define EntryModalConfig contract for entity forms", completed: true },
            { text: "EntryModalHost reads triggers from Zustand, loads docs, renders one Dialog", completed: true },
            { text: "EntryModalHost calls commands for saving/deleting", completed: true },
            { text: "Register Character form with registry", completed: false },
            { text: "Register remaining forms (Creature, Rune, Region, Object, Spell, Effect, Story)", completed: false },
            { text: "Remove switch-based renderer from NewEntryMenu", completed: false },
          ],
        },
      ],
    },
    {
      title: "Phase 5: Form Refactor Template",
      priority: "Medium Priority",
      sections: [
        {
          title: "Shared Form Components",
          goal: "Create shared form components and patterns",
          items: [
            { text: "Create components/content-editor/forms/CodexFormShell.tsx", completed: false },
            { text: "Create lib/hooks/usePayloadMediaUrl.ts", completed: false },
            { text: "Create lib/hooks/useUploadBeforeSubmit.ts", completed: false },
            { text: "Refactor CharacterForm to use new pattern (schema, form hook, sections, form footer)", completed: false },
            { text: "Refactor EffectForm to use new pattern", completed: false },
            { text: "Remove document.querySelector('form') everywhere", completed: false },
            { text: "Forms do not fetch docs or call CRUD directly", completed: false },
          ],
        },
      ],
    },
    {
      title: "Phase 6: Command Palette (Optional)",
      priority: "Low Priority",
      sections: [
        {
          title: "Command Palette",
          goal: "Add command palette for quick actions",
          items: [
            { text: "Research command palette libraries (cmdk, etc.)", completed: false },
            { text: "Implement command palette UI", completed: false },
            { text: "Wire up codex commands to palette", completed: false },
            { text: "Add keyboard shortcut (Cmd/Ctrl+K)", completed: false },
          ],
        },
      ],
    },
    {
      title: "Styling & UI Consistency",
      priority: "High Priority",
      sections: [
        {
          title: "Background Consistency",
          goal: "Unify backgrounds across all components",
          items: [
            { text: "Fix Modal backgrounds (bg-void for container, bg-shadow for body)", completed: true },
            { text: "Fix RoadmapDialog backgrounds (remove transparency)", completed: false },
            { text: "Ensure all dialogs use bg-void for container, bg-shadow for body", completed: false },
            { text: "Unify ContentNavigation background with rest of app", completed: true },
            { text: "Review and fix all form modal backgrounds", completed: false },
          ],
        },
        {
          title: "Theme System",
          goal: "Create centralized theme system",
          items: [
            { text: "Define theme structure in siteConfig global", completed: false },
            { text: "Create useTheme() hook", completed: false },
            { text: "Add theme override fields to Projects collection", completed: false },
            { text: "Apply theme in all components", completed: false },
          ],
        },
      ],
    },
  ],
};

