// components/spell/SpellForm.tsx
// Reusable form component for creating/editing spells with React Hook Form

"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { SpellDefinition, NamedSpellBlueprint } from "@/lib/data/namedSpells";
import { SpellTag, DamageType, EffectType } from "@core/enums";
import type { RuneCode } from "@core/types";
import { AchievementFlag } from "@/lib/data/achievements";
import type { EffectBlueprint } from "@core/effects";
import { EFFECT_DEFS } from "@/lib/data/effects";
import { RuneSelector } from "@components/ui/RuneSelector";
import { TagSelector } from "@components/ui/TagSelector";
import { MultiSelectDropdown } from "@components/ui/MultiSelectDropdown";
import { RuneFamiliarityEditor } from "@components/ui/RuneFamiliarityEditor";
import { BasicInfoSection } from "@components/ui/BasicInfoSection";
import { useIdValidation } from "@/lib/hooks/useIdValidation";
import { MediaUpload, type MediaUploadRef } from "@components/ui/MediaUpload";
import { Sparkles, User } from "lucide-react";

interface SpellFormProps {
  initialValues?: Partial<SpellDefinition>;
  existingSpells?: SpellDefinition[];
  existingIds?: string[];
  isEdit?: boolean;
  onSubmit: (spell: SpellDefinition) => void;
  onCancel?: () => void;
  saving?: boolean;
  submitLabel?: string;
  projectId?: string;
  editEntryId?: number;
}

// Helper to convert name to ID (e.g., "Ember Ray" -> "ember_ray")
function nameToId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// Check ID uniqueness
async function checkIdUniqueness(
  id: string,
  projectId?: string,
  excludeId?: number
): Promise<{ isUnique: boolean; error?: string }> {
  if (!id.trim()) {
    return { isUnique: true };
  }

  const normalizedId = id.trim().toLowerCase();

  try {
    const queryParts: string[] = [];
    queryParts.push(`where[spellId][equals]=${encodeURIComponent(normalizedId)}`);
    
    if (projectId) {
      const projectIdNum = typeof projectId === 'string' ? parseInt(projectId, 10) : projectId;
      if (!isNaN(projectIdNum)) {
        queryParts.push(`where[project][equals]=${projectIdNum}`);
      }
    }
    
    if (excludeId) {
      queryParts.push(`where[id][not_equals]=${excludeId}`);
    }
    
    queryParts.push('limit=1');
    
    const queryString = queryParts.join('&');
    const url = `/api/payload/spells?${queryString}`;
    
    const res = await fetch(url);
    
    if (!res.ok) {
      return { isUnique: true };
    }
    
    const data = await res.json();
    const docs = data.docs || data.results || (Array.isArray(data) ? data : []);
    
    if (!Array.isArray(docs) || docs.length === 0) {
      return { isUnique: true };
    }
    
    const matchingDoc = docs.find((doc: any) => {
      const docSpellId = doc.spellId?.toLowerCase()?.trim();
      return docSpellId === normalizedId;
    });
    
    if (matchingDoc) {
      return { 
        isUnique: false, 
        error: `A spell with ID "${id}" already exists${projectId ? ' in this project' : ''}. Please choose a different ID.` 
      };
    }
    
    return { isUnique: true };
  } catch (error) {
    console.error("Error checking ID uniqueness:", error);
    return { isUnique: true };
  }
}

// Validation schema
const spellSchema = z.object({
  id: z.string().min(1, "ID is required").regex(/^[a-z0-9_]+$/, "ID must be lowercase letters, numbers, and underscores only"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().default(""),
  requiredRunes: z.array(z.string()).min(1, "At least one required rune is needed"),
  allowedExtraRunes: z.array(z.string()).optional(),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  hint: z.string().min(1, "Hint is required"),
  minDamageFocusType: z.string().optional(),
  minDamageFocusRatio: z.number().min(0).max(1).optional(),
  minTotalPower: z.number().min(0).optional(),
  requiresNamedSourceId: z.string().optional(),
  minTotalFamiliarityScore: z.number().min(0).optional(),
  minRuneFamiliarity: z.record(z.string(), z.number()).optional(),
  requiredFlags: z.array(z.string()).optional(),
  effects: z.array(z.any()).optional(),
  hidden: z.boolean().default(false),
  imageMediaId: z.number().optional(),
  landmarkIconMediaId: z.number().optional(),
});

type SpellFormDataInput = z.infer<typeof spellSchema>;

const allTags = Object.values(SpellTag);
const allDamageTypes = Object.values(DamageType);
const allFlags = Object.values(AchievementFlag);
const allEffectTypes = Object.values(EffectType);

// Form sections for sidebar navigation
type FormSection = "basic" | "properties";

// Get form sections
const getFormSections = (): Array<{ id: FormSection; label: string; icon: typeof User }> => {
  return [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "properties", label: "Spell Properties", icon: Sparkles },
  ];
};

export function SpellForm({
  initialValues = {},
  existingSpells = [],
  existingIds = [],
  isEdit = false,
  onSubmit,
  onCancel,
  saving = false,
  submitLabel,
  projectId,
  editEntryId,
}: SpellFormProps) {
  const [activeSection, setActiveSection] = useState<FormSection>("basic");
  const [imageMediaId, setImageMediaId] = useState<number | undefined>(
    typeof (initialValues as any).image === 'number' 
      ? (initialValues as any).image 
      : typeof (initialValues as any).image === 'object' && (initialValues as any).image?.id
        ? (initialValues as any).image.id
        : initialValues.imageId
  );
  const [imageUrl, setImageUrl] = useState<string | undefined>((initialValues as any).imagePath);
  const [landmarkIconMediaId, setLandmarkIconMediaId] = useState<number | undefined>(initialValues.landmarkIconId);
  const [landmarkIconUrl, setLandmarkIconUrl] = useState<string | undefined>(undefined);
  const imageUploadRef = useRef<MediaUploadRef | null>(null);
  const landmarkIconUploadRef = useRef<MediaUploadRef | null>(null);

  // Complex field state (not in form schema, managed separately)
  const [effects, setEffects] = useState<EffectBlueprint[]>(initialValues.effects || []);
  const [minRuneFamiliarity, setMinRuneFamiliarity] = useState<Partial<Record<RuneCode, number>>>(initialValues.minRuneFamiliarity || {});

  const initialId = isEdit ? (initialValues.id || "") : (initialValues.name ? nameToId(initialValues.name) : "");

  const form = useForm({
    resolver: zodResolver(spellSchema),
    defaultValues: {
      id: initialId,
      name: initialValues.name || "",
      description: initialValues.description || "",
      requiredRunes: initialValues.requiredRunes || [],
      allowedExtraRunes: initialValues.allowedExtraRunes || [],
      tags: initialValues.tags || [],
      hint: initialValues.hint || "",
      minDamageFocusType: initialValues.minDamageFocus?.type || "",
      minDamageFocusRatio: initialValues.minDamageFocus?.ratio || 0.5,
      minTotalPower: initialValues.minTotalPower,
      requiresNamedSourceId: initialValues.requiresNamedSourceId || "",
      minTotalFamiliarityScore: initialValues.minTotalFamiliarityScore,
      minRuneFamiliarity: initialValues.minRuneFamiliarity || {},
      requiredFlags: initialValues.requiredFlags || [],
      effects: initialValues.effects || [],
      hidden: initialValues.hidden || false,
      imageMediaId,
      landmarkIconMediaId,
    },
  });

  const { register, handleSubmit, watch, setValue, setError, clearErrors, formState: { errors } } = form;
  const name = watch("name");
  const id = watch("id");

  // Use reusable ID validation hook
  const { idValidation, validatingId } = useIdValidation({
    id,
    isEdit,
    projectId,
    editEntryId,
    checkIdUniqueness,
    setError,
    clearErrors,
  });

  // Fetch image URLs when editing
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

  useEffect(() => {
    if (landmarkIconMediaId && isEdit) {
      fetch(`/api/payload/media/${landmarkIconMediaId}`)
        .then(res => res.json())
        .then(data => {
          if (data.url) {
            const url = data.url;
            if (url.startsWith('http://localhost') || url.startsWith('https://')) {
              try {
                const urlObj = new URL(url);
                setLandmarkIconUrl(urlObj.pathname);
              } catch {
                setLandmarkIconUrl(url);
              }
            } else {
              setLandmarkIconUrl(url.startsWith('/') ? url : `/${url}`);
            }
          }
        })
        .catch(err => console.error("Failed to fetch landmark icon:", err));
    } else if (!landmarkIconMediaId) {
      setLandmarkIconUrl(undefined);
    }
  }, [landmarkIconMediaId, isEdit]);

  // Auto-generate ID from name
  useEffect(() => {
    if (!isEdit && name && !id) {
      const generatedId = nameToId(name);
      setValue("id", generatedId);
    }
  }, [name, isEdit, id, setValue]);

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
    ? existingSpells.filter(s => s.id !== (initialValues as SpellDefinition).id)
    : existingSpells;

  const onSubmitForm = async (data: SpellFormDataInput) => {
    // Upload pending images before submitting
    let finalImageMediaId = imageMediaId;
    let finalLandmarkIconMediaId = landmarkIconMediaId;
    try {
      if (imageUploadRef.current) {
        const uploadedId = await imageUploadRef.current.uploadFile();
        if (uploadedId) {
          finalImageMediaId = uploadedId;
        }
      }
      if (landmarkIconUploadRef.current) {
        const uploadedId = await landmarkIconUploadRef.current.uploadFile();
        if (uploadedId) {
          finalLandmarkIconMediaId = uploadedId;
        }
      }
    } catch (error) {
      alert(`Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`);
      return;
    }

    // Check ID validation one more time before submitting
    if (!isEdit && idValidation && !idValidation.isUnique) {
      alert(idValidation.error || "ID validation failed. Please choose a different ID.");
      return;
    }

    const spell: SpellDefinition = {
      id: data.id.trim() as any,
      name: data.name.trim(),
      description: data.description?.trim() || "A powerful spell.",
      tags: data.tags as SpellTag[],
      requiredRunes: data.requiredRunes as RuneCode[],
      allowedExtraRunes: data.allowedExtraRunes && data.allowedExtraRunes.length > 0 ? data.allowedExtraRunes as RuneCode[] : undefined,
      minDamageFocus: data.minDamageFocusType ? {
        type: data.minDamageFocusType as DamageType,
        ratio: data.minDamageFocusRatio || 0.5,
      } : undefined,
      minTotalPower: data.minTotalPower,
      requiresNamedSourceId: data.requiresNamedSourceId ? (data.requiresNamedSourceId as any) : undefined,
      minRuneFamiliarity: Object.keys(minRuneFamiliarity).length > 0 ? minRuneFamiliarity : undefined,
      minTotalFamiliarityScore: data.minTotalFamiliarityScore,
      requiredFlags: data.requiredFlags && data.requiredFlags.length > 0 ? data.requiredFlags as AchievementFlag[] : undefined,
      effects: effects.length > 0 ? effects : undefined,
      imageId: finalImageMediaId,
      landmarkIconId: finalLandmarkIconMediaId,
      hidden: data.hidden,
      hint: data.hint.trim() || "Try experimenting with different rune combinations.",
    };

    onSubmit(spell);
  };

  // Scroll to section when active section changes
  useEffect(() => {
    const sectionElement = document.getElementById(`section-${activeSection}`);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeSection]);

  // Track active section based on scroll position
  const formContentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const formContent = formContentRef.current;
    if (!formContent) return;

    const handleScroll = () => {
      const sections = getFormSections();
      const scrollPosition = formContent.scrollTop + 100; // Offset for sticky header

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const element = document.getElementById(`section-${section.id}`);
        if (element && formContent.contains(element)) {
          const offsetTop = element.offsetTop - formContent.offsetTop;
          if (scrollPosition >= offsetTop) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    formContent.addEventListener("scroll", handleScroll);
    return () => formContent.removeEventListener("scroll", handleScroll);
  }, []);

  const sections = getFormSections();

  return (
    <div className="flex h-full">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-border bg-shadow flex-shrink-0">
        <nav className="p-4 space-y-1 sticky top-0">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-deep text-ember-glow"
                    : "text-text-muted hover:text-text-primary hover:bg-deep/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{section.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Form Content */}
      <div ref={formContentRef} className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6 p-6">
      {/* Basic Info and Description Sections */}
      <BasicInfoSection
        register={register}
        watch={watch}
        setValue={setValue}
        errors={errors}
        idValue={id}
        idPlaceholder="e.g., ember_ray"
        isEdit={isEdit}
        idValidation={idValidation}
        validatingId={validatingId}
        onIdChange={(newId) => {
          setValue("id", newId);
        }}
        nameValue={name}
        namePlaceholder="e.g., Ember Ray"
        autoGenerateIdFromName={true}
        descriptionValue={watch("description") || ""}
        descriptionPlaceholder="A focused beam of searing flame..."
        imageMediaId={imageMediaId}
        imageUrl={imageUrl}
        onImageUploaded={(mediaId) => {
          setImageMediaId(mediaId);
          setValue("imageMediaId", mediaId);
          if (!mediaId) {
            setImageUrl(undefined);
          }
        }}
        imageUploadRef={imageUploadRef}
        landmarkIconMediaId={landmarkIconMediaId}
        landmarkIconUrl={landmarkIconUrl}
        onLandmarkIconUploaded={(mediaId) => {
          setLandmarkIconMediaId(mediaId);
          setValue("landmarkIconMediaId", mediaId);
          if (!mediaId) {
            setLandmarkIconUrl(undefined);
          }
        }}
        landmarkIconUploadRef={landmarkIconUploadRef}
        showLandmarkIcon={true}
        saving={saving}
        projectId={projectId}
        editEntryId={editEntryId}
      />

      {/* Spell-Specific Fields */}
      <section id="section-properties" className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-ember-glow" />
          <h2 className="text-xl font-bold text-glow">Spell Properties</h2>
        </div>

        <RuneSelector
          selected={watch("requiredRunes") as RuneCode[]}
          onChange={(runes) => setValue("requiredRunes", runes)}
          label="Required Runes"
          required
        />
        {errors.requiredRunes && (
          <p className="text-xs text-red-500 mt-1">{errors.requiredRunes.message as string}</p>
        )}

        <RuneSelector
          selected={(watch("allowedExtraRunes") || []) as RuneCode[]}
          onChange={(runes) => setValue("allowedExtraRunes", runes as string[])}
          label="Allowed Extra Runes (optional)"
          disabled={watch("requiredRunes")}
        />

        <div>
          <TagSelector
            options={allTags}
            selected={watch("tags") as SpellTag[]}
            onChange={(tags) => setValue("tags", tags)}
            getLabel={(tag) => tag}
            label="Tags"
            required
          />
          {errors.tags && (
            <p className="text-xs text-red-500 mt-1">{errors.tags.message as string}</p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
            <span>Hint</span>
            <span className="text-ember">*</span>
          </label>
          <textarea
            {...register("hint")}
            className={`w-full px-3 py-2 bg-deep border rounded text-text-primary min-h-[60px] ${
              errors.hint ? "border-red-500" : "border-border"
            }`}
            rows={2}
            placeholder="Try weaving fire, air, and ray runes..."
          />
          {errors.hint && (
            <p className="text-xs text-red-500 mt-1">{errors.hint.message as string}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
              <span>Min Damage Focus Type</span>
            </label>
            <select
              {...register("minDamageFocusType")}
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
          {watch("minDamageFocusType") && (
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
                <span>Min Damage Focus Ratio</span>
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.05"
                {...register("minDamageFocusRatio", { valueAsNumber: true })}
                className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              />
              <p className="text-xs text-text-muted mt-1">
                {((watch("minDamageFocusRatio") || 0) * 100).toFixed(0)}%
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
            <span>Min Total Power (optional)</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            {...register("minTotalPower", { valueAsNumber: true })}
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
            placeholder="e.g., 1.0"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
            <span>Requires Named Source (optional)</span>
          </label>
          <select
            {...register("requiresNamedSourceId")}
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
          <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
            <span>Min Total Familiarity Score (optional)</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            {...register("minTotalFamiliarityScore", { valueAsNumber: true })}
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
            placeholder="e.g., 1.0"
          />
        </div>

        <div>
          <MultiSelectDropdown
            options={allFlags.map(flag => ({ value: flag, label: flag }))}
            selected={watch("requiredFlags") as AchievementFlag[] || []}
            onChange={(selected) => setValue("requiredFlags", selected)}
            label="Required Achievement Flags (optional)"
            placeholder="Select achievement flags..."
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-2">
            <span>Effects (optional)</span>
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
            {...register("hidden")}
            className="w-4 h-4"
          />
          <label htmlFor="hidden" className="text-sm text-text-secondary">
            Hidden (not shown until discovered)
          </label>
        </div>
      </section>
        </form>
      </div>
    </div>
  );
}

export function SpellFormFooter({
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
    const form = document.querySelector('form') as HTMLFormElement;
    if (form) {
      form.requestSubmit();
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
        {saving ? "Saving..." : submitLabel || (isEdit ? "Update Spell" : "Create Spell")}
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
