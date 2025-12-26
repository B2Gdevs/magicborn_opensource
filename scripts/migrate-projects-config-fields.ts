// scripts/migrate-projects-config-fields.ts
// Migration script to add entryTypeConfigs and homepageConfig fields to existing projects
// Run: npx tsx scripts/migrate-projects-config-fields.ts [--dry-run] [--project-id=<id>]

import { getPayload } from 'payload'
import config from '../payload.config'

interface MigrationOptions {
  dryRun: boolean
  projectId?: string
}

async function migrateProjects(options: MigrationOptions = { dryRun: false }) {
  const { dryRun, projectId } = options
  
  console.log('🔄 Migrating Projects Collection...\n')
  
  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be made\n')
  }
  
  const payload = await getPayload({ config })
  
  try {
    // Build query - either specific project or all projects
    const where: any = {}
    if (projectId) {
      where.id = { equals: projectId }
    }
    
    // Fetch projects
    console.log(projectId ? `📋 Fetching project ${projectId}...` : '📋 Fetching all projects...')
    const result = await payload.find({
      collection: 'projects',
      where,
      limit: 1000, // Should be enough for most cases
    })
    
    const projects = result.docs
    console.log(`   Found ${projects.length} project(s)\n`)
    
    if (projects.length === 0) {
      console.log('✅ No projects to migrate.')
      return
    }
    
    let updated = 0
    let skipped = 0
    let errors = 0
    
    // Process each project
    for (const project of projects) {
      const needsUpdate: string[] = []
      const updateData: any = {}
      
      // Check if entryTypeConfigs field exists
      if (!('entryTypeConfigs' in project)) {
        needsUpdate.push('entryTypeConfigs')
        updateData.entryTypeConfigs = null // Explicitly set to null (optional field)
      }
      
      // Check if homepageConfig field exists
      if (!('homepageConfig' in project)) {
        needsUpdate.push('homepageConfig')
        updateData.homepageConfig = null // Explicitly set to null (optional field)
      }
      
      if (needsUpdate.length === 0) {
        console.log(`   ✓ Project "${project.name}" (${project.id}) - already has all fields`)
        skipped++
        continue
      }
      
      // Log what will be updated
      console.log(`   ${dryRun ? '🔍 [DRY RUN]' : '✏️ '} Project "${project.name}" (${project.id})`)
      console.log(`      Adding fields: ${needsUpdate.join(', ')}`)
      
      if (!dryRun) {
        try {
          // Update project with new fields
          await payload.update({
            collection: 'projects',
            id: project.id,
            data: updateData,
          })
          console.log(`      ✅ Updated successfully`)
          updated++
        } catch (error: any) {
          console.error(`      ❌ Error updating: ${error.message || error}`)
          errors++
        }
      } else {
        console.log(`      [Would update with: ${JSON.stringify(updateData)}]`)
        updated++
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(50))
    console.log('📊 Migration Summary:')
    console.log(`   Total projects: ${projects.length}`)
    console.log(`   ${dryRun ? 'Would update' : 'Updated'}: ${updated}`)
    console.log(`   Skipped (already migrated): ${skipped}`)
    if (errors > 0) {
      console.log(`   Errors: ${errors}`)
    }
    console.log('='.repeat(50))
    
    if (dryRun) {
      console.log('\n💡 Run without --dry-run to apply changes')
    } else {
      console.log('\n✅ Migration completed successfully!')
    }
    
  } catch (error: any) {
    console.error('\n❌ Error during migration:', error.message || error)
    process.exit(1)
  }
}

// Parse command line arguments
const args = process.argv.slice(2)
const options: MigrationOptions = {
  dryRun: args.includes('--dry-run'),
}

// Check for specific project ID
const projectIdArg = args.find(arg => arg.startsWith('--project-id='))
if (projectIdArg) {
  options.projectId = projectIdArg.split('=')[1]
}

// Run migration
migrateProjects(options)
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })


