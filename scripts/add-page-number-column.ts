// scripts/add-page-number-column.ts
// Migration script to add page_number column to pages table

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '..', 'data', 'payload.db');

console.log('Opening database at:', dbPath);

const db = new Database(dbPath);

try {
  // Check if column exists
  const pagesInfo = db.prepare("PRAGMA table_info(pages)").all() as Array<{ name: string }>;
  
  const pagesHasPageNumber = pagesInfo.some(col => col.name === 'page_number');
  
  console.log('Pages table has page_number column:', pagesHasPageNumber);
  
  // Add page_number column to pages if missing
  if (!pagesHasPageNumber) {
    console.log('Adding page_number column to pages table...');
    db.exec(`
      ALTER TABLE pages ADD COLUMN page_number INTEGER;
    `);
    console.log('✓ Added page_number column to pages');
  } else {
    console.log('✓ Pages table already has page_number column');
  }
  
  console.log('\n✅ Migration complete!');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  db.close();
}




