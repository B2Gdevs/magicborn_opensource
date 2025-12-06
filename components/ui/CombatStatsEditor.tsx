// components/ui/CombatStatsEditor.tsx
// Reusable component for editing combat stats (HP, Mana, Rune Familiarity, Element XP/Affinity)

"use client";

import type { AlphabetVector } from "@core/types";
import type { ElementXpMap, ElementAffinityMap } from "@/lib/packages/player/AffinityService";
import { DamageType } from "@core/enums";
import { RuneFamiliarityEditor } from "@components/ui/RuneFamiliarityEditor";

interface CombatStatsEditorProps {
  // Resource Pools
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  onHpChange: (hp: number) => void;
  onMaxHpChange: (maxHp: number) => void;
  onManaChange: (mana: number) => void;
  onMaxManaChange: (maxMana: number) => void;

  // Rune Familiarity
  affinity: AlphabetVector;
  onAffinityChange: (affinity: AlphabetVector) => void;

  // Element XP & Affinity
  elementXp?: ElementXpMap;
  elementAffinity?: ElementAffinityMap;
  onElementXpChange?: (elementXp: ElementXpMap) => void;
  onElementAffinityChange?: (elementAffinity: ElementAffinityMap) => void;

  // Player-specific (optional)
  controlBonus?: number;
  costEfficiency?: number;
  onControlBonusChange?: (controlBonus: number | undefined) => void;
  onCostEfficiencyChange?: (costEfficiency: number | undefined) => void;
}

export function CombatStatsEditor({
  hp,
  maxHp,
  mana,
  maxMana,
  onHpChange,
  onMaxHpChange,
  onManaChange,
  onMaxManaChange,
  affinity,
  onAffinityChange,
  elementXp,
  elementAffinity,
  onElementXpChange,
  onElementAffinityChange,
  controlBonus,
  costEfficiency,
  onControlBonusChange,
  onCostEfficiencyChange,
}: CombatStatsEditorProps) {
  const allDamageTypes = Object.values(DamageType);

  return (
    <>
      {/* Resource Pools */}
      <div className="border-t border-border pt-4">
        <h3 className="text-lg font-semibold text-glow mb-3">Resource Pools</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              HP *
            </label>
            <input
              type="number"
              value={hp}
              onChange={(e) => onHpChange(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Max HP *
            </label>
            <input
              type="number"
              value={maxHp}
              onChange={(e) => onMaxHpChange(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Mana *
            </label>
            <input
              type="number"
              value={mana}
              onChange={(e) => onManaChange(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Max Mana *
            </label>
            <input
              type="number"
              value={maxMana}
              onChange={(e) => onMaxManaChange(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              required
            />
          </div>
        </div>
      </div>

      {/* Rune Familiarity */}
      <div className="border-t border-border pt-4">
        <h3 className="text-lg font-semibold text-glow mb-3">Rune Familiarity</h3>
        <RuneFamiliarityEditor
          value={affinity}
          onChange={onAffinityChange}
        />
      </div>

      {/* Element XP & Affinity */}
      {(onElementXpChange || onElementAffinityChange) && (
        <div className="border-t border-border pt-4">
          <h3 className="text-lg font-semibold text-glow mb-3">Elemental Progression</h3>
          <div className="grid grid-cols-2 gap-4">
            {onElementXpChange && (
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">
                  Element XP
                </label>
                <div className="space-y-2">
                  {allDamageTypes.map((type) => (
                    <div key={type} className="flex items-center gap-2">
                      <span className="text-sm text-text-primary w-20">{type}:</span>
                      <input
                        type="number"
                        value={elementXp?.[type] ?? 0}
                        onChange={(e) =>
                          onElementXpChange({
                            ...(elementXp || {}),
                            [type]: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="flex-1 px-2 py-1 bg-deep border border-border rounded text-sm text-text-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {onElementAffinityChange && (
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">
                  Element Affinity
                </label>
                <div className="space-y-2">
                  {allDamageTypes.map((type) => (
                    <div key={type} className="flex items-center gap-2">
                      <span className="text-sm text-text-primary w-20">{type}:</span>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.05"
                        value={elementAffinity?.[type] ?? 0}
                        onChange={(e) =>
                          onElementAffinityChange({
                            ...(elementAffinity || {}),
                            [type]: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="flex-1 px-2 py-1 bg-deep border border-border rounded text-sm text-text-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Player-specific fields */}
      {(onControlBonusChange || onCostEfficiencyChange) && (
        <div className="border-t border-border pt-4">
          <h3 className="text-lg font-semibold text-glow mb-3">Player-Specific Attributes</h3>
          <div className="grid grid-cols-2 gap-4">
            {onControlBonusChange && (
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">
                  Control Bonus (optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={controlBonus || ""}
                  onChange={(e) =>
                    onControlBonusChange(e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
                  placeholder="Reduces instability"
                />
              </div>
            )}
            {onCostEfficiencyChange && (
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">
                  Cost Efficiency (optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={costEfficiency || ""}
                  onChange={(e) =>
                    onCostEfficiencyChange(e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
                  placeholder="Reduces mana cost"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

