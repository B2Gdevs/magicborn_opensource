// scripts/add-slug-columns.ts
// Add missing slug columns to runes and effects tables

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const dbPath = path.resolve(dirname, '..', 'data', 'payload.db');

console.log('Opening database at:', dbPath);

const db = new Database(dbPath);

try {
  // Check if columns exist
  const runesInfo = db.prepare("PRAGMA table_info(runes)").all() as Array<{ name: string }>;
  const effectsInfo = db.prepare("PRAGMA table_info(effects)").all() as Array<{ name: string }>;
  
  const runesHasSlug = runesInfo.some(col => col.name === 'slug');
  const effectsHasSlug = effectsInfo.some(col => col.name === 'slug');
  
  console.log('Runes table has slug column:', runesHasSlug);
  console.log('Effects table has slug column:', effectsHasSlug);
  
  // Add slug column to runes if missing
  if (!runesHasSlug) {
    console.log('Adding slug column to runes table...');
    db.exec(`
      ALTER TABLE runes ADD COLUMN slug TEXT;
      CREATE UNIQUE INDEX IF NOT EXISTS runes_slug_unique ON runes(slug);
    `);
    console.log('✓ Added slug column to runes');
  } else {
    console.log('✓ Runes table already has slug column');
  }
  
  // Add slug column to effects if missing
  if (!effectsHasSlug) {
    console.log('Adding slug column to effects table...');
    db.exec(`
      ALTER TABLE effects ADD COLUMN slug TEXT;
      CREATE UNIQUE INDEX IF NOT EXISTS effects_slug_unique ON effects(slug);
    `);
    console.log('✓ Added slug column to effects');
  } else {
    console.log('✓ Effects table already has slug column');
  }
  
  console.log('\n✅ Migration complete!');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  db.close();
}

