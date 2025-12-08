# Book Architecture and Routing

This document explains how books/stories are handled in the documentation system, why we use redirects, and the current issues we're facing.

## Current Architecture

### File Structure

Books are stored in a nested structure:
```
public/books/
├── mordreds_tale/
│   ├── chapters/
│   │   ├── 00-prologue/
│   │   │   ├── 001-page-1.md
│   │   │   ├── 002-page-2.md
│   │   │   └── ...
│   │   ├── 01-chapter-1-morgana/
│   │   │   └── ...
│   │   └── ...
│   ├── images/
│   └── stories/
└── mordreds_legacy/
    └── ...
```

### Two Different Systems

We have **two separate systems** for handling content:

1. **Documentation File Scanner** (`lib/utils/docs-loader-server.ts`)
   - Scans `public/design/`, `public/developer/`, and `public/books/`
   - Creates a flat file list for the documentation viewer
   - Used for filtering and navigation in the sidebar

2. **Book Scanner** (`lib/utils/book-scanner-server.ts`)
   - Specifically designed for books
   - Understands book structure (chapters, pages, numbering)
   - Provides book-specific features (page navigation, chapter structure)
   - Returns structured data with page numbers, chapter info, etc.

### Why Two Systems? (Actually, We Don't Need Two!)

**Current Reality:**
- Books are just markdown files in nested folders, same as other docs
- Both have hierarchical structures (folders/subfolders)
- Both can have images (linked in markdown)
- Both can have navigation (next/previous = next/last file in folder)
- The only real difference is styling ("fun" reading experience for books)

**The Separate System is Unnecessary:**
- Books don't need special page numbering
- Books don't need special chapter handling
- Books don't need a separate scanner
- Books can use the same file-based navigation as docs

**We Should Simplify:**
- Use the same docs scanner for books
- Treat books like any other documentation category
- Only difference: apply "book" reading mode styling
- Navigation can be: next file in folder, previous file in folder

## Current Routing Flow

### The Redirect Chain

1. **User clicks "Stories" in sidebar** → `/stories`
2. **`/stories` route** (`app/stories/page.tsx`)
   - Loads books from book scanner
   - Finds first book (mordreds_tale)
   - Gets first page (page 1)
   - Redirects to: `/docs/books/mordreds_tale/chapters/00-prologue/001-page-1?mode=books`

3. **`/docs?mode=books` route** (`app/docs/[[...path]]/page.tsx`)
   - If no path provided, tries to redirect to first book page
   - This creates a **redirect loop** if books can't be loaded

4. **`/docs/books/...` route** (same file, with path)
   - Tries to load the file
   - Validates access
   - Renders the page

### Why We're Getting 404s

**Problem 1: Book pages aren't in the documentation file list**

When we filter files by mode:
```typescript
const filteredFiles = filterFilesByMode(files, actualMode);
```

Book pages might not be included because:
- The docs scanner might not scan deep enough into book folders
- Book pages have a specific naming pattern that might not match
- The file list might be incomplete

**Problem 2: Validation fails**

The content validator checks if a path is allowed:
```typescript
validateContentAccess(targetPath, actualMode);
```

But book pages might not be recognized because:
- They're not in the filtered files list
- The path format might not match what the validator expects
- The content type registry might not recognize the path

**Problem 3: File loading fails**

When trying to load the file:
```typescript
const content = await loadDocumentationFileServer(targetPath, actualMode);
```

The path might not resolve correctly:
- Path format: `books/mordreds_tale/chapters/00-prologue/001-page-1`
- File system: `public/books/mordreds_tale/chapters/00-prologue/001-page-1.md`
- The loader needs to handle this conversion

## Why We Use Redirects

### Original Intent

1. **Single Route for All Content**
   - `/docs` handles all documentation (design, developer, books)
   - Mode parameter (`?mode=books`) determines what to show
   - Keeps routing simple and consistent

2. **Server-Side Rendering**
   - Books need to be server-rendered for SEO
   - Redirect ensures we hit the server-rendered route
   - Pre-loads all data before rendering

3. **Default Behavior**
   - When visiting `/stories` or `/docs?mode=books`, we want to show the first page
   - Redirect ensures we always have a specific page to render

### Problems with This Approach

1. **Redirect Loops**
   - If the target route fails, it redirects back
   - Creates infinite redirect chain
   - Browser shows 404 or redirect error

2. **Double Loading**
   - Books are loaded twice (once for redirect, once for render)
   - Inefficient and slow

3. **Error Handling**
   - Errors in redirect logic are hard to debug
   - User sees generic 404 instead of helpful error

## Better Approaches

### Option 1: Simplify - Treat Books Like Regular Docs (Recommended)

**Remove the separate book scanner system:**
- Use the same docs scanner for books
- Books are just files in `public/books/` folder
- Navigation: next file in folder, previous file in folder
- No special page numbering needed
- No special chapter handling needed

**Create separate route for books:**
```
/app/books/[[...path]]/page.tsx
```

This route:
- Scans `public/books/` using the regular docs scanner
- Applies "book" reading mode styling
- Handles navigation (next/prev = next/last file in folder)
- No redirects needed - render directly

**Pros:**
- Much simpler architecture
- No duplicate systems
- Books work like any other docs
- Clear separation (separate route)
- No redirects = no redirect loops

**Cons:**
- Need to refactor to remove book scanner
- Need to update navigation logic

### Option 2: Keep Current System, Fix Redirects

Keep the separate book scanner but fix the redirect issues:

1. **Ensure book pages are in file list**
   - Make sure docs scanner includes all book pages
   - Or merge book scanner results into file list

2. **Fix validation**
   - Make validation recognize book paths
   - Or skip validation for book paths (current approach)

3. **Better error handling**
   - Don't redirect on error, show error page
   - Log errors for debugging

**Pros:**
- Minimal changes
- Keeps existing book-specific features

**Cons:**
- Maintains unnecessary complexity
- Still have two systems doing similar things

## Current Workarounds

We've implemented several workarounds:

1. **Skip validation for book paths**
   ```typescript
   if (actualMode === ViewerMode.BOOKS && targetPath.startsWith('books/')) {
     // Skip strict validation
   }
   ```

2. **Allow dynamic params**
   ```typescript
   export const dynamicParams = true; // Allow dynamic generation
   ```

3. **Add book pages to static params**
   - Include all book pages in `generateStaticParams()`
   - Ensures they're pre-generated

## Recommendations

1. **Short term:** Fix redirects to prevent loops (current workarounds)
2. **Medium term:** Simplify architecture - remove book scanner, use docs scanner
3. **Long term:** Create separate `/books` route that treats books like regular docs

## Simplification Plan

### Step 1: Remove Book Scanner Dependency
- Books are just markdown files in folders
- Use regular docs scanner to find all `.md` files in `public/books/`
- Navigation: get current file, find next/prev in same folder

### Step 2: Create Separate Book Route
```
/app/books/[[...path]]/page.tsx
```
- Scans `public/books/` using docs scanner
- Filters to only show books
- Applies book reading mode styling
- Handles file-based navigation

### Step 3: Update Navigation
- Next page = next file in folder (alphabetically)
- Previous page = previous file in folder
- Chapter navigation = parent folder navigation
- No special numbering needed

### Benefits
- One system instead of two
- Simpler code
- Easier to maintain
- Books work like any other docs
- No redirects needed

## Questions to Answer

1. **Do we need redirects at all?**
   - Could we render directly from `/stories`?
   - Would that break SEO or other requirements?

2. **Should books be in the docs file list?**
   - Currently they're separate
   - Would merging them simplify things?

3. **Is the redirect chain necessary?**
   - Could `/stories` render directly?
   - Or could `/docs?mode=books` render a default view?

## Related Files

- `app/stories/page.tsx` - Stories route (redirects)
- `app/docs/[[...path]]/page.tsx` - Main docs route
- `lib/utils/book-scanner-server.ts` - Book structure scanner
- `lib/utils/docs-loader-server.ts` - General docs scanner
- `lib/utils/content-validator.ts` - Access validation
- `lib/config/content-types.ts` - Content type registry

