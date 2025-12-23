// lib/ai/tools/game-data-tools.ts
// Game data API tools for the AI system

import { ToolExecutor } from "../types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:4300";

/**
 * Helper to call game data API
 */
async function callGameDataAPI(
  endpoint: string,
  method: string = "GET",
  body?: any
): Promise<any> {
  const url = `${API_BASE_URL}/api/game-data${endpoint}`;
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    throw new Error(
      `API error: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Get all game data tools
 */
export function getGameDataTools(): ToolExecutor[] {
  return [
    // Creatures
    {
      name: "list_creatures",
      description: "List all creatures in the game database. Use this to browse available creatures.",
      schema: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Maximum number of creatures to return (default: 100)",
          },
        },
      },
      execute: async (args) => {
        try {
          const result = await callGameDataAPI("/creatures", "GET");
          return {
            success: true,
            result: result.creatures || [],
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },
    {
      name: "get_creature",
      description: "Get detailed information about a specific creature by ID.",
      schema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The creature ID",
          },
        },
        required: ["id"],
      },
      execute: async (args) => {
        try {
          const result = await callGameDataAPI(`/creatures?id=${args.id}`, "GET");
          return {
            success: true,
            result: result.creature,
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },
    // Characters
    {
      name: "list_characters",
      description: "List all characters in the game database.",
      schema: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Maximum number of characters to return (default: 100)",
          },
        },
      },
      execute: async (args) => {
        try {
          const result = await callGameDataAPI("/characters", "GET");
          return {
            success: true,
            result: result.characters || [],
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },
    {
      name: "get_character",
      description: "Get detailed information about a specific character by ID.",
      schema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The character ID",
          },
        },
        required: ["id"],
      },
      execute: async (args) => {
        try {
          const result = await callGameDataAPI("/characters", "GET");
          const character = result.characters?.find(
            (c: any) => c.id === args.id
          );
          if (!character) {
            return {
              success: false,
              error: "Character not found",
            };
          }
          return {
            success: true,
            result: character,
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },
    // Environments
    {
      name: "list_environments",
      description: "List all environments in the game database.",
      schema: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Maximum number of environments to return (default: 100)",
          },
        },
      },
      execute: async (args) => {
        try {
          const result = await callGameDataAPI("/environments", "GET");
          return {
            success: true,
            result: result.environments || [],
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },
    {
      name: "get_environment",
      description: "Get detailed information about a specific environment by ID.",
      schema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The environment ID",
          },
        },
        required: ["id"],
      },
      execute: async (args) => {
        try {
          const result = await callGameDataAPI(
            `/environments?id=${args.id}`,
            "GET"
          );
          return {
            success: true,
            result: result.environment,
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },
    // Maps
    {
      name: "list_maps",
      description: "List all maps in the game database.",
      schema: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Maximum number of maps to return (default: 100)",
          },
        },
      },
      execute: async (args) => {
        try {
          const result = await callGameDataAPI("/maps", "GET");
          return {
            success: true,
            result: result.maps || [],
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },
    {
      name: "get_map",
      description: "Get detailed information about a specific map by ID.",
      schema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The map ID",
          },
        },
        required: ["id"],
      },
      execute: async (args) => {
        try {
          const result = await callGameDataAPI(`/maps?id=${args.id}`, "GET");
          return {
            success: true,
            result: result.map,
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },
    // Runes
    {
      name: "list_runes",
      description: "List all runes in the game database.",
      schema: {
        type: "object",
        properties: {},
      },
      execute: async (args) => {
        try {
          const result = await callGameDataAPI("/runes", "GET");
          return {
            success: true,
            result: result.runes || [],
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },
    {
      name: "get_rune",
      description: "Get detailed information about a specific rune by code (A-Z).",
      schema: {
        type: "object",
        properties: {
          code: {
            type: "string",
            description: "The rune code (single letter A-Z)",
          },
        },
        required: ["code"],
      },
      execute: async (args) => {
        try {
          const result = await callGameDataAPI(
            `/runes?code=${args.code}`,
            "GET"
          );
          return {
            success: true,
            result: result.rune,
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },
    // Effects
    {
      name: "list_effects",
      description: "List all effects in the game database.",
      schema: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Maximum number of effects to return (default: 100)",
          },
        },
      },
      execute: async (args) => {
        try {
          const result = await callGameDataAPI("/effects", "GET");
          return {
            success: true,
            result: result.effects || [],
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },
    {
      name: "get_effect",
      description: "Get detailed information about a specific effect by ID.",
      schema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The effect ID",
          },
        },
        required: ["id"],
      },
      execute: async (args) => {
        try {
          const result = await callGameDataAPI(`/effects?id=${args.id}`, "GET");
          return {
            success: true,
            result: result.effect,
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },
  ];
}


