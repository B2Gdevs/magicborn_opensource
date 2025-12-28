# Migration Guide: Projects Config Fields

## Overview

This migration adds two new optional fields to the `Projects` collection:
- `entryTypeConfigs` (JSON) - For overriding entry type display names
- `homepageConfig` (Group) - For overriding homepage settings per project

## Safety & Impact

### ✅ **Non-Breaking**
- Both fields are **optional** (`required: false`)
- Existing code already handles `null`/`undefined` gracefully
- No existing data will be modified or deleted
- Only adds missing fields (sets to `null` if not present)

### ✅ **Backward Compatible**
- Projects without these fields continue to work normally
- Code falls back to defaults when fields are missing
- No breaking changes to existing functionality

### ✅ **Idempotent**
- Safe to run multiple times
- Only updates projects that need updating
- Won't duplicate or overwrite existing data

## Migration Script

**Location:** `scripts/migrate-projects-config-fields.ts`

### Usage

```bash
# Dry run (preview changes without applying)
npx tsx scripts/migrate-projects-config-fields.ts --dry-run

# Migrate all projects
npx tsx scripts/migrate-projects-config-fields.ts

# Migrate specific project (for testing)
npx tsx scripts/migrate-projects-config-fields.ts --project-id=<project-id>

# Dry run for specific project
npx tsx scripts/migrate-projects-config-fields.ts --dry-run --project-id=<project-id>
```

### What It Does

1. **Fetches projects** from Payload CMS
2. **Checks each project** for missing fields:
   - `entryTypeConfigs` - If missing, adds as `null`
   - `homepageConfig` - If missing, adds as `null`
3. **Updates only projects** that need the fields added
4. **Logs detailed information** about what was updated

### Example Output

```
🔄 Migrating Projects Collection...

📋 Fetching all projects...
   Found 3 project(s)

   ✓ Project "Default Project" (1) - already has all fields
   ✏️  Project "My Story" (2)
      Adding fields: entryTypeConfigs, homepageConfig
      ✅ Updated successfully
   ✏️  Project "Test Project" (3)
      Adding fields: entryTypeConfigs
      ✅ Updated successfully

==================================================
📊 Migration Summary:
   Total projects: 3
   Updated: 2
   Skipped (already migrated): 1
==================================================

✅ Migration completed successfully!
```

## Testing Before Migration

### 1. Test on Single Project (Recommended)

```bash
# First, find a project ID
# Then run dry-run on that project
npx tsx scripts/migrate-projects-config-fields.ts --dry-run --project-id=<project-id>

# If looks good, run for real
npx tsx scripts/migrate-projects-config-fields.ts --project-id=<project-id>
```

### 2. Verify in Payload Admin

After migration, check in Payload Admin (`/admin/collections/projects`):
- Projects should show the new fields (even if empty/null)
- Existing project data should be unchanged
- No errors in the admin UI

### 3. Verify in Application

- Content editor should work normally
- Entry type display names should use defaults (since fields are null)
- Homepage should use SiteConfig defaults (since fields are null)

## Rollback

**No rollback needed** - The fields are optional and can be safely ignored.

However, if you want to remove the fields from the schema:
1. Remove fields from `lib/payload/collections/Projects.ts`
2. Regenerate Payload types
3. Fields will remain in DB but won't be accessible (harmless)

## Post-Migration

After migration:
- ✅ All projects have the new fields
- ✅ Admins can now configure entry type display names per project
- ✅ Admins can now configure homepage settings per project
- ✅ Existing functionality continues to work

## Troubleshooting

### Error: "Collection not found"
- Ensure Payload is properly initialized
- Check that `payload.config.ts` is correct

### Error: "Access denied"
- Ensure you're running as superuser or have proper permissions
- Check Payload access control settings

### Projects not updating
- Check logs for specific error messages
- Verify project IDs are correct
- Ensure Payload API is accessible

## Related Files

- **Schema:** `lib/payload/collections/Projects.ts`
- **Migration Script:** `scripts/migrate-projects-config-fields.ts`
- **Helpers:** `lib/content-editor/entry-config.tsx`
- **Hooks:** `lib/content-editor/useProjectConfigs.ts`
- **Types:** `lib/content-editor/entry-type-config-types.ts`



