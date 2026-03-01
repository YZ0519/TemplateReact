# PRD Project Manager — Agent Memory

## Active PRDs
- **Projects Portfolio Module** v1.0 (2026-02-28) — see `projects-portfolio-module.md`
  - Status: Draft, awaiting user approval
  - Key file: `D:/GitHub/DemoClaude/docs/PRD-projects-portfolio-module.md`

## Project: DemoClaude
- Existing app — all new features are enhancements, not new projects
- Stack: React 19 + .NET 9 + SQLite + Cloudinary
- Pattern: Feature-based folders (frontend), Clean Architecture + CQRS (backend)
- Auth: Cookie-based, global auth filter on all controllers
- No component library — all UI hand-built with Tailwind CSS v4
- NavBar gradient: `from-[#182a73] via-[#218aac] to-[#20a7ac]`
- App shell background: `bg-gray-100` (light), but new Projects module uses dark theme panels

## User Preferences
- Always ask grouped questions (3-5 max per round), never all at once
- CRUD via UI is the default expectation for any content module
- Screenshots via Cloudinary (existing IPhotoService pattern)
- Slugs auto-generated from title, not user-editable
