// components/lore/LoreForm.tsx
// Form for creating/editing lore entries with React Hook Form

"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BasicInfoSection } from "@components/ui/BasicInfoSection";
import { MediaUpload, type MediaUploadRef } from "@components/ui/MediaUpload";
import { SidebarNav, type SidebarNavItem } from "@components/ui/SidebarNav";
import { useIdValidation } from "@/lib/hooks/useIdValidation";
import { BookOpen, User, FileText, Save, X } from "lucide-react";
import { nameToId } from "@lib/utils/id-generation";
import { checkIdUniqueness } from "@lib/validation/id-validation";
import { EntryType } from "@lib/content-editor/constants";
import { toast } from "@/lib/hooks/useToast";

// Client-safe enums (inline to avoid webpack require issues)
enum LoreCategory {
  History = 'history',
  MagicSystem = 'magic-system',
  Culture = 'culture',
  Geography = 'geography',
  Religion = 'religion',
  Faction = 'faction',
}

const LORE_CATEGORY_OPTIONS = [
  { label: 'History', value: LoreCategory.History },
  { label: 'Magic System', value: LoreCategory.MagicSystem },
  { label: 'Culture', value: LoreCategory.Culture },
  { label: 'Geography', value: LoreCategory.Geography },
  { label: 'Religion', value: LoreCategory.Religion },
  { label: 'Faction', value: LoreCategory.Faction },
] as const;

// Form sections for sidebar navigation
type FormSection = "basic" | "content";

export interface LoreFormData {
  id?: string;
  slug?: string;
  title: string; // Maps to "name" in BasicInfoSection
  description?: string; // Maps to excerpt
  content?: string; // Rich text content
  category?: LoreCategory;
  author?: string;
  era?: string;
  imagePath?: string;
  featuredImage?: number; // Payload Media ID
  landmarkIcon?: number; // Payload Media ID
}

interface LoreFormProps {
  initialValues?: Partial<LoreFormData>;
  isEdit?: boolean;
  onSubmit: (data: LoreFormData) => void;
  onCancel?: () => void;
  saving?: boolean;
  submitLabel?: string;
  projectId?: string;
  editEntryId?: number;
}

// Validation schema
const loreSchema = z.object({
  id: z.string().optional().or(z.literal("")), // Optional - server generates for new entries
  name: z.string().min(1, "Title is required"), // Maps to "title" in LoreFormData
  description: z.string().optional().default(""), // Maps to "excerpt" in Payload
  content: z.string().optional().default(""),
  category: z.nativeEnum(LoreCategory).default(LoreCategory.History),
  author: z.string().optional(),
  era: z.string().optional(),
  imageMediaId: z.number().optional(), // Maps to "featuredImage"
  landmarkIconMediaId: z.number().optional(),
});

type LoreFormDataInput = z.infer<typeof loreSchema>;

// Wrapper for checkIdUniqueness with EntryType.Story
async function checkLoreIdUniqueness(
  id: string,
  projectId?: string,
  excludeId?: number
): Promise<{ isUnique: boolean; error?: string }> {
  return checkIdUniqueness(EntryType.Story, id, projectId, excludeId);
}

// Get form sections
const getFormSections = (): Array<{ id: FormSection; label: string; icon: typeof User }> => {
  return [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "content", label: "Content", icon: BookOpen },
  ];
};

export function LoreForm({
  initialValues = {},
  isEdit = false,
  onSubmit,
  onCancel,
  saving = false,
  submitLabel,
  projectId,
  editEntryId,
}: LoreFormProps) {
  const [activeSection, setActiveSection] = useState<FormSection>("basic");
  const [imageMediaId, setImageMediaId] = useState<number | undefined>(
    typeof initialValues.featuredImage === 'number' 
      ? initialValues.featuredImage 
      : typeof (initialValues as any).featuredImage === 'object' && (initialValues as any).featuredImage?.id
        ? (initialValues as any).featuredImage.id
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

  // Map initial values: title -> name, description -> excerpt
  const initialSlug = initialValues.slug || initialValues.id || "";

  const form = useForm({
    resolver: zodResolver(loreSchema),
    defaultValues: {
      id: initialSlug,
      name: initialValues.title || "", // Map title to name for BasicInfoSection
      description: initialValues.description || "", // Map to excerpt
      content: initialValues.content || "",
      category: initialValues.category || LoreCategory.History,
      author: initialValues.author || "",
      era: initialValues.era || "",
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
    checkIdUniqueness: checkLoreIdUniqueness,
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

  const onSubmitForm = async (data: LoreFormDataInput) => {
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

    const loreData: LoreFormData = {
      title: data.name.trim(), // Map name back to title
      // Only include slug if provided (for new entries, server generates it)
      slug: data.id && data.id.trim() ? data.id.trim().toLowerCase() : undefined,
      description: data.description?.trim() || undefined, // Map to excerpt
      content: data.content?.trim() || undefined,
      category: data.category,
      author: data.author?.trim() || undefined,
      era: data.era?.trim() || undefined,
      imagePath: imageUrl || undefined,
      featuredImage: finalImageMediaId,
      landmarkIcon: finalLandmarkIconMediaId,
    };

    onSubmit(loreData);
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
        onItemClick={(id: string) => setActiveSection(id as FormSection)}
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
        idPlaceholder="e.g., founding-of-emberholt"
        isEdit={isEdit}
        idValidation={idValidation}
        validatingId={validatingId}
        onIdChange={(newId) => {
          setValue("id", newId);
        }}
        nameValue={name}
        namePlaceholder="e.g., The Founding of Emberholt"
        descriptionValue={watch("description") || ""}
        descriptionPlaceholder="Short summary for previews..."
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

      {/* Lore-Specific Fields */}
      <section id="section-content" className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-ember-glow" />
          <h2 className="text-xl font-bold text-glow">Content</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
              <span>Category</span>
              <span className="text-ember">*</span>
            </label>
            <select
              {...register("category")}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
            >
              {LORE_CATEGORY_OPTIONS.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
              <span>Era</span>
            </label>
            <input
              type="text"
              {...register("era")}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              placeholder="e.g., First Age"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
            <span>Author</span>
          </label>
          <input
            type="text"
            {...register("author")}
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
            placeholder="e.g., Archivist Mira"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
            <span>Content</span>
          </label>
          <textarea
            {...register("content")}
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary min-h-[200px]"
            placeholder="The ancient texts speak of a time when..."
          />
        </div>
      </section>
        </form>
      </div>
    </div>
  );
}

export function LoreFormFooter({
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
