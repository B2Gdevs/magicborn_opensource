// components/ui/BasicInfoSection.tsx
// Reusable component for basic information fields (ID, Name, Description) used across entity forms

"use client";

import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";
import { Hash, User, FileText } from "lucide-react";
import { StandardMediaUpload } from "./StandardMediaUpload";

interface BasicInfoSectionProps {
  // Form registration
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
  
  // ID field
  idValue: string;
  idPlaceholder?: string;
  isEdit?: boolean;
  idValidation?: { isUnique: boolean; error?: string } | null;
  validatingId?: boolean;
  onIdChange?: (id: string) => void;
  
  // Name field
  nameValue: string;
  namePlaceholder?: string;
  
  // Description field
  descriptionValue: string;
  descriptionPlaceholder?: string;
  
  // Image upload
  imageMediaId?: number;
  imageUrl?: string;
  onImageUploaded?: (mediaId: number | undefined) => void;
  
  // Landmark icon upload (optional - for map icons, etc.)
  landmarkIconMediaId?: number;
  landmarkIconUrl?: string;
  onLandmarkIconUploaded?: (mediaId: number | undefined) => void;
  showLandmarkIcon?: boolean; // Whether to show landmark icon field
  
  // State
  saving?: boolean;
  projectId?: string;
  editEntryId?: number;
}

export function BasicInfoSection({
  register,
  watch,
  setValue,
  errors,
  idValue,
  idPlaceholder = "e.g., kael",
  isEdit = false,
  idValidation,
  validatingId = false,
  onIdChange,
  nameValue,
  namePlaceholder = "e.g., Kael",
  descriptionValue,
  descriptionPlaceholder = "A brief description...",
  imageMediaId,
  imageUrl,
  onImageUploaded,
  landmarkIconMediaId,
  landmarkIconUrl,
  onLandmarkIconUploaded,
  showLandmarkIcon = false,
  saving = false,
  projectId,
  editEntryId,
}: BasicInfoSectionProps) {
  const id = watch("id");

  return (
    <>
      {/* Basic Information Section */}
      <section id="section-basic" className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-ember-glow" />
          <h2 className="text-xl font-bold text-glow">Basic Information</h2>
        </div>

        {/* Two-column layout: Images on left, Inputs on right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left column: Images stacked vertically */}
          <div className="space-y-4">
            {/* Main Image */}
            <div>
                          {/* Name Input - First */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
                <User className="w-4 h-4" />
                <span>Name</span>
                <span className="text-ember">*</span>
              </label>
              <input
                type="text"
                {...register("name")}
                className={`w-full px-3 py-2 bg-deep border rounded text-text-primary ${
                  errors.name ? "border-red-500" : "border-border"
                }`}
                placeholder={namePlaceholder}
                disabled={saving}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name.message as string}</p>
              )}
            </div>
              <StandardMediaUpload
                currentMediaId={imageMediaId}
                currentMediaUrl={imageUrl}
                onMediaSelected={(mediaId) => {
                  setValue("imageMediaId", mediaId);
                  onImageUploaded?.(mediaId);
                }}
                label="Main Image"
                disabled={saving}
                size="full"
              />
            </div>
            
            {/* Landmark Icon - if enabled */}
            {showLandmarkIcon && (
              <div>
                <StandardMediaUpload
                  currentMediaId={landmarkIconMediaId}
                  currentMediaUrl={landmarkIconUrl}
                  onMediaSelected={(mediaId) => {
                    setValue("landmarkIconMediaId", mediaId);
                    onLandmarkIconUploaded?.(mediaId);
                  }}
                  label="Landmark Icon"
                  disabled={saving}
                  size="full"
                />
                <p className="text-xs text-text-muted mt-1">
                  Icon displayed on the map for this entity (optional)
                </p>
              </div>
            )}
          </div>

          {/* Right column: Name, ID, and Description fields */}
          <div className="space-y-3">


            {/* ID Display - Subtle, no input box */}
            <div>
              <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
                <Hash className="w-3 h-3" />
                <span>ID</span>
              </div>
              {isEdit && idValue ? (
                <div className="text-sm text-text-muted font-mono px-1">
                  {idValue}
                </div>
              ) : (
                <div className="text-sm text-text-muted/50 italic px-1">
                  Auto-generated when saved
                </div>
              )}
            </div>

            {/* Description Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
                <FileText className="w-4 h-4" />
                <span>Description</span>
              </label>
              <textarea
                {...register("description")}
                className={`w-full px-3 py-2 bg-deep border rounded text-text-primary min-h-[120px] ${
                  errors.description ? "border-red-500" : "border-border"
                }`}
                placeholder={descriptionPlaceholder}
                disabled={saving}
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">{errors.description.message as string}</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

