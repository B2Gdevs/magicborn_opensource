// components/object/ObjectForm.tsx
// Form for creating/editing objects/items

"use client";

import { useState, useRef, useEffect } from "react";
import { ImageUpload } from "@components/ui/ImageUpload";

export interface ObjectFormData {
  id?: string;
  name: string;
  description?: string;
  type?: "weapon" | "armor" | "consumable" | "material" | "key" | "artifact" | "misc";
  rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary";
  imagePath?: string;
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
}

const OBJECT_TYPES = [
  { value: "weapon", label: "Weapon" },
  { value: "armor", label: "Armor" },
  { value: "consumable", label: "Consumable" },
  { value: "material", label: "Material" },
  { value: "key", label: "Key Item" },
  { value: "artifact", label: "Artifact" },
  { value: "misc", label: "Miscellaneous" },
] as const;

const RARITIES = [
  { value: "common", label: "Common", color: "text-gray-400" },
  { value: "uncommon", label: "Uncommon", color: "text-green-400" },
  { value: "rare", label: "Rare", color: "text-blue-400" },
  { value: "epic", label: "Epic", color: "text-purple-400" },
  { value: "legendary", label: "Legendary", color: "text-amber-400" },
] as const;

export function ObjectForm({
  initialValues = {},
  isEdit = false,
  onSubmit,
  onCancel,
  saving = false,
  submitLabel,
}: ObjectFormProps) {
  const [name, setName] = useState(initialValues.name || "");
  const [description, setDescription] = useState(initialValues.description || "");
  const [type, setType] = useState<ObjectFormData["type"]>(initialValues.type || "misc");
  const [rarity, setRarity] = useState<ObjectFormData["rarity"]>(initialValues.rarity || "common");
  const [weight, setWeight] = useState<number | undefined>(initialValues.weight);
  const [value, setValue] = useState<number | undefined>(initialValues.value);
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
      rarity,
      weight,
      value,
      imagePath,
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <ImageUpload
        currentImagePath={imagePath}
        contentType="objects"
        onImageUploaded={setImagePath}
        label="Item Image"
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
          placeholder="e.g., Ember Crystal"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ObjectFormData["type"])}
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
          >
            {OBJECT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1">
            Rarity
          </label>
          <select
            value={rarity}
            onChange={(e) => setRarity(e.target.value as ObjectFormData["rarity"])}
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
          >
            {RARITIES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary min-h-[80px]"
          placeholder="A crystallized fragment of pure flame..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1">
            Weight
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={weight ?? ""}
            onChange={(e) => setWeight(e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
            placeholder="0.5"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1">
            Value (Gold)
          </label>
          <input
            type="number"
            min="0"
            value={value ?? ""}
            onChange={(e) => setValue(e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
            placeholder="100"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-4 py-2 bg-ember hover:bg-ember-dark text-white rounded-lg font-semibold disabled:opacity-50"
        >
          {saving ? "Saving..." : submitLabel || (isEdit ? "Update Item" : "Create Item")}
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
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onSubmit}
        disabled={saving}
        className="flex-1 px-4 py-2 bg-ember hover:bg-ember-dark text-white rounded-lg font-semibold disabled:opacity-50"
      >
        {saving ? "Saving..." : submitLabel || (isEdit ? "Update Item" : "Create Item")}
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

