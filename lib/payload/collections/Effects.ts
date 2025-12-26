// lib/payload/collections/Effects.ts
// Effects collection - uses existing EffectType enum from core

import type { CollectionConfig } from 'payload'
import { EffectType } from '@core/enums'
import { EffectCategory } from '@/lib/data/effects'
import { Collections } from '../constants'
import { isSuperuser, isEditorOrAbove, publicReadAccess } from '../access/roles'
// Removed autoGenerateSlugHook import - IDs are now server-generated

// Generate options from existing enums
const EFFECT_TYPE_OPTIONS = Object.values(EffectType).map((type) => ({
  label: type.charAt(0).toUpperCase() + type.slice(1),
  value: type,
}))

const EFFECT_CATEGORY_OPTIONS = Object.values(EffectCategory).map((cat) => ({
  label: cat.replace(/([A-Z])/g, ' $1').trim(),
  value: cat,
}))

export const Effects: CollectionConfig = {
  slug: Collections.Effects,
  admin: {
    useAsTitle: 'name',
    group: 'Game Data',
  },
  versions: {
    drafts: true,
    maxPerDoc: 10,
  },
  access: {
    read: publicReadAccess,
    create: isEditorOrAbove,
    update: isEditorOrAbove,
    delete: isSuperuser,
  },
  // Removed auto-generation hook - IDs are now server-generated
  fields: [
    {
      name: 'slug',
      type: 'text',
      unique: true,
      required: false,
      admin: {
        description: 'Optional URL-friendly identifier. Leave empty for server-generated ID.',
      },
    },
    {
      name: 'effectType',
      type: 'select',
      options: EFFECT_TYPE_OPTIONS,
      required: true,
      unique: true,
      admin: {
        description: 'Maps to EffectType enum in core/enums',
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
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      options: EFFECT_CATEGORY_OPTIONS,
      required: true,
    },
    {
      name: 'isBuff',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'True if this is a beneficial effect',
      },
    },
    {
      name: 'maxStacks',
      type: 'number',
      min: 1,
      admin: {
        description: 'Maximum stacks (leave empty for non-stacking)',
      },
    },
    {
      name: 'iconKey',
      type: 'text',
      admin: {
        description: 'Icon identifier for UI',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: Collections.Media,
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
    // Blueprint data stored as JSON for flexibility
    {
      name: 'blueprint',
      type: 'group',
      fields: [
        {
          name: 'baseMagnitude',
          type: 'number',
          required: true,
        },
        {
          name: 'baseDurationSec',
          type: 'number',
          required: true,
        },
        {
          name: 'self',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
  ],
}


