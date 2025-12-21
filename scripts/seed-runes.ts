// scripts/seed-runes.ts
// Run: npx tsx scripts/seed-runes.ts [projectId]
// Example: npx tsx scripts/seed-runes.ts 1

import { getPayload } from 'payload'
import config from '../payload.config'
import { seedRunes } from '../lib/payload/seed/gameData'

async function seed() {
  const projectId = process.argv[2] ? parseInt(process.argv[2], 10) : 1

  if (isNaN(projectId)) {
    console.error('Invalid project ID. Usage: npx tsx scripts/seed-runes.ts [projectId]')
    process.exit(1)
  }

  console.log(`=== Seeding Runes for Project ${projectId} ===\n`)

  const payload = await getPayload({ config })

  await seedRunes(payload, projectId)

  console.log('\n=== Runes Seeding Complete ===')
  process.exit(0)
}

seed().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})


