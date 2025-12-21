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
// Note: Creatures and Objects may not be in Collections yet
export const CATEGORY_TO_COLLECTION: Record<CodexCategory, string> = {
  [CodexCategory.Characters]: Collections.Characters,
  [CodexCategory.Creatures]: "creatures",
  [CodexCategory.Regions]: Collections.Locations,
  [CodexCategory.Objects]: "objects",
  [CodexCategory.Stories]: Collections.Lore,
  [CodexCategory.Spells]: Collections.Spells,
  [CodexCategory.Runes]: Collections.Runes,
  [CodexCategory.Effects]: Collections.Effects,
};

