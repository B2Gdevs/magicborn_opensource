// scripts/clear-map-data.ts
// Script to delete all map, region, and environment data from the database
// This keeps other data like characters, creatures, runes, spells, etc.

import { getDatabase } from "../lib/data/spells.db";
import { maps } from "../lib/data/maps.schema";
import { mapRegions } from "../lib/data/mapRegions.schema";
import { environments } from "../lib/data/environments.schema";
import { mapPlacements } from "../lib/data/mapPlacements.schema";
import { sql } from "drizzle-orm";

async function clearMapData() {
  console.log("🗑️  Clearing map, region, and environment data...");
  
  const db = getDatabase();
  
  try {
    // Delete in order to respect foreign key constraints
    // 1. Delete map placements (they reference maps)
    console.log("  Deleting map placements...");
    const placementsDeleted = await db.delete(mapPlacements).execute();
    console.log(`    ✓ Deleted map placements`);
    
    // 2. Delete map regions (they reference maps)
    console.log("  Deleting map regions...");
    const regionsDeleted = await db.delete(mapRegions).execute();
    console.log(`    ✓ Deleted map regions`);
    
    // 3. Delete maps (they reference environments)
    console.log("  Deleting maps...");
    const mapsDeleted = await db.delete(maps).execute();
    console.log(`    ✓ Deleted maps`);
    
    // 4. Delete environments (last, as maps reference them)
    console.log("  Deleting environments...");
    const envsDeleted = await db.delete(environments).execute();
    console.log(`    ✓ Deleted environments`);
    
    console.log("\n✅ Successfully cleared all map, region, and environment data!");
    console.log("   Other data (characters, creatures, runes, spells, etc.) remains intact.");
    
  } catch (error) {
    console.error("❌ Error clearing data:", error);
    process.exit(1);
  }
}

// Run the script
clearMapData()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });


