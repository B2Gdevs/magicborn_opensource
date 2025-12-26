// components/content-editor/ChapterForm.tsx
// Form for creating/editing chapters with React Hook Form

"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MediaUpload, type MediaUploadRef } from "@components/ui/MediaUpload";
import { BasicInfoSection } from "@components/ui/BasicInfoSection";
import { SidebarNav, type SidebarNavItem } from "@components/ui/SidebarNav";
import { useIdValidation } from "@/lib/hooks/useIdValidation";
import { User, FileText, Save, X } from "lucide-react";
import { checkIdUniqueness } from "@lib/validation/id-validation";
import { EntryType } from "@lib/content-editor/constants";
import { toast } from "@/lib/hooks/useToast";

export interface ChapterFormData {
  id?: string;
  name: string;
  description?: string;
  imageMediaId?: number;
  actId?: string; // For creating chapters within an act
}

interface ChapterFormProps {
  initialValues?: Partial<ChapterFormData>;
  isEdit?: boolean;
  onSubmit: (data: ChapterFormData) => void;
  onCancel?: () => void;
  saving?: boolean;
  submitLabel?: string;
  projectId?: string;
  editEntryId?: number;
  actId?: string; // Required for new chapters
}

// Validation schema - ID is optional for new entries (server generates), required for edit mode
const chapterSchema = z.object({
  id: z.string().optional().or(z.literal("")), // Optional - server generates for new entries
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().default(""),
  imageMediaId: z.number().optional(),
});

type ChapterFormDataInput = z.infer<typeof chapterSchema>;

// Wrapper for checkIdUniqueness with EntryType.Chapter
async function checkChapterIdUniqueness(
  id: string,
  projectId?: string,
  excludeId?: number
): Promise<{ isUnique: boolean; error?: string }> {
  return checkIdUniqueness(EntryType.Chapter, id, projectId, excludeId);
}

// Form sections for sidebar navigation
type FormSection = "basic";

// Get form sections
const getFormSections = (): Array<{ id: FormSection; label: string; icon: typeof User }> => {
  return [
    { id: "basic", label: "Basic Info", icon: User },
  ];
};

export function ChapterForm({
  initialValues = {},
  isEdit = false,
  onSubmit,
  onCancel,
  saving = false,
  submitLabel,
  projectId,
  editEntryId,
  actId,
}: ChapterFormProps) {
  const [activeSection, setActiveSection] = useState<FormSection>("basic");
  const [imageMediaId, setImageMediaId] = useState<number | undefined>(
    typeof initialValues.imageMediaId === 'number'
      ? initialValues.imageMediaId
      : typeof initialValues.imageMediaId === 'object' && initialValues.imageMediaId && 'id' in initialValues.imageMediaId
        ? (initialValues.imageMediaId as { id: number }).id
        : undefined
  );
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const imageUploadRef = useRef<MediaUploadRef | null>(null);

  // Initialize ID from initial values
  const initialId = initialValues.id || "";

  const form = useForm({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      id: initialId,
      name: initialValues.name || "",
      description: initialValues.description || "",
      imageMediaId,
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
    checkIdUniqueness: checkChapterIdUniqueness,
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

  // Scroll to section when active section changes
  useEffect(() => {
    const sectionElement = document.getElementById(`section-${activeSection}`);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeSection]);

  const sections = getFormSections();

  const onSubmitForm = async (data: ChapterFormDataInput) => {
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

    // For new chapters, actId is required
    if (!isEdit && !actId) {
      toast.error("Act ID is required for creating chapters");
      return;
    }

    // Upload pending images before submitting
    let finalImageMediaId = imageMediaId;
    try {
      if (imageUploadRef.current) {
        const uploadedId = await imageUploadRef.current.uploadFile();
        if (uploadedId) {
          finalImageMediaId = uploadedId;
        }
      }
    } catch (error) {
      toast.error(`Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`);
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

    const chapterData: ChapterFormData = {
      id: tempId, // Temporary ID for new entries, real ID for edit mode
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      imageMediaId: finalImageMediaId,
      actId: actId || initialValues.actId,
    };

    onSubmit(chapterData);
  };

  const navItems: SidebarNavItem[] = sections.map((section) => ({
    id: section.id,
    label: section.label,
    icon: section.icon,
  }));

  return (
    <div className="flex" style={{ minHeight: "500px", maxHeight: "70vh" }}>
      {/* Sidebar Navigation */}
      <SidebarNav
        items={navItems}
        activeId={activeSection}
        onItemClick={(id) => setActiveSection(id as FormSection)}
        width="md"
        sticky={true}
      />

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6 p-6">
          {/* Basic Info Section */}
          <BasicInfoSection
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
            idValue={id || ""}
            idPlaceholder="e.g., chapter-1"
            isEdit={isEdit}
            idValidation={idValidation}
            validatingId={validatingId}
            onIdChange={(newId) => {
              setValue("id", newId);
            }}
            nameValue={name}
            namePlaceholder="e.g., Chapter 1"
            descriptionValue={watch("description") || ""}
            descriptionPlaceholder="Chapter description..."
            imageMediaId={imageMediaId}
            imageUrl={imageUrl}
            onImageUploaded={(mediaId) => {
              setImageMediaId(mediaId);
              setValue("imageMediaId", mediaId);
              if (!mediaId) {
                setImageUrl(undefined);
              }
            }}
            saving={saving}
            projectId={projectId}
            editEntryId={editEntryId}
          />

        </form>
      </div>
    </div>
  );
}

export function ChapterFormFooter({
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

