// components/providers/GameStateProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Player, Spell } from "@core/types";
import { PlayerLocalRepo } from "@pkg/repo/localRepo";
import { SpellLocalRepo } from "@pkg/repo/spellRepo";

const playerRepo = new PlayerLocalRepo();
const spellRepo = new SpellLocalRepo();

interface GameState {
  // players
  players: Player[];
  activePlayerId: string | null;
  activePlayer: Player | null;
  createOrUpdatePlayer: (player: Player) => void;
  deletePlayer: (id: string) => void;
  setActivePlayer: (id: string) => void;

  // spells
  spells: Spell[];
  activeSpells: Spell[];              // spells belonging to activePlayer
  addSpell: (spell: Spell) => void;
  updateSpell: (spell: Spell) => void;
  deleteSpell: (id: string) => void;
}

const GameStateContext = createContext<GameState | undefined>(undefined);

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [spells, setSpells] = useState<Spell[]>([]);

  // initial load
  useEffect(() => {
    const allPlayers = playerRepo.list();
    const activeId = playerRepo.getActiveId();
    const allSpells = spellRepo.listAll();
    setPlayers(allPlayers);
    setActivePlayerId(activeId);
    setSpells(allSpells);
  }, []);

  const activePlayer = useMemo(
    () => players.find((p) => p.id === activePlayerId) ?? null,
    [players, activePlayerId]
  );

  const activeSpells = useMemo(() => {
    if (!activePlayer) return [];
    return spells.filter((s) => s.ownerId === activePlayer.id);
  }, [spells, activePlayer]);

  // player ops
  const createOrUpdatePlayer = (player: Player) => {
    playerRepo.upsert(player);
    setPlayers(playerRepo.list());

    // if no active player yet, set this one
    setActivePlayerId((prev) => {
      if (prev) return prev;
      playerRepo.setActiveId(player.id);
      return player.id;
    });
  };

  const deletePlayer = (id: string) => {
    // deleting a player also deletes their spells
    playerRepo.remove(id);
    spellRepo.removeByOwner(id);
    setPlayers(playerRepo.list());
    setSpells(spellRepo.listAll());
    setActivePlayerId(playerRepo.getActiveId());
  };

  const setActivePlayer = (id: string) => {
    playerRepo.setActiveId(id);
    setActivePlayerId(id);
  };

  // spell ops
  const addSpell = (spell: Spell) => {
    spellRepo.upsert(spell);
    setSpells(spellRepo.listAll());
  };

  const updateSpell = (spell: Spell) => {
    spellRepo.upsert(spell);
    setSpells(spellRepo.listAll());
  };

  const deleteSpell = (id: string) => {
    spellRepo.remove(id);
    setSpells(spellRepo.listAll());
  };

  const value: GameState = {
    players,
    activePlayerId,
    activePlayer,
    createOrUpdatePlayer,
    deletePlayer,
    setActivePlayer,

    spells,
    activeSpells,
    addSpell,
    updateSpell,
    deleteSpell,
  };

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState(): GameState {
  const ctx = useContext(GameStateContext);
  if (!ctx) {
    throw new Error("useGameState must be used within a GameStateProvider");
  }
  return ctx;
}
