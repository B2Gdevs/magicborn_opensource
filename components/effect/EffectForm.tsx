// components/effect/EffectForm.tsx
// Reusable form component for creating/editing effects

"use client";

import { useState, useEffect, useRef } from "react";
import type { EffectDefinition } from "@/lib/data/effects";
import { EffectCategory } from "@/lib/data/effects";
import { EffectType } from "@core/enums";
import type { EffectBlueprint } from "@core/effects";
import { MediaUpload, type MediaUploadRef } from "@components/ui/MediaUpload";
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
  const [imageMediaId, setImageMediaId] = useState<number | undefined>(
    typeof (initialValues as any).image === 'number' 
      ? (initialValues as any).image 
      : typeof (initialValues as any).image === 'object' && (initialValues as any).image?.id
        ? (initialValues as any).image.id
        : undefined
  );
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialValues.imagePath);
  const imageUploadRef = useRef<MediaUploadRef>(null);

  const allCategories = Object.values(EffectCategory);
  const allEffectTypes = Object.values(EffectType);
  const availableEffectTypes = allEffectTypes.filter(type => !existingIds.includes(type));

  // Fetch image URL when editing (only on mount, not after uploads)
  useEffect(() => {
    if (imageMediaId && isEdit) {
      fetch(`/api/payload/media/${imageMediaId}`)
        .then(res => res.json())
        .then(data => {
          if (data.url) {
            const url = data.url;
            if (url.startsWith('http://localhost') || url.startsWith('https://')) {
              try {
                const urlObj = new URL(url);
                setImageUrl(urlObj.pathname);
              } catch {
                setImageUrl(url);
              }
            } else {
              setImageUrl(url.startsWith('/') ? url : `/${url}`);
            }
          }
        })
        .catch(err => console.error("Failed to fetch image:", err));
    } else if (!imageMediaId) {
      setImageUrl(undefined);
    }
  }, [imageMediaId, isEdit]);

  const formRef = useRef<HTMLFormElement>(null);

  // Validate and prepare effect data
  const prepareEffect = async (): Promise<EffectDefinition | null> => {
    if (!id.trim()) {
      alert("ID (Effect Type) is required");
      return null;
    }
    
    if (!name.trim()) {
      alert("Name is required");
      return null;
    }
    
    // ID validation is handled by IdInput component
    
    if (baseMagnitude <= 0) {
      alert("Base magnitude must be greater than 0");
      return null;
    }
    
    if (baseDurationSec <= 0) {
      alert("Base duration must be greater than 0");
      return null;
    }

    // Upload pending image before submitting
    let finalImageMediaId = imageMediaId;
    try {
      if (imageUploadRef.current) {
        const uploadedId = await imageUploadRef.current.uploadFile();
        if (uploadedId) {
          finalImageMediaId = uploadedId;
        }
      }
    } catch (error) {
      alert(`Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`);
      return null;
    }

    const blueprint: EffectBlueprint = {
      type: id as EffectType,
      baseMagnitude,
      baseDurationSec,
      self: self || undefined,
    };

    return {
      ...(initialValues as EffectDefinition),
      id: id as EffectType,
      name: name.trim(),
      description: description.trim(),
      category,
      isBuff,
      blueprint,
      iconKey: iconKey.trim() || undefined,
      maxStacks: maxStacks && maxStacks > 0 ? maxStacks : undefined,
      imageId: finalImageMediaId, // Payload Media ID
    };
  };

  // Expose validation function for external submission (used by footer)
  useEffect(() => {
    if (formRef.current) {
      (formRef.current as any).validateAndSubmit = async () => {
        const effect = await prepareEffect();
        if (effect) {
          onSubmit(effect);
        }
      };
    }
  }, [id, name, description, category, isBuff, iconKey, maxStacks, baseMagnitude, baseDurationSec, self, imageMediaId, onSubmit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effect = await prepareEffect();
    if (effect) {
      onSubmit(effect);
    }
  };

  // Helper to convert name to ID (e.g., "Ember Ray" -> "ember_ray")
  function nameToId(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {/* Image upload inline with ID and Name */}
      <div className="flex gap-4 items-start">
        <MediaUpload
          ref={imageUploadRef}
          currentMediaId={imageMediaId}
          currentMediaUrl={imageUrl}
          onMediaUploaded={(mediaId) => {
            setImageMediaId(mediaId);
            if (!mediaId) {
              setImageUrl(undefined);
            }
          }}
          label=""
          disabled={saving}
          inline
        />
        <div className="flex-1 space-y-4">
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
        </div>
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
    </form>
  );
}

export function EffectFormFooter({
  isEdit,
  saving,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  isEdit: boolean;
  saving: boolean;
  submitLabel?: string;
  onCancel?: () => void;
  onSubmit: () => void;
}) {
  const handleSubmit = async () => {
    // Find the form and call its validateAndSubmit method
    const form = document.querySelector('form') as HTMLFormElement & { validateAndSubmit?: () => Promise<void> };
    if (form?.validateAndSubmit) {
      await form.validateAndSubmit();
    } else {
      onSubmit();
    }
  };

  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={handleSubmit}
        disabled={saving}
        className="flex-1 px-4 py-2 bg-ember hover:bg-ember-dark text-white rounded-lg font-semibold disabled:opacity-50"
      >
        {saving ? "Saving..." : submitLabel || (isEdit ? "Update Effect" : "Create Effect")}
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
  );
}

