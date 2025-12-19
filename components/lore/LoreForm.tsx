// components/lore/LoreForm.tsx
// Form for creating/editing lore entries (books, stories, documents)

"use client";

import { useState, useRef, useEffect } from "react";
import { MediaUpload, type MediaUploadRef } from "@components/ui/MediaUpload";

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

export interface LoreFormData {
  id?: string;
  title: string;
  content?: string;
  category?: LoreCategory;
  author?: string;
  era?: string;
  imagePath?: string;
  featuredImage?: number; // Payload Media ID
}

interface LoreFormProps {
  initialValues?: Partial<LoreFormData>;
  isEdit?: boolean;
  onSubmit: (data: LoreFormData) => void;
  onCancel?: () => void;
  saving?: boolean;
  submitLabel?: string;
}

export function LoreForm({
  initialValues = {},
  isEdit = false,
  onSubmit,
  onCancel,
  saving = false,
  submitLabel,
}: LoreFormProps) {
  const [title, setTitle] = useState(initialValues.title || "");
  const [content, setContent] = useState(initialValues.content || "");
  const [category, setCategory] = useState<LoreCategory>(
    initialValues.category || 
    (typeof (initialValues as any).category === 'string' ? (initialValues as any).category as LoreCategory : LoreCategory.History)
  );
  const [author, setAuthor] = useState(initialValues.author || "");
  const [era, setEra] = useState(initialValues.era || "");
  const [featuredImageId, setFeaturedImageId] = useState<number | undefined>(
    typeof initialValues.featuredImage === 'number' 
      ? initialValues.featuredImage 
      : typeof (initialValues as any).featuredImage === 'object' && (initialValues as any).featuredImage?.id
        ? (initialValues as any).featuredImage.id
        : undefined
  );
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | undefined>(initialValues.imagePath);
  const formRef = useRef<HTMLFormElement>(null);
  const imageUploadRef = useRef<MediaUploadRef>(null);

  useEffect(() => {
    if (formRef.current) {
      (formRef.current as any).submitForm = async () => {
        const form = formRef.current as HTMLFormElement & { validateAndSubmit?: () => Promise<void> };
        if (form?.validateAndSubmit) {
          await form.validateAndSubmit();
        } else {
          formRef.current?.requestSubmit();
        }
      };
    }
  }, []);

  // Fetch image URL when editing (only on mount, not after uploads)
  useEffect(() => {
    if (featuredImageId && isEdit) {
      fetch(`/api/payload/media/${featuredImageId}`)
        .then(res => res.json())
        .then(data => {
          if (data.url) {
            const url = data.url;
            if (url.startsWith('http://localhost') || url.startsWith('https://')) {
              try {
                const urlObj = new URL(url);
                setFeaturedImageUrl(urlObj.pathname);
              } catch {
                setFeaturedImageUrl(url);
              }
            } else {
              setFeaturedImageUrl(url.startsWith('/') ? url : `/${url}`);
            }
          }
        })
        .catch(err => console.error("Failed to fetch image:", err));
    } else if (!featuredImageId) {
      setFeaturedImageUrl(undefined);
    }
  }, [featuredImageId, isEdit]);

  // Expose validation function for external submission (used by footer)
  useEffect(() => {
    if (formRef.current) {
      (formRef.current as any).validateAndSubmit = async () => {
        const data = await prepareLore();
        if (data) {
          onSubmit(data);
        }
      };
    }
  }, [title, content, category, author, era, featuredImageId, onSubmit]);

  const prepareLore = async (): Promise<LoreFormData | null> => {
    if (!title.trim()) {
      alert("Title is required");
      return null;
    }

    // Upload pending image before submitting
    let finalFeaturedImageId = featuredImageId;
    try {
      if (imageUploadRef.current) {
        const uploadedId = await imageUploadRef.current.uploadFile();
        if (uploadedId) {
          finalFeaturedImageId = uploadedId;
        }
      }
    } catch (error) {
      alert(`Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`);
      return null;
    }

    return {
      title: title.trim(),
      content: content.trim() || undefined,
      category,
      author: author.trim() || undefined,
      era: era.trim() || undefined,
      imagePath: featuredImageUrl || undefined, // Keep for backward compatibility
      featuredImage: finalFeaturedImageId, // Payload Media ID
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await prepareLore();
    if (data) {
      onSubmit(data);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {/* Image upload inline with Title */}
      <div className="flex gap-4 items-start">
        <MediaUpload
          ref={imageUploadRef}
          currentMediaId={featuredImageId}
          currentMediaUrl={featuredImageUrl}
          onMediaUploaded={(mediaId) => {
            setFeaturedImageId(mediaId);
            if (!mediaId) {
              setFeaturedImageUrl(undefined);
            }
          }}
          label=""
          disabled={saving}
          inline
        />
        <div className="flex-1 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          Title <span className="text-ember">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
          placeholder="e.g., The Founding of Emberholt"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1">
            Category <span className="text-ember">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as LoreCategory)}
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
            required
          >
            {LORE_CATEGORY_OPTIONS.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1">
            Era
          </label>
          <input
            type="text"
            value={era}
            onChange={(e) => setEra(e.target.value)}
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
            placeholder="e.g., First Age"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          Author
        </label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
          placeholder="e.g., Archivist Mira"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary min-h-[120px]"
          placeholder="The ancient texts speak of a time when..."
        />
      </div>
        </div>
      </div>
    </form>
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
    // Find the form and call its validateAndSubmit method
    const form = document.querySelector('form') as HTMLFormElement & { validateAndSubmit?: () => Promise<void> };
    if (form?.validateAndSubmit) {
      await form.validateAndSubmit();
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
        {saving ? "Saving..." : submitLabel || (isEdit ? "Update Lore" : "Create Lore")}
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

