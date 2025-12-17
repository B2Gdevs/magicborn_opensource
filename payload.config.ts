import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

// Import collections
import { Users } from './lib/payload/collections/Users'
import { Projects } from './lib/payload/collections/Projects'
import { ProjectMembers } from './lib/payload/collections/ProjectMembers'
import { Characters } from './lib/payload/collections/Characters'
import { Media } from './lib/payload/collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    // Keep admin UI available at /admin for debugging
    // We'll build custom UI at /content-editor
  },
  collections: [
    Users,
    Projects,
    ProjectMembers,
    Characters,
    Media,
  ],
  globals: [
    // Globals will be added later (e.g., siteConfig for Developer Tools)
  ],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key-change-in-production',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: `file:${path.resolve(dirname, 'data', 'payload.db')}`,
    },
  }),
  // Custom server routes
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  // Enable CORS for API access
  cors: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  ],
})

