// components/effect/EffectForm.tsx
// Reusable form component for creating/editing effects

"use client";

import { useState, useEffect } from "react";
import type { EffectDefinition } from "@/lib/data/effects";
import { EffectCategory } from "@/lib/data/effects";
import { EffectType } from "@core/enums";
import type { EffectBlueprint } from "@core/effects";
import { ImageUpload } from "@components/ui/ImageUpload";
import { IdInput } from "@components/ui/IdInput";

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

  const allCategories = Object.values(EffectCategory);
  const allEffectTypes = Object.values(EffectType);
  const availableEffectTypes = allEffectTypes.filter(type => !existingIds.includes(type));

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
    
    // ID validation is handled by IdInput component
    
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
        compact
      />

      {isEdit ? (
        <IdInput
          value={id}
          onChange={() => {}} // Read-only in edit mode
          contentType="effects"
          isEdit={true}
          placeholder="Effect Type ID"
          label="ID (Effect Type)"
          disabled={true}
        />
      ) : (
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1">
            ID (Effect Type) *
          </label>
          {availableEffectTypes.length > 0 && (
            <select
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary mb-2"
            >
              <option value="">Or type a custom ID below</option>
              {availableEffectTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          )}
          <IdInput
            value={id}
            onChange={setId}
            contentType="effects"
            isEdit={false}
            placeholder={availableEffectTypes.length > 0 ? "Or enter a custom effect type ID (e.g., freeze, curse)" : "Enter effect type ID (e.g., burn, freeze, curse)"}
            label={availableEffectTypes.length > 0 ? "Custom ID" : "ID (Effect Type)"}
            autoGenerateFrom={name}
            disabled={saving}
          />
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
          <p className="text-xs text-text-muted mt-1">
            The effect type ID is a unique identifier used in the game code (e.g., "burn", "freeze", "shield"). Use lowercase with underscores.
          </p>
        </div>
      )}

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

