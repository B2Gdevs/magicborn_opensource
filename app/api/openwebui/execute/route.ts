// app/api/openwebui/execute/route.ts
// Execute OpenWebUI tool function calls

import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders } from "@/lib/utils/cors";

export const dynamic = "force-dynamic";

const API_BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:4300";

async function callGameDataAPI(endpoint: string, method: string, body?: any) {
  const url = `${API_BASE}/api/game-data${endpoint}`;
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `API call failed: ${response.statusText}`);
  }
  
  return data;
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = getCorsHeaders(origin);
  return new NextResponse(null, { status: 204, headers });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  
  // Helper to add CORS headers to responses
  const jsonResponse = (data: any, options?: { status?: number }) => {
    return NextResponse.json(data, { ...options, headers: corsHeaders });
  };
  
  try {
    const body = await request.json();
    const { name, arguments: args } = body;

    if (!name || !args) {
      return jsonResponse(
        { error: "Function name and arguments are required" },
        { status: 400 }
      );
    }

    let result: any;

    // Query functions
    switch (name) {
      case "list_creatures":
        result = await callGameDataAPI("/creatures", "GET");
        return jsonResponse({ result: result.creatures || [] });

      case "get_creature":
        result = await callGameDataAPI(`/creatures?id=${args.id}`, "GET");
        return jsonResponse({ result: result.creature });

      case "list_characters":
        result = await callGameDataAPI("/characters", "GET");
        return jsonResponse({ result: result.characters || [] });

      case "get_character":
        // Characters API doesn't support ?id=, need to fetch all and filter
        const allChars = await callGameDataAPI("/characters", "GET");
        const char = allChars.characters?.find((c: any) => c.id === args.id);
        if (!char) {
          return jsonResponse({ error: "Character not found" }, { status: 404 });
        }
        return jsonResponse({ result: char });

      case "list_environments":
        result = await callGameDataAPI("/environments", "GET");
        return jsonResponse({ result: result.environments || [] });

      case "get_environment":
        result = await callGameDataAPI(`/environments?id=${args.id}`, "GET");
        return jsonResponse({ result: result.environment });

      case "list_maps":
        result = await callGameDataAPI("/maps", "GET");
        return jsonResponse({ result: result.maps || [] });

      case "get_map":
        result = await callGameDataAPI(`/maps?id=${args.id}`, "GET");
        return jsonResponse({ result: result.map });

      case "list_map_regions":
        const regionEndpoint = args.mapId 
          ? `/map-regions?mapId=${args.mapId}`
          : "/map-regions";
        result = await callGameDataAPI(regionEndpoint, "GET");
        return jsonResponse({ result: result.regions || [] });

      case "get_map_region":
        result = await callGameDataAPI(`/map-regions?id=${args.id}`, "GET");
        return jsonResponse({ result: result.region });

      case "list_runes":
        result = await callGameDataAPI("/runes", "GET");
        return jsonResponse({ result: result.runes || [] });

      case "get_rune":
        result = await callGameDataAPI(`/runes?code=${args.code}`, "GET");
        return jsonResponse({ result: result.rune });

      case "list_effects":
        result = await callGameDataAPI("/effects", "GET");
        return jsonResponse({ result: result.effects || [] });

      case "get_effect":
        result = await callGameDataAPI(`/effects?id=${args.id}`, "GET");
        return jsonResponse({ result: result.effect });

      // Create functions
      case "create_creature":
        const creatureData = {
          id: args.id,
          name: args.name,
          description: args.description,
          hp: args.hp,
          maxHp: args.maxHp,
          mana: args.mana,
          maxMana: args.maxMana,
          affinity: args.affinity || "{}",
          imagePath: args.imagePath,
          storyIds: args.storyIds || "[]",
        };
        result = await callGameDataAPI("/creatures", "POST", creatureData);
        return jsonResponse({ result: result.creature, message: "Creature created successfully" });

      case "create_character":
        const characterData = {
          character: {
            id: args.id,
            name: args.name,
            description: args.description,
            hp: args.hp,
            maxHp: args.maxHp,
            mana: args.mana,
            maxMana: args.maxMana,
            affinity: args.affinity,
            imagePath: args.imagePath,
            storyIds: args.storyIds || "[]",
          },
        };
        result = await callGameDataAPI("/characters", "POST", characterData);
        return jsonResponse({ result: result.character, message: "Character created successfully" });

      case "create_environment":
        const envData = {
          id: args.id,
          name: args.name,
          description: args.description,
          imagePath: args.imagePath,
          storyIds: args.storyIds || "[]",
          metadata: args.metadata || "{}",
        };
        result = await callGameDataAPI("/environments", "POST", envData);
        return jsonResponse({ result: result.environment, message: "Environment created successfully" });

      // Update functions
      case "update_creature":
        const updateCreatureData: any = { id: args.id };
        if (args.name !== undefined) updateCreatureData.name = args.name;
        if (args.description !== undefined) updateCreatureData.description = args.description;
        if (args.hp !== undefined) updateCreatureData.hp = args.hp;
        if (args.maxHp !== undefined) updateCreatureData.maxHp = args.maxHp;
        if (args.mana !== undefined) updateCreatureData.mana = args.mana;
        if (args.maxMana !== undefined) updateCreatureData.maxMana = args.maxMana;
        if (args.affinity !== undefined) updateCreatureData.affinity = args.affinity;
        if (args.imagePath !== undefined) updateCreatureData.imagePath = args.imagePath;
        if (args.storyIds !== undefined) updateCreatureData.storyIds = args.storyIds;
        
        result = await callGameDataAPI("/creatures", "PUT", updateCreatureData);
        return jsonResponse({ result: result.creature, message: "Creature updated successfully" });

      case "update_character":
        const updateCharData: any = {
          character: { id: args.id },
        };
        if (args.name !== undefined) updateCharData.character.name = args.name;
        if (args.description !== undefined) updateCharData.character.description = args.description;
        if (args.hp !== undefined) updateCharData.character.hp = args.hp;
        if (args.maxHp !== undefined) updateCharData.character.maxHp = args.maxHp;
        if (args.mana !== undefined) updateCharData.character.mana = args.mana;
        if (args.maxMana !== undefined) updateCharData.character.maxMana = args.maxMana;
        if (args.affinity !== undefined) updateCharData.character.affinity = args.affinity;
        if (args.imagePath !== undefined) updateCharData.character.imagePath = args.imagePath;
        if (args.storyIds !== undefined) updateCharData.character.storyIds = args.storyIds;
        
        result = await callGameDataAPI("/characters", "PUT", updateCharData);
        return jsonResponse({ result: result.character, message: "Character updated successfully" });

      case "update_environment":
        const updateEnvData: any = { id: args.id };
        if (args.name !== undefined) updateEnvData.name = args.name;
        if (args.description !== undefined) updateEnvData.description = args.description;
        if (args.imagePath !== undefined) updateEnvData.imagePath = args.imagePath;
        if (args.storyIds !== undefined) updateEnvData.storyIds = args.storyIds;
        if (args.metadata !== undefined) updateEnvData.metadata = args.metadata;
        
        result = await callGameDataAPI("/environments", "PUT", updateEnvData);
        return jsonResponse({ result: result.environment, message: "Environment updated successfully" });

      // Delete functions
      case "delete_creature":
        result = await callGameDataAPI(`/creatures?id=${args.id}`, "DELETE");
        return jsonResponse({ result: { success: true }, message: "Creature deleted successfully" });

      case "delete_character":
        result = await callGameDataAPI(`/characters?id=${args.id}`, "DELETE");
        return jsonResponse({ result: { success: true }, message: "Character deleted successfully" });

      case "delete_environment":
        result = await callGameDataAPI(`/environments?id=${args.id}`, "DELETE");
        return jsonResponse({ result: { success: true }, message: "Environment deleted successfully" });

      default:
        return jsonResponse(
          { error: `Unknown function: ${name}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error executing tool:", error);
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Failed to execute tool",
      },
      { status: 500 }
    );
  }
}

