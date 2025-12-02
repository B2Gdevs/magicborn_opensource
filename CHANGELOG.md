# Changelog

All notable changes to the Magicborn React project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Summary

**Magicborn** is a deterministic, progression-heavy spell crafting game built with React and Next.js. The core fantasy is that you're a spellcrafter in a dark, systems-driven world where there are **no character levels**—all power comes from crafting spells, casting them to build affinity and familiarity, evolving spells through named blueprints, and conquering raids.

### Core Systems

- **Spell Crafting**: Build nameless spells from runes (A-Z alphabet) with optional mana infusions
- **Combat System**: Deterministic damage calculation based on runes, player affinity, and spell growth
- **Progression**: 
  - Elemental affinity (per damage type) grows through casting
  - Rune familiarity (per rune code) grows through casting
  - Achievements/flags unlock evolution paths
- **Evolution**: Nameless → named spells via shape + power requirements; named → higher-tier via familiarity + flags
- **Raids**: Scripted encounter sequences that reward achievements and progression

### Current Status

✅ **Core systems implemented and tested:**
- Rune system with 26 runes (A-Z) and effect definitions
- Combat stats pipeline (CombatStatsService)
- Encounter resolution (EncounterService) with affinity-based resistance
- Element affinity system (AffinityService)
- Rune familiarity system (RuneFamiliarityService)
- Named spell blueprints with evolution gating
- Evolution service supporting nameless→named and named→named evolution
- Full test suite (30 tests passing across 9 test files)

### Added

- **Rune Familiarity System** (`RuneFamiliarityService`)
  - Tracks familiarity per rune code through spell casting
  - Named spells grow familiarity faster than nameless
  - Used for evolution gating (e.g., Searing Ember Ray requires 0.5 Fire familiarity)
  - Full test coverage

- **Familiarity-Gated Evolution**
  - `EvolutionService` now checks `minRuneFamiliarity` and `minTotalFamiliarityScore`
  - Searing Ember Ray evolution requires:
    - Named source: "Ember Ray"
    - Minimum familiarity thresholds for Fire, Air, Ray runes
    - Achievement flag: "boss_fire_1_defeated"
  - Test coverage in `EvolutionService.familiarity.test.ts`

- **Enhanced Named Spell Blueprints**
  - Added `requiresNamedSourceId` for named→named evolution chains
  - Added `minRuneFamiliarity` for per-rune familiarity gates
  - Added `minTotalFamiliarityScore` for aggregate familiarity requirements
  - Added `requiredFlags` for achievement-based gating

- **Test Infrastructure**
  - Vitest configuration with path alias resolution
  - Test factories for players and spells
  - Comprehensive test coverage for all core systems

### Changed

- **Evolution Service** (`evolutionService.ts`)
  - Enhanced `matchesBlueprint` to check familiarity requirements
  - Added support for `requiresNamedSourceId` gate
  - Improved logging for debugging evolution eligibility

- **Named Spells** (`namedSpells.ts`)
  - Updated Searing Ember Ray blueprint with familiarity and flag requirements
  - Added evolution chain documentation

### Technical Details

- **Tech Stack**: Next.js 14, React 18, TypeScript, Zustand, Vitest
- **Architecture**: Modular service-based design with clear separation of concerns
- **Testing**: 30 passing tests covering combat, evolution, affinity, familiarity, and data validation
- **Code Quality**: Strict TypeScript, comprehensive type definitions, test-driven development

---

## [0.1.0] - 2024-12-XX

### Initial Release

- Core spell crafting system
- Combat stats and encounter resolution
- Element affinity progression
- Named spell evolution system
- React UI for spell crafting and player management
- Full test suite with Vitest

