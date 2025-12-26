// lib/payload/collections/Spells.ts
// Named Spells collection - uses existing enums from core

import type { CollectionConfig } from 'payload'
import { DamageType, SpellTag } from '@core/enums'
import { Collections } from '../constants'
import { isSuperuser, isEditorOrAbove, publicReadAccess } from '../access/roles'
// Removed autoGenerateSlugHook import - IDs are now server-generated

// Generate options from existing enums
const DAMAGE_TYPE_OPTIONS = Object.values(DamageType).map((type) => ({
  label: type.charAt(0).toUpperCase() + type.slice(1),
  value: type,
}))

const SPELL_TAG_OPTIONS = Object.values(SpellTag).map((tag) => ({
  label: tag.charAt(0).toUpperCase() + tag.slice(1),
  value: tag,
}))

export const Spells: CollectionConfig = {
  slug: Collections.Spells,
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
  // Removed auto-generation hook - IDs are now server-generated
  fields: [
    {
      name: 'spellId',
      type: 'text',
      unique: true,
      required: false,
      admin: {
        description: 'Optional unique identifier. Leave empty for server-generated ID.',
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
      name: 'tags',
      type: 'select',
      hasMany: true,
      options: SPELL_TAG_OPTIONS,
      admin: {
        description: 'Spell tags for filtering/categorization',
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
    // Rune requirements
    {
      name: 'requiredRunes',
      type: 'json',
      required: true,
      admin: {
        description: 'Array of RuneCode values required for this spell',
      },
    },
    {
      name: 'allowedExtraRunes',
      type: 'json',
      admin: {
        description: 'Optional whitelist of additional runes',
      },
    },
    // Damage focus requirements
    {
      name: 'minDamageFocus',
      type: 'group',
      fields: [
        {
          name: 'type',
          type: 'select',
          options: DAMAGE_TYPE_OPTIONS,
        },
        {
          name: 'ratio',
          type: 'number',
          min: 0,
          max: 1,
          admin: {
            description: 'Minimum ratio (0-1) of this damage type',
          },
        },
      ],
    },
    {
      name: 'minTotalPower',
      type: 'number',
      min: 0,
    },
    // Evolution chain
    {
      name: 'requiresNamedSourceId',
      type: 'text',
      admin: {
        description: 'If set, can only evolve from this named spell',
      },
    },
    {
      name: 'minTotalFamiliarityScore',
      type: 'number',
      min: 0,
    },
    {
      name: 'minRuneFamiliarity',
      type: 'json',
      admin: {
        description: 'Partial<Record<RuneCode, number>> for per-rune requirements',
      },
    },
    {
      name: 'requiredFlags',
      type: 'json',
      admin: {
        description: 'Achievement flags required to unlock',
      },
    },
    // Effects applied by spell
    {
      name: 'effects',
      type: 'json',
      admin: {
        description: 'EffectBlueprint[] - effects applied when cast',
      },
    },
    // Spellbook UI
    {
      name: 'hidden',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Hidden until discovered',
      },
    },
    {
      name: 'hint',
      type: 'textarea',
      admin: {
        description: 'Guidance shown in spellbook',
      },
    },
  ],
}


