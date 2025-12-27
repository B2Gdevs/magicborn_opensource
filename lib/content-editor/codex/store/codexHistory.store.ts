// codexHistory.store.ts
// Zustand store for undo/redo history of codex operations
// This store is intentionally generic so it can handle:
// - entry trash/restore
// - entity type create/update/import/trash
// - custom entity create/update/trash

import { create } from "zustand";

export type CodexHistoryOp = {
  /**
   * Short label shown in UI / logs ("Trash Character", "Update Entity Type", etc.)
   */
  label: string;
  /**
   * Undo the operation (should be idempotent when possible)
   */
  undo: () => Promise<void>;
  /**
   * Redo the operation (should be idempotent when possible)
   */
  redo: () => Promise<void>;
  /**
   * Optional metadata for debugging / future UI
   */
  meta?: Record<string, unknown>;
};

const MAX_HISTORY = 50;

interface CodexHistoryState {
  undoStack: CodexHistoryOp[];
  redoStack: CodexHistoryOp[];

  push: (op: CodexHistoryOp) => void;
  undo: () => CodexHistoryOp | null;
  redo: () => CodexHistoryOp | null;
  clear: () => void;
}

export const useCodexHistoryStore = create<CodexHistoryState>((set, get) => ({
  undoStack: [],
  redoStack: [],

  push: (op) => {
    set((state) => {
      const newUndoStack = [...state.undoStack, op].slice(-MAX_HISTORY);
      return {
        undoStack: newUndoStack,
        redoStack: [], // Clear redo stack when new operation is pushed
      };
    });
  },

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return null;

    const op = state.undoStack[state.undoStack.length - 1];
    const newUndoStack = state.undoStack.slice(0, -1);

    // Push the ORIGINAL operation to redo stack (not inverse)
    // This way redo can re-execute the same operation.
    set({
      undoStack: newUndoStack,
      redoStack: [...state.redoStack, op].slice(-MAX_HISTORY),
    });

    return op;
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return null;

    const op = state.redoStack[state.redoStack.length - 1];
    const newRedoStack = state.redoStack.slice(0, -1);

    // Push the operation back to undo stack (so we can undo the redo)
    set({
      undoStack: [...state.undoStack, op].slice(-MAX_HISTORY),
      redoStack: newRedoStack,
    });

    return op;
  },

  clear: () => {
    set({
      undoStack: [],
      redoStack: [],
    });
  },
}));

