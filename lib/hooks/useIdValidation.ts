// lib/hooks/useIdValidation.ts
// Reusable hook for ID uniqueness validation with debouncing

import { useState, useEffect } from "react";
import { UseFormSetValue, UseFormClearErrors, UseFormSetError } from "react-hook-form";

interface IdValidationResult {
  isUnique: boolean;
  error?: string;
}

interface UseIdValidationOptions {
  id: string;
  isEdit?: boolean;
  projectId?: string;
  editEntryId?: number;
  checkIdUniqueness: (
    id: string,
    projectId?: string,
    excludeId?: number
  ) => Promise<IdValidationResult>;
  setError: UseFormSetError<any>;
  clearErrors: UseFormClearErrors<any>;
  debounceMs?: number; // Default 800ms
}

interface UseIdValidationReturn {
  idValidation: IdValidationResult | null;
  validatingId: boolean;
}

/**
 * Custom hook for validating ID uniqueness with debouncing
 * Used across all entity forms (Character, Creature, Region, Object, Lore, Spell, Rune, Effect)
 */
export function useIdValidation({
  id,
  isEdit = false,
  projectId,
  editEntryId,
  checkIdUniqueness,
  setError,
  clearErrors,
  debounceMs = 800,
}: UseIdValidationOptions): UseIdValidationReturn {
  const [idValidation, setIdValidation] = useState<IdValidationResult | null>(null);
  const [validatingId, setValidatingId] = useState(false);

  useEffect(() => {
    if (!isEdit && id && id.trim()) {
      const timeoutId = setTimeout(() => {
        setValidatingId(true);
        checkIdUniqueness(id, projectId, editEntryId)
          .then((result) => {
            setIdValidation(result);
            if (!result.isUnique) {
              setError("id", {
                type: "manual",
                message: result.error || "ID already exists",
              });
            } else {
              clearErrors("id");
            }
          })
          .catch((error) => {
            console.error("Error validating ID:", error);
            setIdValidation(null);
          })
          .finally(() => {
            setValidatingId(false);
          });
      }, debounceMs);

      return () => clearTimeout(timeoutId);
    } else {
      setIdValidation(null);
    }
  }, [id, isEdit, projectId, editEntryId, checkIdUniqueness, setError, clearErrors, debounceMs]);

  return { idValidation, validatingId };
}

