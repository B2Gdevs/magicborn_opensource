// lib/packages/repo/localRepo.ts
import type { Player } from "@core/types";

const PLAYERS_KEY = "runeCrafter.players";
const ACTIVE_PLAYER_KEY = "runeCrafter.activePlayerId";

function isBrowser() {
  return typeof window !== "undefined";
}

function safeParsePlayers(raw: string | null): Player[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Player[];
  } catch {
    return [];
  }
}

export class PlayerLocalRepo {
  private readAll(): Player[] {
    if (!isBrowser()) return [];
    const raw = window.localStorage.getItem(PLAYERS_KEY);
    return safeParsePlayers(raw);
  }

  private writeAll(players: Player[]) {
    if (!isBrowser()) return;
    window.localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
  }

  list(): Player[] {
    return this.readAll();
  }

  get(id: string): Player | null {
    return this.readAll().find((p) => p.id === id) ?? null;
  }

  upsert(player: Player) {
    const players = this.readAll();
    const idx = players.findIndex((p) => p.id === player.id);
    if (idx >= 0) {
      players[idx] = player;
    } else {
      players.push(player);
    }
    this.writeAll(players);
  }

  remove(id: string) {
    const players = this.readAll().filter((p) => p.id !== id);
    this.writeAll(players);

    const activeId = this.getActiveId();
    if (activeId === id) {
      // clear or pick another active
      if (players.length > 0) {
        this.setActiveId(players[0].id);
      } else {
        this.setActiveId(null);
      }
    }
  }

  getActiveId(): string | null {
    if (!isBrowser()) return null;
    const id = window.localStorage.getItem(ACTIVE_PLAYER_KEY);
    return id || null;
  }

  setActiveId(id: string | null) {
    if (!isBrowser()) return;
    if (id == null) {
      window.localStorage.removeItem(ACTIVE_PLAYER_KEY);
    } else {
      window.localStorage.setItem(ACTIVE_PLAYER_KEY, id);
    }
  }

  getActive(): Player | null {
    const id = this.getActiveId();
    if (!id) return null;
    return this.readAll().find((p) => p.id === id) ?? null;
  }
}
