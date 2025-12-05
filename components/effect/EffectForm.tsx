// components/effect/EffectForm.tsx
// Reusable form component for creating/editing effects

"use client";

import { useState, useEffect } from "react";
import type { EffectDefinition } from "@/lib/data/effects";
import { EffectCategory } from "@/lib/data/effects";
import { EffectType } from "@core/enums";
import type { EffectBlueprint } from "@core/effects";
import { ImageUpload } from "@components/ui/ImageUpload";
import { idClient } from "@/lib/api/clients";

interface EffectFormProps {
  initialValues?: Partial<EffectDefinition>;
  existingEffects?: EffectDefinition[];
  existingIds?: string[];
  isEdit?: boolean;
  onSubmit: (effect: EffectDefinition) => void;
  onCancel?: () => void;
  saving?: boolean;
  submitLabel?: string;
}

export function EffectForm({
  initialValues = {},
  existingEffects = [],
  existingIds = [],
  isEdit = false,
  onSubmit,
  onCancel,
  saving = false,
  submitLabel,
}: EffectFormProps) {
  const [id, setId] = useState(initialValues.id || "");
  const [name, setName] = useState(initialValues.name || "");
  const [description, setDescription] = useState(initialValues.description || "");
  const [category, setCategory] = useState<EffectCategory>(initialValues.category || EffectCategory.DamageOverTime);
  const [isBuff, setIsBuff] = useState(initialValues.isBuff ?? false);
  const [iconKey, setIconKey] = useState(initialValues.iconKey || "");
  const [maxStacks, setMaxStacks] = useState<number | undefined>(initialValues.maxStacks);
  
  // Blueprint fields
  const [baseMagnitude, setBaseMagnitude] = useState(initialValues.blueprint?.baseMagnitude || 0);
  const [baseDurationSec, setBaseDurationSec] = useState(initialValues.blueprint?.baseDurationSec || 0);
  const [self, setSelf] = useState(initialValues.blueprint?.self || false);
  const [imagePath, setImagePath] = useState<string | undefined>(initialValues.imagePath);
  const [idValidation, setIdValidation] = useState<{
    isUnique: boolean;
    conflictingTypes: string[];
  } | null>(null);
  const [validatingId, setValidatingId] = useState(false);
  const [lastValidatedId, setLastValidatedId] = useState<string | null>(null);

  const allCategories = Object.values(EffectCategory);
  const allEffectTypes = Object.values(EffectType);
  const availableEffectTypes = allEffectTypes.filter(type => !existingIds.includes(type));

  // Validate ID uniqueness when ID changes - debounced
  useEffect(() => {
    if (id.trim()) {
      // Only validate if the ID has changed from what we last validated
      if (id === lastValidatedId) {
        return; // Already validated this ID, no need to check again
      }

      // Debounce: wait 500ms after user stops typing
      const timeoutId = setTimeout(() => {
        // Double-check the ID hasn't changed during the debounce
        if (id !== lastValidatedId) {
          setValidatingId(true);
          idClient
            .checkIdUniqueness(id, "effects", isEdit ? (initialValues as EffectDefinition).id : undefined)
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
  }, [id, isEdit, initialValues, lastValidatedId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id.trim()) {
      alert("ID (Effect Type) is required");
      return;
    }
    
    if (!name.trim()) {
      alert("Name is required");
      return;
    }
    
    // Final validation check
    const validation = await idClient.checkIdUniqueness(
      id,
      "effects",
      isEdit ? (initialValues as EffectDefinition).id : undefined
    );
    if (!validation.isUnique) {
      const conflictList = validation.conflictingTypes
        .map(type => type.charAt(0).toUpperCase() + type.slice(1))
        .join(", ");
      alert(
        `ID "${id}" already exists in: ${conflictList}.\n\n` +
        `Please choose a different ID.`
      );
      return;
    }
    
    if (baseMagnitude <= 0) {
      alert("Base magnitude must be greater than 0");
      return;
    }
    
    if (baseDurationSec <= 0) {
      alert("Base duration must be greater than 0");
      return;
    }

    const blueprint: EffectBlueprint = {
      type: id as EffectType,
      baseMagnitude,
      baseDurationSec,
      self: self || undefined,
    };

    const effect: EffectDefinition = {
      ...(initialValues as EffectDefinition),
      id: id as EffectType,
      name: name.trim(),
      description: description.trim(),
      category,
      isBuff,
      blueprint,
      iconKey: iconKey.trim() || undefined,
      maxStacks: maxStacks && maxStacks > 0 ? maxStacks : undefined,
      imagePath: imagePath || undefined,
    };
    
    onSubmit(effect);
  };

  // Helper to convert name to ID (e.g., "Ember Ray" -> "ember_ray")
  function nameToId(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ImageUpload
        currentImagePath={imagePath}
        contentType="effects"
        entityId={id || undefined}
        onImageUploaded={setImagePath}
        label="Effect Image"
        disabled={saving}
      />

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          ID (Effect Type) *
        </label>
        {isEdit ? (
          <input
            type="text"
            value={id}
            disabled
            className="w-full px-3 py-2 bg-deep/50 border border-border rounded text-text-muted cursor-not-allowed"
          />
        ) : (
          <div className="space-y-2">
            {availableEffectTypes.length > 0 ? (
              <select
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              >
                <option value="">Or type a custom ID below</option>
                {availableEffectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            ) : null}
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              placeholder={availableEffectTypes.length > 0 ? "Or enter a custom effect type ID (e.g., freeze, curse)" : "Enter effect type ID (e.g., burn, freeze, curse)"}
              required
            />
          </div>
        )}
        {id && (
          <div className="mt-1">
            <p className="text-xs text-text-muted">
              ID: <code className="text-ember-glow">{id}</code>
              {validatingId && <span className="ml-2 text-text-muted">(checking...)</span>}
            </p>
            {idValidation && !idValidation.isUnique && (
              <p className="text-xs text-red-400 mt-1">
                ⚠️ ID already exists in: {idValidation.conflictingTypes
                  .map(type => type.charAt(0).toUpperCase() + type.slice(1))
                  .join(", ")}
              </p>
            )}
            {idValidation && idValidation.isUnique && id && (
              <p className="text-xs text-moss-glow mt-1">✓ ID is unique</p>
            )}
            {name && !isEdit && (
              <p className="text-xs text-text-secondary mt-1">
                (Auto-generate from name: <button
                  type="button"
                  onClick={() => setId(nameToId(name))}
                  className="text-ember-glow hover:underline"
                >
                  {nameToId(name)}
                </button>)
              </p>
            )}
          </div>
        )}
        <p className="text-xs text-text-muted mt-1">
          The effect type ID is a unique identifier used in the game code (e.g., "burn", "freeze", "shield"). Use lowercase with underscores.
        </p>
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
          placeholder="e.g., Burn"
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
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
          rows={3}
          placeholder="Takes periodic fire damage over time."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1">
            Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as EffectCategory)}
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
            required
          >
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1">
            Max Stacks (optional)
          </label>
          <input
            type="number"
            min="1"
            value={maxStacks || ""}
            onChange={(e) => setMaxStacks(e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
            placeholder="e.g., 3"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isBuff"
          checked={isBuff}
          onChange={(e) => setIsBuff(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="isBuff" className="text-sm text-text-secondary">
          Is Buff (checked) / Is Debuff (unchecked)
        </label>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          Icon Key (optional)
        </label>
        <input
          type="text"
          value={iconKey}
          onChange={(e) => setIconKey(e.target.value)}
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
          placeholder="e.g., effect_burn"
        />
      </div>

      <div className="border-t border-border pt-4">
        <h3 className="text-lg font-semibold text-glow mb-3">Blueprint</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Base Magnitude *
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={baseMagnitude}
              onChange={(e) => setBaseMagnitude(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Base Duration (seconds) *
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={baseDurationSec}
              onChange={(e) => setBaseDurationSec(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              required
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={self}
              onChange={(e) => setSelf(e.target.checked)}
              className="w-4 h-4"
            />
            Self (applies to caster)
          </label>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="btn flex-1"
        >
          {saving ? (isEdit ? "Saving..." : "Creating...") : (submitLabel || (isEdit ? "Save Changes" : "Create Effect"))}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

