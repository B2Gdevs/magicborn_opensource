// lib/swagger.ts
// OpenAPI/Swagger specification for Magicborn API

export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Magicborn Game Data API",
    version: "1.0.0",
    description: "API for accessing and managing game data (creatures, characters, environments, maps, regions, runes, effects). This API provides CRUD operations for all game entities in the Magicborn spell crafting game.",
  },
  servers: [
    {
      url: "http://localhost:4300",
      description: "Development server",
    },
  ],
  paths: {
    "/api/game-data/creatures": {
      get: {
        operationId: "listCreatures",
        summary: "List all creatures or get a specific creature by ID",
        description: "Retrieves all creatures from the database. If an 'id' query parameter is provided, returns only that specific creature. Creatures represent enemies and NPCs in the game with HP, mana, and elemental affinity stats.",
        tags: ["Creatures"],
        parameters: [
          {
            name: "id",
            in: "query",
            description: "Optional: Get a specific creature by its unique ID",
            required: false,
            schema: { type: "string" },
            example: "goblin_01",
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved creature(s)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    creatures: {
                      type: "array",
                      description: "Array of all creatures (returned when no id parameter)",
                      items: { $ref: "#/components/schemas/Creature" },
                    },
                    creature: {
                      description: "Single creature object (returned when id parameter is provided)",
                      $ref: "#/components/schemas/Creature",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Creature not found (when id parameter is provided)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        operationId: "createCreature",
        summary: "Create a new creature",
        description: "Creates a new creature in the database. Requires id and name fields. Returns 409 if a creature with the same ID already exists.",
        tags: ["Creatures"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Creature" },
            },
          },
        },
        responses: {
          "200": {
            description: "Creature created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    creature: { $ref: "#/components/schemas/Creature" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid creature data (missing required fields)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "409": {
            description: "Creature with this ID already exists",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                    existingId: { type: "string" },
                    existingName: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        operationId: "updateCreature",
        summary: "Update an existing creature",
        description: "Updates an existing creature in the database. The creature ID must exist. Only provided fields will be updated.",
        tags: ["Creatures"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Creature" },
            },
          },
        },
        responses: {
          "200": {
            description: "Creature updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    creature: { $ref: "#/components/schemas/Creature" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid creature data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Creature not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        operationId: "deleteCreature",
        summary: "Delete a creature by ID",
        description: "Permanently deletes a creature from the database. This action cannot be undone.",
        tags: ["Creatures"],
        parameters: [
          {
            name: "id",
            in: "query",
            description: "The unique ID of the creature to delete",
            required: true,
            schema: { type: "string" },
            example: "goblin_01",
          },
        ],
        responses: {
          "200": {
            description: "Creature deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Creature ID is required",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Creature not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/game-data/characters": {
      get: {
        operationId: "listCharacters",
        summary: "List all characters",
        description: "Retrieves all characters from the database. Characters represent playable or important NPCs in the game. Note: This endpoint does not support filtering by ID - you must fetch all characters and filter client-side.",
        tags: ["Characters"],
        responses: {
          "200": {
            description: "Successfully retrieved all characters",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    characters: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Character" },
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        operationId: "createCharacter",
        summary: "Create a new character",
        description: "Creates a new character in the database. The request body must wrap the character object in a 'character' property. Returns 409 if a character with the same ID already exists.",
        tags: ["Characters"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["character"],
                properties: {
                  character: { $ref: "#/components/schemas/Character" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Character created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    character: { $ref: "#/components/schemas/Character" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid character data (missing required fields)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "409": {
            description: "Character with this ID already exists",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        operationId: "updateCharacter",
        summary: "Update an existing character",
        description: "Updates an existing character in the database. The request body must wrap the character object in a 'character' property. Only provided fields will be updated.",
        tags: ["Characters"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["character"],
                properties: {
                  character: { $ref: "#/components/schemas/Character" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Character updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    character: { $ref: "#/components/schemas/Character" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid character data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Character not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        operationId: "deleteCharacter",
        summary: "Delete a character by ID",
        description: "Permanently deletes a character from the database. This action cannot be undone.",
        tags: ["Characters"],
        parameters: [
          {
            name: "id",
            in: "query",
            description: "The unique ID of the character to delete",
            required: true,
            schema: { type: "string" },
            example: "morgana_01",
          },
        ],
        responses: {
          "200": {
            description: "Character deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Character ID is required",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Character not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/game-data/environments": {
      get: {
        operationId: "listEnvironments",
        summary: "List all environments or get a specific environment by ID",
        description: "Retrieves all environments from the database. If an 'id' query parameter is provided, returns only that specific environment. Environments represent locations/biomes in the game world.",
        tags: ["Environments"],
        parameters: [
          {
            name: "id",
            in: "query",
            description: "Optional: Get a specific environment by its unique ID",
            required: false,
            schema: { type: "string" },
            example: "tarro",
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved environment(s)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    environments: {
                      type: "array",
                      description: "Array of all environments (returned when no id parameter)",
                      items: { $ref: "#/components/schemas/Environment" },
                    },
                    environment: {
                      description: "Single environment object (returned when id parameter is provided)",
                      $ref: "#/components/schemas/Environment",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Environment not found (when id parameter is provided)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        operationId: "createEnvironment",
        summary: "Create a new environment",
        description: "Creates a new environment in the database. Requires id, name, and description fields. Returns 409 if an environment with the same ID already exists.",
        tags: ["Environments"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Environment" },
            },
          },
        },
        responses: {
          "200": {
            description: "Environment created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    environment: { $ref: "#/components/schemas/Environment" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid environment data (missing required fields)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "409": {
            description: "Environment with this ID already exists",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                    existingId: { type: "string" },
                    existingName: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        operationId: "updateEnvironment",
        summary: "Update an existing environment",
        description: "Updates an existing environment in the database. The environment ID must exist. Only provided fields will be updated.",
        tags: ["Environments"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Environment" },
            },
          },
        },
        responses: {
          "200": {
            description: "Environment updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    environment: { $ref: "#/components/schemas/Environment" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid environment data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Environment not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        operationId: "deleteEnvironment",
        summary: "Delete an environment by ID",
        description: "Permanently deletes an environment from the database. This action cannot be undone.",
        tags: ["Environments"],
        parameters: [
          {
            name: "id",
            in: "query",
            description: "The unique ID of the environment to delete",
            required: true,
            schema: { type: "string" },
            example: "tarro",
          },
        ],
        responses: {
          "200": {
            description: "Environment deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Environment ID is required",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Environment not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/game-data/maps": {
      get: {
        operationId: "listMaps",
        summary: "List all maps or filter by various criteria",
        description: "Retrieves maps from the database. Can list all maps, get a specific map by ID, filter by environment ID, or filter by parent map ID (for nested maps). Maps represent playable areas within environments.",
        tags: ["Maps"],
        parameters: [
          {
            name: "id",
            in: "query",
            description: "Optional: Get a specific map by its unique ID",
            required: false,
            schema: { type: "string" },
            example: "world_map_01",
          },
          {
            name: "environmentId",
            in: "query",
            description: "Optional: Filter maps by environment ID",
            required: false,
            schema: { type: "string" },
            example: "tarro",
          },
          {
            name: "parentMapId",
            in: "query",
            description: "Optional: Filter maps by parent map ID (for nested maps)",
            required: false,
            schema: { type: "string" },
            example: "world_map_01",
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved map(s)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    maps: {
                      type: "array",
                      description: "Array of maps (returned when listing or filtering)",
                      items: { $ref: "#/components/schemas/Map" },
                    },
                    map: {
                      description: "Single map object (returned when id parameter is provided)",
                      $ref: "#/components/schemas/Map",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Map not found (when id parameter is provided)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        operationId: "createMap",
        summary: "Create a new map",
        description: "Creates a new map in the database. Requires id, name, and environmentId fields. Returns 409 if a map with the same ID already exists.",
        tags: ["Maps"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Map" },
            },
          },
        },
        responses: {
          "200": {
            description: "Map created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    map: { $ref: "#/components/schemas/Map" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid map data (missing required fields)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "409": {
            description: "Map with this ID already exists",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                    existingId: { type: "string" },
                    existingName: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        operationId: "updateMap",
        summary: "Update an existing map",
        description: "Updates an existing map in the database. The map ID must exist. Only provided fields will be updated.",
        tags: ["Maps"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Map" },
            },
          },
        },
        responses: {
          "200": {
            description: "Map updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    map: { $ref: "#/components/schemas/Map" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid map data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Map not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        operationId: "deleteMap",
        summary: "Delete a map by ID",
        description: "Permanently deletes a map from the database. This action cannot be undone.",
        tags: ["Maps"],
        parameters: [
          {
            name: "id",
            in: "query",
            description: "The unique ID of the map to delete",
            required: true,
            schema: { type: "string" },
            example: "world_map_01",
          },
        ],
        responses: {
          "200": {
            description: "Map deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Map ID is required",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Map not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/game-data/map-regions": {
      get: {
        operationId: "listMapRegions",
        summary: "List map regions or filter by various criteria",
        description: "Retrieves map regions from the database. Can list all regions, get a specific region by ID, filter by map ID, or filter by nested map ID. Regions represent selectable areas within maps that can link to nested maps.",
        tags: ["Map Regions"],
        parameters: [
          {
            name: "id",
            in: "query",
            description: "Optional: Get a specific region by its unique ID",
            required: false,
            schema: { type: "string" },
            example: "region_01",
          },
          {
            name: "mapId",
            in: "query",
            description: "Optional: Filter regions by map ID",
            required: false,
            schema: { type: "string" },
            example: "world_map_01",
          },
          {
            name: "nestedMapId",
            in: "query",
            description: "Optional: Filter regions by nested map ID (find regions that link to a specific nested map)",
            required: false,
            schema: { type: "string" },
            example: "region_map_01",
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved region(s)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    regions: {
                      type: "array",
                      description: "Array of regions (returned when listing or filtering)",
                      items: { $ref: "#/components/schemas/MapRegion" },
                    },
                    region: {
                      description: "Single region object (returned when id parameter is provided)",
                      $ref: "#/components/schemas/MapRegion",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Region not found (when id parameter is provided)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        operationId: "createMapRegion",
        summary: "Create a new map region",
        description: "Creates a new map region in the database. Requires id, mapId, and name fields. Returns 409 if a region with the same ID already exists.",
        tags: ["Map Regions"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MapRegion" },
            },
          },
        },
        responses: {
          "200": {
            description: "Region created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    region: { $ref: "#/components/schemas/MapRegion" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid region data (missing required fields)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "409": {
            description: "Region with this ID already exists",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                    existingId: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        operationId: "updateMapRegion",
        summary: "Update an existing map region",
        description: "Updates an existing map region in the database. The region ID must exist. Only provided fields will be updated.",
        tags: ["Map Regions"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MapRegion" },
            },
          },
        },
        responses: {
          "200": {
            description: "Region updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    region: { $ref: "#/components/schemas/MapRegion" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid region data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Region not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        operationId: "deleteMapRegion",
        summary: "Delete a map region by ID",
        description: "Permanently deletes a map region from the database. This action cannot be undone.",
        tags: ["Map Regions"],
        parameters: [
          {
            name: "id",
            in: "query",
            description: "The unique ID of the region to delete",
            required: true,
            schema: { type: "string" },
            example: "region_01",
          },
        ],
        responses: {
          "200": {
            description: "Region deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Region ID is required",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Region not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/game-data/runes": {
      get: {
        operationId: "listRunes",
        summary: "List all runes",
        description: "Retrieves all runes from the database. Runes are the fundamental building blocks of spells (A-Z). If the database is empty, it will automatically seed with hardcoded rune data. Note: This endpoint does not support filtering by code - you must fetch all runes and filter client-side.",
        tags: ["Runes"],
        responses: {
          "200": {
            description: "Successfully retrieved all runes",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    runes: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Rune" },
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        operationId: "createRune",
        summary: "Create a new rune",
        description: "Creates a new rune in the database. Requires code (A-Z) and concept fields. Returns 409 if a rune with the same code already exists.",
        tags: ["Runes"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Rune" },
            },
          },
        },
        responses: {
          "200": {
            description: "Rune created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    rune: { $ref: "#/components/schemas/Rune" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid rune data (code and concept are required)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "409": {
            description: "Rune with this code already exists",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        operationId: "updateRune",
        summary: "Update an existing rune",
        description: "Updates an existing rune in the database. The rune code must exist. Requires code and concept fields.",
        tags: ["Runes"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Rune" },
            },
          },
        },
        responses: {
          "200": {
            description: "Rune updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    rune: { $ref: "#/components/schemas/Rune" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid rune data (code and concept are required)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Rune not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        operationId: "deleteRune",
        summary: "Delete a rune by code",
        description: "Permanently deletes a rune from the database. This action cannot be undone.",
        tags: ["Runes"],
        parameters: [
          {
            name: "code",
            in: "query",
            description: "The rune code (A-Z) to delete",
            required: true,
            schema: { type: "string" },
            example: "A",
          },
        ],
        responses: {
          "200": {
            description: "Rune deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Code parameter is required",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Rune not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/game-data/effects": {
      get: {
        operationId: "listEffects",
        summary: "List all effects",
        description: "Retrieves all effects from the database. Effects represent spell effects like damage, healing, shields, etc. If the database is empty, it will automatically seed with hardcoded effect data. Note: This endpoint does not support filtering by ID - you must fetch all effects and filter client-side.",
        tags: ["Effects"],
        responses: {
          "200": {
            description: "Successfully retrieved all effects",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    effects: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Effect" },
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        operationId: "createEffect",
        summary: "Create a new effect",
        description: "Creates a new effect in the database. The request body must wrap the effect object in an 'effect' property. Requires id and name fields. Returns 409 if an effect with the same ID already exists.",
        tags: ["Effects"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["effect"],
                properties: {
                  effect: { $ref: "#/components/schemas/Effect" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Effect created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    effect: { $ref: "#/components/schemas/Effect" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid effect data (missing required fields)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "409": {
            description: "Effect with this ID already exists",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        operationId: "updateEffect",
        summary: "Update an existing effect",
        description: "Updates an existing effect in the database. The request body must wrap the effect object in an 'effect' property. The effect ID must exist. Only provided fields will be updated.",
        tags: ["Effects"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["effect"],
                properties: {
                  effect: { $ref: "#/components/schemas/Effect" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Effect updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    effect: { $ref: "#/components/schemas/Effect" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid effect data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Effect not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        operationId: "deleteEffect",
        summary: "Delete an effect by ID",
        description: "Permanently deletes an effect from the database. This action cannot be undone.",
        tags: ["Effects"],
        parameters: [
          {
            name: "id",
            in: "query",
            description: "The unique ID of the effect to delete",
            required: true,
            schema: { type: "string" },
            example: "damage",
          },
        ],
        responses: {
          "200": {
            description: "Effect deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Effect ID is required",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Effect not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Creature: {
        type: "object",
        required: ["id", "name", "description", "hp", "maxHp", "mana", "maxMana"],
        properties: {
          id: { 
            type: "string",
            description: "Unique identifier for the creature (e.g., 'goblin_01')",
            example: "goblin_01",
          },
          name: { 
            type: "string",
            description: "Display name of the creature",
            example: "Goblin",
          },
          description: { 
            type: "string",
            description: "Description of the creature",
            example: "A small, aggressive humanoid creature",
          },
          hp: { 
            type: "number",
            description: "Current hit points",
            example: 50,
          },
          maxHp: { 
            type: "number",
            description: "Maximum hit points",
            example: 50,
          },
          mana: { 
            type: "number",
            description: "Current mana points",
            example: 20,
          },
          maxMana: { 
            type: "number",
            description: "Maximum mana points",
            example: 20,
          },
          affinity: { 
            type: "string",
            description: "JSON string representing elemental affinity (AlphabetVector format)",
            example: '{"A": 0.1, "B": 0.2}',
          },
          imagePath: { 
            type: "string",
            description: "Path to the creature's image file",
            example: "/game-content/creatures/goblin.png",
          },
          storyIds: { 
            type: "string",
            description: "JSON array of story IDs associated with this creature",
            example: '["story_01", "story_02"]',
          },
        },
      },
      Character: {
        type: "object",
        required: ["id", "name", "description", "hp", "maxHp", "mana", "maxMana", "affinity"],
        properties: {
          id: { 
            type: "string",
            description: "Unique identifier for the character",
            example: "morgana_01",
          },
          name: { 
            type: "string",
            description: "Display name of the character",
            example: "Morgana",
          },
          description: { 
            type: "string",
            description: "Description of the character",
            example: "A powerful sorceress",
          },
          hp: { 
            type: "number",
            description: "Current hit points",
            example: 100,
          },
          maxHp: { 
            type: "number",
            description: "Maximum hit points",
            example: 100,
          },
          mana: { 
            type: "number",
            description: "Current mana points",
            example: 150,
          },
          maxMana: { 
            type: "number",
            description: "Maximum mana points",
            example: 150,
          },
          affinity: { 
            type: "string",
            description: "JSON string representing elemental affinity (AlphabetVector format)",
            example: '{"A": 0.5, "B": 0.3}',
          },
          imagePath: { 
            type: "string",
            description: "Path to the character's image file",
            example: "/game-content/characters/morgana.png",
          },
          storyIds: { 
            type: "string",
            description: "JSON array of story IDs associated with this character",
            example: '["story_01"]',
          },
        },
      },
      Environment: {
        type: "object",
        required: ["id", "name", "description"],
        properties: {
          id: { 
            type: "string",
            description: "Unique identifier for the environment",
            example: "tarro",
          },
          name: { 
            type: "string",
            description: "Display name of the environment",
            example: "Tarro",
          },
          description: { 
            type: "string",
            description: "Description of the environment/biome",
            example: "A shadowy realm of dark magic",
          },
          imagePath: { 
            type: "string",
            description: "Path to the environment's image file",
            example: "/game-content/environments/tarro.png",
          },
          storyIds: { 
            type: "string",
            description: "JSON array of story IDs associated with this environment",
            example: '["story_01"]',
          },
          metadata: { 
            type: "string",
            description: "JSON object containing biome, climate, dangerLevel, and other metadata",
            example: '{"biome": "dark_forest", "climate": "cold", "dangerLevel": 5}',
          },
        },
      },
      Map: {
        type: "object",
        required: ["id", "name", "environmentId"],
        properties: {
          id: { 
            type: "string",
            description: "Unique identifier for the map",
            example: "world_map_01",
          },
          name: { 
            type: "string",
            description: "Display name of the map",
            example: "World Map",
          },
          environmentId: { 
            type: "string",
            description: "ID of the environment this map belongs to",
            example: "tarro",
          },
          parentMapId: { 
            type: "string",
            description: "Optional: ID of the parent map (for nested maps)",
            example: "world_map_01",
          },
          imagePath: { 
            type: "string",
            description: "Path to the map's image file",
            example: "/game-content/maps/world.png",
          },
        },
      },
      MapRegion: {
        type: "object",
        required: ["id", "mapId", "name"],
        properties: {
          id: { 
            type: "string",
            description: "Unique identifier for the region",
            example: "region_01",
          },
          name: { 
            type: "string",
            description: "Display name of the region",
            example: "Northern Forest",
          },
          mapId: { 
            type: "string",
            description: "ID of the map this region belongs to",
            example: "world_map_01",
          },
          description: { 
            type: "string",
            description: "Description of the region",
            example: "A dense forest in the northern part of the map",
          },
          nestedMapId: { 
            type: "string",
            description: "Optional: ID of a nested map that this region links to",
            example: "forest_map_01",
          },
          coordinates: { 
            type: "string",
            description: "JSON object or string representing region coordinates/bounds",
            example: '{"x": 100, "y": 200, "width": 50, "height": 50}',
          },
        },
      },
      Rune: {
        type: "object",
        required: ["code", "concept"],
        properties: {
          code: { 
            type: "string",
            description: "Single letter code (A-Z) representing the rune",
            example: "A",
            pattern: "^[A-Z]$",
          },
          concept: { 
            type: "string",
            description: "The conceptual meaning of the rune",
            example: "Fire",
          },
          powerFactor: { 
            type: "number",
            description: "Power multiplier for spells using this rune",
            example: 1.2,
          },
          controlFactor: { 
            type: "number",
            description: "Control multiplier for spells using this rune",
            example: 0.8,
          },
        },
      },
      Effect: {
        type: "object",
        required: ["id", "name"],
        properties: {
          id: { 
            type: "string",
            description: "Unique identifier for the effect",
            example: "damage",
          },
          name: { 
            type: "string",
            description: "Display name of the effect",
            example: "Damage",
          },
          description: { 
            type: "string",
            description: "Description of what the effect does",
            example: "Deals damage to the target",
          },
          category: { 
            type: "string",
            description: "Category of the effect (e.g., 'damage', 'healing', 'buff', 'debuff')",
            example: "damage",
          },
        },
      },
    },
  },
};




