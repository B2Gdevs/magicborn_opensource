// components/ui/BasicInfoSection.tsx
// Reusable component for basic information fields (ID, Name, Description) used across entity forms

"use client";

import { useRef, useState, useEffect } from "react";
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";
import { Hash, User, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { MediaUpload, type MediaUploadRef } from "./MediaUpload";

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
  autoGenerateIdFromName?: boolean;
  
  // Description field
  descriptionValue: string;
  descriptionPlaceholder?: string;
  
  // Image upload
  imageMediaId?: number;
  imageUrl?: string;
  onImageUploaded?: (mediaId: number | undefined) => void;
  imageUploadRef?: React.RefObject<MediaUploadRef | null>;
  
  // Landmark icon upload (optional - for map icons, etc.)
  landmarkIconMediaId?: number;
  landmarkIconUrl?: string;
  onLandmarkIconUploaded?: (mediaId: number | undefined) => void;
  landmarkIconUploadRef?: React.RefObject<MediaUploadRef | null>;
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
  autoGenerateIdFromName = true,
  descriptionValue,
  descriptionPlaceholder = "A brief description...",
  imageMediaId,
  imageUrl,
  onImageUploaded,
  imageUploadRef: externalImageUploadRef,
  landmarkIconMediaId,
  landmarkIconUrl,
  onLandmarkIconUploaded,
  landmarkIconUploadRef: externalLandmarkIconUploadRef,
  showLandmarkIcon = false,
  saving = false,
  projectId,
  editEntryId,
}: BasicInfoSectionProps) {
  const internalImageUploadRef = useRef<MediaUploadRef>(null);
  const internalLandmarkIconUploadRef = useRef<MediaUploadRef>(null);
  const imageUploadRefToUse = externalImageUploadRef || internalImageUploadRef;
  const landmarkIconUploadRefToUse = externalLandmarkIconUploadRef || internalLandmarkIconUploadRef;
  const name = watch("name");
  const id = watch("id");

  // Auto-generate ID from name if enabled
  useEffect(() => {
    if (autoGenerateIdFromName && !isEdit && name && !id) {
      const generatedId = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      if (generatedId) {
        setValue("id", generatedId);
        onIdChange?.(generatedId);
      }
    }
  }, [name, id, isEdit, autoGenerateIdFromName, setValue, onIdChange]);

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
              <MediaUpload
                ref={imageUploadRefToUse as React.RefObject<MediaUploadRef>}
                currentMediaId={imageMediaId}
                currentMediaUrl={imageUrl}
                onMediaUploaded={(mediaId) => {
                  setValue("imageMediaId", mediaId);
                  onImageUploaded?.(mediaId);
                }}
                label="Main Image"
                disabled={saving}
                compact={false}
              />
            </div>
            
            {/* Landmark Icon - if enabled */}
            {showLandmarkIcon && (
              <div>
                <MediaUpload
                  ref={landmarkIconUploadRefToUse as React.RefObject<MediaUploadRef>}
                  currentMediaId={landmarkIconMediaId}
                  currentMediaUrl={landmarkIconUrl}
                  onMediaUploaded={(mediaId) => {
                    setValue("landmarkIconMediaId", mediaId);
                    onLandmarkIconUploaded?.(mediaId);
                  }}
                  label="Landmark Icon"
                  disabled={saving}
                  compact={true}
                />
                <p className="text-xs text-text-muted mt-1">
                  Icon displayed on the map for this entity (optional)
                </p>
              </div>
            )}
          </div>

          {/* Right column: ID and Name fields */}
          <div className="space-y-3">
            {/* ID Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
                <Hash className="w-4 h-4" />
                <span>ID</span>
                <span className="text-ember">*</span>
              </label>
              {isEdit ? (
                <input
                  type="text"
                  value={idValue}
                  disabled
                  className="w-full px-3 py-2 bg-deep/50 border border-border rounded text-text-muted cursor-not-allowed"
                />
              ) : (
                <>
                  <input
                    type="text"
                    {...register("id")}
                    className={`w-full px-3 py-2 bg-deep border rounded text-text-primary ${
                      errors.id ? "border-red-500" : idValidation?.isUnique === false ? "border-red-500" : idValidation?.isUnique ? "border-green-500" : "border-border"
                    }`}
                    placeholder={idPlaceholder}
                    disabled={saving || validatingId}
                  />
                  {validatingId && (
                    <p className="text-xs text-yellow-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Checking availability...
                    </p>
                  )}
                  {idValidation && !validatingId && (
                    <p className={`text-xs mt-1 flex items-center gap-1 ${
                      idValidation.isUnique ? "text-green-500" : "text-red-500"
                    }`}>
                      {idValidation.isUnique ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          ID is available
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" />
                          {idValidation.error || "ID already exists"}
                        </>
                      )}
                    </p>
                  )}
                  {errors.id && (
                    <p className="text-xs text-red-500 mt-1">{errors.id.message as string}</p>
                  )}
                </>
              )}
            </div>

            {/* Name Input */}
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

