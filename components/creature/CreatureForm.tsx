// components/creature/CreatureForm.tsx
// Reusable form component for creating/editing creatures

"use client";

import { useState, useEffect } from "react";
import type { CreatureDefinition } from "@/lib/data/creatures";
import type { AlphabetVector } from "@core/types";
import type { ElementXpMap, ElementAffinityMap } from "@/lib/packages/player/AffinityService";
import { ImageUpload } from "@components/ui/ImageUpload";
import { CombatStatsEditor } from "@components/ui/CombatStatsEditor";
import { idClient } from "@/lib/api/clients";

interface CreatureFormProps {
  initialValues?: Partial<CreatureDefinition>;
  isEdit?: boolean;
  onSubmit: (creature: CreatureDefinition) => void;
  onCancel?: () => void;
  saving?: boolean;
  submitLabel?: string;
}

// Helper to convert name to ID
function nameToId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function CreatureForm({
  initialValues = {},
  isEdit = false,
  onSubmit,
  onCancel,
  saving = false,
  submitLabel,
}: CreatureFormProps) {
  const [id, setId] = useState(initialValues.id || "");
  const [name, setName] = useState(initialValues.name || "");
  const [description, setDescription] = useState(initialValues.description || "");
  const [hp, setHp] = useState(initialValues.hp ?? 100);
  const [maxHp, setMaxHp] = useState(initialValues.maxHp ?? 100);
  const [mana, setMana] = useState(initialValues.mana ?? 50);
  const [maxMana, setMaxMana] = useState(initialValues.maxMana ?? 50);
  const [affinity, setAffinity] = useState<AlphabetVector>(initialValues.affinity || {});
  const [elementXp, setElementXp] = useState<ElementXpMap>(initialValues.elementXp || {});
  const [elementAffinity, setElementAffinity] = useState<ElementAffinityMap>(initialValues.elementAffinity || {});
  const [imagePath, setImagePath] = useState<string | undefined>(initialValues.imagePath);

  const [idValidation, setIdValidation] = useState<{
    isUnique: boolean;
    conflictingTypes: string[];
  } | null>(null);
  const [validatingId, setValidatingId] = useState(false);
  const [lastValidatedId, setLastValidatedId] = useState<string | null>(null);

  // Auto-generate ID from name
  useEffect(() => {
    if (!isEdit && name.trim() && !id) {
      const generatedId = nameToId(name);
      setId(generatedId);
    }
  }, [name, isEdit, id]);

  // Validate ID uniqueness
  useEffect(() => {
    if (!isEdit && id.trim()) {
      if (id === lastValidatedId) {
        return;
      }

      const timeoutId = setTimeout(() => {
        const currentId = id;
        if (currentId === id && currentId !== lastValidatedId) {
          setValidatingId(true);
          idClient
            .checkIdUniqueness(id, "creatures")
            .then((result) => {
              // Only update if the ID hasn't changed
              if (currentId === id) {
                setIdValidation(result);
                setLastValidatedId(id);
              }
            })
            .catch((error) => {
              console.error("Error validating ID:", error);
              // Only clear if the ID hasn't changed
              if (currentId === id) {
                setIdValidation(null);
              }
            })
            .finally(() => {
              // Only update validating state if the ID hasn't changed
              if (currentId === id) {
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
  }, [id, isEdit, lastValidatedId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id.trim()) { alert("ID is required"); return; }
    if (!name.trim()) { alert("Name is required"); return; }
    if (!description.trim()) { alert("Description is required"); return; }

    if (!isEdit && idValidation && !idValidation.isUnique) {
      alert(`A creature with ID "${id}" already exists in: ${idValidation.conflictingTypes.join(", ")}. Please choose a different ID.`);
      return;
    }
    if (!isEdit && validatingId) {
      alert("Please wait for ID validation to complete.");
      return;
    }

    const creature: CreatureDefinition = {
      id,
      name,
      description,
      imagePath,
      hp,
      maxHp,
      mana,
      maxMana,
      affinity,
      effects: [], // Effects are runtime state
      storyIds: [], // Stories are managed separately in the detail view
      ...(Object.keys(elementXp).length > 0 ? { elementXp } : {}),
      ...(Object.keys(elementAffinity).length > 0 ? { elementAffinity } : {}),
    };

    onSubmit(creature);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ImageUpload
        currentImagePath={imagePath}
        contentType="creatures"
        entityId={id || undefined}
        onImageUploaded={setImagePath}
        label="Creature Image"
        disabled={saving}
      />

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          ID *
        </label>
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
          placeholder="e.g., shadow-beast"
          required
          disabled={isEdit}
        />
        {id && !isEdit && (
          <p className="text-xs text-text-muted mt-1">
            {validatingId && <span className="text-yellow-500">(checking...)</span>}
            {idValidation && !idValidation.isUnique && (
              <span className="text-red-500">
                ⚠️ Exists in: {idValidation.conflictingTypes.join(", ")}
              </span>
            )}
            {idValidation && idValidation.isUnique && (
              <span className="text-moss-glow">✓ Unique</span>
            )}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
          placeholder="e.g., Shadow Beast"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          Description *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary min-h-[80px]"
          placeholder="A brief description of the creature..."
          required
        />
      </div>

      <CombatStatsEditor
        hp={hp}
        maxHp={maxHp}
        mana={mana}
        maxMana={maxMana}
        onHpChange={setHp}
        onMaxHpChange={setMaxHp}
        onManaChange={setMana}
        onMaxManaChange={setMaxMana}
        affinity={affinity}
        onAffinityChange={setAffinity}
        elementXp={elementXp}
        elementAffinity={elementAffinity}
        onElementXpChange={setElementXp}
        onElementAffinityChange={setElementAffinity}
      />

      <div className="flex gap-3 pt-4 border-t border-border">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-4 py-2 bg-ember hover:bg-ember-dark text-white rounded-lg font-semibold disabled:opacity-50"
        >
          {saving ? "Saving..." : submitLabel || (isEdit ? "Update Creature" : "Create Creature")}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

