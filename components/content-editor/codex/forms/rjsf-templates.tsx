// rjsf-templates.tsx
// Custom RJSF templates + widgets styled with Tailwind to match our app theme
// Includes first-class MediaWidget using StandardMediaUpload (stores numeric media id)

"use client";

import React from "react";
import type {
  FieldTemplateProps,
  ObjectFieldTemplateProps,
  ArrayFieldTemplateProps,
  BaseInputTemplateProps,
  WidgetProps,
  TitleFieldProps,
  DescriptionFieldProps,
  SubmitButtonProps,
} from "@rjsf/utils";
import { ChevronUp, ChevronDown, X, Plus } from "lucide-react";
import { StandardMediaUpload } from "@/components/ui/StandardMediaUpload";

function cx(...parts: Array<string | undefined | null | false>) {
  return parts.filter(Boolean).join(" ");
}

function asString(v: unknown) {
  return v === undefined || v === null ? "" : String(v);
}

function toNumber(v: unknown) {
  if (v === "" || v === undefined || v === null) return undefined;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function isIntegerSchema(schema: any) {
  return schema?.type === "integer";
}

/** Optional: styled title for object sections (root / nested) */
export function TitleFieldTemplate(props: TitleFieldProps) {
  const { id, title, required } = props;
  if (!title) return null;
  return (
    <div id={id} className="flex items-center gap-2">
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      {required && <span className="text-ember text-sm">*</span>}
    </div>
  );
}

/** Optional: styled description field */
export function DescriptionFieldTemplate(props: DescriptionFieldProps) {
  const { id, description } = props;
  if (!description) return null;
  return (
    <p id={id} className="text-sm text-text-muted">
      {description}
    </p>
  );
}

// ----------------------------
// Templates
// ----------------------------

// Field wrapper template
export function FieldTemplate(props: FieldTemplateProps) {
  const { id, label, required, description, errors, children, hidden, classNames, schema, uiSchema } = props;

  if (hidden) return <div className="hidden">{children}</div>;

  const hasError = Boolean((errors as any)?.props?.errors?.length);
  const isComplexType = schema?.type === "object" || schema?.type === "array";
  const showLabel = Boolean(label) && !isComplexType && uiSchema?.["ui:options"]?.label !== false;

  return (
    <div className={cx("space-y-1.5", classNames)}>
      {showLabel && (
        <label htmlFor={id} className="block text-sm font-medium text-text-primary">
          {label}
          {required && <span className="text-ember ml-0.5">*</span>}
        </label>
      )}
      {description && !isComplexType && <p className="text-xs text-text-muted">{description}</p>}
      {children}
      {hasError && <div className="text-xs text-red-400 mt-1">{errors}</div>}
    </div>
  );
}

// Object layout template - root uses Tailwind grid; nested objects are cards
export function ObjectFieldTemplate(props: ObjectFieldTemplateProps) {
  const { title, description, properties, idSchema, uiSchema } = props;
  const isRoot = idSchema.$id === "root";

  // Allow per-object control: ui:options.columns = 1 | 2
  const columns: 1 | 2 = (uiSchema?.["ui:options"]?.columns === 1 ? 1 : 2) as 1 | 2;

  if (isRoot) {
    return (
      <div className="space-y-4">
        {title && <h3 className="text-lg font-semibold text-text-primary">{title}</h3>}
        {description && <p className="text-sm text-text-muted">{description}</p>}

        <div className={cx(columns === 2 ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4")}>
          {properties.map((prop) => (
            <div key={prop.name}>{prop.content}</div>
          ))}
        </div>
      </div>
    );
  }

  // Nested object - card
  return (
    <div className="space-y-3 p-4 bg-deep/20 border border-border/50 rounded-lg">
      {title && (
        <h4 className="text-sm font-semibold text-text-primary border-b border-border/30 pb-2">
          {title}
        </h4>
      )}
      {description && <p className="text-xs text-text-muted">{description}</p>}
      <div className="space-y-3">
        {properties.map((prop) => (
          <div key={prop.name}>{prop.content}</div>
        ))}
      </div>
    </div>
  );
}

// Array field template
export function ArrayFieldTemplate(props: ArrayFieldTemplateProps) {
  const { title, items, canAdd, onAddClick, schema } = props;
  const itemTitle = (schema.items as any)?.title || "Item";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        {title && <h4 className="text-sm font-semibold text-text-primary">{title}</h4>}
        {canAdd && (
          <button
            type="button"
            onClick={onAddClick}
            className="flex items-center gap-1.5 px-2 py-1 text-xs border border-border rounded-md hover:bg-deep text-text-primary transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add {itemTitle}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-text-muted italic py-4 text-center border border-dashed border-border/50 rounded-lg">
          No items yet. Click "Add {itemTitle}" to create one.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={item.key} className="relative p-3 bg-deep/30 border border-border/50 rounded-lg group">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/30">
                <span className="text-xs font-medium text-text-muted">
                  {itemTitle} #{idx + 1}
                </span>
                <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                  {item.hasMoveUp && (
                    <button
                      type="button"
                      onClick={item.onReorderClick(item.index, item.index - 1)}
                      className="p-1 rounded hover:bg-deep text-text-muted hover:text-text-primary transition-colors"
                      title="Move up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {item.hasMoveDown && (
                    <button
                      type="button"
                      onClick={item.onReorderClick(item.index, item.index + 1)}
                      className="p-1 rounded hover:bg-deep text-text-muted hover:text-text-primary transition-colors"
                      title="Move down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {item.hasRemove && (
                    <button
                      type="button"
                      onClick={item.onDropIndexClick(item.index)}
                      className="p-1 rounded hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div>{item.children}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Base input template (fallback)
export function BaseInputTemplate(props: BaseInputTemplateProps) {
  const { id, type, value, disabled, readonly, autofocus, onChange, onBlur, onFocus, placeholder } = props;

  return (
    <input
      id={id}
      type={type || "text"}
      value={value ?? ""}
      disabled={disabled}
      readOnly={readonly}
      autoFocus={autofocus}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => onBlur(id, e.target.value)}
      onFocus={(e) => onFocus(id, e.target.value)}
      className="w-full px-3 py-2 bg-deep border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-ember/50 focus:border-ember/50 disabled:opacity-50 disabled:cursor-not-allowed"
    />
  );
}

// ----------------------------
// Widgets
// ----------------------------

export function TextWidget(props: WidgetProps) {
  const { id, value, disabled, readonly, onChange, placeholder, autofocus } = props;
  return (
    <input
      id={id}
      type="text"
      value={asString(value)}
      disabled={disabled}
      readOnly={readonly}
      autoFocus={autofocus}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-deep border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-ember/50 focus:border-ember/50 disabled:opacity-50"
    />
  );
}

export function EmailWidget(props: WidgetProps) {
  const { id, value, disabled, readonly, onChange, placeholder, autofocus } = props;
  return (
    <input
      id={id}
      type="email"
      value={asString(value)}
      disabled={disabled}
      readOnly={readonly}
      autoFocus={autofocus}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-deep border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-ember/50 focus:border-ember/50 disabled:opacity-50"
    />
  );
}

export function UrlWidget(props: WidgetProps) {
  const { id, value, disabled, readonly, onChange, placeholder, autofocus } = props;
  return (
    <input
      id={id}
      type="url"
      value={asString(value)}
      disabled={disabled}
      readOnly={readonly}
      autoFocus={autofocus}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-deep border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-ember/50 focus:border-ember/50 disabled:opacity-50"
    />
  );
}

export function TextareaWidget(props: WidgetProps) {
  const { id, value, disabled, readonly, onChange, placeholder, autofocus, options } = props;
  const rows = (options as any)?.rows ?? 4;

  return (
    <textarea
      id={id}
      value={asString(value)}
      disabled={disabled}
      readOnly={readonly}
      autoFocus={autofocus}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full px-3 py-2 bg-deep border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-ember/50 focus:border-ember/50 disabled:opacity-50 resize-y min-h-[100px]"
    />
  );
}

export function CheckboxWidget(props: WidgetProps) {
  const { id, value, disabled, readonly, onChange, label } = props;

  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        id={id}
        type="checkbox"
        checked={Boolean(value)}
        disabled={disabled}
        readOnly={readonly}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-border bg-deep text-ember focus:ring-ember/50 focus:ring-offset-0"
      />
      {label && <span className="text-sm text-text-primary">{label}</span>}
    </label>
  );
}

export function SelectWidget(props: WidgetProps) {
  const { id, value, disabled, readonly, onChange, options, placeholder } = props;
  const { enumOptions = [] } = options;

  return (
    <select
      id={id}
      value={value ?? ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-deep border border-border rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-ember/50 focus:border-ember/50 disabled:opacity-50"
    >
      <option value="">{placeholder ?? "Select..."}</option>
      {enumOptions.map((opt: { value: any; label: string }) => (
        <option key={String(opt.value)} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function NumberWidget(props: WidgetProps) {
  const { id, value, disabled, readonly, onChange, placeholder, schema } = props;
  const min = (schema as any)?.minimum;
  const max = (schema as any)?.maximum;
  const step = isIntegerSchema(schema) ? 1 : (schema as any)?.multipleOf;

  return (
    <div className="space-y-1">
      <input
        id={id}
        type="number"
        value={value ?? ""}
        disabled={disabled}
        readOnly={readonly}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(toNumber(e.target.value))}
        className="w-full px-3 py-2 bg-deep border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-ember/50 focus:border-ember/50 disabled:opacity-50"
      />
      {(min !== undefined || max !== undefined) && (
        <p className="text-xs text-text-muted">
          {min !== undefined && max !== undefined
            ? `Range: ${min} - ${max}`
            : min !== undefined
              ? `Min: ${min}`
              : `Max: ${max}`}
        </p>
      )}
    </div>
  );
}

export function RangeWidget(props: WidgetProps) {
  const { id, value, disabled, readonly, onChange, schema, options } = props;
  const min = (schema as any)?.minimum ?? 0;
  const max = (schema as any)?.maximum ?? 100;
  const step = (options as any)?.step ?? (schema as any)?.multipleOf ?? 1;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <input
          id={id}
          type="range"
          value={typeof value === "number" ? value : toNumber(value) ?? min}
          disabled={disabled}
          readOnly={readonly}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-deep rounded-lg appearance-none cursor-pointer accent-ember"
        />
        <span className="text-sm font-mono text-text-primary w-12 text-right">
          {typeof value === "number" ? value : toNumber(value) ?? min}
        </span>
      </div>
      <div className="flex justify-between text-xs text-text-muted">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export function ColorWidget(props: WidgetProps) {
  const { id, value, disabled, readonly, onChange } = props;

  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="color"
        value={asString(value) || "#000000"}
        disabled={disabled}
        readOnly={readonly}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded border border-border cursor-pointer bg-transparent"
      />
      <input
        type="text"
        value={asString(value)}
        disabled={disabled}
        readOnly={readonly}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className="flex-1 px-3 py-2 bg-deep border border-border rounded-lg text-text-primary font-mono text-sm focus:outline-none focus:ring-1 focus:ring-ember/50 focus:border-ember/50 disabled:opacity-50"
      />
    </div>
  );
}

/**
 * FileWidget (basic)
 * Stores a File object in formData (not uploaded automatically).
 * Useful for advanced flows; otherwise prefer MediaWidget for your app.
 *
 * uiSchema example:
 * myFile: { "ui:widget": "file" }
 */
export function FileWidget(props: WidgetProps) {
  const { id, disabled, readonly, onChange, options, label } = props;

  const accept = (options as any)?.accept as string | undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="text-sm font-medium text-text-primary">{label}</div>
      )}
      <input
        id={id}
        type="file"
        accept={accept}
        disabled={disabled || readonly}
        onChange={(e) => onChange(e.target.files?.[0] ?? undefined)}
        className="block w-full text-sm text-text-muted file:mr-3 file:rounded-md file:border file:border-border file:bg-deep/40 file:px-3 file:py-2 file:text-text-primary hover:file:bg-deep/60"
      />
    </div>
  );
}

/**
 * MediaWidget
 * Uses StandardMediaUpload (app-wide component).
 * Stores a numeric media id in RJSF formData.
 *
 * uiSchema example:
 * imageMediaId: {
 *   "ui:widget": "media",
 *   "ui:options": { size: "inline", mediaType: "image", label: "Image" }
 * }
 */
// rjsf-templates.tsx (MediaWidget portion)

export function MediaWidget(props: WidgetProps) {
  const { value, disabled, readonly, onChange, options, label, formContext } = props as any;

  const mediaId = typeof value === "number" ? value : value ? Number(value) : undefined;

  const size = ((options as any)?.size ?? "inline") as "thumbnail" | "full" | "inline";
  const mediaType = ((options as any)?.mediaType ?? "image") as "image" | "video" | "audio" | "all";
  const widgetLabel = (options as any)?.label ?? label;

  const projectId: string | undefined = formContext?.projectId;

  return (
    <StandardMediaUpload
      currentMediaId={mediaId}
      currentMediaUrl={undefined}
      onMediaSelected={(id) => onChange(id)}
      size={size}
      mediaType={mediaType}
      label={widgetLabel}
      disabled={disabled || readonly}
      projectId={projectId}
    />
  );
}



// ----------------------------
// Exports
// ----------------------------

export const templates = {
  FieldTemplate,
  ObjectFieldTemplate,
  ArrayFieldTemplate,
  BaseInputTemplate,
  TitleFieldTemplate,
  DescriptionFieldTemplate,
  ButtonTemplates: { },
};

export const widgets = {
  TextWidget,
  text: TextWidget,

  textarea: TextareaWidget,
  CheckboxWidget,
  checkbox: CheckboxWidget,

  SelectWidget,
  select: SelectWidget,

  NumberWidget,
  updown: NumberWidget, // integer + number default in many themes

  range: RangeWidget,
  color: ColorWidget,

  email: EmailWidget,
  url: UrlWidget,

  file: FileWidget,
  media: MediaWidget,
};
