"use client";

import { useMemo, useState } from "react";
import type { Player, RuneCode, RuneInfusion, Spell } from "@core/types";
import { listRunes } from "@pkg/runes";
import { SpellFactory } from "@pkg/spellFactory";
import { EvaluatorService } from "@pkg/evaluator";
import { computeSpellManaCost } from "@pkg/cost";
import SpellPreview from "@components/SpellPreview";
import { RuneIcon } from "@components/ui/RuneIcon";
import { GameButton } from "@components/ui/GameButton";
import { TabStrip } from "@components/ui/TabStrip";
import { SpellIcon } from "@components/ui/SpellIcon";

const factory = new SpellFactory();
const evaluator = new EvaluatorService();

interface CraftingScreenProps {
  player: Player;
  knownSpells?: Spell[];
  onSpellCrafted?: (spell: Spell) => void;
}

type TabId = "runes" | "spellbook" | "evolutions";

export function CraftingScreen({ player, knownSpells = [], onSpellCrafted }: CraftingScreenProps) {
  const [activeTab, setActiveTab] = useState<TabId>("runes");
  const [runes, setRunes] = useState<RuneCode[]>([]);
  const [infusions, setInfusions] = useState<RuneInfusion[]>([]);

  const palette = useMemo(() => listRunes(), []);

  const tempSpell = useMemo(() => {
    if (runes.length === 0) return null;
    const s = factory.createNameless(player.id, runes);
    s.infusions = [...infusions];
    evaluator.evaluate(s, player);
    return s;
  }, [player, runes, infusions]);

  const currentCost = useMemo(() => {
    if (!tempSpell) return 0;
    return computeSpellManaCost(player, tempSpell);
  }, [player, tempSpell]);

  const canCraft = tempSpell && currentCost <= player.mana;

  const handleAddRune = (code: RuneCode) => {
    const nextRunes = [...runes, code];
    const s = factory.createNameless(player.id, nextRunes);
    s.infusions = [...infusions];
    evaluator.evaluate(s, player);
    const cost = computeSpellManaCost(player, s);
    if (cost > player.mana) {
      // ignore if too expensive
      return;
    }
    setRunes(nextRunes);
  };

  const handleClear = () => {
    setRunes([]);
    setInfusions([]);
  };

  const updateInfusion = (index: number, delta: number) => {
    setInfusions((prev) => {
      const map = new Map<number, number>();
      prev.forEach((inf) =>
        map.set(inf.index, (map.get(inf.index) ?? 0) + inf.extraMana)
      );
      const current = map.get(index) ?? 0;
      const next = Math.max(0, current + delta);
      map.set(index, next);

      const out: RuneInfusion[] = [];
      map.forEach((extraMana, i) => {
        if (extraMana > 0) out.push({ index: i, extraMana });
      });
      return out;
    });
  };

  const handleCraft = () => {
    if (!tempSpell || !canCraft) return;
    const crafted: Spell = {
      ...tempSpell,
      id: crypto.randomUUID(),
      craftCost: currentCost,
    };
    onSpellCrafted?.(crafted);
    handleClear();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr,3fr] gap-6 h-full">
      {/* LEFT: tabs + rune palette / spellbook / evolutions */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <TabStrip
            tabs={[
              { id: "runes", label: "Runes", icon: <>✴️</> },
              { id: "spellbook", label: "Spellbook", icon: <>📜</> },
              { id: "evolutions", label: "Evolutions", icon: <>🌱</> },
            ]}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id as TabId)}
          />
          <div className="text-xs text-slate-300">
            Mana:{" "}
            <span className="font-semibold text-emerald-300">
              {player.mana}
            </span>{" "}
            / {player.maxMana}
          </div>
        </div>

        {activeTab === "runes" && (
          <div className="card h-full">
            <h3 className="font-semibold mb-2">Rune Palette</h3>
            <p className="text-xs text-slate-300 mb-3">
              Tap runes to add them to the current incantation. Mana cost must
              stay under your current pool.
            </p>
            <div className="grid grid-cols-5 gap-6 pt-4">
              {palette.map((r) => (
                <div key={r.code} className="flex flex-col items-center">
                  <RuneIcon
                    rune={r.code}
                    size="md"
                    onClick={() => handleAddRune(r.code)}
                  />
                  <span className="text-[0.65rem] text-slate-400 mt-5">
                    Mana {r.manaCost}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "spellbook" && (
          <div className="card h-full">
            <h3 className="font-semibold mb-2">Spellbook</h3>
            {knownSpells.length === 0 && (
              <p className="text-xs text-slate-300">
                You haven&apos;t bound any named spells yet. Craft nameless
                spells and evolve them later.
              </p>
            )}
            <div className="mt-3 grid gap-3">
              {knownSpells.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/70 border border-slate-700"
                >
                  <SpellIcon spell={s} size="sm" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold">
                      {s.name ?? "Nameless Spell"}
                    </div>
                    <div className="text-[0.7rem] text-slate-400">
                      Runes: {s.runes.join(" ")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "evolutions" && (
          <div className="card h-full">
            <h3 className="font-semibold mb-2">Evolution Paths</h3>
            <p className="text-xs text-slate-300">
              Evolution options will appear here when we wire in the evolution
              rules. For now, focus on building strong nameless spells.
            </p>
          </div>
        )}
      </div>

      {/* RIGHT: current incantation + overcharge + preview */}
      <div className="flex flex-col gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">Current Incantation</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-300">Total Cost:</span>
              <span
                className={
                  currentCost > player.mana
                    ? "font-semibold text-rose-400"
                    : "font-semibold text-emerald-300"
                }
              >
                {currentCost}
              </span>
            </div>
          </div>

          {runes.length === 0 ? (
            <p className="text-sm text-slate-300">
              Select runes from the left to begin constructing a spell.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-4 mb-4">
                {runes.map((r, idx) => {
                  const infusion =
                    infusions.find((inf) => inf.index === idx)?.extraMana ?? 0;
                  return (
                    <div
                      key={`${r}-${idx}`}
                      className="flex flex-col items-center gap-1"
                    >
                      <RuneIcon rune={r} size="md" />
                      <div className="flex items-center gap-1 mt-4">
                        <button
                          type="button"
                          className="w-5 h-5 rounded-full bg-slate-800 text-slate-100 flex items-center justify-center text-xs"
                          onClick={() => updateInfusion(idx, -1)}
                        >
                          -
                        </button>
                        <span className="text-[0.7rem] text-slate-200 px-1">
                          +{infusion} mana
                        </span>
                        <button
                          type="button"
                          className="w-5 h-5 rounded-full bg-slate-800 text-slate-100 flex items-center justify-center text-xs"
                          onClick={() => updateInfusion(idx, +1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <GameButton variant="secondary" onClick={handleClear}>
                  Clear
                </GameButton>
                <GameButton
                  variant="primary"
                  onClick={handleCraft}
                  disabled={!canCraft}
                >
                  Craft Spell
                </GameButton>
              </div>
            </>
          )}
        </div>

        <SpellPreview spell={tempSpell ?? undefined} />
      </div>
    </div>
  );
}
