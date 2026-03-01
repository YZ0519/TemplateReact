# PRD Session Memory: Projects Portfolio Module

## Status
PRD v1.0 generated on 2026-02-28. Awaiting user approval before implementation.

## Project Context
- **Module:** Projects Portfolio (new feature added to existing DemoClaude app)
- **PRD File:** `D:/GitHub/DemoClaude/docs/PRD-projects-portfolio-module.md`
- **Type:** Enhancement to existing app (NOT a new project)

## Key Decisions Made
- CRUD for projects via UI (owner manages content themselves)
- Separate page per project: `/projects` (list) and `/projects/:slug` (detail)
- No public hero/intro section — goes straight to projects
- Dark modern theme consistent with existing NavBar gradient
- Screenshot display: hero (first screenshot, full-width) + grid (remaining screenshots)
- Screenshots stored via Cloudinary (same as existing Photo system)
- Tech stack displayed as badge tags per project
- Auth required to create/edit/delete; list and detail pages are public (AllowAnonymous)

## Existing Stack (Do Not Change)
- Frontend: React 19, React Router v7, TanStack Query v5, MobX (loading only), Tailwind CSS v4, Axios, Zod + RHF
- Backend: .NET 9, Clean Architecture, MediatR CQRS, EF Core 9, SQLite, ASP.NET Identity, AutoMapper, FluentValidation
- Pattern: No repository — AppDbContext used directly in handlers
- Auth: Cookie-based, global auth filter, AllowAnonymous where needed

## New Domain Entities
- Project (Id, Title, Slug, Description, Status, DisplayOrder, CreatedAt, UpdatedAt)
- ProjectFeature (Id, ProjectId, Description, DisplayOrder)
- ProjectTechStack (Id, ProjectId, Name, Category, DisplayOrder)
- ProjectScreenshot (Id, ProjectId, Url, PublicId, Caption, DisplayOrder)

## Frontend Feature Folder
- `client/src/features/projects/`

## Backend New Namespace
- `Application/Projects/` (Commands + Queries + DTOs)
- `Domain/Project.cs`, `ProjectFeature.cs`, `ProjectTechStack.cs`, `ProjectScreenshot.cs`
- `API/Controllers/ProjectsController.cs`

## Open Questions (from PRD)
1. Should project list page be public or require auth?
   - Decision: List + Detail = AllowAnonymous. Create/Edit/Delete = Auth required.
2. Cloudinary for screenshots confirmed (same IPhotoService pattern).
3. Slug generation: auto-generated from title on create, not editable after creation.
