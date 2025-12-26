// lib/payload/collections/Characters.ts
// Characters collection - tenant-scoped with versions/drafts

import type { CollectionConfig } from 'payload/types'
import { isSuperuser, buildProjectWhereClause } from '../access/helpers'
import { Collections, CharacterFields } from '../constants'
// Removed autoGenerateSlugHook import - IDs are now server-generated

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
  // Removed auto-generation hook - IDs are now server-generated
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
      required: false,
      admin: {
        description: 'Optional URL-friendly identifier. Leave empty for server-generated ID.',
      },
      validate: (value: string) => {
        // Only validate format if provided, but allow empty (will be server-generated)
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
    {
      name: 'aiContextPrompt',
      type: 'textarea',
      label: 'Character AI Context',
      admin: {
        description: 'Context about this character that the AI should consider when generating content involving them. Include personality, background, relationships, and key traits.',
        placeholder: 'Kael is a reserved mage with a deep connection to fire magic. He struggles with controlling his power and often acts impulsively...',
      },
      required: false,
    },
  ],
}

