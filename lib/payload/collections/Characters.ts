// lib/payload/collections/Characters.ts
// Characters collection - tenant-scoped with versions/drafts

import type { CollectionConfig } from 'payload/types'
import { isSuperuser, buildProjectWhereClause } from '../access/helpers'
import { Collections, CharacterFields } from '../constants'
import { autoGenerateSlugHook } from '../utils/slugGeneration'

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
  hooks: {
    beforeChange: [
      autoGenerateSlugHook(CharacterFields.Slug, CharacterFields.Name),
    ],
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
      unique: true,
      admin: {
        description: 'Auto-generated unique identifier (e.g., "kael", "morgana"). Generated from name if not provided.',
      },
      validate: (value: string) => {
        // Only validate format if provided, but allow empty (will be auto-generated)
        if (value && value.trim() && !/^[a-z0-9_-]+$/.test(value)) {
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
    {
      name: 'landmarkIcon',
      type: 'upload',
      relationTo: Collections.Media,
      required: false,
      admin: {
        description: 'Icon/image for map display or UI representation',
      },
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

