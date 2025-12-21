// lib/content-editor/types.ts
// Type definitions for Content Editor

export enum ContentEditorTab {
  Plan = "plan",
  // Future: Write = "write", Chat = "chat", Review = "review"
}

export enum ContentEditorView {
  Grid = "grid",
  // Future: Matrix = "matrix", Outline = "outline"
}

export enum SaveStatus {
  Saved = "saved",
  Saving = "saving",
  Unsaved = "unsaved",
  Error = "error",
}

