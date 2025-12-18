// lib/payload/collections/Users.ts
// Users collection with authentication and role-based access

import type { CollectionConfig } from 'payload'
import { Collections, USER_ROLE_OPTIONS, UserRole } from '../constants'
import { isSuperuser } from '../access/roles'

export const Users: CollectionConfig = {
  slug: Collections.Users,
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'System',
  },
  access: {
    read: ({ req }) => {
      if (isSuperuser({ req })) {
        return true
      }
      // Users can read their own data
      return {
        id: { equals: req.user?.id },
      }
    },
    create: isSuperuser,
    update: ({ req }) => {
      if (isSuperuser({ req })) {
        return true
      }
      return {
        id: { equals: req.user?.id },
      }
    },
    delete: isSuperuser,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      options: USER_ROLE_OPTIONS as any,
      defaultValue: UserRole.Contributor,
      required: true,
      access: {
        // Only superusers can change roles
        update: isSuperuser,
      },
    },
    // Legacy field - keep for backwards compatibility
    {
      name: 'isSuperuser',
      type: 'checkbox',
      label: 'Legacy Superuser Flag',
      defaultValue: false,
      admin: {
        description: 'Deprecated - use role field instead',
        hidden: true,
      },
      access: {
        read: isSuperuser,
        update: isSuperuser,
      },
    },
  ],
}
