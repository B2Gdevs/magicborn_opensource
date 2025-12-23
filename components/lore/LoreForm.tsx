// components/lore/LoreForm.tsx
// Form for creating/editing lore entries with React Hook Form

"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BasicInfoSection } from "@components/ui/BasicInfoSection";
import { MediaUpload, type MediaUploadRef } from "@components/ui/MediaUpload";
import { useIdValidation } from "@/lib/hooks/useIdValidation";
import { BookOpen, User, FileText, Save, X } from "lucide-react";

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
  id: z.string().min(1, "ID is required").regex(/^[a-z0-9_-]+$/, "ID must be lowercase letters, numbers, underscores, and hyphens only"),
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

// Helper to convert name to slug
function nameToSlug(name: string): string {
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
    const url = `/api/payload/lore?${queryString}`;
    
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
      if (projectId) {
        const projectIdNum = typeof projectId === 'string' ? parseInt(projectId, 10) : projectId;
        const docProjectId = typeof matchingDoc.project === 'object' 
          ? matchingDoc.project?.id || matchingDoc.project 
          : matchingDoc.project;
        
        if (docProjectId && docProjectId !== projectIdNum && docProjectId !== projectId) {
          return { isUnique: true };
        }
      }
      
      return { 
        isUnique: false, 
        error: `A lore entry with ID "${id}" already exists${projectId ? ' in this project' : ''}. Please choose a different ID.` 
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
  const initialSlug = initialValues.slug || initialValues.id || (initialValues.title ? nameToSlug(initialValues.title) : "");

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
      const generatedId = nameToSlug(name);
      setValue("id", generatedId);
    }
  }, [name, isEdit, id, setValue]);

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
      alert(`Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`);
      return;
    }

    // Check ID validation one more time before submitting
    if (!isEdit && idValidation && !idValidation.isUnique) {
      alert(idValidation.error || "ID validation failed. Please choose a different ID.");
      return;
    }

    const loreData: LoreFormData = {
      title: data.name.trim(), // Map name back to title
      slug: data.id.trim(),
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
        idPlaceholder="e.g., founding-of-emberholt"
        isEdit={isEdit}
        idValidation={idValidation}
        validatingId={validatingId}
        onIdChange={(newId) => {
          setValue("id", newId);
        }}
        nameValue={name}
        namePlaceholder="e.g., The Founding of Emberholt"
        autoGenerateIdFromName={true}
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
