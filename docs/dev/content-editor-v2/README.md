# Content Editor v2 Documentation

This folder contains documentation for the Content Editor v2 migration, which integrates Payload CMS as the content management backend.

## Overview

Content Editor v2 is a complete overhaul of the content management system, moving from a custom Drizzle-based solution to Payload CMS. This enables:

- **Multi-project, multi-user** content management
- **Built-in versioning and drafts** for all content
- **Rich text editing** with Lexical
- **Magicborn Mode toggle** per project
- **Access control and tenant isolation**

## Documentation Files

### [ARCHITECTURE.md](./ARCHITECTURE.md)
Complete system architecture documentation:
- Docker Compose services and networking
- Database architecture and separation strategy
- Payload CMS integration throughout the app
- Application flow and data access patterns
- File structure and organization

### [CREDENTIALS.md](./CREDENTIALS.md)
Credentials and access information:
- Payload CMS admin credentials
- How to change passwords
- Project access and roles
- Docker service credentials
- Security best practices

### [SETUP_LOG.md](./SETUP_LOG.md)
Step-by-step log of the setup process, including:
- Installation steps
- Configuration files created
- Routes and UI components
- Initialization process
- Current status and next steps

### [ISSUES_AND_FIXES.md](./ISSUES_AND_FIXES.md)
Tracked issues encountered during setup and their resolutions:
- Import path errors
- Configuration issues
- TypeScript setup
- Known issues and TODOs

## Quick Start

### 1. Initialize Payload

```bash
npm run payload:init
```

This creates:
- Superuser: `admin@magicborn.com` / `admin123`
- Default project with ID `1`

### 2. Start Development Server

```bash
npm run dev
```

### 3. Access Interfaces

- **Payload Admin UI:** `http://localhost:3000/admin`
- **Content Editor:** `http://localhost:3000/content-editor/1`

## Architecture

### Multi-Tenancy

- **Projects** are the tenant boundary
- Every content document belongs to a **project**
- **ProjectMembers** link users to projects with roles (owner/admin/editor/viewer)
- Access control filters content by user's project memberships

### Magicborn Mode

- Project-level toggle (`project.magicbornMode`)
- When enabled: Shows Spells, Runes, Effects, Combat Stats
- When disabled: Hides Magicborn-specific content
- All data preserved when toggling

### Versioning

- Payload's built-in versions/drafts system
- Enabled on: Projects, Characters, and future narrative collections
- Supports: History, rollback, draft vs published

## Collections

### Core Collections

- **Users** - Authentication with superuser support
- **Projects** - Multi-tenant projects with Magicborn Mode
- **ProjectMembers** - User-project relationships
- **Characters** - Character content (tenant-scoped)
- **Media** - File uploads

### Planned Collections

- Creatures
- Locations
- Objects/Items
- Lore Entries
- Books/Chapters/Scenes (with Lexical rich text)
- Spells (Magicborn Mode only)
- Runes (Magicborn Mode only)
- Effects (Magicborn Mode only)

## Migration Strategy

1. **Keep existing system running** - Drizzle-based content remains functional
2. **New content goes to Payload** - Start using Payload for new content
3. **Gradual migration** - Move content type by type
4. **Eventually deprecate** - Old system can be removed after full migration

## Related Documentation

- [CONTENT_EDITOR_MIGRATION_PLAN.md](../CONTENT_EDITOR_MIGRATION_PLAN.md) - Original migration plan
- [DATA_CENTRIC_MAP_PLAN.md](../environment-editor/DATA_CENTRIC_MAP_PLAN.md) - Map/region system plan
- [PAYLOAD_SETUP.md](../../../PAYLOAD_SETUP.md) - Quick reference guide

## Resources

- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Payload SQLite Adapter](https://github.com/payloadcms/payload/tree/main/packages/db-sqlite)
- [libSQL Client](https://github.com/tursodatabase/libsql-client-ts)

