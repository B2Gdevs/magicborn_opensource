"use client";

import { useState, useEffect } from "react";
import type { NamedSpellBlueprint } from "@/lib/data/namedSpells";
import { NAMED_SPELL_BLUEPRINTS } from "@/lib/data/namedSpells";
import { SpellTag, DamageType, EffectType } from "@core/enums";
import { RC } from "@pkg/runes";
import type { RuneCode } from "@core/types";
import { AchievementFlag } from "@/lib/data/achievements";
import type { EffectBlueprint } from "@core/effects";
import { EFFECT_DEFS } from "@/lib/data/effects";
import ResourceDocumentation from "@components/ResourceDocumentation";

// Helper to convert name to ID (e.g., "Ember Ray" -> "ember_ray")
function nameToId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// Generate TypeScript code for the spells file (DEPRECATED - no longer used with SQLite)
function generateSpellsFile(spells: NamedSpellBlueprint[]): string {
  const header = `// lib/data/namedSpells.ts
import type { RuneCode } from "@core/types";
import { DamageType, SpellTag } from "@core/enums";
import { RC } from "@pkg/runes";
import { AchievementFlag } from "@/lib/data/achievements";

/**
 * All known named spell IDs in the game.
 *
 * As we add more, extend this union and add them to the index below.
 */
export type NamedSpellId =
${spells.map((s) => `  | "${s.id}"`).join("\n")};

/**
 * Blueprint for a named spell evolution target.
 */
export interface NamedSpellBlueprint {
  id: NamedSpellId;
  name: string;
  description: string;

  // semantic tags for UI / filtering
  tags: SpellTag[];

  // Runes:
  //  - requiredRunes: spell must contain at least these runes
  //  - allowedExtraRunes: optional whitelist for any additional runes
  requiredRunes: RuneCode[];
  allowedExtraRunes?: RuneCode[];

  // "Shape" requirements – there are no levels in this game.
  //  - minDamageFocus: e.g. >= 0.6 Fire of total damage
  //  - minTotalPower: burst + full DoT must exceed this
  minDamageFocus?: {
    type: DamageType;
    ratio: number;
  };
  minTotalPower?: number;

  // Spellbook UX:
  hidden: boolean; // true: not shown until discovered
  hint: string; // guidance shown in spellbook

  // Evolution chain & gates:

  /**
   * If set, this blueprint can ONLY be used to evolve from this named spell.
   * Used for named → named chains (e.g. Ember Ray → Searing Ember Ray).
   */
  requiresNamedSourceId?: NamedSpellId;

  /**
   * Minimum per-rune familiarity for some runes (e.g., F ≥ 0.7, R ≥ 0.5).
   * This is checked via RuneFamiliarityService and Player.runeFamiliarity.
   */
  minRuneFamiliarity?: Partial<Record<RuneCode, number>>;

  /**
   * Minimum total familiarity score across all runes in the spell,
   * as computed by RuneFamiliarityService.getSpellRuneFamiliarityScore.
   */
  minTotalFamiliarityScore?: number;

  /**
   * Achievement / flag gates (e.g., boss kills, artifact acquisition).
   */
  requiredFlags?: AchievementFlag[];
}
`;

  const blueprints = spells.map((spell) => {
    const constantName = nameToConstantName(spell.name);
    const comment = `/** ${spell.name} */`;
    
    let code = `${comment}\nexport const ${constantName}: NamedSpellBlueprint = {\n`;
    code += `  id: "${spell.id}",\n`;
    code += `  name: "${spell.name}",\n`;
    code += `  description: ${JSON.stringify(spell.description)},\n`;
    code += `  tags: [${spell.tags.map(t => {
      const tagKey = Object.entries(SpellTag).find(([_, v]) => v === t)?.[0] || t;
      return `SpellTag.${tagKey}`;
    }).join(", ")}],\n`;
    code += `  requiredRunes: [${spell.requiredRunes.map(r => `RC.${Object.entries(RC).find(([_, v]) => v === r)?.[0] || r}`).join(", ")}],\n`;
    
    if (spell.allowedExtraRunes && spell.allowedExtraRunes.length > 0) {
      code += `  allowedExtraRunes: [${spell.allowedExtraRunes.map(r => `RC.${Object.entries(RC).find(([_, v]) => v === r)?.[0] || r}`).join(", ")}],\n`;
    }
    
    if (spell.minDamageFocus) {
      const damageTypeKey = Object.entries(DamageType).find(([_, v]) => v === spell.minDamageFocus!.type)?.[0] || spell.minDamageFocus.type;
      code += `  minDamageFocus: { type: DamageType.${damageTypeKey}, ratio: ${spell.minDamageFocus.ratio} },\n`;
    }
    
    if (spell.minTotalPower !== undefined) {
      code += `  minTotalPower: ${spell.minTotalPower},\n`;
    }
    
    if (spell.requiresNamedSourceId) {
      code += `  requiresNamedSourceId: "${spell.requiresNamedSourceId}",\n`;
    }
    
    if (spell.minRuneFamiliarity && Object.keys(spell.minRuneFamiliarity).length > 0) {
      code += `  minRuneFamiliarity: {\n`;
      for (const [rune, value] of Object.entries(spell.minRuneFamiliarity)) {
        const runeName = Object.entries(RC).find(([_, v]) => v === rune)?.[0] || rune;
        code += `    RC.${runeName}: ${value},\n`;
      }
      code += `  },\n`;
    }
    
    if (spell.minTotalFamiliarityScore !== undefined) {
      code += `  minTotalFamiliarityScore: ${spell.minTotalFamiliarityScore},\n`;
    }
    
    if (spell.requiredFlags && spell.requiredFlags.length > 0) {
      code += `  requiredFlags: [${spell.requiredFlags.map(f => {
        const flagKey = Object.entries(AchievementFlag).find(([_, v]) => v === f)?.[0] || f;
        return `AchievementFlag.${flagKey}`;
      }).join(", ")}],\n`;
    }
    
    code += `  hidden: ${spell.hidden},\n`;
    code += `  hint: ${JSON.stringify(spell.hint)},\n`;
    code += `};`;
    
    return code;
  }).join("\n\n");

  const footer = `
export const NAMED_SPELL_BLUEPRINTS: NamedSpellBlueprint[] = [
${spells.map(s => `  ${nameToConstantName(s.name)},`).join("\n")}
];

const BLUEPRINTS_BY_ID: Record<NamedSpellId, NamedSpellBlueprint> = {
${spells.map(s => `  ${s.id}: ${nameToConstantName(s.name)},`).join("\n")}
};

export function listNamedBlueprints(): NamedSpellBlueprint[] {
  return NAMED_SPELL_BLUEPRINTS;
}

export function getBlueprintById(
  id: NamedSpellId
): NamedSpellBlueprint | undefined {
  return BLUEPRINTS_BY_ID[id];
}
`;

  return header + "\n" + blueprints + "\n" + footer;
}

export default function SpellEditor() {
  const [spells, setSpells] = useState<NamedSpellBlueprint[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<NamedSpellBlueprint | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSpells() {
      try {
        const response = await fetch("/api/spells");
        if (response.ok) {
          const data = await response.json();
          setSpells(data.spells || []);
        } else {
          // Fallback to hardcoded data
          setSpells(NAMED_SPELL_BLUEPRINTS);
        }
      } catch (error) {
        console.error("Failed to load spells:", error);
    setSpells(NAMED_SPELL_BLUEPRINTS);
      } finally {
    setLoading(false);
      }
    }
    loadSpells();
  }, []);

  const handleSave = async () => {
    if (!selectedSpell) return;
    
    setSaving(true);
    try {
      const response = await fetch("/api/spells", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spell: selectedSpell }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update spell");
      }
      
      // Refresh the list
      const listResponse = await fetch("/api/spells");
      if (listResponse.ok) {
        const data = await listResponse.json();
        setSpells(data.spells || []);
      }
      
    setIsEditing(false);
    } catch (error) {
      console.error("Error saving spell:", error);
      alert(`Failed to save spell: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (spell: NamedSpellBlueprint) => {
    if (!confirm(`Delete ${spell.name}?`)) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/spells?id=${encodeURIComponent(spell.id)}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete spell");
      }
      
      // Refresh the list
      const listResponse = await fetch("/api/spells");
      if (listResponse.ok) {
        const data = await listResponse.json();
        setSpells(data.spells || []);
      }
      
    if (selectedSpell?.id === spell.id) {
      setSelectedSpell(null);
      }
    } catch (error) {
      console.error("Error deleting spell:", error);
      alert(`Failed to delete spell: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (newSpell: NamedSpellBlueprint) => {
    setSaving(true);
    try {
      const response = await fetch("/api/spells", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spell: newSpell }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create spell");
      }
      
      // Refresh the list
      const listResponse = await fetch("/api/spells");
      if (listResponse.ok) {
        const data = await listResponse.json();
        setSpells(data.spells || []);
      }
      
      setShowCreateModal(false);
      setSelectedSpell(newSpell);
    } catch (error) {
      console.error("Error creating spell:", error);
      alert(`Failed to create spell: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
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
          sourcePath="data/spells.db"
          outputPath="data/spells.db"
          description="Named spells are predefined spell blueprints that players can discover and evolve. Each spell has requirements (runes, damage focus, familiarity) that must be met for evolution."
          mergeStrategy="Spells are stored in SQLite database (data/spells.db). Changes are persisted immediately. The database file can be version controlled."
        />
      </div>

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
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [requiredRunes, setRequiredRunes] = useState<RuneCode[]>([]);
  const [allowedExtraRunes, setAllowedExtraRunes] = useState<RuneCode[]>([]);
  const [tags, setTags] = useState<SpellTag[]>([]);
  const [hidden, setHidden] = useState(false);
  const [hint, setHint] = useState("");
  const [minDamageFocusType, setMinDamageFocusType] = useState<DamageType | "">("");
  const [minDamageFocusRatio, setMinDamageFocusRatio] = useState(0.5);
  const [minTotalPower, setMinTotalPower] = useState<number | undefined>(undefined);
  const [requiresNamedSourceId, setRequiresNamedSourceId] = useState<string>("");
  const [minTotalFamiliarityScore, setMinTotalFamiliarityScore] = useState<number | undefined>(undefined);
  const [requiredFlags, setRequiredFlags] = useState<AchievementFlag[]>([]);
  const [effects, setEffects] = useState<EffectBlueprint[]>([]);

  const allRunes = Object.values(RC);
  const allTags = Object.values(SpellTag);
  const allDamageTypes = Object.values(DamageType);
  const allFlags = Object.values(AchievementFlag);
  const allEffectTypes = Object.values(EffectType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert("Name is required");
      return;
    }
    
    const id = nameToId(name);
    if (existingIds.includes(id)) {
      alert(`A spell with ID "${id}" already exists. Please choose a different name.`);
      return;
    }
    
    if (requiredRunes.length === 0) {
      alert("At least one required rune is needed");
      return;
    }
    
    if (tags.length === 0) {
      alert("At least one tag is required");
      return;
    }
    
    if (!hint.trim()) {
      alert("Hint is required");
      return;
    }

    const spell: NamedSpellBlueprint = {
      id: id as any,
      name: name.trim(),
      description: description.trim() || "A powerful spell.",
      tags,
      requiredRunes,
      allowedExtraRunes: allowedExtraRunes.length > 0 ? allowedExtraRunes : undefined,
      minDamageFocus: minDamageFocusType ? {
        type: minDamageFocusType as DamageType,
        ratio: minDamageFocusRatio,
      } : undefined,
      minTotalPower,
      requiresNamedSourceId: requiresNamedSourceId || undefined,
      minTotalFamiliarityScore,
      requiredFlags: requiredFlags.length > 0 ? requiredFlags : undefined,
      effects: effects.length > 0 ? effects : undefined,
      hidden,
      hint: hint.trim() || "Try experimenting with different rune combinations.",
    };
    
    onCreate(spell);
  };

  const toggleRune = (rune: RuneCode, list: RuneCode[], setList: (runes: RuneCode[]) => void) => {
    if (list.includes(rune)) {
      setList(list.filter(r => r !== rune));
    } else {
      setList([...list, rune]);
    }
  };

  const toggleTag = (tag: SpellTag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const toggleFlag = (flag: AchievementFlag) => {
    if (requiredFlags.includes(flag)) {
      setRequiredFlags(requiredFlags.filter(f => f !== flag));
    } else {
      setRequiredFlags([...requiredFlags, flag]);
    }
  };

  const addEffect = (effectType: EffectType) => {
    const def = EFFECT_DEFS[effectType];
    const newEffect: EffectBlueprint = {
      type: effectType,
      baseMagnitude: def.blueprint.baseMagnitude,
      baseDurationSec: def.blueprint.baseDurationSec,
      self: def.blueprint.self,
    };
    setEffects([...effects, newEffect]);
  };

  const removeEffect = (index: number) => {
    setEffects(effects.filter((_, i) => i !== index));
  };

  const updateEffect = (index: number, updates: Partial<EffectBlueprint>) => {
    const updated = effects.map((eff, i) => 
      i === index ? { ...eff, ...updates } : eff
    );
    setEffects(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-shadow border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-glow">Create New Spell</h3>
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
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              placeholder="e.g., Ember Ray"
              required
            />
            {name && (
              <p className="text-xs text-text-muted mt-1">
                ID: <code className="text-ember-glow">{nameToId(name)}</code>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              rows={3}
              placeholder="A focused beam of searing flame..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Required Runes *
            </label>
            <div className="flex flex-wrap gap-2">
              {allRunes.map((rune) => {
                const runeName = Object.entries(RC).find(([_, v]) => v === rune)?.[0] || rune;
                const isSelected = requiredRunes.includes(rune);
                return (
                  <button
                    key={rune}
                    type="button"
                    onClick={() => toggleRune(rune, requiredRunes, setRequiredRunes)}
                    className={`px-3 py-1 rounded text-sm ${
                      isSelected
                        ? "bg-ember text-ember-glow border border-ember-glow"
                        : "bg-deep border border-border text-text-secondary hover:border-ember/50"
                    }`}
                  >
                    {runeName} ({rune})
                  </button>
                );
              })}
            </div>
            {requiredRunes.length > 0 && (
              <p className="text-xs text-text-muted mt-2">
                Selected: {requiredRunes.join(", ")}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Allowed Extra Runes (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {allRunes.map((rune) => {
                const runeName = Object.entries(RC).find(([_, v]) => v === rune)?.[0] || rune;
                const isSelected = allowedExtraRunes.includes(rune);
                const isRequired = requiredRunes.includes(rune);
                return (
                  <button
                    key={rune}
                    type="button"
                    onClick={() => toggleRune(rune, allowedExtraRunes, setAllowedExtraRunes)}
                    disabled={isRequired}
                    className={`px-3 py-1 rounded text-sm ${
                      isRequired
                        ? "bg-deep/50 border border-border/50 text-text-muted cursor-not-allowed"
                        : isSelected
                        ? "bg-ember text-ember-glow border border-ember-glow"
                        : "bg-deep border border-border text-text-secondary hover:border-ember/50"
                    }`}
                  >
                    {runeName} ({rune})
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Tags *
            </label>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const isSelected = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded text-sm ${
                      isSelected
                        ? "bg-shadow-purple text-shadow-purple-glow border border-shadow-purple-glow"
                        : "bg-deep border border-border text-text-secondary hover:border-shadow-purple/50"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Hint *
            </label>
            <textarea
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              rows={2}
              placeholder="Try weaving fire, air, and ray runes..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1">
                Min Damage Focus Type
              </label>
              <select
                value={minDamageFocusType}
                onChange={(e) => setMinDamageFocusType(e.target.value as DamageType | "")}
                className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              >
                <option value="">None</option>
                {allDamageTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            {minDamageFocusType && (
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">
                  Min Damage Focus Ratio
                </label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={minDamageFocusRatio}
                  onChange={(e) => setMinDamageFocusRatio(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
                />
                <p className="text-xs text-text-muted mt-1">
                  {(minDamageFocusRatio * 100).toFixed(0)}%
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Min Total Power (optional)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={minTotalPower || ""}
              onChange={(e) => setMinTotalPower(e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              placeholder="e.g., 1.0"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Requires Named Source (optional)
            </label>
            <select
              value={requiresNamedSourceId}
              onChange={(e) => setRequiresNamedSourceId(e.target.value)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
            >
              <option value="">None</option>
              {existingSpells.map((spell) => (
                <option key={spell.id} value={spell.id}>
                  {spell.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Min Total Familiarity Score (optional)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={minTotalFamiliarityScore || ""}
              onChange={(e) => setMinTotalFamiliarityScore(e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              placeholder="e.g., 1.0"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Required Achievement Flags (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {allFlags.map((flag) => {
                const isSelected = requiredFlags.includes(flag);
                return (
                  <button
                    key={flag}
                    type="button"
                    onClick={() => toggleFlag(flag)}
                    className={`px-3 py-1 rounded text-sm ${
                      isSelected
                        ? "bg-ember text-ember-glow border border-ember-glow"
                        : "bg-deep border border-border text-text-secondary hover:border-ember/50"
                    }`}
                  >
                    {flag}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">
              Effects (optional)
            </label>
            <div className="mb-3">
              <label className="block text-xs text-text-muted mb-1">Add Effect:</label>
              <div className="flex flex-wrap gap-2">
                {allEffectTypes.map((effectType) => {
                  const def = EFFECT_DEFS[effectType];
                  const isAdded = effects.some(e => e.type === effectType);
                  return (
                    <button
                      key={effectType}
                      type="button"
                      onClick={() => !isAdded && addEffect(effectType)}
                      disabled={isAdded}
                      className={`px-3 py-1 rounded text-sm ${
                        isAdded
                          ? "bg-deep/50 border border-border/50 text-text-muted cursor-not-allowed"
                          : "bg-deep border border-border text-text-secondary hover:border-ember/50"
                      }`}
                      title={def.description}
                    >
                      {def.name}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {effects.length > 0 && (
              <div className="space-y-3 border border-border rounded-lg p-3 bg-deep/30">
                {effects.map((effect, index) => {
                  const def = EFFECT_DEFS[effect.type];
                  return (
                    <div key={index} className="border border-border rounded p-3 bg-deep">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-semibold text-ember-glow">{def.name}</span>
                          <span className="text-xs text-text-muted ml-2">({def.description})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEffect(index)}
                          className="text-red-500 hover:text-red-400 text-sm"
                        >
                          ✕ Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-text-muted mb-1">Magnitude</label>
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={effect.baseMagnitude}
                            onChange={(e) => updateEffect(index, { baseMagnitude: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1 bg-deep border border-border rounded text-sm text-text-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-text-muted mb-1">Duration (sec)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={effect.baseDurationSec}
                            onChange={(e) => updateEffect(index, { baseDurationSec: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1 bg-deep border border-border rounded text-sm text-text-primary"
                          />
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-2 text-xs text-text-secondary">
                            <input
                              type="checkbox"
                              checked={effect.self || false}
                              onChange={(e) => updateEffect(index, { self: e.target.checked })}
                              className="w-4 h-4"
                            />
                            Self (applies to caster)
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hidden"
              checked={hidden}
              onChange={(e) => setHidden(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="hidden" className="text-sm text-text-secondary">
              Hidden (not shown until discovered)
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn flex-1"
            >
              {saving ? "Creating..." : "Create Spell"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
        </div>
    </div>
  );
}

