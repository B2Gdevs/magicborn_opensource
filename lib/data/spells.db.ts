// lib/data/spells.db.ts
// Drizzle ORM database setup for named spells

import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import { namedSpells } from "./spells.schema";
import { sql } from "drizzle-orm";

const DB_PATH = join(process.cwd(), "data", "spells.db");

// Ensure data directory exists
const dataDir = join(process.cwd(), "data");
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

let sqliteInstance: Database.Database | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDatabase() {
  if (dbInstance && sqliteInstance) {
    return dbInstance;
  }

  sqliteInstance = new Database(DB_PATH);
  sqliteInstance.pragma("journal_mode = WAL"); // Better concurrency
  
  dbInstance = drizzle(sqliteInstance, { schema: { namedSpells } });
  
  // Initialize schema and indexes
  initializeSchema();
  
  return dbInstance;
}

function initializeSchema() {
  if (!sqliteInstance) return;

  // Create indexes
  sqliteInstance.exec(`
    CREATE INDEX IF NOT EXISTS idx_named_spells_hidden ON named_spells(hidden);
    CREATE INDEX IF NOT EXISTS idx_named_spells_source ON named_spells(requires_named_source_id);
  `);

  // Trigger to update updated_at timestamp
  sqliteInstance.exec(`
    CREATE TRIGGER IF NOT EXISTS update_named_spells_timestamp
    AFTER UPDATE ON named_spells
    BEGIN
      UPDATE named_spells SET updated_at = datetime('now') WHERE id = NEW.id;
    END
  `);
}

// Close database connection (useful for cleanup)
export function closeDatabase() {
  if (sqliteInstance) {
    sqliteInstance.close();
    sqliteInstance = null;
    dbInstance = null;
  }
}

