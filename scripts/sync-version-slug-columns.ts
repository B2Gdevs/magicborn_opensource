// scripts/sync-version-slug-columns.ts
// Ensures Payload version tables include `version_slug` when the base table has `slug`.
//
// This fixes Payload init/migration failures like:
// SQLITE_ERROR: no such column: version_slug (from `_runes_v`, `_effects_v`, etc.)

import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const dbPath = path.resolve(dirname, "..", "data", "payload.db");

console.log("Opening database at:", dbPath);

const db = new Database(dbPath);

function tableExists(name: string) {
  const row = db
    .prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?")
    .get(name);
  return Boolean(row);
}

function getColumns(table: string): Array<{ name: string; type: string }> {
  return db
    .prepare(`PRAGMA table_info(${table})`)
    .all()
    .map((c: any) => ({ name: c.name as string, type: (c.type as string) || "" }));
}

try {
  const baseTables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '\\_%' ESCAPE '\\'")
    .all()
    .map((r: any) => r.name as string);

  const tablesWithSlug = baseTables.filter((t) => {
    try {
      return getColumns(t).some((c) => c.name === "slug");
    } catch {
      return false;
    }
  });

  console.log("Base tables with slug:", tablesWithSlug);

  let alteredCount = 0;
  for (const baseTable of tablesWithSlug) {
    const versionTable = `_${baseTable}_v`;
    if (!tableExists(versionTable)) continue;

    const versionCols = getColumns(versionTable);
    const hasVersionSlug = versionCols.some((c) => c.name === "version_slug");

    if (hasVersionSlug) continue;

    console.log(`Adding version_slug to ${versionTable}...`);
    db.exec(`ALTER TABLE ${versionTable} ADD COLUMN version_slug TEXT;`);
    alteredCount += 1;
  }

  console.log(`\n✅ Done. Added version_slug to ${alteredCount} version table(s).`);
} catch (error) {
  console.error("❌ Migration failed:", error);
  process.exit(1);
} finally {
  db.close();
}





