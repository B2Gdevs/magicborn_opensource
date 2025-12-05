// scripts/migrate-spells-to-db.ts
// Migration script to move existing spells from TypeScript to SQLite database

import { NAMED_SPELL_BLUEPRINTS } from "../lib/data/namedSpells";
import { getSpellsRepository } from "../lib/data/spellsRepository";

async function migrate() {
  console.log("Starting migration of spells to database...");

  const repo = getSpellsRepository();
  const existingSpells = NAMED_SPELL_BLUEPRINTS;

  let created = 0;
  let skipped = 0;

  for (const spell of existingSpells) {
    if (repo.exists(spell.id)) {
      console.log(`Skipping ${spell.id} (already exists)`);
      skipped++;
      continue;
    }

    try {
      repo.create(spell);
      console.log(`Created: ${spell.name} (${spell.id})`);
      created++;
    } catch (error) {
      console.error(`Failed to create ${spell.id}:`, error);
    }
  }

  console.log(`\nMigration complete!`);
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total in database: ${repo.listAll().length}`);
}

// Run migration
migrate().catch(console.error);

