// app/api/game-data/runes/route.ts
// API routes for runes CRUD operations

import { NextResponse } from "next/server";
import { getRunesRepository } from "@/lib/data/runesRepository";
import type { RuneDef } from "@/lib/packages/runes";
import type { RuneCode } from "@core/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const repo = getRunesRepository();
    let runes = repo.listAll();
    
    // Auto-seed if database is empty
    if (runes.length === 0) {
      const { getRUNES } = await import("@/lib/packages/runes");
      const hardcodedRunes = Object.values(getRUNES());
      
      // Seed all runes from hardcoded data
      for (const rune of hardcodedRunes) {
        if (!repo.exists(rune.code)) {
          repo.create(rune);
        }
      }
      
      // Reload after seeding
      runes = repo.listAll();
    }
    
    return NextResponse.json({ runes });
  } catch (error) {
    console.error("Error fetching runes:", error);
    return NextResponse.json({ error: "Failed to fetch runes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rune: RuneDef = body;

    if (!rune.code || !rune.concept) {
      return NextResponse.json(
        { error: "Code and concept are required" },
        { status: 400 }
      );
    }

    const repo = getRunesRepository();
    
    if (repo.exists(rune.code)) {
      return NextResponse.json(
        { error: `Rune with code "${rune.code}" already exists` },
        { status: 409 }
      );
    }

    repo.create(rune);
    return NextResponse.json({ success: true, rune });
  } catch (error) {
    console.error("Error creating rune:", error);
    return NextResponse.json({ error: "Failed to create rune" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const rune: RuneDef = body;

    if (!rune.code || !rune.concept) {
      return NextResponse.json(
        { error: "Code and concept are required" },
        { status: 400 }
      );
    }

    const repo = getRunesRepository();
    
    if (!repo.exists(rune.code)) {
      return NextResponse.json(
        { error: `Rune with code "${rune.code}" not found` },
        { status: 404 }
      );
    }

    repo.update(rune);
    return NextResponse.json({ success: true, rune });
  } catch (error) {
    console.error("Error updating rune:", error);
    return NextResponse.json({ error: "Failed to update rune" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code") as RuneCode | null;

    if (!code) {
      return NextResponse.json(
        { error: "Code parameter is required" },
        { status: 400 }
      );
    }

    const repo = getRunesRepository();
    
    if (!repo.exists(code)) {
      return NextResponse.json(
        { error: `Rune with code "${code}" not found` },
        { status: 404 }
      );
    }

    repo.delete(code);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting rune:", error);
    return NextResponse.json({ error: "Failed to delete rune" }, { status: 500 });
  }
}
