// components/rune/RuneForm.tsx
// Reusable form component for creating/editing runes

"use client";

import { useState, useEffect } from "react";
import type { RuneDef } from "@/lib/packages/runes";
import type { RuneCode } from "@core/types";
import { RuneTag, CrowdControlTag, DamageType, EffectType } from "@core/enums";
import type { DamageVector } from "@core/combat";
import type { EffectBlueprint } from "@core/effects";
import { MediaUpload, type MediaUploadRef } from "@components/ui/MediaUpload";
import { TagSelector } from "@components/ui/TagSelector";
import { MultiSelectDropdown } from "@components/ui/MultiSelectDropdown";
import { IdInput } from "@components/ui/IdInput";
import { EFFECT_DEFS } from "@/lib/data/effects";
import { useRef } from "react";

interface RuneFormProps {
  initialValues?: Partial<RuneDef>;
  existingRunes?: RuneDef[];
  isEdit?: boolean;
  onSubmit: (rune: RuneDef) => void;
  onCancel?: () => void;
  saving?: boolean;
  submitLabel?: string;
  projectId?: string;
  editEntryId?: number;
}

export function RuneForm({
  initialValues = {},
  existingRunes = [],
  isEdit = false,
  onSubmit,
  onCancel,
  saving = false,
  submitLabel,
  projectId,
  editEntryId,
}: RuneFormProps) {
  const [code, setCode] = useState<RuneCode>(initialValues.code || ("A" as RuneCode));
  const [concept, setConcept] = useState(initialValues.concept || "");
  const [powerFactor, setPowerFactor] = useState(initialValues.powerFactor || 1.0);
  const [controlFactor, setControlFactor] = useState(initialValues.controlFactor || 1.0);
  const [instabilityBase, setInstabilityBase] = useState(initialValues.instabilityBase || 0.0);
  const [tags, setTags] = useState<RuneTag[]>(initialValues.tags || []);
  const [manaCost, setManaCost] = useState(initialValues.manaCost || 0);
  const [dotAffinity, setDotAffinity] = useState<number | undefined>(initialValues.dotAffinity);
  const [imageMediaId, setImageMediaId] = useState<number | undefined>(
    typeof (initialValues as any).image === 'number' 
      ? (initialValues as any).image 
      : typeof (initialValues as any).image === 'object' && (initialValues as any).image?.id
        ? (initialValues as any).image.id
        : undefined
  );
  const [imageUrl, setImageUrl] = useState<string | undefined>(
    initialValues.imagePath || 
    (typeof (initialValues as any).image === 'object' && (initialValues as any).image?.url
      ? (initialValues as any).image.url
      : undefined)
  );
  const imageUploadRef = useRef<MediaUploadRef>(null);

  // Damage vector state
  const [damage, setDamage] = useState<DamageVector>(initialValues.damage || {});
  const [damageType, setDamageType] = useState<DamageType | "">("");
  const [damageValue, setDamageValue] = useState(0);

  // CC Instant state
  const [ccInstant, setCcInstant] = useState<CrowdControlTag[]>(initialValues.ccInstant || []);

  // Penetration state
  const [pen, setPen] = useState<Partial<Record<DamageType, number>>>(initialValues.pen || {});
  const [penType, setPenType] = useState<DamageType | "">("");
  const [penValue, setPenValue] = useState(0);

  // Effects state
  const [effects, setEffects] = useState<EffectBlueprint[]>(initialValues.effects || []);
  const [selectedEffectType, setSelectedEffectType] = useState<EffectType | "">("");
  const [effectMagnitude, setEffectMagnitude] = useState(1.0);
  const [effectDuration, setEffectDuration] = useState(4);
  const [effectSelf, setEffectSelf] = useState(false);

  // Overcharge effects state
  const [overchargeEffects, setOverchargeEffects] = useState<Array<{
    minExtraMana: number;
    blueprint: EffectBlueprint;
  }>>(initialValues.overchargeEffects || []);
  const [overchargeMana, setOverchargeMana] = useState(0);
  const [overchargeEffectType, setOverchargeEffectType] = useState<EffectType | "">("");
  const [overchargeMagnitude, setOverchargeMagnitude] = useState(1.0);
  const [overchargeDuration, setOverchargeDuration] = useState(4);
  const [overchargeSelf, setOverchargeSelf] = useState(false);

  const allRuneTags = Object.values(RuneTag);
  const allDamageTypes = Object.values(DamageType);
  const allCCTags = Object.values(CrowdControlTag);
  const allEffectTypes = Object.values(EffectType);
  const allRuneCodes: RuneCode[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
  const availableCodes = allRuneCodes.filter(c => !existingRunes.some(r => r.code === c) || (isEdit && initialValues.code === c));

  const handleAddDamage = () => {
    if (damageType && damageValue > 0) {
      setDamage({ ...damage, [damageType]: damageValue });
      setDamageType("");
      setDamageValue(0);
    }
  };

  const handleRemoveDamage = (type: DamageType) => {
    const newDamage = { ...damage };
    delete newDamage[type];
    setDamage(newDamage);
  };

  const handleAddPen = () => {
    if (penType && penValue > 0) {
      setPen({ ...pen, [penType]: penValue });
      setPenType("");
      setPenValue(0);
    }
  };

  const handleRemovePen = (type: DamageType) => {
    const newPen = { ...pen };
    delete newPen[type];
    setPen(newPen);
  };

  const handleAddEffect = () => {
    if (selectedEffectType) {
      const newEffect: EffectBlueprint = {
        type: selectedEffectType,
        baseMagnitude: effectMagnitude,
        baseDurationSec: effectDuration,
        ...(effectSelf ? { self: true } : {}),
      };
      setEffects([...effects, newEffect]);
      setSelectedEffectType("");
      setEffectMagnitude(1.0);
      setEffectDuration(4);
      setEffectSelf(false);
    }
  };

  const handleRemoveEffect = (index: number) => {
    setEffects(effects.filter((_, i) => i !== index));
  };

  const handleAddOverchargeEffect = () => {
    if (overchargeEffectType && overchargeMana > 0) {
      const newOvercharge = {
        minExtraMana: overchargeMana,
        blueprint: {
          type: overchargeEffectType,
          baseMagnitude: overchargeMagnitude,
          baseDurationSec: overchargeDuration,
          ...(overchargeSelf ? { self: true } : {}),
        },
      };
      setOverchargeEffects([...overchargeEffects, newOvercharge]);
      setOverchargeMana(0);
      setOverchargeEffectType("");
      setOverchargeMagnitude(1.0);
      setOverchargeDuration(4);
      setOverchargeSelf(false);
    }
  };

  const handleRemoveOverchargeEffect = (index: number) => {
    setOverchargeEffects(overchargeEffects.filter((_, i) => i !== index));
  };


  const prepareRune = async (): Promise<RuneDef | null> => {
    if (!code || !concept.trim()) {
      alert("Code and concept are required");
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

    const rune: RuneDef = {
      code,
      concept: concept.trim(),
      powerFactor,
      controlFactor,
      instabilityBase,
      tags,
      manaCost,
      ...(Object.keys(damage).length > 0 ? { damage } : {}),
      ...(ccInstant.length > 0 ? { ccInstant } : {}),
      ...(Object.keys(pen).length > 0 ? { pen } : {}),
      ...(effects.length > 0 ? { effects } : {}),
      ...(overchargeEffects.length > 0 ? { overchargeEffects } : {}),
      ...(dotAffinity !== undefined ? { dotAffinity } : {}),
      ...(finalImageMediaId ? { imageMediaId: finalImageMediaId } : {}),
    };

    return rune;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await prepareRune();
    if (data) {
      onSubmit(data);
    }
  };

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (formRef.current) {
      (formRef.current as any).validateAndSubmit = async () => {
        const data = await prepareRune();
        if (data) {
          onSubmit(data);
        }
      };
    }
  }, [code, concept, powerFactor, controlFactor, instabilityBase, tags, manaCost, damage, ccInstant, pen, effects, overchargeEffects, dotAffinity, imageMediaId, onSubmit]);

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

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {/* Image upload inline with Code and Concept */}
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
              value={code}
              onChange={() => {}} // Read-only in edit mode
              contentType="runes"
              isEdit={true}
              placeholder="Rune Code"
              label="Code (Rune Letter)"
              disabled={true}
              projectId={projectId}
              excludeId={editEntryId}
            />
          ) : (
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1">
                Code (Rune Letter) *
              </label>
              <select
                value={code}
                onChange={(e) => setCode(e.target.value as RuneCode)}
                className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
                required
              >
                <option value="">Select a rune code</option>
                {availableCodes.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {/* Use IdInput for validation feedback - hidden input, visible validation */}
              {code && (
                <IdInput
                  value={code}
                  onChange={(id) => setCode(id as RuneCode)}
                  contentType="runes"
                  isEdit={false}
                  placeholder=""
                  label=""
                  disabled={false}
                  className="hidden"
                  projectId={projectId}
                  excludeId={isEdit ? editEntryId : undefined}
                />
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Concept (Name) *
            </label>
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              placeholder="e.g., Fire, Air, Burst"
              required
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1">
            Power Factor *
          </label>
          <input
            type="number"
            step="0.1"
            value={powerFactor}
            onChange={(e) => setPowerFactor(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1">
            Control Factor *
          </label>
          <input
            type="number"
            step="0.1"
            value={controlFactor}
            onChange={(e) => setControlFactor(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1">
            Instability Base (0-1) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={instabilityBase}
            onChange={(e) => setInstabilityBase(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1">
            Mana Cost *
          </label>
          <input
            type="number"
            step="0.1"
            value={manaCost}
            onChange={(e) => setManaCost(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          Tags *
        </label>
        <TagSelector
          selected={tags}
          options={allRuneTags}
          onChange={setTags}
          getLabel={(tag) => tag}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          DOT Affinity (0-1, optional)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="1"
          value={dotAffinity || ""}
          onChange={(e) => setDotAffinity(e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
          placeholder="Leave empty if none"
        />
      </div>

      {/* Damage Vector */}
      <div className="border-t border-border pt-4">
        <label className="block text-sm font-semibold text-text-secondary mb-2">
          Damage Vector (optional)
        </label>
        <div className="space-y-2">
          {Object.entries(damage).map(([type, value]) => (
            <div key={type} className="flex items-center gap-2">
              <span className="text-sm text-text-primary">{type}: {value}</span>
              <button
                type="button"
                onClick={() => handleRemoveDamage(type as DamageType)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <select
              value={damageType}
              onChange={(e) => setDamageType(e.target.value as DamageType | "")}
              className="flex-1 px-3 py-2 bg-deep border border-border rounded text-text-primary"
            >
              <option value="">Select damage type</option>
              {allDamageTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.1"
              value={damageValue}
              onChange={(e) => setDamageValue(parseFloat(e.target.value) || 0)}
              placeholder="Value"
              className="w-24 px-3 py-2 bg-deep border border-border rounded text-text-primary"
            />
            <button
              type="button"
              onClick={handleAddDamage}
              className="px-3 py-2 bg-ember hover:bg-ember-dark text-white rounded"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* CC Instant */}
      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          Crowd Control (Instant) (optional)
        </label>
        <MultiSelectDropdown
          selected={ccInstant}
          options={allCCTags.map(tag => ({ value: tag, label: tag }))}
          onChange={(selected) => setCcInstant(selected as CrowdControlTag[])}
          placeholder="Select CC tags"
        />
      </div>

      {/* Penetration */}
      <div className="border-t border-border pt-4">
        <label className="block text-sm font-semibold text-text-secondary mb-2">
          Penetration (optional)
        </label>
        <div className="space-y-2">
          {Object.entries(pen).map(([type, value]) => (
            <div key={type} className="flex items-center gap-2">
              <span className="text-sm text-text-primary">{type}: {value}</span>
              <button
                type="button"
                onClick={() => handleRemovePen(type as DamageType)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <select
              value={penType}
              onChange={(e) => setPenType(e.target.value as DamageType | "")}
              className="flex-1 px-3 py-2 bg-deep border border-border rounded text-text-primary"
            >
              <option value="">Select damage type</option>
              {allDamageTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.1"
              value={penValue}
              onChange={(e) => setPenValue(parseFloat(e.target.value) || 0)}
              placeholder="Value"
              className="w-24 px-3 py-2 bg-deep border border-border rounded text-text-primary"
            />
            <button
              type="button"
              onClick={handleAddPen}
              className="px-3 py-2 bg-ember hover:bg-ember-dark text-white rounded"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Effects */}
      <div className="border-t border-border pt-4">
        <label className="block text-sm font-semibold text-text-secondary mb-2">
          Effects (optional)
        </label>
        <div className="space-y-2">
          {effects.map((effect, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-deep rounded">
              <span className="text-sm text-text-primary flex-1">
                {effect.type} (mag: {effect.baseMagnitude}, dur: {effect.baseDurationSec}s{effect.self ? ", self" : ""})
              </span>
              <button
                type="button"
                onClick={() => handleRemoveEffect(index)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="space-y-2 p-3 bg-deep rounded">
            <select
              value={selectedEffectType}
              onChange={(e) => setSelectedEffectType(e.target.value as EffectType | "")}
              className="w-full px-3 py-2 bg-void border border-border rounded text-text-primary"
            >
              <option value="">Select effect type</option>
              {allEffectTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                step="0.1"
                value={effectMagnitude}
                onChange={(e) => setEffectMagnitude(parseFloat(e.target.value) || 0)}
                placeholder="Magnitude"
                className="px-3 py-2 bg-void border border-border rounded text-text-primary"
              />
              <input
                type="number"
                step="0.1"
                value={effectDuration}
                onChange={(e) => setEffectDuration(parseFloat(e.target.value) || 0)}
                placeholder="Duration (sec)"
                className="px-3 py-2 bg-void border border-border rounded text-text-primary"
              />
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={effectSelf}
                  onChange={(e) => setEffectSelf(e.target.checked)}
                />
                Self
              </label>
            </div>
            <button
              type="button"
              onClick={handleAddEffect}
              className="w-full px-3 py-2 bg-ember hover:bg-ember-dark text-white rounded"
            >
              Add Effect
            </button>
          </div>
        </div>
      </div>

      {/* Overcharge Effects */}
      <div className="border-t border-border pt-4">
        <label className="block text-sm font-semibold text-text-secondary mb-2">
          Overcharge Effects (optional)
        </label>
        <div className="space-y-2">
          {overchargeEffects.map((overcharge, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-deep rounded">
              <span className="text-sm text-text-primary flex-1">
                {overcharge.minExtraMana}+ mana: {overcharge.blueprint.type} (mag: {overcharge.blueprint.baseMagnitude}, dur: {overcharge.blueprint.baseDurationSec}s{overcharge.blueprint.self ? ", self" : ""})
              </span>
              <button
                type="button"
                onClick={() => handleRemoveOverchargeEffect(index)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="space-y-2 p-3 bg-deep rounded">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="1"
                value={overchargeMana}
                onChange={(e) => setOverchargeMana(parseInt(e.target.value) || 0)}
                placeholder="Min extra mana"
                className="px-3 py-2 bg-void border border-border rounded text-text-primary"
              />
              <select
                value={overchargeEffectType}
                onChange={(e) => setOverchargeEffectType(e.target.value as EffectType | "")}
                className="px-3 py-2 bg-void border border-border rounded text-text-primary"
              >
                <option value="">Select effect type</option>
                {allEffectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                step="0.1"
                value={overchargeMagnitude}
                onChange={(e) => setOverchargeMagnitude(parseFloat(e.target.value) || 0)}
                placeholder="Magnitude"
                className="px-3 py-2 bg-void border border-border rounded text-text-primary"
              />
              <input
                type="number"
                step="0.1"
                value={overchargeDuration}
                onChange={(e) => setOverchargeDuration(parseFloat(e.target.value) || 0)}
                placeholder="Duration (sec)"
                className="px-3 py-2 bg-void border border-border rounded text-text-primary"
              />
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={overchargeSelf}
                  onChange={(e) => setOverchargeSelf(e.target.checked)}
                />
                Self
              </label>
            </div>
            <button
              type="button"
              onClick={handleAddOverchargeEffect}
              className="w-full px-3 py-2 bg-ember hover:bg-ember-dark text-white rounded"
            >
              Add Overcharge Effect
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-border">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-4 py-2 bg-ember hover:bg-ember-dark text-white rounded-lg font-semibold disabled:opacity-50"
        >
          {saving ? "Saving..." : submitLabel || (isEdit ? "Update Rune" : "Create Rune")}
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

