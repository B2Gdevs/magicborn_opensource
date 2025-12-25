// lib/content-editor/entry-config.tsx
// Centralized configuration for all entry types
// Makes it easy to add new entry types dynamically
//
// ICON USAGE GUIDE:
// =================
// This file defines icons for CONTENT TYPES (Character, Spell, Region, etc.)
// These icons are ReactNode components already rendered with className.
//
// When to use Entry Config icons:
// - Content cards, grid views, skeleton loaders
// - Anywhere displaying content types (Character, Spell, etc.)
// - Always use getEntryConfig(entryType).icon - never hardcode
//
// When NOT to use Entry Config icons:
// - Toast notifications (use lucide-react directly: CheckCircle, XCircle, etc.)
// - Navigation items (use lucide-react directly: Settings, Home, etc.)
// - UI feedback icons (use lucide-react directly)
//
// For toast icons, see: components/ui/Toaster.tsx
// For navigation icons, see: components/SidebarNav.tsx (ICON_MAP)

import { User, MapPin, Package, BookOpen, Sparkles, Gem, Zap, FileText, File } from "lucide-react";
import type { ReactNode } from "react";
import { EntryType, CodexCategory, ENTRY_TYPE_TO_COLLECTION, ENTRY_TYPE_TO_CATEGORY } from "./constants";
import { Collections, CharacterFields } from "@lib/payload/constants.client";
import type { EntryTypeConfigs } from "./entry-type-config-types";

export interface EntryConfig {
  id: EntryType;
  name: string;
  displayName: string;
  icon: ReactNode; // Already rendered ReactNode with className, not a component
  category: CodexCategory;
  collection: string;
  magicbornOnly?: boolean;
}

// Icon components (lazy-loaded to avoid issues)
const Icons = {
  User,
  MapPin,
  Package,
  BookOpen,
  Sparkles,
  Gem,
  Zap,
  FileText,
  File,
};

// Entry type configurations
export const ENTRY_CONFIGS: Record<EntryType, EntryConfig> = {
  [EntryType.Character]: {
    id: EntryType.Character,
    name: "Character",
    displayName: "Character",
    icon: <Icons.User className="w-4 h-4" />,
    category: CodexCategory.Characters,
    collection: Collections.Characters,
  },
  [EntryType.Creature]: {
    id: EntryType.Creature,
    name: "Creature",
    displayName: "Creature",
    icon: <Icons.User className="w-4 h-4" />,
    category: CodexCategory.Creatures,
    collection: Collections.Creatures,
  },
  [EntryType.Region]: {
    id: EntryType.Region,
    name: "Region",
    displayName: "Region",
    icon: <Icons.MapPin className="w-4 h-4" />,
    category: CodexCategory.Regions,
    collection: Collections.Locations,
  },
  [EntryType.Object]: {
    id: EntryType.Object,
    name: "Object",
    displayName: "Object/Item",
    icon: <Icons.Package className="w-4 h-4" />,
    category: CodexCategory.Objects,
    collection: Collections.Objects,
  },
  [EntryType.Story]: {
    id: EntryType.Story,
    name: "Story",
    displayName: "Book/Story",
    icon: <Icons.BookOpen className="w-4 h-4" />,
    category: CodexCategory.Stories,
    collection: Collections.Lore,
  },
  [EntryType.Spell]: {
    id: EntryType.Spell,
    name: "Spell",
    displayName: "Spell",
    icon: <Icons.Sparkles className="w-4 h-4" />,
    category: CodexCategory.Spells,
    collection: Collections.Spells,
    magicbornOnly: true,
  },
  [EntryType.Rune]: {
    id: EntryType.Rune,
    name: "Rune",
    displayName: "Rune",
    icon: <Icons.Gem className="w-4 h-4" />,
    category: CodexCategory.Runes,
    collection: Collections.Runes,
    magicbornOnly: true,
  },
  [EntryType.Effect]: {
    id: EntryType.Effect,
    name: "Effect",
    displayName: "Effect",
    icon: <Icons.Zap className="w-4 h-4" />,
    category: CodexCategory.Effects,
    collection: Collections.Effects,
    magicbornOnly: true,
  },
  [EntryType.Act]: {
    id: EntryType.Act,
    name: "Act",
    displayName: "Act",
    icon: <Icons.BookOpen className="w-4 h-4" />,
    category: CodexCategory.Stories, // Acts are part of stories
    collection: Collections.Acts,
  },
  [EntryType.Chapter]: {
    id: EntryType.Chapter,
    name: "Chapter",
    displayName: "Chapter",
    icon: <Icons.FileText className="w-4 h-4" />,
    category: CodexCategory.Stories, // Chapters are part of stories
    collection: Collections.Chapters,
  },
  [EntryType.Page]: {
    id: EntryType.Page,
    name: "Page",
    displayName: "Page",
    icon: <Icons.File className="w-4 h-4" />,
    category: CodexCategory.Stories, // Pages are part of stories
    collection: Collections.Pages,
  },
};

// Helper functions
export function getEntryConfig(entryType: EntryType): EntryConfig {
  return ENTRY_CONFIGS[entryType];
}

/**
 * Get display name for an entry type, checking DB override first, then falling back to code default
 * @param entryType - The entry type to get display name for
 * @param projectConfigs - Optional project-level entry type configs from DB
 * @returns The display name (from DB override if available, otherwise from code)
 */
export function getDisplayName(
  entryType: EntryType,
  projectConfigs?: EntryTypeConfigs | null
): string {
  // Check DB override first
  if (projectConfigs?.[entryType]?.displayName) {
    return projectConfigs[entryType].displayName!;
  }
  
  // Fallback to code default
  return ENTRY_CONFIGS[entryType].displayName;
}

export function getCollectionForEntryType(entryType: EntryType): string {
  return ENTRY_CONFIGS[entryType].collection;
}

export function getCategoryForEntryType(entryType: EntryType): CodexCategory {
  return ENTRY_CONFIGS[entryType].category;
}

export function getEntryTypeForCategory(category: CodexCategory): EntryType {
  return ENTRY_CONFIGS[Object.values(EntryType).find(
    (type) => ENTRY_CONFIGS[type].category === category
  ) as EntryType]?.id || EntryType.Character;
}

export function getAllEntryTypes(magicbornMode: boolean = false): EntryConfig[] {
  return Object.values(ENTRY_CONFIGS).filter(
    (config) => !config.magicbornOnly || magicbornMode
  );
}

// Export CharacterFields for backward compatibility
export { CharacterFields };

// Export types and hooks
export type { EntryTypeConfigs } from "./entry-type-config-types";
export { useEntryDisplayName } from "./useEntryDisplayName";
export { useProjectConfigs } from "./useProjectConfigs";

