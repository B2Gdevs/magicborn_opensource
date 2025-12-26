"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Trash2, Edit, ImageIcon } from "lucide-react";
import type { NamedSpellBlueprint } from "@/lib/data/namedSpells";
import { NAMED_SPELL_BLUEPRINTS } from "@/lib/data/namedSpells";
import { RC } from "@pkg/runes";
import { EFFECT_DEFS } from "@/lib/data/effects";
import { SpellForm } from "@components/spell/SpellForm";
import { spellClient } from "@/lib/api/clients";
import { toast } from "@/lib/hooks/useToast";
import { Tooltip } from "@components/ui/Tooltip";

export default function SpellEditor() {
  const [spells, setSpells] = useState<NamedSpellBlueprint[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<NamedSpellBlueprint | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSpells() {
      try {
        const loadedSpells = await spellClient.list();
        setSpells(loadedSpells);
      } catch (error) {
        console.error("Failed to load spells:", error);
        // Fallback to hardcoded data
        setSpells(NAMED_SPELL_BLUEPRINTS);
      } finally {
        setLoading(false);
      }
    }
    loadSpells();
  }, []);

  const handleUpdate = async (updatedSpell: NamedSpellBlueprint) => {
    setSaving(true);
    try {
      await spellClient.update(updatedSpell);
      
      // Refresh the list
      const refreshedSpells = await spellClient.list();
      setSpells(refreshedSpells);
      setSelectedSpell(updatedSpell);
      
      setShowEditModal(false);
    } catch (error) {
      console.error("Error saving spell:", error);
      toast.error(`Failed to save spell: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (spell: NamedSpellBlueprint) => {
    if (!confirm(`Delete ${spell.name}?`)) return;
    
    setSaving(true);
    try {
      await spellClient.delete(spell.id);
      
      // Refresh the list
      const refreshedSpells = await spellClient.list();
      setSpells(refreshedSpells);
      
      if (selectedSpell?.id === spell.id) {
        setSelectedSpell(null);
      }
    } catch (error) {
      console.error("Error deleting spell:", error);
      toast.error(`Failed to delete spell: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (newSpell: NamedSpellBlueprint) => {
    setSaving(true);
    try {
      await spellClient.create(newSpell);
      
      // Refresh the list
      const refreshedSpells = await spellClient.list();
      setSpells(refreshedSpells);
      
      setShowCreateModal(false);
      setSelectedSpell(newSpell);
    } catch (error) {
      console.error("Error creating spell:", error);
      toast.error(`Failed to create spell: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-text-muted">Loading spells...</div>;
  }

  return (
    <div className="flex flex-col h-full">

      <div className="flex h-full gap-4 overflow-hidden">
        {/* Spell List */}
        <div className="w-1/3 border-r border-border bg-shadow flex flex-col overflow-hidden">
          {/* Fixed Header */}
          <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <h2 className="text-xl font-bold text-glow">Named Spells</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn text-sm px-3 py-1"
          >
            + New Spell
          </button>
        </div>
          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {spells.map((spell) => (
            <div
              key={spell.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedSpell?.id === spell.id
                  ? "border-ember-glow bg-deep"
                  : "border-border hover:border-ember/50"
              }`}
              onClick={() => {
                setSelectedSpell(spell);
              }}
            >
              <div className="flex items-center gap-3">
                {/* Image thumbnail */}
                <div className="relative w-16 h-16 flex-shrink-0 rounded border border-border overflow-hidden bg-deep">
                  {spell.imagePath ? (
                    <Image
                      src={spell.imagePath}
                      alt={spell.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-text-muted" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-ember-glow">{spell.name}</h3>
                      <p className="text-sm text-text-secondary line-clamp-1">
                        {spell.description}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {spell.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-ember/20 text-ember-glow px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Tooltip content="Delete spell">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(spell);
                        }}
                        className="text-text-muted hover:text-red-500 transition-colors p-1"
                        aria-label="Delete spell"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
          ))}
            </div>
        </div>
        </div>

        {/* Spell Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedSpell ? (
            <div className="flex flex-col h-full">
              {/* Minimal Toolbar */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-shadow/50 flex-shrink-0">
                <h2 className="text-xl font-semibold text-glow">{selectedSpell.name}</h2>
                <Tooltip content="Edit spell">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="p-2 rounded text-text-muted hover:text-ember-glow hover:bg-deep transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </Tooltip>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">

            {/* Image display */}
            <div className="relative w-full aspect-video rounded-lg border border-border overflow-hidden bg-deep">
              {selectedSpell.imagePath ? (
                <Image
                  src={selectedSpell.imagePath}
                  alt={selectedSpell.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-text-muted">
                  <ImageIcon className="w-16 h-16 mb-2 opacity-50" />
                  <p className="text-sm">No image uploaded</p>
                </div>
              )}
            </div>

            <div className="card space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">
                  Description
                </label>
                <p className="text-text-primary">{selectedSpell.description}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">
                  Required Runes
                </label>
                <div className="flex gap-2 flex-wrap">
                  {selectedSpell.requiredRunes.map((rune) => (
                    <span
                      key={rune}
                      className="bg-ember/20 text-ember-glow px-3 py-1 rounded"
                    >
                      {rune}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">
                  Tags
                </label>
                <div className="flex gap-2 flex-wrap">
                  {selectedSpell.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-shadow-purple/20 text-shadow-purple-glow px-3 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {selectedSpell.minDamageFocus && (
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1">
                    Min Damage Focus
                  </label>
                  <p className="text-text-primary">
                    {selectedSpell.minDamageFocus.type}:{" "}
                    {(selectedSpell.minDamageFocus.ratio * 100).toFixed(0)}%
                  </p>
                </div>
              )}

              {selectedSpell.minTotalPower && (
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1">
                    Min Total Power
                  </label>
                  <p className="text-text-primary">{selectedSpell.minTotalPower}</p>
                </div>
              )}

              {selectedSpell.minRuneFamiliarity && Object.keys(selectedSpell.minRuneFamiliarity).length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1">
                    Min Rune Familiarity
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedSpell.minRuneFamiliarity).map(([rune, familiarity]) => {
                      const runeName = Object.entries(RC).find(([_, v]) => v === rune)?.[0] || rune;
                      return (
                        <span
                          key={rune}
                          className="bg-ember/20 text-ember-glow px-3 py-1 rounded text-sm"
                        >
                          {runeName}: {(familiarity * 100).toFixed(0)}%
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedSpell.minTotalFamiliarityScore && (
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1">
                    Min Total Familiarity Score
                  </label>
                  <p className="text-text-primary">{selectedSpell.minTotalFamiliarityScore}</p>
                </div>
              )}

              {selectedSpell.requiredFlags && selectedSpell.requiredFlags.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1">
                    Required Achievement Flags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedSpell.requiredFlags.map((flag) => (
                      <span
                        key={flag}
                        className="bg-ember/20 text-ember-glow px-3 py-1 rounded text-sm"
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">
                  Hidden
                </label>
                <p className="text-text-primary">
                  {selectedSpell.hidden ? "Yes" : "No"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">
                  Hint
                </label>
                <p className="text-text-primary italic">{selectedSpell.hint}</p>
              </div>

              {selectedSpell.effects && selectedSpell.effects.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1">
                    Effects
                  </label>
                  <div className="space-y-2">
                    {selectedSpell.effects.map((effect, index) => {
                      const def = EFFECT_DEFS[effect.type];
                      return (
                        <div key={index} className="bg-deep/30 border border-border rounded p-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-ember-glow">{def.name}</span>
                            {effect.self && (
                              <span className="text-xs bg-ember/20 text-ember-glow px-2 py-0.5 rounded">
                                Self
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-muted mt-1">{def.description}</p>
                          <div className="flex gap-4 mt-2 text-xs text-text-secondary">
                            <span>Magnitude: {effect.baseMagnitude}</span>
                            <span>Duration: {effect.baseDurationSec}s</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-text-muted">
              Select a spell to view details
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateSpellModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
          existingIds={spells.map(s => s.id)}
          existingSpells={spells}
          saving={saving}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedSpell && (
        <EditSpellModal
          spell={selectedSpell}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdate}
          existingSpells={spells}
          saving={saving}
        />
      )}
    </div>
  );
}

function EditSpellModal({
  spell,
  onClose,
  onUpdate,
  existingSpells,
  saving,
}: {
  spell: NamedSpellBlueprint;
  onClose: () => void;
  onUpdate: (spell: NamedSpellBlueprint) => void;
  existingSpells: NamedSpellBlueprint[];
  saving: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-shadow border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-glow">Edit Spell</h3>
          <Tooltip content="Close">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="text-text-muted hover:text-text-primary transition-colors p-1 hover:bg-deep rounded"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </Tooltip>
        </div>
        
        <SpellForm
          initialValues={spell}
          existingSpells={existingSpells}
          isEdit={true}
          onSubmit={onUpdate}
          onCancel={onClose}
          saving={saving}
        />
      </div>
    </div>
  );
}

function CreateSpellModal({
  onClose,
  onCreate,
  existingIds,
  existingSpells,
  saving,
}: {
  onClose: () => void;
  onCreate: (spell: NamedSpellBlueprint) => void;
  existingIds: string[];
  existingSpells: NamedSpellBlueprint[];
  saving: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-shadow border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-glow">Create New Spell</h3>
          <Tooltip content="Close">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="text-text-muted hover:text-text-primary transition-colors p-1 hover:bg-deep rounded"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </Tooltip>
        </div>
        
        <SpellForm
          existingSpells={existingSpells}
          existingIds={existingIds}
          isEdit={false}
          onSubmit={onCreate}
          onCancel={onClose}
          saving={saving}
        />
      </div>
    </div>
  );
}

