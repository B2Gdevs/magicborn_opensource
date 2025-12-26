// entryModalRegistry.ts
// Registry for entry type modal configurations
// Each entry type registers its form component and data transformers

import type { ComponentType } from "react";
import { EntryType, CodexCategory } from "@/lib/content-editor/constants";
import {
  getCollectionForEntryType,
  getCategoryForEntryType,
} from "@/lib/content-editor/entry-config";

/**
 * Configuration for an entry type's modal form
 */
export interface EntryModalConfig<TFormData = unknown, TPayloadData = unknown> {
  /** Entry type identifier */
  entryType: EntryType;

  /** Display name for the modal title */
  displayName: string;

  /** The form component */
  FormComponent: ComponentType<EntryFormProps<TFormData>>;

  /** Optional footer component */
  FooterComponent?: ComponentType<EntryFooterProps>;

  /** Transform Payload data to form data (for editing) */
  payloadToForm: (payload: TPayloadData) => TFormData;

  /** Transform form data to Payload data (for saving) */
  formToPayload: (data: TFormData, projectId: string) => Record<string, unknown>;

  /** Default form values (for create mode) */
  defaultValues?: TFormData;
}

/**
 * Props passed to form components
 */
export interface EntryFormProps<TFormData = unknown> {
  initialValues?: TFormData;
  isEdit: boolean;
  onSubmit: (data: TFormData) => void;
  onCancel: () => void;
  saving: boolean;
  projectId: string;
  editEntryId?: number;
}

/**
 * Props passed to footer components
 */
export interface EntryFooterProps {
  isEdit: boolean;
  saving: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

// The registry maps EntryType to its configuration
const registry = new Map<EntryType, EntryModalConfig<any, any>>();

/**
 * Register a modal configuration for an entry type
 */
export function registerEntryModal<TFormData, TPayloadData>(
  config: EntryModalConfig<TFormData, TPayloadData>
): void {
  registry.set(config.entryType, config);
}

/**
 * Get the modal configuration for an entry type
 */
export function getEntryModalConfig(
  entryType: EntryType
): EntryModalConfig | undefined {
  return registry.get(entryType);
}

/**
 * Get all registered entry types
 */
export function getRegisteredEntryTypes(): EntryType[] {
  return Array.from(registry.keys());
}

/**
 * Check if an entry type is registered
 */
export function isEntryTypeRegistered(entryType: EntryType): boolean {
  return registry.has(entryType);
}

/**
 * Get collection and category for an entry type
 */
export function getEntryTypeMetadata(entryType: EntryType): {
  collection: string;
  category: CodexCategory;
} {
  return {
    collection: getCollectionForEntryType(entryType),
    category: getCategoryForEntryType(entryType),
  };
}

