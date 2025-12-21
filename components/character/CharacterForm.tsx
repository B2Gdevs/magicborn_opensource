// components/character/CharacterForm.tsx
// Reusable form component for creating/editing characters with React Hook Form

"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { CharacterDefinition } from "@/lib/data/characters";
import type { AlphabetVector } from "@core/types";
import type { ElementXpMap, ElementAffinityMap } from "@/lib/packages/player/AffinityService";
import { DamageType } from "@core/enums";
import { MediaUpload, type MediaUploadRef } from "@components/ui/MediaUpload";
import { CombatStatsEditor } from "@components/ui/CombatStatsEditor";
import { RuneFamiliarityEditor } from "@components/ui/RuneFamiliarityEditor";
import { BasicInfoSection } from "@components/ui/BasicInfoSection";
import { useMagicbornMode } from "@/lib/payload/hooks/useMagicbornMode";
import { useIdValidation } from "@/lib/hooks/useIdValidation";
import { 
  User, 
  FileText, 
  Heart, 
  Zap, 
  Sparkles,
  ChevronDown,
  ChevronRight
} from "lucide-react";

// Form sections for sidebar navigation
type FormSection = "basic" | "description" | "resources" | "runes" | "elements" | "attributes";

interface CharacterFormProps {
  initialValues?: Partial<CharacterDefinition>;
  existingCharacters?: CharacterDefinition[];
  isEdit?: boolean;
  onSubmit: (character: CharacterDefinition) => void;
  onCancel?: () => void;
  saving?: boolean;
  submitLabel?: string;
  projectId?: string;
  editEntryId?: number; // Payload ID for edit mode
}

// Validation schema - extended to include all form fields
const characterSchema = z.object({
  id: z.string().min(1, "ID is required").regex(/^[a-z0-9_]+$/, "ID must be lowercase letters, numbers, and underscores only"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().default(""),
  hp: z.number().min(0, "HP must be 0 or greater"),
  maxHp: z.number().min(0, "Max HP must be 0 or greater"),
  mana: z.number().min(0, "Mana must be 0 or greater"),
  maxMana: z.number().min(0, "Max Mana must be 0 or greater"),
  affinity: z.record(z.string(), z.number()).optional().default({}),
  elementXp: z.record(z.string(), z.number()).optional().default({}),
  elementAffinity: z.record(z.string(), z.number()).optional().default({}),
  controlBonus: z.number().optional(),
  costEfficiency: z.number().optional(),
  imageMediaId: z.number().optional(),
  landmarkIconMediaId: z.number().optional(),
});

type CharacterFormData = z.infer<typeof characterSchema>;

// Helper to convert name to ID
function nameToId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// Check ID uniqueness - fixed version with better error handling
async function checkIdUniqueness(
  id: string,
  projectId?: string,
  excludeId?: number
): Promise<{ isUnique: boolean; error?: string }> {
  if (!id.trim()) {
    return { isUnique: true };
  }

  // Normalize ID to lowercase
  const normalizedId = id.trim().toLowerCase();

  try {
    // Build query - Payload CMS uses nested where clauses
    // Format: where[slug][equals]=value&where[project][equals]=projectId
    const queryParts: string[] = [];
    queryParts.push(`where[slug][equals]=${encodeURIComponent(normalizedId)}`);
    
    // Always filter by project if provided (convert to number if it's a string)
    if (projectId) {
      const projectIdNum = typeof projectId === 'string' ? parseInt(projectId, 10) : projectId;
      if (!isNaN(projectIdNum)) {
        queryParts.push(`where[project][equals]=${projectIdNum}`);
      }
    }
    
    // Exclude current entry in edit mode
    if (excludeId) {
      queryParts.push(`where[id][not_equals]=${excludeId}`);
    }
    
    queryParts.push('limit=1');
    
    const queryString = queryParts.join('&');
    const url = `/api/payload/characters?${queryString}`;
    
    const res = await fetch(url);
    
    if (!res.ok) {
      // If error (like 404, 500, etc), log but assume unique (don't block user)
      const errorText = await res.text().catch(() => '');
      console.warn(`ID validation API error (${res.status}) for ID "${normalizedId}":`, errorText);
      return { isUnique: true };
    }
    
    const data = await res.json();
    
    // Check response structure - Payload returns { docs: [...], totalDocs: number, ... }
    const docs = data.docs || data.results || (Array.isArray(data) ? data : []);
    
    // If no docs returned, ID is unique
    if (!Array.isArray(docs) || docs.length === 0) {
      return { isUnique: true };
    }
    
    // If we got results, verify the slug matches exactly (case-insensitive)
    // Since we're already filtering by slug in the query, any result is a conflict
    // But we double-check to be safe
    const matchingDoc = docs.find((doc: any) => {
      const docSlug = doc.slug?.toLowerCase()?.trim();
      return docSlug === normalizedId;
    });
    
    if (matchingDoc) {
      // If we filtered by project, the result should already be in the same project
      // But verify to be safe
      if (projectId) {
        const projectIdNum = typeof projectId === 'string' ? parseInt(projectId, 10) : projectId;
        const docProjectId = typeof matchingDoc.project === 'object' 
          ? matchingDoc.project?.id || matchingDoc.project 
          : matchingDoc.project;
        
        // If project IDs don't match, it's unique for this project (shouldn't happen with query filter)
        if (docProjectId && docProjectId !== projectIdNum && docProjectId !== projectId) {
          return { isUnique: true };
        }
      }
      
      // Found a matching character
      return { 
        isUnique: false, 
        error: `A character with ID "${id}" already exists${projectId ? ' in this project' : ''}. Please choose a different ID.` 
      };
    }
    
    return { isUnique: true };
  } catch (error) {
    console.error("Error checking ID uniqueness:", error);
    // On error, assume unique (don't block user)
    return { isUnique: true };
  }
}

// Get form sections based on Magicborn mode
const getFormSections = (isMagicbornMode: boolean): {
  main: Array<{ id: FormSection; label: string; icon: typeof User }>;
  magicborn: Array<{ id: FormSection; label: string; icon: typeof User }>;
} => {
  const main: Array<{ id: FormSection; label: string; icon: typeof User }> = [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "description", label: "Description", icon: FileText },
    { id: "resources", label: "Universal Stats", icon: Heart },
  ];
  
  const magicborn: Array<{ id: FormSection; label: string; icon: typeof User }> = isMagicbornMode ? [
    { id: "runes", label: "Rune Familiarity", icon: Sparkles },
    { id: "elements", label: "Elements", icon: Zap },
    { id: "attributes", label: "Player Attributes", icon: Zap }
  ] : [];
  
  return { main, magicborn };
};

export function CharacterForm({
  initialValues = {},
  existingCharacters = [],
  isEdit = false,
  onSubmit,
  onCancel,
  saving = false,
  submitLabel,
  projectId,
  editEntryId,
}: CharacterFormProps) {
  const [activeSection, setActiveSection] = useState<FormSection>("basic");
  const [imageMediaId, setImageMediaId] = useState<number | undefined>(
    initialValues.imageId ||
    (typeof (initialValues as any).image === 'number' 
      ? (initialValues as any).image 
      : typeof (initialValues as any).image === 'object' && (initialValues as any).image?.id
        ? (initialValues as any).image.id
        : undefined)
  );
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [landmarkIconMediaId, setLandmarkIconMediaId] = useState<number | undefined>(
    (typeof (initialValues as any).landmarkIcon === 'number' 
      ? (initialValues as any).landmarkIcon 
      : typeof (initialValues as any).landmarkIcon === 'object' && (initialValues as any).landmarkIcon?.id
        ? (initialValues as any).landmarkIcon.id
        : undefined)
  );
  const [landmarkIconUrl, setLandmarkIconUrl] = useState<string | undefined>(undefined);
  const imageUploadRef = useRef<MediaUploadRef | null>(null);
  const landmarkIconUploadRef = useRef<MediaUploadRef | null>(null);
  const [magicbornExpanded, setMagicbornExpanded] = useState(true);
  
  // Check if project is in Magicborn mode
  const { isMagicbornMode, loading: magicbornLoading } = useMagicbornMode(projectId || "");

  const form = useForm({
    resolver: zodResolver(characterSchema),
    defaultValues: {
      id: initialValues.id || "",
      name: initialValues.name || "",
      description: initialValues.description || "",
      hp: initialValues.hp ?? 0,
      maxHp: initialValues.maxHp ?? 0,
      mana: initialValues.mana ?? 0,
      maxMana: initialValues.maxMana ?? 0,
      affinity: initialValues.affinity || {},
      elementXp: initialValues.elementXp || {},
      elementAffinity: initialValues.elementAffinity || {},
      controlBonus: initialValues.controlBonus,
      costEfficiency: initialValues.costEfficiency,
      imageMediaId,
      landmarkIconMediaId,
    },
  });

  const { register, handleSubmit, watch, setValue, setError, clearErrors, formState: { errors, isValid } } = form;
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

  // Fetch image URL when editing
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

  // Fetch landmark icon URL when editing
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


  const onSubmitForm = async (data: any) => {
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

    const character: CharacterDefinition = {
      id: data.id.trim().toLowerCase(),
      name: data.name.trim(),
      description: data.description.trim(),
      mana: data.mana,
      maxMana: data.maxMana,
      hp: data.hp,
      maxHp: data.maxHp,
      affinity: (data.affinity || {}) as AlphabetVector,
      effects: [], // Effects are runtime state
      storyIds: [], // Stories managed separately
      ...(Object.keys(data.elementXp).length > 0 ? { elementXp: data.elementXp } : {}),
      ...(Object.keys(data.elementAffinity).length > 0 ? { elementAffinity: data.elementAffinity } : {}),
      ...(data.controlBonus !== undefined ? { controlBonus: data.controlBonus } : {}),
      ...(data.costEfficiency !== undefined ? { costEfficiency: data.costEfficiency } : {}),
      ...(finalImageMediaId ? { imageId: finalImageMediaId } : {}),
    };

    onSubmit(character);
  };

  // Scroll to section when active section changes
  useEffect(() => {
    const sectionElement = document.getElementById(`section-${activeSection}`);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeSection]);

  const { main: mainSections, magicborn: magicbornSections } = getFormSections(isMagicbornMode);

  return (
    <div className="flex h-full">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-border bg-shadow flex-shrink-0">
        <nav className="p-4 space-y-1 sticky top-0">
          {/* Main Sections */}
          {mainSections.map((section) => {
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

          {/* Magicborn Mode Subsection */}
          {isMagicbornMode && magicbornSections.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <button
                onClick={() => setMagicbornExpanded(!magicbornExpanded)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-deep/50 transition-colors"
              >
                {magicbornExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <span className="text-xs font-semibold uppercase tracking-wide">Magicborn</span>
              </button>
              {magicbornExpanded && (
                <div className="mt-1 space-y-1 pl-6">
                  {magicbornSections.map((section) => {
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
                </div>
              )}
            </div>
          )}
        </nav>
      </aside>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6 p-6">
          {/* Basic Info and Description Sections */}
          <BasicInfoSection
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
            idValue={id}
            idPlaceholder="e.g., kael"
            isEdit={isEdit}
            idValidation={idValidation}
            validatingId={validatingId}
            onIdChange={(newId) => {
              setValue("id", newId);
            }}
            nameValue={name}
            namePlaceholder="e.g., Kael"
            autoGenerateIdFromName={true}
            descriptionValue={watch("description") || ""}
            descriptionPlaceholder="Character description..."
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

          {/* Universal Stats Section */}
          <section id="section-resources" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-ember-glow" />
              <h2 className="text-xl font-bold text-glow">Universal Stats</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
                  <Heart className="w-4 h-4" />
                  <span>HP</span>
                  <span className="text-ember">*</span>
                </label>
                <input
                  type="number"
                  {...register("hp", { valueAsNumber: true })}
                  className={`w-full px-3 py-2 bg-deep border rounded text-text-primary ${
                    errors.hp ? "border-red-500" : "border-border"
                  }`}
                  disabled={saving}
                />
                {errors.hp && (
                  <p className="text-xs text-red-400 mt-1">{errors.hp.message}</p>
                )}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
                  <Heart className="w-4 h-4" />
                  <span>Max HP</span>
                  <span className="text-ember">*</span>
                </label>
                <input
                  type="number"
                  {...register("maxHp", { valueAsNumber: true })}
                  className={`w-full px-3 py-2 bg-deep border rounded text-text-primary ${
                    errors.maxHp ? "border-red-500" : "border-border"
                  }`}
                  disabled={saving}
                />
                {errors.maxHp && (
                  <p className="text-xs text-red-400 mt-1">{errors.maxHp.message}</p>
                )}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
                  <Zap className="w-4 h-4" />
                  <span>Mana</span>
                  <span className="text-ember">*</span>
                </label>
                <input
                  type="number"
                  {...register("mana", { valueAsNumber: true })}
                  className={`w-full px-3 py-2 bg-deep border rounded text-text-primary ${
                    errors.mana ? "border-red-500" : "border-border"
                  }`}
                  disabled={saving}
                />
                {errors.mana && (
                  <p className="text-xs text-red-400 mt-1">{errors.mana.message}</p>
                )}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
                  <Zap className="w-4 h-4" />
                  <span>Max Mana</span>
                  <span className="text-ember">*</span>
                </label>
                <input
                  type="number"
                  {...register("maxMana", { valueAsNumber: true })}
                  className={`w-full px-3 py-2 bg-deep border rounded text-text-primary ${
                    errors.maxMana ? "border-red-500" : "border-border"
                  }`}
                  disabled={saving}
                />
                {errors.maxMana && (
                  <p className="text-xs text-red-400 mt-1">{errors.maxMana.message}</p>
                )}
              </div>
            </div>
          </section>

          {/* Rune Familiarity Section - only in Magicborn mode */}
          {isMagicbornMode && (
            <section id="section-runes" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-ember-glow" />
                <h2 className="text-xl font-bold text-glow">Rune Familiarity</h2>
              </div>
              <RuneFamiliarityEditor
                value={(watch("affinity") || {}) as AlphabetVector}
                onChange={(value) => setValue("affinity", value as any)}
              />
            </section>
          )}

          {/* Elements Section - only in Magicborn mode */}
          {isMagicbornMode && (
            <section id="section-elements" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-ember-glow" />
                <h2 className="text-xl font-bold text-glow">Element XP & Affinity</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">
                    Element XP
                  </label>
                  <div className="space-y-2">
                    {Object.values(DamageType).map((type: DamageType) => (
                      <div key={type} className="flex items-center gap-2">
                        <span className="text-sm text-text-primary w-24">{type}:</span>
                        <input
                          type="number"
                          value={(watch("elementXp") as ElementXpMap)?.[type] ?? 0}
                          onChange={(e) => {
                            const current = (watch("elementXp") || {}) as ElementXpMap;
                            setValue("elementXp", {
                              ...current,
                              [type]: parseFloat(e.target.value) || 0,
                            } as any);
                          }}
                          className="flex-1 px-2 py-1 bg-deep border border-border rounded text-sm text-text-primary"
                          disabled={saving}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">
                    Element Affinity
                  </label>
                  <div className="space-y-2">
                    {Object.values(DamageType).map((type: DamageType) => (
                      <div key={type} className="flex items-center gap-2">
                        <span className="text-sm text-text-primary w-24">{type}:</span>
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.05"
                          value={(watch("elementAffinity") as ElementAffinityMap)?.[type] ?? 0}
                          onChange={(e) => {
                            const current = (watch("elementAffinity") || {}) as ElementAffinityMap;
                            setValue("elementAffinity", {
                              ...current,
                              [type]: parseFloat(e.target.value) || 0,
                            } as any);
                          }}
                          className="flex-1 px-2 py-1 bg-deep border border-border rounded text-sm text-text-primary"
                          disabled={saving}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Player Attributes Section - only in Magicborn mode */}
          {isMagicbornMode && (
            <section id="section-attributes" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-ember-glow" />
                <h2 className="text-xl font-bold text-glow">Player Attributes</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
                    <span>Control Bonus</span>
                    <span className="text-xs text-text-muted">(optional)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={watch("controlBonus") || ""}
                    onChange={(e) =>
                      setValue("controlBonus", e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
                    placeholder="Reduces instability"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
                    <span>Cost Efficiency</span>
                    <span className="text-xs text-text-muted">(optional)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={watch("costEfficiency") || ""}
                    onChange={(e) =>
                      setValue("costEfficiency", e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
                    placeholder="Reduces mana cost"
                    disabled={saving}
                  />
                </div>
              </div>
            </section>
          )}
        </form>
      </div>
    </div>
  );
}

export function CharacterFormFooter({
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
  const handleSubmit = () => {
    // Find the form and trigger submit
    const form = document.querySelector('form');
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
        {saving ? "Saving..." : submitLabel || (isEdit ? "Update Character" : "Create Character")}
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
