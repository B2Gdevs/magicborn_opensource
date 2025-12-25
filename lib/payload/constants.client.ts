"use client";

// lib/payload/constants.client.ts
// Client-safe constants (no server-side dependencies)
// These are extracted from constants.ts for use in client components

// ============================================
// COLLECTION SLUGS (for relationships)
// ============================================
export const Collections = {
  Users: 'users',
  Projects: 'projects',
  ProjectMembers: 'project-members',
  Characters: 'characters',
  Media: 'media',
  Acts: 'acts',
  Chapters: 'chapters',
  Scenes: 'scenes',
  ProjectSnapshots: 'project-snapshots',
  Lore: 'lore',
  Locations: 'locations',
  StyleGuideEntries: 'style-guide-entries',
  AIGenerations: 'ai-generations',
  Pages: 'pages',
  // Game Data (Magicborn-specific)
  Effects: 'effects',
  Spells: 'spells',
  Runes: 'runes',
  Creatures: 'creatures',
  Objects: 'objects',
} as const

// ============================================
// CHARACTER FIELD NAMES
// ============================================
export const CharacterFields = {
  Project: 'project',
  Slug: 'slug',
  Name: 'name',
  Description: 'description',
  Image: 'image',
  CombatStats: 'combatStats',
  RuneFamiliarity: 'runeFamiliarity',
} as const

