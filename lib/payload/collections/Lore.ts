// lib/payload/collections/Lore.ts
// Lore entries - publishable world-building content

import type { CollectionConfig } from 'payload'
import { Collections, LORE_CATEGORY_OPTIONS } from '../constants'
import { isSuperuser, isEditorOrAbove, publicReadWithFlag } from '../access/roles'

export const Lore: CollectionConfig = {
  slug: Collections.Lore,
  admin: {
    useAsTitle: 'title',
    group: 'Content',
  },
  versions: {
    drafts: true,
    maxPerDoc: 25,
  },
  access: {
    read: publicReadWithFlag,
    create: isEditorOrAbove,
    update: isEditorOrAbove,
    delete: isSuperuser,
  },
  fields: [
    {
      name: 'project',
      type: 'relationship',
      relationTo: Collections.Projects,
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: {
        description: 'URL-friendly identifier for public pages',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: LORE_CATEGORY_OPTIONS as any,
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short summary for previews',
      },
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Show on public website when published',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: Collections.Media,
    },
    // Relationships
    {
      name: 'relatedCharacters',
      type: 'relationship',
      relationTo: Collections.Characters,
      hasMany: true,
    },
    {
      name: 'relatedLocations',
      type: 'relationship',
      relationTo: Collections.Locations,
      hasMany: true,
    },
    {
      name: 'relatedLore',
      type: 'relationship',
      relationTo: Collections.Lore,
      hasMany: true,
      admin: {
        description: 'Related lore entries',
      },
    },
    // SEO
    {
      type: 'group',
      name: 'seo',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
        },
        {
          name: 'metaDescription',
          type: 'textarea',
        },
      ],
    },
  ],
}

