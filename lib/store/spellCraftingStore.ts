// lib/store/spellCraftingStore.ts
import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Spell } from "@core/types";
import type { NamedSpellId } from "@/lib/data/namedSpells";
import { EvolutionService } from "@pkg/evolution/evolutionService";

const evolutionService = new EvolutionService();

export interface SpellCraftingState {
  // All spells the player has crafted / discovered
  spells: Spell[];

  // Currently edited / previewed spell in the crafting UI
  currentSpell: Spell | null;

  // For list views where you select an existing spell
  selectedSpellId: string | null;

  // Derived helper: get selected spell
  getSelectedSpell(): Spell | null;

  // Mutators
  setCurrentSpell(spell: Spell | null): void;
  saveCurrentSpell(): void;
  selectSpell(spellId: string | null): void;
  deleteSpell(spellId: string): void;

  // Evolution (works off currentSpell)
  listEvolutionsForCurrent(): ReturnType<
    EvolutionService["listPossibleEvolutions"]
  >;
  evolveCurrentSpell(blueprintId: NamedSpellId): void;
}

export const useSpellCraftingStore = create<SpellCraftingState>(
  (set, get) => ({
    spells: [],
    currentSpell: null,
    selectedSpellId: null,

    getSelectedSpell() {
      const { spells, selectedSpellId } = get();
      if (!selectedSpellId) return null;
      return spells.find((s) => s.id === selectedSpellId) ?? null;
    },

    setCurrentSpell(spell) {
      set({ currentSpell: spell });
    },

    saveCurrentSpell() {
      const { currentSpell, spells } = get();
      if (!currentSpell) return;

      const withId: Spell = {
        ...currentSpell,
        id: currentSpell.id ?? nanoid(),
      };

      const existingIndex = spells.findIndex((s) => s.id === withId.id);
      if (existingIndex >= 0) {
        const next = [...spells];
        next[existingIndex] = withId;
        set({
          spells: next,
          selectedSpellId: withId.id,
          currentSpell: withId,
        });
      } else {
        set({
          spells: [...spells, withId],
          selectedSpellId: withId.id,
          currentSpell: withId,
        });
      }
    },

    selectSpell(spellId) {
      const { spells } = get();
      if (!spellId) {
        set({ selectedSpellId: null, currentSpell: null });
        return;
      }
      const spell = spells.find((s) => s.id === spellId) ?? null;
      set({ selectedSpellId: spellId, currentSpell: spell });
    },

    deleteSpell(spellId) {
      const { spells, selectedSpellId, currentSpell } = get();
      const next = spells.filter((s) => s.id !== spellId);
      const clearingCurrent = currentSpell?.id === spellId;
      const clearingSelected = selectedSpellId === spellId;

      set({
        spells: next,
        currentSpell: clearingCurrent ? null : currentSpell,
        selectedSpellId: clearingSelected ? null : selectedSpellId,
      });
    },

    listEvolutionsForCurrent() {
      const { currentSpell } = get();
      if (!currentSpell) return [];
      return evolutionService.listPossibleEvolutions(currentSpell);
    },

    evolveCurrentSpell(blueprintId) {
      const { currentSpell, spells } = get();
      if (!currentSpell) return;

      // Ensure we have an id before evolving so it can live in the list
      const base: Spell = {
        ...currentSpell,
        id: currentSpell.id ?? nanoid(),
      };

      const evolved = evolutionService.evolveSpell(base, blueprintId);
      if (!evolved) return;

      const idx = spells.findIndex((s) => s.id === evolved.id);
      let nextSpells: Spell[];

      if (idx >= 0) {
        nextSpells = [...spells];
        nextSpells[idx] = evolved;
      } else {
        nextSpells = [...spells, evolved];
      }

      set({
        spells: nextSpells,
        currentSpell: evolved,
        selectedSpellId: evolved.id ?? null,
      });
    },
  })
);
