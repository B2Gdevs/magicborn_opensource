// app/api/game-data/effects/route.ts
// API routes for effect definitions CRUD operations

import { NextResponse } from "next/server";
import { getEffectsRepository } from "@/lib/data/effectsRepository";
import type { EffectDefinition } from "@/lib/data/effects";
import { EFFECT_DEFS } from "@/lib/data/effects";

export async function GET() {
  try {
    const repo = getEffectsRepository();
    const effects = repo.listAll();
    
    // If database is empty, initialize with hardcoded data
    if (effects.length === 0) {
      const hardcodedEffects = Object.values(EFFECT_DEFS);
      hardcodedEffects.forEach(effect => {
        if (!repo.exists(effect.id)) {
          repo.create(effect);
        }
      });
      return NextResponse.json({ effects: repo.listAll() });
    }
    
    return NextResponse.json({ effects });
  } catch (error) {
    console.error("Error fetching effects:", error);
    return NextResponse.json({ error: "Failed to fetch effects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const effect = body.effect as EffectDefinition;

    if (!effect || !effect.id || !effect.name) {
      return NextResponse.json({ error: "Invalid effect data" }, { status: 400 });
    }

    const repo = getEffectsRepository();

    if (repo.exists(effect.id)) {
      return NextResponse.json({ error: "Effect with this ID already exists" }, { status: 409 });
    }

    repo.create(effect);
    return NextResponse.json({ success: true, effect });
  } catch (error) {
    console.error("Error creating effect:", error);
    return NextResponse.json({ error: "Failed to create effect" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const effect = body.effect as EffectDefinition;

    if (!effect || !effect.id) {
      return NextResponse.json({ error: "Invalid effect data" }, { status: 400 });
    }

    const repo = getEffectsRepository();

    if (!repo.exists(effect.id)) {
      return NextResponse.json({ error: "Effect not found" }, { status: 404 });
    }

    repo.update(effect);
    return NextResponse.json({ success: true, effect });
  } catch (error) {
    console.error("Error updating effect:", error);
    return NextResponse.json({ error: "Failed to update effect" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Effect ID is required" }, { status: 400 });
    }

    const repo = getEffectsRepository();

    if (!repo.exists(id)) {
      return NextResponse.json({ error: "Effect not found" }, { status: 404 });
    }

    repo.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting effect:", error);
    return NextResponse.json({ error: "Failed to delete effect" }, { status: 500 });
  }
}

