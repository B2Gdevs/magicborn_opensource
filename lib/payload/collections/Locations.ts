// lib/payload/collections/Locations.ts
// Locations/Places in the world

import type { CollectionConfig } from 'payload'
import { Collections } from '../constants'
import { isSuperuser, isEditorOrAbove, publicReadWithFlag } from '../access/roles'

export const Locations: CollectionConfig = {
  slug: Collections.Locations,
  admin: {
    useAsTitle: 'name',
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
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
    },
    {
      name: 'locationType',
      type: 'select',
      options: [
        { label: 'Region', value: 'region' },
        { label: 'City', value: 'city' },
        { label: 'Town', value: 'town' },
        { label: 'Village', value: 'village' },
        { label: 'Dungeon', value: 'dungeon' },
        { label: 'Landmark', value: 'landmark' },
        { label: 'Building', value: 'building' },
      ],
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'excerpt',
      type: 'textarea',
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: Collections.Media,
    },
    {
      name: 'parentLocation',
      type: 'relationship',
      relationTo: Collections.Locations,
      admin: {
        description: 'Parent region/area this location belongs to',
      },
    },
    {
      name: 'relatedCharacters',
      type: 'relationship',
      relationTo: Collections.Characters,
      hasMany: true,
    },
  ],
}

