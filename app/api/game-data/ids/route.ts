// app/api/game-data/ids/route.ts
// API endpoint to get all IDs across all content types for uniqueness validation

import { NextResponse } from "next/server";
import { getSpellsRepository } from "@/lib/data/spellsRepository";
import { getEffectsRepository } from "@/lib/data/effectsRepository";
import { getCharactersRepository } from "@/lib/data/charactersRepository";

export async function GET() {
  try {
    const spellsRepo = getSpellsRepository();
    const effectsRepo = getEffectsRepository();
    const charactersRepo = getCharactersRepository();
    
    const spells = spellsRepo.listAll();
    const effects = effectsRepo.listAll();
    const characters = charactersRepo.listAll();
    
    // Get all IDs grouped by content type
    const allIds = {
      spells: spells.map(s => s.id),
      effects: effects.map(e => e.id),
      characters: characters.map(c => c.id),
      // TODO: Add other content types as they're implemented
      // runes: runes.map(r => r.code), // Runes use code, not id
      // creatures: creatures.map(c => c.id),
      // environments: environments.map(e => e.id),
    };
    
    // Create a map of ID -> content types for quick lookup
    const idMap: Record<string, string[]> = {};
    
    Object.entries(allIds).forEach(([contentType, ids]) => {
      ids.forEach(id => {
        if (!idMap[id]) {
          idMap[id] = [];
        }
        idMap[id].push(contentType);
      });
    });
    
    return NextResponse.json({
      allIds,
      idMap, // Quick lookup: which content types use this ID
    });
  } catch (error) {
    console.error("Error fetching IDs:", error);
    return NextResponse.json(
      { error: "Failed to fetch IDs", allIds: {}, idMap: {} },
      { status: 500 }
    );
  }
}

