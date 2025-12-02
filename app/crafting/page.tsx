"use client";

import { CraftingScreen } from "@components/crafting/CraftingScreen";
import { useActivePlayer, useSpellsForActivePlayer, useGameStore } from "@lib/store/gameStore";

export default function CraftingPage() {
  const player = useActivePlayer();
  const spells = useSpellsForActivePlayer();
  const addSpell = useGameStore((s) => s.addSpell);

  if (!player) {
    return (
      <main className="ml-64 mt-16 p-6">
        <div className="card">
          <p className="text-sm text-text-secondary">
            No active player. Go to{" "}
            <a className="underline text-ember-glow" href="/players">
              Players
            </a>{" "}
            and create / select one.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="ml-64 mt-16 min-h-screen bg-void text-text-primary p-6">
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
