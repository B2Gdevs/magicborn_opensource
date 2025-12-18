// lib/payload/globals/SidebarConfig.ts
// Global sidebar configuration - navigation, logo, socials

import type { GlobalConfig } from 'payload'
import { Globals } from '../constants'
import { isEditorOrAbove } from '../access/roles'

export const SidebarConfig: GlobalConfig = {
  slug: 'sidebar-config',
  admin: {
    group: 'Site',
  },
  access: {
    read: () => true,
    update: isEditorOrAbove,
  },
  fields: [
    // Logo
    {
      name: 'logo',
      type: 'group',
      fields: [
        {
          name: 'image',
          type: 'text',
          defaultValue: '/design/logos/magicborn_logo.png',
          admin: {
            description: 'Path to logo image',
          },
        },
        {
          name: 'text',
          type: 'text',
          defaultValue: 'MAGICBORN',
        },
        {
          name: 'showImage',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Display the logo image',
          },
        },
        {
          name: 'showText',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Display the logo text',
          },
        },
      ],
    },
    // Favicon
    {
      name: 'favicon',
      type: 'text',
      defaultValue: '/favicon.ico',
      admin: {
        description: 'Path to favicon',
      },
    },
    // Navigation Items
    {
      name: 'navItems',
      type: 'array',
      admin: {
        description: 'Main navigation links',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          required: true,
        },
        {
          name: 'icon',
          type: 'select',
          required: true,
          options: [
            { label: 'Home', value: 'Home' },
            { label: 'Book', value: 'BookOpen' },
            { label: 'Scroll', value: 'Scroll' },
            { label: 'Palette', value: 'Palette' },
            { label: 'Settings', value: 'Settings' },
            { label: 'Code', value: 'Code' },
            { label: 'Users', value: 'Users' },
            { label: 'Map', value: 'Map' },
            { label: 'Sword', value: 'Swords' },
            { label: 'Wand', value: 'Wand2' },
            { label: 'Shield', value: 'Shield' },
            { label: 'Crown', value: 'Crown' },
            { label: 'Flame', value: 'Flame' },
            { label: 'Sparkles', value: 'Sparkles' },
            { label: 'Star', value: 'Star' },
            { label: 'Heart', value: 'Heart' },
            { label: 'Folder', value: 'Folder' },
            { label: 'File', value: 'FileText' },
            { label: 'Image', value: 'Image' },
            { label: 'Video', value: 'Video' },
            { label: 'Music', value: 'Music' },
            { label: 'Globe', value: 'Globe' },
            { label: 'Compass', value: 'Compass' },
            { label: 'Layers', value: 'Layers' },
            { label: 'Grid', value: 'LayoutGrid' },
            { label: 'List', value: 'List' },
            { label: 'Search', value: 'Search' },
            { label: 'Info', value: 'Info' },
            { label: 'Help', value: 'HelpCircle' },
            { label: 'Bell', value: 'Bell' },
            { label: 'Mail', value: 'Mail' },
            { label: 'MessageSquare', value: 'MessageSquare' },
            { label: 'Terminal', value: 'Terminal' },
            { label: 'Database', value: 'Database' },
            { label: 'Server', value: 'Server' },
            { label: 'Cloud', value: 'Cloud' },
            { label: 'Download', value: 'Download' },
            { label: 'Upload', value: 'Upload' },
            { label: 'Link', value: 'Link' },
            { label: 'ExternalLink', value: 'ExternalLink' },
          ],
        },
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'requiresAuth',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Only show to logged-in users',
          },
        },
      ],
    },
    // Social Links
    {
      name: 'socialLinks',
      type: 'array',
      admin: {
        description: 'Social media links shown at bottom of sidebar',
      },
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: [
            { label: 'Discord', value: 'discord' },
            { label: 'GitHub', value: 'github' },
            { label: 'Twitter/X', value: 'twitter' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'Twitch', value: 'twitch' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'TikTok', value: 'tiktok' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'Reddit', value: 'reddit' },
            { label: 'Patreon', value: 'patreon' },
            { label: 'Ko-fi', value: 'kofi' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    // SEO & Open Graph
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          defaultValue: "Magicborn: Mordred's Legacy",
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          defaultValue: 'A dark fantasy story of the oppressed Magicborn, military slaves whose power is both gift and curse.',
        },
        {
          name: 'keywords',
          type: 'text',
          defaultValue: 'magicborn, rpg, fantasy, spellcrafting, dark fantasy',
        },
        {
          name: 'ogImage',
          type: 'text',
          defaultValue: '/design/images/og-image.png',
          admin: {
            description: 'Open Graph image (1200x630 recommended)',
          },
        },
        {
          name: 'ogType',
          type: 'select',
          defaultValue: 'website',
          options: [
            { label: 'Website', value: 'website' },
            { label: 'Article', value: 'article' },
            { label: 'Game', value: 'game' },
            { label: 'Product', value: 'product' },
          ],
        },
        {
          name: 'twitterCard',
          type: 'select',
          defaultValue: 'summary_large_image',
          options: [
            { label: 'Summary', value: 'summary' },
            { label: 'Summary Large Image', value: 'summary_large_image' },
            { label: 'Player', value: 'player' },
          ],
        },
        {
          name: 'twitterSite',
          type: 'text',
          admin: {
            description: 'Twitter @handle',
          },
        },
      ],
    },
  ],
}

