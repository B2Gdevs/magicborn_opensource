# Payload API Patterns

> **Internal developer documentation** - patterns and gotchas for working with Payload CMS API.

## Client-Side API Calls

### ✅ What Works: Direct Fetch

Use direct `fetch()` calls to `/api/payload/*` endpoints in client components:

```typescript
// ✅ This works fine in client components
const res = await fetch(`/api/payload/acts?where[project][equals]=${projectId}&sort=order`);
const data = await res.json();
```

### ❌ What Doesn't Work: Abstraction in `lib/payload/`

**Do NOT create client-side API utilities in `lib/payload/`.**

We attempted to create a `PayloadApiClient` class to wrap fetch calls:

```typescript
// ❌ DON'T DO THIS - caused "require is not defined" errors
// lib/payload/api-client.ts
export class PayloadApiClient {
  async find(collection, options) { /* fetch wrapper */ }
}
export const payloadApi = new PayloadApiClient();
```

**Why it failed:**
- The `lib/payload/` directory contains server-only code (`client.ts` which imports `payload`)
- Webpack bundled everything in that directory together
- Server-only Node.js code leaked into the client bundle
- Result: `ReferenceError: require is not defined` in browser

**We also tried moving to `lib/api/payload-client.ts`** - same issue due to path alias resolution and webpack caching.

### Lesson Learned

Keep it simple. Direct `fetch()` calls work reliably. Don't over-engineer abstractions that introduce bundling complexity.

If we need shared API utilities in the future:
1. Create them in a clearly client-only location (e.g., `components/` or a `lib/client/` directory)
2. Add `"use client"` directive at the top
3. Ensure no path alias collisions with server-only code
4. Test thoroughly before committing

## Query Parameters

The `/api/payload/[...slug]` route supports:

- `where[field][operator]=value` - Filter queries (e.g., `where[project][equals]=1`)
- `sort=field` or `sort=-field` - Sort ascending/descending
- `limit=N` - Limit results
- `page=N` - Pagination

Example:
```
/api/payload/chapters?where[project][equals]=1&where[act][equals]=5&sort=order&limit=50
```

---

*Last updated: Dec 2024*
*Issue discovered while attempting to centralize Payload API calls*



