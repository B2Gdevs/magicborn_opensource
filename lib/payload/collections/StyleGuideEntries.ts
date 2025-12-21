// lib/payload/collections/StyleGuideEntries.ts
// Style guide - character concepts, environment art, design docs

import type { CollectionConfig } from 'payload'
import { Collections, STYLE_GUIDE_CATEGORY_OPTIONS } from '../constants'
import { isSuperuser, isEditorOrAbove, publicReadWithFlag } from '../access/roles'

export const StyleGuideEntries: CollectionConfig = {
  slug: Collections.StyleGuideEntries,
  admin: {
    useAsTitle: 'title',
    group: 'Content',
  },
  versions: {
    drafts: true,
    maxPerDoc: 15,
  },
  access: {
    read: publicReadWithFlag,
    create: isEditorOrAbove,
    update: isEditorOrAbove,
    delete: isSuperuser,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      options: STYLE_GUIDE_CATEGORY_OPTIONS as any,
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'images',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: Collections.Media,
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
        },
        {
          name: 'altText',
          type: 'text',
        },
      ],
    },
    {
      name: 'relatedCharacter',
      type: 'relationship',
      relationTo: Collections.Characters,
      admin: {
        description: 'If this is a character concept',
      },
    },
    {
      name: 'relatedLocation',
      type: 'relationship',
      relationTo: Collections.Locations,
      admin: {
        description: 'If this is environment art',
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
  ],
}


