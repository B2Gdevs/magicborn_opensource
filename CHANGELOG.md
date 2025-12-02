# Changelog - Magicborn: Modred's Legacy

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Landing Page Redesign**
  - Hero video section with looping videos
  - Magicborn logo prominently displayed
  - Book-like literary text with subtle color accents
  - Dark fantasy aesthetic with minimal design
  
- **Navigation System**
  - Left sidebar navigation (Spotify-like minimal design)
  - Transparent navigation overlaying video background
  - Brand logo in sidebar
  - Discord and GitHub links in footer
  
- **About Page** (`/about`)
  - Runes showcase (all 26 runes A-Z with icons)
  - Named spells display with descriptions and requirements
  - Spell effects showcase with categories
  - Placeholders for creatures, items, and weapons
  - Community Discord CTA
  
- **Video System**
  - Native HTML5 video player with smooth transitions
  - Continuous looping through multiple videos
  - Fallback image support
  - No flicker video loading
  
- **Branding**
  - Magicborn logo integration
  - Brand images in sidebar
  - Consistent dark fantasy theme
  
- **Documentation**
  - Website development roadmap
  - Task prioritization system
  - Development status tracking

### Changed
- **Design System**
  - Transitioned to minimal, Spotify-like design
  - Removed complex gradients and overlays
  - Pure black backgrounds with subtle accents
  - Book-like typography for story content
  
- **Navigation**
  - Moved from top nav to left sidebar
  - Transparent navigation elements
  - Clean, minimal styling

### Technical
- **Video Playback**
  - Replaced react-player with native video element
  - Improved loading states and transitions
  - Better error handling
  
- **Data Integration**
  - About page pulls from `lib/data` static files
  - Named spells from `lib/data/namedSpells.ts`
  - Effects from `lib/data/effects.ts`
  - Rune icons from `public/game-icons/runes/`

## [0.1.0] - Initial Release

### Core Systems
- Spell crafting system
- Rune system (A-Z)
- Combat system (deterministic)
- Evolution system
- Affinity system
- Rune familiarity system
- Player progression (no levels)

### Testing
- Comprehensive test suite with Vitest
- 30+ tests passing
- Test coverage for core systems

### Development
- Next.js 14 setup
- TypeScript configuration
- Zustand state management
- Tailwind CSS styling
