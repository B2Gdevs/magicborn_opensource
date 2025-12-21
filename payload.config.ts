import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

// Collections - Core
import { Users } from './lib/payload/collections/Users'
import { Projects } from './lib/payload/collections/Projects'
import { ProjectMembers } from './lib/payload/collections/ProjectMembers'
import { Media } from './lib/payload/collections/Media'

// Collections - Story Structure
import { Acts } from './lib/payload/collections/Acts'
import { Chapters } from './lib/payload/collections/Chapters'
import { Scenes } from './lib/payload/collections/Scenes'

// Collections - Content
import { Characters } from './lib/payload/collections/Characters'
import { Lore } from './lib/payload/collections/Lore'
import { Locations } from './lib/payload/collections/Locations'
import { StyleGuideEntries } from './lib/payload/collections/StyleGuideEntries'

// Collections - Game Data (Magicborn-specific)
import { Effects } from './lib/payload/collections/Effects'
import { Spells } from './lib/payload/collections/Spells'
import { Runes } from './lib/payload/collections/Runes'
import { Objects } from './lib/payload/collections/Objects'
import { Creatures } from './lib/payload/collections/Creatures'

// Collections - System
import { ProjectSnapshots } from './lib/payload/collections/ProjectSnapshots'
import { AIGenerations } from './lib/payload/collections/AIGenerations'

// Globals
import { SiteConfig } from './lib/payload/globals/SiteConfig'
import { SidebarConfig } from './lib/payload/globals/SidebarConfig'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
  },
  collections: [
    // Core
    Users,
    Projects,
    ProjectMembers,
    Media,
    // Story Structure
    Acts,
    Chapters,
    Scenes,
    // Content
    Characters,
    Lore,
    Locations,
    StyleGuideEntries,
    // Game Data
    Effects,
    Spells,
    Runes,
    Objects,
    Creatures,
    // System
    ProjectSnapshots,
    AIGenerations,
  ],
  globals: [
    SiteConfig,
    SidebarConfig,
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
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  cors: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  ],
})
