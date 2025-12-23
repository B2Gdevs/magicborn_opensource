// lib/payload/collections/Locations.ts
// Locations/Places in the world

import type { CollectionConfig } from 'payload'
import { Collections } from '../constants'
import { isSuperuser, isEditorOrAbove, publicReadWithFlag } from '../access/roles'
import { autoGenerateSlugHook } from '../utils/slugGeneration'

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
  hooks: {
    beforeChange: [
      autoGenerateSlugHook('slug', 'name'),
    ],
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
      admin: {
        description: 'Auto-generated unique identifier. Generated from name if not provided.',
      },
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
        description: 'Parent region/area this location belongs to (for hierarchical nesting)',
      },
    },
    {
      name: 'level',
      type: 'number',
      admin: {
        description: 'Hierarchy level (0 = world, 1 = continent, 2 = region, etc.)',
      },
      defaultValue: 0,
    },
    // Grid cell coordinates for map placement
    {
      name: 'gridCells',
      type: 'group',
      fields: [
        {
          name: 'minX',
          type: 'number',
          admin: {
            description: 'Left edge cell coordinate (0-7 for 8x8 grid)',
          },
          validate: (value: number) => {
            if (value !== undefined && (value < 0 || value > 7)) {
              return 'Cell X must be between 0 and 7';
            }
            return true;
          },
        },
        {
          name: 'minY',
          type: 'number',
          admin: {
            description: 'Top edge cell coordinate (0-7 for 8x8 grid)',
          },
          validate: (value: number) => {
            if (value !== undefined && (value < 0 || value > 7)) {
              return 'Cell Y must be between 0 and 7';
            }
            return true;
          },
        },
        {
          name: 'width',
          type: 'number',
          admin: {
            description: 'Width in cells (1-8)',
          },
          validate: (value: number) => {
            if (value !== undefined && (value < 1 || value > 8)) {
              return 'Width must be between 1 and 8';
            }
            return true;
          },
        },
        {
          name: 'height',
          type: 'number',
          admin: {
            description: 'Height in cells (1-8)',
          },
          validate: (value: number) => {
            if (value !== undefined && (value < 1 || value > 8)) {
              return 'Height must be between 1 and 8';
            }
            return true;
          },
        },
      ],
      admin: {
        description: 'Grid cell coordinates for this region on the map (8x8 grid system)',
      },
    },
    {
      name: 'landmarkIcon',
      type: 'upload',
      relationTo: Collections.Media,
      admin: {
        description: 'Icon/image to display on the map for this region',
      },
    },
    {
      name: 'relatedCharacters',
      type: 'relationship',
      relationTo: Collections.Characters,
      hasMany: true,
    },
    {
      name: 'aiContextPrompt',
      type: 'textarea',
      label: 'Location AI Context',
      admin: {
        description: 'Context about this location that the AI should consider. Include atmosphere, history, notable features, and any special rules or characteristics.',
        placeholder: 'The Whispering Woods is an ancient forest where magic flows freely. The trees themselves seem to watch and listen...',
      },
      required: false,
    },
  ],
}

