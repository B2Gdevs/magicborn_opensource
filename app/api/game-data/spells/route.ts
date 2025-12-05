// app/api/game-data/spells/route.ts
// API routes for named spells CRUD operations

import { NextResponse } from "next/server";
import { getSpellsRepository } from "@/lib/data/spellsRepository";
import type { NamedSpellBlueprint } from "@/lib/data/namedSpells";

export async function GET() {
  try {
    const repo = getSpellsRepository();
    const spells = repo.listAll();
    return NextResponse.json({ spells });
  } catch (error) {
    console.error("Error fetching spells:", error);
    return NextResponse.json({ error: "Failed to fetch spells" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const spell = body.spell as NamedSpellBlueprint;

    if (!spell || !spell.id || !spell.name) {
      return NextResponse.json({ error: "Invalid spell data" }, { status: 400 });
    }

    const repo = getSpellsRepository();

    if (repo.exists(spell.id)) {
      return NextResponse.json({ error: "Spell with this ID already exists" }, { status: 409 });
    }

    repo.create(spell);
    return NextResponse.json({ success: true, spell });
  } catch (error) {
    console.error("Error creating spell:", error);
    return NextResponse.json({ error: "Failed to create spell" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const spell = body.spell as NamedSpellBlueprint;

    if (!spell || !spell.id) {
      return NextResponse.json({ error: "Invalid spell data" }, { status: 400 });
    }

    const repo = getSpellsRepository();

    if (!repo.exists(spell.id)) {
      return NextResponse.json({ error: "Spell not found" }, { status: 404 });
    }

    repo.update(spell);
    return NextResponse.json({ success: true, spell });
  } catch (error) {
    console.error("Error updating spell:", error);
    return NextResponse.json({ error: "Failed to update spell" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Spell ID is required" }, { status: 400 });
    }

    const repo = getSpellsRepository();

    if (!repo.exists(id)) {
      return NextResponse.json({ error: "Spell not found" }, { status: 404 });
    }

    repo.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting spell:", error);
    return NextResponse.json({ error: "Failed to delete spell" }, { status: 500 });
  }
}

