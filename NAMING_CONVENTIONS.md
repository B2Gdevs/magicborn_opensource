# Naming Conventions

## Entity Interface Naming

All entity definitions should follow the pattern: `*Definition`

### Current State
- ✅ `CharacterDefinition` - Correct
- ✅ `CreatureDefinition` - Correct  
- ✅ `EffectDefinition` - Correct
- ❌ `RuneDef` - Should be `RuneDefinition`
- ❌ `NamedSpellBlueprint` - Should be `SpellDefinition` or `NamedSpellDefinition`

### Migration Plan

1. **Rename `RuneDef` → `RuneDefinition`**
   - Update `lib/data/runes.ts`
   - Update all imports across codebase
   - Keep `RuneDef` as type alias for backward compatibility (temporary)

2. **Rename `NamedSpellBlueprint` → `SpellDefinition`**
   - Update `lib/data/namedSpells.ts`
   - Update all imports across codebase
   - Keep `NamedSpellBlueprint` as type alias for backward compatibility (temporary)

## Other Naming Patterns

- **Services**: `*Service` (e.g., `RuneService`, `AffinityService`)
- **Repositories**: `*Repository` or `*Repo` (e.g., `SpellRepository`)
- **Enums**: PascalCase (e.g., `EffectType`, `DamageType`)
- **Constants**: UPPER_SNAKE_CASE or PascalCase (e.g., `RC`, `HARDCODED_RUNES`)

