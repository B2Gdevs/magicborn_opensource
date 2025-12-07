// app/api/game-data/map-placements/route.ts
// API routes for map placement CRUD operations

import { NextResponse } from "next/server";
import { getMapPlacementsRepository } from "@/lib/data/mapPlacementsRepository";
import type { MapPlacement } from "@/lib/data/mapPlacements";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const mapId = searchParams.get("mapId");
    const nestedMapId = searchParams.get("nestedMapId");
    
    const repo = getMapPlacementsRepository();
    
    if (id) {
      const placement = repo.getById(id);
      if (!placement) {
        return NextResponse.json({ error: "Placement not found" }, { status: 404 });
      }
      return NextResponse.json({ placement });
    }
    
    if (mapId) {
      const placements = repo.getByMapId(mapId);
      return NextResponse.json({ placements });
    }
    
    if (nestedMapId) {
      const placement = repo.getByNestedMapId(nestedMapId);
      if (!placement) {
        return NextResponse.json({ error: "Placement not found" }, { status: 404 });
      }
      return NextResponse.json({ placement });
    }
    
    const placements = repo.listAll();
    return NextResponse.json({ placements });
  } catch (error) {
    console.error("Error fetching placements:", error);
    return NextResponse.json({ error: "Failed to fetch placements" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: any = null;
  try {
    body = await request.json();
    const placement: MapPlacement = body;

    if (!placement || !placement.id || !placement.mapId || !placement.itemId) {
      return NextResponse.json({ error: "Invalid placement data" }, { status: 400 });
    }

    const repo = getMapPlacementsRepository();

    // Check if placement already exists
    const existing = repo.getById(placement.id);
    if (existing) {
      console.log(`Placement with ID "${placement.id}" already exists in database`);
      return NextResponse.json({ 
        error: `Placement with ID "${placement.id}" already exists`,
        existingId: placement.id
      }, { status: 409 });
    }

    repo.create(placement);
    return NextResponse.json({ success: true, placement });
  } catch (error) {
    console.error("Error creating placement:", error);
    if (error instanceof Error && error.message.includes("UNIQUE constraint")) {
      const placementId = body?.id || 'unknown';
      return NextResponse.json({ 
        error: `Placement with ID "${placementId}" already exists (database constraint)`,
        existingId: placementId 
      }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create placement" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const placement: MapPlacement = body;

    if (!placement || !placement.id) {
      return NextResponse.json({ error: "Invalid placement data" }, { status: 400 });
    }

    const repo = getMapPlacementsRepository();

    if (!repo.exists(placement.id)) {
      return NextResponse.json({ error: "Placement not found" }, { status: 404 });
    }

    repo.update(placement);
    return NextResponse.json({ success: true, placement });
  } catch (error) {
    console.error("Error updating placement:", error);
    return NextResponse.json({ error: "Failed to update placement" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const mapId = searchParams.get("mapId"); // Optional: delete all placements for a map

    if (mapId) {
      const repo = getMapPlacementsRepository();
      repo.deleteByMapId(mapId);
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: "Placement ID is required" }, { status: 400 });
    }

    const repo = getMapPlacementsRepository();

    if (!repo.exists(id)) {
      return NextResponse.json({ error: "Placement not found" }, { status: 404 });
    }

    repo.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting placement:", error);
    return NextResponse.json({ error: "Failed to delete placement" }, { status: 500 });
  }
}


