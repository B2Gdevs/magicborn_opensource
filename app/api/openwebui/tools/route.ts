// app/api/openwebui/tools/route.ts
// OpenWebUI tools API - provides function calling interface for game data

import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders } from "@/lib/utils/cors";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = getCorsHeaders(origin);
  return new NextResponse(null, { status: 204, headers });
}

// Tool definitions for OpenWebUI
export async function GET(request: NextRequest) {
  const tools = [
    // Query tools
    {
      type: "function",
      function: {
        name: "list_creatures",
        description: "List all creatures in the game database. Use this to browse available creatures.",
        parameters: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Maximum number of creatures to return (default: 100)",
            },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_creature",
        description: "Get detailed information about a specific creature by ID.",
        parameters: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The creature ID",
            },
          },
          required: ["id"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "list_characters",
        description: "List all characters in the game database.",
        parameters: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Maximum number of characters to return (default: 100)",
            },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_character",
        description: "Get detailed information about a specific character by ID.",
        parameters: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The character ID",
            },
          },
          required: ["id"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "list_environments",
        description: "List all environments in the game database.",
        parameters: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Maximum number of environments to return (default: 100)",
            },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_environment",
        description: "Get detailed information about a specific environment by ID.",
        parameters: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The environment ID",
            },
          },
          required: ["id"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "list_maps",
        description: "List all maps in the game database.",
        parameters: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Maximum number of maps to return (default: 100)",
            },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_map",
        description: "Get detailed information about a specific map by ID.",
        parameters: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The map ID",
            },
          },
          required: ["id"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "list_map_regions",
        description: "List all map regions. Optionally filter by map ID.",
        parameters: {
          type: "object",
          properties: {
            mapId: {
              type: "string",
              description: "Optional: Filter regions by map ID",
            },
            limit: {
              type: "number",
              description: "Maximum number of regions to return (default: 100)",
            },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_map_region",
        description: "Get detailed information about a specific map region by ID.",
        parameters: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The map region ID",
            },
          },
          required: ["id"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "list_runes",
        description: "List all runes in the game database.",
        parameters: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Maximum number of runes to return (default: 100)",
            },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_rune",
        description: "Get detailed information about a specific rune by code (A-Z).",
        parameters: {
          type: "object",
          properties: {
            code: {
              type: "string",
              description: "The rune code (single letter A-Z)",
            },
          },
          required: ["code"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "list_effects",
        description: "List all effect definitions in the game database.",
        parameters: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Maximum number of effects to return (default: 100)",
            },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_effect",
        description: "Get detailed information about a specific effect by ID.",
        parameters: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The effect ID",
            },
          },
          required: ["id"],
        },
      },
    },
    // Create tools (sparingly)
    {
      type: "function",
      function: {
        name: "create_creature",
        description: "Create a new creature. Use sparingly and only when explicitly requested by the user.",
        parameters: {
          type: "object",
          properties: {
            id: { type: "string", description: "Unique creature ID" },
            name: { type: "string", description: "Creature name" },
            description: { type: "string", description: "Creature description" },
            hp: { type: "number", description: "Current HP" },
            maxHp: { type: "number", description: "Maximum HP" },
            mana: { type: "number", description: "Current mana" },
            maxMana: { type: "number", description: "Maximum mana" },
            affinity: { type: "string", description: "JSON string of AlphabetVector" },
            imagePath: { type: "string", description: "Optional image path" },
            storyIds: { type: "string", description: "JSON array of story IDs" },
          },
          required: ["id", "name", "description", "hp", "maxHp", "mana", "maxMana"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "create_character",
        description: "Create a new character. Use sparingly and only when explicitly requested by the user.",
        parameters: {
          type: "object",
          properties: {
            id: { type: "string", description: "Unique character ID" },
            name: { type: "string", description: "Character name" },
            description: { type: "string", description: "Character description" },
            hp: { type: "number", description: "Current HP" },
            maxHp: { type: "number", description: "Maximum HP" },
            mana: { type: "number", description: "Current mana" },
            maxMana: { type: "number", description: "Maximum mana" },
            affinity: { type: "string", description: "JSON string of AlphabetVector" },
            imagePath: { type: "string", description: "Optional image path" },
            storyIds: { type: "string", description: "JSON array of story IDs" },
          },
          required: ["id", "name", "description", "hp", "maxHp", "mana", "maxMana", "affinity"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "create_environment",
        description: "Create a new environment. Use sparingly and only when explicitly requested by the user.",
        parameters: {
          type: "object",
          properties: {
            id: { type: "string", description: "Unique environment ID" },
            name: { type: "string", description: "Environment name" },
            description: { type: "string", description: "Environment description" },
            imagePath: { type: "string", description: "Optional image path" },
            storyIds: { type: "string", description: "JSON array of story IDs" },
            metadata: { type: "string", description: "JSON object with biome, climate, dangerLevel" },
          },
          required: ["id", "name", "description"],
        },
      },
    },
    // Edit tools (sparingly)
    {
      type: "function",
      function: {
        name: "update_creature",
        description: "Update an existing creature. Use sparingly and only when explicitly requested. Only update the fields provided.",
        parameters: {
          type: "object",
          properties: {
            id: { type: "string", description: "Creature ID (required)" },
            name: { type: "string", description: "Updated name" },
            description: { type: "string", description: "Updated description" },
            hp: { type: "number", description: "Updated HP" },
            maxHp: { type: "number", description: "Updated max HP" },
            mana: { type: "number", description: "Updated mana" },
            maxMana: { type: "number", description: "Updated max mana" },
            affinity: { type: "string", description: "Updated affinity JSON" },
            imagePath: { type: "string", description: "Updated image path" },
            storyIds: { type: "string", description: "Updated story IDs JSON array" },
          },
          required: ["id"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "update_character",
        description: "Update an existing character. Use sparingly and only when explicitly requested. Only update the fields provided.",
        parameters: {
          type: "object",
          properties: {
            id: { type: "string", description: "Character ID (required)" },
            name: { type: "string", description: "Updated name" },
            description: { type: "string", description: "Updated description" },
            hp: { type: "number", description: "Updated HP" },
            maxHp: { type: "number", description: "Updated max HP" },
            mana: { type: "number", description: "Updated mana" },
            maxMana: { type: "number", description: "Updated max mana" },
            affinity: { type: "string", description: "Updated affinity JSON" },
            imagePath: { type: "string", description: "Updated image path" },
            storyIds: { type: "string", description: "Updated story IDs JSON array" },
          },
          required: ["id"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "update_environment",
        description: "Update an existing environment. Use sparingly and only when explicitly requested. Only update the fields provided.",
        parameters: {
          type: "object",
          properties: {
            id: { type: "string", description: "Environment ID (required)" },
            name: { type: "string", description: "Updated name" },
            description: { type: "string", description: "Updated description" },
            imagePath: { type: "string", description: "Updated image path" },
            storyIds: { type: "string", description: "Updated story IDs JSON array" },
            metadata: { type: "string", description: "Updated metadata JSON" },
          },
          required: ["id"],
        },
      },
    },
    // Delete tools (use with caution)
    {
      type: "function",
      function: {
        name: "delete_creature",
        description: "Delete a creature from the database. Use with extreme caution and only when explicitly requested by the user.",
        parameters: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The creature ID to delete",
            },
          },
          required: ["id"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "delete_character",
        description: "Delete a character from the database. Use with extreme caution and only when explicitly requested by the user.",
        parameters: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The character ID to delete",
            },
          },
          required: ["id"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "delete_environment",
        description: "Delete an environment from the database. Use with extreme caution and only when explicitly requested by the user.",
        parameters: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The environment ID to delete",
            },
          },
          required: ["id"],
        },
      },
    },
  ];

  const origin = request.headers.get("origin");
  const headers = getCorsHeaders(origin);
  return NextResponse.json({ tools }, { headers });
}


