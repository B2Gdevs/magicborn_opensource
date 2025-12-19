# Characters Combat Stats Clarification

## Current Situation

### Payload Collection Structure
**File**: `lib/payload/collections/Characters.ts`

Payload stores combat stats as a **JSON field** called `combatStats`:
```typescript
{
  name: 'combatStats',
  type: 'json',
  required: false,
  admin: {
    description: 'Combat stats (only visible when Magicborn Mode is enabled)',
  },
}
```

### CharacterDefinition Interface
**File**: `lib/data/characters.ts`

The `CharacterDefinition` interface **extends `CombatActor`**, which has **flat fields**:
```typescript
export interface CharacterDefinition extends CombatActor {
  description: string;
  imagePath?: string;
  storyIds: string[];
  controlBonus?: number;
  costEfficiency?: number;
}

// CombatActor has:
export interface CombatActor {
  id: string;
  name: string;
  mana: number;
  maxMana: number;
  hp: number;
  maxHp: number;
  affinity: AlphabetVector;
  elementXp?: ElementXpMap;
  elementAffinity?: ElementAffinityMap;
  effects: EffectInstance[];
}
```

### Current Form Implementation
**File**: `components/character/CharacterForm.tsx`

The form currently:
1. Collects individual fields: `hp`, `maxHp`, `mana`, `maxMana`, `affinity`, `elementXp`, `elementAffinity`, `controlBonus`, `costEfficiency`
2. **Nests them into `combatStats` JSON** when saving to Payload:
```typescript
[CHARACTER_FIELDS.CombatStats]: {
  hp: character.hp,
  maxHp: character.maxHp,
  mana: character.mana,
  maxMana: character.maxMana,
  affinity: character.affinity,
  ...(character.elementXp && { elementXp: character.elementXp }),
  ...(character.elementAffinity && { elementAffinity: character.elementAffinity }),
  ...(character.controlBonus !== undefined && { controlBonus: character.controlBonus }),
  ...(character.costEfficiency !== undefined && { costEfficiency: character.costEfficiency }),
}
```

3. But returns a **flat `CharacterDefinition`** object (extending `CombatActor`) from `prepareCharacter()`

## The Question

**Should `CharacterDefinition` keep the flat structure (extending `CombatActor`) or should it have a nested `combatStats` object?**

### Option 1: Keep Flat Structure (Current)
- **Pros**: 
  - Matches `CombatActor` interface used throughout the game logic
  - Easy to use in combat systems
  - Form can directly bind to fields
- **Cons**:
  - Mismatch with Payload storage (JSON field)
  - Requires transformation when saving/loading from Payload
  - `effects` field is runtime state, shouldn't be in definition

### Option 2: Nested `combatStats` Object
- **Pros**:
  - Matches Payload storage structure exactly
  - No transformation needed
  - Clear separation between definition and runtime state
- **Cons**:
  - Doesn't match `CombatActor` interface
  - Would need to transform when using in combat systems
  - More complex form binding

### Option 3: Hybrid Approach
- Keep `CharacterDefinition` flat (extending `CombatActor`)
- Add a `combatStats` property that contains the nested structure
- Transform between flat and nested when saving/loading from Payload
- **This is what we're currently doing**

## Recommendation

**Keep Option 1 (Flat Structure)** because:
1. `CombatActor` is the core interface used throughout the game logic
2. Characters need to be usable as `CombatActor` instances in combat
3. The transformation layer (form → Payload) already handles the nesting
4. `effects` should remain in `CombatActor` as it's part of the combat state

**But we should**:
- Update `CharacterDefinition` to use `imageId?: number` instead of `imagePath?: string`
- Map `id` to Payload's `slug` field
- Keep the transformation logic in `handleCreateCharacter` that nests combat stats

## Questions for You

1. **Do you want characters to be usable directly as `CombatActor` instances?** (If yes, keep flat structure)
2. **Should `effects` be stored in Payload or only be runtime state?** (Currently runtime only)
3. **Do you want `combatStats` to be a separate nested object in the interface, or keep it flat?**

