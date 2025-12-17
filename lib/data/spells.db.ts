// lib/data/spells.db.ts
// Drizzle ORM database setup for named spells and effects
// SERVER-ONLY: This module uses better-sqlite3 which is a native Node.js module

import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import { namedSpells } from "./spells.schema";
import { effectDefinitions } from "./effects.schema";
import { runes } from "./runes.schema";
import { characters } from "./characters.schema";
import { creatures } from "./creatures.schema";
import { environments } from "./environments.schema";
import { maps } from "./maps.schema";
import { mapPlacements } from "./mapPlacements.schema";
import { mapRegions } from "./mapRegions.schema";
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
    schema: { 
      namedSpells, 
      effectDefinitions, 
      runes, 
      characters, 
      creatures,
      environments,
      maps,
      mapPlacements,
      mapRegions,
    } 
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

  // Create creatures table if it doesn't exist
  sqliteInstance.exec(`
    CREATE TABLE IF NOT EXISTS creatures (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      image_path TEXT,
      story_ids TEXT NOT NULL DEFAULT '[]',
      hp REAL NOT NULL,
      max_hp REAL NOT NULL,
      mana REAL NOT NULL,
      max_mana REAL NOT NULL,
      affinity TEXT NOT NULL DEFAULT '{}',
      element_xp TEXT,
      element_affinity TEXT,
      effects TEXT NOT NULL DEFAULT '[]',
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

  // Create indexes for creatures
  sqliteInstance.exec(`
    CREATE INDEX IF NOT EXISTS idx_creatures_name ON creatures(name);
  `);

  // Create environments table if it doesn't exist
  sqliteInstance.exec(`
    CREATE TABLE IF NOT EXISTS environments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      image_path TEXT,
      story_ids TEXT NOT NULL DEFAULT '[]',
      map_ids TEXT NOT NULL DEFAULT '[]',
      metadata TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Create maps table if it doesn't exist
  sqliteInstance.exec(`
    CREATE TABLE IF NOT EXISTS maps (
      id TEXT PRIMARY KEY,
      environment_id TEXT NOT NULL,
      parent_map_id TEXT,
      parent_cell_x REAL,
      parent_cell_y REAL,
      base_region_id TEXT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      image_path TEXT,
      coordinate_config TEXT NOT NULL,
      scene_ids TEXT NOT NULL DEFAULT '[]',
      connections TEXT NOT NULL DEFAULT '[]',
      environmental_modifiers TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Add base_region_id column to maps table if it doesn't exist (for existing databases)
  try {
    sqliteInstance.exec(`
      ALTER TABLE maps ADD COLUMN base_region_id TEXT;
    `);
  } catch (e: any) {
    // Column already exists, ignore
    if (!e.message?.includes("duplicate column") && !e.cause?.message?.includes("duplicate column")) {
      // Re-throw if it's a different error
      throw e;
    }
  }

  // Create map_placements table if it doesn't exist
  sqliteInstance.exec(`
    CREATE TABLE IF NOT EXISTS map_placements (
      id TEXT PRIMARY KEY,
      map_id TEXT NOT NULL,
      type TEXT NOT NULL,
      item_id TEXT NOT NULL,
      coordinates TEXT NOT NULL,
      precision_level TEXT NOT NULL,
      is_landmark TEXT NOT NULL DEFAULT 'false',
      landmark_type TEXT,
      nested_map_id TEXT,
      metadata TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
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

  // Trigger to update updated_at timestamp for creatures
  sqliteInstance.exec(`
    CREATE TRIGGER IF NOT EXISTS update_creatures_timestamp
    AFTER UPDATE ON creatures
    BEGIN
      UPDATE creatures SET updated_at = datetime('now') WHERE id = NEW.id;
    END
  `);

  // Create indexes for environments
  sqliteInstance.exec(`
    CREATE INDEX IF NOT EXISTS idx_environments_name ON environments(name);
  `);

  // Create indexes for maps
  sqliteInstance.exec(`
    CREATE INDEX IF NOT EXISTS idx_maps_environment_id ON maps(environment_id);
    CREATE INDEX IF NOT EXISTS idx_maps_parent_map_id ON maps(parent_map_id);
    CREATE INDEX IF NOT EXISTS idx_maps_name ON maps(name);
  `);

  // Create indexes for map_placements
  sqliteInstance.exec(`
    CREATE INDEX IF NOT EXISTS idx_map_placements_map_id ON map_placements(map_id);
    CREATE INDEX IF NOT EXISTS idx_map_placements_type ON map_placements(type);
    CREATE INDEX IF NOT EXISTS idx_map_placements_is_landmark ON map_placements(is_landmark);
    CREATE INDEX IF NOT EXISTS idx_map_placements_nested_map_id ON map_placements(nested_map_id);
  `);

  // Trigger to update updated_at timestamp for environments
  sqliteInstance.exec(`
    CREATE TRIGGER IF NOT EXISTS update_environments_timestamp
    AFTER UPDATE ON environments
    BEGIN
      UPDATE environments SET updated_at = datetime('now') WHERE id = NEW.id;
    END
  `);

  // Trigger to update updated_at timestamp for maps
  sqliteInstance.exec(`
    CREATE TRIGGER IF NOT EXISTS update_maps_timestamp
    AFTER UPDATE ON maps
    BEGIN
      UPDATE maps SET updated_at = datetime('now') WHERE id = NEW.id;
    END
  `);

  // Trigger to update updated_at timestamp for map_placements
  sqliteInstance.exec(`
    CREATE TRIGGER IF NOT EXISTS update_map_placements_timestamp
    AFTER UPDATE ON map_placements
    BEGIN
      UPDATE map_placements SET updated_at = datetime('now') WHERE id = NEW.id;
    END
  `);

  // Create map_regions table if it doesn't exist
  sqliteInstance.exec(`
    CREATE TABLE IF NOT EXISTS map_regions (
      id TEXT PRIMARY KEY,
      map_id TEXT NOT NULL,
      parent_region_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      min_x TEXT NOT NULL,
      min_y TEXT NOT NULL,
      width TEXT NOT NULL,
      height TEXT NOT NULL,
      nested_map_id TEXT,
      environment_id TEXT,
      color TEXT NOT NULL,
      metadata TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    
    CREATE INDEX IF NOT EXISTS idx_map_regions_map_id ON map_regions(map_id);
    CREATE INDEX IF NOT EXISTS idx_map_regions_nested_map_id ON map_regions(nested_map_id);
    CREATE INDEX IF NOT EXISTS idx_map_regions_environment_id ON map_regions(environment_id);
    
    CREATE TRIGGER IF NOT EXISTS update_map_regions_timestamp
    AFTER UPDATE ON map_regions
    BEGIN
      UPDATE map_regions SET updated_at = datetime('now') WHERE id = NEW.id;
    END
  `);
  
  // Migration: Add parent_region_id column if it doesn't exist (for existing databases)
  // This must happen before creating the index on it
  try {
    sqliteInstance.exec(`ALTER TABLE map_regions ADD COLUMN parent_region_id TEXT;`);
  } catch (e: any) {
    // Column already exists, ignore
    if (!e.message?.includes("duplicate column") && !e.message?.includes("no such column")) {
      // Re-throw if it's a different error
      throw e;
    }
  }
  
  // Migration: Migrate from cells array to square format (minX, minY, width, height)
  // Check if old cells column exists and new columns don't
  try {
    const tableInfo = sqliteInstance.prepare(`PRAGMA table_info(map_regions)`).all() as Array<{ name: string }>;
    const hasCells = tableInfo.some(col => col.name === 'cells');
    const hasMinX = tableInfo.some(col => col.name === 'min_x');
    
    if (hasCells && !hasMinX) {
      console.log('Migrating map_regions from cells array to square format...');
      // Add new columns
      sqliteInstance.exec(`
        ALTER TABLE map_regions ADD COLUMN min_x TEXT;
        ALTER TABLE map_regions ADD COLUMN min_y TEXT;
        ALTER TABLE map_regions ADD COLUMN width TEXT;
        ALTER TABLE map_regions ADD COLUMN height TEXT;
      `);
      
      // Migrate data: convert cells array to square bounds
      const regions = sqliteInstance.prepare(`SELECT id, cells FROM map_regions WHERE cells IS NOT NULL`).all() as Array<{ id: string; cells: string }>;
      for (const region of regions) {
        try {
          const cells = JSON.parse(region.cells) as Array<{ cellX: number; cellY: number }>;
          if (cells.length > 0) {
            const xs = cells.map(c => c.cellX);
            const ys = cells.map(c => c.cellY);
            const minX = Math.min(...xs);
            const minY = Math.min(...ys);
            const maxX = Math.max(...xs);
            const maxY = Math.max(...ys);
            const width = maxX - minX + 1;
            const height = maxY - minY + 1;
            // Make it a square (use larger dimension)
            const size = Math.max(width, height);
            
            sqliteInstance.prepare(`
              UPDATE map_regions 
              SET min_x = ?, min_y = ?, width = ?, height = ?
              WHERE id = ?
            `).run(minX.toString(), minY.toString(), size.toString(), size.toString(), region.id);
          }
        } catch (e) {
          console.error(`Failed to migrate region ${region.id}:`, e);
        }
      }
      
      // Note: We don't drop the cells column to allow rollback if needed
      console.log('Migration complete. Old cells column preserved for rollback.');
    }
  } catch (e: any) {
    // Migration failed, but continue
    console.error('Migration error (non-fatal):', e);
  }
  
  // Create index on parent_region_id after ensuring the column exists
  try {
    sqliteInstance.exec(`CREATE INDEX IF NOT EXISTS idx_map_regions_parent_region_id ON map_regions(parent_region_id);`);
  } catch (e: any) {
    // Index might already exist or column might not exist yet, ignore
    if (!e.message?.includes("no such column")) {
      throw e;
    }
  }
}

// Close database connection (useful for cleanup)
export function closeDatabase() {
  if (sqliteInstance) {
    sqliteInstance.close();
    sqliteInstance = null;
    dbInstance = null;
  }
}

