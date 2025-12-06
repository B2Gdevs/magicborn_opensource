// app/api/game-data/characters/route.ts
// API routes for characters CRUD operations

import { NextResponse } from "next/server";
import { getCharactersRepository } from "@/lib/data/charactersRepository";
import type { CharacterDefinition } from "@/lib/data/characters";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const repo = getCharactersRepository();
    const characters = repo.listAll();
    return NextResponse.json({ characters });
  } catch (error) {
    console.error("Error fetching characters:", error);
    return NextResponse.json({ error: "Failed to fetch characters" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const character: CharacterDefinition = body.character;

    if (!character || !character.id || !character.name) {
      return NextResponse.json({ error: "Invalid character data" }, { status: 400 });
    }

    const repo = getCharactersRepository();

    if (repo.exists(character.id)) {
      return NextResponse.json({ error: "Character with this ID already exists" }, { status: 409 });
    }

    repo.create(character);
    return NextResponse.json({ success: true, character });
  } catch (error) {
    console.error("Error creating character:", error);
    return NextResponse.json({ error: "Failed to create character" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const character: CharacterDefinition = body.character;

    if (!character || !character.id) {
      return NextResponse.json({ error: "Invalid character data" }, { status: 400 });
    }

    const repo = getCharactersRepository();

    if (!repo.exists(character.id)) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    repo.update(character);
    return NextResponse.json({ success: true, character });
  } catch (error) {
    console.error("Error updating character:", error);
    return NextResponse.json({ error: "Failed to update character" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Character ID is required" }, { status: 400 });
    }

    const repo = getCharactersRepository();

    if (!repo.exists(id)) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    repo.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting character:", error);
    return NextResponse.json({ error: "Failed to delete character" }, { status: 500 });
  }
}

