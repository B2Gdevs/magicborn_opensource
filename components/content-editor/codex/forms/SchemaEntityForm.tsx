// SchemaEntityForm.tsx
// Generic schema-driven entity form (RJSF)

"use client";

import { useMemo } from "react";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import type { UiSchema } from "@/lib/content-editor/codex/schema/types";

export function SchemaEntityForm({
  schema,
  uiSchema,
  initialData,
  saving,
  onSubmit,
  onCancel,
}: {
  schema: Record<string, any>;
  uiSchema?: UiSchema;
  initialData?: Record<string, any>;
  saving: boolean;
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  onCancel?: () => void;
}) {
  const formData = useMemo(() => initialData ?? {}, [initialData]);

  return (
    <div className="space-y-4">
      <Form
        validator={validator as any}
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        disabled={saving}
        onSubmit={(e) => onSubmit(e.formData as Record<string, any>)}
      >
        <div className="flex justify-end gap-2 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="px-3 py-2 border border-border rounded bg-deep/40 text-text-primary hover:bg-deep/60"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-3 py-2 bg-ember/90 border border-ember/50 text-void rounded hover:bg-ember disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </Form>
    </div>
  );
}


