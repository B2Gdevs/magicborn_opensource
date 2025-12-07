// lib/core/mapEnums.ts
// Enums for map editor and environment system

/**
 * Type of placement on a map
 */
export enum PlacementType {
  Prop = "prop",
  SpawnPoint = "spawnPoint",
  Interactable = "interactable",
  Zone = "zone",
  Trigger = "trigger",
  Landmark = "landmark", // Special placement that links to nested map
}

/**
 * Precision level for coordinate placement
 */
export enum PrecisionLevel {
  Zone = "zone",        // Low precision - large areas
  Cell = "cell",        // Medium precision - grid cells
  Pixel = "pixel",      // High precision - individual pixels
  UnrealDirect = "unrealDirect", // Maximum precision - direct Unreal coordinates
}

/**
 * Type of landmark (determines what nested map it links to)
 */
export enum LandmarkType {
  Town = "town",
  Dungeon = "dungeon",
  Shop = "shop",
  Home = "home",
  Building = "building",
  Cave = "cave",
  Ruin = "ruin",
  Other = "other",
}

/**
 * Type of scene within a map
 */
export enum SceneType {
  Combat = "combat",
  Narrative = "narrative",
  Exploration = "exploration",
  Transition = "transition",
}

/**
 * Type of prop
 */
export enum PropType {
  Decorative = "decorative",
  Interactive = "interactive",
  Hazard = "hazard",
  Resource = "resource",
  Trigger = "trigger",
}

/**
 * Type of environmental modifier
 */
export enum ModifierType {
  Affinity = "affinity",
  ManaRegen = "manaRegen",
  DamageResist = "damageResist",
  DamageBonus = "damageBonus",
  StatusEffect = "statusEffect",
  Custom = "custom",
}

/**
 * Target of environmental modifier
 */
export enum ModifierTarget {
  Player = "player",
  Creature = "creature",
  All = "all",
  Spell = "spell",
}

/**
 * Map level in hierarchy (determines cell sizes and scaling)
 */
export enum MapLevel {
  World = "world",        // Level 0: Massive overworld (12km, 16px cells)
  Town = "town",          // Level 1: Towns/regions (2km, 10px cells)
  Interior = "interior",  // Level 2: Building interiors (500m, 8px cells)
  SmallInterior = "smallInterior", // Level 3: Small rooms (100m, 5px cells)
}


