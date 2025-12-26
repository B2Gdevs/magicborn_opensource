// lib/payload/globals/SiteConfig.ts
// Global site configuration - homepage, feature flags, etc.

import type { GlobalConfig } from 'payload'
import { Globals, Collections } from '../constants'
import { isSuperuser, isEditorOrAbove } from '../access/roles'
import { HERO_CONTENT_STYLE_OPTIONS, HERO_CONTENT_COLOR_OPTIONS } from '../constants/homepage'

export const SiteConfig: GlobalConfig = {
  slug: Globals.SiteConfig,
  admin: {
    group: 'Site',
  },
  access: {
    read: () => true, // Public can read site config
    update: isEditorOrAbove,
  },
  fields: [
    // Basic site info
    {
      name: 'siteName',
      type: 'text',
      required: true,
      defaultValue: 'Magicborn',
    },
    {
      name: 'tagline',
      type: 'text',
      defaultValue: "Mordred's Legacy",
    },
    // Project selection for homepage content
    {
      name: 'activeProject',
      type: 'relationship',
      relationTo: Collections.Projects,
      required: false,
      admin: {
        description: 'Select which project\'s homepage content to display. If not set, uses global SiteConfig defaults.',
      },
    },
    // Hero section
    {
      type: 'group',
      name: 'hero',
      fields: [
        {
          name: 'title',
          type: 'text',
          defaultValue: 'Magicborn',
        },
        {
          name: 'subtitle',
          type: 'textarea',
        },
        {
          name: 'videos',
          type: 'array',
          admin: {
            description: 'Hero background videos (plays in sequence)',
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
            description: 'Fallback background image',
          },
        },
      ],
    },
    // Hero content paragraphs
    {
      name: 'heroContent',
      type: 'array',
      admin: {
        description: 'Hero text paragraphs displayed on homepage',
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
    // Feature flags
    {
      type: 'group',
      name: 'features',
      fields: [
        {
          name: 'showWaitlistButton',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'waitlistUrl',
          type: 'text',
        },
        {
          name: 'waitlistEmbedCode',
          type: 'textarea',
          admin: {
            description: 'Paste your ConvertKit/Mailchimp/etc embed code here (HTML)',
          },
        },
        {
          name: 'showPublicLore',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Show public lore section on homepage',
          },
        },
        {
          name: 'showStyleGuide',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    // Featured content
    {
      name: 'featuredLore',
      type: 'relationship',
      relationTo: Collections.Lore,
      hasMany: true,
      admin: {
        description: 'Lore entries to feature on homepage',
      },
    },
    {
      name: 'featuredCharacters',
      type: 'relationship',
      relationTo: Collections.Characters,
      hasMany: true,
      admin: {
        description: 'Characters to feature on homepage',
      },
    },
    // Social links
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: [
            { label: 'Discord', value: 'discord' },
            { label: 'Twitter', value: 'twitter' },
            { label: 'GitHub', value: 'github' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'Twitch', value: 'twitch' },
          ],
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
    // SEO
    {
      type: 'group',
      name: 'seo',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
        },
        {
          name: 'metaDescription',
          type: 'textarea',
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: Collections.Media,
        },
      ],
    },
  ],
}

