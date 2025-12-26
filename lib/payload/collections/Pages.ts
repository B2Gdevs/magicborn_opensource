// lib/payload/collections/Pages.ts
// Pages collection - versioned story pages

import type { CollectionConfig } from 'payload/types'
import { isSuperuser, buildProjectWhereClause } from '../access/helpers'

export const Pages: CollectionConfig = {
  slug: 'pages',
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
      name: 'content',
      type: 'json',
      admin: {
        description: 'BlockNote editor content (JSON format)',
      },
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
      name: 'pageNumber',
      type: 'number',
      label: 'Page Number',
      admin: {
        description: 'The sequential number of the page within its chapter.',
      },
      required: false,
    },
    {
      name: 'aiContextPrompt',
      type: 'textarea',
      label: 'Page Context Prompt',
      admin: {
        description: 'Specific context for this page that the AI should consider when generating or editing content. This helps maintain scene continuity.',
        placeholder: 'This page takes place in the ancient library. The mood is tense as the protagonist searches for forbidden knowledge...',
      },
      required: false,
    },
  ],
}

