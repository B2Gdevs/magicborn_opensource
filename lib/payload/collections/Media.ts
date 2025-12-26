// lib/payload/collections/Media.ts
// Media collection for file uploads (images, videos, etc.)

import type { CollectionConfig } from 'payload/types'
import { isSuperuser } from '../access/helpers'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'media',
    staticURL: '/media',
    mimeTypes: ['image/*', 'video/*'],
  },
  access: {
    read: () => true, // Media is publicly readable
    create: ({ req }) => {
      // Authenticated users can upload
      return !!req.user
    },
    update: ({ req }) => {
      if (isSuperuser({ req })) {
        return true
      }
      // Users can update their own uploads
      return {
        createdBy: {
          equals: req.user?.id,
        },
      }
    },
    delete: ({ req }) => {
      if (isSuperuser({ req })) {
        return true
      }
      return {
        createdBy: {
          equals: req.user?.id,
        },
      }
    },
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
    },
  ],
}

