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
  // Handle migration: if new columns exist, use them; otherwise convert from cells array
  let minX: number, minY: number, width: number, height: number;
  
  if (row.minX && row.minY && row.width && row.height) {
    // New format - use square format
    minX = parseInt(row.minX);
    minY = parseInt(row.minY);
    width = parseInt(row.width);
    height = parseInt(row.height);
  } else {
    // Old format - convert from cells array (migration path)
    try {
      const cells = JSON.parse((row as any).cells || '[]') as Array<{ cellX: number; cellY: number }>;
      if (cells.length > 0) {
        const xs = cells.map(c => c.cellX);
        const ys = cells.map(c => c.cellY);
        minX = Math.min(...xs);
        minY = Math.min(...ys);
        const maxX = Math.max(...xs);
        const maxY = Math.max(...ys);
        // Make it square
        const w = maxX - minX + 1;
        const h = maxY - minY + 1;
        width = Math.max(w, h);
        height = Math.max(w, h);
      } else {
        // Fallback
        minX = 0;
        minY = 0;
        width = 1;
        height = 1;
      }
    } catch (e) {
      // Fallback if parsing fails
      minX = 0;
      minY = 0;
      width = 1;
      height = 1;
    }
  }
  
  return {
    id: row.id,
    mapId: row.mapId,
    parentRegionId: row.parentRegionId || undefined,
    name: row.name,
    description: row.description || undefined,
    minX,
    minY,
    width,
    height,
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
    parentRegionId: region.parentRegionId || null,
    name: region.name,
    description: region.description || null,
    minX: region.minX.toString(),
    minY: region.minY.toString(),
    width: region.width.toString(),
    height: region.height.toString(),
    nestedMapId: region.nestedMapId || null,
    environmentId: region.environmentId || null,
    color: region.color,
    metadata: JSON.stringify(region.metadata),
  };
}


