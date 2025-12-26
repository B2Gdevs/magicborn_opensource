// lib/content-editor/constants.ts
// Constants for Content Editor

import { Collections } from "@lib/payload/constants.client";

export enum CodexCategory {
  Characters = "characters",
  Creatures = "creatures",
  Regions = "regions",
  Objects = "objects",
  Stories = "stories",
  Spells = "spells",
  Runes = "runes",
  Effects = "effects",
}

export enum EntryType {
  Character = "character",
  Creature = "creature",
  Region = "region",
  Object = "object",
  Story = "story",
  Spell = "spell",
  Rune = "rune",
  Effect = "effect",
  Act = "act",
  Chapter = "chapter",
  Page = "page",
}

// Map category IDs to entry types
export const CATEGORY_TO_ENTRY_TYPE: Record<CodexCategory, EntryType> = {
  [CodexCategory.Characters]: EntryType.Character,
  [CodexCategory.Creatures]: EntryType.Creature,
  [CodexCategory.Regions]: EntryType.Region,
  [CodexCategory.Objects]: EntryType.Object,
  [CodexCategory.Stories]: EntryType.Story,
  [CodexCategory.Spells]: EntryType.Spell,
  [CodexCategory.Runes]: EntryType.Rune,
  [CodexCategory.Effects]: EntryType.Effect,
};

// Map category IDs to Payload collections
export const CATEGORY_TO_COLLECTION: Record<CodexCategory, string> = {
  [CodexCategory.Characters]: Collections.Characters,
  [CodexCategory.Creatures]: Collections.Creatures,
  [CodexCategory.Regions]: Collections.Locations,
  [CodexCategory.Objects]: Collections.Objects,
  [CodexCategory.Stories]: Collections.Lore,
  [CodexCategory.Spells]: Collections.Spells,
  [CodexCategory.Runes]: Collections.Runes,
  [CodexCategory.Effects]: Collections.Effects,
};

// Reverse mapping: EntryType to CodexCategory
export const ENTRY_TYPE_TO_CATEGORY: Record<EntryType, CodexCategory> = {
  [EntryType.Character]: CodexCategory.Characters,
  [EntryType.Creature]: CodexCategory.Creatures,
  [EntryType.Region]: CodexCategory.Regions,
  [EntryType.Object]: CodexCategory.Objects,
  [EntryType.Story]: CodexCategory.Stories,
  [EntryType.Spell]: CodexCategory.Spells,
  [EntryType.Rune]: CodexCategory.Runes,
  [EntryType.Effect]: CodexCategory.Effects,
};

// Reverse mapping: EntryType to Collection
export const ENTRY_TYPE_TO_COLLECTION: Record<EntryType, string> = {
  [EntryType.Character]: Collections.Characters,
  [EntryType.Creature]: Collections.Creatures,
  [EntryType.Region]: Collections.Locations,
  [EntryType.Object]: Collections.Objects,
  [EntryType.Story]: Collections.Lore,
  [EntryType.Spell]: Collections.Spells,
  [EntryType.Rune]: Collections.Runes,
  [EntryType.Effect]: Collections.Effects,
};

