# Magicborn

> A deterministic, progression-heavy spell crafting game where **there are no character levels**—all power comes from crafting spells, building affinity and familiarity through casting, evolving spells through named blueprints, and conquering raids.

[![Tests](https://img.shields.io/badge/tests-30%20passing-brightgreen)](https://github.com/B2Gdevs/magicborn_opensource)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![Vitest](https://img.shields.io/badge/Vitest-4.0-yellow)](https://vitest.dev/)

## 🎮 Core Fantasy

You're a spellcrafter in a dark, systems-driven world. Your identity isn't defined by character levels—it's defined by:
- **The spells you build** from runes (A-Z alphabet)
- **The elements you master** through repeated casting
- **The evolution paths you unlock** by proving your mastery
- **The choices you make** in raids and encounters

## ✨ Key Features

### 🧙 Spell Crafting
- Build nameless spells from 26 runes (A-Z)
- Infuse runes with extra mana for enhanced effects
- Each rune contributes damage, effects, and traits
- Real-time preview of spell stats and costs

### ⚔️ Deterministic Combat
- Damage calculated from runes, player affinity, and spell growth
- Elemental affinity provides both offensive scaling and defensive resistance
- Status effects (Burn, Slow, Shield, etc.) with stacking mechanics
- No RNG in core damage calculations—pure systems-driven gameplay

### 📈 Dual Progression System

**Element Affinity** (per damage type)
- Grows by casting spells of that element
- Scales offensive damage and provides defensive resistance
- Visible progression as you specialize

**Rune Familiarity** (per rune code)
- Grows by using runes in spells
- Named spells grow familiarity faster than nameless
- Gates evolution paths—master runes to unlock advanced spells

### 🌱 Spell Evolution

**Nameless → Named**
- Match spell shape and power requirements
- Unlock named blueprints like "Ember Ray" or "Mind Lance"
- Evolution preserves your spell's identity and growth

**Named → Higher-Tier Named**
- Requires familiarity thresholds for specific runes
- Requires achievement flags from raids
- Example: "Ember Ray" → "Searing Ember Ray" (requires 0.5 Fire familiarity + boss flag)

### 🏰 Raids (Coming Soon)
- Scripted encounter sequences
- Reward achievements/flags that unlock evolution paths
- Test your crafted spells against challenging encounters

## 🏗️ Architecture

### Core Systems

- **CombatStatsService**: Derives combat stats from runes, affinity, and growth
- **EncounterService**: Resolves spell hits with affinity-based resistance
- **AffinityService**: Tracks elemental XP and computes affinity (0-1)
- **RuneFamiliarityService**: Tracks rune usage and familiarity scores
- **EvolutionService**: Matches spells to blueprints and handles evolution

### Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **State**: Zustand for game state management
- **Testing**: Vitest with comprehensive test coverage
- **Styling**: Tailwind CSS

### Project Structure

```
lib/
├── core/           # Core types, enums, interfaces
├── data/           # Named spell blueprints, effect definitions
├── packages/       # Service modules (combat, evolution, player, etc.)
└── __tests__/      # Comprehensive test suite (30 tests)
```

## 🧪 Testing

All systems are fully tested with 30 passing tests across 9 test files:

```bash
npm test          # Run tests in watch mode
npm run test:run  # Run tests once
```

Test coverage includes:
- ✅ Combat stats derivation
- ✅ Encounter resolution with affinity resistance
- ✅ Element affinity progression
- ✅ Rune familiarity tracking
- ✅ Evolution matching and gating
- ✅ Named spell blueprint validation
- ✅ Effect definitions and rune compatibility

## 📚 Documentation

- **[CHANGELOG.md](./CHANGELOG.md)**: Project history and ongoing changes
- **[DESIGN.md](./DESIGN.md)**: Complete living design document (v0.5)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/B2Gdevs/magicborn_opensource.git
cd magicborn_opensource

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test
```

### Development

The project uses:
- TypeScript for type safety
- Path aliases (`@core/*`, `@pkg/*`, `@data/*`) for clean imports
- Vitest for fast, reliable testing
- Next.js App Router for modern React patterns

### Waitlist Setup

To enable the "Join Waitlist" button in the navigation, create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_WAITLIST_URL=https://your-waitlist-form-url.com
```

**Recommended services for waitlist + content distribution:**

1. **ConvertKit** (Best for creators)
   - Free tier: Up to 1,000 subscribers
   - Easy content distribution (stories, updates, newsletters)
   - Perfect for sending game stories and updates
   - Website: https://convertkit.com

2. **Mailchimp** (Good free tier)
   - Free tier: Up to 500 contacts
   - Newsletter and content distribution
   - Website: https://mailchimp.com

3. **Buttondown** (Simple, creator-friendly)
   - Free tier: Up to 1,000 subscribers
   - Built for content creators
   - Website: https://buttondown.email

4. **Substack** (Content-first)
   - Free to use, takes % of paid subscriptions
   - Perfect for story distribution and serialized content
   - Website: https://substack.com

The waitlist button will only appear when `NEXT_PUBLIC_WAITLIST_URL` is configured.

## 🎯 Current Status

### ✅ Implemented & Tested

- Core spell crafting system
- Combat stats and encounter resolution
- Element affinity progression
- Rune familiarity tracking
- Named spell evolution (nameless→named and named→named)
- Familiarity-gated evolution chains
- React UI for spell crafting
- Full test suite (30 tests passing)

### 🚧 In Progress

- Achievement/flag system (currently string-based, needs enum)
- Creature casting system
- Raid data model and execution
- SpellRuntime facade for clean API

### 📋 Planned

- Tutorial raid implementation
- Expanded spell families (Fire, Mind, Water, Void lines)
- Multi-turn encounter orchestration
- Unity/C# port documentation

## 🤝 Contributing

This is an open-source project. Contributions are welcome! Please see our design document for the full vision and roadmap.

## 📄 License

[Add your license here]

## 🙏 Acknowledgments

Built with a focus on deterministic, systems-driven gameplay where player skill and strategic choices matter more than RNG.

---

**Version**: 0.1.0  
**Status**: Core systems stable, evolution working, ready for content expansion

