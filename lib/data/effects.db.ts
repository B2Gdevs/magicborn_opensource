// lib/data/effects.db.ts
// Drizzle ORM database setup for effect definitions
// Uses the same database as spells for consistency

import { getDatabase } from "./spells.db";

export function getEffectsDatabase() {
  // Reuse the same database instance - schema initialization is handled in spells.db.ts
  return getDatabase();
}

