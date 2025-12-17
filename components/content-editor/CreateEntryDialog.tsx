// components/content-editor/CreateEntryDialog.tsx
// Dialog for creating new Codex entries (Characters, Regions, Objects, Stories, etc.)

"use client";

import { useState } from "react";
import { X, Loader2, User, MapPin, Package, BookOpen, Sparkles, Gem, Zap } from "lucide-react";

interface CreateEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  category?: string | null;
  onSuccess?: () => void;
}

const categoryConfig: Record<string, { name: string; icon: React.ReactNode; collection: string }> = {
  characters: { name: "Character", icon: <User className="w-5 h-5" />, collection: "characters" },
  regions: { name: "Region", icon: <MapPin className="w-5 h-5" />, collection: "regions" },
  objects: { name: "Object/Item", icon: <Package className="w-5 h-5" />, collection: "objects" },
  stories: { name: "Book/Story", icon: <BookOpen className="w-5 h-5" />, collection: "stories" },
  spells: { name: "Spell", icon: <Sparkles className="w-5 h-5" />, collection: "spells" },
  runes: { name: "Rune", icon: <Gem className="w-5 h-5" />, collection: "runes" },
  effects: { name: "Effect", icon: <Zap className="w-5 h-5" />, collection: "effects" },
};

export function CreateEntryDialog({ isOpen, onClose, projectId, category, onSuccess }: CreateEntryDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState(category || "characters");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const config = categoryConfig[selectedCategory] || categoryConfig.characters;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/payload/${config.collection}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          project: projectId,
        }),
      });

      if (response.ok) {
        setName("");
        setDescription("");
        onSuccess?.();
        onClose();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || "Failed to create entry");
      }
    } catch (err) {
      console.error("Failed to create entry:", err);
      setError("Failed to create entry. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setError(null);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={handleClose} />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-shadow border border-border rounded-xl shadow-xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-bold text-glow flex items-center gap-2">
              {config.icon}
              New {config.name}
            </h2>
            <button onClick={handleClose} className="p-1 text-text-muted hover:text-text-primary transition-colors">
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
                Name <span className="text-ember">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Enter ${config.name.toLowerCase()} name...`}
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
                placeholder="Brief description..."
                rows={3}
                className="w-full px-3 py-2 bg-deep border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-ember-glow resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-deep transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-ember hover:bg-ember-glow text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

