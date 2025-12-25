// scripts/init-pages-table.ts
// Force Payload to initialize the Pages table by connecting to the database

import { getPayload } from 'payload'
import config from '../payload.config'

async function initPagesTable() {
  console.log('Initializing Pages table...')
  
  try {
    const payload = await getPayload({ config })
    
    // Just try to query the pages collection - this will create the table if it doesn't exist
    await payload.find({
      collection: 'pages',
      limit: 1,
    })
    
    console.log('✅ Pages table initialized successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error initializing Pages table:', error)
    process.exit(1)
  }
}

initPagesTable()



