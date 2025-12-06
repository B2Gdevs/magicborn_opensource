// lib/data/mapsRepository.ts
// Repository layer for maps database operations

import { getDatabase } from "./spells.db";
import { maps } from "./maps.schema";
import type { MapDefinition } from "./maps";
import type { CoordinateSystemConfig } from "@/lib/utils/coordinateSystem";
import type { CellCoordinates } from "@/lib/utils/coordinateSystem";
import { eq } from "drizzle-orm";

function rowToMap(row: typeof maps.$inferSelect): MapDefinition {
  const map: MapDefinition = {
    id: row.id,
    environmentId: row.environmentId,
    name: row.name,
    description: row.description,
    coordinateConfig: JSON.parse(row.coordinateConfig) as CoordinateSystemConfig,
    sceneIds: JSON.parse(row.sceneIds) as string[],
    connections: JSON.parse(row.connections) as MapDefinition["connections"],
  };

  if (row.imagePath) {
    map.imagePath = row.imagePath;
  }

  if (row.parentMapId) {
    map.parentMapId = row.parentMapId;
  }

  if (row.parentCellX !== null && row.parentCellY !== null) {
    map.parentCellCoordinates = {
      cellX: row.parentCellX,
      cellY: row.parentCellY,
    };
  }

  if (row.environmentalModifiers) {
    map.environmentalModifiers = JSON.parse(row.environmentalModifiers) as MapDefinition["environmentalModifiers"];
  }

  return map;
}

function mapToRow(map: MapDefinition): typeof maps.$inferInsert {
  return {
    id: map.id,
    environmentId: map.environmentId,
    parentMapId: map.parentMapId || null,
    parentCellX: map.parentCellCoordinates?.cellX ?? null,
    parentCellY: map.parentCellCoordinates?.cellY ?? null,
    name: map.name,
    description: map.description,
    imagePath: map.imagePath || null,
    coordinateConfig: JSON.stringify(map.coordinateConfig),
    sceneIds: JSON.stringify(map.sceneIds),
    connections: JSON.stringify(map.connections),
    environmentalModifiers: map.environmentalModifiers
      ? JSON.stringify(map.environmentalModifiers)
      : null,
  };
}

export class MapsRepository {
  private db = getDatabase();

  listAll(): MapDefinition[] {
    const rows = this.db
      .select()
      .from(maps)
      .orderBy(maps.name)
      .all();
    return rows.map(rowToMap);
  }

  getById(id: string): MapDefinition | null {
    const row = this.db
      .select()
      .from(maps)
      .where(eq(maps.id, id))
      .get();
    return row ? rowToMap(row) : null;
  }

  getByEnvironmentId(environmentId: string): MapDefinition[] {
    const rows = this.db
      .select()
      .from(maps)
      .where(eq(maps.environmentId, environmentId))
      .orderBy(maps.name)
      .all();
    return rows.map(rowToMap);
  }

  getByParentMapId(parentMapId: string): MapDefinition[] {
    const rows = this.db
      .select()
      .from(maps)
      .where(eq(maps.parentMapId, parentMapId))
      .orderBy(maps.name)
      .all();
    return rows.map(rowToMap);
  }

  create(map: MapDefinition): void {
    this.db.insert(maps).values(mapToRow(map)).run();
  }

  update(map: MapDefinition): void {
    this.db
      .update(maps)
      .set({
        ...mapToRow(map),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(maps.id, map.id))
      .run();
  }

  delete(id: string): void {
    this.db.delete(maps).where(eq(maps.id, id)).run();
  }

  exists(id: string): boolean {
    const row = this.db
      .select({ id: maps.id })
      .from(maps)
      .where(eq(maps.id, id))
      .get();
    return row !== undefined;
  }
}

let repositoryInstance: MapsRepository | null = null;

export function getMapsRepository(): MapsRepository {
  if (!repositoryInstance) {
    repositoryInstance = new MapsRepository();
  }
  return repositoryInstance;
}

