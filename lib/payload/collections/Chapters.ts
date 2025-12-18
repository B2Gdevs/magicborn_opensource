// lib/payload/collections/Chapters.ts
// Chapters collection - versioned story chapters

import type { CollectionConfig } from 'payload/types'
import { isSuperuser, buildProjectWhereClause } from '../access/helpers'

export const Chapters: CollectionConfig = {
  slug: 'chapters',
  admin: {
    useAsTitle: 'title',
  },
  versions: {
    drafts: true,
    maxPerDoc: 25,
  },
  access: {
    read: async ({ req }) => {
      if (isSuperuser({ req })) return true
      return await buildProjectWhereClause({ req })
    },
    create: () => true,
    update: async ({ req }) => {
      if (isSuperuser({ req })) return true
      return await buildProjectWhereClause({ req })
    },
    delete: async ({ req }) => {
      if (isSuperuser({ req })) return true
      return await buildProjectWhereClause({ req })
    },
  },
  fields: [
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
    },
    {
      name: 'act',
      type: 'relationship',
      relationTo: 'acts',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
  ],
}

