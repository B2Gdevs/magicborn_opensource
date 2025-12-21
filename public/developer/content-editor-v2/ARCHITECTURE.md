# Content Editor v2 - Architecture Documentation

## System Architecture Overview

This document describes the complete architecture of the Magicborn React application, including Payload CMS integration, Docker services, databases, and how components interact.

---

## Docker Compose Architecture

The application runs in a multi-container Docker environment defined in `infra/ai-stack/docker-compose.yml`.

### Services Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network: demo                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │  postgres│    │   n8n    │    │  qdrant  │             │
│  │  :5432   │◄───┤  :5678   │    │  :6333   │             │
│  └──────────┘    └──────────┘    └──────────┘             │
│                                                               │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │  ollama  │    │  web     │    │ openwebui│             │
│  │  :11434  │    │  :4300   │    │  :8080   │             │
│  └──────────┘    └──────────┘    └──────────┘             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Service Details

#### 1. **web** (Next.js Application)
- **Image:** `node:20`
- **Container:** `magicborn_web`
- **Port:** `4300:3000` (host:container)
- **Command:** `npm install --legacy-peer-deps && npm run dev`
- **Volumes:**
  - Project root mounted to `/usr/src/app`
  - `web_node_modules` volume for persistent node_modules
- **Purpose:** Main Next.js application with Payload CMS integration
- **Note:** Uses `--legacy-peer-deps` due to Next.js 14 vs Payload 3.x version mismatch

#### 2. **postgres** (PostgreSQL Database)
- **Image:** `postgres:16-alpine`
- **Port:** Internal only (not exposed to host)
- **Volumes:** `postgres_storage` for persistent data
- **Purpose:** Database for n8n workflows and credentials
- **Used By:** n8n service

#### 3. **n8n** (Workflow Automation)
- **Image:** `n8nio/n8n:latest`
- **Container:** `n8n`
- **Port:** `5678:5678`
- **Database:** PostgreSQL (postgres service)
- **Purpose:** Workflow automation, API integrations, AI orchestration
- **Volumes:**
  - `n8n_storage` for persistent workflows
  - Next.js `public` and `data` folders mounted for file access

#### 4. **qdrant** (Vector Database)
- **Image:** `qdrant/qdrant`
- **Container:** `qdrant`
- **Port:** `6333:6333`
- **Volumes:** `qdrant_storage` for persistent vectors
- **Purpose:** Vector storage for RAG (Retrieval Augmented Generation) and semantic search
- **Used By:** OpenWebUI, potential future AI features

#### 5. **ollama** (Local LLM Server)
- **Image:** `ollama/ollama:latest`
- **Container:** `ollama` (CPU/GPU variants)
- **Port:** `11434:11434`
- **Volumes:** `ollama_storage` for model storage
- **Profiles:** `cpu`, `gpu-nvidia`, `gpu-amd`
- **Purpose:** Local LLM inference (Llama 3.2)
- **Used By:** n8n, OpenWebUI

#### 6. **openwebui** (AI Chat Interface)
- **Image:** `ghcr.io/open-webui/open-webui:main`
- **Container:** `openwebui`
- **Port:** `8080:8080`
- **Purpose:** AI chat interface with RAG capabilities
- **Volumes:**
  - OpenWebUI data directory
  - Next.js `public` folder mounted for knowledge base access
  - Next.js `data` folder for asset references
- **Features:**
  - Knowledge base from Next.js documentation
  - CORS enabled for iframe embedding
  - Authentication disabled for development

---

## Database Architecture

### Database Separation Strategy

The application uses **multiple databases** for different purposes:

```
┌─────────────────────────────────────────────────────────────┐
│                    Database Architecture                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │  spells.db       │      │  payload.db      │            │
│  │  (SQLite)        │      │  (SQLite)        │            │
│  │                  │      │                  │            │
│  │  Location:       │      │  Location:       │            │
│  │  data/spells.db  │      │  data/payload.db │            │
│  │                  │      │                  │            │
│  │  Managed by:     │      │  Managed by:     │            │
│  │  Drizzle ORM     │      │  Payload CMS     │            │
│  │                  │      │                  │            │
│  │  Purpose:        │      │  Purpose:        │            │
│  │  Legacy game     │      │  New content     │            │
│  │  data (spells,   │      │  management      │            │
│  │  runes, chars,   │      │  (multi-tenant)  │            │
│  │  creatures,      │      │                  │            │
│  │  maps, regions)  │      │  Collections:    │            │
│  │                  │      │  - Users         │            │
│  │  Tables:         │      │  - Projects     │            │
│  │  - named_spells  │      │  - Characters   │            │
│  │  - runes         │      │  - Media        │            │
│  │  - characters    │      │  - etc.         │            │
│  │  - creatures     │      │                  │            │
│  │  - environments  │      │  Features:       │            │
│  │  - maps          │      │  - Versions     │            │
│  │  - map_regions   │      │  - Drafts       │            │
│  │  - map_placements│      │  - Auth         │            │
│  └──────────────────┘      └──────────────────┘            │
│                                                               │
│  ┌──────────────────┐                                        │
│  │  PostgreSQL      │                                        │
│  │  (Docker)        │                                        │
│  │                  │                                        │
│  │  Location:       │                                        │
│  │  postgres_storage│                                        │
│  │  (Docker volume) │                                        │
│  │                  │                                        │
│  │  Managed by:      │                                        │
│  │  n8n             │                                        │
│  │                  │                                        │
│  │  Purpose:        │                                        │
│  │  n8n workflows   │                                        │
│  │  and credentials │                                        │
│  │                  │                                        │
│  │  Tables:         │                                        │
│  │  - workflows     │                                        │
│  │  - credentials   │                                        │
│  │  - executions    │                                        │
│  └──────────────────┘                                        │
│                                                               │
│  ┌──────────────────┐                                        │
│  │  Qdrant          │                                        │
│  │  (Vector DB)     │                                        │
│  │                  │                                        │
│  │  Location:       │                                        │
│  │  qdrant_storage  │                                        │
│  │  (Docker volume) │                                        │
│  │                  │                                        │
│  │  Purpose:        │                                        │
│  │  Vector storage  │                                        │
│  │  for RAG and     │                                        │
│  │  semantic search │                                        │
│  └──────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

### Database Details

#### 1. **spells.db** (SQLite - Legacy)
- **Location:** `data/spells.db`
- **ORM:** Drizzle ORM
- **Purpose:** Existing game data storage
- **Collections:**
  - `named_spells` - Spell definitions
  - `runes` - Rune data
  - `characters` - Character data
  - `creatures` - Creature definitions
  - `environments` - Environment definitions
  - `maps` - Map data
  - `map_regions` - Region data
  - `map_placements` - Placement data
- **Status:** Legacy system, being migrated to Payload
- **Migration Strategy:** Gradual migration, type by type

#### 2. **payload.db** (SQLite - New)
- **Location:** `data/payload.db`
- **ORM:** Payload CMS (uses libSQL/Drizzle internally)
- **Purpose:** New content management system
- **Collections:**
  - `users` - User accounts with authentication
  - `projects` - Multi-tenant projects
  - `project_members` - User-project relationships
  - `characters` - Character content (new system)
  - `media` - File uploads
- **Features:**
  - Built-in versioning
  - Draft/publish workflow
  - Authentication
  - Multi-tenant access control
- **Status:** Active development, primary content system going forward

#### 3. **PostgreSQL** (Docker)
- **Location:** Docker volume `postgres_storage`
- **Purpose:** n8n workflow storage
- **Used By:** n8n service only
- **Tables:** Managed by n8n (workflows, credentials, executions)

#### 4. **Qdrant** (Vector Database)
- **Location:** Docker volume `qdrant_storage`
- **Purpose:** Vector embeddings for RAG
- **Used By:** OpenWebUI, potential future AI features
- **Content:** Document embeddings from Next.js public folder

---

## Payload CMS Integration

### How Payload is Used Throughout the App

#### 1. **API Layer**

Payload provides REST API endpoints at `/api/payload/*`:

```
/api/payload/users          - User management
/api/payload/projects       - Project management
/api/payload/project-members - Membership management
/api/payload/characters     - Character content
/api/payload/media          - File uploads
```

**Route Handler:** `app/api/payload/[...slug]/route.ts`
- Handles all HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Uses Payload's router for request handling
- Supports authentication and access control

#### 2. **Content Editor Routes**

```
/content-editor                    - Redirects to default project
/content-editor/[projectId]        - Main editor interface
/content-editor/settings          - Project settings
```

**Components:**
- `ContentEditor.tsx` - Main editor component
- `CodexSidebar.tsx` - Category navigation
- `ContentNavigation.tsx` - Tab navigation
- `ProjectSwitcher.tsx` - Project selection
- `ContentGridView.tsx` - Content listing

#### 3. **Access Control**

**Multi-Tenant Architecture:**
- Every content document has a `project` relationship
- Access control filters by user's project memberships
- Superusers bypass all restrictions

**Access Helpers:** `lib/payload/access/helpers.ts`
- `isSuperuser()` - Check superuser status
- `getAccessibleProjectIds()` - Get user's accessible projects
- `buildProjectWhereClause()` - Build tenant-scoped queries

#### 4. **Collections**

**Core Collections:**
- **Users** - Authentication, superuser flag
- **Projects** - Multi-tenant projects with Magicborn Mode
- **ProjectMembers** - User-project relationships with roles
- **Characters** - Character content (tenant-scoped)
- **Media** - File uploads

**Planned Collections:**
- Creatures, Locations, Objects, Lore
- Books, Chapters, Scenes (with Lexical rich text)
- Spells, Runes, Effects (Magicborn Mode only)

#### 5. **Magicborn Mode**

**Project-Level Toggle:**
- `project.magicbornMode` boolean field
- Controls visibility of Magicborn-specific collections
- All data preserved when toggling
- Implemented via conditional rendering in UI

**Hook:** `lib/payload/hooks/useMagicbornMode.ts`
- Client-side hook to check Magicborn Mode status
- Fetches project settings from Payload API

#### 6. **Versioning and Drafts**

**Built-in Features:**
- Versions enabled on Projects, Characters, and future narrative types
- Draft/publish workflow
- History and rollback support
- No custom versioning system needed

---

## Application Flow

### Content Editor Flow

```
User → /content-editor/[projectId]
  ↓
ContentEditor Component
  ├─→ CodexSidebar (fetches categories from Payload)
  ├─→ ContentNavigation (project switcher)
  └─→ ContentGridView (fetches content from Payload API)
      ↓
  /api/payload/characters?where[project][equals]=[projectId]
      ↓
  Payload CMS (payload.db)
      ↓
  Returns filtered, tenant-scoped content
```

### Authentication Flow (Planned)

```
User → Login Page
  ↓
POST /api/payload/users/login
  ↓
Payload Auth System
  ↓
Session Created
  ↓
Protected Routes Check Session
  ↓
Access Granted/Denied
```

### Multi-Tenant Access Flow

```
Request → Access Control Helper
  ↓
Check: isSuperuser?
  ├─→ Yes: Allow all
  └─→ No: getAccessibleProjectIds()
      ↓
  Filter: where[project][in]=[accessibleIds]
      ↓
  Return tenant-scoped results
```

---

## File Structure

```
magicborn_react/
├── app/
│   ├── api/
│   │   └── payload/
│   │       └── [...slug]/
│   │           └── route.ts          # Payload API handler
│   └── content-editor/
│       ├── page.tsx                   # Redirect
│       ├── [projectId]/
│       │   └── page.tsx               # Main editor
│       └── settings/
│           └── page.tsx               # Settings
│
├── components/
│   ├── content-editor/                # Editor UI components
│   └── project/                      # Project components
│
├── lib/
│   └── payload/
│       ├── collections/              # Payload collections
│       ├── access/                    # Access control
│       └── hooks/                     # Client hooks
│
├── data/
│   ├── spells.db                      # Legacy Drizzle DB
│   └── payload.db                    # Payload CMS DB
│
├── payload.config.ts                  # Payload configuration
│
└── infra/ai-stack/
    └── docker-compose.yml             # Docker services
```

---

## Environment Variables

### Required for Payload

```bash
PAYLOAD_SECRET=<generated-secret>
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
```

### Docker Services

```bash
POSTGRES_USER=<postgres-user>
POSTGRES_PASSWORD=<postgres-password>
POSTGRES_DB=<postgres-db>
N8N_ENCRYPTION_KEY=<n8n-key>
N8N_USER_MANAGEMENT_JWT_SECRET=<n8n-jwt-secret>
OLLAMA_HOST=ollama:11434
```

---

## Network Architecture

### Internal Docker Network

All services communicate via the `demo` Docker network:

- **web** → Can access: postgres, n8n, qdrant, ollama, openwebui
- **n8n** → Can access: postgres, ollama
- **openwebui** → Can access: qdrant, ollama
- **Services** → Communicate via service names (e.g., `postgres`, `ollama`)

### Port Mappings

- **4300** → web (Next.js app)
- **5678** → n8n
- **6333** → qdrant
- **8080** → openwebui
- **11434** → ollama

---

## Development Workflow

### Local Development (Non-Docker)

```bash
# Start Next.js dev server
npm run dev

# Access at http://localhost:3000
```

### Docker Development

```bash
# Start all services
npm run docker:up

# Or detached
npm run docker:up:detached

# Access services:
# - Next.js: http://localhost:4300
# - n8n: http://localhost:5678
# - OpenWebUI: http://localhost:8080
# - Qdrant: http://localhost:6333
```

### Database Initialization

```bash
# Initialize Payload (creates superuser and default project)
npm run payload:init

# Drizzle migrations (legacy DB)
npm run db:push
```

---

## Security Considerations

### Current Setup (Development)

- **OpenWebUI:** Authentication disabled (`WEBUI_AUTH=False`)
- **n8n:** Basic auth disabled (`N8N_BASIC_AUTH_ACTIVE=false`)
- **Payload:** Superuser created with default password (CHANGE IN PRODUCTION!)

### Production Checklist

- [ ] Enable OpenWebUI authentication
- [ ] Enable n8n authentication
- [ ] Change Payload superuser password
- [ ] Set strong `PAYLOAD_SECRET`
- [ ] Use PostgreSQL for Payload (not SQLite)
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up proper access control

---

## Migration Strategy

### Phase 1: Parallel Systems ✅
- Payload CMS set up alongside existing Drizzle system
- New content goes to Payload
- Existing content remains in Drizzle DB

### Phase 2: Gradual Migration (In Progress)
- Migrate content type by type
- Start with Characters
- Then Creatures, Locations, etc.

### Phase 3: Full Migration (Future)
- All content in Payload
- Deprecate Drizzle-based system
- Remove legacy code

---

## Troubleshooting

### Docker Issues

**Problem:** npm install fails in Docker
**Solution:** Use `--legacy-peer-deps` flag (already in docker-compose.yml)

**Problem:** Port conflicts
**Solution:** Change port mappings in docker-compose.yml

### Payload Issues

**Problem:** Database locked
**Solution:** SQLite concurrency issue - consider PostgreSQL for production

**Problem:** Access denied
**Solution:** Check project membership and access control rules

---

## References

- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)


