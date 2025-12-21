// scripts/migrate-region-parent-ids.ts
// Migration script to set parent_region_id for regions that should have a parent
// Specifically sets "tet" region's parent to "world_region-region"

import { getDatabase } from "../lib/data/spells.db";
import { getRegionById, updateRegion } from "../lib/data/mapRegionsRepository";
import { sql } from "drizzle-orm";

async function migrateRegionParentIds() {
  console.log("🔄 Migrating region parent IDs...");
  
  const db = getDatabase();
  
  try {
    // First, ensure the parent_region_id column exists
    try {
      await db.run(sql`ALTER TABLE map_regions ADD COLUMN parent_region_id TEXT;`);
      console.log("  ✓ Added parent_region_id column");
    } catch (e: any) {
      if (e.message?.includes("duplicate column") || e.cause?.message?.includes("duplicate column")) {
        console.log("  ✓ parent_region_id column already exists");
      } else {
        throw e;
      }
    }
    
    // Get the "tet" region
    const tetRegion = await getRegionById("region-1765380377118");
    if (!tetRegion) {
      console.log("  ⚠️  Region 'region-1765380377118' (tet) not found");
      return;
    }
    
    // Get the parent region (world_region-region)
    const parentRegion = await getRegionById("world_region-region");
    if (!parentRegion) {
      console.log("  ⚠️  Parent region 'world_region-region' not found");
      return;
    }
    
    // Update tet region with parent_region_id
    if (tetRegion.parentRegionId !== parentRegion.id) {
      const updatedRegion = {
        ...tetRegion,
        parentRegionId: parentRegion.id,
      };
      
      await updateRegion(updatedRegion);
      console.log(`  ✓ Set parent_region_id for '${tetRegion.name}' (${tetRegion.id}) to '${parentRegion.name}' (${parentRegion.id})`);
    } else {
      console.log(`  ✓ '${tetRegion.name}' already has correct parent_region_id`);
    }
    
    console.log("\n✅ Migration completed successfully!");
    
  } catch (error) {
    console.error("❌ Error during migration:", error);
    process.exit(1);
  }
}

// Run the migration
migrateRegionParentIds()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });



