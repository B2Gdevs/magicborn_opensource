// lib/content-editor/codex/api/schemaImportExport.ts
// Import/export helpers for custom entity types (JSON Schema standard)

import type { ExportedEntityType } from "../schema/types";

export function toExportFile(typeDoc: any): ExportedEntityType {
  return {
    format: "magicborn.codex.entityType",
    formatVersion: 1,
    name: typeDoc.name,
    slug: typeDoc.slug,
    icon: typeDoc.icon || undefined,
    version: typeof typeDoc.version === "number" ? typeDoc.version : 1,
    schema: typeDoc.schema,
    uiSchema: typeDoc.uiSchema || undefined,
  };
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}


