// components/content-editor/CreateProjectDialog.tsx
// Dialog for creating new projects/books

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Book, Sparkles } from "lucide-react";

interface CreateProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectDialog({ isOpen, onClose }: CreateProjectDialogProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [magicbornMode, setMagicbornMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/payload/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          magicbornMode,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        onClose();
        router.push(`/content-editor/${result.doc?.id || result.id}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || "Failed to create project");
      }
    } catch (err) {
      console.error("Failed to create project:", err);
      setError("Failed to create project. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-shadow border border-border rounded-xl shadow-xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-bold text-glow flex items-center gap-2">
              <Book className="w-5 h-5" />
              Create New Project
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Project Name <span className="text-ember">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My New Novel"
                className="w-full px-3 py-2 bg-deep border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-ember-glow"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of your project..."
                rows={3}
                className="w-full px-3 py-2 bg-deep border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-ember-glow resize-none"
              />
            </div>

            <div className="flex items-start gap-3 p-3 bg-deep/50 border border-border rounded-lg">
              <input
                type="checkbox"
                id="magicbornMode"
                checked={magicbornMode}
                onChange={(e) => setMagicbornMode(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="magicbornMode" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 font-medium text-text-primary">
                  <Sparkles className="w-4 h-4 text-ember-glow" />
                  Enable Magicborn Mode
                </div>
                <p className="text-xs text-text-muted mt-1">
                  Adds game systems like Spells, Runes, Combat Stats, and Regions for interactive storytelling.
                </p>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-deep transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-ember hover:bg-ember-glow text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}



