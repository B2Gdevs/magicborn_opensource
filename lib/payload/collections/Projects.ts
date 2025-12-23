// lib/payload/collections/Projects.ts
// Projects collection - the tenant boundary for content

import type { CollectionConfig } from 'payload/types'
import { isSuperuser, getAccessibleProjectIds } from '../access/helpers'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'name',
  },
  versions: {
    drafts: true,
  },
  access: {
    read: async ({ req }) => {
      if (isSuperuser({ req })) {
        return true
      }
      const accessibleProjectIds = await getAccessibleProjectIds({ req })
      return {
        id: {
          in: accessibleProjectIds,
        },
      }
    },
    create: ({ req }) => {
      // Superusers can create projects
      // Regular users can create projects (they become owner)
      return true
    },
    update: async ({ req }) => {
      if (isSuperuser({ req })) {
        return true
      }
      // Users can update projects they own or are admin of
      const accessibleProjectIds = await getAccessibleProjectIds({ req })
      return {
        id: {
          in: accessibleProjectIds,
        },
      }
    },
    delete: ({ req }) => isSuperuser({ req }), // Only superusers can delete projects
  },
  fields: [
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
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: false, // Optional for now - single superuser mode
    },
    {
      name: 'magicbornMode',
      type: 'checkbox',
      label: 'Enable Magicborn Game Systems',
      defaultValue: false,
      admin: {
        description: 'When enabled, Spells, Runes, Effects, and Combat Stats become available.',
      },
    },
    {
      name: 'defaultView',
      type: 'select',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'Matrix', value: 'matrix' },
        { label: 'Outline', value: 'outline' },
      ],
      defaultValue: 'grid',
    },
    // AI Prompt Configuration
    {
      name: 'aiSystemPrompt',
      type: 'textarea',
      label: 'AI System Prompt',
      admin: {
        description: 'Base system prompt that defines how the AI assistant behaves. This sets the tone, style, and role of the AI for this project.',
        placeholder: 'You are a creative writing assistant for the Magicborn universe...',
      },
      required: false,
    },
    {
      name: 'aiProjectStory',
      type: 'textarea',
      label: 'Project Story & Context',
      admin: {
        description: 'The overarching story, world, and context for this project. This provides background that the AI uses when generating content.',
        placeholder: 'Magicborn is a fantasy world where magic is born from the elements...',
      },
      required: false,
    },
    {
      name: 'aiAssistantBehavior',
      type: 'textarea',
      label: 'Assistant Behavior Guidelines',
      admin: {
        description: 'Specific instructions on how the AI should behave, what style to use, and any constraints or preferences.',
        placeholder: 'Write in a descriptive, immersive style. Focus on character development and world-building...',
      },
      required: false,
    },
  ],
}

