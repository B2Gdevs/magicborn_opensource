// lib/api/clients.ts
// API client utilities for database content

import type { NamedSpellBlueprint } from "@/lib/data/namedSpells";
import type { EffectDefinition } from "@/lib/data/effects";

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
    };
    idMap: Record<string, string[]>; // ID -> content types that use it
  }> {
    return apiRequest<{
      allIds: {
        spells: string[];
        effects: string[];
      };
      idMap: Record<string, string[]>;
    }>("/api/game-data/ids");
  },

  async checkIdUniqueness(
    id: string,
    currentContentType: "spells" | "effects",
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

