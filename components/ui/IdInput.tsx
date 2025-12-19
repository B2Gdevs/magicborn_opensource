// components/ui/IdInput.tsx
// Reusable ID input component with validation logic - now checks against Payload CMS

"use client";

import { useState, useEffect } from "react";

export type ContentType = "spells" | "effects" | "characters" | "creatures" | "runes" | "environments" | "maps" | "regions" | "objects" | "lore";

// Map content types to Payload collection slugs
const contentTypeToCollection: Record<ContentType, string> = {
  spells: "spells",
  effects: "effects",
  characters: "characters",
  creatures: "creatures",
  runes: "runes",
  environments: "environments",
  maps: "maps",
  regions: "locations",
  objects: "objects",
  lore: "lore",
};

// Check ID uniqueness against Payload
// For characters, checks 'slug' field; for others, checks 'name' field
async function checkPayloadIdUniqueness(
  id: string,
  contentType: ContentType,
  projectId?: string,
  excludeId?: number // For edit mode - exclude current entry
): Promise<{ isUnique: boolean; conflictingTypes: string[] }> {
  const collection = contentTypeToCollection[contentType];
  if (!collection) {
    return { isUnique: true, conflictingTypes: [] };
  }

  try {
    // Characters use 'slug' field, runes use 'code' field, others use 'name' field
    const fieldName = contentType === 'characters' 
      ? 'slug' 
      : contentType === 'runes' 
        ? 'code' 
        : 'name';
    
    // Build query
    let query = `where[${fieldName}][equals]=${encodeURIComponent(id)}`;
    
    // Filter by project if provided
    if (projectId) {
      query += `&where[project][equals]=${projectId}`;
    }
    
    // Exclude current entry if editing
    if (excludeId) {
      query += `&where[id][not_equals]=${excludeId}`;
    }
    
    const res = await fetch(`/api/payload/${collection}?${query}&limit=1`);
    if (!res.ok) {
      // If collection doesn't exist or error, assume unique
      return { isUnique: true, conflictingTypes: [] };
    }
    const data = await res.json();
    if (data.docs && data.docs.length > 0) {
      return { isUnique: false, conflictingTypes: [contentType] };
    }
    return { isUnique: true, conflictingTypes: [] };
  } catch {
    return { isUnique: true, conflictingTypes: [] };
  }
}

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
  projectId?: string; // For filtering validation by project
  excludeId?: number; // For edit mode - exclude current entry from validation
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
  projectId,
  excludeId,
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

  // Validate ID uniqueness against Payload
  useEffect(() => {
    if (!isEdit && value.trim()) {
      if (value === lastValidatedId) {
        return;
      }

      const timeoutId = setTimeout(() => {
        const currentId = value;
        if (currentId === value && currentId !== lastValidatedId) {
          setValidatingId(true);
          checkPayloadIdUniqueness(value, contentType, projectId, excludeId)
            .then((result) => {
              if (currentId === value) {
                setIdValidation(result);
                setLastValidatedId(value);
              }
            })
            .catch((error) => {
              console.error("Error validating ID:", error);
              if (currentId === value) {
                setIdValidation(null);
              }
            })
            .finally(() => {
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
  }, [value, isEdit, lastValidatedId, contentType, projectId, excludeId]);

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

