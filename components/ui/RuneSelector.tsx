// components/ui/RuneSelector.tsx
// Reusable rune selector component

"use client";

import { RC } from "@pkg/runes";
import type { RuneCode } from "@core/types";
import { cn } from "@/lib/utils/cn";
import { Button } from "./Button";

export interface RuneSelectorProps {
  selected: RuneCode[];
  onChange: (runes: RuneCode[]) => void;
  label?: string;
  disabled?: RuneCode[];
  className?: string;
  required?: boolean;
}

export function RuneSelector({
  selected,
  onChange,
  label,
  disabled = [],
  className,
  required = false,
}: RuneSelectorProps) {
  const allRunes = Object.values(RC);

  const toggleRune = (rune: RuneCode) => {
    if (selected.includes(rune)) {
      onChange(selected.filter((r) => r !== rune));
    } else {
      onChange([...selected, rune]);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {allRunes.map((rune) => {
          const runeName = Object.entries(RC).find(([_, v]) => v === rune)?.[0] || rune;
          const isSelected = selected.includes(rune);
          const isDisabled = disabled.includes(rune);

          return (
            <button
              key={rune}
              type="button"
              onClick={() => !isDisabled && toggleRune(rune)}
              disabled={isDisabled}
              className={cn(
                "px-3 py-1 rounded text-sm transition-all",
                isDisabled
                  ? "bg-deep/50 border border-border/50 text-text-muted cursor-not-allowed"
                  : isSelected
                  ? "bg-ember text-ember-glow border border-ember-glow"
                  : "bg-deep border border-border text-text-secondary hover:border-ember/50"
              )}
            >
              {runeName} ({rune})
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-text-muted">
          Selected: {selected.join(", ")}
        </p>
      )}
    </div>
  );
}

