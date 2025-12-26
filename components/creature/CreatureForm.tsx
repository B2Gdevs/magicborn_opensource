// components/creature/CreatureForm.tsx
// Reusable form component for creating/editing creatures with React Hook Form

"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { CreatureDefinition } from "@/lib/data/creatures";
import type { AlphabetVector } from "@core/types";
import type { ElementXpMap, ElementAffinityMap } from "@/lib/packages/player/AffinityService";
import { MediaUpload, type MediaUploadRef } from "@components/ui/MediaUpload";
import { CombatStatsEditor } from "@components/ui/CombatStatsEditor";
import { BasicInfoSection } from "@components/ui/BasicInfoSection";
import { SidebarNav, type SidebarNavItem } from "@components/ui/SidebarNav";
import { useIdValidation } from "@/lib/hooks/useIdValidation";
import { User, FileText, Heart, Save, X } from "lucide-react";
import { nameToId } from "@lib/utils/id-generation";
import { checkIdUniqueness } from "@lib/validation/id-validation";
import { EntryType } from "@lib/content-editor/constants";
import { toast } from "@/lib/hooks/useToast";

// Form sections for sidebar navigation
type FormSection = "basic" | "description" | "resources";

interface CreatureFormProps {
  initialValues?: Partial<CreatureDefinition>;
  isEdit?: boolean;
  onSubmit: (creature: CreatureDefinition) => void;
  onCancel?: () => void;
  saving?: boolean;
  submitLabel?: string;
  projectId?: string;
  editEntryId?: number; // Payload ID for edit mode
}

// Validation schema - ID is optional for new entries (server generates), required for edit mode
const creatureSchema = z.object({
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
  imageMediaId: z.number().optional(),
  landmarkIconMediaId: z.number().optional(),
});

type CreatureFormData = z.infer<typeof creatureSchema>;

// Wrapper for checkIdUniqueness with EntryType.Creature
async function checkCreatureIdUniqueness(
  id: string,
  projectId?: string,
  excludeId?: number
): Promise<{ isUnique: boolean; error?: string }> {
  return checkIdUniqueness(EntryType.Creature, id, projectId, excludeId);
}

// Get form sections
const getFormSections = (): Array<{ id: FormSection; label: string; icon: typeof User }> => {
  return [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "description", label: "Description", icon: FileText },
    { id: "resources", label: "Universal Stats", icon: Heart },
  ];
};

export function CreatureForm({
  initialValues = {},
  isEdit = false,
  onSubmit,
  onCancel,
  saving = false,
  submitLabel,
  projectId,
  editEntryId,
}: CreatureFormProps) {
  const [activeSection, setActiveSection] = useState<FormSection>("basic");
  const [imageMediaId, setImageMediaId] = useState<number | undefined>(
    initialValues.imageId ||
    (typeof (initialValues as any).image === 'number' 
      ? (initialValues as any).image 
      : (initialValues as any).image?.id)
  );
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [landmarkIconMediaId, setLandmarkIconMediaId] = useState<number | undefined>(
    (initialValues as any).landmarkIconId ||
    (typeof (initialValues as any).landmarkIcon === 'number' 
      ? (initialValues as any).landmarkIcon 
      : (initialValues as any).landmarkIcon?.id)
  );
  const [landmarkIconUrl, setLandmarkIconUrl] = useState<string | undefined>(undefined);
  const imageUploadRef = useRef<MediaUploadRef | null>(null);
  const landmarkIconUploadRef = useRef<MediaUploadRef | null>(null);

  // Initialize ID from initial values or generate from name
  const initialId = initialValues.id || "";

  const form = useForm({
    resolver: zodResolver(creatureSchema),
    defaultValues: {
      id: initialId,
      name: initialValues.name || "",
      description: initialValues.description || "",
      hp: initialValues.hp ?? 100,
      maxHp: initialValues.maxHp ?? 100,
      mana: initialValues.mana ?? 50,
      maxMana: initialValues.maxMana ?? 50,
      affinity: initialValues.affinity || {},
      elementXp: initialValues.elementXp || {},
      elementAffinity: initialValues.elementAffinity || {},
      imageMediaId,
      landmarkIconMediaId,
    },
  });

  const { register, handleSubmit, watch, setValue, setError, clearErrors, formState: { errors } } = form;
  const name = watch("name");
  const id = watch("id") || ""; // Default to empty string for new entries
  const hp = watch("hp");
  const maxHp = watch("maxHp");
  const mana = watch("mana");
  const maxMana = watch("maxMana");
  const affinity = watch("affinity") as AlphabetVector;
  const elementXp = watch("elementXp") as ElementXpMap;
  const elementAffinity = watch("elementAffinity") as ElementAffinityMap;

  // Use reusable ID validation hook (only validate if ID is provided)
  const { idValidation, validatingId } = useIdValidation({
    id: id || "", // Pass empty string if undefined
    isEdit,
    projectId,
    editEntryId,
    checkIdUniqueness: checkCreatureIdUniqueness,
    setError,
    clearErrors,
  });

  // Update imageMediaId when initialValues change (for edit mode)
  useEffect(() => {
    if (initialValues?.imageId !== undefined && initialValues.imageId !== null) {
      setImageMediaId(initialValues.imageId);
    } else if ((initialValues as any)?.image !== undefined && (initialValues as any).image !== null) {
      const img = (initialValues as any).image;
      const imgId = typeof img === 'number' ? img : img?.id;
      if (imgId !== undefined && imgId !== null) {
        setImageMediaId(imgId);
      }
    }
  }, [initialValues?.imageId, (initialValues as any)?.image]);

  // Update landmarkIconMediaId when initialValues change (for edit mode)
  useEffect(() => {
    if ((initialValues as any)?.landmarkIconId !== undefined && (initialValues as any).landmarkIconId !== null) {
      setLandmarkIconMediaId((initialValues as any).landmarkIconId);
    } else if ((initialValues as any)?.landmarkIcon !== undefined && (initialValues as any).landmarkIcon !== null) {
      const icon = (initialValues as any).landmarkIcon;
      const iconId = typeof icon === 'number' ? icon : icon?.id;
      if (iconId !== undefined && iconId !== null) {
        setLandmarkIconMediaId(iconId);
      }
    }
  }, [(initialValues as any)?.landmarkIconId, (initialValues as any)?.landmarkIcon]);

  // Fetch image URLs when editing
  useEffect(() => {
    if (imageMediaId !== undefined && imageMediaId !== null && isEdit) {
      fetch(`/api/payload/media/${imageMediaId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch media: ${res.status}`);
          }
          return res.json();
        })
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
        .catch(err => {
          console.error("Failed to fetch image:", err);
          setImageUrl(undefined);
        });
    } else if (imageMediaId === undefined || imageMediaId === null) {
      setImageUrl(undefined);
    }
  }, [imageMediaId, isEdit]);

  useEffect(() => {
    if (landmarkIconMediaId !== undefined && landmarkIconMediaId !== null && isEdit) {
      fetch(`/api/payload/media/${landmarkIconMediaId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch media: ${res.status}`);
          }
          return res.json();
        })
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
        .catch(err => {
          console.error("Failed to fetch landmark icon:", err);
          setLandmarkIconUrl(undefined);
        });
    } else if (landmarkIconMediaId === undefined || landmarkIconMediaId === null) {
      setLandmarkIconUrl(undefined);
    }
  }, [landmarkIconMediaId, isEdit]);

  // ID is now server-generated, no auto-generation needed

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
      const scrollPosition = formContent.scrollTop + 100;

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

  const onSubmitForm = async (data: CreatureFormData) => {
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
      toast.error(`Failed to upload images: ${error instanceof Error ? error.message : "Unknown error"}`);
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

    const creatureData: CreatureDefinition = {
      id: tempId, // Temporary ID for new entries, real ID for edit mode
      name: data.name.trim(),
      description: data.description?.trim() || "",
      hp: data.hp,
      maxHp: data.maxHp,
      mana: data.mana,
      maxMana: data.maxMana,
      affinity: data.affinity as AlphabetVector,
      elementXp: Object.keys(data.elementXp).length > 0 ? data.elementXp as ElementXpMap : undefined,
      elementAffinity: Object.keys(data.elementAffinity).length > 0 ? data.elementAffinity as ElementAffinityMap : undefined,
      imageId: finalImageMediaId,
      landmarkIconId: finalLandmarkIconMediaId,
      effects: [], // Effects are runtime state
      storyIds: [], // Stories are managed separately
    };

    onSubmit(creatureData);
  };

  // Convert sections to SidebarNavItem format
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
          {/* Basic Info Section */}
          <BasicInfoSection
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
            idValue={id || ""}
            idPlaceholder="e.g., shadow-beast"
            isEdit={isEdit}
            idValidation={idValidation}
            validatingId={validatingId}
            onIdChange={(newId) => {
              setValue("id", newId);
            }}
            nameValue={name}
            namePlaceholder="e.g., Shadow Beast"
            descriptionValue={watch("description") || ""}
            descriptionPlaceholder="A brief description of the creature..."
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

            <CombatStatsEditor
              hp={hp}
              maxHp={maxHp}
              mana={mana}
              maxMana={maxMana}
              onHpChange={(value) => setValue("hp", value)}
              onMaxHpChange={(value) => setValue("maxHp", value)}
              onManaChange={(value) => setValue("mana", value)}
              onMaxManaChange={(value) => setValue("maxMana", value)}
              affinity={affinity}
              onAffinityChange={(value) => setValue("affinity", value)}
              elementXp={elementXp}
              elementAffinity={elementAffinity}
              onElementXpChange={(value) => setValue("elementXp", value)}
              onElementAffinityChange={(value) => setValue("elementAffinity", value)}
            />
          </section>
        </form>
      </div>
    </div>
  );
}

export function CreatureFormFooter({
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
