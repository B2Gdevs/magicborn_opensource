// lib/data/spells.db.ts
// SQLite database setup and schema for named spells

import Database from "better-sqlite3";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

const DB_PATH = join(process.cwd(), "data", "spells.db");

// Ensure data directory exists
const dataDir = join(process.cwd(), "data");
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = new Database(DB_PATH);
  dbInstance.pragma("journal_mode = WAL"); // Better concurrency
  initializeSchema(dbInstance);
  return dbInstance;
}

function initializeSchema(db: Database.Database) {
  // Main spells table
  db.exec(`
    CREATE TABLE IF NOT EXISTS named_spells (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      hidden INTEGER NOT NULL DEFAULT 0,
      hint TEXT NOT NULL,
      
      -- Optional requirements (stored as JSON)
      required_runes TEXT NOT NULL, -- JSON array of RuneCode
      allowed_extra_runes TEXT, -- JSON array of RuneCode (nullable)
      tags TEXT NOT NULL, -- JSON array of SpellTag
      
      -- Damage focus (nullable)
      min_damage_focus_type TEXT, -- DamageType enum value
      min_damage_focus_ratio REAL,
      
      -- Power requirements (nullable)
      min_total_power REAL,
      
      -- Evolution chain (nullable)
      requires_named_source_id TEXT, -- NamedSpellId
      
      -- Familiarity requirements (nullable, stored as JSON)
      min_rune_familiarity TEXT, -- JSON object: { RuneCode: number }
      min_total_familiarity_score REAL,
      
      -- Achievement flags (nullable, stored as JSON)
      required_flags TEXT, -- JSON array of AchievementFlag
      
      -- Effects (nullable, stored as JSON array of EffectBlueprint)
      effects TEXT, -- JSON array: [{ type, baseMagnitude, baseDurationSec, self? }]
      
      -- Metadata
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Index for common queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_named_spells_hidden ON named_spells(hidden);
    CREATE INDEX IF NOT EXISTS idx_named_spells_source ON named_spells(requires_named_source_id);
  `);

  // Trigger to update updated_at timestamp
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_named_spells_timestamp
    AFTER UPDATE ON named_spells
    BEGIN
      UPDATE named_spells SET updated_at = datetime('now') WHERE id = NEW.id;
    END
  `);

  // Migration: Add effects column if it doesn't exist
  try {
    db.exec(`ALTER TABLE named_spells ADD COLUMN effects TEXT`);
  } catch (error) {
    // Column already exists, ignore
  }
}

// Close database connection (useful for cleanup)
export function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

