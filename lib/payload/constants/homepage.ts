// lib/payload/constants/homepage.ts
// Shared constants for homepage configuration
// Reduces duplication between SiteConfig and Projects.homepageConfig

/**
 * Hero content text style options
 */
export const HERO_CONTENT_STYLE_OPTIONS = [
  { label: 'Normal', value: 'normal' },
  { label: 'Italic', value: 'italic' },
  { label: 'Bold', value: 'bold' },
] as const

export type HeroContentStyle = typeof HERO_CONTENT_STYLE_OPTIONS[number]['value']

/**
 * Hero content color options
 */
export const HERO_CONTENT_COLOR_OPTIONS = [
  { label: 'Default', value: '' },
  { label: 'Ember', value: 'ember-glow' },
  { label: 'Gold', value: 'amber-400' },
  { label: 'Crimson', value: 'red-500' },
  { label: 'Ice', value: 'cyan-400' },
  { label: 'Mystic', value: 'purple-400' },
] as const

export type HeroContentColor = typeof HERO_CONTENT_COLOR_OPTIONS[number]['value']

