// components/ui/IdInput.tsx
// Reusable ID input component with validation logic

"use client";

import { useState, useEffect } from "react";
import { idClient } from "@/lib/api/clients";

export type ContentType = "spells" | "effects" | "characters" | "creatures" | "runes";

interface IdInputProps {
  value: string;
  onChange: (id: string) => void;
  contentType: ContentType;
  isEdit?: boolean;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  autoGenerateFrom?: string; // If provided, will auto-generate ID from this value
  className?: string;
}

// Helper to convert name to ID
function nameToId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function IdInput({
  value,
  onChange,
  contentType,
  isEdit = false,
  placeholder = "e.g., my-id",
  label = "ID",
  disabled = false,
  autoGenerateFrom,
  className = "",
}: IdInputProps) {
  const [idValidation, setIdValidation] = useState<{
    isUnique: boolean;
    conflictingTypes: string[];
  } | null>(null);
  const [validatingId, setValidatingId] = useState(false);
  const [lastValidatedId, setLastValidatedId] = useState<string | null>(null);

  // Auto-generate ID from name if provided
  useEffect(() => {
    if (!isEdit && autoGenerateFrom?.trim() && !value) {
      const generatedId = nameToId(autoGenerateFrom);
      onChange(generatedId);
    }
  }, [autoGenerateFrom, isEdit, value, onChange]);

  // Validate ID uniqueness
  useEffect(() => {
    if (!isEdit && value.trim()) {
      if (value === lastValidatedId) {
        return;
      }

      const timeoutId = setTimeout(() => {
        const currentId = value;
        if (currentId === value && currentId !== lastValidatedId) {
          setValidatingId(true);
          idClient
            .checkIdUniqueness(value, contentType)
            .then((result) => {
              // Only update if the ID hasn't changed
              if (currentId === value) {
                setIdValidation(result);
                setLastValidatedId(value);
              }
            })
            .catch((error) => {
              console.error("Error validating ID:", error);
              // Only clear if the ID hasn't changed
              if (currentId === value) {
                setIdValidation(null);
              }
            })
            .finally(() => {
              // Only update validating state if the ID hasn't changed
              if (currentId === value) {
                setValidatingId(false);
              }
            });
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setIdValidation(null);
      setLastValidatedId(null);
    }
  }, [value, isEdit, lastValidatedId, contentType]);

  const getValidationStatus = () => {
    if (isEdit || !value.trim()) return null;
    if (validatingId) return { type: "checking" as const, message: "checking..." };
    if (idValidation && !idValidation.isUnique) {
      return {
        type: "error" as const,
        message: `⚠️ Exists in: ${idValidation.conflictingTypes.join(", ")}`,
      };
    }
    if (idValidation && idValidation.isUnique) {
      return { type: "success" as const, message: "✓ Unique" };
    }
    return null;
  };

  const validationStatus = getValidationStatus();
  const isValid = idValidation?.isUnique ?? false;
  const hasError = idValidation && !idValidation.isUnique;

  // If className includes "hidden", only show validation, not the input
  const isHidden = className.includes("hidden");
  
  return (
    <div className={isHidden ? "" : className}>
      {!isHidden && (
        <>
          {label && (
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              {label} *
            </label>
          )}
          {isEdit ? (
            <input
              type="text"
              value={value}
              disabled
              className="w-full px-3 py-2 bg-deep/50 border border-border rounded text-text-muted cursor-not-allowed"
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              placeholder={placeholder}
              required
              disabled={disabled}
            />
          )}
        </>
      )}
      {/* Always show validation status if present */}
      {validationStatus && (
        <p className={`text-xs text-text-muted ${isHidden ? "mt-1" : "mt-1"}`}>
          {validationStatus.type === "checking" && (
            <span className="text-yellow-500">({validationStatus.message})</span>
          )}
          {validationStatus.type === "error" && (
            <span className="text-red-500">{validationStatus.message}</span>
          )}
          {validationStatus.type === "success" && (
            <span className="text-moss-glow">{validationStatus.message}</span>
          )}
        </p>
      )}
    </div>
  );
}

// Export validation helper for use in forms
export function validateIdBeforeSubmit(
  id: string,
  idValidation: { isUnique: boolean; conflictingTypes: string[] } | null,
  validatingId: boolean,
  contentType: ContentType
): { isValid: boolean; errorMessage?: string } {
  if (!id.trim()) {
    return { isValid: false, errorMessage: "ID is required" };
  }

  if (validatingId) {
    return { isValid: false, errorMessage: "Please wait for ID validation to complete." };
  }

  if (idValidation && !idValidation.isUnique) {
    return {
      isValid: false,
      errorMessage: `A ${contentType.slice(0, -1)} with ID "${id}" already exists in: ${idValidation.conflictingTypes.join(", ")}. Please choose a different ID.`,
    };
  }

  return { isValid: true };
}

