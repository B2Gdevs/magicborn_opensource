// lib/payload/collections/ProjectMembers.ts
// Project memberships - links users to projects with roles

import type { CollectionConfig } from 'payload/types'
import { isSuperuser, getAccessibleProjectIds } from '../access/helpers'

export const ProjectMembers: CollectionConfig = {
  slug: 'projectMembers',
  admin: {
    useAsTitle: 'id',
  },
  access: {
    read: async ({ req }) => {
      if (isSuperuser({ req })) {
        return true
      }
      const accessibleProjectIds = await getAccessibleProjectIds({ req })
      return {
        project: {
          in: accessibleProjectIds,
        },
      }
    },
    create: ({ req }) => {
      // Superusers can create memberships
      // Project owners/admins can add members
      return true // Simplified for now - can add more logic later
    },
    update: async ({ req }) => {
      if (isSuperuser({ req })) {
        return true
      }
      const accessibleProjectIds = await getAccessibleProjectIds({ req })
      return {
        project: {
          in: accessibleProjectIds,
        },
      }
    },
    delete: async ({ req }) => {
      if (isSuperuser({ req })) {
        return true
      }
      const accessibleProjectIds = await getAccessibleProjectIds({ req })
      return {
        project: {
          in: accessibleProjectIds,
        },
      }
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
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Owner', value: 'owner' },
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Viewer', value: 'viewer' },
      ],
      defaultValue: 'editor',
      required: true,
    },
  ],
  // Ensure unique (project, user) pairs
  indexes: [
    {
      fields: ['project', 'user'],
      unique: true,
    },
  ],
}



