# Payload handleEndpoints Migration Plan

This note captures the effort, scope, and media-handling adjustments required to replace our custom `/api/payload/[...slug]` route with Payload's `handleEndpoints` helper.

## Effort & Risk Overview
- **Effort level:** Moderate (1–2 engineering days).
- **Complexity drivers:**
  - Re-mapping custom auth/logout/media/restore flows onto Payload defaults or thin wrappers.
  - Extracting media URL normalization into Payload hooks so responses match existing clients.
  - Validating access control and middleware still behave with the delegated handler.
- **Risks:**
  - Regressions in bespoke behaviors (media URL shaping, soft-delete/restore, cookie handling).
  - Client code depending on current response shapes (e.g., added `url` field) may need adjustments.

## Migration Plan
1. **Adopt `handleEndpoints`:** Replace the custom handlers in `app/api/payload/[...slug]/route.ts` with `@payloadcms/next/routeHandler` wired to `payload.config.ts`.
2. **Preserve media URL semantics:**
   - Move the existing filename-to-`/media/` URL logic into Payload hooks (e.g., `afterRead` on `media` and on collections that embed media relationships).
   - Confirm `staticURL` in Payload config mirrors `/media` so URLs remain stable.
3. **Auth flows:**
   - Use Payload's built-in auth endpoints for login/logout/me; only keep a minimal wrapper if we still need to clear `payload-token` cookies explicitly.
4. **Trash/restore:**
   - Lean on Payload's native trash behavior where possible; if restore endpoints are still required, wrap `payload.update` but keep the handler thin and routed through `handleEndpoints` if supported.
5. **Client compatibility:**
   - Audit client fetch calls that expect `url` on media or normalized relationships and adjust either the hooks (preferred) or client code.
6. **Testing:**
   - Regression-test media uploads, auth (login/logout/me), CRUD, trash/restore, and pagination/sorting.

## Media Handling Checklist
- [ ] Add `afterRead` hooks to `media` and relevant collections to append `url` derived from `filename` using `staticURL`.
- [ ] Ensure `staticURL` equals `/media` (current route behavior) and that `admin.bundler` setup keeps asset serving unchanged.
- [ ] Validate uploads via `handleEndpoints` respect `project` relationship requirements; if not, add a `beforeValidate` hook to enforce `project` presence.

## Impact Summary
- **Codebase:** Removes ~400 lines of bespoke routing logic in `app/api/payload/[...slug]/route.ts`, consolidating API behavior under Payload's maintained handler.
- **Maintenance:** Reduced surface area, fewer custom patches when upgrading Payload versions.
- **Consistency:** Aligns our responses and auth flows with Payload defaults, improving interoperability with future Payload features.

## Decision Log
- **Decision:** Proceed to replace the custom API route with `handleEndpoints`, preserving media URL shaping via hooks.
- **Rationale:** Cuts maintenance overhead, reduces drift from Payload conventions, and centralizes behavior in one place.
- **Open Questions:**
  - Do any clients rely on the custom `restore` endpoint shape? If yes, wrap it minimally rather than removing outright.
  - Do we need to keep bespoke soft-delete semantics (`_status: trashed`) or can we rely on Payload's trash implementation entirely?
