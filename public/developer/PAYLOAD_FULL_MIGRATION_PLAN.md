# Payload CMS Full Migration Plan

## Vision

Transform Magicborn into a fully Payload-powered application where:
- **All content** is managed through Payload (homepage, about, lore, characters, stories)
- **Public content** is SEO-friendly and pulled from the Content Editor
- **AI integration** can create/update content with full versioning
- **Role-based access** controls who can edit in production
- **Single database** - retire the old spells.db, use only Payload

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  Public Pages          │  Content Editor      │  AI Integration  │
│  - Homepage            │  - Story Planning    │  - Generate      │
│  - About               │  - Character Editor  │  - Edit          │
│  - Public Lore         │  - Lore Management   │  - Merge         │
│  - Style Guide         │  - Version Control   │  - Concept       │
│  - Published Stories   │  - Snapshots         │                  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Payload CMS (Backend)                        │
├─────────────────────────────────────────────────────────────────┤
│  Collections:                                                    │
│  ├── Site Config (Global)     - Homepage settings, feature flags │
│  ├── Pages                    - Homepage, About, custom pages    │
│  ├── Projects                 - Story projects                   │
│  ├── Acts/Chapters/Scenes     - Story structure                  │
│  ├── Characters               - With public/private flag         │
│  ├── Locations                - World building                   │
│  ├── Lore                     - Publishable lore entries         │
│  ├── Media                    - Images, videos, audio            │
│  ├── Style Guide Entries      - Character concepts, design docs  │
│  ├── AI Generations           - Track AI-created content         │
│  └── Project Snapshots        - Full project versioning          │
├─────────────────────────────────────────────────────────────────┤
│  Access Control:                                                 │
│  ├── Superuser               - Full access everywhere            │
│  ├── Editor                  - Edit content, publish             │
│  ├── Contributor             - Create drafts, no publish         │
│  └── Public                  - Read published content only       │
├─────────────────────────────────────────────────────────────────┤
│  Versioning:                                                     │
│  ├── Auto-versions on update                                     │
│  ├── Draft/Published workflow                                    │
│  └── Project-level snapshots                                     │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     AI Integration Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  - OpenWebUI / Ollama for generation                            │
│  - AI can CRUD via Payload API with special "ai-agent" user     │
│  - All AI changes are versioned and reviewable                  │
│  - Merge/accept/reject AI suggestions                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Core Collections & Site Config

### 1.1 Site Configuration (Global)

```typescript
// lib/payload/globals/SiteConfig.ts
export const SiteConfig: GlobalConfig = {
  slug: 'site-config',
  access: {
    read: () => true,
    update: isEditorOrAbove,
  },
  fields: [
    { name: 'siteName', type: 'text', required: true },
    { name: 'tagline', type: 'text' },
    { name: 'showWaitlistButton', type: 'checkbox', defaultValue: true },
    { name: 'waitlistUrl', type: 'text' },
    { name: 'heroVideo', type: 'upload', relationTo: 'media' },
    { name: 'heroTitle', type: 'text' },
    { name: 'heroSubtitle', type: 'textarea' },
    { name: 'featuredContent', type: 'relationship', relationTo: ['lore', 'characters'], hasMany: true },
    { name: 'socialLinks', type: 'array', fields: [...] },
  ],
}
```

### 1.2 Pages Collection

```typescript
// lib/payload/collections/Pages.ts
export const Pages: CollectionConfig = {
  slug: 'pages',
  versions: { drafts: true },
  access: {
    read: ({ req }) => {
      // Public can read published, editors can read all
      if (!req.user) return { _status: { equals: 'published' } }
      return true
    },
    create: isEditorOrAbove,
    update: isEditorOrAbove,
    delete: isSuperuser,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'content', type: 'richText' },
    { name: 'seoTitle', type: 'text' },
    { name: 'seoDescription', type: 'textarea' },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
  ],
}
```

### 1.3 Lore Collection (Publishable)

```typescript
// lib/payload/collections/Lore.ts
export const Lore: CollectionConfig = {
  slug: 'lore',
  versions: { drafts: true, maxPerDoc: 25 },
  access: {
    read: ({ req }) => {
      if (!req.user) return { _status: { equals: 'published' } }
      return true
    },
    // ... editor access for create/update
  },
  fields: [
    { name: 'project', type: 'relationship', relationTo: 'projects' },
    { name: 'title', type: 'text', required: true },
    { name: 'category', type: 'select', options: ['history', 'magic-system', 'culture', 'geography', 'religion'] },
    { name: 'content', type: 'richText' },
    { name: 'isPublic', type: 'checkbox', defaultValue: false, admin: { description: 'Show on public website' } },
    { name: 'relatedCharacters', type: 'relationship', relationTo: 'characters', hasMany: true },
    { name: 'relatedLocations', type: 'relationship', relationTo: 'locations', hasMany: true },
    { name: 'seoSlug', type: 'text' },
  ],
}
```

### 1.4 Style Guide Collection

```typescript
// lib/payload/collections/StyleGuideEntries.ts
export const StyleGuideEntries: CollectionConfig = {
  slug: 'style-guide-entries',
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'category', type: 'select', options: ['character-concept', 'environment', 'ui-design', 'color-palette', 'typography'] },
    { name: 'description', type: 'richText' },
    { name: 'images', type: 'array', fields: [
      { name: 'image', type: 'upload', relationTo: 'media' },
      { name: 'caption', type: 'text' },
    ]},
    { name: 'isPublic', type: 'checkbox', defaultValue: false },
  ],
}
```

---

## Phase 2: Access Control & Production Safety

### 2.1 User Roles

```typescript
// lib/payload/collections/Users.ts - Updated
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  fields: [
    { name: 'name', type: 'text' },
    { 
      name: 'role', 
      type: 'select',
      options: [
        { label: 'Superuser', value: 'superuser' },
        { label: 'Editor', value: 'editor' },
        { label: 'Contributor', value: 'contributor' },
        { label: 'AI Agent', value: 'ai-agent' },
      ],
      defaultValue: 'contributor',
      required: true,
    },
  ],
}
```

### 2.2 Access Helpers

```typescript
// lib/payload/access/roles.ts
export const isSuperuser = ({ req }: { req: PayloadRequest }) => 
  req.user?.role === 'superuser'

export const isEditorOrAbove = ({ req }: { req: PayloadRequest }) => 
  ['superuser', 'editor'].includes(req.user?.role)

export const isContributorOrAbove = ({ req }: { req: PayloadRequest }) => 
  ['superuser', 'editor', 'contributor'].includes(req.user?.role)

export const isAIAgent = ({ req }: { req: PayloadRequest }) => 
  req.user?.role === 'ai-agent'

// Production lock - prevent edits in production unless superuser
export const canEditInProduction = ({ req }: { req: PayloadRequest }) => {
  if (process.env.NODE_ENV !== 'production') return true
  return req.user?.role === 'superuser'
}
```

### 2.3 Environment-Based Access

```typescript
// In collection access:
access: {
  create: ({ req }) => {
    if (process.env.PAYLOAD_READONLY === 'true') {
      return isSuperuser({ req })
    }
    return isEditorOrAbove({ req })
  },
}
```

---

## Phase 3: AI Integration Architecture

### 3.1 AI Agent User

Create a dedicated AI user that:
- Has `ai-agent` role
- All AI-generated content is attributed to this user
- Changes are versioned and reviewable

### 3.2 AI Generation Tracking

```typescript
// lib/payload/collections/AIGenerations.ts
export const AIGenerations: CollectionConfig = {
  slug: 'ai-generations',
  fields: [
    { name: 'prompt', type: 'textarea', required: true },
    { name: 'model', type: 'text' },
    { name: 'targetCollection', type: 'text' },
    { name: 'targetDocId', type: 'text' },
    { name: 'generatedContent', type: 'json' },
    { name: 'status', type: 'select', options: ['pending', 'accepted', 'rejected', 'merged'] },
    { name: 'reviewedBy', type: 'relationship', relationTo: 'users' },
    { name: 'reviewNotes', type: 'textarea' },
  ],
}
```

### 3.3 AI CRUD Flow

```
User Request → AI generates content → Saved as draft with AI attribution
                                           ↓
                                    Version created
                                           ↓
                              Human reviews in Content Editor
                                           ↓
                         Accept (publish) / Reject / Edit & Merge
```

### 3.4 AI Integration Points

| Feature | AI Capability |
|---------|--------------|
| Scene Writing | Generate scene content from outline |
| Character Development | Expand character backstory |
| Lore Generation | Create world-building entries |
| Dialogue | Generate character dialogue |
| Concept Art Prompts | Generate image prompts for style guide |
| SEO | Generate meta descriptions |

---

## Phase 4: Public Content & SEO

### 4.1 Public Routes

```
/                    → Homepage (from SiteConfig global)
/about               → About page (from Pages collection)
/lore                → Public lore index
/lore/[slug]         → Individual lore entry (SEO-friendly)
/characters/[slug]   → Public character profiles
/style-guide         → Public style guide entries
/stories/[slug]      → Published stories (read-only)
```

### 4.2 SEO Implementation

```typescript
// app/lore/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const payload = await getPayload({ config })
  const lore = await payload.find({
    collection: 'lore',
    where: { seoSlug: { equals: params.slug }, isPublic: { equals: true } },
  })
  
  return {
    title: lore.docs[0]?.title,
    description: lore.docs[0]?.seoDescription,
    openGraph: { ... },
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const lore = await payload.find({
    collection: 'lore',
    where: { isPublic: { equals: true }, _status: { equals: 'published' } },
  })
  return lore.docs.map(doc => ({ slug: doc.seoSlug }))
}
```

### 4.3 Content Publishing Workflow

1. Create content in Content Editor (draft)
2. Mark as `isPublic: true` when ready to share
3. Publish (changes `_status` to `published`)
4. Content appears on public pages
5. Edit creates new version, doesn't affect published until re-published

---

## Phase 5: Migration Tasks

### 5.1 Database Migration

| Old System | New Payload Collection |
|------------|----------------------|
| spells.db → spells | Spells collection |
| Static homepage content | SiteConfig global |
| Markdown lore files | Lore collection |
| Static about page | Pages collection |

### 5.2 Migration Script

```typescript
// scripts/migrate-to-payload.ts
async function migrateSpells() {
  const oldSpells = await oldDb.select().from(spellsTable)
  for (const spell of oldSpells) {
    await payload.create({
      collection: 'spells',
      data: { ...spell, project: defaultProjectId },
    })
  }
}

async function migrateLoreFiles() {
  const loreFiles = glob.sync('public/books/**/lore/*.md')
  for (const file of loreFiles) {
    const content = await fs.readFile(file, 'utf-8')
    const { data, content: body } = matter(content)
    await payload.create({
      collection: 'lore',
      data: {
        title: data.title,
        content: convertMarkdownToLexical(body),
        category: data.category,
        isPublic: false, // Review before publishing
      },
    })
  }
}
```

---

## Phase 6: Implementation Order

### Sprint 1: Foundation (Week 1)
- [ ] Create SiteConfig global
- [ ] Create Pages collection
- [ ] Update Users with roles
- [ ] Create access control helpers
- [ ] Update homepage to pull from Payload

### Sprint 2: Content Collections (Week 2)
- [ ] Create Lore collection
- [ ] Create Locations collection
- [ ] Create StyleGuideEntries collection
- [ ] Add `isPublic` flag to Characters
- [ ] Create public routes for lore/characters

### Sprint 3: AI Integration (Week 3)
- [ ] Create AIGenerations collection
- [ ] Create AI agent user
- [ ] Build AI generation API endpoints
- [ ] Add AI buttons to Content Editor
- [ ] Implement review/merge workflow

### Sprint 4: Migration & Polish (Week 4)
- [ ] Run migration scripts
- [ ] Remove old database dependencies
- [ ] SEO optimization
- [ ] Production access controls
- [ ] Documentation

---

## API Endpoints Summary

### Public (No Auth)
```
GET /api/payload/site-config          # Homepage data
GET /api/payload/pages?slug=about     # Page content
GET /api/payload/lore?isPublic=true   # Public lore
GET /api/payload/characters?isPublic=true
GET /api/payload/style-guide-entries?isPublic=true
```

### Authenticated (Editor+)
```
POST /api/payload/lore                # Create lore
PATCH /api/payload/lore/:id           # Update (creates version)
POST /api/payload/lore/:id/publish    # Publish draft
GET /api/payload/lore/:id/versions    # Version history
```

### AI Agent
```
POST /api/payload/ai-generations      # Log AI generation
POST /api/payload/lore                # Create draft from AI
PATCH /api/payload/scenes/:id         # AI-assisted edit
```

---

## Environment Variables

```env
# Production safety
PAYLOAD_READONLY=false          # Set true to lock edits
PAYLOAD_PUBLIC_SERVER_URL=https://magicborn.com

# AI Integration
OPENWEBUI_API_URL=http://localhost:3100
OLLAMA_API_URL=http://localhost:11434
AI_AGENT_API_KEY=secret-key-for-ai-operations

# Feature flags
ENABLE_AI_GENERATION=true
ENABLE_PUBLIC_LORE=true
```

---

## Sidebar Navigation (Updated)

Remove Magicborn Assistant from sidebar. AI is integrated contextually:

```typescript
const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/about", label: "About", icon: BookOpen },
  { href: "/lore", label: "Lore", icon: Scroll },           // Public lore
  { href: "/style-guide", label: "Style Guide", icon: Palette },
  { href: "/content-editor", label: "Content Editor", icon: Edit },
  { href: "/docs/developer", label: "Developer Docs", icon: Code },
]
```

AI buttons appear contextually:
- In scene editor: "Generate with AI" button
- In character form: "Expand backstory" button
- In lore editor: "Generate related content" button

---

## Next Steps

1. **Approve this plan** - confirm the architecture makes sense
2. **Start Sprint 1** - I'll create the SiteConfig and Pages collections
3. **Update homepage** - pull hero content from Payload
4. **Iterate** - adjust based on your feedback

This gives you:
- Single source of truth (Payload)
- Full versioning on everything
- Public/private content control
- AI integration with human review
- Production safety
- SEO-friendly public pages



