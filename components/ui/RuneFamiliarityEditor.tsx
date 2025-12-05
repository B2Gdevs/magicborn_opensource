// components/ui/RuneFamiliarityEditor.tsx
// Component for editing per-rune familiarity requirements

"use client";

import { useState } from "react";
import { RC } from "@pkg/runes";
import type { RuneCode } from "@core/types";
import { cn } from "@/lib/utils/cn";

export interface RuneFamiliarityEditorProps {
  value: Partial<Record<RuneCode, number>>;
  onChange: (value: Partial<Record<RuneCode, number>>) => void;
  label?: string;
  className?: string;
}

export function RuneFamiliarityEditor({
  value,
  onChange,
  label = "Min Rune Familiarity (optional)",
  className,
}: RuneFamiliarityEditorProps) {
  const allRunes = Object.values(RC);
  const [expandedRunes, setExpandedRunes] = useState<Set<RuneCode>>(new Set());

  const toggleRune = (rune: RuneCode) => {
    if (expandedRunes.has(rune)) {
      setExpandedRunes(new Set([...expandedRunes].filter((r) => r !== rune)));
      // Remove from value if it exists
      const newValue = { ...value };
      delete newValue[rune];
      onChange(newValue);
    } else {
      setExpandedRunes(new Set([...expandedRunes, rune]));
      // Add with default value of 0.5
      onChange({ ...value, [rune]: value[rune] ?? 0.5 });
    }
  };

  const updateFamiliarity = (rune: RuneCode, familiarity: number) => {
    if (familiarity <= 0) {
      const newValue = { ...value };
      delete newValue[rune];
      onChange(newValue);
      setExpandedRunes(new Set([...expandedRunes].filter((r) => r !== rune)));
    } else {
      onChange({ ...value, [rune]: familiarity });
    }
  };

  const runesWithRequirements = allRunes.filter((rune) => value[rune] !== undefined);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-text-secondary">
          {label}
        </label>
        {runesWithRequirements.length > 0 && (
          <span className="text-xs text-text-muted">
            {runesWithRequirements.length} rune{runesWithRequirements.length !== 1 ? "s" : ""} configured
          </span>
        )}
      </div>

      {/* Quick add buttons */}
      <div className="flex flex-wrap gap-2">
        {allRunes.map((rune) => {
          const runeName = Object.entries(RC).find(([_, v]) => v === rune)?.[0] || rune;
          const hasRequirement = value[rune] !== undefined;
          const isExpanded = expandedRunes.has(rune);

          return (
            <div key={rune} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleRune(rune)}
                className={cn(
                  "px-3 py-1 rounded text-sm transition-all",
                  hasRequirement
                    ? "bg-ember text-ember-glow border border-ember-glow"
                    : "bg-deep border border-border text-text-secondary hover:border-ember/50"
                )}
              >
                {runeName} ({rune})
              </button>
              {isExpanded && (
                <div className="flex items-center gap-2 bg-deep border border-border rounded px-2 py-1">
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={value[rune] ?? 0.5}
                    onChange={(e) => updateFamiliarity(rune, parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 bg-shadow border border-border rounded text-sm text-text-primary"
                    placeholder="0.5"
                  />
                  <span className="text-xs text-text-muted">
                    {(value[rune] ?? 0.5) * 100}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary of configured runes */}
      {runesWithRequirements.length > 0 && (
        <div className="mt-3 p-3 bg-deep/30 border border-border rounded">
          <p className="text-xs font-semibold text-text-secondary mb-2">Configured Requirements:</p>
          <div className="flex flex-wrap gap-2">
            {runesWithRequirements.map((rune) => {
              const runeName = Object.entries(RC).find(([_, v]) => v === rune)?.[0] || rune;
              return (
                <span
                  key={rune}
                  className="text-xs bg-ember/20 text-ember-glow px-2 py-1 rounded"
                >
                  {runeName}: {(value[rune]! * 100).toFixed(0)}%
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

