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
import { SidebarNav, type SidebarNavItem } from "@components/ui/SidebarNav";
import { useIdValidation } from "@/lib/hooks/useIdValidation";
import { MediaUpload, type MediaUploadRef } from "@components/ui/MediaUpload";
import { Sparkles, User, Save, X } from "lucide-react";
import { nameToId } from "@lib/utils/id-generation";
import { checkIdUniqueness } from "@lib/validation/id-validation";
import { EntryType } from "@lib/content-editor/constants";
import { toast } from "@/lib/hooks/useToast";

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

// Wrapper for checkIdUniqueness with EntryType.Spell
async function checkSpellIdUniqueness(
  id: string,
  projectId?: string,
  excludeId?: number
): Promise<{ isUnique: boolean; error?: string }> {
  return checkIdUniqueness(EntryType.Spell, id, projectId, excludeId);
}

// Validation schema
const spellSchema = z.object({
  id: z.string().optional().or(z.literal("")), // Optional - server generates for new entries
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

  const initialId = isEdit ? (initialValues.id || "") : "";

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
  const id = watch("id") || ""; // Default to empty string for new entries

  // Use reusable ID validation hook
  const { idValidation, validatingId } = useIdValidation({
    id: id || "", // Pass empty string if undefined
    isEdit,
    projectId,
    editEntryId,
    checkIdUniqueness: checkSpellIdUniqueness,
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

  // ID is now server-generated, no auto-generation needed

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
      toast.error(`Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`);
      return;
    }

    // For new entries, ID is server-generated, so skip client-side validation
    // For edit mode, ID should already be set
    if (isEdit && !data.id) {
      toast.error("ID is required for editing");
      return;
    }
    
    // Skip ID uniqueness check for new entries (server generates ID)
    // Only check if user manually provided an ID
    if (!isEdit && data.id && data.id.trim() && idValidation && !idValidation.isUnique) {
      toast.error(idValidation.error || "ID validation failed. Please choose a different ID.");
      return;
    }

    // For new entries, use a temporary placeholder ID (server will generate the real one)
    // For edit mode, ID must be provided
    const tempId = isEdit 
      ? (data.id && data.id.trim() ? data.id.trim().toLowerCase() : "")
      : (data.id && data.id.trim() ? data.id.trim().toLowerCase() : `temp-${Date.now()}`);
    
    if (isEdit && !tempId) {
      toast.error("ID is required for editing");
      return;
    }

    const spell: SpellDefinition = {
      id: tempId as any, // Temporary ID for new entries, real ID for edit mode
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

  const navItems: SidebarNavItem[] = sections.map((section) => ({
    id: section.id,
    label: section.label,
    icon: section.icon,
  }));

  return (
    <div className="flex h-full">
      {/* Sidebar Navigation */}
      <SidebarNav
        items={navItems}
        activeId={activeSection}
        onItemClick={(id) => setActiveSection(id as FormSection)}
        width="md"
        sticky={true}
      />

      {/* Form Content */}
      <div ref={formContentRef} className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6 p-6">
      {/* Basic Info and Description Sections */}
      <BasicInfoSection
        register={register}
        watch={watch}
        setValue={setValue}
        errors={errors}
        idValue={id || ""}
        idPlaceholder="e.g., ember_ray"
        isEdit={isEdit}
        idValidation={idValidation}
        validatingId={validatingId}
        onIdChange={(newId) => {
          setValue("id", newId);
        }}
        nameValue={name}
        namePlaceholder="e.g., Ember Ray"
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
    <div className="flex items-center justify-end gap-2">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-3 py-1.5 border border-border/50 text-text-secondary hover:border-border hover:text-text-primary hover:bg-deep/50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <X className="w-4 h-4" />
          <span className="text-xs font-medium">Cancel</span>
        </button>
      )}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={saving}
        className="px-3 py-1.5 bg-ember/90 hover:bg-ember border border-ember/50 text-void rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm hover:shadow-md"
      >
        <Save className="w-4 h-4" />
        <span className="text-xs font-medium">{saving ? "Saving..." : submitLabel || (isEdit ? "Update" : "Create")}</span>
      </button>
    </div>
  );
}
