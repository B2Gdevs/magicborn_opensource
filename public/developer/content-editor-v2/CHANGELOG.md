# Content Editor v2 Changelog

## 2024-12-17 - Initial NovelCrafter-Style Content Editor

### Summary
Major refactor transforming the "Development" section into a full-featured Content Editor inspired by NovelCrafter. This creates a platform for multi-project content management with Payload CMS as the backend.

### Features Added

#### 1. Content Editor Layout
- New dedicated layout at `/content-editor` with its own navigation (not using main app sidebar/topnav)
- "Back to App" link in Codex sidebar to return to main application
- Magicborn logo in sidebar header

#### 2. Project Management
- **Create New Project** dialog with name, description, and Magicborn Mode toggle
- **Project Switcher** dropdown to switch between projects
- **Project Settings** page at `/content-editor/[projectId]/settings`
  - Edit project name and description
  - Toggle Magicborn Mode (enables Spells, Runes, Effects categories)
  - Set default view preference (Grid, Matrix, Outline)
  - Delete project option (UI only, not wired)

#### 3. Codex Sidebar (NovelCrafter-style)
- Categories: Characters, Creatures, Regions, Objects/Items, Books & Stories
- Magicborn-only categories: Spells, Runes, Effects (shown when mode enabled)
- Expandable categories with entry lists
- Search functionality (UI ready)
- "New Entry" dropdown menu

#### 4. New Entry System
- Dropdown menu showing all available entry types
- Opens proper form modals for each type:
  - **Character** → Full CharacterForm with image upload, stats, affinity
  - **Creature** → Full CreatureForm with combat stats
  - **Rune** → Full RuneForm with damage vectors, effects, overcharge
  - **Region, Object, Story, Spell, Effect** → Placeholder modals (coming soon)

#### 5. Payload CMS Integration
- SQLite database at `data/payload.db`
- Collections: Users, Projects, ProjectMembers, Characters, Media
- Local API routes at `/api/payload/[...slug]`
- Versioning enabled for content types

#### 6. Content Navigation (Top Bar)
- Tabs: Plan, Write, Chat, Review (UI ready, not wired)
- View options: Grid, Matrix, Outline
- Export, Help, Search buttons

### Files Added
- `app/content-editor/` - Content editor routes
- `app/content-editor/layout.tsx` - Dedicated layout
- `app/content-editor/page.tsx` - Entry point with project creation flow
- `app/content-editor/[projectId]/page.tsx` - Main editor
- `app/content-editor/[projectId]/settings/page.tsx` - Project settings
- `app/api/payload/[...slug]/route.ts` - Payload API routes
- `app/admin/[[...segments]]/route.ts` - Payload Admin UI route
- `components/content-editor/` - All content editor components
  - `CodexSidebar.tsx` - Left sidebar with categories
  - `ContentEditor.tsx` - Main editor layout
  - `ContentNavigation.tsx` - Top navigation tabs
  - `ContentGridView.tsx` - Grid view for entries
  - `ProjectSwitcher.tsx` - Project dropdown
  - `NewEntryMenu.tsx` - New entry dropdown with form modals
  - `CreateProjectDialog.tsx` - Project creation dialog
  - `CreateEntryDialog.tsx` - Simple entry creation (deprecated)
- `lib/payload/` - Payload configuration
  - `collections/` - Users, Projects, Characters, etc.
  - `access/helpers.ts` - Access control functions
  - `hooks/useMagicbornMode.ts` - React hook for Magicborn mode
- `payload.config.ts` - Payload CMS configuration
- `PAYLOAD_SETUP.md` - Setup documentation
- `public/developer/content-editor-v2/` - Documentation folder

### Files Modified
- `components/ClientLayout.tsx` - Skip main nav for content-editor routes
- `components/SidebarNav.tsx` - Updated route to /content-editor
- `next.config.mjs` - Webpack config for Payload/better-sqlite3
- `package.json` - Added Payload CMS dependencies
- `tsconfig.json` - Added @payload-config path alias
- `.env.local` - Added PAYLOAD_SECRET and PAYLOAD_PUBLIC_SERVER_URL
- `infra/ai-stack/docker-compose.yml` - Added env vars for web service

### Known Issues
- Region creation not yet implemented (needs special hierarchical editor)
- Object/Item, Book/Story, Spell, Effect forms not yet created
- Plan, Write, Chat, Review tabs not functional
- No authentication flow (single superuser mode)
- Codex entries don't show in grid view yet (API integration pending)

### Next Steps
1. **Create Region Editor** - Hierarchical cell-based region system
2. **Wire remaining forms** - Objects, Stories, Spells, Effects
3. **Implement Plan tab** - Acts, Chapters, Scenes structure
4. **Implement Write tab** - Rich text editor with AI assistance
5. **Implement Chat tab** - AI conversation about project
6. **Implement Review tab** - Version history and comparison
7. **Add authentication** - Login flow and session management
8. **Connect Codex to entries** - Show created entries in grid/list views

### Technical Notes
- Payload CMS 3.x with SQLite adapter (libSQL format)
- Uses Payload Local API (not REST router)
- Separate database from existing Drizzle spells.db
- Form modals use existing Character/Creature/Rune forms



