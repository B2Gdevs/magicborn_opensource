// scripts/init-payload.ts
// Initialize Payload with superuser and default project

import { getPayload } from 'payload'
import config from '../payload.config'

async function initPayload() {
  console.log('Initializing Payload CMS...')
  
  const payload = await getPayload({ config })
  
  try {
    // Check if superuser already exists
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        isSuperuser: {
          equals: true,
        },
      },
      limit: 1,
    })

    if (existingUsers.docs.length > 0) {
      console.log('Superuser already exists. Skipping initialization.')
      process.exit(0)
    }

    // Create superuser
    console.log('Creating superuser...')
    const superuser = await payload.create({
      collection: 'users',
      data: {
        email: 'admin@magicborn.com',
        password: 'admin123', // Change this in production!
        name: 'Super Admin',
        isSuperuser: true,
      },
    })

    console.log(`Superuser created: ${superuser.email}`)

    // Create default project
    console.log('Creating default project...')
    const defaultProject = await payload.create({
      collection: 'projects',
      data: {
        name: 'Default Project',
        description: 'Default project for Magicborn',
        owner: superuser.id,
        magicbornMode: true,
        defaultView: 'grid',
      },
    })

    console.log(`Default project created: ${defaultProject.name} (${defaultProject.id})`)

    // Create project membership
    await payload.create({
      collection: 'projectMembers',
      data: {
        project: defaultProject.id,
        user: superuser.id,
        role: 'owner',
      },
    })

    console.log('Project membership created.')

    console.log('\n✅ Payload initialization complete!')
    console.log(`\nSuperuser credentials:`)
    console.log(`  Email: ${superuser.email}`)
    console.log(`  Password: admin123 (CHANGE THIS IN PRODUCTION!)`)
    console.log(`\nDefault Project ID: ${defaultProject.id}`)
    console.log(`\nYou can now access:`)
    console.log(`  - Payload Admin: http://localhost:3000/admin`)
    console.log(`  - Content Editor: http://localhost:3000/content-editor/${defaultProject.id}`)

    process.exit(0)
  } catch (error) {
    console.error('Error initializing Payload:', error)
    process.exit(1)
  }
}

initPayload()

