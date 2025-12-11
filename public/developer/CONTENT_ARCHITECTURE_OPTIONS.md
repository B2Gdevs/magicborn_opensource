# Content Architecture Options

This document outlines several approaches to better organize markdown content, separate developer documentation from customer-facing content, and prevent cross-contamination between different content types.

## Current Structure

```
public/
├── design/          # Design documentation (internal)
├── developer/       # Developer documentation (internal)
├── books/           # Customer-facing books/stories
└── game-content/    # Customer-facing game content
```

## Problem Statement

- Content from one category appears in another (e.g., design docs in books mode)
- Filtering logic is scattered and error-prone
- No clear separation between internal vs customer-facing content
- Mode detection relies on path prefixes which can be inconsistent

---

## Option 1: Content Type Registry System (Recommended)

**Concept:** Central configuration that explicitly defines content types and their access rules.

### Structure

```typescript
// lib/config/content-types.ts
export enum ContentType {
  DEVELOPER_DOCS = "developer-docs",
  DESIGN_DOCS = "design-docs", 
  CUSTOMER_CONTENT = "customer-content",
  BOOKS = "books",
  NEWS = "news",
  CHARACTERS = "characters"
}

export interface ContentTypeConfig {
  type: ContentType;
  basePath: string;           // e.g., "developer", "books"
  allowedModes: ViewerMode[]; // Which modes can access this
  isPublic: boolean;          // Customer-facing vs internal
  metadata?: {
    defaultFile?: string;
    icon?: string;
  };
}

export const CONTENT_TYPE_REGISTRY: ContentTypeConfig[] = [
  {
    type: ContentType.DEVELOPER_DOCS,
    basePath: "developer",
    allowedModes: [ViewerMode.DEVELOPER],
    isPublic: false,
  },
  {
    type: ContentType.DESIGN_DOCS,
    basePath: "design",
    allowedModes: [ViewerMode.DESIGN],
    isPublic: false,
  },
  {
    type: ContentType.BOOKS,
    basePath: "books",
    allowedModes: [ViewerMode.BOOKS],
    isPublic: true,
  },
  // ... etc
];
```

### Implementation

```typescript
// lib/utils/content-loader.ts
export function getContentType(path: string): ContentType | null {
  for (const config of CONTENT_TYPE_REGISTRY) {
    if (path.startsWith(config.basePath + "/")) {
      return config.type;
    }
  }
  return null;
}

export function canAccessContentType(
  contentType: ContentType,
  mode: ViewerMode
): boolean {
  const config = CONTENT_TYPE_REGISTRY.find(c => c.type === contentType);
  return config?.allowedModes.includes(mode) ?? false;
}

export function filterFilesByMode(files: DocFile[], mode: ViewerMode): DocFile[] {
  const allowedTypes = CONTENT_TYPE_REGISTRY
    .filter(c => c.allowedModes.includes(mode))
    .map(c => c.basePath);
  
  return files.filter(file => {
    const contentType = getContentType(file.path);
    if (!contentType) return false;
    
    const config = CONTENT_TYPE_REGISTRY.find(c => c.type === contentType);
    return config?.allowedModes.includes(mode) ?? false;
  });
}
```

### Pros
- ✅ Explicit, maintainable configuration
- ✅ Type-safe
- ✅ Easy to add new content types
- ✅ Clear access control rules
- ✅ Single source of truth

### Cons
- ⚠️ Requires maintaining registry
- ⚠️ Need to update when adding new folders

---

## Option 2: Frontmatter Metadata System

**Concept:** Add YAML frontmatter to markdown files to tag content type.

### Structure

```markdown
---
contentType: books
mode: books
public: true
tags: [story, chapter-3]
---

# Chapter 3: Morgana Imprisoned

Content here...
```

### Implementation

```typescript
// lib/utils/frontmatter-parser.ts
export interface ContentMetadata {
  contentType?: string;
  mode?: ViewerMode;
  public?: boolean;
  tags?: string[];
  [key: string]: any;
}

export function parseFrontmatter(content: string): {
  metadata: ContentMetadata;
  body: string;
} {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { metadata: {}, body: content };
  }
  
  const yaml = match[1];
  const body = match[2];
  const metadata = parseYaml(yaml); // Use js-yaml or similar
  
  return { metadata, body };
}

// Filter based on frontmatter
export function filterByMetadata(
  files: DocFile[],
  mode: ViewerMode
): Promise<DocFile[]> {
  // Load and parse frontmatter for each file
  // Filter based on metadata.mode
}
```

### Pros
- ✅ Self-documenting (metadata in file)
- ✅ Flexible (can add custom fields)
- ✅ No central config needed
- ✅ Works well with static site generators

### Cons
- ⚠️ Requires adding frontmatter to all files
- ⚠️ More complex parsing
- ⚠️ Performance overhead (reading all files)
- ⚠️ Easy to forget/make mistakes

---

## Option 3: Separate Loaders Per Content Type

**Concept:** Different loader/viewer components for each content type with strict boundaries.

### Structure

```
lib/
├── content/
│   ├── developer/
│   │   ├── loader.ts
│   │   └── viewer.tsx
│   ├── design/
│   │   ├── loader.ts
│   │   └── viewer.tsx
│   ├── books/
│   │   ├── loader.ts
│   │   └── viewer.tsx
│   └── customer/
│       ├── loader.ts
│       └── viewer.tsx
```

### Implementation

```typescript
// lib/content/books/loader.ts
export class BooksLoader {
  async loadList(): Promise<BookFile[]> {
    // Only scans books/ folder
    // Returns book-specific structure
  }
  
  async loadPage(path: string): Promise<BookPage> {
    // Only loads from books/
  }
}

// lib/content/design/loader.ts
export class DesignDocsLoader {
  async loadList(): Promise<DesignDocFile[]> {
    // Only scans design/ folder
  }
}

// Components use specific loaders
<BooksViewer loader={new BooksLoader()} />
<DesignDocsViewer loader={new DesignDocsLoader()} />
```

### Pros
- ✅ Complete separation
- ✅ Type-safe per content type
- ✅ No cross-contamination possible
- ✅ Easy to optimize per type

### Cons
- ⚠️ Code duplication
- ⚠️ More files to maintain
- ⚠️ Harder to share common functionality

---

## Option 4: Path-Based with Strict Guards (Hybrid)

**Concept:** Keep path-based organization but add strict validation layers.

### Structure

```typescript
// lib/config/content-paths.ts
export const CONTENT_PATHS = {
  DEVELOPER: {
    base: "developer",
    allowedIn: [ViewerMode.DEVELOPER],
    isPublic: false,
  },
  DESIGN: {
    base: "design",
    allowedIn: [ViewerMode.DESIGN],
    isPublic: false,
  },
  BOOKS: {
    base: "books",
    allowedIn: [ViewerMode.BOOKS],
    isPublic: true,
  },
  CUSTOMER: {
    base: "content", // New folder for customer content
    allowedIn: [ViewerMode.BOOKS, ViewerMode.CUSTOMER],
    isPublic: true,
  },
} as const;

// Strict validation
export function validateContentAccess(
  path: string,
  mode: ViewerMode
): boolean {
  for (const [key, config] of Object.entries(CONTENT_PATHS)) {
    if (path.startsWith(config.base + "/")) {
      return config.allowedIn.includes(mode);
    }
  }
  return false; // Default deny
}
```

### Implementation

```typescript
// Apply validation at multiple layers:
// 1. Server-side route
// 2. API endpoints
// 3. Client-side component
// 4. File loading

export async function loadDocumentationFileServer(
  path: string,
  mode: ViewerMode
): Promise<string> {
  // Validate before loading
  if (!validateContentAccess(path, mode)) {
    throw new Error(`Access denied: ${path} not allowed in ${mode} mode`);
  }
  
  // Load file...
}
```

### Pros
- ✅ Multiple validation layers
- ✅ Fail-fast approach
- ✅ Clear error messages
- ✅ Minimal changes to existing code

### Cons
- ⚠️ Still relies on path prefixes
- ⚠️ Need validation at every layer

---

## Option 5: Content Manifest System

**Concept:** Generate a manifest file that maps all content with metadata.

### Structure

```typescript
// Generated: .next/content-manifest.json
{
  "files": [
    {
      "path": "design/README.md",
      "type": "design-docs",
      "mode": "design",
      "public": false,
      "title": "Design Documentation Structure"
    },
    {
      "path": "books/mordreds_tale/chapters/00-prologue/001-page-1.md",
      "type": "books",
      "mode": "books",
      "public": true,
      "title": "Prologue - Page 1"
    }
  ]
}
```

### Implementation

```typescript
// scripts/generate-content-manifest.ts
// Runs at build time
export async function generateManifest() {
  const files = await scanAllContent();
  const manifest = files.map(file => ({
    path: file.path,
    type: detectContentType(file.path),
    mode: detectMode(file.path),
    // ... extract metadata
  }));
  
  await writeFile('.next/content-manifest.json', JSON.stringify(manifest));
}

// Use manifest for filtering
export function getFilesForMode(
  manifest: ContentManifest,
  mode: ViewerMode
): ContentManifestItem[] {
  return manifest.files.filter(f => f.mode === mode);
}
```

### Pros
- ✅ Fast lookups (pre-computed)
- ✅ Can include rich metadata
- ✅ Works well with static generation
- ✅ Single source of truth

### Cons
- ⚠️ Requires build step
- ⚠️ Manifest can get out of sync
- ⚠️ More complex setup

---

## Recommended Approach: Option 1 (Content Type Registry) + Option 4 (Strict Guards)

**Why this combination:**
1. **Registry** provides explicit configuration and type safety
2. **Strict guards** ensure validation at every layer
3. **Minimal changes** to existing file structure
4. **Easy to extend** for new content types

### Implementation Plan

1. **Create content type registry** (`lib/config/content-types.ts`)
2. **Add validation functions** (`lib/utils/content-validator.ts`)
3. **Update loaders** to use registry and validation
4. **Add validation at route level** (server-side)
5. **Add validation at component level** (client-side)
6. **Create separate routes** for different content types if needed

### File Structure

```
lib/
├── config/
│   └── content-types.ts        # Registry
├── utils/
│   ├── content-validator.ts    # Validation logic
│   ├── content-loader.ts       # Unified loader with validation
│   └── docs-loader.ts          # Keep for backward compat
└── content/
    ├── types.ts                # TypeScript types
    └── filters.ts              # Filtering utilities
```

---

## Migration Strategy

1. **Phase 1:** Add registry alongside existing code
2. **Phase 2:** Update loaders to use registry (backward compatible)
3. **Phase 3:** Add strict validation
4. **Phase 4:** Remove old filtering logic
5. **Phase 5:** Add new content types as needed

---

## Additional Considerations

### Customer-Facing Content Organization

Consider creating a dedicated folder structure:

```
public/
├── content/              # All customer-facing content
│   ├── books/           # Books/stories
│   ├── news/            # News/blog posts
│   ├── characters/      # Character profiles
│   └── guides/          # Game guides
├── internal/            # All internal documentation
│   ├── developer/      # Dev docs
│   └── design/         # Design docs
```

### Route Structure

```
app/
├── docs/                # Internal docs (dev + design)
│   └── [[...path]]/
├── content/             # Customer-facing content
│   ├── books/
│   │   └── [[...path]]/
│   ├── news/
│   │   └── [[...path]]/
│   └── characters/
│       └── [[...path]]/
```

---

## Next Steps

1. Choose an option (recommend Option 1 + 4)
2. Create implementation plan
3. Implement incrementally
4. Test thoroughly
5. Document for team


