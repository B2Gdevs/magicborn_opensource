// codexApi.ts
// Pure API functions for codex operations (NO UI, NO TOASTS)
// All functions throw errors on non-OK responses

import { CodexCategory, CATEGORY_TO_COLLECTION } from "@lib/content-editor/constants";

export interface TrashEntryParams {
  collection: string;
  id: string;
}

export interface RestoreEntryParams {
  collection: string;
  id: string;
}

export interface CreateEntryParams {
  collection: string;
  data: Record<string, unknown>;
}

export interface UpdateEntryParams {
  collection: string;
  id: string;
  data: Record<string, unknown>;
}

export interface BulkTrashParams {
  collection: string;
  ids: string[];
}

export interface BulkRestoreParams {
  collection: string;
  ids: string[];
}

/**
 * Trash (soft delete) a single entry
 */
export async function trashEntry({ collection, id }: TrashEntryParams): Promise<void> {
  const response = await fetch(`/api/payload/${collection}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to trash entry" }));
    throw new Error(error.error || `Failed to trash ${collection} entry`);
  }
}

/**
 * Restore a trashed entry
 */
export async function restoreEntry({ collection, id }: RestoreEntryParams): Promise<unknown> {
  const response = await fetch(`/api/payload/${collection}/${id}/restore`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to restore entry" }));
    throw new Error(error.error || `Failed to restore ${collection} entry`);
  }

  // Handle empty response
  const text = await response.text();
  if (!text) {
    return { success: true };
  }

  try {
    return JSON.parse(text);
  } catch {
    return { success: true };
  }
}

/**
 * Create a new entry
 */
export async function createEntry({ collection, data }: CreateEntryParams): Promise<unknown> {
  const response = await fetch(`/api/payload/${collection}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to create entry" }));
    throw new Error(error.error || `Failed to create ${collection} entry`);
  }

  return response.json();
}

/**
 * Update an existing entry
 */
export async function updateEntry({ collection, id, data }: UpdateEntryParams): Promise<unknown> {
  const response = await fetch(`/api/payload/${collection}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to update entry" }));
    throw new Error(error.error || `Failed to update ${collection} entry`);
  }

  return response.json();
}

/**
 * Get a single entry by ID
 */
export async function getEntry(collection: string, id: string): Promise<unknown> {
  const response = await fetch(`/api/payload/${collection}/${id}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to fetch entry" }));
    throw new Error(error.error || `Failed to fetch ${collection} entry`);
  }

  return response.json();
}

/**
 * Trash multiple entries
 */
export async function bulkTrash({ collection, ids }: BulkTrashParams): Promise<void> {
  const promises = ids.map((id) => trashEntry({ collection, id }));
  await Promise.all(promises);
}

/**
 * Restore multiple entries
 */
export async function bulkRestore({ collection, ids }: BulkRestoreParams): Promise<unknown[]> {
  const promises = ids.map((id) => restoreEntry({ collection, id }));
  return Promise.all(promises);
}

/**
 * Get collection name from category
 */
export function getCollectionFromCategory(categoryId: CodexCategory): string {
  return CATEGORY_TO_COLLECTION[categoryId];
}

