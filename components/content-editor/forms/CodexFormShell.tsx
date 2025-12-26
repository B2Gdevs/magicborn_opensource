// CodexFormShell.tsx
// Standard form shell for codex entry forms
// Provides consistent layout, scrolling, and spacing

"use client";

import type { ReactNode, FormEvent } from "react";

interface CodexFormShellProps {
  /** Form ID for external submit buttons */
  formId?: string;
  /** Form submit handler */
  onSubmit: (e: FormEvent) => void;
  /** Form content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function CodexFormShell({
  formId,
  onSubmit,
  children,
  className = "",
}: CodexFormShellProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <form
      id={formId}
      data-entry-form
      onSubmit={handleSubmit}
      className={`space-y-6 p-6 ${className}`}
    >
      {children}
    </form>
  );
}

/**
 * Form section with optional title
 */
interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="space-y-4">
      {title && (
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-text-primary">{title}</h3>
          {description && (
            <p className="text-xs text-text-muted">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Form field wrapper with label and error
 */
interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({
  label,
  htmlFor,
  error,
  required,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-text-secondary"
      >
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

/**
 * Form input styles (apply to input/textarea/select)
 */
export const formInputStyles =
  "w-full px-3 py-2 bg-deep/50 border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-ember/50 focus:border-ember/50";

export const formTextareaStyles = `${formInputStyles} min-h-[100px] resize-y`;

