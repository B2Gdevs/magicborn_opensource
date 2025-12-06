// components/creature/CreatureForm.tsx
// Reusable form component for creating/editing creatures

"use client";

import { useState, useRef, useEffect } from "react";
import type { CreatureDefinition } from "@/lib/data/creatures";
import type { AlphabetVector } from "@core/types";
import type { ElementXpMap, ElementAffinityMap } from "@/lib/packages/player/AffinityService";
import { ImageUpload } from "@components/ui/ImageUpload";
import { CombatStatsEditor } from "@components/ui/CombatStatsEditor";
import { IdInput, validateIdBeforeSubmit } from "@components/ui/IdInput";

interface CreatureFormProps {
  initialValues?: Partial<CreatureDefinition>;
  isEdit?: boolean;
  onSubmit: (creature: CreatureDefinition) => void;
  onCancel?: () => void;
  saving?: boolean;
  submitLabel?: string;
}

export function CreatureForm({
  initialValues = {},
  isEdit = false,
  onSubmit,
  onCancel,
  saving = false,
  submitLabel,
}: CreatureFormProps) {
  const [id, setId] = useState(initialValues.id || "");
  const [name, setName] = useState(initialValues.name || "");
  const [description, setDescription] = useState(initialValues.description || "");
  const [hp, setHp] = useState(initialValues.hp ?? 100);
  const [maxHp, setMaxHp] = useState(initialValues.maxHp ?? 100);
  const [mana, setMana] = useState(initialValues.mana ?? 50);
  const [maxMana, setMaxMana] = useState(initialValues.maxMana ?? 50);
  const [affinity, setAffinity] = useState<AlphabetVector>(initialValues.affinity || {});
  const [elementXp, setElementXp] = useState<ElementXpMap>(initialValues.elementXp || {});
  const [elementAffinity, setElementAffinity] = useState<ElementAffinityMap>(initialValues.elementAffinity || {});
  const [imagePath, setImagePath] = useState<string | undefined>(initialValues.imagePath);
  const formRef = useRef<HTMLFormElement>(null);

  // Expose form submit handler for Modal footer
  useEffect(() => {
    if (formRef.current) {
      (formRef.current as any).submitForm = () => {
        formRef.current?.requestSubmit();
      };
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) { alert("Name is required"); return; }
    if (!description.trim()) { alert("Description is required"); return; }

    // Note: ID validation is handled by IdInput component
    // We still need to check if ID is provided
    if (!id.trim()) { alert("ID is required"); return; }

    const creature: CreatureDefinition = {
      id,
      name,
      description,
      imagePath,
      hp,
      maxHp,
      mana,
      maxMana,
      affinity,
      effects: [], // Effects are runtime state
      storyIds: [], // Stories are managed separately in the detail view
      ...(Object.keys(elementXp).length > 0 ? { elementXp } : {}),
      ...(Object.keys(elementAffinity).length > 0 ? { elementAffinity } : {}),
    };

    onSubmit(creature);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <ImageUpload
        currentImagePath={imagePath}
        contentType="creatures"
        entityId={id || undefined}
        onImageUploaded={setImagePath}
        label="Creature Image"
        disabled={saving}
      />

      <IdInput
        value={id}
        onChange={setId}
        contentType="creatures"
        isEdit={isEdit}
        placeholder="e.g., shadow-beast"
        autoGenerateFrom={name}
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
          placeholder="e.g., Shadow Beast"
          required
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
          placeholder="A brief description of the creature..."
          required
        />
      </div>

      <CombatStatsEditor
        hp={hp}
        maxHp={maxHp}
        mana={mana}
        maxMana={maxMana}
        onHpChange={setHp}
        onMaxHpChange={setMaxHp}
        onManaChange={setMana}
        onMaxManaChange={setMaxMana}
        affinity={affinity}
        onAffinityChange={setAffinity}
        elementXp={elementXp}
        elementAffinity={elementAffinity}
        onElementXpChange={setElementXp}
        onElementAffinityChange={setElementAffinity}
      />
    </form>
  );
}

// Export footer component for use in Modal
export function CreatureFormFooter({
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
        {saving ? "Saving..." : submitLabel || (isEdit ? "Update Creature" : "Create Creature")}
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

