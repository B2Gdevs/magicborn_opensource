// lib/data/spells.db.ts
// Drizzle ORM database setup for named spells and effects

import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import { namedSpells } from "./spells.schema";
import { effectDefinitions } from "./effects.schema";
import { runes } from "./runes.schema";
import { characters } from "./characters.schema";
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
  
  // Include all schemas in the drizzle instance
  dbInstance = drizzle(sqliteInstance, { 
    schema: { namedSpells, effectDefinitions, runes, characters } 
  });
  
  // Initialize schema and indexes
  initializeSchema();
  
  return dbInstance;
}

function initializeSchema() {
  if (!sqliteInstance) return;

  // Create effect_definitions table if it doesn't exist
  sqliteInstance.exec(`
    CREATE TABLE IF NOT EXISTS effect_definitions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      is_buff INTEGER NOT NULL,
      icon_key TEXT,
      blueprint TEXT NOT NULL,
      max_stacks INTEGER,
      image_path TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Create runes table if it doesn't exist
  sqliteInstance.exec(`
    CREATE TABLE IF NOT EXISTS runes (
      code TEXT PRIMARY KEY,
      concept TEXT NOT NULL,
      power_factor REAL NOT NULL,
      control_factor REAL NOT NULL,
      instability_base REAL NOT NULL,
      tags TEXT NOT NULL,
      mana_cost REAL NOT NULL,
      damage TEXT,
      cc_instant TEXT,
      pen TEXT,
      effects TEXT,
      overcharge_effects TEXT,
      dot_affinity REAL,
      image_path TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Create characters table if it doesn't exist
  sqliteInstance.exec(`
    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      mana REAL NOT NULL,
      max_mana REAL NOT NULL,
      hp REAL NOT NULL,
      max_hp REAL NOT NULL,
      affinity TEXT NOT NULL,
      element_xp TEXT,
      element_affinity TEXT,
      effects TEXT NOT NULL,
      control_bonus REAL,
      cost_efficiency REAL,
      image_path TEXT,
      story_ids TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Add image_path column to existing tables if it doesn't exist
  try {
    sqliteInstance.exec(`
      ALTER TABLE named_spells ADD COLUMN image_path TEXT;
    `);
  } catch (e) {
    // Column already exists, ignore
  }

  try {
    sqliteInstance.exec(`
      ALTER TABLE effect_definitions ADD COLUMN image_path TEXT;
    `);
  } catch (e) {
    // Column already exists, ignore
  }

  // Create indexes for named_spells
  sqliteInstance.exec(`
    CREATE INDEX IF NOT EXISTS idx_named_spells_hidden ON named_spells(hidden);
    CREATE INDEX IF NOT EXISTS idx_named_spells_source ON named_spells(requires_named_source_id);
  `);

  // Create indexes for effect_definitions
  sqliteInstance.exec(`
    CREATE INDEX IF NOT EXISTS idx_effect_definitions_category ON effect_definitions(category);
    CREATE INDEX IF NOT EXISTS idx_effect_definitions_is_buff ON effect_definitions(is_buff);
  `);

  // Create indexes for runes
  sqliteInstance.exec(`
    CREATE INDEX IF NOT EXISTS idx_runes_concept ON runes(concept);
  `);

  // Create indexes for characters
  sqliteInstance.exec(`
    CREATE INDEX IF NOT EXISTS idx_characters_name ON characters(name);
  `);

  // Trigger to update updated_at timestamp for named_spells
  sqliteInstance.exec(`
    CREATE TRIGGER IF NOT EXISTS update_named_spells_timestamp
    AFTER UPDATE ON named_spells
    BEGIN
      UPDATE named_spells SET updated_at = datetime('now') WHERE id = NEW.id;
    END
  `);

  // Trigger to update updated_at timestamp for effect_definitions
  sqliteInstance.exec(`
    CREATE TRIGGER IF NOT EXISTS update_effect_definitions_timestamp
    AFTER UPDATE ON effect_definitions
    BEGIN
      UPDATE effect_definitions SET updated_at = datetime('now') WHERE id = NEW.id;
    END
  `);

  // Trigger to update updated_at timestamp for runes
  sqliteInstance.exec(`
    CREATE TRIGGER IF NOT EXISTS update_runes_timestamp
    AFTER UPDATE ON runes
    BEGIN
      UPDATE runes SET updated_at = datetime('now') WHERE code = NEW.code;
    END
  `);

  // Trigger to update updated_at timestamp for characters
  sqliteInstance.exec(`
    CREATE TRIGGER IF NOT EXISTS update_characters_timestamp
    AFTER UPDATE ON characters
    BEGIN
      UPDATE characters SET updated_at = datetime('now') WHERE id = NEW.id;
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

