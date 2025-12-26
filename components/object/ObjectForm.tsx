// components/object/ObjectForm.tsx
// Form for creating/editing objects/items with React Hook Form

"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MediaUpload, type MediaUploadRef } from "@components/ui/MediaUpload";
import { BasicInfoSection } from "@components/ui/BasicInfoSection";
import { SidebarNav, type SidebarNavItem } from "@components/ui/SidebarNav";
import { useIdValidation } from "@/lib/hooks/useIdValidation";
import { Package, User, FileText, Save, X } from "lucide-react";
import { nameToId } from "@lib/utils/id-generation";
import { checkIdUniqueness } from "@lib/validation/id-validation";
import { EntryType } from "@lib/content-editor/constants";
import { toast } from "@/lib/hooks/useToast";

// Client-safe enums (inline to avoid webpack require issues)
enum ObjectType {
  Weapon = 'weapon',
  Armor = 'armor',
  Consumable = 'consumable',
  Material = 'material',
  Key = 'key',
  Artifact = 'artifact',
  Misc = 'misc',
}

enum ItemRarity {
  Common = 'common',
  Uncommon = 'uncommon',
  Rare = 'rare',
  Epic = 'epic',
  Legendary = 'legendary',
}

// Form sections for sidebar navigation
type FormSection = "basic" | "properties";

const OBJECT_TYPE_OPTIONS = [
  { label: 'Weapon', value: ObjectType.Weapon },
  { label: 'Armor', value: ObjectType.Armor },
  { label: 'Consumable', value: ObjectType.Consumable },
  { label: 'Material', value: ObjectType.Material },
  { label: 'Key Item', value: ObjectType.Key },
  { label: 'Artifact', value: ObjectType.Artifact },
  { label: 'Miscellaneous', value: ObjectType.Misc },
] as const;

const ITEM_RARITY_OPTIONS = [
  { label: 'Common', value: ItemRarity.Common },
  { label: 'Uncommon', value: ItemRarity.Uncommon },
  { label: 'Rare', value: ItemRarity.Rare },
  { label: 'Epic', value: ItemRarity.Epic },
  { label: 'Legendary', value: ItemRarity.Legendary },
] as const;

export interface ObjectFormData {
  id?: string;
  slug?: string;
  name: string;
  description?: string;
  type?: ObjectType;
  rarity?: ItemRarity;
  imagePath?: string;
  image?: number; // Payload Media ID
  landmarkIcon?: number; // Payload Media ID
  weight?: number;
  value?: number;
}

interface ObjectFormProps {
  initialValues?: Partial<ObjectFormData>;
  isEdit?: boolean;
  onSubmit: (data: ObjectFormData) => void;
  onCancel?: () => void;
  saving?: boolean;
  submitLabel?: string;
  projectId?: string;
  editEntryId?: number;
}

// Validation schema
const objectSchema = z.object({
  id: z.string().optional().or(z.literal("")), // Optional - server generates for new entries
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().default(""),
  type: z.nativeEnum(ObjectType).default(ObjectType.Misc),
  rarity: z.nativeEnum(ItemRarity).default(ItemRarity.Common),
  weight: z.number().min(0).optional(),
  value: z.number().min(0).optional(),
  imageMediaId: z.number().optional(),
  landmarkIconMediaId: z.number().optional(),
});

type ObjectFormDataInput = z.infer<typeof objectSchema>;

// Wrapper for checkIdUniqueness with EntryType.Object
async function checkObjectIdUniqueness(
  id: string,
  projectId?: string,
  excludeId?: number
): Promise<{ isUnique: boolean; error?: string }> {
  return checkIdUniqueness(EntryType.Object, id, projectId, excludeId);
}

// Get form sections
const getFormSections = (): Array<{ id: FormSection; label: string; icon: typeof User }> => {
  return [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "properties", label: "Item Properties", icon: Package },
  ];
};

export function ObjectForm({
  initialValues = {},
  isEdit = false,
  onSubmit,
  onCancel,
  saving = false,
  submitLabel,
  projectId,
  editEntryId,
}: ObjectFormProps) {
  const [activeSection, setActiveSection] = useState<FormSection>("basic");
  const [imageMediaId, setImageMediaId] = useState<number | undefined>(
    typeof initialValues.image === 'number' 
      ? initialValues.image 
      : typeof initialValues.image === 'object' && initialValues.image && 'id' in initialValues.image
        ? (initialValues.image as { id: number }).id
        : undefined
  );
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialValues.imagePath);
  const [landmarkIconMediaId, setLandmarkIconMediaId] = useState<number | undefined>(
    typeof initialValues.landmarkIcon === 'number' 
      ? initialValues.landmarkIcon 
      : typeof initialValues.landmarkIcon === 'object' && initialValues.landmarkIcon && 'id' in initialValues.landmarkIcon
        ? (initialValues.landmarkIcon as { id: number }).id
        : undefined
  );
  const [landmarkIconUrl, setLandmarkIconUrl] = useState<string | undefined>(undefined);
  const imageUploadRef = useRef<MediaUploadRef | null>(null);
  const landmarkIconUploadRef = useRef<MediaUploadRef | null>(null);

  // Initialize form with default slug from name if not provided
  const initialSlug = initialValues.slug || initialValues.id || "";

  const form = useForm({
    resolver: zodResolver(objectSchema),
    defaultValues: {
      id: initialSlug,
      name: initialValues.name || "",
      description: initialValues.description || "",
      type: initialValues.type || ObjectType.Misc,
      rarity: initialValues.rarity || ItemRarity.Common,
      weight: initialValues.weight,
      value: initialValues.value,
      imageMediaId,
      landmarkIconMediaId,
    },
  });

  const { register, handleSubmit, watch, setValue, setError, clearErrors, formState: { errors } } = form;
  const name = watch("name");
  const id = watch("id") || ""; // Default to empty string for new entries

  // Use reusable ID validation hook (only validate if ID is provided)
  const { idValidation, validatingId } = useIdValidation({
    id: id || "", // Pass empty string if undefined
    isEdit,
    projectId,
    editEntryId,
    checkIdUniqueness: checkObjectIdUniqueness,
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

  const onSubmitForm = async (data: ObjectFormDataInput) => {
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

    const objectData: ObjectFormData = {
      name: data.name.trim(),
      // Only include slug if provided (for new entries, server generates it)
      slug: data.id && data.id.trim() ? data.id.trim().toLowerCase() : undefined,
      description: data.description?.trim() || undefined,
      type: data.type,
      rarity: data.rarity,
      weight: data.weight,
      value: data.value,
      imagePath: imageUrl || undefined,
      image: finalImageMediaId,
      landmarkIcon: finalLandmarkIconMediaId,
    };

    onSubmit(objectData);
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
      {/* Basic Info and Description Sections */}
      <BasicInfoSection
        register={register}
        watch={watch}
        setValue={setValue}
        errors={errors}
        idValue={id || ""}
        idPlaceholder="e.g., ember-crystal"
        isEdit={isEdit}
        idValidation={idValidation}
        validatingId={validatingId}
        onIdChange={(newId) => {
          setValue("id", newId);
        }}
        nameValue={name}
        namePlaceholder="e.g., Ember Crystal"
        descriptionValue={watch("description") || ""}
        descriptionPlaceholder="A crystallized fragment of pure flame..."
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

      {/* Object-Specific Fields */}
      <section id="section-properties" className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-ember-glow" />
          <h2 className="text-xl font-bold text-glow">Item Properties</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
              <span>Type</span>
            </label>
            <select
              {...register("type")}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
            >
              {OBJECT_TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
              <span>Rarity</span>
            </label>
            <select
              {...register("rarity")}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
            >
              {ITEM_RARITY_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
              <span>Weight</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              {...register("weight", { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              placeholder="0.5"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
              <span>Value (Gold)</span>
            </label>
            <input
              type="number"
              min="0"
              {...register("value", { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              placeholder="100"
            />
          </div>
        </div>
      </section>
        </form>
      </div>
    </div>
  );
}

export function ObjectFormFooter({
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
