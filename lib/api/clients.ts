// lib/api/clients.ts
// API client utilities for database content

import type { NamedSpellBlueprint } from "@/lib/data/namedSpells";
import type { EffectDefinition } from "@/lib/data/effects";
import type { RuneDef } from "@/lib/packages/runes";
import type { RuneCode } from "@core/types";
import type { CharacterDefinition } from "@/lib/data/characters";

// Base API client with error handling
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `Failed to ${options?.method || "GET"} ${endpoint}`);
  }

  return response.json();
}

// ID validation client
export const idClient = {
  async getAllIds(): Promise<{
    allIds: {
      spells: string[];
      effects: string[];
      characters: string[];
    };
    idMap: Record<string, string[]>; // ID -> content types that use it
  }> {
    return apiRequest<{
      allIds: {
        spells: string[];
        effects: string[];
        characters: string[];
      };
      idMap: Record<string, string[]>;
    }>("/api/game-data/ids");
  },

  async checkIdUniqueness(
    id: string,
    currentContentType: "spells" | "effects" | "characters",
    currentId?: string // For edit mode - exclude current item's ID
  ): Promise<{
    isUnique: boolean;
    conflictingTypes: string[];
  }> {
    const { idMap } = await this.getAllIds();
    
    // If editing, remove current item from conflict check
    const conflicts = idMap[id] || [];
    const filteredConflicts = currentId === id
      ? conflicts.filter(type => type !== currentContentType)
      : conflicts;
    
    return {
      isUnique: filteredConflicts.length === 0,
      conflictingTypes: filteredConflicts,
    };
  },
};

// Spell API Client
export const spellClient = {
  async list(): Promise<NamedSpellBlueprint[]> {
    const result = await apiRequest<{ spells: NamedSpellBlueprint[] }>("/api/game-data/spells");
    return result.spells;
  },

  async get(id: string): Promise<NamedSpellBlueprint> {
    const result = await apiRequest<{ spell: NamedSpellBlueprint }>(`/api/game-data/spells?id=${encodeURIComponent(id)}`);
    return result.spell;
  },

  async create(spell: NamedSpellBlueprint): Promise<NamedSpellBlueprint> {
    const result = await apiRequest<{ spell: NamedSpellBlueprint }>("/api/game-data/spells", {
      method: "POST",
      body: JSON.stringify({ spell }),
    });
    return result.spell;
  },

  async update(spell: NamedSpellBlueprint): Promise<NamedSpellBlueprint> {
    const result = await apiRequest<{ spell: NamedSpellBlueprint }>("/api/game-data/spells", {
      method: "PUT",
      body: JSON.stringify({ spell }),
    });
    return result.spell;
  },

  async delete(id: string): Promise<void> {
    await apiRequest<void>(`/api/game-data/spells?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};

// Effect API Client
export const effectClient = {
  async list(): Promise<EffectDefinition[]> {
    const result = await apiRequest<{ effects: EffectDefinition[] }>("/api/game-data/effects");
    return result.effects;
  },

  async get(id: string): Promise<EffectDefinition> {
    const result = await apiRequest<{ effect: EffectDefinition }>(`/api/game-data/effects?id=${encodeURIComponent(id)}`);
    return result.effect;
  },

  async create(effect: EffectDefinition): Promise<EffectDefinition> {
    const result = await apiRequest<{ effect: EffectDefinition }>("/api/game-data/effects", {
      method: "POST",
      body: JSON.stringify({ effect }),
    });
    return result.effect;
  },

  async update(effect: EffectDefinition): Promise<EffectDefinition> {
    const result = await apiRequest<{ effect: EffectDefinition }>("/api/game-data/effects", {
      method: "PUT",
      body: JSON.stringify({ effect }),
    });
    return result.effect;
  },

  async delete(id: string): Promise<void> {
    await apiRequest<void>(`/api/game-data/effects?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};

// Rune API Client
export const runeClient = {
  async list(): Promise<RuneDef[]> {
    const result = await apiRequest<{ runes: RuneDef[] }>("/api/game-data/runes");
    return result.runes;
  },

  async get(code: RuneCode): Promise<RuneDef> {
    const result = await apiRequest<{ rune: RuneDef }>(`/api/game-data/runes?code=${encodeURIComponent(code)}`);
    return result.rune;
  },

  async create(rune: RuneDef): Promise<RuneDef> {
    const result = await apiRequest<{ rune: RuneDef }>("/api/game-data/runes", {
      method: "POST",
      body: JSON.stringify(rune),
    });
    return result.rune;
  },

  async update(rune: RuneDef): Promise<RuneDef> {
    const result = await apiRequest<{ rune: RuneDef }>("/api/game-data/runes", {
      method: "PUT",
      body: JSON.stringify(rune),
    });
    return result.rune;
  },

  async delete(code: RuneCode): Promise<void> {
    await apiRequest<void>(`/api/game-data/runes?code=${encodeURIComponent(code)}`, {
      method: "DELETE",
    });
  },
};

// Character API Client
export const characterClient = {
  async list(): Promise<CharacterDefinition[]> {
    const result = await apiRequest<{ characters: CharacterDefinition[] }>("/api/game-data/characters");
    return result.characters;
  },

  async get(id: string): Promise<CharacterDefinition> {
    const result = await apiRequest<{ character: CharacterDefinition }>(`/api/game-data/characters?id=${encodeURIComponent(id)}`);
    return result.character;
  },

  async create(character: CharacterDefinition): Promise<CharacterDefinition> {
    const result = await apiRequest<{ character: CharacterDefinition }>("/api/game-data/characters", {
      method: "POST",
      body: JSON.stringify({ character }),
    });
    return result.character;
  },

  async update(character: CharacterDefinition): Promise<CharacterDefinition> {
    const result = await apiRequest<{ character: CharacterDefinition }>("/api/game-data/characters", {
      method: "PUT",
      body: JSON.stringify({ character }),
    });
    return result.character;
  },

  async delete(id: string): Promise<void> {
    await apiRequest<void>(`/api/game-data/characters?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};

// Stories API Client
export const storiesClient = {
  async list(): Promise<string[]> {
    const result = await apiRequest<{ stories: string[] }>("/api/game-data/stories/list");
    return result.stories;
  },
};

