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
import { SidebarNav, type SidebarNavItem, type SidebarNavGroup } from "@components/ui/SidebarNav";
import { useMagicbornMode } from "@/lib/payload/hooks/useMagicbornMode";
import { useIdValidation } from "@/lib/hooks/useIdValidation";
import { nameToId } from "@lib/utils/id-generation";
import { checkIdUniqueness } from "@lib/validation/id-validation";
import { EntryType } from "@lib/content-editor/constants";
import { toast } from "@/lib/hooks/useToast";
import { 
  User, 
  FileText, 
  Heart, 
  Zap, 
  Sparkles,
  ChevronRight,
  Save,
  X
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
// ID is optional for new entries (server generates), required for edit mode
const characterSchema = z.object({
  id: z.string().optional().or(z.literal("")), // Optional - server generates for new entries
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

// Wrapper for checkIdUniqueness with EntryType.Character
async function checkCharacterIdUniqueness(
  id: string,
  projectId?: string,
  excludeId?: number
): Promise<{ isUnique: boolean; error?: string }> {
  return checkIdUniqueness(EntryType.Character, id, projectId, excludeId);
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
  const id = watch("id") || ""; // Default to empty string for new entries

  // Use reusable ID validation hook (only validate if ID is provided)
  const { idValidation, validatingId } = useIdValidation({
    id: id || "", // Pass empty string if undefined
    isEdit,
    projectId,
    editEntryId,
    checkIdUniqueness: checkCharacterIdUniqueness,
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

  // ID is now server-generated, no auto-generation needed


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

    const character: CharacterDefinition = {
      id: tempId, // Temporary ID for new entries, real ID for edit mode
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

  // Convert to SidebarNav format
  const mainNavItems: SidebarNavItem[] = mainSections.map((section) => ({
    id: section.id,
    label: section.label,
    icon: section.icon,
  }));

  const navItems: (SidebarNavItem | SidebarNavGroup)[] = [
    ...mainNavItems,
    ...(isMagicbornMode && magicbornSections.length > 0
      ? [
          {
            id: "magicborn",
            label: "Magicborn",
            items: magicbornSections.map((section) => ({
              id: section.id,
              label: section.label,
              icon: section.icon,
            })),
            defaultExpanded: true,
            collapsible: true,
          } as SidebarNavGroup,
        ]
      : []),
  ];

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
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6 p-6">
          {/* Basic Info and Description Sections */}
          <BasicInfoSection
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
            idValue={id || ""}
            idPlaceholder="e.g., kael"
            isEdit={isEdit}
            idValidation={idValidation}
            validatingId={validatingId}
            onIdChange={(newId) => {
              setValue("id", newId);
            }}
            nameValue={name}
            namePlaceholder="e.g., Kael"
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
            landmarkIconMediaId={landmarkIconMediaId}
            landmarkIconUrl={landmarkIconUrl}
            onLandmarkIconUploaded={(mediaId) => {
              setLandmarkIconMediaId(mediaId);
              setValue("landmarkIconMediaId", mediaId);
              if (!mediaId) {
                setLandmarkIconUrl(undefined);
              }
            }}
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
