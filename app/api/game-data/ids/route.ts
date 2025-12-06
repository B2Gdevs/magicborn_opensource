// app/api/game-data/ids/route.ts
// API endpoint to get all IDs across all content types for uniqueness validation

import { NextResponse } from "next/server";
import { getSpellsRepository } from "@/lib/data/spellsRepository";
import { getEffectsRepository } from "@/lib/data/effectsRepository";
import { getCharactersRepository } from "@/lib/data/charactersRepository";
import { getCreaturesRepository } from "@/lib/data/creaturesRepository";
import { getRunesRepository } from "@/lib/data/runesRepository";
import { getEnvironmentsRepository } from "@/lib/data/environmentsRepository";
import { getMapsRepository } from "@/lib/data/mapsRepository";

export async function GET() {
  try {
    const spellsRepo = getSpellsRepository();
    const effectsRepo = getEffectsRepository();
    const charactersRepo = getCharactersRepository();
    const creaturesRepo = getCreaturesRepository();
    const runesRepo = getRunesRepository();
    const environmentsRepo = getEnvironmentsRepository();
    const mapsRepo = getMapsRepository();
    
    const spells = spellsRepo.listAll();
    const effects = effectsRepo.listAll();
    const characters = charactersRepo.listAll();
    const creatures = creaturesRepo.listAll();
    const runes = runesRepo.listAll();
    const environments = environmentsRepo.listAll();
    const maps = mapsRepo.listAll();
    
    // Get all IDs grouped by content type
    // Note: Runes use 'code' as their identifier, but we treat it as an ID for uniqueness checking
    const allIds = {
      spells: spells.map(s => s.id),
      effects: effects.map(e => e.id),
      characters: characters.map(c => c.id),
      creatures: creatures.map(c => c.id),
      runes: runes.map(r => r.code), // Runes use code as their unique identifier
      environments: environments.map(e => e.id),
      maps: maps.map(m => m.id),
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

