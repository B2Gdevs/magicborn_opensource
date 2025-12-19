// components/content-editor/NewEntryMenu.tsx
// Dropdown menu for creating new Codex entries - opens proper form modals

"use client";

import { useState, useEffect } from "react";
import { Plus, ChevronDown, User, MapPin, Package, BookOpen, Sparkles, Gem, Zap } from "lucide-react";
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
// Using Payload API directly instead of old clients

// Client-safe constants (inline to avoid webpack require issues)
const COLLECTIONS = {
  Characters: 'characters',
  Locations: 'locations',
  Lore: 'lore',
  Spells: 'spells',
  Runes: 'runes',
  Effects: 'effects',
} as const;

const CHARACTER_FIELDS = {
  Project: 'project',
  Slug: 'slug',
  Name: 'name',
  Description: 'description',
  Image: 'image',
  CombatStats: 'combatStats',
  RuneFamiliarity: 'runeFamiliarity',
} as const;

interface NewEntryMenuProps {
  projectId: string;
  isMagicbornMode: boolean;
  onEntryCreated?: (category: string) => void;
  triggerType?: string | null; // Programmatically trigger a specific entry type modal
  onTriggerHandled?: () => void;
  editEntry?: { categoryId: string; entryId: string } | null;
  onEditClosed?: () => void;
}

// Map category IDs to entry types
const categoryToEntryType: Record<string, EntryType> = {
  characters: "character",
  creatures: "creature",
  regions: "region",
  objects: "object",
  stories: "story",
  spells: "spell",
  runes: "rune",
  effects: "effect",
};

// Map category IDs to Payload collections
const categoryToCollection: Record<string, string> = {
  characters: COLLECTIONS.Characters,
  creatures: "creatures", // TODO: Add to constants when collection is created
  regions: COLLECTIONS.Locations,
  objects: "objects", // TODO: Add to constants when collection is created
  stories: COLLECTIONS.Lore,
  spells: COLLECTIONS.Spells,
  runes: COLLECTIONS.Runes,
  effects: COLLECTIONS.Effects,
};

type EntryType = "character" | "creature" | "region" | "object" | "story" | "spell" | "rune" | "effect";

interface EntryConfig {
  id: EntryType;
  name: string;
  icon: React.ReactNode;
  magicbornOnly?: boolean;
}

const entryTypes: EntryConfig[] = [
  { id: "character", name: "Character", icon: <User className="w-4 h-4" /> },
  { id: "creature", name: "Creature", icon: <User className="w-4 h-4" /> },
  { id: "region", name: "Region", icon: <MapPin className="w-4 h-4" /> },
  { id: "object", name: "Object/Item", icon: <Package className="w-4 h-4" /> },
  { id: "story", name: "Book/Story", icon: <BookOpen className="w-4 h-4" /> },
  { id: "spell", name: "Spell", icon: <Sparkles className="w-4 h-4" />, magicbornOnly: true },
  { id: "rune", name: "Rune", icon: <Gem className="w-4 h-4" />, magicbornOnly: true },
  { id: "effect", name: "Effect", icon: <Zap className="w-4 h-4" />, magicbornOnly: true },
];

export function NewEntryMenu({ projectId, isMagicbornMode, onEntryCreated, triggerType, onTriggerHandled, editEntry, onEditClosed }: NewEntryMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<EntryType | null>(null);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const availableTypes = entryTypes.filter(t => !t.magicbornOnly || isMagicbornMode);

  // Handle programmatic trigger from context menu
  useEffect(() => {
    if (triggerType && availableTypes.some(t => t.id === triggerType)) {
      setActiveModal(triggerType as EntryType);
      onTriggerHandled?.();
    }
  }, [triggerType, onTriggerHandled, availableTypes]);

  // Handle edit entry
  useEffect(() => {
    if (editEntry) {
      const entryType = categoryToEntryType[editEntry.categoryId];
      const collection = categoryToCollection[editEntry.categoryId];
      
      if (entryType && collection) {
        setLoadingEdit(true);
        fetch(`/api/payload/${collection}/${editEntry.entryId}`)
          .then(res => res.json())
          .then(data => {
            setEditData(data);
            setActiveModal(entryType);
          })
          .catch(err => {
            console.error("Failed to load entry:", err);
            alert("Failed to load entry for editing");
            onEditClosed?.();
          })
          .finally(() => setLoadingEdit(false));
      }
    } else {
      // Clear edit data when editEntry is cleared
      setEditData(null);
    }
  }, [editEntry, onEditClosed]);

  const handleSelect = (type: EntryType) => {
    setIsOpen(false);
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSaving(false);
    setEditData(null);
    onEditClosed?.();
  };

  // Helper to transform Payload character to CharacterDefinition
  const payloadToRune = (payload: any): Partial<RuneDef> & { imageMediaId?: number } => {
    return {
      code: payload.code,
      concept: payload.concept,
      powerFactor: payload.powerFactor,
      controlFactor: payload.controlFactor,
      instabilityBase: payload.instabilityBase,
      tags: payload.tags || [],
      manaCost: payload.manaCost,
      damage: payload.damage,
      ccInstant: payload.ccInstant,
      pen: payload.pen,
      effects: payload.effects,
      overchargeEffects: payload.overchargeEffects,
      dotAffinity: payload.dotAffinity,
      imagePath: payload.image?.url || payload.imagePath,
      imageMediaId: payload.image?.id || payload.image, // Include media ID for form
    };
  };

  const payloadToCharacter = (payload: any): Partial<CharacterDefinition> & { image?: number } => {
    const combatStats = payload.combatStats || {};
    return {
      id: payload.slug || payload.id?.toString() || "", // Use slug as ID
      name: payload.name || "",
      description: payload.description || "",
      hp: combatStats.hp || 0,
      maxHp: combatStats.maxHp || 0,
      mana: combatStats.mana || 0,
      maxMana: combatStats.maxMana || 0,
      affinity: combatStats.affinity || {},
      elementXp: combatStats.elementXp,
      elementAffinity: combatStats.elementAffinity,
      controlBonus: combatStats.controlBonus,
      costEfficiency: combatStats.costEfficiency,
      imagePath: payload.image?.url || payload.imagePath,
      image: payload.image?.id || payload.image, // Include media ID for form
    };
  };

  // Character handlers - use Payload API
  const handleCreateCharacter = async (character: CharacterDefinition) => {
    if (saving) return; // Prevent duplicate submissions
    setSaving(true);
    try {
      const isEdit = !!editData && !!editEntry;
      
      // Transform CharacterDefinition to Payload format
      const payloadData = {
        [CHARACTER_FIELDS.Slug]: character.id.trim().toLowerCase(), // Store custom ID in slug field
        [CHARACTER_FIELDS.Name]: character.name.trim(),
        [CHARACTER_FIELDS.Description]: character.description.trim(),
        [CHARACTER_FIELDS.Project]: parseInt(projectId),
        [CHARACTER_FIELDS.CombatStats]: {
          hp: character.hp,
          maxHp: character.maxHp,
          mana: character.mana,
          maxMana: character.maxMana,
          affinity: character.affinity,
          ...(character.elementXp && { elementXp: character.elementXp }),
          ...(character.elementAffinity && { elementAffinity: character.elementAffinity }),
          ...(character.controlBonus !== undefined && { controlBonus: character.controlBonus }),
          ...(character.costEfficiency !== undefined && { costEfficiency: character.costEfficiency }),
        },
        // Include image media ID if provided (from MediaUpload)
        ...((character as any).image ? { [CHARACTER_FIELDS.Image]: (character as any).image } : {}),
      };

      const url = isEdit 
        ? `/api/payload/${COLLECTIONS.Characters}/${editData.id}`
        : `/api/payload/${COLLECTIONS.Characters}`;
      
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadData),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.errors?.[0]?.message || err.error || err.message || `Failed to ${isEdit ? "update" : "create"} character`);
      }
      
      onEntryCreated?.("characters");
      closeModal();
    } catch (error) {
      console.error("Failed to save character:", error);
      alert(`Failed to save character: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  // Creature handlers - use Payload API
  const handleCreateCreature = async (creature: CreatureDefinition) => {
    setSaving(true);
    try {
      const res = await fetch("/api/payload/creatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...creature, project: parseInt(projectId) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.errors?.[0]?.message || err.error || err.message || "Failed to create creature");
      }
      onEntryCreated?.("creatures");
      closeModal();
    } catch (error) {
      console.error("Failed to create creature:", error);
      alert(`Failed to create creature: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  // Rune handlers - use Payload API
  const handleCreateRune = async (rune: RuneDef) => {
    if (saving) return;
    setSaving(true);
    try {
      const isEdit = !!editData && !!editEntry;
      const url = isEdit 
        ? `/api/payload/runes/${editData.id}`
        : "/api/payload/runes";
      
      // Transform rune data for Payload
      const payloadData: any = {
        project: parseInt(projectId),
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
      };
      
      // Include image if provided
      if ((rune as any).imageMediaId) {
        payloadData.image = (rune as any).imageMediaId;
      }
      
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.errors?.[0]?.message || err.error || err.message || `Failed to ${isEdit ? "update" : "create"} rune`);
      }
      onEntryCreated?.("runes");
      closeModal();
    } catch (error) {
      console.error("Failed to save rune:", error);
      alert(`Failed to save rune: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  // Region handlers
  const handleCreateRegion = async (data: RegionFormData) => {
    if (saving) return;
    setSaving(true);
    try {
      const isEdit = !!editData && !!editEntry;
      const url = isEdit 
        ? `/api/payload/locations/${editData.id}`
        : "/api/payload/locations";
      
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, project: parseInt(projectId) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.errors?.[0]?.message || err.error || err.message || `Failed to ${isEdit ? "update" : "create"} region`);
      }
      onEntryCreated?.("regions");
      closeModal();
    } catch (error) {
      console.error("Failed to save region:", error);
      alert(`Failed to save region: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  // Object handlers
  const handleCreateObject = async (data: ObjectFormData) => {
    if (saving) return;
    setSaving(true);
    try {
      const isEdit = !!editData && !!editEntry;
      const url = isEdit 
        ? `/api/payload/objects/${editData.id}`
        : "/api/payload/objects";
      
      // Transform object data for Payload (include image media ID and slug)
      const payloadData: any = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        type: data.type,
        rarity: data.rarity,
        weight: data.weight,
        value: data.value,
        project: parseInt(projectId),
      };
      
      // Include image if provided
      if (data.image) {
        payloadData.image = data.image;
      }
      
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.errors?.[0]?.message || err.error || err.message || `Failed to ${isEdit ? "update" : "create"} object`);
      }
      onEntryCreated?.("objects");
      closeModal();
    } catch (error) {
      console.error("Failed to save object:", error);
      alert(`Failed to save object: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  // Lore handlers
  const handleCreateLore = async (data: LoreFormData) => {
    if (saving) return;
    setSaving(true);
    try {
      const isEdit = !!editData && !!editEntry;
      const url = isEdit 
        ? `/api/payload/lore/${editData.id}`
        : "/api/payload/lore";
      
      // Transform lore data for Payload (include featuredImage media ID)
      const payloadData: any = {
        title: data.title,
        content: data.content,
        category: data.category || 'history', // Use category from form
        excerpt: data.content?.substring(0, 200), // Auto-generate excerpt
        project: parseInt(projectId),
      };
      
      // Include featuredImage if provided
      if (data.featuredImage) {
        payloadData.featuredImage = data.featuredImage;
      }
      
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.errors?.[0]?.message || err.error || err.message || `Failed to ${isEdit ? "update" : "create"} lore`);
      }
      onEntryCreated?.("stories");
      closeModal();
    } catch (error) {
      console.error("Failed to save lore:", error);
      alert(`Failed to save lore: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  // Spell handlers
  const handleCreateSpell = async (spell: NamedSpellBlueprint & { image?: number }) => {
    if (saving) return;
    setSaving(true);
    try {
      const isEdit = !!editData && !!editEntry;
      const url = isEdit 
        ? `/api/payload/spells/${editData.id}`
        : "/api/payload/spells";
      
      // Transform spell data for Payload (include image media ID)
      const payloadData: any = {
        spellId: spell.id,
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
        project: parseInt(projectId),
      };
      
      // Include image if provided
      if (spell.image) {
        payloadData.image = spell.image;
      }
      
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.errors?.[0]?.message || err.error || err.message || `Failed to ${isEdit ? "update" : "create"} spell`);
      }
      onEntryCreated?.("spells");
      closeModal();
    } catch (error) {
      console.error("Failed to save spell:", error);
      alert(`Failed to save spell: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  // Effect handlers
  const handleCreateEffect = async (effect: EffectDefinition & { image?: number }) => {
    if (saving) return;
    setSaving(true);
    try {
      const isEdit = !!editData && !!editEntry;
      const url = isEdit 
        ? `/api/payload/effects/${editData.id}`
        : "/api/payload/effects";
      
      // Transform effect data for Payload (include image media ID)
      const payloadData: any = {
        effectType: effect.id,
        name: effect.name,
        description: effect.description,
        category: effect.category,
        isBuff: effect.isBuff,
        iconKey: effect.iconKey,
        maxStacks: effect.maxStacks,
        blueprint: effect.blueprint,
        project: parseInt(projectId),
      };
      
      // Include image if provided
      if (effect.image) {
        payloadData.image = effect.image;
      }
      
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.errors?.[0]?.message || err.error || err.message || `Failed to ${isEdit ? "update" : "create"} effect`);
      }
      onEntryCreated?.("effects");
      closeModal();
    } catch (error) {
      console.error("Failed to save effect:", error);
      alert(`Failed to save effect: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Dropdown Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 bg-ember/20 border border-ember/30 rounded-lg text-ember-glow font-semibold hover:bg-ember/30 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Entry
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full left-0 right-0 mt-1 bg-shadow border border-border rounded-lg shadow-xl z-20 overflow-hidden">
              {availableTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleSelect(type.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-ember/10 text-text-primary hover:text-ember-glow transition-colors"
                >
                  {type.icon}
                  <span>{type.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Character Modal */}
      <Modal
        isOpen={activeModal === "character"}
        onClose={closeModal}
        title={editData ? `Edit ${editData.name || "Character"}` : "Create New Character"}
        footer={
          <CharacterFormFooter
            isEdit={!!editData}
            saving={saving}
            onCancel={closeModal}
            onSubmit={() => {
              // Footer will handle submission via validateAndSubmit
            }}
          />
        }
      >
        {loadingEdit ? (
          <div className="p-6 text-center text-text-muted">Loading...</div>
        ) : (
          <CharacterForm
            initialValues={editData ? payloadToCharacter(editData) : undefined}
            isEdit={!!editData}
            onSubmit={handleCreateCharacter}
            onCancel={closeModal}
            saving={saving}
            projectId={projectId}
            editEntryId={editData?.id}
          />
        )}
      </Modal>

      {/* Creature Modal */}
      <Modal
        isOpen={activeModal === "creature"}
        onClose={closeModal}
        title="Create New Creature"
        footer={
          <CreatureFormFooter
            isEdit={false}
            saving={saving}
            onCancel={closeModal}
            onSubmit={() => {
              const form = document.querySelector('form') as HTMLFormElement & { submitForm?: () => void };
              form?.submitForm?.() || form?.requestSubmit();
            }}
          />
        }
      >
        <CreatureForm
          onSubmit={handleCreateCreature}
          onCancel={closeModal}
          saving={saving}
        />
      </Modal>

      {/* Rune Modal */}
      <Modal
        isOpen={activeModal === "rune"}
        onClose={closeModal}
        title={editData ? `Edit ${editData.concept || "Rune"}` : "Create New Rune"}
        footer={
          <RuneFormFooter
            isEdit={!!editData}
            saving={saving}
            onCancel={closeModal}
            onSubmit={() => {
              const form = document.querySelector('form') as HTMLFormElement & { validateAndSubmit?: () => Promise<void> };
              if (form?.validateAndSubmit) {
                form.validateAndSubmit();
              } else {
                form?.requestSubmit();
              }
            }}
          />
        }
      >
        {loadingEdit ? (
          <div className="p-6 text-center text-text-muted">Loading...</div>
        ) : (
          <RuneForm
            initialValues={editData ? payloadToRune(editData) : undefined}
            isEdit={!!editData}
            onSubmit={handleCreateRune}
            onCancel={closeModal}
            saving={saving}
            projectId={projectId}
            editEntryId={editData?.id}
          />
        )}
      </Modal>

      {/* Region Modal */}
      <Modal
        isOpen={activeModal === "region"}
        onClose={closeModal}
        title={editData ? `Edit ${editData.name || "Region"}` : "Create New Region"}
        footer={
          <RegionFormFooter
            isEdit={!!editData}
            saving={saving}
            onCancel={closeModal}
            onSubmit={() => {
              const form = document.querySelector('form') as HTMLFormElement & { submitForm?: () => void };
              form?.submitForm?.() || form?.requestSubmit();
            }}
          />
        }
      >
        {loadingEdit ? (
          <div className="p-6 text-center text-text-muted">Loading...</div>
        ) : (
          <RegionForm
            initialValues={editData || undefined}
            isEdit={!!editData}
            onSubmit={handleCreateRegion}
            onCancel={closeModal}
            saving={saving}
          />
        )}
      </Modal>

      {/* Object Modal */}
      <Modal
        isOpen={activeModal === "object"}
        onClose={closeModal}
        title={editData ? `Edit ${editData.name || "Item"}` : "Create New Object/Item"}
        footer={
          <ObjectFormFooter
            isEdit={!!editData}
            saving={saving}
            onCancel={closeModal}
            onSubmit={() => {
              const form = document.querySelector('form') as HTMLFormElement & { validateAndSubmit?: () => void };
              if (form?.validateAndSubmit) {
                form.validateAndSubmit();
              } else {
                form?.requestSubmit();
              }
            }}
          />
        }
      >
        {loadingEdit ? (
          <div className="p-6 text-center text-text-muted">Loading...</div>
        ) : (
          <ObjectForm
            initialValues={editData || undefined}
            isEdit={!!editData}
            onSubmit={handleCreateObject}
            onCancel={closeModal}
            saving={saving}
            projectId={projectId}
            editEntryId={editData?.id}
          />
        )}
      </Modal>

      {/* Lore Modal */}
      <Modal
        isOpen={activeModal === "story"}
        onClose={closeModal}
        title={editData ? `Edit ${editData.title || "Lore Entry"}` : "Create New Lore Entry"}
        footer={
          <LoreFormFooter
            isEdit={!!editData}
            saving={saving}
            onCancel={closeModal}
            onSubmit={() => {
              const form = document.querySelector('form') as HTMLFormElement & { validateAndSubmit?: () => Promise<void> };
              if (form?.validateAndSubmit) {
                form.validateAndSubmit();
              } else {
                form?.requestSubmit();
              }
            }}
          />
        }
      >
        {loadingEdit ? (
          <div className="p-6 text-center text-text-muted">Loading...</div>
        ) : (
          <LoreForm
            initialValues={editData || undefined}
            isEdit={!!editData}
            onSubmit={handleCreateLore}
            onCancel={closeModal}
            saving={saving}
          />
        )}
      </Modal>

      {/* Spell Modal */}
      <Modal
        isOpen={activeModal === "spell"}
        onClose={closeModal}
        title={editData ? `Edit ${editData.name || "Spell"}` : "Create New Spell"}
        footer={
          <SpellFormFooter
            isEdit={!!editData}
            saving={saving}
            onCancel={closeModal}
            onSubmit={() => {
              const form = document.querySelector('form') as HTMLFormElement & { validateAndSubmit?: () => Promise<void> };
              if (form?.validateAndSubmit) {
                form.validateAndSubmit();
              } else {
                form?.requestSubmit();
              }
            }}
          />
        }
      >
        <SpellForm
          initialValues={editData || undefined}
          isEdit={!!editData}
          onSubmit={handleCreateSpell}
          onCancel={closeModal}
          saving={saving}
        />
      </Modal>

      {/* Effect Modal */}
      <Modal
        isOpen={activeModal === "effect"}
        onClose={closeModal}
        title={editData ? `Edit ${editData.name || "Effect"}` : "Create New Effect"}
        footer={
          <EffectFormFooter
            isEdit={!!editData}
            saving={saving}
            onCancel={closeModal}
            onSubmit={() => {
              const form = document.querySelector('form') as HTMLFormElement & { validateAndSubmit?: () => Promise<void> };
              if (form?.validateAndSubmit) {
                form.validateAndSubmit();
              } else {
                form?.requestSubmit();
              }
            }}
          />
        }
      >
        <EffectForm
          initialValues={editData || undefined}
          isEdit={!!editData}
          onSubmit={handleCreateEffect}
          onCancel={closeModal}
          saving={saving}
        />
      </Modal>
    </>
  );
}

