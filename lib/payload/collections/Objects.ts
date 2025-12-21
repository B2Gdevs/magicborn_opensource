// lib/payload/collections/Objects.ts
// Objects/Items collection - game items like weapons, armor, consumables, etc.

import type { CollectionConfig } from 'payload'
import { Collections, ObjectType, OBJECT_TYPE_OPTIONS, ItemRarity, ITEM_RARITY_OPTIONS } from '../constants'
import { isSuperuser, isEditorOrAbove, publicReadAccess } from '../access/roles'
import { autoGenerateSlugHook } from '../utils/slugGeneration'

export const Objects: CollectionConfig = {
  slug: Collections.Objects,
  admin: {
    useAsTitle: 'name',
    group: 'Game Data',
  },
  versions: {
    drafts: true,
    maxPerDoc: 25,
  },
  access: {
    read: publicReadAccess,
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
      name: 'slug',
      type: 'text',
      unique: true,
      admin: {
        description: 'Auto-generated unique identifier (e.g., "ember-crystal"). Generated from name if not provided.',
      },
    },
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
      name: 'type',
      type: 'select',
      options: OBJECT_TYPE_OPTIONS as any,
      defaultValue: ObjectType.Misc,
    },
    {
      name: 'rarity',
      type: 'select',
      options: ITEM_RARITY_OPTIONS as any,
      defaultValue: ItemRarity.Common,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: Collections.Media,
      required: false,
    },
    {
      name: 'landmarkIcon',
      type: 'upload',
      relationTo: Collections.Media,
      required: false,
      admin: {
        description: 'Icon/image for map display or UI representation',
      },
    },
    {
      name: 'weight',
      type: 'number',
      admin: {
        description: 'Weight of the item',
      },
    },
    {
      name: 'value',
      type: 'number',
      admin: {
        description: 'Value in gold',
      },
    },
  ],
}

