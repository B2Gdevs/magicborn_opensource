// lib/payload/collections/ProjectSnapshots.ts
// Project-level snapshots - captures entire project state at a point in time

import type { CollectionConfig } from 'payload/types'
import { isSuperuser, buildProjectWhereClause } from '../access/helpers'

export const ProjectSnapshots: CollectionConfig = {
  slug: 'project-snapshots',
  admin: {
    useAsTitle: 'name',
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
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Checkpoint', value: 'checkpoint' },
      ],
      defaultValue: 'checkpoint',
      required: true,
    },
    {
      name: 'snapshot',
      type: 'json',
      required: true,
      admin: {
        description: 'JSON snapshot of all project content (acts, chapters, scenes, characters, etc.)',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
    },
  ],
}





