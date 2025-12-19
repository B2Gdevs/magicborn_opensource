# Collection and Interface Alignment Audit

This document tracks the alignment between Payload CMS collections and their corresponding TypeScript interfaces.

## Status Legend
- ✅ **Aligned**: Interface matches Payload collection structure
- ⚠️ **Misaligned**: Interface has differences from Payload collection
- ❌ **Missing**: No interface exists for this collection
- 🔄 **Needs Update**: Interface exists but needs to be updated

---

## Game Data Collections

### ✅ Runes
**Payload Collection**: `lib/payload/collections/Runes.ts`
**Interface**: `lib/packages/runes/index.ts` - `RuneDef`

**Status**: ✅ **Aligned** (recently fixed)
- Payload: `image` (upload relationship → Media)
- Interface: `imageId?: number` ✅
- All other fields match

**Fields**:
- `code`, `concept`, `powerFactor`, `controlFactor`, `instabilityBase`
- `tags`, `manaCost`, `damage`, `ccInstant`, `pen`
- `effects`, `overchargeEffects`, `dotAffinity`
- `imageId` (number) ✅

---

### ⚠️ Characters
**Payload Collection**: `lib/payload/collections/Characters.ts`
**Interface**: `lib/data/characters.ts` - `CharacterDefinition`

**Status**: ⚠️ **Misaligned**
- Payload: `image` (upload relationship → Media)
- Interface: `imagePath?: string` ❌ (should be `imageId?: number`)
- Payload: `slug` (unique text field)
- Interface: Uses `id` (string) - should map to `slug`
- Payload: `combatStats` (JSON field)
- Interface: Has individual combat stat fields (hp, maxHp, mana, etc.) - should be nested in `combatStats`

**Fields**:
- Payload: `slug`, `name`, `description`, `image`, `combatStats` (JSON), `runeFamiliarity` (JSON)
- Interface: `id`, `name`, `description`, `imagePath`, individual combat stats, `storyIds`, `controlBonus`, `costEfficiency`

**Action Required**: 
- Update `CharacterDefinition` to use `imageId?: number` instead of `imagePath?: string`
- Map `id` to `slug` field
- Nest combat stats in `combatStats` object

---

### ✅ Spells
**Payload Collection**: `lib/payload/collections/Spells.ts`
**Interface**: `lib/data/namedSpells.ts` - `NamedSpellBlueprint`

**Status**: ✅ **Aligned** (recently fixed)
- Payload: `image` (upload relationship → Media)
- Interface: `imageId?: number` ✅
- Payload: `spellId` (unique text field)
- Interface: `id: NamedSpellId` - maps to `spellId` in handlers ✅

**Fields**:
- Payload: `spellId`, `name`, `description`, `tags`, `image`, `requiredRunes`, `allowedExtraRunes`, `minDamageFocus`, `minTotalPower`, `requiresNamedSourceId`, `minTotalFamiliarityScore`, `minRuneFamiliarity`, `requiredFlags`, `effects`, `hidden`, `hint`
- Interface: `id`, `name`, `description`, `tags`, `imageId`, `requiredRunes`, `allowedExtraRunes`, `minDamageFocus`, `minTotalPower`, `requiresNamedSourceId`, `minRuneFamiliarity`, `minTotalFamiliarityScore`, `requiredFlags`, `effects`, `hidden`, `hint`

---

### ✅ Effects
**Payload Collection**: `lib/payload/collections/Effects.ts`
**Interface**: `lib/data/effects.ts` - `EffectDefinition`

**Status**: ✅ **Aligned** (recently fixed)
- Payload: `image` (upload relationship → Media)
- Interface: `imageId?: number` ✅
- Payload: `effectType` (select field, unique)
- Interface: `id: EffectType` - maps to `effectType` in handlers ✅
- Payload: `blueprint` (group with `baseMagnitude`, `baseDurationSec`, `self`)
- Interface: `blueprint: EffectBlueprint` ✅

**Fields**:
- Payload: `effectType`, `name`, `description`, `category`, `isBuff`, `maxStacks`, `iconKey`, `image`, `blueprint` (group)
- Interface: `id`, `name`, `description`, `category`, `blueprint`, `maxStacks`, `isBuff`, `iconKey`, `imageId`

---

### ✅ Objects
**Payload Collection**: `lib/payload/collections/Objects.ts`
**Interface**: None (created for Payload)

**Status**: ✅ **Aligned** (no legacy interface)
- Payload: `image` (upload relationship → Media)
- Forms use `imageMediaId` internally, store as `imageId` ✅

**Fields**:
- `slug`, `name`, `description`, `type`, `rarity`, `image`, `weight`, `value`

---

### ✅ Lore
**Payload Collection**: `lib/payload/collections/Lore.ts`
**Interface**: None (created for Payload)

**Status**: ✅ **Aligned** (no legacy interface)
- Payload: `featuredImage` (upload relationship → Media)
- Forms use `featuredImageId` internally ✅

**Fields**:
- `title`, `slug`, `category`, `content`, `excerpt`, `isPublic`, `featuredImage`, `relatedCharacters`, `relatedLocations`, `relatedLore`, `seo`

---

### ✅ Locations (Regions)
**Payload Collection**: `lib/payload/collections/Locations.ts`
**Interface**: None (created for Payload)

**Status**: ✅ **Aligned** (no legacy interface)
- Payload: `featuredImage` and `landmarkIcon` (upload relationships → Media)
- Forms use media IDs internally ✅

**Fields**:
- `name`, `slug`, `locationType`, `description`, `excerpt`, `isPublic`, `featuredImage`, `parentLocation`, `level`, `gridCells`, `landmarkIcon`, `relatedCharacters`

---

## Story Structure Collections

### Acts, Chapters, Scenes
**Payload Collections**: `lib/payload/collections/Acts.ts`, `Chapters.ts`, `Scenes.ts`
**Interfaces**: None (created for Payload)

**Status**: ✅ **Aligned** (no legacy interfaces)
- These are Payload-native collections with no legacy interfaces

---

## System Collections

### Users, Projects, ProjectMembers, Media, ProjectSnapshots, AIGenerations
**Payload Collections**: Various system collections
**Interfaces**: None (Payload-native)

**Status**: ✅ **Aligned** (Payload-native, no legacy interfaces)

---

## Summary

### Collections Needing Interface Updates

1. **Characters** (`CharacterDefinition`) - **See `CHARACTERS_COMBAT_STATS_CLARIFICATION.md`**
   - Change `imagePath?: string` → `imageId?: number`
   - Map `id` → `slug`
   - **Combat stats structure needs clarification** - see clarification document

### Collections Already Aligned

- ✅ Runes (`RuneDef`) - Fixed
- ✅ Spells (`NamedSpellBlueprint`) - Fixed
- ✅ Effects (`EffectDefinition`) - Fixed
- ✅ Objects - No legacy interface
- ✅ Lore - No legacy interface
- ✅ Locations - No legacy interface
- ✅ Story structure (Acts, Chapters, Scenes) - Payload-native
- ✅ System collections - Payload-native

---

## Pattern for All Collections

**Media References**:
- ❌ **Old**: `imagePath?: string` (file path)
- ✅ **New**: `imageId?: number` (Payload Media ID)

**ID Fields**:
- Payload uses specific field names: `slug`, `spellId`, `effectType`, `code`
- Interfaces should map to these field names, not use generic `id`

**Data Structure**:
- Payload stores complex objects as JSON fields (e.g., `combatStats`, `damage`, `effects`)
- Interfaces should match this structure

