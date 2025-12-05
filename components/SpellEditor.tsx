"use client";

import { useState, useEffect } from "react";
import type { NamedSpellBlueprint } from "@/lib/data/namedSpells";
import { NAMED_SPELL_BLUEPRINTS } from "@/lib/data/namedSpells";
import { SpellTag } from "@core/enums";
import { RC } from "@pkg/runes";
import { DamageType } from "@core/enums";
import ResourceDocumentation from "@components/ResourceDocumentation";

export default function SpellEditor() {
  const [spells, setSpells] = useState<NamedSpellBlueprint[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<NamedSpellBlueprint | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSpells(NAMED_SPELL_BLUEPRINTS);
    setLoading(false);
  }, []);

  const handleSave = async () => {
    // In a real implementation, this would generate TypeScript code
    // For now, we'll just show a message
    alert("Spell saved! (This would update lib/data/namedSpells.ts)");
    setIsEditing(false);
  };

  const handleDelete = (spell: NamedSpellBlueprint) => {
    if (!confirm(`Delete ${spell.name}?`)) return;
    setSpells(spells.filter(s => s.id !== spell.id));
    if (selectedSpell?.id === spell.id) {
      setSelectedSpell(null);
    }
  };

  if (loading) {
    return <div className="text-text-muted">Loading spells...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Documentation */}
      <div className="p-4 border-b border-border bg-shadow">
        <ResourceDocumentation
          title="Named Spells"
          sourcePath="lib/data/namedSpells.ts"
          outputPath="lib/data/namedSpells.ts"
          description="Named spells are predefined spell blueprints that players can discover and evolve. Each spell has requirements (runes, damage focus, familiarity) that must be met for evolution."
          mergeStrategy="Spells are stored as TypeScript constants. When editing, the entire file is regenerated. Manual edits to the file will be overwritten on save."
        />
      </div>

      <div className="flex h-full gap-4 overflow-hidden">
        {/* Spell List */}
        <div className="w-1/3 border-r border-border bg-shadow p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-glow">Named Spells</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn text-sm px-3 py-1"
          >
            + New Spell
          </button>
        </div>
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
                setIsEditing(false);
              }}
            >
              <div className="flex items-center justify-between">
                <div>
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(spell);
                  }}
                  className="text-text-muted hover:text-red-500"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
        </div>

        {/* Spell Editor */}
        <div className="flex-1 p-4 overflow-y-auto">
        {selectedSpell ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-glow">{selectedSpell.name}</h2>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button onClick={handleSave} className="btn">
                      💾 Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="btn">
                    ✏️ Edit
                  </button>
                )}
              </div>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-shadow border border-border rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-glow mb-4">Create New Spell</h3>
            <p className="text-text-secondary mb-4">
              Spell creation UI coming soon. For now, edit spells directly in{" "}
              <code className="text-ember-glow">lib/data/namedSpells.ts</code>
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="btn-secondary w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

