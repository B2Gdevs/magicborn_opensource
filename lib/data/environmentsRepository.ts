// lib/data/environmentsRepository.ts
// Repository layer for environments database operations

import { getDatabase } from "./spells.db";
import { environments } from "./environments.schema";
import type { EnvironmentDefinition } from "./environments";
import { eq } from "drizzle-orm";

function rowToEnvironment(row: typeof environments.$inferSelect): EnvironmentDefinition {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imagePath: row.imagePath || undefined,
    storyIds: JSON.parse(row.storyIds) as string[],
    mapIds: JSON.parse(row.mapIds) as string[],
    metadata: JSON.parse(row.metadata) as {
      biome: string;
      climate: string;
      dangerLevel: number;
    },
  };
}

function environmentToRow(environment: EnvironmentDefinition): typeof environments.$inferInsert {
  return {
    id: environment.id,
    name: environment.name,
    description: environment.description,
    imagePath: environment.imagePath || null,
    storyIds: JSON.stringify(environment.storyIds),
    mapIds: JSON.stringify(environment.mapIds),
    metadata: JSON.stringify(environment.metadata),
  };
}

export class EnvironmentsRepository {
  private db = getDatabase();

  listAll(): EnvironmentDefinition[] {
    const rows = this.db
      .select()
      .from(environments)
      .orderBy(environments.name)
      .all();
    return rows.map(rowToEnvironment);
  }

  getById(id: string): EnvironmentDefinition | null {
    const row = this.db
      .select()
      .from(environments)
      .where(eq(environments.id, id))
      .get();
    return row ? rowToEnvironment(row) : null;
  }

  create(environment: EnvironmentDefinition): void {
    this.db.insert(environments).values(environmentToRow(environment)).run();
  }

  update(environment: EnvironmentDefinition): void {
    this.db
      .update(environments)
      .set({
        ...environmentToRow(environment),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(environments.id, environment.id))
      .run();
  }

  delete(id: string): void {
    this.db.delete(environments).where(eq(environments.id, id)).run();
  }

  exists(id: string): boolean {
    const row = this.db
      .select({ id: environments.id })
      .from(environments)
      .where(eq(environments.id, id))
      .get();
    return row !== undefined;
  }
}

let repositoryInstance: EnvironmentsRepository | null = null;

export function getEnvironmentsRepository(): EnvironmentsRepository {
  if (!repositoryInstance) {
    repositoryInstance = new EnvironmentsRepository();
  }
  return repositoryInstance;
}


