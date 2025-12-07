// app/api/game-data/maps/route.ts
// API routes for map CRUD operations

import { NextResponse } from "next/server";
import { getMapsRepository } from "@/lib/data/mapsRepository";
import type { MapDefinition } from "@/lib/data/maps";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const environmentId = searchParams.get("environmentId");
    const parentMapId = searchParams.get("parentMapId");
    
    const repo = getMapsRepository();
    
    if (id) {
      const map = repo.getById(id);
      if (!map) {
        return NextResponse.json({ error: "Map not found" }, { status: 404 });
      }
      return NextResponse.json({ map });
    }
    
    if (environmentId) {
      const maps = repo.getByEnvironmentId(environmentId);
      return NextResponse.json({ maps });
    }
    
    if (parentMapId) {
      const maps = repo.getByParentMapId(parentMapId);
      return NextResponse.json({ maps });
    }
    
    const maps = repo.listAll();
    return NextResponse.json({ maps });
  } catch (error) {
    console.error("Error fetching maps:", error);
    return NextResponse.json({ error: "Failed to fetch maps" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: any = null;
  try {
    body = await request.json();
    const map: MapDefinition = body;

    if (!map || !map.id || !map.name || !map.environmentId) {
      return NextResponse.json({ error: "Invalid map data" }, { status: 400 });
    }

    const repo = getMapsRepository();

    // Check if map already exists
    const existing = repo.getById(map.id);
    if (existing) {
      console.log(`Map with ID "${map.id}" already exists in database:`, existing.name);
      return NextResponse.json({ 
        error: `Map with ID "${map.id}" already exists (existing map: "${existing.name}")`,
        existingId: map.id,
        existingName: existing.name
      }, { status: 409 });
    }

    repo.create(map);
    return NextResponse.json({ success: true, map });
  } catch (error) {
    console.error("Error creating map:", error);
    if (error instanceof Error && error.message.includes("UNIQUE constraint")) {
      const mapId = body?.id || 'unknown';
      return NextResponse.json({ 
        error: `Map with ID "${mapId}" already exists (database constraint)`,
        existingId: mapId 
      }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create map" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const map: MapDefinition = body;

    if (!map || !map.id) {
      return NextResponse.json({ error: "Invalid map data" }, { status: 400 });
    }

    const repo = getMapsRepository();

    if (!repo.exists(map.id)) {
      return NextResponse.json({ error: "Map not found" }, { status: 404 });
    }

    repo.update(map);
    return NextResponse.json({ success: true, map });
  } catch (error) {
    console.error("Error updating map:", error);
    return NextResponse.json({ error: "Failed to update map" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Map ID is required" }, { status: 400 });
    }

    const repo = getMapsRepository();

    if (!repo.exists(id)) {
      return NextResponse.json({ error: "Map not found" }, { status: 404 });
    }

    repo.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting map:", error);
    return NextResponse.json({ error: "Failed to delete map" }, { status: 500 });
  }
}


