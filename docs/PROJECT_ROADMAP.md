# Project Roadmap & Agent Notes

Internal notes for agents to understand current scope, upcoming work, and key decisions.

## Current Focus
- Align the API layer with Payload CMS conventions (replace custom `/api/payload` route with `handleEndpoints`).
- Maintain media URL compatibility while reducing bespoke request handling.

## Near-Term Roadmap
1. **Payload API Delegation**
   - Implement `handleEndpoints` for `/api/payload`.
   - Add hooks to preserve media URL shaping and auth cookie expectations.
2. **Media Reliability**
   - Validate uploads (project relationship, mime types) through hooks.
   - Confirm CDN/static settings keep `/media` paths stable.
3. **Content Editor v2**
   - Track tasks in `docs/dev/content-editor-v2/` (ongoing).
4. **Config Cleanup**
   - Follow `docs/CONFIG_SETTINGS_REFACTORING_PLAN.md` for settings consolidation.

## Issues & Risks
- Client dependencies on current API response shapes (e.g., `url` on media) could break when delegating to Payload defaults.
- Soft-delete/restore semantics diverge from Payload's built-ins; ensure parity before removal.
- Auth logout currently deletes `payload-token`; confirm equivalent behavior when delegating.

## Decision Log (Recent)
- **Adopt Payload `handleEndpoints`** to reduce maintenance overhead and stay aligned with upstream behavior.
- **Keep media URL normalization via hooks** rather than bespoke route logic.

## Feature Inventory (high level)
- Next.js 14 app with Payload CMS backend.
- Media handling via `/media` static path with filename-derived URLs.
- Auth via Payload users collection with token cookie.
- Content data models: characters, creatures, locations, spells, runes, effects, codex entities, etc.

## Change Tracking
- See `CHANGELOG.md` for detailed release notes and recent documentation updates related to Payload API delegation.
