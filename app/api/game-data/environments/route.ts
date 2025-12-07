// app/api/game-data/environments/route.ts
// API routes for environment CRUD operations

import { NextResponse } from "next/server";
import { getEnvironmentsRepository } from "@/lib/data/environmentsRepository";
import type { EnvironmentDefinition } from "@/lib/data/environments";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    const repo = getEnvironmentsRepository();
    
    if (id) {
      const environment = repo.getById(id);
      if (!environment) {
        return NextResponse.json({ error: "Environment not found" }, { status: 404 });
      }
      return NextResponse.json({ environment });
    }
    
    const environments = repo.listAll();
    return NextResponse.json({ environments });
  } catch (error) {
    console.error("Error fetching environments:", error);
    return NextResponse.json({ error: "Failed to fetch environments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: any = null;
  try {
    body = await request.json();
    const environment: EnvironmentDefinition = body;

    if (!environment || !environment.id || !environment.name) {
      return NextResponse.json({ error: "Invalid environment data" }, { status: 400 });
    }

    const repo = getEnvironmentsRepository();

    // Check if environment already exists
    const existing = repo.getById(environment.id);
    if (existing) {
      console.log(`Environment with ID "${environment.id}" already exists in database:`, existing.name);
      return NextResponse.json({ 
        error: `Environment with ID "${environment.id}" already exists (existing environment: "${existing.name}")`,
        existingId: environment.id,
        existingName: existing.name
      }, { status: 409 });
    }

    repo.create(environment);
    return NextResponse.json({ success: true, environment });
  } catch (error) {
    console.error("Error creating environment:", error);
    if (error instanceof Error && error.message.includes("UNIQUE constraint")) {
      const environmentId = body?.id || 'unknown';
      return NextResponse.json({ 
        error: `Environment with ID "${environmentId}" already exists (database constraint)`,
        existingId: environmentId 
      }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create environment" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const environment: EnvironmentDefinition = body;

    if (!environment || !environment.id) {
      return NextResponse.json({ error: "Invalid environment data" }, { status: 400 });
    }

    const repo = getEnvironmentsRepository();

    if (!repo.exists(environment.id)) {
      return NextResponse.json({ error: "Environment not found" }, { status: 404 });
    }

    repo.update(environment);
    return NextResponse.json({ success: true, environment });
  } catch (error) {
    console.error("Error updating environment:", error);
    return NextResponse.json({ error: "Failed to update environment" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Environment ID is required" }, { status: 400 });
    }

    const repo = getEnvironmentsRepository();

    if (!repo.exists(id)) {
      return NextResponse.json({ error: "Environment not found" }, { status: 404 });
    }

    repo.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting environment:", error);
    return NextResponse.json({ error: "Failed to delete environment" }, { status: 500 });
  }
}


