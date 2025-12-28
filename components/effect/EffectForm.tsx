// components/effect/EffectForm.tsx
// Reusable form component for creating/editing effects with React Hook Form

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { EffectDefinition } from "@/lib/data/effects";
import { EffectCategory } from "@/lib/data/effects";
import { EffectType } from "@core/enums";
import type { EffectBlueprint } from "@core/effects";
import { BasicInfoSection } from "@components/ui/BasicInfoSection";
import { type MediaUploadRef } from "@components/ui/MediaUpload";
import { SidebarNav, type SidebarNavItem } from "@components/ui/SidebarNav";
import { useIdValidation } from "@/lib/hooks/useIdValidation";
import { Zap, User, Save, X } from "lucide-react";
import { checkIdUniqueness } from "@lib/validation/id-validation";
import { EntryType } from "@lib/content-editor/constants";
import { toast } from "@/lib/hooks/useToast";

interface EffectFormProps {
  initialValues?: Partial<EffectDefinition>;
  existingEffects?: EffectDefinition[];
  existingIds?: string[];
  isEdit?: boolean;
  onSubmit: (effect: EffectDefinition) => void;
  onCancel?: () => void;
  saving?: boolean;
  submitLabel?: string;
  projectId?: string;
  editEntryId?: number;
}

// Validation schema - effectType is required (user selects from enum)
const createEffectSchema = () => z.object({
  effectType: z.string().min(1, "Effect Type is required"), // Required - user must select from EffectType enum
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.nativeEnum(EffectCategory),
  isBuff: z.boolean().default(false),
  iconKey: z.string().optional(),
  maxStacks: z.number().min(1).optional(),
  baseMagnitude: z.number().min(0.1, "Base magnitude must be greater than 0"),
  baseDurationSec: z.number().min(0.1, "Base duration must be greater than 0"),
  self: z.boolean().default(false),
  imageMediaId: z.number().optional(),
  landmarkIconMediaId: z.number().optional(),
});

type EffectFormDataInput = z.infer<ReturnType<typeof createEffectSchema>>;

// Wrapper for checkIdUniqueness with EntryType.Effect
async function checkEffectIdUniqueness(
  id: string,
  projectId?: string,
  excludeId?: number
): Promise<{ isUnique: boolean; error?: string }> {
  return checkIdUniqueness(EntryType.Effect, id, projectId, excludeId);
}

const allCategories = Object.values(EffectCategory);
const allEffectTypes = Object.values(EffectType);

// Form sections for sidebar navigation
type FormSection = "basic" | "properties";

// Get form sections
const getFormSections = (): Array<{ id: FormSection; label: string; icon: typeof User }> => {
  return [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "properties", label: "Effect Properties", icon: Zap },
  ];
};

export function EffectForm({
  initialValues = {},
  existingEffects = [],
  existingIds = [],
  isEdit = false,
  onSubmit,
  onCancel,
  saving = false,
  submitLabel,
  projectId,
  editEntryId,
}: EffectFormProps) {
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

  const availableEffectTypes = allEffectTypes.filter(type => !existingIds.includes(type));

  // Create schema - effectType is always required
  const effectSchema = useMemo(() => createEffectSchema(), []);

  const form = useForm({
    resolver: zodResolver(effectSchema),
    defaultValues: {
      effectType: initialValues.effectType || "",
      name: initialValues.name || "",
      description: initialValues.description || "",
      category: initialValues.category || EffectCategory.DamageOverTime,
      isBuff: initialValues.isBuff ?? false,
      iconKey: initialValues.iconKey || "",
      maxStacks: initialValues.maxStacks,
      baseMagnitude: initialValues.blueprint?.baseMagnitude || 0,
      baseDurationSec: initialValues.blueprint?.baseDurationSec || 0,
      self: initialValues.blueprint?.self || false,
      imageMediaId,
      landmarkIconMediaId,
    },
  });

  const { register, handleSubmit, watch, setValue, setError, clearErrors, formState: { errors } } = form;
  const name = watch("name");
  const effectType = watch("effectType") || "";

  // Use reusable ID validation hook (for effectType uniqueness)
  const { idValidation, validatingId } = useIdValidation({
    id: effectType, // Validate effectType uniqueness
    isEdit,
    projectId,
    editEntryId,
    checkIdUniqueness: checkEffectIdUniqueness,
    setError: (field, error) => setError("effectType" as any, error),
    clearErrors: () => clearErrors("effectType" as any),
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

  const onSubmitForm = async (data: EffectFormDataInput) => {
    console.log("[EffectForm] onSubmitForm called with data:", data);
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

    // effectType is required (user must select from enum)
    if (!data.effectType || !data.effectType.trim()) {
      toast.error("Effect Type is required. Please select an effect type.");
      return;
    }

    // Validate uniqueness if validation was performed
    if (idValidation && !idValidation.isUnique) {
      toast.error(idValidation.error || "Effect Type validation failed. Please choose a different type.");
      return;
    }

    const selectedEffectType = data.effectType as EffectType;

    const blueprint: EffectBlueprint = {
      type: selectedEffectType,
      baseMagnitude: data.baseMagnitude,
      baseDurationSec: data.baseDurationSec,
      self: data.self || undefined,
    };

    const effect: EffectDefinition = {
      id: "", // Auto-generated by server (string slug)
      effectType: selectedEffectType, // User-selected enum value
      name: data.name.trim(),
      description: data.description.trim(),
      category: data.category,
      isBuff: data.isBuff,
      blueprint,
      iconKey: data.iconKey?.trim() || undefined,
      maxStacks: data.maxStacks && data.maxStacks > 0 ? data.maxStacks : undefined,
      imageId: finalImageMediaId,
      landmarkIconId: finalLandmarkIconMediaId,
    };

    onSubmit(effect);
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
        <form data-entry-form onSubmit={handleSubmit(onSubmitForm, (errors) => {
          console.log("[EffectForm] Validation errors:", errors);
          // Show toast with validation errors
          const errorMessages = Object.values(errors).map(err => err?.message).filter(Boolean);
          if (errorMessages.length > 0) {
            toast.error(`Validation failed: ${errorMessages.join(", ")}`);
          }
        })} className="space-y-6 p-6">
          {/* Basic Info Section */}
          <BasicInfoSection
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
            idValue="" // ID is auto-generated, hidden
            idPlaceholder="Auto-generated"
            isEdit={isEdit}
            idValidation={null}
            validatingId={false}
            onIdChange={() => {}} // No-op - ID is auto-generated
            nameValue={name}
            namePlaceholder="e.g., Burn"
            descriptionValue={watch("description") || ""}
            descriptionPlaceholder="Takes periodic fire damage over time."
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

          {/* Effect-Specific Fields */}
          <section id="section-properties" className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-ember-glow" />
          <h2 className="text-xl font-bold text-glow">Effect Properties</h2>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
            <span>Effect Type</span>
            <span className="text-ember">*</span>
          </label>
          <select
            {...register("effectType")}
            disabled={isEdit} // Can't change effectType when editing
            className={`w-full px-3 py-2 bg-deep border rounded text-text-primary ${
              errors.effectType ? "border-red-500" : "border-border"
            } ${isEdit ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <option value="">Select Effect Type...</option>
            {availableEffectTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
          {errors.effectType && (
            <p className="text-xs text-red-500 mt-1">{errors.effectType.message as string}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
              <span>Category</span>
              <span className="text-ember">*</span>
            </label>
            <select
              {...register("category")}
              className={`w-full px-3 py-2 bg-deep border rounded text-text-primary ${
                errors.category ? "border-red-500" : "border-border"
              }`}
            >
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-red-500 mt-1">{errors.category.message as string}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
              <span>Max Stacks (optional)</span>
            </label>
            <input
              type="number"
              min="1"
              {...register("maxStacks", { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              placeholder="e.g., 3"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isBuff"
            {...register("isBuff")}
            className="w-4 h-4"
          />
          <label htmlFor="isBuff" className="text-sm text-text-secondary">
            Is Buff (checked) / Is Debuff (unchecked)
          </label>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
            <span>Icon Key (optional)</span>
          </label>
          <input
            type="text"
            {...register("iconKey")}
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
            placeholder="e.g., effect_burn"
          />
        </div>

        <div className="border-t border-border pt-4">
          <h3 className="text-lg font-semibold text-glow mb-3">Blueprint</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
                <span>Base Magnitude</span>
                <span className="text-ember">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                {...register("baseMagnitude", { valueAsNumber: true })}
                className={`w-full px-3 py-2 bg-deep border rounded text-text-primary ${
                  errors.baseMagnitude ? "border-red-500" : "border-border"
                }`}
              />
              {errors.baseMagnitude && (
                <p className="text-xs text-red-500 mt-1">{errors.baseMagnitude.message as string}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
                <span>Base Duration (seconds)</span>
                <span className="text-ember">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                {...register("baseDurationSec", { valueAsNumber: true })}
                className={`w-full px-3 py-2 bg-deep border rounded text-text-primary ${
                  errors.baseDurationSec ? "border-red-500" : "border-border"
                }`}
              />
              {errors.baseDurationSec && (
                <p className="text-xs text-red-500 mt-1">{errors.baseDurationSec.message as string}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                {...register("self")}
                className="w-4 h-4"
              />
              Self (applies to caster)
            </label>
          </div>
        </div>
      </section>
        </form>
      </div>
    </div>
  );
}

export function EffectFormFooter({
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
    console.log("[EffectFormFooter] handleSubmit called");
    const form = document.querySelector('form[data-entry-form]') as HTMLFormElement;
    console.log("[EffectFormFooter] Found form:", form);
    if (form) {
      console.log("[EffectFormFooter] Calling form.requestSubmit()");
      form.requestSubmit();
    } else {
      console.log("[EffectFormFooter] No form found, calling onSubmit()");
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
