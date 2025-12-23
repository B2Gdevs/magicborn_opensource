// lib/payload/collections/Acts.ts
// Acts collection - versioned story acts

import type { CollectionConfig } from 'payload/types'
import { isSuperuser, buildProjectWhereClause } from '../access/helpers'

export const Acts: CollectionConfig = {
  slug: 'acts',
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
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'aiContextPrompt',
      type: 'textarea',
      label: 'Act Context Prompt',
      admin: {
        description: 'Context about this act that the AI should consider when generating content. This helps maintain narrative consistency within the act.',
        placeholder: 'This act focuses on the discovery of ancient magic and the protagonist\'s first encounter with the elemental forces...',
      },
      required: false,
    },
  ],
}


