// components/character/CharacterForm.tsx
// Reusable form component for creating/editing characters

"use client";

import { useState, useEffect } from "react";
import type { CharacterDefinition } from "@/lib/data/characters";
import type { RuneCode } from "@core/types";
import type { AlphabetVector } from "@core/types";
import type { ElementXpMap, ElementAffinityMap } from "@/lib/packages/player/AffinityService";
import { DamageType } from "@core/enums";
import { ImageUpload } from "@components/ui/ImageUpload";
import { RuneFamiliarityEditor } from "@components/ui/RuneFamiliarityEditor";
import { characterClient, idClient } from "@/lib/api/clients";

interface CharacterFormProps {
  initialValues?: Partial<CharacterDefinition>;
  existingCharacters?: CharacterDefinition[];
  isEdit?: boolean;
  onSubmit: (character: CharacterDefinition) => void;
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

export function CharacterForm({
  initialValues = {},
  existingCharacters = [],
  isEdit = false,
  onSubmit,
  onCancel,
  saving = false,
  submitLabel,
}: CharacterFormProps) {
  const [id, setId] = useState(initialValues.id || "");
  const [name, setName] = useState(initialValues.name || "");
  const [description, setDescription] = useState(initialValues.description || "");
  const [mana, setMana] = useState(initialValues.mana ?? 0);
  const [maxMana, setMaxMana] = useState(initialValues.maxMana ?? 0);
  const [hp, setHp] = useState(initialValues.hp ?? 0);
  const [maxHp, setMaxHp] = useState(initialValues.maxHp ?? 0);
  const [affinity, setAffinity] = useState<AlphabetVector>(initialValues.affinity || {});
  const [elementXp, setElementXp] = useState<ElementXpMap>(initialValues.elementXp || {});
  const [elementAffinity, setElementAffinity] = useState<ElementAffinityMap>(initialValues.elementAffinity || {});
  const [controlBonus, setControlBonus] = useState<number | undefined>(initialValues.controlBonus);
  const [costEfficiency, setCostEfficiency] = useState<number | undefined>(initialValues.costEfficiency);
  const [imagePath, setImagePath] = useState<string | undefined>(initialValues.imagePath);

  const [idValidation, setIdValidation] = useState<{
    isUnique: boolean;
    conflictingTypes: string[];
  } | null>(null);
  const [validatingId, setValidatingId] = useState(false);
  const [lastValidatedId, setLastValidatedId] = useState<string | null>(null);

  const allDamageTypes = Object.values(DamageType);

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
            .checkIdUniqueness(id, "characters")
            .then((result) => {
              setIdValidation(result);
              setLastValidatedId(id);
            })
            .catch((error) => {
              console.error("Error validating ID:", error);
              setIdValidation(null);
            })
            .finally(() => {
              setValidatingId(false);
            });
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setIdValidation(null);
      setLastValidatedId(null);
    }
  }, [id, isEdit, lastValidatedId]);

  // Element XP/Affinity editors
  const [elementXpType, setElementXpType] = useState<DamageType | "">("");
  const [elementXpValue, setElementXpValue] = useState(0);
  const [elementAffinityType, setElementAffinityType] = useState<DamageType | "">("");
  const [elementAffinityValue, setElementAffinityValue] = useState(0);

  const handleAddElementXp = () => {
    if (elementXpType && elementXpValue > 0) {
      setElementXp({ ...elementXp, [elementXpType]: elementXpValue });
      setElementXpType("");
      setElementXpValue(0);
    }
  };

  const handleRemoveElementXp = (type: DamageType) => {
    const newXp = { ...elementXp };
    delete newXp[type];
    setElementXp(newXp);
  };

  const handleAddElementAffinity = () => {
    if (elementAffinityType && elementAffinityValue >= 0 && elementAffinityValue <= 1) {
      setElementAffinity({ ...elementAffinity, [elementAffinityType]: elementAffinityValue });
      setElementAffinityType("");
      setElementAffinityValue(0);
    }
  };

  const handleRemoveElementAffinity = (type: DamageType) => {
    const newAffinity = { ...elementAffinity };
    delete newAffinity[type];
    setElementAffinity(newAffinity);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!id.trim() || !name.trim() || !description.trim()) {
      alert("ID, name, and description are required");
      return;
    }

    if (!isEdit && idValidation && !idValidation.isUnique) {
      alert(`ID "${id}" already exists in: ${idValidation.conflictingTypes.join(", ")}`);
      return;
    }

    const character: CharacterDefinition = {
      id: id.trim(),
      name: name.trim(),
      description: description.trim(),
      mana,
      maxMana,
      hp,
      maxHp,
      affinity,
      effects: [], // Effects are runtime state, not stored in definition
      storyIds: [], // Stories are managed separately in the detail view
      ...(Object.keys(elementXp).length > 0 ? { elementXp } : {}),
      ...(Object.keys(elementAffinity).length > 0 ? { elementAffinity } : {}),
      ...(controlBonus !== undefined ? { controlBonus } : {}),
      ...(costEfficiency !== undefined ? { costEfficiency } : {}),
      ...(imagePath ? { imagePath } : {}),
    };

    onSubmit(character);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto">
      <ImageUpload
        currentImagePath={imagePath}
        contentType="characters"
        entityId={id || undefined}
        onImageUploaded={setImagePath}
        label="Character Image"
        disabled={saving}
      />

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          ID *
        </label>
        {isEdit ? (
          <input
            type="text"
            value={id}
            disabled
            className="w-full px-3 py-2 bg-deep/50 border border-border rounded text-text-muted cursor-not-allowed"
          />
        ) : (
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
            placeholder="e.g., kael"
            required
          />
        )}
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
          placeholder="e.g., Kael"
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
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary min-h-[100px]"
          placeholder="Character description..."
          required
        />
      </div>

      {/* Resource Pools */}
      <div className="border-t border-border pt-4">
        <h3 className="text-lg font-semibold text-glow mb-3">Resource Pools</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Mana *
            </label>
            <input
              type="number"
              step="0.1"
              value={mana}
              onChange={(e) => setMana(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Max Mana *
            </label>
            <input
              type="number"
              step="0.1"
              value={maxMana}
              onChange={(e) => setMaxMana(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              HP *
            </label>
            <input
              type="number"
              step="0.1"
              value={hp}
              onChange={(e) => setHp(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Max HP *
            </label>
            <input
              type="number"
              step="0.1"
              value={maxHp}
              onChange={(e) => setMaxHp(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              required
            />
          </div>
        </div>
      </div>

      {/* Rune Familiarity */}
      <div className="border-t border-border pt-4">
        <h3 className="text-lg font-semibold text-glow mb-3">Rune Familiarity</h3>
        <RuneFamiliarityEditor
          value={affinity}
          onChange={setAffinity}
        />
      </div>

      {/* Element XP */}
      <div className="border-t border-border pt-4">
        <h3 className="text-lg font-semibold text-glow mb-3">Element XP (optional)</h3>
        <div className="space-y-2">
          {Object.entries(elementXp).map(([type, value]) => (
            <div key={type} className="flex items-center gap-2">
              <span className="text-sm text-text-primary">{type}: {value}</span>
              <button
                type="button"
                onClick={() => handleRemoveElementXp(type as DamageType)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <select
              value={elementXpType}
              onChange={(e) => setElementXpType(e.target.value as DamageType | "")}
              className="flex-1 px-3 py-2 bg-deep border border-border rounded text-text-primary"
            >
              <option value="">Select element</option>
              {allDamageTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="1"
              value={elementXpValue}
              onChange={(e) => setElementXpValue(parseInt(e.target.value) || 0)}
              placeholder="XP"
              className="w-24 px-3 py-2 bg-deep border border-border rounded text-text-primary"
            />
            <button
              type="button"
              onClick={handleAddElementXp}
              className="px-3 py-2 bg-ember hover:bg-ember-dark text-white rounded"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Element Affinity */}
      <div className="border-t border-border pt-4">
        <h3 className="text-lg font-semibold text-glow mb-3">Element Affinity (optional, 0-1)</h3>
        <div className="space-y-2">
          {Object.entries(elementAffinity).map(([type, value]) => (
            <div key={type} className="flex items-center gap-2">
              <span className="text-sm text-text-primary">{type}: {value}</span>
              <button
                type="button"
                onClick={() => handleRemoveElementAffinity(type as DamageType)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <select
              value={elementAffinityType}
              onChange={(e) => setElementAffinityType(e.target.value as DamageType | "")}
              className="flex-1 px-3 py-2 bg-deep border border-border rounded text-text-primary"
            >
              <option value="">Select element</option>
              {allDamageTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={elementAffinityValue}
              onChange={(e) => setElementAffinityValue(parseFloat(e.target.value) || 0)}
              placeholder="0-1"
              className="w-24 px-3 py-2 bg-deep border border-border rounded text-text-primary"
            />
            <button
              type="button"
              onClick={handleAddElementAffinity}
              className="px-3 py-2 bg-ember hover:bg-ember-dark text-white rounded"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Player-specific fields */}
      <div className="border-t border-border pt-4">
        <h3 className="text-lg font-semibold text-glow mb-3">Player-Specific (optional)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Control Bonus
            </label>
            <input
              type="number"
              step="0.01"
              value={controlBonus || ""}
              onChange={(e) => setControlBonus(e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              placeholder="Reduces instability"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Cost Efficiency (0-0.3)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="0.3"
              value={costEfficiency || ""}
              onChange={(e) => setCostEfficiency(e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              placeholder="Reduces mana cost"
            />
          </div>
        </div>
      </div>


      <div className="flex gap-3 pt-4 border-t border-border">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-4 py-2 bg-ember hover:bg-ember-dark text-white rounded-lg font-semibold disabled:opacity-50"
        >
          {saving ? "Saving..." : submitLabel || (isEdit ? "Update Character" : "Create Character")}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 bg-deep hover:bg-void border border-border rounded-lg font-semibold text-text-secondary disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

