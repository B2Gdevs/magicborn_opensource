# Data Consolidation Plan

## Current State: Triple Redundancy

You have three overlapping systems defining the same entities:

1. **Payload Collections** (`lib/payload/collections/`) - CMS schema for admin UI
2. **Drizzle SQLite Schemas** (`lib/data/*.schema.ts`) - SQLite database schemas
3. **TypeScript Interfaces** (`lib/packages/*/index.ts`, `lib/data/*.ts`) - App type definitions

## Recommended Approach: Payload CMS as Single Source of Truth

### Keep ✅

1. **Payload Collections** - Your CMS schema
   - `lib/payload/collections/Runes.ts`
   - `lib/payload/collections/Characters.ts`
   - `lib/payload/collections/Spells.ts`
   - `lib/payload/collections/Effects.ts`
   - etc.

2. **TypeScript Interfaces** - Type safety for app code
   - `lib/packages/runes/index.ts` - `RuneDef` interface
   - `lib/data/characters.ts` - `CharacterDefinition` interface
   - `lib/data/namedSpells.ts` - `NamedSpellBlueprint` interface
   - `lib/data/effects.ts` - `EffectDefinition` interface
   - `lib/core/types.ts` - `BaseEntity` interface

### Remove/Deprecate ❌

1. **Drizzle SQLite Schemas** - If migrating fully to Payload
   - `lib/data/runes.schema.ts` ❌
   - `lib/data/characters.schema.ts` ❌
   - `lib/data/spells.schema.ts` ❌
   - `lib/data/effects.schema.ts` ❌
   - `lib/data/creatures.schema.ts` ❌
   - `lib/data/spells.db.ts` - SQLite database setup ❌

2. **Hardcoded Fallback Data** - If all data is in Payload
   - `HARDCODED_RUNES` in `lib/packages/runes/index.ts` ❌
   - Other hardcoded data arrays ❌

### Migration Steps

1. **Update data loaders to use Payload instead of SQLite**
   - Replace `loadRunesFromDatabase()` to fetch from Payload API
   - Update `getRUNES()` to use Payload
   - Remove SQLite repository code

2. **Create Payload-to-Interface transformers**
   - Functions to convert Payload documents → TypeScript interfaces
   - Functions to convert TypeScript interfaces → Payload documents
   - These already exist in `NewEntryMenu.tsx` (e.g., `payloadToCharacter`)

3. **Remove SQLite dependencies**
   - Delete `lib/data/*.schema.ts` files
   - Delete `lib/data/spells.db.ts`
   - Remove `better-sqlite3` dependency if not used elsewhere
   - Remove Drizzle ORM if not used elsewhere

4. **Update imports**
   - Find all imports of `.schema.ts` files
   - Replace with Payload API calls

## Benefits

- ✅ Single source of truth (Payload CMS)
- ✅ No schema drift between systems
- ✅ Easier to maintain
- ✅ Better admin UI for content management
- ✅ Type safety maintained with TypeScript interfaces

## Files to Delete (After Migration)

```
lib/data/runes.schema.ts
lib/data/characters.schema.ts
lib/data/spells.schema.ts
lib/data/effects.schema.ts
lib/data/creatures.schema.ts
lib/data/environments.schema.ts
lib/data/maps.schema.ts
lib/data/mapPlacements.schema.ts
lib/data/mapRegions.schema.ts
lib/data/spells.db.ts
```

## Files to Keep

```
lib/payload/collections/*.ts          # CMS schemas
lib/packages/runes/index.ts           # RuneDef interface + logic
lib/data/characters.ts                # CharacterDefinition interface
lib/data/namedSpells.ts               # NamedSpellBlueprint interface
lib/data/effects.ts                   # EffectDefinition interface
lib/core/types.ts                     # BaseEntity + core types
```

