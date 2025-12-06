// components/character/CharacterForm.tsx
// Reusable form component for creating/editing characters

"use client";

import { useState, useEffect, useRef } from "react";
import type { CharacterDefinition } from "@/lib/data/characters";
import type { AlphabetVector } from "@core/types";
import type { ElementXpMap, ElementAffinityMap } from "@/lib/packages/player/AffinityService";
import { ImageUpload } from "@components/ui/ImageUpload";
import { CombatStatsEditor } from "@components/ui/CombatStatsEditor";
import { IdInput } from "@components/ui/IdInput";

interface CharacterFormProps {
  initialValues?: Partial<CharacterDefinition>;
  existingCharacters?: CharacterDefinition[];
  isEdit?: boolean;
  onSubmit: (character: CharacterDefinition) => void;
  onCancel?: () => void;
  saving?: boolean;
  submitLabel?: string;
}

export function CharacterForm({
  initialValues = {},
  existingCharacters = [],
  isEdit = false,
  onSubmit,
  onCancel,
  saving = false,
  submitLabel,
}: CharacterFormProps) {
  const [id, setId] = useState(initialValues.id || "");
  const [name, setName] = useState(initialValues.name || "");
  const [description, setDescription] = useState(initialValues.description || "");
  const [mana, setMana] = useState(initialValues.mana ?? 0);
  const [maxMana, setMaxMana] = useState(initialValues.maxMana ?? 0);
  const [hp, setHp] = useState(initialValues.hp ?? 0);
  const [maxHp, setMaxHp] = useState(initialValues.maxHp ?? 0);
  const [affinity, setAffinity] = useState<AlphabetVector>(initialValues.affinity || {});
  const [elementXp, setElementXp] = useState<ElementXpMap>(initialValues.elementXp || {});
  const [elementAffinity, setElementAffinity] = useState<ElementAffinityMap>(initialValues.elementAffinity || {});
  const [controlBonus, setControlBonus] = useState<number | undefined>(initialValues.controlBonus);
  const [costEfficiency, setCostEfficiency] = useState<number | undefined>(initialValues.costEfficiency);
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


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!id.trim() || !name.trim() || !description.trim()) {
      alert("ID, name, and description are required");
      return;
    }

    // ID validation is handled by IdInput component

    const character: CharacterDefinition = {
      id: id.trim(),
      name: name.trim(),
      description: description.trim(),
      mana,
      maxMana,
      hp,
      maxHp,
      affinity,
      effects: [], // Effects are runtime state, not stored in definition
      storyIds: [], // Stories are managed separately in the detail view
      ...(Object.keys(elementXp).length > 0 ? { elementXp } : {}),
      ...(Object.keys(elementAffinity).length > 0 ? { elementAffinity } : {}),
      ...(controlBonus !== undefined ? { controlBonus } : {}),
      ...(costEfficiency !== undefined ? { costEfficiency } : {}),
      ...(imagePath ? { imagePath } : {}),
    };

    onSubmit(character);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <ImageUpload
        currentImagePath={imagePath}
        contentType="characters"
        entityId={id || undefined}
        onImageUploaded={setImagePath}
        label="Character Image"
        disabled={saving}
      />

      <IdInput
        value={id}
        onChange={setId}
        contentType="characters"
        isEdit={isEdit}
        placeholder="e.g., kael"
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
          placeholder="e.g., Kael"
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
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary min-h-[100px]"
          placeholder="Character description..."
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
        controlBonus={controlBonus}
        costEfficiency={costEfficiency}
        onControlBonusChange={setControlBonus}
        onCostEfficiencyChange={setCostEfficiency}
      />

    </form>
  );
}

// Export footer component for use in Modal
export function CharacterFormFooter({
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
        {saving ? "Saving..." : submitLabel || (isEdit ? "Update Character" : "Create Character")}
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

