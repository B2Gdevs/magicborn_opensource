# Code Organization Convention

## Directory Structure & Purpose

### `lib/core/` - Pure Game Mechanics
**Purpose**: Core game logic types, no data definitions

**Contains**:
- `types.ts` - BaseEntity, CombatActor, Player, Spell (game logic types)
- `combat.ts` - CombatStats, DamageVector, ResistVector (combat mechanics)
- `effects.ts` - EffectBlueprint, EffectInstance (how effects work)
- `enums.ts` - All enums (EffectType, DamageType, RuneTag, etc.)
- `spellTier.ts` - Spell tier logic

**Rule**: No entity data, no hardcoded values, only game mechanics

---

### `lib/data/` - Entity Definitions
**Purpose**: TypeScript interfaces for game entities (what exists in the game world)

**Contains**:
- `characters.ts` - `CharacterDefinition` (extends CombatActor + BaseEntity)
- `creatures.ts` - `CreatureDefinition` (extends CombatActor + BaseEntity)
- `effects.ts` - `EffectDefinition` (extends BaseEntity, contains EffectBlueprint)
- `namedSpells.ts` - `NamedSpellBlueprint` (extends BaseEntity)
- `runes.ts` - `RuneDef` (extends BaseEntity) ⚠️ **MOVE FROM packages/runes**
- `achievements.ts` - Achievement definitions

**Rule**: 
- All entities extend `BaseEntity`
- Only interfaces/types, no business logic
- No hardcoded data (move to seed files or Payload)

---

### `lib/packages/` - Business Logic & Services
**Purpose**: HOW things work (services, repositories, evaluators)

**Contains**:
- `runes/` - Rune services (loading, validation) ⚠️ **REMOVE RuneDef from here**
- `player/` - AffinityService, RuneFamiliarityService
- `combat/` - CombatStatsService, EncounterService
- `evaluator/` - Spell evaluation logic
- `evolution/` - Evolution service
- `cost/` - Cost calculation
- `repo/` - Data repositories (if needed)

**Rule**: 
- No data definitions (those go in `data/`)
- No hardcoded data arrays
- Pure business logic and services

---

### `lib/payload/` - CMS Schemas & Transformers
**Purpose**: Payload CMS integration

**Contains**:
- `collections/` - Payload collection schemas
- `handlers/` - Transformers (Payload ↔ Interface)
- `seed/` - Seed scripts

---

## Current Issues & Fixes

### Issue 1: `effects.ts` in both `core/` and `data/`
✅ **Correct** - They serve different purposes:
- `core/effects.ts` - `EffectBlueprint` (how effects work in game logic)
- `data/effects.ts` - `EffectDefinition` (entity definition with metadata)

### Issue 2: `runes` is in `packages/` but contains data definition
❌ **Wrong** - `RuneDef` should be in `data/runes.ts`

**Fix**:
1. Move `RuneDef` interface to `lib/data/runes.ts`
2. Move hardcoded `HARDCODED_RUNES` to `lib/payload/seed/runes.ts` (or remove if using Payload)
3. Keep loading logic in `packages/runes/` as a service

### Issue 3: Hardcoded data in `packages/runes/index.ts`
❌ **Wrong** - Hardcoded data should be:
- In Payload (preferred)
- Or in seed files
- Or removed if migrating to Payload

---

## Proposed File Structure

```
lib/
├── core/                    # Game mechanics only
│   ├── types.ts            # BaseEntity, CombatActor, etc.
│   ├── combat.ts           # CombatStats, DamageVector
│   ├── effects.ts          # EffectBlueprint, EffectInstance
│   ├── enums.ts            # All enums
│   └── spellTier.ts        # Spell tier logic
│
├── data/                    # Entity definitions (interfaces only)
│   ├── characters.ts       # CharacterDefinition
│   ├── creatures.ts        # CreatureDefinition
│   ├── effects.ts          # EffectDefinition
│   ├── namedSpells.ts      # NamedSpellBlueprint
│   ├── runes.ts            # RuneDef ⚠️ MOVE HERE
│   └── achievements.ts     # Achievement definitions
│
├── packages/                # Business logic & services
│   ├── runes/
│   │   └── RuneService.ts  # Loading, validation (NO data definitions)
│   ├── player/
│   │   ├── AffinityService.ts
│   │   └── RuneFamiliarityService.ts
│   ├── combat/
│   │   ├── CombatStatsService.ts
│   │   └── EncounterService.ts
│   └── ...
│
└── payload/                 # CMS integration
    ├── collections/        # Payload schemas
    ├── handlers/           # Transformers
    └── seed/               # Seed scripts
```

---

## Migration Steps

1. **Move RuneDef to data/**
   - Create `lib/data/runes.ts`
   - Move `RuneDef` interface from `packages/runes/index.ts`
   - Update imports

2. **Remove hardcoded data from packages/runes**
   - Move `HARDCODED_RUNES` to `payload/seed/runes.ts` OR remove if using Payload
   - Update `loadRunesFromDatabase()` to fetch from Payload API

3. **Create RuneService**
   - Move loading logic to `packages/runes/RuneService.ts`
   - Keep `getRUNES()`, `listRunes()` as service methods

4. **Update imports across codebase**
   - `RuneDef` → `@data/runes`
   - `getRUNES()` → `@packages/runes/RuneService`

---

## Naming Conventions

- **Interfaces**: `*Definition` (e.g., `CharacterDefinition`, `RuneDef`)
- **Services**: `*Service` (e.g., `RuneService`, `AffinityService`)
- **Repositories**: `*Repository` or `*Repo` (e.g., `SpellRepository`)
- **Enums**: PascalCase (e.g., `EffectType`, `DamageType`)

---

## Import Paths

Use consistent import aliases:
- `@core/*` - Core game mechanics
- `@data/*` - Entity definitions
- `@packages/*` - Business logic
- `@payload/*` - CMS integration

