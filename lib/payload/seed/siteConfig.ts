// lib/payload/seed/siteConfig.ts
// Seeds the default site configuration with current homepage content

import type { Payload } from 'payload'
import { Globals } from '../constants'

const DEFAULT_SITE_CONFIG = {
  siteName: 'Magicborn',
  tagline: "Mordred's Legacy",
  hero: {
    title: 'Magicborn',
    subtitle: '',
  },
  features: {
    showWaitlistButton: false,
    waitlistUrl: '',
    showPublicLore: true,
    showStyleGuide: true,
  },
  // Hero text content - stored in a content array for flexibility
  heroContent: [
    {
      text: 'In the shadows where magic flows like blood, the Magicborn serve. Oppressed. Silenced. Forced into war.',
      style: 'italic',
    },
    {
      text: 'You are one of them. A military slave, your power both gift and curse. In this godforsaken land, survival comes not from strength, but from the spells you craft.',
      style: 'normal',
    },
    {
      text: "This is the story of the oppressed. Of what they must do to survive... their way.",
      style: 'italic',
    },
  ],
  socialLinks: [
    { platform: 'discord', url: 'https://discord.gg/JxXHZktcR7' },
    { platform: 'github', url: 'https://github.com/your-repo' },
  ],
  seo: {
    metaTitle: "Magicborn: Mordred's Legacy",
    metaDescription: 'A dark fantasy story of the oppressed Magicborn, military slaves whose power is both gift and curse.',
  },
}

/**
 * Seeds the default site configuration
 */
export async function seedSiteConfig(payload: Payload): Promise<void> {
  console.log('Seeding site configuration...')

  try {
    // Check if already has heroContent
    const existing = await payload.findGlobal({
      slug: Globals.SiteConfig,
    })

    if (existing?.heroContent?.length > 0) {
      console.log('  Site config already has hero content, skipping')
      return
    }

    // Merge with existing data
    await payload.updateGlobal({
      slug: Globals.SiteConfig,
      data: {
        ...existing,
        ...DEFAULT_SITE_CONFIG,
        // Keep any existing values that were set
        siteName: existing?.siteName || DEFAULT_SITE_CONFIG.siteName,
        tagline: existing?.tagline || DEFAULT_SITE_CONFIG.tagline,
      },
    })
  } catch {
    // Global doesn't exist yet, will create
    await payload.updateGlobal({
      slug: Globals.SiteConfig,
      data: DEFAULT_SITE_CONFIG,
    })
  }

  console.log('  Site config seeded with default content')
}

