// app/api/game-data/creatures/route.ts
// API routes for creature CRUD operations

import { NextResponse } from "next/server";
import { getCreaturesRepository } from "@/lib/data/creaturesRepository";
import type { CreatureDefinition } from "@/lib/data/creatures";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    const repo = getCreaturesRepository();
    
    if (id) {
      const creature = repo.getById(id);
      if (!creature) {
        return NextResponse.json({ error: "Creature not found" }, { status: 404 });
      }
      return NextResponse.json({ creature });
    }
    
    const creatures = repo.listAll();
    return NextResponse.json({ creatures });
  } catch (error) {
    console.error("Error fetching creatures:", error);
    return NextResponse.json({ error: "Failed to fetch creatures" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: any = null;
  try {
    body = await request.json();
    const creature: CreatureDefinition = body;

    if (!creature || !creature.id || !creature.name) {
      return NextResponse.json({ error: "Invalid creature data" }, { status: 400 });
    }

    const repo = getCreaturesRepository();

    // Check if creature already exists - use getById for better error info
    const existing = repo.getById(creature.id);
    if (existing) {
      console.log(`Creature with ID "${creature.id}" already exists in database:`, existing.name);
      return NextResponse.json({ 
        error: `Creature with ID "${creature.id}" already exists (existing creature: "${existing.name}")`,
        existingId: creature.id,
        existingName: existing.name
      }, { status: 409 });
    }

    repo.create(creature);
    return NextResponse.json({ success: true, creature });
  } catch (error) {
    console.error("Error creating creature:", error);
    // If it's a SQLite constraint error, provide a better message
    if (error instanceof Error && error.message.includes("UNIQUE constraint")) {
      const creatureId = body?.id || 'unknown';
      return NextResponse.json({ 
        error: `Creature with ID "${creatureId}" already exists (database constraint)`,
        existingId: creatureId 
      }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create creature" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const creature: CreatureDefinition = body;

    if (!creature || !creature.id) {
      return NextResponse.json({ error: "Invalid creature data" }, { status: 400 });
    }

    const repo = getCreaturesRepository();

    if (!repo.exists(creature.id)) {
      return NextResponse.json({ error: "Creature not found" }, { status: 404 });
    }

    repo.update(creature);
    return NextResponse.json({ success: true, creature });
  } catch (error) {
    console.error("Error updating creature:", error);
    return NextResponse.json({ error: "Failed to update creature" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Creature ID is required" }, { status: 400 });
    }

    const repo = getCreaturesRepository();

    if (!repo.exists(id)) {
      return NextResponse.json({ error: "Creature not found" }, { status: 404 });
    }

    repo.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting creature:", error);
    return NextResponse.json({ error: "Failed to delete creature" }, { status: 500 });
  }
}

