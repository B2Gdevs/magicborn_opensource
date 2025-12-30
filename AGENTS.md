# AGENTS: Contribution Pointers

This file applies to the entire repository.

## Priorities
- Favor Payload CMS ecosystem defaults (e.g., `@payloadcms/next/routeHandler` `handleEndpoints`) and keep custom API surfaces minimal.
- Preserve existing media URL and auth semantics when adjusting Payload configuration; consult `docs/dev/payload-handleEndpoints-migration.md` for context.
- Keep the agent-facing roadmap and decision log current (`docs/PROJECT_ROADMAP.md`).

## Workflow Notes
- Before changing API or media behavior, review `payload.config.ts` and related hooks to align with Payload patterns.
- Update `CHANGELOG.md` under **Unreleased** for user-visible changes.
- Prefer `npm test`/`npm run lint` when modifying code; note skipped checks in your summary if not run.

## Style
- Use TypeScript/Next.js conventions already present in the codebase.
- Avoid wrapping imports in try/catch blocks.
