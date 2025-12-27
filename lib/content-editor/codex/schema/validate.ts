// lib/content-editor/codex/schema/validate.ts
// Minimal validation for imported/exported entity type files

import type { ExportedEntityType } from "./types";

export function assertValidEntityTypeExport(input: any): asserts input is ExportedEntityType {
  if (!input || typeof input !== "object") throw new Error("Invalid file");
  if (input.format !== "magicborn.codex.entityType") throw new Error("Unsupported format");
  if (input.formatVersion !== 1) throw new Error("Unsupported format version");
  if (!input.name || typeof input.name !== "string") throw new Error("Missing name");
  if (!input.slug || typeof input.slug !== "string") throw new Error("Missing slug");
  if (typeof input.version !== "number") throw new Error("Missing version");
  if (!input.schema || typeof input.schema !== "object") throw new Error("Missing schema");
  if (input.uiSchema && typeof input.uiSchema !== "object") throw new Error("Invalid uiSchema");
}


