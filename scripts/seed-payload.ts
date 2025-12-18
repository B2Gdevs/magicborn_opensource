// scripts/seed-payload.ts
// Run: npx tsx scripts/seed-payload.ts

import { getPayload } from 'payload'
import config from '../payload.config'
import { seedSuperuser } from '../lib/payload/seed/superuser'
import { seedGameData } from '../lib/payload/seed/gameData'
import { seedSiteConfig } from '../lib/payload/seed/siteConfig'

async function seed() {
  console.log('=== Payload Seed Script ===\n')

  const payload = await getPayload({ config })

  // Seed superuser first
  await seedSuperuser(payload)

  // Seed site configuration
  await seedSiteConfig(payload)

  // Seed game data (effects, spells)
  await seedGameData(payload)

  console.log('\n=== Seeding Complete ===')
  process.exit(0)
}

seed().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})

