# Content Editor v2 - Setup Log

This document tracks the step-by-step setup process for the Payload CMS integration.

## Setup Date: 2024-12-17

### Phase 1: Installation ✅

**Commands Run:**
```bash
npm install 'payload@^3.0.0' '@payloadcms/next@^3.0.0' '@payloadcms/db-sqlite@^3.0.0' '@payloadcms/richtext-lexical@^3.0.0' --legacy-peer-deps
```

**Result:** 
- Payload 3.68.5 installed
- All dependencies installed successfully
- Note: Used `--legacy-peer-deps` due to Next.js 14 vs Payload 3.x peer dependency mismatch

**Issues Encountered:**
- Initial install failed due to Next.js version mismatch (Payload 3.x requires Next.js 15, we're on 14.2.15)
- Resolved with `--legacy-peer-deps` flag

---

### Phase 2: Configuration Files ✅

**Files Created:**

1. **`payload.config.ts`**
   - Main Payload configuration
   - SQLite adapter setup
   - Collections and globals registration
   - Lexical editor configuration

2. **Collection Files:**
   - `lib/payload/collections/Users.ts` - Authentication collection
   - `lib/payload/collections/Projects.ts` - Multi-tenant projects
   - `lib/payload/collections/ProjectMembers.ts` - User-project relationships
   - `lib/payload/collections/Characters.ts` - Content collection
   - `lib/payload/collections/Media.ts` - File uploads

3. **Access Control:**
   - `lib/payload/access/helpers.ts` - Multi-tenant access helpers

4. **Hooks:**
   - `lib/payload/hooks/useMagicbornMode.ts` - Client-side hook for Magicborn Mode

**Issues Encountered:**
- Import path error (see ISSUES_AND_FIXES.md #1)
- SQLite adapter config error (see ISSUES_AND_FIXES.md #2)

---

### Phase 3: Routes and UI ✅

**Routes Created:**

1. **API Routes:**
   - `app/api/payload/[...slug]/route.ts` - Payload API handler

2. **Content Editor Routes:**
   - `app/content-editor/page.tsx` - Redirect to default project
   - `app/content-editor/[projectId]/page.tsx` - Main editor page
   - `app/content-editor/settings/page.tsx` - Settings page

**UI Components Created:**

1. **Content Editor:**
   - `components/content-editor/ContentEditor.tsx` - Main component
   - `components/content-editor/CodexSidebar.tsx` - Left sidebar
   - `components/content-editor/ContentNavigation.tsx` - Top navigation
   - `components/content-editor/ProjectSwitcher.tsx` - Project selector
   - `components/content-editor/ContentGridView.tsx` - Grid view

2. **Settings:**
   - `components/project/SettingsPage.tsx` - Settings UI

**Navigation Updated:**
- `components/SidebarNav.tsx` - Changed `/development` to `/content-editor`

---

### Phase 4: Initialization Script ✅

**Script Created:**
- `scripts/init-payload.ts` - Creates superuser and default project

**Commands Run:**
```bash
npm run payload:init
```

**Output:**
```
✅ Payload initialization complete!

Superuser credentials:
  Email: admin@magicborn.com
  Password: admin123 (CHANGE THIS IN PRODUCTION!)

Default Project ID: 1

You can now access:
  - Payload Admin: http://localhost:3000/admin
  - Content Editor: http://localhost:3000/content-editor/1
```

**Database Created:**
- Location: `data/payload.db`
- Size: 327KB (initial)
- Separate from existing `data/spells.db`

---

### Phase 5: Configuration Updates ✅

**Files Modified:**

1. **`tsconfig.json`**
   - Added `@payload-config` path alias

2. **`next.config.mjs`**
   - Added Payload and SQLite to webpack externals

3. **`package.json`**
   - Added `payload:init` script

4. **`.env.local`**
   - Generated `PAYLOAD_SECRET`
   - Added `PAYLOAD_PUBLIC_SERVER_URL`

---

## Current Status

### ✅ Completed
- [x] Payload CMS installed
- [x] Configuration files created
- [x] Collections defined (Users, Projects, ProjectMembers, Characters, Media)
- [x] Access control system implemented
- [x] Routes created
- [x] UI components scaffolded
- [x] Initialization script working
- [x] Database created and seeded
- [x] Superuser and default project created

### 🔄 In Progress
- [ ] Connect UI components to Payload API
- [ ] Implement authentication flow
- [ ] Add remaining collections (Creatures, Locations, Spells, etc.)
- [ ] Test Payload Admin UI
- [ ] Test Content Editor routes

### 📋 TODO
- [ ] Create login page
- [ ] Implement session management
- [ ] Add form components for content editing
- [ ] Implement Magicborn Mode conditional rendering
- [ ] Add version history UI
- [ ] Add draft/publish workflow
- [ ] Migrate existing content from Drizzle DB

---

## Next Steps

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Test Access:**
   - Payload Admin: `http://localhost:3000/admin`
   - Content Editor: `http://localhost:3000/content-editor/1`

3. **Connect UI to API:**
   - Update `ContentGridView` to fetch from `/api/payload/characters`
   - Update `ProjectSwitcher` to fetch from `/api/payload/projects`
   - Update `useMagicbornMode` to fetch project settings

4. **Add Authentication:**
   - Create login page
   - Implement session management
   - Protect routes

---

## Architecture Decisions

### Database Separation
- **Decision:** Keep Payload DB separate from existing Drizzle DB
- **Reason:** Allows gradual migration without breaking existing functionality
- **Location:** `data/payload.db` vs `data/spells.db`

### Multi-Tenancy Model
- **Decision:** Project-based tenancy with membership roles
- **Implementation:** Every content document has `project` relationship
- **Access Control:** Filtered by user's project memberships

### Magicborn Mode
- **Decision:** Project-level toggle, not user-level
- **Implementation:** `project.magicbornMode` boolean
- **Behavior:** Shows/hides Magicborn-specific collections and fields

### Versioning
- **Decision:** Use Payload's built-in versions/drafts
- **Collections:** Enabled on Projects, Characters, and future narrative types
- **Benefits:** No custom versioning system needed

---

## File Structure

```
lib/payload/
├── collections/
│   ├── Users.ts
│   ├── Projects.ts
│   ├── ProjectMembers.ts
│   ├── Characters.ts
│   └── Media.ts
├── access/
│   └── helpers.ts
└── hooks/
    └── useMagicbornMode.ts

app/
├── api/
│   └── payload/
│       └── [...slug]/
│           └── route.ts
└── content-editor/
    ├── page.tsx
    ├── [projectId]/
    │   └── page.tsx
    └── settings/
        └── page.tsx

components/
├── content-editor/
│   ├── ContentEditor.tsx
│   ├── CodexSidebar.tsx
│   ├── ContentNavigation.tsx
│   ├── ProjectSwitcher.tsx
│   └── ContentGridView.tsx
└── project/
    └── SettingsPage.tsx

scripts/
└── init-payload.ts
```

---

## Notes

- Payload 3.x requires Next.js 15, but we're on 14.2.15. Using `--legacy-peer-deps` for now.
- Consider upgrading to Next.js 15 in the future for full compatibility.
- SQLite is fine for development, but PostgreSQL recommended for production with multiple users.
- All Payload types will be generated at `payload-types.ts` on first build.

