// lib/payload/collections/Projects.ts
// Projects collection - the tenant boundary for content

import type { CollectionConfig } from 'payload/types'
import { isSuperuser, getAccessibleProjectIds } from '../access/helpers'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'name',
  },
  versions: {
    drafts: true,
  },
  access: {
    read: async ({ req }) => {
      if (isSuperuser({ req })) {
        return true
      }
      const accessibleProjectIds = await getAccessibleProjectIds({ req })
      return {
        id: {
          in: accessibleProjectIds,
        },
      }
    },
    create: ({ req }) => {
      // Superusers can create projects
      // Regular users can create projects (they become owner)
      return true
    },
    update: async ({ req }) => {
      if (isSuperuser({ req })) {
        return true
      }
      // Users can update projects they own or are admin of
      const accessibleProjectIds = await getAccessibleProjectIds({ req })
      return {
        id: {
          in: accessibleProjectIds,
        },
      }
    },
    delete: ({ req }) => isSuperuser({ req }), // Only superusers can delete projects
  },
  fields: [
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
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: false, // Optional for now - single superuser mode
    },
    {
      name: 'magicbornMode',
      type: 'checkbox',
      label: 'Enable Magicborn Game Systems',
      defaultValue: false,
      admin: {
        description: 'When enabled, Spells, Runes, Effects, and Combat Stats become available.',
      },
    },
    {
      name: 'defaultView',
      type: 'select',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'Matrix', value: 'matrix' },
        { label: 'Outline', value: 'outline' },
      ],
      defaultValue: 'grid',
    },
  ],
}

