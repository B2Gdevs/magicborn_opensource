// EntityTypeBuilder.tsx
// Entity type builder that generates JSON Schema + uiSchema with support for complex types

"use client";

import { useMemo, useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, GripVertical } from "lucide-react";

type FieldType = 
  | "string" 
  | "textarea" 
  | "number" 
  | "integer" 
  | "boolean" 
  | "enum" 
  | "color"
  | "array" 
  | "object";

type FieldDraft = {
  key: string;
  label: string;
  description?: string;
  type: FieldType;
  required: boolean;
  // For enum
  enumOptions?: string[];
  // For number/integer with min/max (renders as range)
  min?: number;
  max?: number;
  // For array - item type
  arrayItemType?: "string" | "number" | "object";
  // For object - nested fields
  nestedFields?: FieldDraft[];
  // Original schema (for complex types we can't fully parse)
  _originalSchema?: any;
};

// Parse an existing JSON Schema into FieldDraft array
function parseSchemaToFields(
  schema: any,
  uiSchema?: any,
  requiredFields?: string[]
): FieldDraft[] {
  if (!schema?.properties) return [];
  
  const fields: FieldDraft[] = [];
  const required = requiredFields || schema.required || [];
  
  for (const [key, prop] of Object.entries(schema.properties) as [string, any][]) {
    const field: FieldDraft = {
      key,
      label: prop.title || key,
      description: prop.description,
      type: "string",
      required: required.includes(key),
    };
    
    // Determine type
    if (prop.type === "boolean") {
      field.type = "boolean";
    } else if (prop.type === "integer") {
      field.type = "integer";
      if (prop.minimum !== undefined) field.min = prop.minimum;
      if (prop.maximum !== undefined) field.max = prop.maximum;
    } else if (prop.type === "number") {
      field.type = "number";
      if (prop.minimum !== undefined) field.min = prop.minimum;
      if (prop.maximum !== undefined) field.max = prop.maximum;
    } else if (prop.type === "array") {
      field.type = "array";
      if (prop.items?.type === "string") {
        field.arrayItemType = "string";
      } else if (prop.items?.type === "number" || prop.items?.type === "integer") {
        field.arrayItemType = "number";
      } else if (prop.items?.type === "object") {
        field.arrayItemType = "object";
        field.nestedFields = parseSchemaToFields(prop.items, undefined, prop.items?.required);
      }
      field._originalSchema = prop; // Preserve for re-generation
    } else if (prop.type === "object") {
      field.type = "object";
      field.nestedFields = parseSchemaToFields(prop, undefined, prop.required);
      field._originalSchema = prop;
    } else if (prop.enum) {
      field.type = "enum";
      field.enumOptions = prop.enum;
    } else if (prop.type === "string") {
      // Check uiSchema for widget hints
      const ui = uiSchema?.[key];
      if (ui?.["ui:widget"] === "textarea") {
        field.type = "textarea";
      } else if (ui?.["ui:widget"] === "color" || prop.format === "color") {
        field.type = "color";
      } else {
        field.type = "string";
      }
    }
    
    fields.push(field);
  }
  
  return fields;
}

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
  
  // Parse initial schema to fields if editing
  const initialFields = useMemo(() => {
    if (initial?.schema?.properties) {
      return parseSchemaToFields(initial.schema, initial.uiSchema);
    }
    return [{ key: "name", label: "Name", type: "string" as FieldType, required: true }];
  }, [initial?.schema, initial?.uiSchema]);
  
  const [fields, setFields] = useState<FieldDraft[]>(initialFields);
  
  // Track expanded nested fields
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  // Generate JSON Schema and uiSchema from fields
  const { schema, uiSchema } = useMemo(() => {
    function buildSchemaFromFields(fieldList: FieldDraft[]): { properties: Record<string, any>; required: string[]; ui: Record<string, any> } {
      const properties: Record<string, any> = {};
      const required: string[] = [];
      const ui: Record<string, any> = {};

      for (const f of fieldList) {
        if (!f.key) continue;

        const baseProp: any = { title: f.label };
        if (f.description) baseProp.description = f.description;

        switch (f.type) {
          case "string":
            properties[f.key] = { ...baseProp, type: "string" };
            break;
          case "textarea":
            properties[f.key] = { ...baseProp, type: "string" };
            ui[f.key] = { "ui:widget": "textarea" };
            break;
          case "number":
            properties[f.key] = { ...baseProp, type: "number" };
            if (f.min !== undefined) properties[f.key].minimum = f.min;
            if (f.max !== undefined) properties[f.key].maximum = f.max;
            break;
          case "integer":
            properties[f.key] = { ...baseProp, type: "integer" };
            if (f.min !== undefined) properties[f.key].minimum = f.min;
            if (f.max !== undefined) properties[f.key].maximum = f.max;
            break;
          case "boolean":
            properties[f.key] = { ...baseProp, type: "boolean" };
            break;
          case "enum":
            properties[f.key] = { ...baseProp, type: "string", enum: f.enumOptions ?? [] };
            break;
          case "color":
            properties[f.key] = { ...baseProp, type: "string", format: "color" };
            ui[f.key] = { "ui:widget": "color" };
            break;
          case "array":
            if (f._originalSchema) {
              // Preserve original schema for complex arrays
              properties[f.key] = { ...f._originalSchema, title: f.label };
              if (f.description) properties[f.key].description = f.description;
            } else if (f.arrayItemType === "string") {
              properties[f.key] = { ...baseProp, type: "array", items: { type: "string" } };
            } else if (f.arrayItemType === "number") {
              properties[f.key] = { ...baseProp, type: "array", items: { type: "number" } };
            } else if (f.arrayItemType === "object" && f.nestedFields) {
              const nested = buildSchemaFromFields(f.nestedFields);
              properties[f.key] = {
                ...baseProp,
                type: "array",
                items: { type: "object", properties: nested.properties, required: nested.required },
              };
              // Merge nested ui
              if (Object.keys(nested.ui).length > 0) {
                ui[f.key] = { items: nested.ui };
              }
            } else {
              properties[f.key] = { ...baseProp, type: "array", items: { type: "string" } };
            }
            break;
          case "object":
            if (f._originalSchema) {
              // Preserve original schema for complex objects
              properties[f.key] = { ...f._originalSchema, title: f.label };
              if (f.description) properties[f.key].description = f.description;
            } else if (f.nestedFields) {
              const nested = buildSchemaFromFields(f.nestedFields);
              properties[f.key] = {
                ...baseProp,
                type: "object",
                properties: nested.properties,
                required: nested.required,
              };
              // Merge nested ui
              if (Object.keys(nested.ui).length > 0) {
                ui[f.key] = nested.ui;
              }
            } else {
              properties[f.key] = { ...baseProp, type: "object", properties: {}, additionalProperties: true };
            }
            break;
        }

        if (f.required) required.push(f.key);
      }

      return { properties, required, ui };
    }

    const result = buildSchemaFromFields(fields);
    return {
      schema: { type: "object", properties: result.properties, required: result.required, additionalProperties: false },
      uiSchema: result.ui,
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

  function toggleFieldExpanded(key: string) {
    setExpandedFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function addNestedField(parentIndex: number) {
    setFields((s) =>
      s.map((f, idx) =>
        idx === parentIndex
          ? {
              ...f,
              nestedFields: [...(f.nestedFields ?? []), { key: "", label: "", type: "string", required: false }],
              _originalSchema: undefined, // Clear original when modifying
            }
          : f
      )
    );
  }

  function updateNestedField(parentIndex: number, nestedIndex: number, patch: Partial<FieldDraft>) {
    setFields((s) =>
      s.map((f, idx) =>
        idx === parentIndex
          ? {
              ...f,
              nestedFields: (f.nestedFields ?? []).map((nf, ni) => (ni === nestedIndex ? { ...nf, ...patch } : nf)),
              _originalSchema: undefined,
            }
          : f
      )
    );
  }

  function removeNestedField(parentIndex: number, nestedIndex: number) {
    setFields((s) =>
      s.map((f, idx) =>
        idx === parentIndex
          ? {
              ...f,
              nestedFields: (f.nestedFields ?? []).filter((_, ni) => ni !== nestedIndex),
              _originalSchema: undefined,
            }
          : f
      )
    );
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

  // Render a single field row
  function renderFieldRow(f: FieldDraft, i: number, isNested = false, parentIndex?: number) {
    const hasNested = f.type === "object" || (f.type === "array" && f.arrayItemType === "object");
    const isExpanded = expandedFields.has(f.key || `field-${i}`);
    
    return (
      <div key={`${parentIndex ?? "root"}-${i}`} className="space-y-2">
        <div
          className={`grid grid-cols-12 gap-2 items-end border border-border/50 rounded p-3 ${
            isNested ? "bg-deep/30 ml-4" : "bg-deep/20"
          }`}
        >
          {/* Expand/Collapse for nested types */}
          {hasNested && !isNested && (
            <div className="col-span-1 flex items-center">
              <button
                type="button"
                onClick={() => toggleFieldExpanded(f.key || `field-${i}`)}
                className="p-1 hover:bg-deep rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-text-muted" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                )}
              </button>
            </div>
          )}

          <div className={`${hasNested && !isNested ? "col-span-2" : "col-span-3"} space-y-1`}>
            <label className="text-xs text-text-secondary">Key</label>
            <input
              className="w-full px-2 py-1 bg-deep border border-border rounded text-text-primary text-sm"
              value={f.key}
              onChange={(e) =>
                isNested && parentIndex !== undefined
                  ? updateNestedField(parentIndex, i, { key: e.target.value })
                  : updateField(i, { key: e.target.value })
              }
              placeholder="fieldKey"
            />
          </div>

          <div className="col-span-3 space-y-1">
            <label className="text-xs text-text-secondary">Label</label>
            <input
              className="w-full px-2 py-1 bg-deep border border-border rounded text-text-primary text-sm"
              value={f.label}
              onChange={(e) =>
                isNested && parentIndex !== undefined
                  ? updateNestedField(parentIndex, i, { label: e.target.value })
                  : updateField(i, { label: e.target.value })
              }
              placeholder="Field Label"
            />
          </div>

          <div className="col-span-2 space-y-1">
            <label className="text-xs text-text-secondary">Type</label>
            <select
              className="w-full px-2 py-1 bg-deep border border-border rounded text-text-primary text-sm"
              value={f.type}
              onChange={(e) => {
                const newType = e.target.value as FieldType;
                const patch: Partial<FieldDraft> = { type: newType, _originalSchema: undefined };
                if (newType === "array") patch.arrayItemType = "string";
                if (newType === "object" || (newType === "array" && patch.arrayItemType === "object")) {
                  patch.nestedFields = patch.nestedFields ?? [];
                }
                isNested && parentIndex !== undefined
                  ? updateNestedField(parentIndex, i, patch)
                  : updateField(i, patch);
              }}
            >
              <option value="string">String</option>
              <option value="textarea">Textarea</option>
              <option value="number">Number</option>
              <option value="integer">Integer</option>
              <option value="boolean">Boolean</option>
              <option value="enum">Enum</option>
              <option value="color">Color</option>
              {!isNested && <option value="array">Array</option>}
              {!isNested && <option value="object">Object</option>}
            </select>
          </div>

          <div className="col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={f.required}
              onChange={(e) =>
                isNested && parentIndex !== undefined
                  ? updateNestedField(parentIndex, i, { required: e.target.checked })
                  : updateField(i, { required: e.target.checked })
              }
              className="w-4 h-4"
            />
            <span className="text-xs text-text-secondary">Required</span>
          </div>

          <div className="col-span-1 flex justify-end">
            <button
              type="button"
              className="p-1.5 border border-border rounded bg-deep/40 text-red-400 hover:bg-red-500/20 hover:text-red-300"
              onClick={() =>
                isNested && parentIndex !== undefined ? removeNestedField(parentIndex, i) : removeField(i)
              }
              title="Remove field"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Extra options row */}
          {f.type === "enum" && (
            <div className="col-span-12 space-y-1">
              <label className="text-xs text-text-secondary">Options (comma separated)</label>
              <input
                className="w-full px-2 py-1 bg-deep border border-border rounded text-text-primary text-sm"
                value={(f.enumOptions ?? []).join(", ")}
                onChange={(e) => {
                  const opts = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                  isNested && parentIndex !== undefined
                    ? updateNestedField(parentIndex, i, { enumOptions: opts })
                    : updateField(i, { enumOptions: opts });
                }}
                placeholder="option1, option2, option3"
              />
            </div>
          )}

          {(f.type === "number" || f.type === "integer") && (
            <div className="col-span-12 grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-text-secondary">Min (optional)</label>
                <input
                  type="number"
                  className="w-full px-2 py-1 bg-deep border border-border rounded text-text-primary text-sm"
                  value={f.min ?? ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? undefined : Number(e.target.value);
                    isNested && parentIndex !== undefined
                      ? updateNestedField(parentIndex, i, { min: val })
                      : updateField(i, { min: val });
                  }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-text-secondary">Max (optional)</label>
                <input
                  type="number"
                  className="w-full px-2 py-1 bg-deep border border-border rounded text-text-primary text-sm"
                  value={f.max ?? ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? undefined : Number(e.target.value);
                    isNested && parentIndex !== undefined
                      ? updateNestedField(parentIndex, i, { max: val })
                      : updateField(i, { max: val });
                  }}
                />
              </div>
            </div>
          )}

          {f.type === "array" && (
            <div className="col-span-12 space-y-1">
              <label className="text-xs text-text-secondary">Array Item Type</label>
              <select
                className="w-full px-2 py-1 bg-deep border border-border rounded text-text-primary text-sm"
                value={f.arrayItemType ?? "string"}
                onChange={(e) => {
                  const itemType = e.target.value as "string" | "number" | "object";
                  updateField(i, {
                    arrayItemType: itemType,
                    nestedFields: itemType === "object" ? f.nestedFields ?? [] : undefined,
                    _originalSchema: undefined,
                  });
                }}
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="object">Object (nested fields)</option>
              </select>
            </div>
          )}

          {f.description !== undefined && (
            <div className="col-span-12 space-y-1">
              <label className="text-xs text-text-secondary">Description</label>
              <input
                className="w-full px-2 py-1 bg-deep border border-border rounded text-text-primary text-sm"
                value={f.description ?? ""}
                onChange={(e) =>
                  isNested && parentIndex !== undefined
                    ? updateNestedField(parentIndex, i, { description: e.target.value })
                    : updateField(i, { description: e.target.value })
                }
                placeholder="Field description..."
              />
            </div>
          )}
        </div>

        {/* Nested fields for object/array[object] */}
        {hasNested && isExpanded && !isNested && (
          <div className="ml-4 pl-4 border-l-2 border-border/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">
                {f.type === "object" ? "Object Properties" : "Array Item Properties"}
              </span>
              <button
                type="button"
                onClick={() => addNestedField(i)}
                className="flex items-center gap-1 px-2 py-1 text-xs border border-border rounded hover:bg-deep"
              >
                <Plus className="w-3 h-3" /> Add Property
              </button>
            </div>
            {(f.nestedFields ?? []).map((nf, ni) => renderFieldRow(nf, ni, true, i))}
            {(f.nestedFields ?? []).length === 0 && (
              <p className="text-xs text-text-muted italic">No properties defined yet.</p>
            )}
          </div>
        )}
      </div>
    );
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

      <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
        {fields.map((f, i) => renderFieldRow(f, i))}
        {fields.length === 0 && (
          <p className="text-sm text-text-muted italic text-center py-4">
            No fields defined. Click "Add Field" to start.
          </p>
        )}
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


