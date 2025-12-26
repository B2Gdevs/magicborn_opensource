// lib/payload/collections/Runes.ts
// Runes collection - Magicborn rune definitions (A-Z)

import type { CollectionConfig } from 'payload'
import { DamageType, RuneTag, CrowdControlTag } from '@core/enums'
import { Collections } from '../constants'
import { isSuperuser, isEditorOrAbove, publicReadAccess } from '../access/roles'
// Removed autoGenerateSlugHook import - IDs are now server-generated

// Generate options from existing enums
const DAMAGE_TYPE_OPTIONS = Object.values(DamageType).map((type) => ({
  label: type.charAt(0).toUpperCase() + type.slice(1),
  value: type,
}))

const RUNE_TAG_OPTIONS = Object.values(RuneTag).map((tag) => ({
  label: tag.charAt(0).toUpperCase() + tag.slice(1),
  value: tag,
}))

const CC_TAG_OPTIONS = Object.values(CrowdControlTag).map((tag) => ({
  label: tag.charAt(0).toUpperCase() + tag.slice(1),
  value: tag,
}))

export const Runes: CollectionConfig = {
  slug: Collections.Runes,
  admin: {
    useAsTitle: 'concept',
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
      name: 'project',
      type: 'relationship',
      relationTo: Collections.Projects,
      required: true,
    },
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
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Single letter code (A-Z) for the rune',
      },
      validate: (value: string | null | undefined) => {
        if (!value || value.length !== 1) {
          return 'Code must be a single letter (A-Z)'
        }
        if (!/^[A-Z]$/.test(value)) {
          return 'Code must be an uppercase letter (A-Z)'
        }
        return true
      },
    },
    {
      name: 'concept',
      type: 'text',
      required: true,
      admin: {
        description: 'Conceptual name (e.g., "Fire", "Air")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
      admin: {
        description: 'Description of the rune',
      },
    },
    {
      name: 'powerFactor',
      type: 'number',
      required: true,
      min: 0,
      max: 2,
      admin: {
        description: 'Power multiplier (typically 0.5-1.5)',
      },
    },
    {
      name: 'controlFactor',
      type: 'number',
      required: true,
      min: 0,
      max: 2,
      admin: {
        description: 'Control multiplier (typically 0.5-1.5)',
      },
    },
    {
      name: 'instabilityBase',
      type: 'number',
      required: true,
      min: 0,
      max: 1,
      admin: {
        description: 'Base instability value (0-1)',
      },
    },
    {
      name: 'tags',
      type: 'select',
      hasMany: true,
      options: RUNE_TAG_OPTIONS,
      required: true,
      admin: {
        description: 'Rune tags for categorization',
      },
    },
    {
      name: 'manaCost',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Base mana cost',
      },
    },
    {
      name: 'damage',
      type: 'json',
      admin: {
        description: 'DamageVector: Record<DamageType, number>',
      },
    },
    {
      name: 'ccInstant',
      type: 'select',
      hasMany: true,
      options: CC_TAG_OPTIONS,
      admin: {
        description: 'Instant crowd control effects',
      },
    },
    {
      name: 'pen',
      type: 'json',
      admin: {
        description: 'Penetration values: Partial<Record<DamageType, number>>',
      },
    },
    {
      name: 'effects',
      type: 'json',
      admin: {
        description: 'Array of EffectBlueprint',
      },
    },
    {
      name: 'overchargeEffects',
      type: 'json',
      admin: {
        description: 'Array of OverchargeEffect (minExtraMana + EffectBlueprint)',
      },
    },
    {
      name: 'dotAffinity',
      type: 'number',
      min: 0,
      max: 1,
      admin: {
        description: 'Damage over time affinity (0-1)',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: Collections.Media,
      admin: {
        description: 'Rune icon/image',
      },
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
  ],
}


