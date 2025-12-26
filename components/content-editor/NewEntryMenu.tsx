// components/content-editor/NewEntryMenu.tsx
// Dropdown menu for creating new Codex entries - opens proper form modals

"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { CharacterForm, CharacterFormFooter } from "@/components/character/CharacterForm";
import { CreatureForm, CreatureFormFooter } from "@/components/creature/CreatureForm";
import { RuneForm } from "@/components/rune/RuneForm";
import { RuneFormFooter } from "@/components/rune/RuneFormFooter";
import { RegionForm, RegionFormFooter, type RegionFormData } from "@/components/region/RegionForm";
import { ObjectForm, ObjectFormFooter, type ObjectFormData } from "@/components/object/ObjectForm";
import { LoreForm, LoreFormFooter, type LoreFormData } from "@/components/lore/LoreForm";
import { EffectForm, EffectFormFooter } from "@/components/effect/EffectForm";
import { SpellForm, SpellFormFooter } from "@/components/spell/SpellForm";
import type { CharacterDefinition } from "@/lib/data/characters";
import type { CreatureDefinition } from "@/lib/data/creatures";
import type { RuneDef } from "@/lib/packages/runes";
import type { EffectDefinition } from "@/lib/data/effects";
import type { NamedSpellBlueprint } from "@/lib/data/namedSpells";
import type { EffectInstance } from "@core/effects";
import {
  EntryType,
  CodexCategory,
  CATEGORY_TO_ENTRY_TYPE,
  CATEGORY_TO_COLLECTION,
  ENTRY_TYPE_TO_CATEGORY,
} from "@/lib/content-editor/constants";
import { toast } from "@/lib/hooks/useToast";
import {
  getAllEntryTypes,
  getEntryConfig,
  getCollectionForEntryType,
  getCategoryForEntryType,
  CharacterFields,
  getDisplayName,
  useProjectConfigs,
} from "@/lib/content-editor/entry-config";
import { Collections } from "@/lib/payload/constants.client";

interface NewEntryMenuProps {
  projectId: string;
  isMagicbornMode: boolean;
  onEntryCreated?: (category: string) => void;
  triggerType?: string | null;
  onTriggerHandled?: () => void;
  editEntry?: { categoryId: string; entryId: string } | null;
  onEditClosed?: () => void;
}

export function NewEntryMenu({
  projectId,
  isMagicbornMode,
  onEntryCreated,
  triggerType,
  onTriggerHandled,
  editEntry,
  onEditClosed,
}: NewEntryMenuProps) {
  const queryClient = useQueryClient();
  const [activeModal, setActiveModal] = useState<EntryType | null>(null);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<unknown>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const projectConfigs = useProjectConfigs(projectId);

  const availableTypes = getAllEntryTypes(isMagicbornMode);

  // Helper to invalidate React Query cache for a category
  const invalidateCategory = (category: CodexCategory) => {
    queryClient.invalidateQueries({
      queryKey: ["codexEntries", category, projectId],
    });
    onEntryCreated?.(category);
  };

  // Handle programmatic trigger from context menu
  useEffect(() => {
    if (triggerType && availableTypes.some((t) => t.id === triggerType)) {
      setActiveModal(triggerType as EntryType);
      onTriggerHandled?.();
    }
  }, [triggerType, onTriggerHandled, availableTypes]);

  // Handle edit entry
  useEffect(() => {
    if (editEntry) {
      const entryType = CATEGORY_TO_ENTRY_TYPE[editEntry.categoryId as CodexCategory];
      const collection = CATEGORY_TO_COLLECTION[editEntry.categoryId as CodexCategory];

      if (entryType && collection) {
        setLoadingEdit(true);
        fetch(`/api/payload/${collection}/${editEntry.entryId}`)
          .then((res) => res.json())
          .then((data) => {
            setEditData(data);
            setActiveModal(entryType);
          })
          .catch((err) => {
            console.error("Failed to load entry:", err);
            toast.error("Failed to load entry for editing");
            onEditClosed?.();
          })
          .finally(() => setLoadingEdit(false));
      }
    } else {
      setEditData(null);
    }
  }, [editEntry, onEditClosed]);

  const closeModal = () => {
    setActiveModal(null);
    setSaving(false);
    setEditData(null);
    setIsDeleting(false);
    onEditClosed?.();
  };

  // Generic delete handler
  const handleDelete = async () => {
    if (!editData || !activeModal || typeof editData !== "object" || !("id" in editData)) return;

    const collection = getCollectionForEntryType(activeModal);
    if (!collection) {
      toast.error("Unable to determine collection for deletion");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/payload/${collection}/${editData.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(error.error || "Failed to delete");
      }

      closeModal();
      const category = getCategoryForEntryType(activeModal);
      invalidateCategory(category);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(`Failed to delete: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Generic save handler
  const createSaveHandler = <T,>(
    entryType: EntryType,
    transformData: (data: T) => Record<string, unknown>
  ) => {
    return async (data: T) => {
      if (saving) return;
      setSaving(true);
      try {
        const isEdit = !!editData && !!editEntry;
        const collection = getCollectionForEntryType(entryType);
        const url = isEdit
          ? `/api/payload/${collection}/${(editData as { id: number | string }).id}`
          : `/api/payload/${collection}`;

        const payloadData = {
          ...transformData(data),
          project: parseInt(projectId),
        };

        const res = await fetch(url, {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadData),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            err.errors?.[0]?.message ||
              err.error ||
              err.message ||
              `Failed to ${isEdit ? "update" : "create"} ${entryType}`
          );
        }

        const category = getCategoryForEntryType(entryType);
        invalidateCategory(category);
        closeModal();
      } catch (error) {
        console.error(`Failed to save ${entryType}:`, error);
        toast.error(
          `Failed to save ${entryType}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      } finally {
        setSaving(false);
      }
    };
  };

  // Transformers: Payload -> Form Data
  const payloadToCharacter = (payload: unknown): Partial<CharacterDefinition> => {
    if (typeof payload !== "object" || !payload) return {};
    const p = payload as Record<string, unknown>;
    const combatStats = ((p.combatStats as Record<string, unknown>) || {}) as {
      hp?: number;
      maxHp?: number;
      mana?: number;
      maxMana?: number;
      affinity?: Record<string, number>;
      elementXp?: Record<string, number>;
      elementAffinity?: Record<string, number>;
      controlBonus?: number;
      costEfficiency?: number;
      effects?: Array<{
        type: string;
        magnitude: number;
        durationSec: number;
        stacks?: number;
        appliedAt?: number;
      }>;
    };

    return {
      id: (p.slug as string) || (p.id?.toString() || ""),
      name: (p.name as string) || "",
      description: (p.description as string) || "",
      hp: combatStats.hp ?? 0,
      maxHp: combatStats.maxHp ?? 0,
      mana: combatStats.mana ?? 0,
      maxMana: combatStats.maxMana ?? 0,
      affinity: combatStats.affinity || {},
      elementXp: combatStats.elementXp,
      elementAffinity: combatStats.elementAffinity,
      controlBonus: combatStats.controlBonus,
      costEfficiency: combatStats.costEfficiency,
      effects: (combatStats.effects || []).map(
        (eff): EffectInstance => ({
          type: eff.type as any, // Payload stores as string, will be validated by form
          magnitude: eff.magnitude ?? 0,
          durationSec: eff.durationSec ?? 0,
          self: (eff as { self?: boolean }).self ?? false,
        })
      ),
      imageId:
        typeof p.image === "object" && p.image && "id" in p.image
          ? (p.image.id as number)
          : typeof p.image === "number"
            ? p.image
            : undefined,
      storyIds: [],
    };
  };

  const payloadToCreature = (payload: unknown): CreatureDefinition => {
    if (typeof payload !== "object" || !payload) {
      return {
        id: "",
        name: "",
        description: "",
        hp: 100,
        maxHp: 100,
        mana: 50,
        maxMana: 50,
        affinity: {},
        effects: [],
        storyIds: [],
      };
    }
    const p = payload as Record<string, unknown>;
    const combatStats = ((p.combatStats as Record<string, unknown>) || {}) as {
      hp?: number;
      maxHp?: number;
      mana?: number;
      maxMana?: number;
      affinity?: Record<string, number>;
      elementXp?: Record<string, number>;
      elementAffinity?: Record<string, number>;
    };

    return {
      id: (p.slug as string) || (p.id?.toString() || ""),
      name: (p.name as string) || "",
      description: (p.description as string) || "",
      hp: combatStats.hp ?? 100,
      maxHp: combatStats.maxHp ?? 100,
      mana: combatStats.mana ?? 50,
      maxMana: combatStats.maxMana ?? 50,
      affinity: combatStats.affinity || {},
      elementXp: combatStats.elementXp,
      elementAffinity: combatStats.elementAffinity,
      effects: [],
      storyIds: [],
      imageId:
        typeof p.image === "object" && p.image && "id" in p.image
          ? (p.image.id as number)
          : typeof p.image === "number"
            ? p.image
            : undefined,
      landmarkIconId:
        typeof p.landmarkIcon === "object" && p.landmarkIcon && "id" in p.landmarkIcon
          ? (p.landmarkIcon.id as number)
          : typeof p.landmarkIcon === "number"
            ? p.landmarkIcon
            : undefined,
    };
  };

  const payloadToRune = (payload: unknown): Partial<RuneDef> => {
    if (typeof payload !== "object" || !payload) return {};
    const p = payload as Record<string, unknown>;
    // Use type assertions since Payload stores these as JSON and forms will validate
    return {
      code: p.code as any,
      concept: p.concept as string,
      powerFactor: p.powerFactor as number,
      controlFactor: p.controlFactor as number,
      instabilityBase: p.instabilityBase as number,
      tags: (p.tags as any) || [],
      manaCost: p.manaCost as number,
      damage: p.damage as any,
      ccInstant: p.ccInstant as any,
      pen: p.pen as any,
      effects: p.effects as any,
      overchargeEffects: p.overchargeEffects as any,
      dotAffinity: p.dotAffinity as any,
      imageId:
        typeof p.image === "object" && p.image && "id" in p.image
          ? (p.image.id as number)
          : typeof p.image === "number"
            ? p.image
            : undefined,
    };
  };

  // Handlers
  const handleCreateCharacter = createSaveHandler<CharacterDefinition>(
    EntryType.Character,
    (character) => ({
      // Only include slug if provided (for new entries, server generates it)
      ...(character.id && character.id.trim() ? { [CharacterFields.Slug]: character.id.trim().toLowerCase() } : {}),
      [CharacterFields.Name]: character.name.trim(),
      [CharacterFields.Description]: (character.description || "").trim(),
      [CharacterFields.CombatStats]: {
        hp: character.hp,
        maxHp: character.maxHp,
        mana: character.mana,
        maxMana: character.maxMana,
        affinity: character.affinity,
        ...(character.elementXp && { elementXp: character.elementXp }),
        ...(character.elementAffinity && { elementAffinity: character.elementAffinity }),
        ...(character.controlBonus !== undefined && { controlBonus: character.controlBonus }),
        ...(character.costEfficiency !== undefined && { costEfficiency: character.costEfficiency }),
        ...(character.effects && character.effects.length > 0 && { effects: character.effects }),
      },
      ...(character.imageId ? { [CharacterFields.Image]: character.imageId } : {}),
    })
  );

  const handleCreateCreature = createSaveHandler<CreatureDefinition>(
    EntryType.Creature,
    (creature) => ({
      // Only include slug if provided (for new entries, server generates it)
      ...(creature.id && creature.id.trim() ? { slug: creature.id.trim().toLowerCase() } : {}),
      name: creature.name.trim(),
      description: (creature.description || "").trim(),
      combatStats: {
        hp: creature.hp,
        maxHp: creature.maxHp,
        mana: creature.mana,
        maxMana: creature.maxMana,
        affinity: creature.affinity,
        ...(creature.elementXp && { elementXp: creature.elementXp }),
        ...(creature.elementAffinity && { elementAffinity: creature.elementAffinity }),
      },
      ...(creature.imageId ? { image: creature.imageId } : {}),
      ...(creature.landmarkIconId ? { landmarkIcon: creature.landmarkIconId } : {}),
    })
  );

  const handleCreateRune = createSaveHandler<RuneDef>(EntryType.Rune, (rune) => ({
    code: rune.code,
    concept: rune.concept,
    powerFactor: rune.powerFactor,
    controlFactor: rune.controlFactor,
    instabilityBase: rune.instabilityBase,
    tags: rune.tags,
    manaCost: rune.manaCost,
    damage: rune.damage || null,
    ccInstant: rune.ccInstant || null,
    pen: rune.pen || null,
    effects: rune.effects || null,
    overchargeEffects: rune.overchargeEffects || null,
    dotAffinity: rune.dotAffinity || null,
    ...(rune.imageId ? { image: rune.imageId } : {}),
  }));

  const handleCreateRegion = createSaveHandler<RegionFormData>(
    EntryType.Region,
    (data) => {
      const payload: Record<string, unknown> = { ...data } as Record<string, unknown>;
      // Only include slug if provided (for new entries, server generates it)
      if (!payload.slug || (typeof payload.slug === 'string' && !payload.slug.trim())) {
        delete payload.slug;
      }
      return payload;
    }
  );

  const handleCreateObject = createSaveHandler<ObjectFormData>(EntryType.Object, (data) => ({
    name: data.name,
    // Only include slug if provided (for new entries, server generates it)
    ...(data.slug && data.slug.trim() ? { slug: data.slug } : {}),
    description: data.description,
    type: data.type,
    rarity: data.rarity,
    weight: data.weight,
    value: data.value,
    ...(data.image ? { image: data.image } : {}),
  }));

  const handleCreateLore = createSaveHandler<LoreFormData>(EntryType.Story, (data) => ({
    title: data.title,
    content: data.content,
    category: data.category || "history",
    excerpt: data.content?.substring(0, 200),
    // Only include slug if provided (for new entries, server generates it)
    ...(data.slug && data.slug.trim() ? { slug: data.slug } : {}),
    ...(data.featuredImage ? { featuredImage: data.featuredImage } : {}),
  }));

  const handleCreateSpell = createSaveHandler<NamedSpellBlueprint>(EntryType.Spell, (spell) => ({
    // Only include spellId if provided (for new entries, server generates it)
    ...(spell.id && spell.id.trim() ? { spellId: spell.id } : {}),
    name: spell.name,
    description: spell.description,
    tags: spell.tags,
    requiredRunes: spell.requiredRunes,
    allowedExtraRunes: spell.allowedExtraRunes,
    minDamageFocus: spell.minDamageFocus,
    minTotalPower: spell.minTotalPower,
    requiresNamedSourceId: spell.requiresNamedSourceId,
    minRuneFamiliarity: spell.minRuneFamiliarity,
    minTotalFamiliarityScore: spell.minTotalFamiliarityScore,
    requiredFlags: spell.requiredFlags,
    effects: spell.effects,
    hidden: spell.hidden,
    hint: spell.hint,
    ...(spell.imageId ? { image: spell.imageId } : {}),
  }));

  const handleCreateEffect = createSaveHandler<EffectDefinition & { image?: number }>(
    EntryType.Effect,
    (effect) => ({
      effectType: effect.id,
      name: effect.name,
      description: effect.description,
      category: effect.category,
      isBuff: effect.isBuff,
      iconKey: effect.iconKey,
      maxStacks: effect.maxStacks,
      blueprint: effect.blueprint,
      ...(effect.imageId ? { image: effect.imageId } : {}),
    })
  );

  // Get display name for edit modal (with project override support)
  const getEditTitle = (entryType: EntryType, data: unknown): string => {
    if (typeof data !== "object" || !data) return getDisplayName(entryType, projectConfigs);
    const d = data as Record<string, unknown>;
    const name = (d.name as string) || (d.concept as string) || (d.title as string);
    return name || getDisplayName(entryType, projectConfigs);
  };

  // Render modal for a specific entry type
  const renderModal = (entryType: EntryType) => {
    const config = getEntryConfig(entryType);
    const displayName = getDisplayName(entryType, projectConfigs);
    const isOpen = activeModal === entryType;
    const hasEditData = !!editData;
    const title = hasEditData
      ? `Edit ${getEditTitle(entryType, editData)}`
      : `Create New ${displayName}`;

    const deleteLabel =
      hasEditData && typeof editData === "object" && editData
        ? getEditTitle(entryType, editData)
        : undefined;

    // Form submission helper
    const submitForm = () => {
      const form = document.querySelector("form") as
        | (HTMLFormElement & { validateAndSubmit?: () => void | Promise<void>; submitForm?: () => void })
        | null;
      if (form?.validateAndSubmit) {
        form.validateAndSubmit();
      } else if (form?.submitForm) {
        form.submitForm();
      } else {
        form?.requestSubmit();
      }
    };

    // Modal props
    const modalProps = {
      isOpen,
      onClose: closeModal,
      title,
      onDelete: hasEditData ? handleDelete : undefined,
      deleteLabel,
      isDeleting,
    };

    // Render based on entry type
    switch (entryType) {
      case EntryType.Character:
        return (
          <Modal
            {...modalProps}
            footer={
              <CharacterFormFooter
                isEdit={hasEditData}
                saving={saving}
                onCancel={closeModal}
                onSubmit={() => {}}
              />
            }
          >
            {loadingEdit ? (
              <div className="p-6 text-center text-text-muted">Loading...</div>
            ) : (
              <CharacterForm
                initialValues={hasEditData ? payloadToCharacter(editData) : undefined}
                isEdit={hasEditData}
                onSubmit={handleCreateCharacter}
                onCancel={closeModal}
                saving={saving}
                projectId={projectId}
                editEntryId={
                  hasEditData && typeof editData === "object" && "id" in editData
                    ? typeof editData.id === "number"
                      ? editData.id
                      : typeof editData.id === "string"
                        ? parseInt(editData.id, 10) || undefined
                        : undefined
                    : undefined
                }
              />
            )}
          </Modal>
        );

      case EntryType.Creature:
        return (
          <Modal
            {...modalProps}
            footer={
              <CreatureFormFooter
                isEdit={hasEditData}
                saving={saving}
                onCancel={closeModal}
                onSubmit={submitForm}
              />
            }
          >
            {loadingEdit ? (
              <div className="p-8 text-center text-text-muted">Loading...</div>
            ) : (
              <CreatureForm
                initialValues={hasEditData ? payloadToCreature(editData) : undefined}
                isEdit={hasEditData}
                onSubmit={handleCreateCreature}
                onCancel={closeModal}
                saving={saving}
                projectId={projectId}
                editEntryId={
                  hasEditData && typeof editData === "object" && "id" in editData
                    ? typeof editData.id === "number"
                      ? editData.id
                      : typeof editData.id === "string"
                        ? parseInt(editData.id, 10) || undefined
                        : undefined
                    : undefined
                }
              />
            )}
          </Modal>
        );

      case EntryType.Rune:
        return (
          <Modal
            {...modalProps}
            footer={
              <RuneFormFooter
                isEdit={hasEditData}
                saving={saving}
                onCancel={closeModal}
                onSubmit={submitForm}
              />
            }
          >
            {loadingEdit ? (
              <div className="p-6 text-center text-text-muted">Loading...</div>
            ) : (
              <RuneForm
                initialValues={hasEditData ? payloadToRune(editData) : undefined}
                isEdit={hasEditData}
                onSubmit={handleCreateRune}
                onCancel={closeModal}
                saving={saving}
                projectId={projectId}
                editEntryId={
                  hasEditData && typeof editData === "object" && "id" in editData
                    ? typeof editData.id === "number"
                      ? editData.id
                      : typeof editData.id === "string"
                        ? parseInt(editData.id, 10) || undefined
                        : undefined
                    : undefined
                }
              />
            )}
          </Modal>
        );

      case EntryType.Region:
        return (
          <Modal
            {...modalProps}
            footer={
              <RegionFormFooter
                isEdit={hasEditData}
                saving={saving}
                onCancel={closeModal}
                onSubmit={submitForm}
              />
            }
          >
            {loadingEdit ? (
              <div className="p-6 text-center text-text-muted">Loading...</div>
            ) : (
              <RegionForm
                initialValues={(hasEditData ? editData : undefined) as RegionFormData | undefined}
                isEdit={hasEditData}
                onSubmit={handleCreateRegion}
                onCancel={closeModal}
                saving={saving}
              />
            )}
          </Modal>
        );

      case EntryType.Object:
        return (
          <Modal
            {...modalProps}
            footer={
              <ObjectFormFooter
                isEdit={hasEditData}
                saving={saving}
                onCancel={closeModal}
                onSubmit={submitForm}
              />
            }
          >
            {loadingEdit ? (
              <div className="p-6 text-center text-text-muted">Loading...</div>
            ) : (
              <ObjectForm
                initialValues={(hasEditData ? editData : undefined) as ObjectFormData | undefined}
                isEdit={hasEditData}
                onSubmit={handleCreateObject}
                onCancel={closeModal}
                saving={saving}
                projectId={projectId}
                editEntryId={
                  hasEditData && typeof editData === "object" && "id" in editData
                    ? typeof editData.id === "number"
                      ? editData.id
                      : typeof editData.id === "string"
                        ? parseInt(editData.id, 10) || undefined
                        : undefined
                    : undefined
                }
              />
            )}
          </Modal>
        );

      case EntryType.Story:
        return (
          <Modal
            {...modalProps}
            footer={
              <LoreFormFooter
                isEdit={hasEditData}
                saving={saving}
                onCancel={closeModal}
                onSubmit={submitForm}
              />
            }
          >
            {loadingEdit ? (
              <div className="p-6 text-center text-text-muted">Loading...</div>
            ) : (
              <LoreForm
                initialValues={(hasEditData ? editData : undefined) as LoreFormData | undefined}
                isEdit={hasEditData}
                onSubmit={handleCreateLore}
                onCancel={closeModal}
                saving={saving}
              />
            )}
          </Modal>
        );

      case EntryType.Spell:
        return (
          <Modal
            {...modalProps}
            footer={
              <SpellFormFooter
                isEdit={hasEditData}
                saving={saving}
                onCancel={closeModal}
                onSubmit={submitForm}
              />
            }
          >
            <SpellForm
              initialValues={(hasEditData ? editData : undefined) as NamedSpellBlueprint | undefined}
              isEdit={hasEditData}
              onSubmit={handleCreateSpell}
              onCancel={closeModal}
              saving={saving}
            />
          </Modal>
        );

      case EntryType.Effect:
        return (
          <Modal
            {...modalProps}
            footer={
              <EffectFormFooter
                isEdit={hasEditData}
                saving={saving}
                onCancel={closeModal}
                onSubmit={submitForm}
              />
            }
          >
            <EffectForm
              initialValues={
                (hasEditData ? editData : undefined) as (EffectDefinition & { image?: number }) | undefined
              }
              isEdit={hasEditData}
              onSubmit={handleCreateEffect}
              onCancel={closeModal}
              saving={saving}
            />
          </Modal>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {Object.values(EntryType).map((entryType) => (
        <div key={entryType}>{renderModal(entryType)}</div>
      ))}
    </>
  );
}
