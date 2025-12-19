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
  projectId?: string;
  editEntryId?: number; // Payload ID for edit mode
}

export function CharacterForm({
  initialValues = {},
  existingCharacters = [],
  isEdit = false,
  onSubmit,
  onCancel,
  saving = false,
  submitLabel,
  projectId,
  editEntryId,
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

  // Validate and prepare character data
  const prepareCharacter = (): CharacterDefinition | null => {
    if (!id.trim() || !name.trim() || !description.trim()) {
      alert("ID, name, and description are required");
      return null;
    }

    // ID validation is handled by IdInput component

    return {
      id: id.trim().toLowerCase(), // Normalize to lowercase for slug
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
  };

  // Expose validation function for external submission
  useEffect(() => {
    if (formRef.current) {
      (formRef.current as any).validateAndSubmit = () => {
        const character = prepareCharacter();
        if (character) {
          onSubmit(character);
        }
      };
    }
  }, [id, name, description, mana, maxMana, hp, maxHp, affinity, elementXp, elementAffinity, controlBonus, costEfficiency, imagePath, onSubmit]);

  return (
    <form ref={formRef} className="space-y-4">
      <ImageUpload
        currentImagePath={imagePath}
        contentType="characters"
        entityId={id || undefined}
        onImageUploaded={setImagePath}
        label="Character Image"
        disabled={saving}
        compact
      />

      <IdInput
        value={id}
        onChange={setId}
        contentType="characters"
        isEdit={isEdit}
        placeholder="e.g., kael"
        autoGenerateFrom={name}
        disabled={saving}
        projectId={projectId}
        excludeId={isEdit ? editEntryId : undefined}
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
  const handleSubmit = () => {
    // Find the form and call its validateAndSubmit method
    const form = document.querySelector('form') as HTMLFormElement & { validateAndSubmit?: () => void };
    if (form?.validateAndSubmit) {
      form.validateAndSubmit();
    } else {
      // Fallback to direct call if method not available
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

