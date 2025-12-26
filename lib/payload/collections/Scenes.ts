// lib/payload/collections/Scenes.ts
// Scenes collection - versioned story scenes

import type { CollectionConfig } from 'payload/types'
import { isSuperuser, buildProjectWhereClause } from '../access/helpers'

export const Scenes: CollectionConfig = {
  slug: 'scenes',
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
      name: 'chapter',
      type: 'relationship',
      relationTo: 'chapters',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'summary',
      type: 'textarea',
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'codexRefs',
      type: 'array',
      fields: [
        {
          name: 'type',
          type: 'select',
          options: ['character', 'location', 'object', 'lore'],
        },
        {
          name: 'refId',
          type: 'text',
        },
        {
          name: 'label',
          type: 'text',
        },
      ],
    },
    {
      name: 'labels',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
        },
      ],
    },
  ],
}





