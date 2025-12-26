// codexHistory.store.ts
// Zustand store for undo/redo history of codex operations

import { create } from "zustand";
import { CodexCategory } from "@lib/content-editor/constants";

export type CodexOp =
  | {
      type: "trash";
      collection: string;
      categoryId: CodexCategory;
      entryIds: string[];
      names?: string[];
    }
  | {
      type: "restore";
      collection: string;
      categoryId: CodexCategory;
      entryIds: string[];
      names?: string[];
    };

const MAX_HISTORY = 50;

interface CodexHistoryState {
  undoStack: CodexOp[];
  redoStack: CodexOp[];

  push: (op: CodexOp) => void;
  undo: () => CodexOp | null;
  redo: () => CodexOp | null;
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
    // This way redo can re-execute the same operation
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

