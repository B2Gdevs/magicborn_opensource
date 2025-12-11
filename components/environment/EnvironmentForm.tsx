// components/environment/EnvironmentForm.tsx
// Form for creating/editing environments

"use client";

import { useState, useEffect } from "react";
import { IdInput } from "@/components/ui/IdInput";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { storiesClient } from "@/lib/api/clients";
import type { EnvironmentDefinition } from "@/lib/data/environments";

interface EnvironmentFormProps {
  initialValues?: EnvironmentDefinition;
  isEdit?: boolean;
  onSubmit: (environment: EnvironmentDefinition) => void;
  onCancel: () => void;
  saving: boolean;
}

export function EnvironmentForm({
  initialValues,
  isEdit = false,
  onSubmit,
  onCancel,
  saving,
}: EnvironmentFormProps) {
  const [id, setId] = useState(initialValues?.id || "");
  const [name, setName] = useState(initialValues?.name || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [imagePath, setImagePath] = useState(initialValues?.imagePath || "");
  const [biome, setBiome] = useState(initialValues?.metadata?.biome || "");
  const [climate, setClimate] = useState(initialValues?.metadata?.climate || "");
  const [dangerLevel, setDangerLevel] = useState(initialValues?.metadata?.dangerLevel || 1);
  const [availableStories, setAvailableStories] = useState<string[]>([]);
  const [selectedStoryIds, setSelectedStoryIds] = useState<string[]>(initialValues?.storyIds || []);

  useEffect(() => {
    async function loadStories() {
      try {
        const stories = await storiesClient.list();
        setAvailableStories(stories);
      } catch (error) {
        console.error("Failed to load stories:", error);
      }
    }
    loadStories();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const environment: EnvironmentDefinition = {
      id,
      name,
      description,
      imagePath: imagePath || undefined,
      mapIds: initialValues?.mapIds || [], // Maps are managed separately
      storyIds: selectedStoryIds,
      metadata: {
        biome,
        climate,
        dangerLevel,
      },
    };

    onSubmit(environment);
  };

  const toggleStory = (storyId: string) => {
    setSelectedStoryIds((prev) =>
      prev.includes(storyId)
        ? prev.filter((id) => id !== storyId)
        : [...prev, storyId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" id="environment-form">
      <IdInput
        value={id}
        onChange={setId}
        contentType="environments"
        isEdit={isEdit}
        autoGenerateFrom={name}
        placeholder="e.g., tarro"
        label="Template ID"
        disabled={saving}
      />

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
          placeholder="e.g., Tarro"
          required
          disabled={saving}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          Description *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary min-h-[80px]"
          placeholder="Describe this environment..."
          required
          disabled={saving}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          Icon Image (Optional)
        </label>
        <p className="text-xs text-text-muted mb-2">
          Optional reference icon for this environment template. Maps have their own images.
        </p>
        <ImageUpload
          currentImagePath={imagePath}
          contentType="environments"
          entityId={id || "new"}
          onImageUploaded={setImagePath}
          label=""
          disabled={saving}
        />
      </div>

      <div className="border-t border-border pt-4">
        <h3 className="text-lg font-semibold text-text-primary mb-2">Environment Characteristics</h3>
        <p className="text-sm text-text-muted mb-3">
          These properties define the environmental characteristics that will be applied to maps using this template.
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Biome *
            </label>
            <input
              type="text"
              value={biome}
              onChange={(e) => setBiome(e.target.value)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              placeholder="e.g., Town, Forest, Desert"
              required
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Climate *
            </label>
            <input
              type="text"
              value={climate}
              onChange={(e) => setClimate(e.target.value)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              placeholder="e.g., Temperate, Arid, Cold"
              required
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Danger Level *
            </label>
            <input
              type="number"
              value={dangerLevel}
              onChange={(e) => setDangerLevel(Number(e.target.value))}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              min={0}
              max={10}
              required
              disabled={saving}
            />
            <p className="text-xs text-text-muted mt-1">
              0 = Safe, 10 = Extremely Dangerous
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h3 className="text-lg font-semibold text-text-primary mb-3">Associated Stories</h3>
        <p className="text-sm text-text-muted mb-3">
          Select story files from <code className="text-xs bg-deep px-1 py-0.5 rounded">mordreds_legacy/stories</code>
        </p>
        
        {availableStories.length === 0 ? (
          <p className="text-sm text-text-muted">No stories found. Add markdown files to the stories folder.</p>
        ) : (
          <div className="max-h-48 overflow-y-auto border border-border rounded p-2 space-y-2">
            {availableStories.map((storyId) => (
              <label
                key={storyId}
                className="flex items-center gap-2 p-2 hover:bg-deep rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedStoryIds.includes(storyId)}
                  onChange={() => toggleStory(storyId)}
                  className="rounded border-border"
                  disabled={saving}
                />
                <span className="text-sm text-text-primary">{storyId}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}


