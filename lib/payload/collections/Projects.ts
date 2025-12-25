// lib/payload/collections/Projects.ts
// Projects collection - the tenant boundary for content

import type { CollectionConfig } from 'payload/types'
import { isSuperuser, getAccessibleProjectIds } from '../access/helpers'
import { Collections } from '../constants'
import { HERO_CONTENT_STYLE_OPTIONS, HERO_CONTENT_COLOR_OPTIONS } from '../constants/homepage'

export const Projects: CollectionConfig = {
  slug: Collections.Projects,
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
    // Basic Project Information
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
      name: 'logo',
      type: 'upload',
      relationTo: Collections.Media,
      required: false,
      admin: {
        description: 'Project logo displayed in sidebar when this project is active',
      },
    },
    {
      name: 'displayTitle',
      type: 'text',
      required: false,
      admin: {
        description: 'Display title shown in sidebar when this project is active. If not set, uses project name.',
      },
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: Collections.Users,
      required: false, // Optional for now - single superuser mode
    },
    // Project Settings
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
    // Codex Configuration Overrides
    {
      name: 'entryTypeConfigs',
      type: 'json',
      label: 'Entry Type Display Names',
      admin: {
        description: 'Override display names for entry types (e.g., "Region" → "Location"). Leave empty to use defaults from code.',
        components: {
          Field: undefined, // Use default JSON editor
        },
      },
      required: false,
      // Structure: { [EntryType]: { displayName?: string } }
      // Example: { "region": { "displayName": "Location" }, "character": { "displayName": "Hero" } }
    },
    // Homepage Configuration Overrides
    {
      name: 'homepageConfig',
      type: 'group',
      label: 'Homepage Settings',
      admin: {
        description: 'Override global homepage settings for this project. Leave empty to use global SiteConfig defaults.',
      },
      fields: [
        // Hero section
        {
          type: 'group',
          name: 'hero',
          label: 'Hero Section',
          fields: [
            {
              name: 'title',
              type: 'text',
              admin: {
                description: 'Hero title (overrides global SiteConfig)',
              },
            },
            {
              name: 'subtitle',
              type: 'textarea',
              admin: {
                description: 'Hero subtitle (overrides global SiteConfig)',
              },
            },
            {
              name: 'videos',
              type: 'array',
              label: 'Hero Videos',
              admin: {
                description: 'Hero background videos (plays in sequence). Overrides global SiteConfig.',
              },
              fields: [
                {
                  name: 'video',
                  type: 'upload',
                  relationTo: Collections.Media,
                },
                {
                  name: 'url',
                  type: 'text',
                  admin: {
                    description: 'Or enter video URL directly',
                  },
                },
              ],
            },
            {
              name: 'backgroundImage',
              type: 'upload',
              relationTo: Collections.Media,
              admin: {
                description: 'Fallback background image (overrides global SiteConfig)',
              },
            },
          ],
        },
        // Hero content paragraphs
        {
          name: 'heroContent',
          type: 'array',
          label: 'Hero Content',
          admin: {
            description: 'Hero text paragraphs displayed on homepage. Overrides global SiteConfig.',
          },
          fields: [
            {
              name: 'text',
              type: 'textarea',
              required: true,
            },
            {
              name: 'style',
              type: 'select',
              options: HERO_CONTENT_STYLE_OPTIONS,
              defaultValue: 'normal',
            },
            {
              name: 'highlightWords',
              type: 'text',
              admin: {
                description: 'Comma-separated words to highlight in ember color',
              },
            },
            {
              name: 'color',
              type: 'select',
              options: HERO_CONTENT_COLOR_OPTIONS,
            },
          ],
        },
      ],
    },
  ],
}

