// components/lore/LoreForm.tsx
// Form for creating/editing lore entries (books, stories, documents)

"use client";

import { useState, useRef, useEffect } from "react";
import { ImageUpload } from "@components/ui/ImageUpload";

export interface LoreFormData {
  id?: string;
  title: string;
  content?: string;
  type?: "book" | "scroll" | "journal" | "letter" | "inscription" | "legend" | "history";
  author?: string;
  era?: string;
  imagePath?: string;
}

interface LoreFormProps {
  initialValues?: Partial<LoreFormData>;
  isEdit?: boolean;
  onSubmit: (data: LoreFormData) => void;
  onCancel?: () => void;
  saving?: boolean;
  submitLabel?: string;
}

const LORE_TYPES = [
  { value: "book", label: "Book" },
  { value: "scroll", label: "Scroll" },
  { value: "journal", label: "Journal" },
  { value: "letter", label: "Letter" },
  { value: "inscription", label: "Inscription" },
  { value: "legend", label: "Legend" },
  { value: "history", label: "Historical Record" },
] as const;

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
  const [type, setType] = useState<LoreFormData["type"]>(initialValues.type || "book");
  const [author, setAuthor] = useState(initialValues.author || "");
  const [era, setEra] = useState(initialValues.era || "");
  const [imagePath, setImagePath] = useState<string | undefined>(initialValues.imagePath);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (formRef.current) {
      (formRef.current as any).submitForm = () => formRef.current?.requestSubmit();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    onSubmit({
      title: title.trim(),
      content: content.trim() || undefined,
      type,
      author: author.trim() || undefined,
      era: era.trim() || undefined,
      imagePath,
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <ImageUpload
        currentImagePath={imagePath}
        contentType="lore"
        onImageUploaded={setImagePath}
        label="Cover Image"
        disabled={saving}
        compact
      />

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
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as LoreFormData["type"])}
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
          >
            {LORE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
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

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
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
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onSubmit}
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

