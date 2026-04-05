# Project Manager — Agent Memory

## Active PRDs
- **Projects Portfolio Module** v1.0 (2026-02-28)
  - Key file: `D:/GitHub/DemoClaude/docs/PRD-projects-portfolio-module.md`
- **Homepage Enhancements** v1.0 (2026-03-01) — 4 features: Hero Redesign, Stat Card, Random Showcase, 401 Fix
  - Key file: `D:/GitHub/DemoClaude/docs/PRD-homepage-enhancements.md`

## Project: DemoClaude
- Stack: React 19 + .NET 8 + SQLite + Cloudinary
- Pattern: Feature-based folders (frontend), Clean Architecture + CQRS (backend)
- Auth: Cookie-based, global auth filter on all controllers. Auth state in TanStack Query `["user"]` key.
- NavBar gradient: `from-[#182a73] via-[#218aac] to-[#20a7ac]`
- `GET /projects` is `[AllowAnonymous]` — safe for unauthenticated homepage use
- Axios `agent.ts` already imports `router` for navigation — use same pattern for 401 redirect

## User Preferences
- Ask questions in grouped batches of 3-5, never all at once
- No new npm libraries without explicit approval
- New-tab links: `target="_blank" rel="noopener noreferrer"`
