// lib/payload/collections/Creatures.ts
// Creatures collection - similar to Characters but for non-player entities

import type { CollectionConfig } from 'payload/types'
import { isSuperuser, buildProjectWhereClause } from '../access/helpers'
import { Collections } from '../constants'
// Removed autoGenerateSlugHook import - IDs are now server-generated

export const Creatures: CollectionConfig = {
  slug: Collections.Creatures,
  admin: {
    useAsTitle: 'name',
    group: 'Game Data',
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
      name: 'project',
      type: 'relationship',
      relationTo: Collections.Projects,
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      required: false,
      admin: {
        description: 'Optional URL-friendly identifier. Leave empty for server-generated ID.',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
    },
    {
      name: 'image',
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
    // Combat stats (similar to Characters)
    {
      name: 'combatStats',
      type: 'json',
      required: false,
      admin: {
        description: 'Combat stats (HP, Mana, etc.)',
      },
    },
    {
      name: 'runeFamiliarity',
      type: 'json',
      required: false,
      admin: {
        description: 'Rune familiarity data (only visible when Magicborn Mode is enabled)',
      },
    },
    {
      name: 'elementXp',
      type: 'json',
      required: false,
      admin: {
        description: 'Element XP data (only visible when Magicborn Mode is enabled)',
      },
    },
    {
      name: 'elementAffinity',
      type: 'json',
      required: false,
      admin: {
        description: 'Element affinity data (only visible when Magicborn Mode is enabled)',
      },
    },
  ],
}

