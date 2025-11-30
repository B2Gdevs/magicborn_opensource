// components/SpellPreview.tsx
"use client";

import React from "react";
import type { Spell } from "@core/types";
import { useSpellCraftingStore } from "@/lib/store/spellCraftingStore";

export interface SpellPreviewProps {
  // Optional: if not passed, component uses currentSpell from the store
  spell?: Spell;
}

const SpellPreview: React.FC<SpellPreviewProps> = ({ spell }) => {
  const currentSpell = useSpellCraftingStore((s) => s.currentSpell);
  const s = spell ?? currentSpell;

  if (!s) {
    return (
      <div className="p-3 text-sm text-slate-400 border border-slate-700 rounded-lg bg-slate-900/60">
        No spell selected.
      </div>
    );
  }

  const { name, level, runes, combat, lastEval } = s;

  const totalBurst = combat
    ? Object.values(combat.burst).reduce((a, b) => a + b, 0)
    : 0;
  const totalDot = combat
    ? Object.values(combat.dot).reduce((a, b) => a + b, 0)
    : 0;
  const totalPower = combat
    ? totalBurst + totalDot * combat.dotDurationSec
    : 0;

  return (
    <div className="p-4 border border-slate-700 rounded-lg bg-slate-900/60 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-slate-50">
            {name ?? "Nameless Spell"}
          </div>
          <div className="text-xs text-slate-400">
            Level {level ?? 1}
          </div>
        </div>
        {totalPower > 0 && (
          <div className="text-xs text-emerald-300">
            Power: {Math.round(totalPower)}
          </div>
        )}
      </div>

      <div className="text-xs text-slate-300">
        <span className="font-semibold text-slate-200">Runes:</span>{" "}
        {runes && runes.length ? runes.join(" ") : "None"}
      </div>

      {combat && (
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 mt-1">
          <div>
            <div className="font-semibold text-slate-200 mb-1">Burst</div>
            {Object.entries(combat.burst).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span>{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="font-semibold text-slate-200 mb-1">
              Damage over Time (x{combat.dotDurationSec}s)
            </div>
            {Object.entries(combat.dot).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span>{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {lastEval?.effects?.length ? (
        <div className="text-[11px] text-slate-300 mt-2">
          <span className="font-semibold text-slate-200">Effects:</span>{" "}
          {lastEval.effects.join(", ")}
        </div>
      ) : null}
    </div>
  );
};

export default SpellPreview;
