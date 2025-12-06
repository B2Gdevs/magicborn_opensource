// lib/api/clients.ts
// API client utilities for database content

import type { NamedSpellBlueprint } from "@/lib/data/namedSpells";
import type { EffectDefinition } from "@/lib/data/effects";
import type { RuneDef } from "@/lib/packages/runes";
import type { RuneCode } from "@core/types";
import type { CharacterDefinition } from "@/lib/data/characters";
import type { CreatureDefinition } from "@/lib/data/creatures";
import type { EnvironmentDefinition } from "@/lib/data/environments";
import type { MapDefinition } from "@/lib/data/maps";
import type { MapPlacement } from "@/lib/data/mapPlacements";

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
      creatures: string[];
      runes: string[];
      environments: string[];
      maps: string[];
    };
    idMap: Record<string, string[]>; // ID -> content types that use it
  }> {
    return apiRequest<{
      allIds: {
        spells: string[];
        effects: string[];
        characters: string[];
        creatures: string[];
        runes: string[];
        environments: string[];
        maps: string[];
      };
      idMap: Record<string, string[]>;
    }>("/api/game-data/ids");
  },

  async checkIdUniqueness(
    id: string,
    currentContentType: "spells" | "effects" | "characters" | "creatures" | "runes" | "environments" | "maps",
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

// Creature API Client
export const creatureClient = {
  async list(): Promise<CreatureDefinition[]> {
    const result = await apiRequest<{ creatures: CreatureDefinition[] }>("/api/game-data/creatures");
    return result.creatures;
  },

  async get(id: string): Promise<CreatureDefinition> {
    const result = await apiRequest<{ creature: CreatureDefinition }>(`/api/game-data/creatures?id=${encodeURIComponent(id)}`);
    return result.creature;
  },

  async create(creature: CreatureDefinition): Promise<CreatureDefinition> {
    const result = await apiRequest<{ creature: CreatureDefinition }>("/api/game-data/creatures", {
      method: "POST",
      body: JSON.stringify(creature),
    });
    return result.creature;
  },

  async update(creature: CreatureDefinition): Promise<CreatureDefinition> {
    const result = await apiRequest<{ creature: CreatureDefinition }>("/api/game-data/creatures", {
      method: "PUT",
      body: JSON.stringify(creature),
    });
    return result.creature;
  },

  async delete(id: string): Promise<void> {
    await apiRequest<void>(`/api/game-data/creatures?id=${encodeURIComponent(id)}`, {
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

// Environment API Client
export const environmentClient = {
  async list(): Promise<EnvironmentDefinition[]> {
    const result = await apiRequest<{ environments: EnvironmentDefinition[] }>("/api/game-data/environments");
    return result.environments;
  },

  async get(id: string): Promise<EnvironmentDefinition> {
    const result = await apiRequest<{ environment: EnvironmentDefinition }>(`/api/game-data/environments?id=${encodeURIComponent(id)}`);
    return result.environment;
  },

  async create(environment: EnvironmentDefinition): Promise<EnvironmentDefinition> {
    const result = await apiRequest<{ environment: EnvironmentDefinition }>("/api/game-data/environments", {
      method: "POST",
      body: JSON.stringify(environment),
    });
    return result.environment;
  },

  async update(environment: EnvironmentDefinition): Promise<EnvironmentDefinition> {
    const result = await apiRequest<{ environment: EnvironmentDefinition }>("/api/game-data/environments", {
      method: "PUT",
      body: JSON.stringify(environment),
    });
    return result.environment;
  },

  async delete(id: string): Promise<void> {
    await apiRequest<void>(`/api/game-data/environments?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};

// Map API Client
export const mapClient = {
  async list(environmentId?: string): Promise<MapDefinition[]> {
    if (environmentId) {
      const result = await apiRequest<{ maps: MapDefinition[] }>(`/api/game-data/maps?environmentId=${encodeURIComponent(environmentId)}`);
      return result.maps;
    }
    const result = await apiRequest<{ maps: MapDefinition[] }>("/api/game-data/maps");
    return result.maps;
  },

  async listByParentMapId(parentMapId: string): Promise<MapDefinition[]> {
    const result = await apiRequest<{ maps: MapDefinition[] }>(`/api/game-data/maps?parentMapId=${encodeURIComponent(parentMapId)}`);
    return result.maps;
  },

  async get(id: string): Promise<MapDefinition> {
    const result = await apiRequest<{ map: MapDefinition }>(`/api/game-data/maps?id=${encodeURIComponent(id)}`);
    return result.map;
  },

  async create(map: MapDefinition): Promise<MapDefinition> {
    const result = await apiRequest<{ map: MapDefinition }>("/api/game-data/maps", {
      method: "POST",
      body: JSON.stringify(map),
    });
    return result.map;
  },

  async update(map: MapDefinition): Promise<MapDefinition> {
    const result = await apiRequest<{ map: MapDefinition }>("/api/game-data/maps", {
      method: "PUT",
      body: JSON.stringify(map),
    });
    return result.map;
  },

  async delete(id: string): Promise<void> {
    await apiRequest<void>(`/api/game-data/maps?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};

// Map Placement API Client
export const mapPlacementClient = {
  async list(mapId?: string): Promise<MapPlacement[]> {
    if (mapId) {
      const result = await apiRequest<{ placements: MapPlacement[] }>(`/api/game-data/map-placements?mapId=${encodeURIComponent(mapId)}`);
      return result.placements;
    }
    const result = await apiRequest<{ placements: MapPlacement[] }>("/api/game-data/map-placements");
    return result.placements;
  },

  async get(id: string): Promise<MapPlacement> {
    const result = await apiRequest<{ placement: MapPlacement }>(`/api/game-data/map-placements?id=${encodeURIComponent(id)}`);
    return result.placement;
  },

  async getByNestedMapId(nestedMapId: string): Promise<MapPlacement> {
    const result = await apiRequest<{ placement: MapPlacement }>(`/api/game-data/map-placements?nestedMapId=${encodeURIComponent(nestedMapId)}`);
    return result.placement;
  },

  async create(placement: MapPlacement): Promise<MapPlacement> {
    const result = await apiRequest<{ placement: MapPlacement }>("/api/game-data/map-placements", {
      method: "POST",
      body: JSON.stringify(placement),
    });
    return result.placement;
  },

  async update(placement: MapPlacement): Promise<MapPlacement> {
    const result = await apiRequest<{ placement: MapPlacement }>("/api/game-data/map-placements", {
      method: "PUT",
      body: JSON.stringify(placement),
    });
    return result.placement;
  },

  async delete(id: string): Promise<void> {
    await apiRequest<void>(`/api/game-data/map-placements?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  async deleteByMapId(mapId: string): Promise<void> {
    await apiRequest<void>(`/api/game-data/map-placements?mapId=${encodeURIComponent(mapId)}`, {
      method: "DELETE",
    });
  },
};

