// lib/payload/collections/Users.ts
// Users collection with authentication and superuser support

import type { CollectionConfig } from 'payload/types'
import { isSuperuser } from '../access/helpers'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  access: {
    // Only superusers can read all users
    read: ({ req }) => {
      if (isSuperuser({ req })) {
        return true
      }
      // Users can read their own data
      return {
        id: {
          equals: req.user?.id,
        },
      }
    },
    // Only superusers can create users (for now)
    create: ({ req }) => isSuperuser({ req }),
    // Users can update themselves, superusers can update anyone
    update: ({ req }) => {
      if (isSuperuser({ req })) {
        return true
      }
      return {
        id: {
          equals: req.user?.id,
        },
      }
    },
    // Only superusers can delete users
    delete: ({ req }) => isSuperuser({ req }),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: false,
    },
    {
      name: 'isSuperuser',
      type: 'checkbox',
      label: 'Superuser',
      defaultValue: false,
      access: {
        // Only superusers can see/edit this field
        read: ({ req }) => isSuperuser({ req }),
        update: ({ req }) => isSuperuser({ req }),
      },
    },
  ],
}

