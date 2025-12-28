// SchemaEntityForm.tsx
// Generic schema-driven entity form using RJSF + Tailwind templates/widgets.
// Always injects Basic Info fields (name, description, imageMediaId) even if absent in uploaded schema.
// Ignores uiSchema from imported entity types.

"use client";

import { useCallback, useMemo, useState } from "react";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import type { IChangeEvent } from "@rjsf/core";
import type { UiSchema } from "@rjsf/utils";
import { templates, widgets } from "./rjsf-templates";
import { User, Layers } from "lucide-react";

export interface SchemaEntityFormData {
  name: string;
  description: string;
  imageMediaId?: number;
  data: Record<string, any>;
}

type AnySchema = Record<string, any>;

const BASIC_INFO_SCHEMA: AnySchema = {
  type: "object",
  title: "Basic Information",
  properties: {
    name: { type: "string", title: "Name", minLength: 1 },
    description: { type: "string", title: "Description" },
    imageMediaId: { type: "number", title: "Image" },
  },
  required: ["name"],
};

const BASIC_INFO_UISCHEMA: UiSchema = {
  "ui:options": { columns: 2 },
  name: {
    "ui:classNames": "md:col-span-1",
    "ui:placeholder": "Enter a name…",
  },
  imageMediaId: {
    "ui:classNames": "md:col-span-1",
    "ui:widget": "media",
    "ui:options": { size: "full", mediaType: "image", label: "Image" },
  },
  description: {
    "ui:classNames": "md:col-span-2",
    "ui:widget": "textarea",
    "ui:options": { rows: 5 },
    "ui:placeholder": "Describe this entity…",
  },
  "ui:order": ["name", "imageMediaId", "description", "*"],
};

function normalizeRootObjectSchema(schema: AnySchema | null | undefined): AnySchema {
  if (!schema || typeof schema !== "object") return { type: "object", properties: {} };
  const type = schema.type ?? "object";
  if (type !== "object") return { type: "object", properties: {} };
  return { ...schema, type: "object", properties: { ...(schema.properties ?? {}) } };
}

function mergeRequired(existing: any, toAdd: string[]) {
  const req = new Set<string>(Array.isArray(existing) ? existing : []);
  for (const r of toAdd) req.add(r);
  return Array.from(req);
}

/**
 * Ensures final schema shape:
 * {
 *   name, description, imageMediaId,
 *   data: { ...customProps }
 * }
 *
 * If uploaded schema has root properties, we move them under data.
 * If uploaded schema already has properties.data as object, we respect it.
 */
function buildMergedSchema(rawSchema: AnySchema | null | undefined): AnySchema {
  const root = normalizeRootObjectSchema(rawSchema);
  const rootProps = root.properties ?? {};

  const hasDataObject =
    rootProps.data &&
    typeof rootProps.data === "object" &&
    (rootProps.data.type === "object" || rootProps.data.properties);

  let dataSchema: AnySchema;

  if (hasDataObject) {
    dataSchema = {
      ...rootProps.data,
      type: "object",
      title: rootProps.data.title ?? "Custom Fields",
      properties: { ...(rootProps.data.properties ?? {}) },
      required: Array.isArray(rootProps.data.required) ? rootProps.data.required : [],
    };
  } else {
    const { name, description, id, imageMediaId, data, ...rest } = rootProps;
    dataSchema = {
      type: "object",
      title: "Custom Fields",
      properties: { ...rest },
      required: Array.isArray(root.required)
        ? root.required.filter((r: string) => !["name", "description", "id", "imageMediaId", "data"].includes(r))
        : [],
    };
  }

  const merged: AnySchema = {
    $schema: root.$schema,
    $id: root.$id,
    title: root.title,
    description: root.description,
    type: "object",
    properties: {
      ...BASIC_INFO_SCHEMA.properties,
      data: dataSchema,
    },
    required: mergeRequired(root.required, ["name"]),
  };

  return merged;
}

function buildDefaultUiSchema(mergedSchema: AnySchema, typeName?: string): UiSchema {
  const hasCustom =
    mergedSchema?.properties?.data?.properties &&
    Object.keys(mergedSchema.properties.data.properties).length > 0;

  const ui: UiSchema = {
    "ui:options": { columns: 2 },
    ...BASIC_INFO_UISCHEMA,
    data: {
      "ui:options": { columns: 1 },
      ...(hasCustom ? { "ui:title": `${typeName ?? "Custom"} Fields` } : {}),
    },
    "ui:order": ["name", "imageMediaId", "description", "data", "*"],
  };

  return ui;
}

export function SchemaEntityForm({
  schema,
  initialData,
  typeName,
  saving,
  onSubmit,
  onCancel,
  isEdit = false,
  entityId,
  formId = "schema-entity-form",
  hideFooter = false,
  projectId,
}: {
  schema: AnySchema | null | undefined;
  uiSchema?: any; // intentionally unused
  initialData?: {
    name?: string;
    description?: string;
    imageMediaId?: number;
    data?: Record<string, any>;
  };
  typeName?: string;
  saving: boolean;
  onSubmit: (data: SchemaEntityFormData) => void | Promise<void>;
  onCancel?: () => void;
  projectId: string; // REQUIRED
  isEdit?: boolean;
  entityId?: string | number;
  formId?: string;
  hideFooter?: boolean;
}) {
  const mergedSchema = useMemo(() => buildMergedSchema(schema), [schema]);
  const enforcedUiSchema = useMemo(() => buildDefaultUiSchema(mergedSchema, typeName), [mergedSchema, typeName]);

  const [formData, setFormData] = useState<any>({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    imageMediaId: initialData?.imageMediaId,
    data: initialData?.data ?? {},
  });

  const [rjsfErrors, setRjsfErrors] = useState<any[]>([]);

  const handleChange = useCallback((e: IChangeEvent) => {
    setFormData(e.formData ?? {});
  }, []);

  const handleSubmit = useCallback(() => {
    const payload: SchemaEntityFormData = {
      name: String(formData?.name ?? ""),
      description: String(formData?.description ?? ""),
      imageMediaId: typeof formData?.imageMediaId === "number" ? formData.imageMediaId : undefined,
      data: (formData?.data ?? {}) as Record<string, any>,
    };
    onSubmit(payload);
  }, [formData, onSubmit]);

  const hasCustomFields =
    mergedSchema?.properties?.data?.properties &&
    Object.keys(mergedSchema.properties.data.properties).length > 0;

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault();
        if (!saving) handleSubmit();
      }}
      className="space-y-6"
    >
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-ember-glow" />
          <h2 className="text-lg font-bold text-text-primary">Basic Information</h2>
        </div>
      </section>

      <Form
        validator={validator as any}
        schema={mergedSchema}
        uiSchema={enforcedUiSchema}
        formData={formData}
        disabled={saving}
        onChange={handleChange}
        onError={(errors) => setRjsfErrors(errors)}
        templates={templates}
        widgets={widgets}
        formContext={{
          projectId, // <-- THIS is what your MediaWidget will read
          entityId,
          typeName,
          isEdit,
        }}
      >
        <></>
      </Form>

      {hasCustomFields && (
        <div className="flex items-center gap-2 pt-2">
          <Layers className="w-5 h-5 text-ember-glow" />
          <h2 className="text-lg font-bold text-text-primary">{typeName ?? "Custom"} Fields</h2>
        </div>
      )}

      {!hideFooter && (
        <div className="flex justify-end gap-2 pt-4 border-t border-border/30">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="px-4 py-2 border border-border rounded-lg bg-deep/40 text-text-primary hover:bg-deep/60 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-ember/90 border border-ember/50 text-void rounded-lg hover:bg-ember disabled:opacity-50 transition-colors font-medium"
          >
            {saving ? "Saving..." : isEdit ? "Update" : "Save"}
          </button>
        </div>
      )}

      {process.env.NODE_ENV === "development" && rjsfErrors?.length > 0 && (
        <div className="text-xs text-red-400">Validation errors: {rjsfErrors.length}</div>
      )}
    </form>
  );
}

export function SchemaEntityFormFooter({
  formId = "schema-entity-form",
  saving,
  onCancel,
  isEdit = false,
}: {
  formId?: string;
  saving: boolean;
  onCancel?: () => void;
  isEdit?: boolean;
}) {
  return (
    <div className="flex justify-end gap-2">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 border border-border rounded-lg bg-deep/40 text-text-primary hover:bg-deep/60 transition-colors"
        >
          Cancel
        </button>
      )}
      <button
        type="submit"
        form={formId}
        disabled={saving}
        className="px-4 py-2 bg-ember/90 border border-ember/50 text-void rounded-lg hover:bg-ember disabled:opacity-50 transition-colors font-medium"
      >
        {saving ? "Saving..." : isEdit ? "Update" : "Create"}
      </button>
    </div>
  );
}
