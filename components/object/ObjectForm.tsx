// components/object/ObjectForm.tsx
// Form for creating/editing objects/items

"use client";

import { useState, useRef, useEffect } from "react";
import { MediaUpload, type MediaUploadRef } from "@components/ui/MediaUpload";
import { IdInput } from "@components/ui/IdInput";

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

// Helper to convert name to slug (e.g., "Ember Crystal" -> "ember-crystal")
function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
  const [name, setName] = useState(initialValues.name || "");
  const [slug, setSlug] = useState(initialValues.slug || (initialValues.name ? nameToSlug(initialValues.name) : ""));
  const [description, setDescription] = useState(initialValues.description || "");
  const [type, setType] = useState<ObjectType>(initialValues.type || ObjectType.Misc);
  const [rarity, setRarity] = useState<ItemRarity>(initialValues.rarity || ItemRarity.Common);
  const [weight, setWeight] = useState<number | undefined>(initialValues.weight);
  const [value, setValue] = useState<number | undefined>(initialValues.value);
  const [imageMediaId, setImageMediaId] = useState<number | undefined>(
    typeof initialValues.image === 'number' 
      ? initialValues.image 
      : typeof initialValues.image === 'object' && initialValues.image?.id
        ? initialValues.image.id
        : undefined
  );
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialValues.imagePath);
  const formRef = useRef<HTMLFormElement>(null);
  const imageUploadRef = useRef<MediaUploadRef>(null);

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEdit && name) {
      setSlug(nameToSlug(name));
    }
  }, [name, isEdit]);

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

  // Validate and prepare object data
  const prepareObject = async (): Promise<ObjectFormData | null> => {
    if (!name.trim()) {
      alert("Name is required");
      return null;
    }

    if (!slug.trim()) {
      alert("Slug is required");
      return null;
    }

    // Upload pending image before submitting
    let finalImageMediaId = imageMediaId;
    try {
      if (imageUploadRef.current) {
        const uploadedId = await imageUploadRef.current.uploadFile();
        if (uploadedId) {
          finalImageMediaId = uploadedId;
        }
      }
    } catch (error) {
      alert(`Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`);
      return null;
    }

    return {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      type,
      rarity,
      weight,
      value,
      imagePath: imageUrl || undefined, // Keep for backward compatibility
      image: finalImageMediaId, // Payload Media ID
    };
  };

  // Expose validation function for external submission (used by footer)
  useEffect(() => {
    if (formRef.current) {
      (formRef.current as any).validateAndSubmit = async () => {
        const data = await prepareObject();
        if (data) {
          onSubmit(data);
        }
      };
    }
  }, [name, slug, description, type, rarity, weight, value, imageMediaId, onSubmit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await prepareObject();
    if (data) {
      onSubmit(data);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <MediaUpload
        ref={imageUploadRef}
        currentMediaId={imageMediaId}
        currentMediaUrl={imageUrl}
        onMediaUploaded={(mediaId) => {
          setImageMediaId(mediaId);
          if (!mediaId) {
            setImageUrl(undefined);
          }
        }}
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

      {!isEdit && (
        <IdInput
          value={slug}
          onChange={setSlug}
          contentType="objects"
          isEdit={false}
          placeholder="Auto-generated from name"
          label="Slug (auto-generated from name)"
          projectId={projectId}
          disabled={false}
        />
      )}
      {isEdit && (
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            disabled
            className="w-full px-3 py-2 bg-deep/50 border border-border rounded text-text-muted cursor-not-allowed"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ObjectType)}
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
          >
            {OBJECT_TYPE_OPTIONS.map((t) => (
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
            onChange={(e) => setRarity(e.target.value as ItemRarity)}
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
          >
            {ITEM_RARITY_OPTIONS.map((r) => (
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
  const handleSubmit = async () => {
    // Find the form and call its validateAndSubmit method
    const form = document.querySelector('form') as HTMLFormElement & { validateAndSubmit?: () => void };
    if (form?.validateAndSubmit) {
      form.validateAndSubmit();
    } else {
      onSubmit();
    }
  };

  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={handleSubmit}
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

