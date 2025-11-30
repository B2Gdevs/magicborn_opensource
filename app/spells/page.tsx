// app/spells/page.tsx
"use client";

import React from "react";
import { useSpellCraftingStore } from "@/lib/store/spellCraftingStore";
import SpellPreview from "@components/SpellPreview";
import SpellEvolutionPanel from "@components/crafting/SpellEvolutionPanel";

export default function SpellsPage() {
  const currentSpell = useSpellCraftingStore((s) => s.currentSpell);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-3 gap-4">
        {/* Left / center: crafting UI */}
        <section className="col-span-2 flex flex-col gap-4">
          <h1 className="text-xl font-semibold">Spell Crafting</h1>

          {currentSpell ? (
            <SpellPreview spell={currentSpell} />
          ) : (
            <div className="p-3 text-sm text-slate-400 border border-slate-700 rounded-lg bg-slate-900/60">
              Select or craft a spell to begin.
            </div>
          )}

          {/* CraftingForm / RunePicker should call
              useSpellCraftingStore.getState().setCurrentSpell(...) */}
        </section>

        {/* Right: evolution options */}
        <aside className="col-span-1">
          <SpellEvolutionPanel />
        </aside>
      </div>
    </main>
  );
}
