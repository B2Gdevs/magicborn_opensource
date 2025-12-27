// lib/content-editor/codex/api/entityTypeApi.ts
// API helpers for custom entity types and custom entities
// (pure fetch wrappers, no UI)

import { restoreEntry, trashEntry, createEntry, updateEntry, getEntry } from "./codexApi";

export type EntityTypeDoc = {
  id: string | number;
  name: string;
  slug: string;
  icon?: string;
  schema: Record<string, any>;
  uiSchema?: Record<string, any>;
  version?: number;
  project: string | number | { id: string | number };
  _status?: string;
};

export type CodexEntityDoc = {
  id: string | number;
  name: string;
  slug: string;
  type: string | number | { id: string | number };
  project: string | number | { id: string | number };
  data: Record<string, any>;
  tags?: Array<{ tag: string }>;
  _status?: string;
};

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function listEntityTypes(projectId: string): Promise<EntityTypeDoc[]> {
  const data = await fetchJson(
    `/api/payload/codex-entity-types?where[project][equals]=${projectId}&sort=name`
  );
  return (data?.docs ?? []) as EntityTypeDoc[];
}

export async function getEntityType(typeId: string): Promise<EntityTypeDoc> {
  // Use draft=true to support drafts-enabled collections (avoids NotFound when only draft exists)
  return (await fetchJson(`/api/payload/codex-entity-types/${typeId}?draft=true`)) as EntityTypeDoc;
}

export async function createEntityType(data: Record<string, unknown>) {
  return createEntry({ collection: "codex-entity-types", data });
}

export async function updateEntityType(typeId: string, data: Record<string, unknown>) {
  return updateEntry({ collection: "codex-entity-types", id: typeId, data });
}

export async function trashEntityType(typeId: string) {
  return trashEntry({ collection: "codex-entity-types", id: typeId });
}

export async function restoreEntityType(typeId: string) {
  return restoreEntry({ collection: "codex-entity-types", id: typeId });
}

export async function listEntitiesByType(projectId: string, typeId: string): Promise<CodexEntityDoc[]> {
  const data = await fetchJson(
    `/api/payload/codex-entities?where[project][equals]=${projectId}&where[type][equals]=${typeId}&sort=name`
  );
  return (data?.docs ?? []) as CodexEntityDoc[];
}

export async function getCustomEntity(entityId: string): Promise<CodexEntityDoc> {
  return (await fetchJson(`/api/payload/codex-entities/${entityId}?draft=true`)) as CodexEntityDoc;
}

export async function createCustomEntity(data: Record<string, unknown>) {
  return createEntry({ collection: "codex-entities", data });
}

export async function updateCustomEntity(entityId: string, data: Record<string, unknown>) {
  return updateEntry({ collection: "codex-entities", id: entityId, data });
}

export async function trashCustomEntity(entityId: string) {
  return trashEntry({ collection: "codex-entities", id: entityId });
}

export async function restoreCustomEntity(entityId: string) {
  return restoreEntry({ collection: "codex-entities", id: entityId });
}


