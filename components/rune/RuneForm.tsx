// components/rune/RuneForm.tsx
// Reusable form component for creating/editing runes with React Hook Form

"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { RuneDef } from "@/lib/packages/runes";
import type { RuneCode } from "@core/types";
import { RuneTag, CrowdControlTag, DamageType, EffectType } from "@core/enums";
import type { DamageVector } from "@core/combat";
import type { EffectBlueprint } from "@core/effects";
import { MediaUpload, type MediaUploadRef } from "@components/ui/MediaUpload";
import { TagSelector } from "@components/ui/TagSelector";
import { MultiSelectDropdown } from "@components/ui/MultiSelectDropdown";
import { BasicInfoSection } from "@components/ui/BasicInfoSection";
import { useIdValidation } from "@/lib/hooks/useIdValidation";
import { Sparkles, User } from "lucide-react";

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

// Validation schema
const runeSchema = z.object({
  id: z.string().min(1, "ID is required").regex(/^[a-z0-9_]+$/, "ID must be lowercase letters, numbers, and underscores only"),
  name: z.string().min(1, "Name is required"), // Maps to "concept" for runes
  code: z.string().length(1, "Code must be a single letter").regex(/^[A-Z]$/, "Code must be an uppercase letter A-Z"),
  description: z.string().optional().default(""),
  powerFactor: z.number().min(0).max(2),
  controlFactor: z.number().min(0).max(2),
  instabilityBase: z.number().min(0).max(1),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  manaCost: z.number().min(0),
  dotAffinity: z.number().min(0).max(1).optional(),
  imageMediaId: z.number().optional(),
  landmarkIconMediaId: z.number().optional(),
  // Complex fields stored as JSON in Payload
  damage: z.record(z.string(), z.number()).optional(),
  ccInstant: z.array(z.string()).optional(),
  pen: z.record(z.string(), z.number()).optional(),
  effects: z.array(z.any()).optional(),
  overchargeEffects: z.array(z.any()).optional(),
});

type RuneFormDataInput = z.infer<typeof runeSchema>;

const allRuneTags = Object.values(RuneTag);
const allDamageTypes = Object.values(DamageType);
const allCCTags = Object.values(CrowdControlTag);
const allEffectTypes = Object.values(EffectType);
const allRuneCodes: RuneCode[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

// Form sections for sidebar navigation
type FormSection = "basic" | "properties";

// Get form sections
const getFormSections = (): Array<{ id: FormSection; label: string; icon: typeof User }> => {
  return [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "properties", label: "Rune Properties", icon: Sparkles },
  ];
};

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
    queryParts.push(`where[slug][equals]=${encodeURIComponent(normalizedId)}`);
    
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
    const url = `/api/payload/runes?${queryString}`;
    
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
      const docSlug = doc.slug?.toLowerCase()?.trim();
      return docSlug === normalizedId;
    });
    
    if (matchingDoc) {
      return { 
        isUnique: false, 
        error: `A rune with ID "${id}" already exists${projectId ? ' in this project' : ''}. Please choose a different ID.` 
      };
    }
    
    return { isUnique: true };
  } catch (error) {
    console.error("Error checking ID uniqueness:", error);
    return { isUnique: true };
  }
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
  const [activeSection, setActiveSection] = useState<FormSection>("basic");
  const [imageMediaId, setImageMediaId] = useState<number | undefined>(initialValues.imageId);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [landmarkIconMediaId, setLandmarkIconMediaId] = useState<number | undefined>(initialValues.landmarkIconId);
  const [landmarkIconUrl, setLandmarkIconUrl] = useState<string | undefined>(undefined);
  const imageUploadRef = useRef<MediaUploadRef | null>(null);
  const landmarkIconUploadRef = useRef<MediaUploadRef | null>(null);

  // Complex field state (not in form schema, managed separately)
  const [damage, setDamage] = useState<DamageVector>(initialValues.damage || {});
  const [damageType, setDamageType] = useState<DamageType | "">("");
  const [damageValue, setDamageValue] = useState(0);
  const [ccInstant, setCcInstant] = useState<CrowdControlTag[]>(initialValues.ccInstant || []);
  const [pen, setPen] = useState<Partial<Record<DamageType, number>>>(initialValues.pen || {});
  const [penType, setPenType] = useState<DamageType | "">("");
  const [penValue, setPenValue] = useState(0);
  const [effects, setEffects] = useState<EffectBlueprint[]>(initialValues.effects || []);
  const [selectedEffectType, setSelectedEffectType] = useState<EffectType | "">("");
  const [effectMagnitude, setEffectMagnitude] = useState(1.0);
  const [effectDuration, setEffectDuration] = useState(4);
  const [effectSelf, setEffectSelf] = useState(false);
  const [overchargeEffects, setOverchargeEffects] = useState<Array<{
    minExtraMana: number;
    blueprint: EffectBlueprint;
  }>>(initialValues.overchargeEffects || []);
  const [overchargeMana, setOverchargeMana] = useState(0);
  const [overchargeEffectType, setOverchargeEffectType] = useState<EffectType | "">("");
  const [overchargeMagnitude, setOverchargeMagnitude] = useState(1.0);
  const [overchargeDuration, setOverchargeDuration] = useState(4);
  const [overchargeSelf, setOverchargeSelf] = useState(false);

  const availableCodes = allRuneCodes.filter(c => !existingRunes.some(r => r.code === c) || (isEdit && initialValues.code === c));

  // Initialize ID from code or generate from concept/name
  const conceptOrName = (initialValues as any).concept || (initialValues as any).name || "";
  const initialId = initialValues.id || (initialValues.code ? initialValues.code.toLowerCase() : (conceptOrName ? conceptOrName.toLowerCase().replace(/[^a-z0-9]+/g, "_") : ""));

  const form = useForm({
    resolver: zodResolver(runeSchema),
    defaultValues: {
      id: initialId,
      name: initialValues.concept || "", // Map concept to name for BasicInfoSection
      code: initialValues.code || ("A" as RuneCode),
      description: initialValues.description || "",
      powerFactor: initialValues.powerFactor || 1.0,
      controlFactor: initialValues.controlFactor || 1.0,
      instabilityBase: initialValues.instabilityBase || 0.0,
      tags: initialValues.tags || [],
      manaCost: initialValues.manaCost || 0,
      dotAffinity: initialValues.dotAffinity,
      imageMediaId,
      landmarkIconMediaId,
      damage: initialValues.damage || {},
      ccInstant: initialValues.ccInstant || [],
      pen: initialValues.pen || {},
      effects: initialValues.effects || [],
      overchargeEffects: initialValues.overchargeEffects || [],
    },
  });

  const { register, handleSubmit, watch, setValue, setError, clearErrors, formState: { errors } } = form;
  const id = watch("id");
  const name = watch("name"); // Name maps to concept for runes
  const code = watch("code");

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
            setImageUrl(data.url);
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
            setLandmarkIconUrl(data.url);
          }
        })
        .catch(err => console.error("Failed to fetch landmark icon:", err));
    } else if (!landmarkIconMediaId) {
      setLandmarkIconUrl(undefined);
    }
  }, [landmarkIconMediaId, isEdit]);

  // Auto-generate ID from name if not provided
  useEffect(() => {
    if (!isEdit && name && !id) {
      const generatedId = name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
      setValue("id", generatedId);
    }
  }, [name, isEdit, id, setValue]);

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

  const onSubmitForm = async (data: RuneFormDataInput) => {
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

    const rune: RuneDef = {
      id: data.id.trim().toLowerCase(), // Use ID from form
      name: data.name.trim(), // Map name to concept for BaseEntity
      code: data.code as RuneCode,
      concept: data.name.trim(), // Map name back to concept
      description: data.description,
      powerFactor: data.powerFactor,
      controlFactor: data.controlFactor,
      instabilityBase: data.instabilityBase,
      tags: data.tags as RuneTag[],
      manaCost: data.manaCost,
      ...(Object.keys(damage).length > 0 ? { damage } : {}),
      ...(ccInstant.length > 0 ? { ccInstant } : {}),
      ...(Object.keys(pen).length > 0 ? { pen } : {}),
      ...(effects.length > 0 ? { effects } : {}),
      ...(overchargeEffects.length > 0 ? { overchargeEffects } : {}),
      ...(data.dotAffinity !== undefined ? { dotAffinity: data.dotAffinity } : {}),
      ...(finalImageMediaId ? { imageId: finalImageMediaId } : {}),
      ...(finalLandmarkIconMediaId ? { landmarkIconId: finalLandmarkIconMediaId } : {}),
    };

    onSubmit(rune);
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
          {/* Basic Info Section */}
          <BasicInfoSection
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
            idValue={id}
            idPlaceholder="e.g., fire"
            isEdit={isEdit}
            idValidation={idValidation}
            validatingId={validatingId}
            onIdChange={(newId) => {
              setValue("id", newId);
            }}
            nameValue={name}
            namePlaceholder="e.g., Fire"
            autoGenerateIdFromName={true}
            descriptionValue={watch("description") || ""}
            descriptionPlaceholder="Description of the rune..."
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

          {/* Rune-Specific Fields */}
          <section id="section-properties" className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-ember-glow" />
          <h2 className="text-xl font-bold text-glow">Rune Properties</h2>
        </div>

        {/* Code selection (special case for runes - single letter) */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
            <span>Rune Code (Letter)</span>
            <span className="text-ember">*</span>
          </label>
          {isEdit ? (
            <input
              type="text"
              value={code}
              disabled
              className="w-full px-3 py-2 bg-deep/50 border border-border rounded text-text-muted cursor-not-allowed"
            />
          ) : (
            <select
              {...register("code")}
              className={`w-full px-3 py-2 bg-deep border rounded text-text-primary ${
                errors.code ? "border-red-500" : "border-border"
              }`}
            >
              <option value="">Select a rune code</option>
              {availableCodes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
          {errors.code && (
            <p className="text-xs text-red-500 mt-1">{errors.code.message as string}</p>
          )}
          <p className="text-xs text-text-muted mt-1">
            Single letter code (A-Z) that uniquely identifies this rune
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
              <span>Power Factor</span>
              <span className="text-ember">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              {...register("powerFactor", { valueAsNumber: true })}
              className={`w-full px-3 py-2 bg-deep border rounded text-text-primary ${
                errors.powerFactor ? "border-red-500" : "border-border"
              }`}
            />
            {errors.powerFactor && (
              <p className="text-xs text-red-500 mt-1">{errors.powerFactor.message as string}</p>
            )}
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
              <span>Control Factor</span>
              <span className="text-ember">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              {...register("controlFactor", { valueAsNumber: true })}
              className={`w-full px-3 py-2 bg-deep border rounded text-text-primary ${
                errors.controlFactor ? "border-red-500" : "border-border"
              }`}
            />
            {errors.controlFactor && (
              <p className="text-xs text-red-500 mt-1">{errors.controlFactor.message as string}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
              <span>Instability Base (0-1)</span>
              <span className="text-ember">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              {...register("instabilityBase", { valueAsNumber: true })}
              className={`w-full px-3 py-2 bg-deep border rounded text-text-primary ${
                errors.instabilityBase ? "border-red-500" : "border-border"
              }`}
            />
            {errors.instabilityBase && (
              <p className="text-xs text-red-500 mt-1">{errors.instabilityBase.message as string}</p>
            )}
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
              <span>Mana Cost</span>
              <span className="text-ember">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              {...register("manaCost", { valueAsNumber: true })}
              className={`w-full px-3 py-2 bg-deep border rounded text-text-primary ${
                errors.manaCost ? "border-red-500" : "border-border"
              }`}
            />
            {errors.manaCost && (
              <p className="text-xs text-red-500 mt-1">{errors.manaCost.message as string}</p>
            )}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
            <span>Tags</span>
            <span className="text-ember">*</span>
          </label>
          <TagSelector
            selected={watch("tags") as RuneTag[]}
            options={allRuneTags}
            onChange={(tags) => setValue("tags", tags)}
            getLabel={(tag) => tag}
          />
          {errors.tags && (
            <p className="text-xs text-red-500 mt-1">{errors.tags.message as string}</p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
            <span>DOT Affinity (0-1, optional)</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            {...register("dotAffinity", { valueAsNumber: true })}
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
                  <option key={type} value={type}>{type}</option>
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
                  <option key={type} value={type}>{type}</option>
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
                  <option key={type} value={type}>{type}</option>
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
                    <option key={type} value={type}>{type}</option>
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
      </section>
        </form>
      </div>
    </div>
  );
}
