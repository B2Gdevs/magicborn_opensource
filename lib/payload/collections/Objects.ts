// lib/payload/collections/Objects.ts
// Objects/Items collection - game items like weapons, armor, consumables, etc.

import type { CollectionConfig } from 'payload'
import { Collections } from '../constants'
import { isSuperuser, isEditorOrAbove, publicReadAccess } from '../access/roles'

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
        description: 'Unique identifier for the object (e.g., "ember-crystal"). Used for API lookups.',
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
      options: [
        { label: 'Weapon', value: 'weapon' },
        { label: 'Armor', value: 'armor' },
        { label: 'Consumable', value: 'consumable' },
        { label: 'Material', value: 'material' },
        { label: 'Key Item', value: 'key' },
        { label: 'Artifact', value: 'artifact' },
        { label: 'Miscellaneous', value: 'misc' },
      ],
      defaultValue: 'misc',
    },
    {
      name: 'rarity',
      type: 'select',
      options: [
        { label: 'Common', value: 'common' },
        { label: 'Uncommon', value: 'uncommon' },
        { label: 'Rare', value: 'rare' },
        { label: 'Epic', value: 'epic' },
        { label: 'Legendary', value: 'legendary' },
      ],
      defaultValue: 'common',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: Collections.Media,
      required: false,
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

