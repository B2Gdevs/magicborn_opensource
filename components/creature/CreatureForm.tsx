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
import { useIdValidation } from "@/lib/hooks/useIdValidation";
import { User, FileText, Heart, Save, X } from "lucide-react";

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

// Validation schema
const creatureSchema = z.object({
  id: z.string().min(1, "ID is required").regex(/^[a-z0-9_-]+$/, "ID must be lowercase letters, numbers, underscores, and hyphens only"),
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

// Helper to convert name to ID
function nameToId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
    const url = `/api/payload/creatures?${queryString}`;
    
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
        error: `A creature with ID "${id}" already exists${projectId ? ' in this project' : ''}. Please choose a different ID.` 
      };
    }
    
    return { isUnique: true };
  } catch (error) {
    console.error("Error checking ID uniqueness:", error);
    return { isUnique: true };
  }
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
  const initialId = initialValues.id || (initialValues.name ? nameToId(initialValues.name) : "");

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
  const id = watch("id");
  const hp = watch("hp");
  const maxHp = watch("maxHp");
  const mana = watch("mana");
  const maxMana = watch("maxMana");
  const affinity = watch("affinity") as AlphabetVector;
  const elementXp = watch("elementXp") as ElementXpMap;
  const elementAffinity = watch("elementAffinity") as ElementAffinityMap;

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

  // Auto-generate ID from name
  useEffect(() => {
    if (!isEdit && name && !id) {
      const generatedId = nameToId(name);
      setValue("id", generatedId);
    }
  }, [name, isEdit, id, setValue]);

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
    // Check ID validation one more time before submitting
    if (!isEdit && idValidation && !idValidation.isUnique) {
      alert(idValidation.error || "ID validation failed. Please choose a different ID.");
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
      alert(`Failed to upload images: ${error instanceof Error ? error.message : "Unknown error"}`);
      return;
    }

    const creatureData: CreatureDefinition = {
      id: data.id.trim(),
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
            idPlaceholder="e.g., shadow-beast"
            isEdit={isEdit}
            idValidation={idValidation}
            validatingId={validatingId}
            onIdChange={(newId) => {
              setValue("id", newId);
            }}
            nameValue={name}
            namePlaceholder="e.g., Shadow Beast"
            autoGenerateIdFromName={true}
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
