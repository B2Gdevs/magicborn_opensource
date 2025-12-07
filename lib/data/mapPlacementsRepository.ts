// lib/data/mapPlacementsRepository.ts
// Repository layer for map placements database operations

import { getDatabase } from "./spells.db";
import { mapPlacements } from "./mapPlacements.schema";
import type { MapPlacement } from "./mapPlacements";
import { PlacementType, PrecisionLevel, LandmarkType } from "@core/mapEnums";
import { eq } from "drizzle-orm";

function rowToPlacement(row: typeof mapPlacements.$inferSelect): MapPlacement {
  const placement: MapPlacement = {
    id: row.id,
    mapId: row.mapId,
    type: row.type as PlacementType,
    itemId: row.itemId,
    coordinates: JSON.parse(row.coordinates),
    precisionLevel: row.precisionLevel as PrecisionLevel,
    isLandmark: row.isLandmark === "true",
    metadata: JSON.parse(row.metadata),
  };

  if (row.landmarkType) {
    placement.landmarkType = row.landmarkType as LandmarkType;
  }

  if (row.nestedMapId) {
    placement.nestedMapId = row.nestedMapId;
  }

  return placement;
}

function placementToRow(placement: MapPlacement): typeof mapPlacements.$inferInsert {
  return {
    id: placement.id,
    mapId: placement.mapId,
    type: placement.type,
    itemId: placement.itemId,
    coordinates: JSON.stringify(placement.coordinates),
    precisionLevel: placement.precisionLevel,
    isLandmark: placement.isLandmark ? "true" : "false",
    landmarkType: placement.landmarkType || null,
    nestedMapId: placement.nestedMapId || null,
    metadata: JSON.stringify(placement.metadata),
  };
}

export class MapPlacementsRepository {
  private db = getDatabase();

  listAll(): MapPlacement[] {
    const rows = this.db
      .select()
      .from(mapPlacements)
      .all();
    return rows.map(rowToPlacement);
  }

  getById(id: string): MapPlacement | null {
    const row = this.db
      .select()
      .from(mapPlacements)
      .where(eq(mapPlacements.id, id))
      .get();
    return row ? rowToPlacement(row) : null;
  }

  getByMapId(mapId: string): MapPlacement[] {
    const rows = this.db
      .select()
      .from(mapPlacements)
      .where(eq(mapPlacements.mapId, mapId))
      .all();
    return rows.map(rowToPlacement);
  }

  getByNestedMapId(nestedMapId: string): MapPlacement | null {
    const row = this.db
      .select()
      .from(mapPlacements)
      .where(eq(mapPlacements.nestedMapId, nestedMapId))
      .get();
    return row ? rowToPlacement(row) : null;
  }

  create(placement: MapPlacement): void {
    this.db.insert(mapPlacements).values(placementToRow(placement)).run();
  }

  update(placement: MapPlacement): void {
    this.db
      .update(mapPlacements)
      .set({
        ...placementToRow(placement),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(mapPlacements.id, placement.id))
      .run();
  }

  delete(id: string): void {
    this.db.delete(mapPlacements).where(eq(mapPlacements.id, id)).run();
  }

  deleteByMapId(mapId: string): void {
    this.db.delete(mapPlacements).where(eq(mapPlacements.mapId, mapId)).run();
  }

  exists(id: string): boolean {
    const row = this.db
      .select({ id: mapPlacements.id })
      .from(mapPlacements)
      .where(eq(mapPlacements.id, id))
      .get();
    return row !== undefined;
  }
}

let repositoryInstance: MapPlacementsRepository | null = null;

export function getMapPlacementsRepository(): MapPlacementsRepository {
  if (!repositoryInstance) {
    repositoryInstance = new MapPlacementsRepository();
  }
  return repositoryInstance;
}


