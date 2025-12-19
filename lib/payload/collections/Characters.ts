// lib/payload/collections/Characters.ts
// Characters collection - tenant-scoped with versions/drafts

import type { CollectionConfig } from 'payload/types'
import { isSuperuser, buildProjectWhereClause } from '../access/helpers'
import { Collections, CharacterFields } from '../constants'

export const Characters: CollectionConfig = {
  slug: Collections.Characters,
  admin: {
    useAsTitle: CharacterFields.Name,
  },
  versions: {
    drafts: true,
  },
  access: {
    read: async ({ req }) => {
      if (isSuperuser({ req })) {
        return true
      }
      return await buildProjectWhereClause({ req })
    },
    create: ({ req }) => {
      // Users can create characters in projects they have access to
      return true
    },
    update: async ({ req }) => {
      if (isSuperuser({ req })) {
        return true
      }
      return await buildProjectWhereClause({ req })
    },
    delete: async ({ req }) => {
      if (isSuperuser({ req })) {
        return true
      }
      return await buildProjectWhereClause({ req })
    },
  },
  fields: [
    {
      name: CharacterFields.Project,
      type: 'relationship',
      relationTo: Collections.Projects,
      required: true,
    },
    {
      name: CharacterFields.Slug,
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique identifier for this character (e.g., "kael", "morgana")',
      },
      validate: (value: string) => {
        if (!value || !value.trim()) {
          return 'Slug is required'
        }
        // Only lowercase letters, numbers, underscores, and hyphens
        if (!/^[a-z0-9_-]+$/.test(value)) {
          return 'Slug must contain only lowercase letters, numbers, underscores, and hyphens'
        }
        return true
      },
    },
    {
      name: CharacterFields.Name,
      type: 'text',
      required: true,
    },
    {
      name: CharacterFields.Description,
      type: 'textarea',
      required: false,
    },
    {
      name: CharacterFields.Image,
      type: 'upload',
      relationTo: Collections.Media,
      required: false,
    },
    // Magicborn-specific fields (only shown when project.magicbornMode is true)
    {
      name: CharacterFields.CombatStats,
      type: 'json',
      required: false,
      admin: {
        description: 'Combat stats (only visible when Magicborn Mode is enabled)',
      },
    },
    {
      name: CharacterFields.RuneFamiliarity,
      type: 'json',
      required: false,
      admin: {
        description: 'Rune familiarity data (only visible when Magicborn Mode is enabled)',
      },
    },
  ],
}

