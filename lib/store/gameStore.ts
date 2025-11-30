// lib/store/gameStore.ts
import { useMemo } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Player, Spell } from "@core/types";
import type { NamedSpellId } from "@data/namedSpells";
import { EvolutionService } from "@pkg/evolution/evolutionService";

const evoService = new EvolutionService();

export interface PlayerSlice {
  players: Player[];
  activePlayerId: string | null;
  addOrUpdatePlayer: (player: Player) => void;
  deletePlayer: (id: string) => void;
  setActivePlayer: (id: string) => void;
}

export interface SpellSlice {
  spells: Spell[]; // all spells, across players
  addSpell: (spell: Spell) => void;
  updateSpell: (spell: Spell) => void;
  deleteSpell: (id: string) => void;
}

export interface EvolutionSlice {
  // which named blueprints this player has “discovered”
  discoveredByPlayer: Record<string, NamedSpellId[]>; // playerId -> blueprintIds

  markBlueprintDiscovered: (playerId: string, id: NamedSpellId) => void;

  // derived helpers
  getPossibleEvolutionsForSpell: (spell: Spell) => NamedSpellId[];
  evolveSpellForPlayer: (playerId: string, spellId: string, blueprintId: NamedSpellId) => void;
}

export type GameState = PlayerSlice & SpellSlice & EvolutionSlice;

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // --- Player slice ---
      players: [],
      activePlayerId: null,

      addOrUpdatePlayer: (player) =>
        set((state) => {
          const idx = state.players.findIndex((p) => p.id === player.id);
          const players = [...state.players];
          if (idx >= 0) players[idx] = player;
          else players.push(player);

          return {
            players,
            activePlayerId: state.activePlayerId ?? player.id,
          };
        }),

      deletePlayer: (id) =>
        set((state) => {
          const players = state.players.filter((p) => p.id !== id);
          const spells = state.spells.filter((s) => s.ownerId !== id);

          let activePlayerId = state.activePlayerId;
          if (activePlayerId === id) {
            activePlayerId = players[0]?.id ?? null;
          }

          const discoveredByPlayer = { ...state.discoveredByPlayer };
          delete discoveredByPlayer[id];

          return { players, spells, activePlayerId, discoveredByPlayer };
        }),

      setActivePlayer: (id) =>
        set((state) => ({
          activePlayerId: state.players.some((p) => p.id === id) ? id : state.activePlayerId,
        })),

      // --- Spell slice ---
      spells: [],

      addSpell: (spell) =>
        set((state) => ({
          spells: [...state.spells, spell],
        })),

      updateSpell: (spell) =>
        set((state) => ({
          spells: state.spells.map((s) => (s.id === spell.id ? spell : s)),
        })),

      deleteSpell: (id) =>
        set((state) => ({
          spells: state.spells.filter((s) => s.id !== id),
        })),

      // --- Evolution slice ---
      discoveredByPlayer: {},

      markBlueprintDiscovered: (playerId, id) =>
        set((state) => {
          const existing = state.discoveredByPlayer[playerId] ?? [];
          if (existing.includes(id)) return state;
          return {
            discoveredByPlayer: {
              ...state.discoveredByPlayer,
              [playerId]: [...existing, id],
            },
          };
        }),

      getPossibleEvolutionsForSpell: (spell) => {
        const options = evoService.listPossibleEvolutions(spell);
        return options.map((opt) => opt.blueprint.id);
      },

      evolveSpellForPlayer: (playerId, spellId, blueprintId) =>
        set((state) => {
          const idx = state.spells.findIndex((s) => s.id === spellId);
          if (idx < 0) return state;

          const base = state.spells[idx];
          const evolved = evoService.evolveSpell(base, blueprintId);
          if (!evolved) return state;

          const newSpells = [...state.spells];
          newSpells[idx] = evolved;

          const existing = state.discoveredByPlayer[playerId] ?? [];
          const discovered = existing.includes(blueprintId)
            ? existing
            : [...existing, blueprintId];

          return {
            spells: newSpells,
            discoveredByPlayer: {
              ...state.discoveredByPlayer,
              [playerId]: discovered,
            },
          };
        }),
    }),
    {
      name: "runeCrafter.game",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Convenience selectors  
export const useActivePlayer = () => {
  return useGameStore((s) => {
    if (!s.activePlayerId) return null;
    return s.players.find((p) => p.id === s.activePlayerId) ?? null;
  });
};

export const useSpellsForActivePlayer = () => {
  const activePlayerId = useGameStore((s) => s.activePlayerId);
  const allSpells = useGameStore((s) => s.spells);
  return useMemo(
    () => (activePlayerId ? allSpells.filter((sp) => sp.ownerId === activePlayerId) : []),
    [activePlayerId, allSpells]
  );
};

export const useDiscoveredBlueprintsForActivePlayer = () => {
  const activePlayerId = useGameStore((s) => s.activePlayerId);
  return useGameStore((s) =>
    activePlayerId ? s.discoveredByPlayer[activePlayerId] ?? [] : []
  );
};
