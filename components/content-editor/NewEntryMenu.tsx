// components/content-editor/NewEntryMenu.tsx
// Dropdown menu for creating new Codex entries - opens proper form modals

"use client";

import { useState } from "react";
import { Plus, ChevronDown, User, MapPin, Package, BookOpen, Sparkles, Gem, Zap } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { CharacterForm, CharacterFormFooter } from "@/components/character/CharacterForm";
import { CreatureForm, CreatureFormFooter } from "@/components/creature/CreatureForm";
import { RuneForm } from "@/components/rune/RuneForm";
import type { CharacterDefinition } from "@/lib/data/characters";
import type { CreatureDefinition } from "@/lib/data/creatures";
import type { RuneDef } from "@/lib/packages/runes";
import { characterClient, creatureClient, runeClient } from "@/lib/api/clients";

interface NewEntryMenuProps {
  projectId: string;
  isMagicbornMode: boolean;
  onEntryCreated?: (category: string) => void;
}

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

export function NewEntryMenu({ projectId, isMagicbornMode, onEntryCreated }: NewEntryMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<EntryType | null>(null);
  const [saving, setSaving] = useState(false);

  const availableTypes = entryTypes.filter(t => !t.magicbornOnly || isMagicbornMode);

  const handleSelect = (type: EntryType) => {
    setIsOpen(false);
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSaving(false);
  };

  // Character handlers
  const handleCreateCharacter = async (character: CharacterDefinition) => {
    setSaving(true);
    try {
      await characterClient.create(character);
      onEntryCreated?.("characters");
      closeModal();
    } catch (error) {
      console.error("Failed to create character:", error);
      alert(`Failed to create character: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  // Creature handlers
  const handleCreateCreature = async (creature: CreatureDefinition) => {
    setSaving(true);
    try {
      await creatureClient.create(creature);
      onEntryCreated?.("creatures");
      closeModal();
    } catch (error) {
      console.error("Failed to create creature:", error);
      alert(`Failed to create creature: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  // Rune handlers
  const handleCreateRune = async (rune: RuneDef) => {
    setSaving(true);
    try {
      await runeClient.create(rune);
      onEntryCreated?.("runes");
      closeModal();
    } catch (error) {
      console.error("Failed to create rune:", error);
      alert(`Failed to create rune: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  // Placeholder for types not yet implemented
  const handleNotImplemented = () => {
    alert("This entry type is not yet implemented in the Content Editor. Coming soon!");
    closeModal();
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
        title="Create New Character"
        footer={
          <CharacterFormFooter
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
        <CharacterForm
          onSubmit={handleCreateCharacter}
          onCancel={closeModal}
          saving={saving}
        />
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
        title="Create New Rune"
      >
        <RuneForm
          onSubmit={handleCreateRune}
          onCancel={closeModal}
          saving={saving}
        />
      </Modal>

      {/* Placeholder modals for not-yet-implemented types */}
      <Modal
        isOpen={activeModal === "region"}
        onClose={closeModal}
        title="Create New Region"
      >
        <div className="p-6 text-center text-text-muted">
          <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Region editor coming soon!</p>
          <p className="text-sm mt-2">This will use the hierarchical cell-based region system.</p>
          <button onClick={closeModal} className="mt-4 px-4 py-2 bg-deep border border-border rounded-lg">
            Close
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === "object"}
        onClose={closeModal}
        title="Create New Object/Item"
      >
        <div className="p-6 text-center text-text-muted">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Object/Item editor coming soon!</p>
          <button onClick={closeModal} className="mt-4 px-4 py-2 bg-deep border border-border rounded-lg">
            Close
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === "story"}
        onClose={closeModal}
        title="Create New Book/Story"
      >
        <div className="p-6 text-center text-text-muted">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Book/Story editor coming soon!</p>
          <button onClick={closeModal} className="mt-4 px-4 py-2 bg-deep border border-border rounded-lg">
            Close
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === "spell"}
        onClose={closeModal}
        title="Create New Spell"
      >
        <div className="p-6 text-center text-text-muted">
          <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Spell editor coming soon!</p>
          <button onClick={closeModal} className="mt-4 px-4 py-2 bg-deep border border-border rounded-lg">
            Close
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === "effect"}
        onClose={closeModal}
        title="Create New Effect"
      >
        <div className="p-6 text-center text-text-muted">
          <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Effect editor coming soon!</p>
          <button onClick={closeModal} className="mt-4 px-4 py-2 bg-deep border border-border rounded-lg">
            Close
          </button>
        </div>
      </Modal>
    </>
  );
}

