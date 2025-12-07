// lib/data/mapRegionsRepository.ts
// Repository for map regions (cell selections that define nested maps)

import { getDatabase } from "./spells.db";
import { mapRegions } from "./mapRegions.schema";
import { eq } from "drizzle-orm";
import type { MapRegion } from "./mapRegions";

export async function listRegionsByMapId(mapId: string): Promise<MapRegion[]> {
  const db = getDatabase();
  const rows = await db
    .select()
    .from(mapRegions)
    .where(eq(mapRegions.mapId, mapId));
  
  return rows.map(rowToRegion);
}

export async function getRegionById(id: string): Promise<MapRegion | null> {
  const db = getDatabase();
  const rows = await db
    .select()
    .from(mapRegions)
    .where(eq(mapRegions.id, id))
    .limit(1);
  
  if (rows.length === 0) return null;
  return rowToRegion(rows[0]);
}

export async function createRegion(region: MapRegion): Promise<MapRegion> {
  const db = getDatabase();
  const row = regionToRow(region);
  
  await db.insert(mapRegions).values(row);
  return region;
}

export async function updateRegion(region: MapRegion): Promise<MapRegion> {
  const db = getDatabase();
  const row = regionToRow(region);
  
  await db
    .update(mapRegions)
    .set(row)
    .where(eq(mapRegions.id, region.id));
  
  return region;
}

export async function deleteRegion(id: string): Promise<void> {
  const db = getDatabase();
  await db.delete(mapRegions).where(eq(mapRegions.id, id));
}

export async function getRegionsByNestedMapId(nestedMapId: string): Promise<MapRegion[]> {
  const db = getDatabase();
  const rows = await db
    .select()
    .from(mapRegions)
    .where(eq(mapRegions.nestedMapId, nestedMapId));
  
  return rows.map(rowToRegion);
}

function rowToRegion(row: typeof mapRegions.$inferSelect): MapRegion {
  return {
    id: row.id,
    mapId: row.mapId,
    name: row.name,
    description: row.description || undefined,
    cells: JSON.parse(row.cells),
    nestedMapId: row.nestedMapId || undefined,
    environmentId: row.environmentId || undefined,
    color: row.color,
    metadata: JSON.parse(row.metadata),
  };
}

function regionToRow(region: MapRegion): typeof mapRegions.$inferInsert {
  return {
    id: region.id,
    mapId: region.mapId,
    name: region.name,
    description: region.description || null,
    cells: JSON.stringify(region.cells),
    nestedMapId: region.nestedMapId || null,
    environmentId: region.environmentId || null,
    color: region.color,
    metadata: JSON.stringify(region.metadata),
  };
}

