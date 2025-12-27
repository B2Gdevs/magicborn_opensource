// EntityTypeBuilder.tsx
// Minimal custom entity type builder that generates JSON Schema + uiSchema

"use client";

import { useMemo, useState } from "react";

type FieldType = "string" | "number" | "boolean" | "textarea" | "enum";

type FieldDraft = {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  enumOptions?: string[];
};

export function EntityTypeBuilder({
  initial,
  saving,
  onSubmit,
  onCancel,
}: {
  initial?: { name: string; slug: string; icon?: string; schema?: any; uiSchema?: any };
  saving: boolean;
  onSubmit: (v: { name: string; slug: string; icon?: string; schema: any; uiSchema: any }) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "");
  const [fields, setFields] = useState<FieldDraft[]>([
    { key: "name", label: "Name", type: "string", required: true },
  ]);

  const { schema, uiSchema } = useMemo(() => {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const f of fields) {
      if (!f.key) continue;

      if (f.type === "string") properties[f.key] = { type: "string", title: f.label };
      if (f.type === "textarea") properties[f.key] = { type: "string", title: f.label };
      if (f.type === "number") properties[f.key] = { type: "number", title: f.label };
      if (f.type === "boolean") properties[f.key] = { type: "boolean", title: f.label };
      if (f.type === "enum")
        properties[f.key] = { type: "string", title: f.label, enum: f.enumOptions ?? [] };

      if (f.required) required.push(f.key);
    }

    const ui: Record<string, any> = {};
    for (const f of fields) {
      if (f.type === "textarea") {
        ui[f.key] = { "ui:widget": "textarea" };
      }
    }

    return {
      schema: { type: "object", properties, required, additionalProperties: false },
      uiSchema: ui,
    };
  }, [fields]);

  function addField() {
    setFields((s) => [...s, { key: "", label: "", type: "string", required: false }]);
  }

  function updateField(i: number, patch: Partial<FieldDraft>) {
    setFields((s) => s.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  }

  function removeField(i: number) {
    setFields((s) => s.filter((_, idx) => idx !== i));
  }

  function submit() {
    onSubmit({
      name: name.trim(),
      slug: slug.trim(),
      icon: icon.trim() || undefined,
      schema,
      uiSchema,
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm text-text-secondary">Name</label>
          <input
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Type name (e.g. Faction)"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-text-secondary">Slug</label>
          <input
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="type-slug"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-text-secondary">Icon (optional)</label>
        <input
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="lucide icon name (optional)"
        />
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Fields</h3>
        <button
          type="button"
          className="px-3 py-2 border border-border rounded bg-deep/40 text-text-primary hover:bg-deep/60"
          onClick={addField}
        >
          Add Field
        </button>
      </div>

      <div className="space-y-3">
        {fields.map((f, i) => (
          <div
            key={i}
            className="grid grid-cols-12 gap-2 items-end border border-border/50 rounded p-3 bg-deep/20"
          >
            <div className="col-span-3 space-y-1">
              <label className="text-xs text-text-secondary">Key</label>
              <input
                className="w-full px-2 py-1 bg-deep border border-border rounded text-text-primary"
                value={f.key}
                onChange={(e) => updateField(i, { key: e.target.value })}
              />
            </div>
            <div className="col-span-4 space-y-1">
              <label className="text-xs text-text-secondary">Label</label>
              <input
                className="w-full px-2 py-1 bg-deep border border-border rounded text-text-primary"
                value={f.label}
                onChange={(e) => updateField(i, { label: e.target.value })}
              />
            </div>
            <div className="col-span-3 space-y-1">
              <label className="text-xs text-text-secondary">Type</label>
              <select
                className="w-full px-2 py-1 bg-deep border border-border rounded text-text-primary"
                value={f.type}
                onChange={(e) => updateField(i, { type: e.target.value as FieldType })}
              >
                <option value="string">String</option>
                <option value="textarea">Textarea</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="enum">Enum</option>
              </select>
            </div>
            <div className="col-span-1 flex items-center gap-2">
              <input
                type="checkbox"
                checked={f.required}
                onChange={(e) => updateField(i, { required: e.target.checked })}
              />
              <span className="text-xs text-text-secondary">Req</span>
            </div>
            <div className="col-span-1 flex justify-end">
              <button
                type="button"
                className="px-2 py-1 border border-border rounded bg-deep/40 text-text-primary hover:bg-deep/60"
                onClick={() => removeField(i)}
              >
                X
              </button>
            </div>

            {f.type === "enum" && (
              <div className="col-span-12 space-y-1">
                <label className="text-xs text-text-secondary">Enum Options (comma separated)</label>
                <input
                  className="w-full px-2 py-1 bg-deep border border-border rounded text-text-primary"
                  value={(f.enumOptions ?? []).join(",")}
                  onChange={(e) =>
                    updateField(i, {
                      enumOptions: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            disabled={saving}
            className="px-3 py-2 border border-border rounded bg-deep/40 text-text-primary hover:bg-deep/60 disabled:opacity-50"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          disabled={saving || !name.trim() || !slug.trim()}
          className="px-3 py-2 bg-ember/90 border border-ember/50 text-void rounded hover:bg-ember disabled:opacity-50"
          onClick={submit}
        >
          {saving ? "Saving..." : "Save Entity Type"}
        </button>
      </div>
    </div>
  );
}


