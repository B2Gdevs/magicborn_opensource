// components/spell/SpellForm.tsx
// Reusable form component for creating/editing spells

"use client";

import { useState, useEffect, useRef } from "react";
import type { NamedSpellBlueprint } from "@/lib/data/namedSpells";
import { SpellTag, DamageType, EffectType } from "@core/enums";
import type { RuneCode } from "@core/types";
import { AchievementFlag } from "@/lib/data/achievements";
import type { EffectBlueprint } from "@core/effects";
import { EFFECT_DEFS } from "@/lib/data/effects";
import { RuneSelector } from "@components/ui/RuneSelector";
import { TagSelector } from "@components/ui/TagSelector";
import { MultiSelectDropdown } from "@components/ui/MultiSelectDropdown";
import { RuneFamiliarityEditor } from "@components/ui/RuneFamiliarityEditor";
import { MediaUpload, type MediaUploadRef } from "@components/ui/MediaUpload";
import { IdInput } from "@components/ui/IdInput";

interface SpellFormProps {
  initialValues?: Partial<NamedSpellBlueprint>;
  existingSpells?: NamedSpellBlueprint[];
  existingIds?: string[];
  isEdit?: boolean;
  onSubmit: (spell: NamedSpellBlueprint) => void;
  onCancel?: () => void;
  saving?: boolean;
  submitLabel?: string;
}

export function SpellForm({
  initialValues = {},
  existingSpells = [],
  existingIds = [],
  isEdit = false,
  onSubmit,
  onCancel,
  saving = false,
  submitLabel,
}: SpellFormProps) {
  const [name, setName] = useState(initialValues.name || "");
  const [description, setDescription] = useState(initialValues.description || "");
  const [requiredRunes, setRequiredRunes] = useState<RuneCode[]>(initialValues.requiredRunes || []);
  const [allowedExtraRunes, setAllowedExtraRunes] = useState<RuneCode[]>(initialValues.allowedExtraRunes || []);
  const [tags, setTags] = useState<SpellTag[]>(initialValues.tags || []);
  const [hidden, setHidden] = useState(initialValues.hidden || false);
  const [hint, setHint] = useState(initialValues.hint || "");
  const [minDamageFocusType, setMinDamageFocusType] = useState<DamageType | "">(initialValues.minDamageFocus?.type || "");
  const [minDamageFocusRatio, setMinDamageFocusRatio] = useState(initialValues.minDamageFocus?.ratio || 0.5);
  const [minTotalPower, setMinTotalPower] = useState<number | undefined>(initialValues.minTotalPower);
  const [requiresNamedSourceId, setRequiresNamedSourceId] = useState<string>(initialValues.requiresNamedSourceId || "");
  const [minTotalFamiliarityScore, setMinTotalFamiliarityScore] = useState<number | undefined>(initialValues.minTotalFamiliarityScore);
  const [minRuneFamiliarity, setMinRuneFamiliarity] = useState<Partial<Record<RuneCode, number>>>(initialValues.minRuneFamiliarity || {});
  const [requiredFlags, setRequiredFlags] = useState<AchievementFlag[]>(initialValues.requiredFlags || []);
  const [effects, setEffects] = useState<EffectBlueprint[]>(initialValues.effects || []);
  const [imageMediaId, setImageMediaId] = useState<number | undefined>(
    typeof (initialValues as any).image === 'number' 
      ? (initialValues as any).image 
      : typeof (initialValues as any).image === 'object' && (initialValues as any).image?.id
        ? (initialValues as any).image.id
        : undefined
  );
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialValues.imagePath);
  const imageUploadRef = useRef<MediaUploadRef>(null);
  
  // Generate ID from name
  const generatedId = name.trim() ? nameToId(name) : "";

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

  const allTags = Object.values(SpellTag);
  const allDamageTypes = Object.values(DamageType);
  const allFlags = Object.values(AchievementFlag);
  const allEffectTypes = Object.values(EffectType);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert("Name is required");
      return;
    }
    
    // ID validation is handled by IdInput component
    
    if (requiredRunes.length === 0) {
      alert("At least one required rune is needed");
      return;
    }
    
    if (tags.length === 0) {
      alert("At least one tag is required");
      return;
    }
    
    if (!hint.trim()) {
      alert("Hint is required");
      return;
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
      return;
    }

    const spell: NamedSpellBlueprint & { image?: number } = {
      ...(initialValues as NamedSpellBlueprint),
      id: isEdit ? (initialValues as NamedSpellBlueprint).id : (nameToId(name) as any),
      name: name.trim(),
      description: description.trim() || "A powerful spell.",
      tags,
      requiredRunes,
      allowedExtraRunes: allowedExtraRunes.length > 0 ? allowedExtraRunes : undefined,
      minDamageFocus: minDamageFocusType ? {
        type: minDamageFocusType as DamageType,
        ratio: minDamageFocusRatio,
      } : undefined,
      minTotalPower,
      requiresNamedSourceId: requiresNamedSourceId ? (requiresNamedSourceId as any) : undefined,
      minRuneFamiliarity: Object.keys(minRuneFamiliarity).length > 0 ? minRuneFamiliarity : undefined,
      minTotalFamiliarityScore,
      requiredFlags: requiredFlags.length > 0 ? requiredFlags : undefined,
      effects: effects.length > 0 ? effects : undefined,
      imagePath: imageUrl || undefined, // Keep for backward compatibility
      image: finalImageMediaId, // Payload Media ID
      hidden,
      hint: hint.trim() || "Try experimenting with different rune combinations.",
    };
    
    onSubmit(spell);
  };

  const addEffect = (effectType: EffectType) => {
    const def = EFFECT_DEFS[effectType];
    const newEffect: EffectBlueprint = {
      type: effectType,
      baseMagnitude: def.blueprint.baseMagnitude,
      baseDurationSec: def.blueprint.baseDurationSec,
      self: def.blueprint.self,
    };
    setEffects([...effects, newEffect]);
  };

  const removeEffect = (index: number) => {
    setEffects(effects.filter((_, i) => i !== index));
  };

  const updateEffect = (index: number, updates: Partial<EffectBlueprint>) => {
    const updated = effects.map((eff, i) => 
      i === index ? { ...eff, ...updates } : eff
    );
    setEffects(updated);
  };

  const filteredSpells = isEdit 
    ? existingSpells.filter(s => s.id !== (initialValues as NamedSpellBlueprint).id)
    : existingSpells;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        label="Spell Image"
        disabled={saving}
        compact
      />

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
          placeholder="e.g., Ember Ray"
          required
        />
      </div>

      {/* Show generated ID with validation */}
      {!isEdit && (
        <IdInput
          value={generatedId}
          onChange={() => {}} // Read-only, generated from name
          contentType="spells"
          isEdit={false}
          placeholder="Auto-generated from name"
          label="ID (auto-generated from name)"
          disabled={true}
        />
      )}
      {isEdit && (
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1">
            ID
          </label>
          <input
            type="text"
            value={(initialValues as NamedSpellBlueprint).id}
            disabled
            className="w-full px-3 py-2 bg-deep/50 border border-border rounded text-text-muted cursor-not-allowed"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          Description *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
          rows={3}
          placeholder="A focused beam of searing flame..."
        />
      </div>

      <RuneSelector
        selected={requiredRunes}
        onChange={setRequiredRunes}
        label="Required Runes"
        required
      />

      <RuneSelector
        selected={allowedExtraRunes}
        onChange={setAllowedExtraRunes}
        label="Allowed Extra Runes (optional)"
        disabled={requiredRunes}
      />

      <TagSelector
        options={allTags}
        selected={tags}
        onChange={setTags}
        label="Tags"
        required
      />

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          Hint *
        </label>
        <textarea
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
          rows={2}
          placeholder="Try weaving fire, air, and ray runes..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1">
            Min Damage Focus Type
          </label>
          <select
            value={minDamageFocusType}
            onChange={(e) => setMinDamageFocusType(e.target.value as DamageType | "")}
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
          >
            <option value="">None</option>
            {allDamageTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
        {minDamageFocusType && (
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Min Damage Focus Ratio
            </label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={minDamageFocusRatio}
              onChange={(e) => setMinDamageFocusRatio(parseFloat(e.target.value))}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
            />
            <p className="text-xs text-text-muted mt-1">
              {(minDamageFocusRatio * 100).toFixed(0)}%
            </p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          Min Total Power (optional)
        </label>
        <input
          type="number"
          min="0"
          step="0.1"
          value={minTotalPower || ""}
          onChange={(e) => setMinTotalPower(e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
          placeholder="e.g., 1.0"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          Requires Named Source (optional)
        </label>
        <select
          value={requiresNamedSourceId}
          onChange={(e) => setRequiresNamedSourceId(e.target.value)}
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
        >
          <option value="">None</option>
          {filteredSpells.map((spell) => (
            <option key={spell.id} value={spell.id}>
              {spell.name}
            </option>
          ))}
        </select>
      </div>

      <RuneFamiliarityEditor
        value={minRuneFamiliarity}
        onChange={setMinRuneFamiliarity}
        label="Min Rune Familiarity (optional)"
      />

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          Min Total Familiarity Score (optional)
        </label>
        <input
          type="number"
          min="0"
          step="0.1"
          value={minTotalFamiliarityScore || ""}
          onChange={(e) => setMinTotalFamiliarityScore(e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
          placeholder="e.g., 1.0"
        />
      </div>

      <MultiSelectDropdown
        options={allFlags.map(flag => ({ value: flag, label: flag }))}
        selected={requiredFlags}
        onChange={(selected) => setRequiredFlags(selected as AchievementFlag[])}
        label="Required Achievement Flags (optional)"
        placeholder="Select achievement flags..."
      />

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-2">
          Effects (optional)
        </label>
        <div className="mb-3">
          <label className="block text-xs text-text-muted mb-1">Add Effect:</label>
          <div className="flex flex-wrap gap-2">
            {allEffectTypes.map((effectType) => {
              const def = EFFECT_DEFS[effectType];
              const isAdded = effects.some(e => e.type === effectType);
              return (
                <button
                  key={effectType}
                  type="button"
                  onClick={() => !isAdded && addEffect(effectType)}
                  disabled={isAdded}
                  className={`px-3 py-1 rounded text-sm ${
                    isAdded
                      ? "bg-deep/50 border border-border/50 text-text-muted cursor-not-allowed"
                      : "bg-deep border border-border text-text-secondary hover:border-ember/50"
                  }`}
                  title={def.description}
                >
                  {def.name}
                </button>
              );
            })}
          </div>
        </div>
        
        {effects.length > 0 && (
          <div className="space-y-3 border border-border rounded-lg p-3 bg-deep/30">
            {effects.map((effect, index) => {
              const def = EFFECT_DEFS[effect.type];
              return (
                <div key={index} className="border border-border rounded p-3 bg-deep">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-ember-glow">{def.name}</span>
                      <span className="text-xs text-text-muted ml-2">({def.description})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEffect(index)}
                      className="text-red-500 hover:text-red-400 text-sm"
                    >
                      ✕ Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-text-muted mb-1">Magnitude</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={effect.baseMagnitude}
                        onChange={(e) => updateEffect(index, { baseMagnitude: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1 bg-deep border border-border rounded text-sm text-text-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted mb-1">Duration (sec)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={effect.baseDurationSec}
                        onChange={(e) => updateEffect(index, { baseDurationSec: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1 bg-deep border border-border rounded text-sm text-text-primary"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 text-xs text-text-secondary">
                        <input
                          type="checkbox"
                          checked={effect.self || false}
                          onChange={(e) => updateEffect(index, { self: e.target.checked })}
                          className="w-4 h-4"
                        />
                        Self (applies to caster)
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="hidden"
          checked={hidden}
          onChange={(e) => setHidden(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="hidden" className="text-sm text-text-secondary">
          Hidden (not shown until discovered)
        </label>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="btn flex-1"
        >
          {saving ? (isEdit ? "Saving..." : "Creating...") : (submitLabel || (isEdit ? "Save Changes" : "Create Spell"))}
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

// Helper to convert name to ID (e.g., "Ember Ray" -> "ember_ray")
function nameToId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

