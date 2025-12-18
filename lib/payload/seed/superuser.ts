// lib/payload/seed/superuser.ts
// Seeds the default superuser account

import type { Payload } from 'payload'
import { Collections, UserRole } from '../constants'

const DEFAULT_SUPERUSER = {
  email: 'admin@magicborn.local',
  password: 'changethis',
  name: 'Admin',
  role: UserRole.Superuser,
  isSuperuser: true, // Legacy field for backwards compatibility
}

/**
 * Seeds the default superuser if it doesn't exist
 */
export async function seedSuperuser(payload: Payload): Promise<void> {
  console.log('Checking for superuser...')

  // Check if superuser already exists
  const existing = await payload.find({
    collection: Collections.Users,
    where: { email: { equals: DEFAULT_SUPERUSER.email } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    console.log('  Superuser already exists, skipping')
    return
  }

  // Create superuser
  await payload.create({
    collection: Collections.Users,
    data: DEFAULT_SUPERUSER,
  })

  console.log(`  Created superuser: ${DEFAULT_SUPERUSER.email}`)
}

