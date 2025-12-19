// components/region/RegionForm.tsx
// Form for creating/editing regions (locations)

"use client";

import { useState, useRef, useEffect } from "react";
import { ImageUpload } from "@components/ui/ImageUpload";
import { IdInput } from "@components/ui/IdInput";

export interface RegionFormData {
  id?: string;
  name: string;
  description?: string;
  type?: "world" | "continent" | "region" | "city" | "district" | "building" | "room";
  parentId?: string;
  imagePath?: string;
  climate?: string;
  terrain?: string;
  population?: string;
}

interface RegionFormProps {
  initialValues?: Partial<RegionFormData>;
  isEdit?: boolean;
  onSubmit: (data: RegionFormData) => void;
  onCancel?: () => void;
  saving?: boolean;
  submitLabel?: string;
}

const REGION_TYPES = [
  { value: "world", label: "World" },
  { value: "continent", label: "Continent" },
  { value: "region", label: "Region" },
  { value: "city", label: "City" },
  { value: "district", label: "District" },
  { value: "building", label: "Building" },
  { value: "room", label: "Room" },
] as const;

export function RegionForm({
  initialValues = {},
  isEdit = false,
  onSubmit,
  onCancel,
  saving = false,
  submitLabel,
}: RegionFormProps) {
  const [name, setName] = useState(initialValues.name || "");
  const [description, setDescription] = useState(initialValues.description || "");
  const [type, setType] = useState<RegionFormData["type"]>(initialValues.type || "region");
  const [climate, setClimate] = useState(initialValues.climate || "");
  const [terrain, setTerrain] = useState(initialValues.terrain || "");
  const [population, setPopulation] = useState(initialValues.population || "");
  const [imagePath, setImagePath] = useState<string | undefined>(initialValues.imagePath);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (formRef.current) {
      (formRef.current as any).submitForm = () => formRef.current?.requestSubmit();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Name is required");
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      type,
      climate: climate.trim() || undefined,
      terrain: terrain.trim() || undefined,
      population: population.trim() || undefined,
      imagePath,
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <ImageUpload
        currentImagePath={imagePath}
        contentType="regions"
        onImageUploaded={setImagePath}
        label="Region Image"
        disabled={saving}
        compact
      />

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          Name <span className="text-ember">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
          placeholder="e.g., The Ember Wastes"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as RegionFormData["type"])}
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
        >
          {REGION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary min-h-[80px]"
          placeholder="A vast desert of crimson sand..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1">
            Climate
          </label>
          <input
            type="text"
            value={climate}
            onChange={(e) => setClimate(e.target.value)}
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
            placeholder="e.g., Arid"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1">
            Terrain
          </label>
          <input
            type="text"
            value={terrain}
            onChange={(e) => setTerrain(e.target.value)}
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
            placeholder="e.g., Desert"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          Population
        </label>
        <input
          type="text"
          value={population}
          onChange={(e) => setPopulation(e.target.value)}
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
          placeholder="e.g., Sparse nomadic tribes"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-4 py-2 bg-ember hover:bg-ember-dark text-white rounded-lg font-semibold disabled:opacity-50"
        >
          {saving ? "Saving..." : submitLabel || (isEdit ? "Update Region" : "Create Region")}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export function RegionFormFooter({
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
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onSubmit}
        disabled={saving}
        className="flex-1 px-4 py-2 bg-ember hover:bg-ember-dark text-white rounded-lg font-semibold disabled:opacity-50"
      >
        {saving ? "Saving..." : submitLabel || (isEdit ? "Update Region" : "Create Region")}
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold disabled:opacity-50"
        >
          Cancel
        </button>
      )}
    </div>
  );
}

