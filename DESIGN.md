# Rune Spell Engine – Living Design Doc (v0.5)

A deterministic, progression-heavy spell system: **no levels**, all power from **crafting, casting, affinity, familiarity, evolutions, and raids**.

---

## 1. Game Fantasy & Core Loop

### Fantasy

- You're a spellcrafter in a dark, systems-driven world.
- There are no character levels.
- Identity = the **spells you build**, the **elements you live in**, and the **choices you make in raids**.

### Core Loop

1. **Craft** nameless spells from runes (+ infusions).
2. **Test** them in combat encounters (raids, creatures).
3. **Grow**:
   - Elemental affinity (per `DamageType`) by casting.
   - Rune familiarity (per `RuneCode`) by casting.
   - Achievements / flags from encounters & raids.
4. **Evolve**:
   - Nameless → named spells via shape + power.
   - Named → higher-tier named spells via familiarity/flags.
5. **Recraft** stronger bases and repeat.

### Raids

- A raid = a small **scripted sequence of encounters** (tutorial ➜ advanced).
- Raids reward:
  - Achievements / flags (boss kills, no-hit clears, etc.).
  - Artifacts / items (later).
  - XP-events (affinity, familiarity gains).

**Status**

- [x] Loop + fantasy locked conceptually.
- [ ] First "tutorial raid" wired to real engine (goal: end-to-end happy path).

---

## 2. Core Data Model

### Core Types

- [x] `RuneCode`: A–Z core alphabet.
- [x] `DamageType` enum:
  - Physical, Fire, Ice, Water, Electric, Light, Void, Gravity, Mind, Heal.
- [x] Tag enums:
  - `RuneTag`, `SpellTag`, `CrowdControlTag`, `EffectType`.
- [x] `AlphabetVector`:
  - Generic "per-rune" or "per-letter" map (used for familiarity).
- [x] `DamageVector`:
  - `Partial<Record<DamageType, number>>` for burst / DoT.
- [x] `SpellGrowth`:
  - `power`, `control`, `stability`, `affinity`, `versatility`.
- [x] `Spell`:
  - `id: string`
  - `ownerId: string`
  - `name: string | null` (null = nameless)
  - `runes: RuneCode[]`
  - `profile: AlphabetVector`
  - `growth: SpellGrowth`
  - `infusions: number[]` (per-rune infusions)
  - `combat?: CombatStats`
  - `lastEval?: SpellEvalSnapshot`
  - `evolvedFrom?: string | null`
- [x] `Player`:
  - `id`, `name`
  - `hp`, `maxHp`, `mana`, `maxMana`
  - `elementXp: Record<DamageType, number>`
  - `elementAffinity: Record<DamageType, number>` (0–1)
  - `runeFamiliarity: AlphabetVector` (used by `RuneFamiliarityService`)
  - `spellbook: Spell[]`
  - **No `level` field** by design.

### Actor Unification

- [x] `CombatActor` (in `EncounterService`):
  - `id`, `name`
  - `hp`, `maxHp`
  - `mana`, `maxMana`
  - `elementXp?`, `elementAffinity?`
  - `effects: EffectInstance[]`
- [x] Players and creatures share combat behavior:
  - Same concept of affinities and effects.
- [ ] `Creature` type:
  - Thin alias/wrapper around `CombatActor` + extra fields (AI, loot, etc.).

**Status**

- [x] Core types and interfaces exist and are consistent.
- [ ] Small refactor to make `Creature` explicitly reuse `CombatActor`.

---

## 3. Runes, Effects, and Data

### Runes

- [x] `RUNES: Record<RuneCode, RuneDef>`:
  - `code`, `concept`
  - `powerFactor`, `controlFactor`, `instabilityBase`
  - `tags: RuneTag[]`
  - `manaCost`
  - Optional:
    - `damage?: DamageVector`
    - `pen?: Partial<Record<DamageType, number>>`
    - `dotAffinity?: DamageType`
    - `ccInstant?: CrowdControlTag[]`
    - `effects?: RuneEffectSpec[]`
    - `overchargeEffects?: RuneOverchargeSpec[]`
- [x] Fire (`F`) is a strong reference:
  - Primarily Fire damage.
  - Burn effect.
  - Overcharge tiers scaling Burn + potentially Vulnerable.
- [x] Other runes (Mind, Water, Ray, Air, etc.) have sensible defaults.
- [x] Helper: `listRunes()` for UI / debug.

### Effects

- [x] `EffectType` enum:
  - Burn, Poison, Bleed, Shock, Slow, Stun, Silence, Shield, Regen, Vulnerable, Fortified, etc.
- [x] `EffectBlueprint` (static def) and `EffectInstance` (runtime).
- [x] `EFFECT_DEFS`:
  - Every `EffectType` has a definition.
  - Check for non-zero magnitude & sane durations.
  - All rune-defined effects reference valid `EffectType`.

**Status**

- [x] Runes + EFFECT_DEFS wired and tested.
- [ ] Further tuning of rune numbers once we play with real encounters.
- [ ] More interesting overcharge patterns for non-Fire runes.

---

## 4. Progression: Affinity, Familiarity, Achievements

### Element Affinity (DamageType-based)

- [x] `AffinityService`:
  - `recordSpellUse(player, spell)`:
    - Looks at `spell.combat` burst + full DoT damage.
    - Distributes XP to `elementXp` based on elemental contribution.
    - Recomputes `elementAffinity` via `recomputeAffinityMap`.
  - `getAffinity(player, DamageType)`:
    - Returns normalized affinity (0–1).
- [x] Combat uses **elementAffinity** for both:
  - Offensive scaling (in `CombatStatsService`).
  - Defensive mitigation (in `EncounterService`).

### Rune Familiarity (RuneCode-based)

- [x] `RuneFamiliarityService`:
  - `recordSpellCast(player, spell)`:
    - Increments internal familiarity for each rune used.
    - Produces normalized familiarity values (0–1-ish).
  - `getSpellRuneFamiliarityScore(player, spell)`:
    - Aggregates the familiarity across the spell's runes.
- ✅ **Design choice**: familiarity is **NOT used in combat math** right now.
  - It is used for **evolution gates** (e.g. Searing Ember Ray).
  - Later we might have small QoL perks, but not raw damage.

### Achievements / Flags

- Current state:
  - [x] Evolution blueprints accept `requiredFlags?: string[]`.
  - [x] `EvolutionService` accepts `playerFlags: Set<string>` from caller.
  - [x] Familiarity tests simulate flags like `"boss_fire_1_defeated"`.
  - [ ] Centralized `AchievementFlag` enum / module.
  - [ ] Real system to grant flags from raids/encounters.

**Status**

- [x] Affinity + familiarity systems implemented and tested (unit level).
- [x] Familiarity + flags successfully gate a named → named evolution.
- [ ] Achievement system needs to be made first-class (not just string Sets).

---

## 5. Combat Stats Pipeline

### CombatStatsService

- [x] `derive(spell: Spell, player: Player)`:
  - If `spell.combat` missing, builds it from:
    - Runes.
    - Player's `elementAffinity`.
    - Spell `growth`.
  - Outputs `combat: CombatStats`:
    - `burst: DamageVector`
    - `dot: DamageVector`
    - `dotDurationSec: number`
    - `penetration: Partial<Record<DamageType, number>>`
    - `critChance`, `critMult`
    - `ccTags: CrowdControlTag[]`
    - `effects: EffectInstance[]`
  - Key rules:
    - Rune `damage` values contribute to burst, split by rune index.
    - `dotAffinity` + traits spill a portion of burst into DoT.
    - Infusions/overcharge increase damage and can strengthen effects.
    - Player `elementAffinity` scales that element's contributions.
- [x] Tests (all green):
  - Single Fire rune deals only Fire damage for neutral player.
  - Fire rune gets stronger with Fire affinity.
  - Infused Fire rune is stronger than base.
  - Canonical Fire Ray fixtures:
    - Base Fire Ray is mostly Fire.
    - Infused Fire Ray has higher Fire burst than base.

### EncounterService

- [x] `EncounterService.resolveSpellHit(caster, spell, target)`:
  1. Ensures `spell.combat` via `CombatStatsService.derive`.
  2. For each `DamageType`:
     - Reads `base = combat.burst[type]`.
     - Gets target's affinity for that element via `AffinityService.getAffinity`.
     - Applies `computeDefensiveMultiplier(affinity)`:
       - 0 affinity → 1.0 (no mitigation).
       - 1 affinity → 0.5 (50% damage taken).
  3. Sums `perType` into `totalDamage`.
  4. Reduces `target.hp` (clamped to 0).
  5. Copies `combat.effects` onto `target.effects`.
- [x] Tests (all green):
  - Fire-heavy spell damages neutral goblin; HP goes down.
  - Fire-resistant goblin (higher Fire affinity) takes less Fire damage than neutral goblin.
  - Fire rune applies **Burn** effect to target.

**Status**

- [x] Combat pipeline stable and fully covered for Fire-heavy scenarios.
- [ ] Later: incorporate DoT ticking, penetration vs affinity, etc.
- [ ] Possibly add multi-hit/turn-based helpers for fights.

---

## 6. Named Spells & Evolution

### NamedSpellBlueprint

- [x] Shape:
  ```ts
  interface NamedSpellBlueprint {
    id: NamedSpellId;
    name: string;
    description: string;
    tags: SpellTag[];
    requiredRunes: RuneCode[];
    allowedExtraRunes?: RuneCode[];
    minDamageFocus?: { type: DamageType; ratio: number };
    minTotalPower?: number;
    hidden: boolean;
    hint: string;
    // Evolution gating:
    requiresNamedSourceId?: NamedSpellId; // named → named
    minRuneFamiliarity?: Partial<Record<RuneCode, number>>;
    minTotalFamiliarityScore?: number;
    requiredFlags?: string[];
  }
  ```

### Current Blueprints

- **ember_ray**
  - Fire-focused ray; F + A + R.
  - `minDamageFocus` Fire ≥ 0.6.
  - `minTotalPower` tuned to match a reasonable Fire Ray.
- **searing_ember_ray**
  - Tier-2 evolution of Ember Ray.
  - Stronger gating:
    - `requiresNamedSourceId: "ember_ray"`.
    - `minTotalFamiliarityScore` for Ember Ray line.
    - `requiredFlags: ["boss_fire_1_defeated"]` (or similar).
    - `minTotalPower` tuned: stronger than Ember Ray's requirement.
- **mind_lance**
  - Mind + Ray; psychic strike, can Silence.
- **tidal_barrier**
  - Water + Crystal; defensive, Shield + Regen flavor.

### EvolutionService

- [x] `listPossibleEvolutions(spell, player?, flags?)`:
  - Uses:
    - Runes (requiredRunes + allowedExtraRunes).
    - Damage focus (minDamageFocus).
    - Total power (minTotalPower).
    - `requiresNamedSourceId` for named → named chains.
    - Familiarity (minRuneFamiliarity, minTotalFamiliarityScore).
    - Achievements / flags (requiredFlags).
  - Returns `SpellEvolutionOption[]` sorted by score.
- [x] `evolveSpell(spell, blueprintId, player?, flags?)`:
  - Validates via `matchesBlueprint`.
  - Returns a new `Spell`:
    - `name = bp.name`
    - `evolvedFrom = spell.id`
    - Keeps runes, growth, combat (no levels; evolution is identity).
- [x] Tests (all green):
  - Ember Ray basic evolution:
    - Correct candidate appears for a fire-focused FAR spell.
    - Wrong runes / low fire focus do NOT qualify.
    - `evolveSpell` stamps name and `evolvedFrom`.
  - Familiarity-gated evolution:
    - Searing Ember Ray not available:
      - Before familiarity / flags.
    - Searing Ember Ray available:
      - After repeated Ember Ray casts +
      - Required flag set.
    - Evolving to Searing Ember Ray:
      - Produces non-null spell.
      - Preserves runes.
      - Growth power doesn't regress.

**Status**

- [x] Core evolution & familiarity-gated evolution are in place and tested.
- [ ] Expand the spell catalog:
  - More Fire-line evolutions (AOEs, close-range, etc.).
  - Other elements (Mind-line, Water-line, Void-line).
- [ ] Add more varied gating patterns:
  - Affinity thresholds.
  - Specific rune familiarity mixes.
  - Multiple flags.

---

## 7. Encounters & Raids

### Encounters

A single combat interaction between:
- One caster (player or creature),
- One target,
- One spell.

Engine-level pieces:
- [x] `EncounterService.resolveSpellHit`:
  - Already used in tests to simulate player → goblin.
- [ ] Future: multi-turn encounter orchestration:
  - Turn order.
  - Repeated casts.
  - DoT ticking.
  - Logging combat events for UI / replay.

### Raids

High-level concept:
- A raid is a scripted series of encounters with:
  - Creature lineup.
  - Environmental modifiers (later).
- Rewards:
  - Affinity gains (via casts).
  - Achievements / flags.
  - Items/artifacts (later).

Proposed data model sketch (not yet implemented):

```ts
interface RaidEncounterDef {
  id: string;
  creatures: CreatureDef[];
  // later: terrain, hazards, scripted events, etc.
}

interface RaidRewardDef {
  achievementFlags?: string[];
  // later: items, currencies, unlock tokens, etc.
}

interface RaidDef {
  id: string;
  name: string;
  description: string;
  encounters: RaidEncounterDef[];
  rewards: RaidRewardDef;
}
```

Goal for the tutorial raid:
- Player starts with:
  - A simple nameless Fire Ray–like spell (or blueprint to craft it).
- Raid:
  - 1–2 simple goblin encounters.
- Outcome:
  - Player casts enough Fire to:
    - Gain obvious Fire affinity (visible to UI).
    - Possibly unlock/approach Ember Ray evolution.
  - Player earns a basic achievement flag (e.g. "raid_tutorial_cleared").

**Status**

- [x] Building blocks (spells, players, creatures-in-concept, encounters).
- [ ] Concrete `RaidDef` model and a first "Tutorial Raid".
- [ ] Raid-run helper:
  - Given `RaidDef` + player + spell loadout,
  - Simulate sequence of encounters (even if minimal/turn-less at first),
  - Emit flags/XP.

---

## 8. Runtime Facade & UI / Unity Usage

We want a clean core API usable from:
- The TypeScript test harness and tools.
- Future UI (React/Next).
- Future Unity/C# port.

### SpellRuntime (TS side)

Target shape (some of this already exists, some is just solidifying names):

```ts
interface EvolutionContext {
  player: Player;
  flags: Set<string>;
}

class SpellRuntime {
  constructor(
    private readonly combatStats: CombatStatsService,
    private readonly encounter: EncounterService,
    private readonly evolution: EvolutionService,
  ) {}

  createNamelessSpell(ownerId: string, runes: RuneCode[], infusions?: number[]): Spell { ... }
  
  evaluateSpell(spell: Spell, player: Player): Spell {
    // recompute profile, growth, eval snapshot, and combat
  }

  listEvolutions(spell: Spell, ctx: EvolutionContext): SpellEvolutionOption[] {
    return this.evolution.listPossibleEvolutions(spell, ctx.player, ctx.flags);
  }

  evolveSpell(spell: Spell, blueprintId: NamedSpellId, ctx: EvolutionContext): Spell | null { ... }

  castSpell(spell: Spell, caster: Player | Creature, target: Creature | Player): SpellHitResult {
    const result = this.encounter.resolveSpellHit(caster, spell, target);
    AffinityService.recordSpellUse(casterAsPlayerIfApplicable, spell);
    RuneFamiliarityService.recordSpellCast(casterAsPlayerIfApplicable, spell);
    return result;
  }
}
```

In the current code, these responsibilities are already implemented across `SpellRuntime`, `CombatStatsService`, `EncounterService`, `AffinityService`, and `RuneFamiliarityService`; the facade just wraps them for the game/UI.

### Unity / C# Port

When porting to Unity:
- Keep the shape of the runtime API:
  - `CreateNamelessSpell`, `EvaluateSpell`, `ListEvolutions`, `EvolveSpell`, `CastSpell`.
- Use C# equivalents:
  - `Dictionary<DamageType, float>` for `DamageVector`.
  - `Dictionary<RuneCode, float>` for familiarity maps.
  - Classes for `Spell`, `Player`, `Creature`, `EffectInstance`.

Example (C# pseudo):

```csharp
public class SpellRuntime {
    private CombatStatsService combatStats;
    private EncounterService encounter;
    private EvolutionService evolution;

    public SpellRuntime(CombatStatsService stats, EncounterService enc, EvolutionService evo) {
        combatStats = stats;
        encounter = enc;
        evolution = evo;
    }

    public Spell CreateNamelessSpell(string ownerId, List<RuneCode> runes, List<int> infusions = null) { ... }
    public Spell EvaluateSpell(Spell spell, Player player) { ... }
    public List<SpellEvolutionOption> ListEvolutions(Spell spell, EvolutionContext ctx) { ... }
    public Spell EvolveSpell(Spell spell, NamedSpellId id, EvolutionContext ctx) { ... }
    public SpellHitResult CastSpell(Spell spell, ICombatActor caster, ICombatActor target) { ... }
}
```

**Status**

- [x] Underlying services exist and are working (CombatStats, Encounter, Evolution, Affinity, Familiarity).
- [ ] Finalize `SpellRuntime` API surface and tests (integration-style).
- [ ] Document a 1:1 C# analog for when we port to Unity.

---

## 9. Tests, Fixtures, and Layout

### Test Factories & Fixtures

- `makeTestPlayer`, `makeTestSpell` in `testFactories`.
- Canonical Fire Ray fixtures in CombatStats tests.
- Familiarity/evolution fixtures (Ember Ray → Searing Ember Ray).

### Test Layout

- `lib/__tests__/combat`
  - `CombatStatsService.test.ts`
  - `EncounterService.test.ts`
- `lib/__tests__/evolution`
  - `EvolutionService.test.ts`
  - `EvolutionService.emberRay.test.ts`
  - `EvolutionService.familiarity.test.ts`
- `lib/__tests__/player`
  - `AffinityService.test.ts`
  - `RuneFamiliarityService.test.ts`
- `lib/__tests__/data`
  - `effects.test.ts`
  - `namedSpells.test.ts`

**Status**

- [x] All current tests green (30 tests passing).
- [ ] Add:
  - Creature-centric tests (creatures as casters).
  - Simple end-to-end "mini-raid" style test (player + spell vs goblin over several casts).

---

## 10. Current Status Snapshot

### Green & Stable

- Core types, runes, effects.
- `CombatStatsService` (with Fire-focused fixtures).
- `EncounterService` (damage + effects + resistance via affinity).
- `AffinityService` (XP → affinity).
- `RuneFamiliarityService` (for evolution gating).
- Named spells:
  - Ember Ray
  - Searing Ember Ray (familiarity + flag gated)
  - Mind Lance
  - Tidal Barrier
- `EvolutionService`:
  - Nameless → named.
  - Named → higher-tier named (Searing Ember Ray).
- All unit tests currently passing (30 tests, 9 files).

### Conceptually Locked

- No levels; progression via:
  - Affinity, familiarity, evolutions, raids, achievements.
- Runes as primary programming language of magic.
- Raids as main content loop to test spells.

---

## 11. Immediate Next Tasks (Short-Term, Testable)

Ordered for ease of development and testing.

### 1) Small Achievement / Flag API

- Create a tiny `achievements.ts` (or similar) module:
  - `export enum AchievementFlag { BossFire1Defeated = "boss_fire_1_defeated", ... }`
- Replace raw strings in named spell blueprints and tests with the enum.
- Optional: helper like `hasFlag(flags: Set<string>, flag: AchievementFlag)`.

**Why**: Centralizes world flags so evolution gating doesn't rely on magic strings.

### 2) Expand Fire Spell Family

- Create `lib/data/spells/fire.ts` and move Fire-related blueprints there:
  - `EMBER_RAY_BLUEPRINT`
  - `SEARING_EMBER_RAY_BLUEPRINT`
  - New ones, e.g.:
    - `FLAME_LASH_BLUEPRINT` (short-range, high Burn).
    - `FIRE_NOVA_BLUEPRINT` (AOE, high minTotalPower).
- Re-export `NamedSpellBlueprints` from `namedSpells.ts` (or an index).
- Add tests:
  - `EvolutionService.fireFamily.test.ts` to validate:
    - Correct matching based on power/focus.
    - Basic familiarity / flag gates for at least one of the new spells.

**Why**: Stress-tests evolution with more than one Fire path and gets us closer to "this is most of the gameplay."

### 3) Creatures as Full Casters

- Implement a `Creature` type that reuses `CombatActor`:
  - Add a `spellbook: Spell[]` for offensive casters.
- Add data fixtures, e.g. `lib/data/creatures/goblins.ts`:
  - `makeNeutralGoblin()`
  - `makeFireResistantGoblin()`
  - `makeFireMageGoblin()` (with a fire spell).
- Add tests:
  - `EncounterService.creatures.test.ts`:
    - Fire mage goblin casting Fire spell on player → Fire damage and Burn.
    - Player with high Fire affinity takes less damage from same spell.

**Why**: Validates the "player and creature use same combat model" design and prepares for raids.

### 4) Minimal SpellRuntime Integration Test

- Finalize a `SpellRuntime` (or similar facade) with:
  - `createNamelessSpell`
  - `evaluateSpell`
  - `listEvolutions`
  - `evolveSpell`
  - `castSpell`
- Add `SpellRuntime.test.ts`:
  - Create player + goblin.
  - Create nameless Fire spell (FAR).
  - Evaluate it and cast it on a goblin:
    - Goblin HP down.
    - Burn applied.
    - Player Fire affinity ticked up.
  - Call `listEvolutions` and show Ember Ray as a valid option.

**Why**: Gives us a real "end-to-end" test entrypoint, mirrors how the UI/Unity client will actually talk to the engine.

### 5) Outline Tutorial Raid Data Model

- Add a lightweight `RaidDef` + `RaidEncounterDef` interface and one `tutorialRaid` constant (even if not fully used yet).
- Write a sketchy `runRaid(tutorialRaid, player, spells)` helper in tests that:
  - Runs a couple of `resolveSpellHit` calls.
  - Grants one achievement flag.
  - Shows Fire affinity increase.

**Why**: Starts the process of turning all of this into actual gameplay content with a clear end-to-end story.

---

## Version History

- **v0.5** (Current): Core systems implemented, familiarity-gated evolution working, 30 tests passing
- **v0.4**: Added rune familiarity system
- **v0.3**: Enhanced evolution service with named→named chains
- **v0.2**: Combat and encounter systems
- **v0.1**: Initial spell crafting and affinity systems

