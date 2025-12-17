# Payload CMS Setup - Multi-Project Content Editor

## Overview

Payload CMS has been integrated as the content kernel for the Magicborn React application. This enables:
- Multi-project, multi-user content management
- Built-in versioning and drafts
- Rich text editing with Lexical
- Access control and tenant isolation
- Magicborn Mode toggle per project

## What's Been Set Up

### 1. Payload Configuration
- **File**: `payload.config.ts`
- **Database**: Separate SQLite database at `data/payload.db` (isolated from existing `spells.db`)
- **Collections**: Users, Projects, ProjectMembers, Characters, Media
- **Editor**: Lexical-based rich text editor

### 2. Collections Created

#### Users (`lib/payload/collections/Users.ts`)
- Authentication enabled
- `isSuperuser` field for admin access
- Access control: superusers can manage all users

#### Projects (`lib/payload/collections/Projects.ts`)
- Tenant boundary for all content
- `magicbornMode` toggle (enables/disables Magicborn-specific features)
- `defaultView` setting (grid/matrix/outline)
- Versions and drafts enabled

#### ProjectMembers (`lib/payload/collections/ProjectMembers.ts`)
- Links users to projects with roles (owner/admin/editor/viewer)
- Unique constraint on (project, user) pairs

#### Characters (`lib/payload/collections/Characters.ts`)
- Tenant-scoped (requires project relationship)
- Versions and drafts enabled
- Magicborn fields (combatStats, runeFamiliarity) - conditionally visible

#### Media (`lib/payload/collections/Media.ts`)
- File uploads (images, videos, etc.)
- Public read access, authenticated write access

### 3. Access Control (`lib/payload/access/helpers.ts`)
- `isSuperuser()` - Check if user is superuser
- `getAccessibleProjectIds()` - Get projects user can access
- `buildProjectWhereClause()` - Build tenant-scoped queries

### 4. Routes Created

#### API Routes
- `/api/payload/[...slug]` - Payload CMS API endpoint

#### Content Editor Routes
- `/content-editor` - Redirects to default project
- `/content-editor/[projectId]` - Main content editor page
- `/content-editor/settings` - Project settings page

### 5. UI Components

#### Content Editor (`components/content-editor/`)
- `ContentEditor.tsx` - Main editor component
- `CodexSidebar.tsx` - Left sidebar with categories and search
- `ContentNavigation.tsx` - Top navigation (Plan/Write/Chat/Review tabs)
- `ProjectSwitcher.tsx` - Project selection dropdown
- `ContentGridView.tsx` - Grid view of content items

#### Settings (`components/project/`)
- `SettingsPage.tsx` - Project settings UI with Magicborn Mode toggle

### 6. Hooks
- `useMagicbornMode()` - Hook to check if Magicborn Mode is enabled for a project

## Next Steps

### 1. Initialize Payload Database

Run the initialization script to create the superuser and default project:

```bash
npm run payload:init
```

This will create:
- Superuser: `admin@magicborn.com` / `admin123` (CHANGE IN PRODUCTION!)
- Default project with Magicborn Mode enabled

### 2. Start Development Server

```bash
npm run dev
```

Then access:
- Payload Admin UI: `http://localhost:3000/admin`
- Content Editor: `http://localhost:3000/content-editor/[projectId]`

### 3. Complete Implementation

#### Immediate TODOs:
1. **Connect UI to Payload API**
   - Update `ContentGridView` to fetch from `/api/payload/characters`
   - Update `ProjectSwitcher` to fetch from `/api/payload/projects`
   - Update `useMagicbornMode` to fetch project settings

2. **Add More Collections**
   - Creatures
   - Locations
   - Objects/Items
   - Lore Entries
   - Books/Chapters/Scenes (with Lexical rich text)
   - Spells (Magicborn Mode only)
   - Runes (Magicborn Mode only)
   - Effects (Magicborn Mode only)

3. **Implement Content Forms**
   - Character form with project auto-fill
   - Conditional Magicborn fields based on project.magicbornMode
   - Rich text editor for narrative content

4. **Add Authentication**
   - Login page
   - Session management
   - Protect routes with authentication

5. **Project Management**
   - Create new project flow
   - Project switcher with real data
   - Project settings save functionality

### 4. Migration Strategy

The existing Drizzle-based data (`spells.db`) remains separate. Migration can happen gradually:
1. Keep existing editors working with old DB
2. New content goes into Payload
3. Migrate content type by type
4. Eventually deprecate old system

## Architecture Notes

### Multi-Tenancy
- Every content document has a `project` relationship
- Access control filters by user's project memberships
- Superusers bypass all restrictions

### Magicborn Mode
- Project-level toggle (`project.magicbornMode`)
- Controls visibility of Magicborn-specific collections and fields
- All data is preserved when toggling (just hidden/shown)

### Versioning
- Enabled on Projects, Characters, and future narrative collections
- Drafts allow work-in-progress content
- History/rollback via Payload's built-in version system

### Database Separation
- `data/payload.db` - Payload CMS content
- `data/spells.db` - Existing Drizzle-based game data
- Can migrate gradually without breaking existing functionality

## Environment Variables

Add to `.env.local`:
```
PAYLOAD_SECRET=<generated-secret>
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
```

The init script generates `PAYLOAD_SECRET` automatically.

## Troubleshooting

### Payload route handler issues
If `/api/payload/*` routes don't work, check:
- Payload config imports are correct
- Database file is created at `data/payload.db`
- Environment variables are set

### Type errors
Run `npm run build` to generate Payload types:
- Types will be generated at `payload-types.ts`

### Database locked errors
SQLite can have concurrency issues. For production, consider:
- Migrating to PostgreSQL
- Using Turso (remote SQLite) for Vercel deployments

