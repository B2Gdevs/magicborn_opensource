import React from "react";
import { useSpellCraftingStore } from "@/lib/store/spellCraftingStore";
import { EvolutionOptionsPanel } from "./EvolutionsOptionsPanel";

export const SpellCraftingScreen: React.FC = () => {
  const currentSpell = useSpellCraftingStore((s) => s.currentSpell);
  const saveCurrentSpell = useSpellCraftingStore((s) => s.saveCurrentSpell);

  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      {/* Left: crafting editor (stubbed here) */}
      <div className="col-span-2 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">
            Spell Crafting
          </h2>
          <button
            type="button"
            onClick={saveCurrentSpell}
            className="px-3 py-1.5 text-sm font-semibold rounded-md bg-indigo-500 hover:bg-indigo-400 text-slate-50"
          >
            Save Spell
          </button>
        </div>

        {/* Replace this section with your actual rune / sliders / etc. */}
        <div className="flex-1 rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-sm text-slate-300">
          {currentSpell ? (
            <div className="space-y-1">
              <div>
                <span className="font-semibold">Temp name:</span>{" "}
                {currentSpell.name ?? "(nameless spell)"}
              </div>
              <div>
                <span className="font-semibold">Runes Count:</span>{" "}
                {currentSpell.runes.length}
              </div>
              <div>
                <span className="font-semibold">Runes:</span>{" "}
                {currentSpell.runes.join(" ")}
              </div>
            </div>
          ) : (
            <div>Create or select a spell to begin crafting.</div>
          )}
        </div>
      </div>

      {/* Right: evolution options */}
      <div className="col-span-1">
        <EvolutionOptionsPanel />
      </div>
    </div>
  );
};
