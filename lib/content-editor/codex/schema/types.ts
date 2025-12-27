// lib/content-editor/codex/schema/types.ts
// Canonical types for JSON Schema + exported custom entity type format

export type JsonSchema = Record<string, any>;
export type UiSchema = Record<string, any>;

export type ExportedEntityType = {
  format: "magicborn.codex.entityType";
  formatVersion: 1;
  name: string;
  slug: string;
  icon?: string;
  version: number;
  schema: JsonSchema;
  uiSchema?: UiSchema;
};


