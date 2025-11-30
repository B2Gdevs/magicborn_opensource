"use client";

import { CraftingScreen } from "@components/crafting/CraftingScreen";
import { useActivePlayer, useSpellsForActivePlayer, useGameStore } from "@lib/store/gameStore";

export default function CraftingPage() {
  const player = useActivePlayer();
  const spells = useSpellsForActivePlayer();
  const addSpell = useGameStore((s) => s.addSpell);

  if (!player) {
    return (
      <main className="p-6">
        <div className="card">
          <p className="text-sm text-slate-300">
            No active player. Go to{" "}
            <a className="underline" href="/players">
              Players
            </a>{" "}
            and create / select one.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Spell Crafting</h1>
        <CraftingScreen
          player={player}
          knownSpells={spells}
          onSpellCrafted={addSpell}
        />
      </div>
    </main>
  );
}
