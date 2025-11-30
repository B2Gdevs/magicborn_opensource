import React, { useMemo } from "react";
import { useSpellCraftingStore } from "@/lib/store/spellCraftingStore";

export const EvolutionOptionsPanel: React.FC = () => {
  const currentSpell = useSpellCraftingStore((s) => s.currentSpell);
  const listEvolutionsForCurrent = useSpellCraftingStore(
    (s) => s.listEvolutionsForCurrent
  );
  const evolveCurrentSpell = useSpellCraftingStore(
    (s) => s.evolveCurrentSpell
  );

  const options = useMemo(
    () => (currentSpell ? listEvolutionsForCurrent() : []),
    [currentSpell, listEvolutionsForCurrent]
  );

  if (!currentSpell) {
    return (
      <div className="p-3 text-sm text-slate-400">
        Craft or select a spell to see evolution options.
      </div>
    );
  }

  if (!options.length) {
    return (
      <div className="p-3 text-sm text-slate-400">
        No named evolutions available for this configuration yet.
        Try changing runes, damage focus, or level.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-3 border border-slate-700 rounded-lg bg-slate-900/60">
      <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
        Possible Evolutions
      </h3>

      {options.map(({ blueprint, score }) => (
        <div
          key={blueprint.id}
          className="flex flex-col gap-1 p-2 rounded-md bg-slate-800/70"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-sm font-medium text-slate-50">
                {blueprint.name}
              </div>
              <div className="text-xs text-slate-400">
                {blueprint.description}
              </div>
            </div>
            <button
              type="button"
              onClick={() => evolveCurrentSpell(blueprint.id)}
              className="px-2 py-1 text-xs font-semibold rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-900"
            >
              Evolve
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Score: {Math.round(score)}</span>
            {blueprint.hidden ? (
              <span className="italic text-amber-400/80">
                Hidden spell (discovered)
              </span>
            ) : (
              <span className="text-slate-500">
                Hint: {blueprint.hint}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
