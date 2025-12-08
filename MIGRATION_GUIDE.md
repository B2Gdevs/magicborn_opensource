# Content Architecture Migration Guide

This document outlines the changes made to implement the Content Type Registry system and what needs to be updated.

## What Was Implemented

### 1. Content Type Registry (`lib/config/content-types.ts`)
- Central configuration for all content types
- Explicit access rules per mode
- Reading mode support (documentation vs book)

### 2. Content Validator (`lib/utils/content-validator.ts`)
- Strict validation functions
- Mode-based filtering
- Access control helpers

### 3. Updated Components

#### `components/DocumentationViewer.tsx`
- Now uses `filterFilesByMode()` for strict filtering
- Detects reading mode (book vs documentation)
- Applies special CSS class for book reading mode

#### `app/docs/[[...path]]/page.tsx`
- Uses `validateContentAccess()` before loading files
- Uses `filterFilesByMode()` for file filtering
- Uses `getDefaultDocumentForMode()` for default documents

#### `lib/utils/docs-loader-server.ts`
- `loadDocumentationFileServer()` now accepts optional `mode` parameter
- Validates access before loading files

### 4. Special Book Reading Experience
- Added `.book-reading-mode` CSS class
- Enhanced typography for books (serif font, larger text, justified text)
- Drop cap styling for first paragraph
- Better spacing and readability

## Current Folder Structure

The system currently works with the existing folder structure:

```
public/
├── design/          # Design docs (internal)
├── developer/       # Developer docs (internal)
└── books/           # Books/stories (customer-facing)
```

## Future Folder Structure (Optional)

If you want to reorganize to the suggested structure:

```
public/
├── content/         # All customer-facing content
│   ├── books/       # Books/stories
│   ├── news/        # News/blog posts (future)
│   ├── characters/  # Character profiles (future)
│   └── guides/      # Game guides (future)
└── internal/        # All internal documentation
    ├── developer/   # Dev docs
    └── design/      # Design docs
```

## What Needs to Be Updated

### If Reorganizing Folders

1. **Update Content Type Registry** (`lib/config/content-types.ts`)
   - Change `basePath` values to match new structure
   - Example: `basePath: "content/books"` instead of `"books"`

2. **Update API Routes** (`app/api/docs/list/route.ts`)
   - Update scan paths to match new structure
   - Example: `join(publicPath, 'content', 'books')` instead of `join(publicPath, 'books')`

3. **Update Server Loaders** (`lib/utils/docs-loader-server.ts`)
   - Update path resolution if needed

4. **Update Book Scanner** (`lib/utils/book-scanner-server.ts`)
   - Update base path for books if moved

5. **Move Files**
   - Move `public/books/` → `public/content/books/`
   - Move `public/design/` → `public/internal/design/`
   - Move `public/developer/` → `public/internal/developer/`

6. **Update Routes** (`app/stories/page.tsx`, `app/style-guide/page.tsx`)
   - Update redirect paths if needed

## Testing Checklist

- [ ] Books mode only shows books (no design/developer docs)
- [ ] Design mode only shows design docs (no books/developer docs)
- [ ] Developer mode only shows developer docs (no design/books docs)
- [ ] Books have special reading styling (serif font, larger text, justified)
- [ ] Default documents work correctly for each mode
- [ ] Navigation between pages works
- [ ] Search works within each mode
- [ ] No cross-contamination between modes

## Adding New Content Types

To add a new content type (e.g., news, characters):

1. Add to `ContentType` enum in `lib/config/content-types.ts`
2. Add config to `CONTENT_TYPE_REGISTRY`
3. Add new `ViewerMode` if needed (or reuse existing)
4. Update folder structure
5. Update API routes to scan new folders

Example:

```typescript
{
  type: ContentType.NEWS,
  basePath: "content/news",
  allowedModes: [ViewerMode.CUSTOMER], // or create ViewerMode.NEWS
  isPublic: true,
  displayName: "News & Updates",
  metadata: {
    readingMode: "article",
  },
}
```

## Notes

- The system is backward compatible with current folder structure
- No breaking changes to existing functionality
- Validation is strict - unknown content types are denied by default
- Books get special "fun" reading experience automatically

