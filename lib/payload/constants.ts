// lib/payload/constants.ts
// Shared constants and enums for Payload collections
// NO string literals - everything uses these constants

// ============================================
// USER ROLES
// ============================================
export enum UserRole {
  Superuser = 'superuser',
  Editor = 'editor',
  Contributor = 'contributor',
  AIAgent = 'ai-agent',
  Viewer = 'viewer',
}

export const USER_ROLE_OPTIONS = [
  { label: 'Superuser', value: UserRole.Superuser },
  { label: 'Editor', value: UserRole.Editor },
  { label: 'Contributor', value: UserRole.Contributor },
  { label: 'AI Agent', value: UserRole.AIAgent },
  { label: 'Viewer', value: UserRole.Viewer },
] as const

// ============================================
// CONTENT STATUS
// ============================================
export enum ContentStatus {
  Draft = 'draft',
  Published = 'published',
}

// ============================================
// LORE CATEGORIES
// ============================================
export enum LoreCategory {
  History = 'history',
  MagicSystem = 'magic-system',
  Culture = 'culture',
  Geography = 'geography',
  Religion = 'religion',
  Faction = 'faction',
}

export const LORE_CATEGORY_OPTIONS = [
  { label: 'History', value: LoreCategory.History },
  { label: 'Magic System', value: LoreCategory.MagicSystem },
  { label: 'Culture', value: LoreCategory.Culture },
  { label: 'Geography', value: LoreCategory.Geography },
  { label: 'Religion', value: LoreCategory.Religion },
  { label: 'Faction', value: LoreCategory.Faction },
] as const

// ============================================
// STYLE GUIDE CATEGORIES
// ============================================
export enum StyleGuideCategory {
  CharacterConcept = 'character-concept',
  Environment = 'environment',
  UIDesign = 'ui-design',
  ColorPalette = 'color-palette',
  Typography = 'typography',
  VFX = 'vfx',
}

export const STYLE_GUIDE_CATEGORY_OPTIONS = [
  { label: 'Character Concept', value: StyleGuideCategory.CharacterConcept },
  { label: 'Environment', value: StyleGuideCategory.Environment },
  { label: 'UI Design', value: StyleGuideCategory.UIDesign },
  { label: 'Color Palette', value: StyleGuideCategory.ColorPalette },
  { label: 'Typography', value: StyleGuideCategory.Typography },
  { label: 'VFX', value: StyleGuideCategory.VFX },
] as const

// ============================================
// SNAPSHOT TYPES
// ============================================
export enum SnapshotType {
  Draft = 'draft',
  Published = 'published',
  Checkpoint = 'checkpoint',
}

export const SNAPSHOT_TYPE_OPTIONS = [
  { label: 'Draft', value: SnapshotType.Draft },
  { label: 'Published', value: SnapshotType.Published },
  { label: 'Checkpoint', value: SnapshotType.Checkpoint },
] as const

// ============================================
// AI GENERATION STATUS
// ============================================
export enum AIGenerationStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Rejected = 'rejected',
  Merged = 'merged',
}

export const AI_GENERATION_STATUS_OPTIONS = [
  { label: 'Pending Review', value: AIGenerationStatus.Pending },
  { label: 'Accepted', value: AIGenerationStatus.Accepted },
  { label: 'Rejected', value: AIGenerationStatus.Rejected },
  { label: 'Merged', value: AIGenerationStatus.Merged },
] as const

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
  Objects: 'objects',
  Creatures: 'creatures',
  Maps: 'maps',
} as const

// ============================================
// GLOBAL SLUGS
// ============================================
export const Globals = {
  SiteConfig: 'site-config',
  SidebarConfig: 'sidebar-config',
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

