// app/api/game-data/map-regions/route.ts
// API routes for map regions

import { NextResponse } from "next/server";
import { 
  listRegionsByMapId, 
  getRegionById, 
  createRegion, 
  updateRegion, 
  deleteRegion,
  getRegionsByNestedMapId 
} from "@/lib/data/mapRegionsRepository";
import type { MapRegion } from "@/lib/data/mapRegions";
import { getMapsRepository } from "@/lib/data/mapsRepository";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mapId = searchParams.get("mapId");
    const id = searchParams.get("id");
    const nestedMapId = searchParams.get("nestedMapId");

    if (id) {
      const region = await getRegionById(id);
      if (!region) {
        return NextResponse.json({ error: "Region not found" }, { status: 404 });
      }
      return NextResponse.json({ region });
    }

    if (nestedMapId) {
      const regions = await getRegionsByNestedMapId(nestedMapId);
      return NextResponse.json({ regions });
    }

    if (mapId) {
      const regions = await listRegionsByMapId(mapId);
      return NextResponse.json({ regions });
    }

    // List all regions (for region selector)
    // We need to get all maps first, then get regions for each
    const mapsRepo = getMapsRepository();
    const allMaps = mapsRepo.listAll();
    const allRegions: MapRegion[] = [];
    
    for (const map of allMaps) {
      try {
        const mapRegions = await listRegionsByMapId(map.id);
        allRegions.push(...mapRegions);
      } catch (err) {
        console.error(`Failed to load regions for map ${map.id}:`, err);
      }
    }

    return NextResponse.json({ regions: allRegions });
  } catch (error) {
    console.error("Error fetching regions:", error);
    return NextResponse.json({ error: "Failed to fetch regions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let region: MapRegion | null = null;
  try {
    const body = await request.json();
    region = body;

    if (!region || !region.id || !region.mapId || !region.name) {
      return NextResponse.json({ error: "Invalid region data" }, { status: 400 });
    }

    // Check if region already exists
    const existing = await getRegionById(region.id);
    if (existing) {
      return NextResponse.json({ 
        error: `Region with ID "${region.id}" already exists`,
        existingId: region.id
      }, { status: 409 });
    }

    await createRegion(region);
    return NextResponse.json({ success: true, region });
  } catch (error) {
    console.error("Error creating region:", error);
    if (error instanceof Error && error.message.includes("UNIQUE constraint")) {
      return NextResponse.json({ 
        error: `Region with ID "${region?.id || 'unknown'}" already exists (database constraint)`,
        existingId: region?.id 
      }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create region" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const region: MapRegion = body;

    if (!region || !region.id) {
      return NextResponse.json({ error: "Invalid region data" }, { status: 400 });
    }

    const existing = await getRegionById(region.id);
    if (!existing) {
      return NextResponse.json({ error: "Region not found" }, { status: 404 });
    }

    await updateRegion(region);
    return NextResponse.json({ success: true, region });
  } catch (error) {
    console.error("Error updating region:", error);
    return NextResponse.json({ error: "Failed to update region" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Region ID is required" }, { status: 400 });
    }

    const existing = await getRegionById(id);
    if (!existing) {
      return NextResponse.json({ error: "Region not found" }, { status: 404 });
    }

    await deleteRegion(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting region:", error);
    return NextResponse.json({ error: "Failed to delete region" }, { status: 500 });
  }
}

