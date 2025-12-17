# Content Editor v2 - Issues and Fixes

This document tracks issues encountered during the Payload CMS integration and their resolutions.

## Initial Setup Issues

### Issue #1: Payload Import Path Error

**Error:**
```
Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: Package subpath './config' is not defined by "exports" in /Users/bgarrard/Documents/custominstallations/magicborn_react/node_modules/payload/package.json imported from /Users/bgarrard/Documents/custominstallations/magicborn_react/payload.config.ts
```

**Root Cause:**
- Payload 3.x changed its export structure
- `buildConfig` is no longer exported from `'payload/config'`
- It's now exported directly from `'payload'`

**Fix:**
Changed import in `payload.config.ts`:
```typescript
// ❌ Before
import { buildConfig } from 'payload/config'

// ✅ After
import { buildConfig } from 'payload'
```

**Files Changed:**
- `payload.config.ts`

**Date:** 2024-12-17

---

### Issue #2: SQLite Adapter Configuration Error

**Error:**
```
[31mERROR[39m: [36mError: cannot connect to SQLite: Expected client configuration as object, got undefined[39m
TypeError: Expected client configuration as object, got undefined
```

**Root Cause:**
- Payload 3.x uses `@payloadcms/db-sqlite` which wraps libSQL
- The adapter expects a `client` object with libSQL configuration
- The old `dbURL` property doesn't exist in Payload 3.x

**Fix:**
Updated SQLite adapter configuration in `payload.config.ts`:
```typescript
// ❌ Before
db: sqliteAdapter({
  dbURL: path.resolve(dirname, 'data', 'payload.db'),
}),

// ✅ After
db: sqliteAdapter({
  client: {
    url: `file:${path.resolve(dirname, 'data', 'payload.db')}`,
  },
}),
```

**Files Changed:**
- `payload.config.ts`

**Date:** 2024-12-17

**Notes:**
- libSQL uses `file:` protocol prefix for local SQLite files
- For remote SQLite (Turso), use `libsql://` protocol
- The `client` object accepts libSQL `Config` type from `@libsql/client`

---

## TypeScript Configuration

### Issue #3: Type Path Alias

**Status:** ✅ Resolved

**Fix:**
Added Payload config path alias to `tsconfig.json`:
```json
"paths": {
  "@payload-config": ["./payload.config"]
}
```

**Files Changed:**
- `tsconfig.json`

**Date:** 2024-12-17

---

## Next.js Configuration

### Issue #4: Webpack Externals for Payload

**Status:** ✅ Resolved

**Fix:**
Updated `next.config.mjs` to exclude Payload and SQLite modules from client bundle:
```javascript
config.externals.push(
  {
    "better-sqlite3": "commonjs better-sqlite3",
  },
  function ({ request }, callback) {
    if (
      request?.includes("spells.db") ||
      request?.includes("spellsRepository") ||
      request?.includes("runesRepository") ||
      request?.includes("drizzle-orm/better-sqlite3") ||
      request?.includes("@payloadcms/db-sqlite") ||
      request?.includes("payload")
    ) {
      return callback(null, `commonjs ${request}`);
    }
    callback();
  }
);
```

**Files Changed:**
- `next.config.mjs`

**Date:** 2024-12-17

---

### Issue #5: Docker npm install Peer Dependency Error

**Error:**
```
npm error ERESOLVE could not resolve
npm error While resolving: @payloadcms/next@3.68.5
npm error Found: next@14.2.15
npm error Could not resolve dependency:
npm error peer next@"^15.4.10" from @payloadcms/next@3.68.5
```

**Root Cause:**
- Payload 3.x requires Next.js 15.4.10+
- Application is on Next.js 14.2.15
- Docker web service runs `npm install` without `--legacy-peer-deps`

**Fix:**
Updated Docker Compose command to use `--legacy-peer-deps`:
```yaml
# ❌ Before
command: sh -c "npm install && npm run dev"

# ✅ After
command: sh -c "npm install --legacy-peer-deps && npm run dev"
```

**Files Changed:**
- `infra/ai-stack/docker-compose.yml`

**Date:** 2024-12-17

**Note:** This is a temporary workaround. Consider upgrading to Next.js 15 in the future for full compatibility.

---

### Issue #6: Invalid URL Error in Docker

**Error:**
```
⨯ TypeError: Invalid URL
    at eval (./app/layout.tsx:14:19)
```

**Root Cause:**
- `app/layout.tsx` uses `new URL(process.env.NEXT_PUBLIC_SITE_URL || '...')`
- In Docker, `NEXT_PUBLIC_SITE_URL` might be `undefined` or empty string
- `new URL(undefined)` throws "Invalid URL" error
- No validation before creating URL object

**Fix:**
1. Added URL validation helper function in `app/layout.tsx`:
```typescript
function getMetadataBase(): URL {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  if (siteUrl && siteUrl.trim() !== '') {
    try {
      return new URL(siteUrl);
    } catch (e) {
      console.warn(`Invalid NEXT_PUBLIC_SITE_URL: ${siteUrl}, using default`);
    }
  }
  
  return new URL('https://magicborn.b2gdevs.com');
}
```

2. Set `NEXT_PUBLIC_SITE_URL` in Docker Compose:
```yaml
environment:
  - NEXT_PUBLIC_SITE_URL=http://localhost:4300
```

**Files Changed:**
- `app/layout.tsx`
- `infra/ai-stack/docker-compose.yml`

**Date:** 2024-12-17

---

### Issue #7: Environment Variables Concatenated in .env.local

**Error:**
```
Invalid NEXT_PUBLIC_SITE_URL: 'https://magicbornstudios.com'PAYLOAD_SECRET=..., using default
```

**Root Cause:**
- `.env.local` file had environment variables on the same line without newlines
- The init script wrote them incorrectly, causing concatenation
- `NEXT_PUBLIC_SITE_URL` was being read as `'https://magicbornstudios.com'PAYLOAD_SECRET=...`

**Fix:**
1. Fixed `.env.local` file to have proper line breaks:
```bash
NEXT_PUBLIC_SITE_URL=https://magicbornstudios.com
PAYLOAD_SECRET=rQpw/m+b+Q+fCxx1PNJWK4ZuhtSiIMBhc5xQtVum0bs=
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
```

2. Enhanced URL validation in `app/layout.tsx` to handle concatenated values:
```typescript
// Clean up the URL - remove any concatenated values after the URL
const cleanUrl = siteUrl.split(/[PAYLOAD_]/)[0].trim();
// Remove quotes if present
const unquotedUrl = cleanUrl.replace(/^['"]|['"]$/g, '');
```

**Files Changed:**
- `.env.local` (fixed formatting)
- `app/layout.tsx` (enhanced validation)

**Date:** 2024-12-17

---

### Issue #8: Payload Admin UI 404 Error

**Error:**
```
GET /admin 404 in 309ms
```

**Root Cause:**
- Payload admin UI route not configured in Next.js App Router
- Only `/api/payload/[...slug]` route exists, but admin UI needs `/admin` route

**Fix:**
Created Payload admin route handler at `app/admin/[[...segments]]/route.ts`:
- Handles all HTTP methods for admin UI
- Routes requests to Payload router with `admin` prefix
- Supports all admin UI paths (login, collections, etc.)

**Files Changed:**
- `app/admin/[[...segments]]/route.ts` (new file)

**Date:** 2024-12-17

---

### Issue #9: "require is not defined" Error in Client-Side Hook

**Error:**
```
Uncaught ReferenceError: require is not defined
    at @lib/payload/hooks/useMagicbornMode (page.js:18:1)
```

**Root Cause:**
- Webpack config was too aggressive in externalizing "payload" modules
- Client-side hooks in `lib/payload/hooks/` were being incorrectly externalized
- This caused `require` to be used in browser context where it doesn't exist

**Fix:**
1. Updated webpack externals function to exclude client hooks:
```javascript
// Only externalize payload server-side modules, not client hooks
(request?.includes("payload") && 
 !request?.includes("hooks") &&
 !request?.includes("lib/payload/hooks"))
```

2. Enhanced `useMagicbornMode` hook to actually fetch from API:
- Removed placeholder code
- Added proper API fetching
- Handles "default" projectId case

3. Updated content editor pages:
- Added Suspense boundaries for better loading states
- Improved project ID handling

**Files Changed:**
- `next.config.mjs` (webpack externals)
- `lib/payload/hooks/useMagicbornMode.ts` (API integration)
- `app/content-editor/[projectId]/page.tsx` (Suspense)
- `app/content-editor/page.tsx` (default project fetching)

**Date:** 2024-12-17

---

## Known Issues / TODO

### Issue #6: Payload Route Handler Implementation

**Status:** ⚠️ Needs Verification

**Current Implementation:**
- Route handler at `app/api/payload/[...slug]/route.ts`
- Uses `getPayload()` and `payload.router()`

**Potential Issues:**
- May need to handle async params in Next.js 14+ (params are now Promise-based)
- Need to verify CORS and authentication flow

**Files to Check:**
- `app/api/payload/[...slug]/route.ts`

**Date:** 2024-12-17

---

### Issue #7: Authentication Flow

**Status:** 🔄 In Progress

**Current State:**
- Users collection has auth enabled
- No login page or session management implemented yet
- Superuser created but no way to authenticate in UI

**Next Steps:**
- Create login page
- Implement session management
- Protect routes with authentication middleware

**Date:** 2024-12-17

---

### Issue #8: UI Components Not Connected to Payload API

**Status:** 🔄 In Progress

**Current State:**
- UI components created but using placeholder data
- `ContentGridView`, `ProjectSwitcher`, `useMagicbornMode` need API integration

**Next Steps:**
- Connect components to `/api/payload/*` endpoints
- Implement proper error handling
- Add loading states

**Date:** 2024-12-17

---

## Testing Checklist

- [x] Payload initialization script runs successfully
- [x] Database file created at `data/payload.db`
- [x] Superuser and default project created
- [ ] Payload Admin UI accessible at `/admin`
- [ ] Content Editor accessible at `/content-editor/[projectId]`
- [ ] API endpoints respond correctly
- [ ] Authentication flow works
- [ ] UI components fetch real data

---

## Environment Variables

**Required:**
```bash
PAYLOAD_SECRET=<generated-secret>
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
```

**Generated by:** `scripts/init-payload.ts` (adds to `.env.local`)

---

## Database Location

- **Payload DB:** `data/payload.db` (separate from existing `data/spells.db`)
- **Isolation:** Payload uses separate database to avoid conflicts during migration

---

## References

- [Payload 3.x Documentation](https://payloadcms.com/docs)
- [libSQL Client Documentation](https://github.com/tursodatabase/libsql-client-ts)
- [Payload SQLite Adapter](https://github.com/payloadcms/payload/tree/main/packages/db-sqlite)

