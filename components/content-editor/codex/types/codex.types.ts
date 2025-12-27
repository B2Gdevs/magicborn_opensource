// codex.types.ts
// Shared types for codex sidebar

import { CodexCategory } from "@lib/content-editor/constants";

export interface CodexEntry {
  id: string;
  name: string;
  parentId?: string | null; // For future nested Regions support
}

export type ContextMenuState =
  | null
  | {
      x: number;
      y: number;
      type: "category" | "entry";
      categoryId: CodexCategory;
      entry?: CodexEntry;
    }
  | {
      x: number;
      y: number;
      type: "sidebar";
    }
  | {
      x: number;
      y: number;
      type: "customType";
      typeId: string;
      typeName: string;
      typeDoc?: any;
    }
  | {
      x: number;
      y: number;
      type: "customEntry";
      typeId: string;
      entry: CodexEntry;
    };

export type EditEntryState = null | { categoryId: CodexCategory; entryId: string };

