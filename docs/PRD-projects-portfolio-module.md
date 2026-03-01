# Product Requirements Document
**Project Name:** Projects Portfolio Module
**Version:** 1.0
**Date:** 2026-02-28
**Author:** PM Agent + User Collaboration
**Status:** Draft

---

## 1. Executive Summary

The Projects Portfolio Module is a new feature domain added to the existing DemoClaude application. It gives the application owner a dedicated space to document and showcase self-developed projects — initially the Info Portal and Finance Portal — with screenshots, descriptions, tech stack badges, and key feature lists.

The module is designed for use during job interviews. When navigated to, a visitor sees a clean list of projects and can drill into a dedicated detail page for each one. The owner manages all content through a built-in CRUD interface so they can add, edit, and remove projects at any time without touching code.

The visual design follows a dark, modern aesthetic consistent with the existing NavBar gradient, while clearly separating the portfolio section from the rest of the application.

---

## 2. Problem Statement

The application owner has built multiple internal portals (Info Portal, Finance Portal) and needs a professional, structured way to present them during job interviews. Currently there is no mechanism to display these projects within the application. Screenshots must be shown ad-hoc, context is missing, and the tech stack used in each portal is not surfaced anywhere.

Without this module, the owner cannot efficiently walk an interviewer through their work within a single, polished interface.

---

## 3. Goals & Objectives

### Business Goals
- Provide a self-managed portfolio section that requires no code changes to update content.
- Make each project's purpose, tech stack, features, and screenshots immediately clear to a non-technical interviewer.
- Allow the owner to add new portfolio projects as their catalogue grows over time.

### User Goals
- View a list of all showcased projects at a glance.
- Navigate to a dedicated detail page for any project.
- Understand what the project does, what tech was used, what the key features are, and see visual proof via screenshots.
- Add, edit, and delete projects and all their related content through the UI.

### Non-Goals
- Public authentication or visitor accounts — the public view is read-only with no login required.
- Commenting, rating, or social interaction on projects.
- Live demo embedding or iframes.
- GitHub repository linking (v1 — may be added later).
- Tags/filtering on the project list (v1 — only two projects initially).

---

## 4. Success Metrics

| Metric | Target | How Measured |
|---|---|---|
| All projects render with no layout breaks on desktop | 100% | Manual QA |
| Hero screenshot loads within 2 seconds | < 2s | Browser DevTools Network tab |
| CRUD operations complete without page reload | All 5 operations | Manual QA |
| Tech stack badges render correctly per project | 100% | Manual QA |
| No auth required to view project list or detail | Verified | Manual QA with logged-out session |

---

## 5. User Personas & Stakeholders

### Primary User: Portfolio Owner (Authenticated)
- The developer who built the showcased projects.
- Uses the CRUD interface to manage project entries.
- Accesses the site during job interviews to walk interviewers through their work.
- Technical — comfortable with form-based UIs for content management.

### Secondary User: Interviewer / Visitor (Unauthenticated)
- A recruiter or hiring manager reviewing the portfolio during or after an interview.
- Non-technical — needs clear descriptions, visual screenshots, and readable tech stack labels.
- Expects a polished, professional presentation.
- Read-only access. No login required.

### Stakeholders
- Application Owner — sole decision-maker for scope and design.

---

## 6. Assumptions & Constraints

### Technical Constraints
- Must integrate into the existing DemoClaude solution without altering existing domains (User Profiles, Photos, Auth).
- Backend must follow the existing Clean Architecture + CQRS pattern using MediatR, AppDbContext directly (no repository pattern), AutoMapper, and FluentValidation.
- Frontend must follow the existing feature-based folder structure under `client/src/features/projects/`.
- Screenshots are uploaded to Cloudinary using the existing `IPhotoService` interface and stored as a URL + PublicId pair in the database.
- Database is SQLite via EF Core 9. New entities require a new migration.
- All new API controller actions are protected by the global auth filter unless explicitly decorated with `[AllowAnonymous]`.

### Business Constraints
- V1 scope covers two projects: Info Portal and Finance Portal. The system must support unlimited projects going forward.
- No budget for additional third-party services — Cloudinary is already configured.

### Key Assumptions
- The `IPhotoService` (Cloudinary) will be reused as-is for screenshot uploads. No changes to the existing photo infrastructure.
- The slug for each project is auto-generated from the title on creation (e.g., "Info Portal" → `info-portal`) and is not editable after creation to preserve stable URLs.
- Display order of projects and screenshots is set by the owner via a numeric `DisplayOrder` field managed in the edit form.
- The project list page and detail page do not require authentication (they are the public-facing portfolio).
- Create, Edit, and Delete actions require the user to be authenticated (owner only).

---

## 7. Feature Requirements

### Feature 1: Project List Page

| Field | Value |
|---|---|
| Priority | P0 — Critical |
| Route | `/projects` |
| Auth Required | No (AllowAnonymous) |

**Description**
A page listing all portfolio projects as cards. Each card shows the project title, a one-line description, and the tech stack badges. Clicking a card navigates to that project's detail page.

**User Story**
As a visitor, I want to see all available projects listed on one page so I can choose which one to explore.

**Acceptance Criteria**
- [ ] All projects are fetched from the API and displayed as cards.
- [ ] Each card shows: project title, short description (truncated to 2 lines), and tech stack badges.
- [ ] Clicking a card navigates to `/projects/:slug`.
- [ ] If the user is authenticated, an "Add Project" button is visible in the top-right of the page.
- [ ] Cards are ordered by `DisplayOrder` ascending.
- [ ] If no projects exist, a friendly empty state message is shown.
- [ ] Page is accessible without authentication.

**Technical Notes**
- API: `GET /api/projects` — returns `List<ProjectSummaryDto>`.
- Frontend query key: `["projects"]`.

---

### Feature 2: Project Detail Page

| Field | Value |
|---|---|
| Priority | P0 — Critical |
| Route | `/projects/:slug` |
| Auth Required | No (AllowAnonymous) |

**Description**
A dedicated page for a single project. Displays the hero screenshot (first screenshot, full-width), the project title, description, tech stack badges, key features list, and a grid of remaining screenshots below.

**User Story**
As a visitor, I want to view all information about a specific project on a dedicated page so I can understand its purpose, technology, and functionality.

**Acceptance Criteria**
- [ ] Page loads project by slug from the API.
- [ ] Hero screenshot is the screenshot with the lowest `DisplayOrder` value; it is displayed full-width.
- [ ] Remaining screenshots (DisplayOrder > lowest) are displayed in a responsive grid (2 columns on desktop, 1 on mobile).
- [ ] Clicking any grid screenshot opens it in a full-screen lightbox/modal overlay.
- [ ] Tech stack badges are grouped and displayed below the project title.
- [ ] Key features are displayed as a bulleted list.
- [ ] If the user is authenticated, "Edit Project" and "Delete Project" buttons are visible.
- [ ] "Delete Project" shows a confirmation dialog before proceeding.
- [ ] If slug does not match any project, redirect to `/not-found`.
- [ ] Page is accessible without authentication.

**Technical Notes**
- API: `GET /api/projects/:slug` — returns `ProjectDetailDto`.
- Screenshots sorted by `DisplayOrder` ascending; index 0 = hero.
- Lightbox: custom modal component using Tailwind — no third-party lightbox library.

---

### Feature 3: Create Project

| Field | Value |
|---|---|
| Priority | P0 — Critical |
| Route | `/projects/create` |
| Auth Required | Yes |

**Description**
A form page that allows the authenticated owner to create a new project entry, including title, description, tech stack items, and key features. Screenshots are uploaded separately after creation (see Feature 5).

**User Story**
As the portfolio owner, I want to create a new project entry so that I can add new work to my portfolio without modifying code.

**Acceptance Criteria**
- [ ] Form fields: Title (required), Description (required), DisplayOrder (required, number).
- [ ] On submit, the project is saved and the user is redirected to `/projects/:slug` of the newly created project.
- [ ] Slug is auto-generated server-side from the title (lowercased, spaces replaced with hyphens, special characters stripped).
- [ ] If the generated slug already exists, a numeric suffix is appended (e.g., `info-portal-2`).
- [ ] All form validation errors are displayed inline beneath their respective fields.
- [ ] Title: minimum 3 characters, maximum 100 characters.
- [ ] Description: minimum 10 characters, maximum 2000 characters.
- [ ] Tech stack items and key features are NOT part of the create form — they are added on the detail/edit page after creation.
- [ ] Page is only accessible to authenticated users. Unauthenticated access redirects to `/login`.

**Technical Notes**
- API: `POST /api/projects` — accepts `CreateProjectDto`, returns `ProjectDetailDto`.
- Frontend: Zod schema `createProjectSchema`, React Hook Form.
- Slug generation logic lives in the backend `CreateProject.Handler`.

---

### Feature 4: Edit Project

| Field | Value |
|---|---|
| Priority | P0 — Critical |
| Route | `/projects/:slug/edit` |
| Auth Required | Yes |

**Description**
A form page allowing the owner to edit a project's title, description, and display order. It also provides inline management (add/remove) of tech stack items and key features on the same page. Slug is read-only after creation.

**User Story**
As the portfolio owner, I want to edit all details of an existing project so I can keep my portfolio accurate and up to date.

**Acceptance Criteria**
- [ ] Form pre-populates with existing project data.
- [ ] Editable fields: Title, Description, DisplayOrder.
- [ ] Slug field is displayed as read-only text (not an input).
- [ ] Tech Stack section: lists existing tech stack items with a delete button per item, plus an "Add Tech Stack Item" form (Name, Category — e.g., "Frontend", "Backend", "Database", "DevOps", "Other").
- [ ] Features section: lists existing features with a delete button per item, plus an "Add Feature" form (Description, DisplayOrder).
- [ ] All inline add/delete operations call the API immediately (no pending queue).
- [ ] On save, user is redirected back to `/projects/:slug`.
- [ ] Same validation rules as Create.
- [ ] Page is only accessible to authenticated users.

**Technical Notes**
- API: `PUT /api/projects/:id` — accepts `UpdateProjectDto`.
- Tech stack and feature add/delete have their own dedicated endpoints (see Section 8).

---

### Feature 5: Delete Project

| Field | Value |
|---|---|
| Priority | P0 — Critical |
| Trigger | Button on detail page |
| Auth Required | Yes |

**Description**
Deletes a project and all its related data (features, tech stack items, screenshots including Cloudinary cleanup).

**User Story**
As the portfolio owner, I want to delete a project so I can remove outdated or irrelevant entries.

**Acceptance Criteria**
- [ ] Delete button appears only when the user is authenticated.
- [ ] A confirmation dialog must be acknowledged before the delete proceeds.
- [ ] On successful delete, the user is redirected to `/projects`.
- [ ] All child records (ProjectFeature, ProjectTechStack, ProjectScreenshot) are cascade-deleted.
- [ ] Screenshots are deleted from Cloudinary as part of the delete operation.

**Technical Notes**
- API: `DELETE /api/projects/:id`.
- EF Core cascade delete configured on all child entities.
- Cloudinary deletion: iterate `ProjectScreenshot` records, call `IPhotoService.DeletePhoto(publicId)` for each before removing DB records.

---

### Feature 6: Screenshot Management

| Field | Value |
|---|---|
| Priority | P0 — Critical |
| Location | Edit Project page |
| Auth Required | Yes |

**Description**
Allows the owner to upload new screenshots, set their caption and display order, and delete existing ones. The first screenshot (lowest DisplayOrder) is always used as the hero on the detail page.

**User Story**
As the portfolio owner, I want to upload, reorder, and remove screenshots for each project so visitors can see how each portal looks and works.

**Acceptance Criteria**
- [ ] Screenshot upload uses a file input (same multipart/form-data pattern as existing photo upload).
- [ ] Each screenshot can have an optional Caption and a DisplayOrder (integer).
- [ ] Uploaded screenshots are stored in Cloudinary; URL and PublicId are saved to `ProjectScreenshot` table.
- [ ] Existing screenshots are displayed in order with a delete button per screenshot.
- [ ] Deleting a screenshot removes it from Cloudinary and from the database.
- [ ] The screenshot with the lowest DisplayOrder is labeled "Hero" in the management UI.
- [ ] A minimum of 1 screenshot is recommended but not enforced — zero screenshots is allowed.

**Technical Notes**
- API: `POST /api/projects/:id/screenshots` (multipart), `DELETE /api/projects/:id/screenshots/:screenshotId`.
- Reuses `IPhotoService` for Cloudinary upload/delete.

---

## 8. Non-Functional Requirements

### Performance
- Project list page must render all project cards within 1 second under normal network conditions.
- Hero screenshot must begin loading immediately on page render (no lazy-load delay on hero; grid screenshots may lazy-load).
- TanStack Query caching: project list stale time = 5 minutes; project detail stale time = 5 minutes.

### Security
- Create, Edit, Delete, and Screenshot upload/delete endpoints must return HTTP 401 if the request is unauthenticated.
- The global auth filter in `Program.cs` covers all controllers. New endpoints that must be public must be explicitly decorated with `[AllowAnonymous]`.
- Public endpoints: `GET /api/projects`, `GET /api/projects/:slug`.
- All other project endpoints: authenticated only.
- No user-ownership check is needed for v1 — there is a single owner of the portfolio.

### Scalability
- The data model supports unlimited projects, screenshots, tech stack items, and features.
- DisplayOrder is an integer — no complex tree/reordering algorithm needed for v1.

### Accessibility
- All images must have descriptive `alt` text (project title + screenshot caption).
- Tech stack badges must have sufficient color contrast against the dark background.
- Lightbox modal must trap focus and be dismissible via the Escape key.
- All interactive elements must be keyboard-navigable.

### Compatibility
- Responsive layout: desktop (1280px+), tablet (768px), mobile (375px+).
- Tested in Chrome and Edge (primary interview browsers).

---

## 9. Page & Route Structure

### New Routes to Add in `Routes.tsx`

```
/projects                    — ProjectListPage       (public, no RequireAuth)
/projects/create             — CreateProjectPage     (RequireAuth)
/projects/:slug              — ProjectDetailPage     (public, no RequireAuth)
/projects/:slug/edit         — EditProjectPage       (RequireAuth)
```

### Route Configuration Pattern

```tsx
// Inside the existing createBrowserRouter children array:

// Public routes (no RequireAuth wrapper):
{ path: "projects", element: <ProjectListPage /> },
{ path: "projects/:slug", element: <ProjectDetailPage /> },

// Protected routes (inside existing RequireAuth element block):
{ path: "projects/create", element: <CreateProjectPage /> },
{ path: "projects/:slug/edit", element: <EditProjectPage /> },
```

### NavBar Update
Add a "Projects" NavLink to the existing nav links section in `NavBar.tsx`, following the same active-state pattern as the "Errors" link.

---

## 10. UI Design Specification

### Theme & Colors

The Projects module uses a dark-panel aesthetic consistent with the existing NavBar gradient while remaining visually distinct from the light-gray app shell.

| Element | Tailwind Classes |
|---|---|
| Page background | `bg-gray-950` or `bg-neutral-900` (dark, full-page override) |
| Project card background | `bg-gray-800` |
| Card border | `border border-gray-700` |
| Card hover | `hover:border-[#218aac] hover:shadow-lg transition-all` |
| Primary text | `text-white` |
| Secondary text | `text-gray-400` |
| Section headings | `text-xl font-semibold text-white` |
| Tech stack badge | `bg-[#182a73]/60 text-[#20a7ac] border border-[#20a7ac]/40 rounded-full px-3 py-1 text-sm` |
| Hero screenshot | Full-width, `rounded-xl`, `object-cover`, max-height `480px` |
| Screenshot grid | `grid grid-cols-2 gap-4` (desktop), `grid-cols-1` (mobile) |
| Grid screenshot | `rounded-lg object-cover w-full aspect-video cursor-pointer hover:opacity-90 transition-opacity` |
| Lightbox overlay | `fixed inset-0 bg-black/90 z-50 flex items-center justify-center` |
| Primary action button | Reuse existing `StyledButton` component |
| Danger button | `bg-red-600 hover:bg-red-700 text-white` |

### Page-Level Layout Override
The existing `App.tsx` shell sets `bg-gray-100` on the full page. The Projects pages must override this by applying a `bg-gray-950 min-h-screen` class to their own top-level wrapper div, creating a self-contained dark section without modifying the global shell.

---

## 11. Component Breakdown

### Frontend Feature Folder Structure

```
client/src/features/projects/
  ProjectListPage.tsx          — Route: /projects
  ProjectDetailPage.tsx        — Route: /projects/:slug
  CreateProjectPage.tsx        — Route: /projects/create
  EditProjectPage.tsx          — Route: /projects/:slug/edit

  components/
    ProjectCard.tsx            — Card used in ProjectListPage
    TechStackBadge.tsx         — Single badge chip for a tech stack item
    TechStackList.tsx          — Renders list of TechStackBadge
    FeatureList.tsx            — Bulleted list of key features
    ScreenshotHero.tsx         — Full-width hero image display
    ScreenshotGrid.tsx         — Grid of remaining screenshots
    ScreenshotLightbox.tsx     — Full-screen modal overlay for a screenshot
    ScreenshotUploadForm.tsx   — File input + caption + order form for edit page
    TechStackForm.tsx          — Inline add form for tech stack on edit page
    FeatureForm.tsx            — Inline add form for features on edit page
    ProjectDeleteButton.tsx    — Delete button + confirmation dialog
```

### Shared Components Reused (from `client/src/app/shared/components/`)
- `StyledButton.tsx` — primary/secondary action buttons
- `TextInput.tsx` — all text input fields in forms
- `PhotoUploadWidget.tsx` — reused or adapted for screenshot upload

### New Hook
```
client/src/lib/hooks/useProjects.ts
```

Responsibilities:
- `useQuery` for project list (`GET /api/projects`)
- `useQuery` for single project by slug (`GET /api/projects/:slug`)
- `useMutation` for create, update, delete project
- `useMutation` for add/delete tech stack item
- `useMutation` for add/delete feature
- `useMutation` for upload/delete screenshot
- `queryClient.invalidateQueries` on all mutations

### New Zod Schemas
```
client/src/lib/schemas/createProjectSchema.ts
client/src/lib/schemas/editProjectSchema.ts
client/src/lib/schemas/addTechStackSchema.ts
client/src/lib/schemas/addFeatureSchema.ts
```

### New TypeScript Types (added to `client/src/lib/types/index.d.ts`)

```typescript
export type ProjectSummary = {
  id: string;
  title: string;
  slug: string;
  description: string;
  displayOrder: number;
  techStack: TechStackItem[];
  heroScreenshotUrl?: string;
};

export type ProjectDetail = {
  id: string;
  title: string;
  slug: string;
  description: string;
  displayOrder: number;
  techStack: TechStackItem[];
  features: ProjectFeature[];
  screenshots: ProjectScreenshot[];
  createdAt: string;
  updatedAt: string;
};

export type TechStackItem = {
  id: string;
  name: string;
  category: string;
  displayOrder: number;
};

export type ProjectFeature = {
  id: string;
  description: string;
  displayOrder: number;
};

export type ProjectScreenshot = {
  id: string;
  url: string;
  publicId: string;
  caption?: string;
  displayOrder: number;
};
```

---

## 12. Data Model

### Domain Entities (new files in `Domain/` project)

#### `Domain/Project.cs`
```
Id             string   (Guid, primary key)
Title          string   (required, max 100)
Slug           string   (required, unique, max 120, indexed)
Description    string   (required, max 2000)
DisplayOrder   int      (default 0)
CreatedAt      DateTime (UTC)
UpdatedAt      DateTime (UTC)

Navigation:
  ICollection<ProjectFeature>    Features
  ICollection<ProjectTechStack>  TechStacks
  ICollection<ProjectScreenshot> Screenshots
```

#### `Domain/ProjectFeature.cs`
```
Id             string   (Guid, primary key)
ProjectId      string   (FK → Project.Id)
Description    string   (required, max 500)
DisplayOrder   int      (default 0)

Navigation:
  Project Project
```

#### `Domain/ProjectTechStack.cs`
```
Id             string   (Guid, primary key)
ProjectId      string   (FK → Project.Id)
Name           string   (required, max 100)
Category       string   (required, max 50 — e.g., "Frontend", "Backend", "Database", "DevOps", "Other")
DisplayOrder   int      (default 0)

Navigation:
  Project Project
```

#### `Domain/ProjectScreenshot.cs`
```
Id             string   (Guid, primary key)
ProjectId      string   (FK → Project.Id)
Url            string   (required — Cloudinary URL)
PublicId       string   (required — Cloudinary PublicId for deletion)
Caption        string?  (optional, max 200)
DisplayOrder   int      (default 0)

Navigation:
  Project Project
```

### EF Core Configuration (in `AppDbContext.cs`)

```csharp
// Add to AppDbContext:
public required DbSet<Project> Projects { get; set; }
public required DbSet<ProjectFeature> ProjectFeatures { get; set; }
public required DbSet<ProjectTechStack> ProjectTechStacks { get; set; }
public required DbSet<ProjectScreenshot> ProjectScreenshots { get; set; }

// In OnModelCreating:
builder.Entity<Project>(x =>
{
    x.HasIndex(p => p.Slug).IsUnique();

    x.HasMany(p => p.Features)
     .WithOne(f => f.Project)
     .HasForeignKey(f => f.ProjectId)
     .OnDelete(DeleteBehavior.Cascade);

    x.HasMany(p => p.TechStacks)
     .WithOne(t => t.Project)
     .HasForeignKey(t => t.ProjectId)
     .OnDelete(DeleteBehavior.Cascade);

    x.HasMany(p => p.Screenshots)
     .WithOne(s => s.Project)
     .HasForeignKey(s => s.ProjectId)
     .OnDelete(DeleteBehavior.Cascade);
});
```

---

## 13. API Endpoints

All endpoints live under `api/projects` via a new `ProjectsController : BaseApiController`.

### Summary Table

| Method | Route | Auth | Handler | Returns |
|---|---|---|---|---|
| GET | `/api/projects` | No | `GetProjects.Query` | `List<ProjectSummaryDto>` |
| GET | `/api/projects/{slug}` | No | `GetProjectBySlug.Query` | `ProjectDetailDto` |
| POST | `/api/projects` | Yes | `CreateProject.Command` | `ProjectDetailDto` |
| PUT | `/api/projects/{id}` | Yes | `UpdateProject.Command` | `Unit` |
| DELETE | `/api/projects/{id}` | Yes | `DeleteProject.Command` | `Unit` |
| POST | `/api/projects/{id}/tech-stack` | Yes | `AddTechStack.Command` | `ProjectTechStackDto` |
| DELETE | `/api/projects/{id}/tech-stack/{itemId}` | Yes | `RemoveTechStack.Command` | `Unit` |
| POST | `/api/projects/{id}/features` | Yes | `AddFeature.Command` | `ProjectFeatureDto` |
| DELETE | `/api/projects/{id}/features/{featureId}` | Yes | `RemoveFeature.Command` | `Unit` |
| POST | `/api/projects/{id}/screenshots` | Yes | `AddScreenshot.Command` | `ProjectScreenshotDto` |
| DELETE | `/api/projects/{id}/screenshots/{screenshotId}` | Yes | `RemoveScreenshot.Command` | `Unit` |

### Controller Skeleton

```csharp
[AllowAnonymous]
[HttpGet]
public async Task<ActionResult<List<ProjectSummaryDto>>> GetProjects()
    => HandleResult(await Mediator.Send(new GetProjects.Query()));

[AllowAnonymous]
[HttpGet("{slug}")]
public async Task<ActionResult<ProjectDetailDto>> GetProjectBySlug(string slug)
    => HandleResult(await Mediator.Send(new GetProjectBySlug.Query { Slug = slug }));

[HttpPost]
public async Task<ActionResult<ProjectDetailDto>> CreateProject(CreateProject.Command command)
    => HandleResult(await Mediator.Send(command));

[HttpPut("{id}")]
public async Task<ActionResult> UpdateProject(string id, UpdateProject.Command command)
{
    command.Id = id;
    return HandleResult(await Mediator.Send(command));
}

[HttpDelete("{id}")]
public async Task<ActionResult> DeleteProject(string id)
    => HandleResult(await Mediator.Send(new DeleteProject.Command { Id = id }));

[HttpPost("{id}/tech-stack")]
public async Task<ActionResult<ProjectTechStackDto>> AddTechStack(string id, AddTechStack.Command command)
{
    command.ProjectId = id;
    return HandleResult(await Mediator.Send(command));
}

[HttpDelete("{id}/tech-stack/{itemId}")]
public async Task<ActionResult> RemoveTechStack(string id, string itemId)
    => HandleResult(await Mediator.Send(new RemoveTechStack.Command { ProjectId = id, ItemId = itemId }));

[HttpPost("{id}/features")]
public async Task<ActionResult<ProjectFeatureDto>> AddFeature(string id, AddFeature.Command command)
{
    command.ProjectId = id;
    return HandleResult(await Mediator.Send(command));
}

[HttpDelete("{id}/features/{featureId}")]
public async Task<ActionResult> RemoveFeature(string id, string featureId)
    => HandleResult(await Mediator.Send(new RemoveFeature.Command { ProjectId = id, FeatureId = featureId }));

[HttpPost("{id}/screenshots")]
public async Task<ActionResult<ProjectScreenshotDto>> AddScreenshot(string id, IFormFile file,
    [FromForm] string? caption, [FromForm] int displayOrder = 0)
    => HandleResult(await Mediator.Send(new AddScreenshot.Command
        { ProjectId = id, File = file, Caption = caption, DisplayOrder = displayOrder }));

[HttpDelete("{id}/screenshots/{screenshotId}")]
public async Task<ActionResult> RemoveScreenshot(string id, string screenshotId)
    => HandleResult(await Mediator.Send(new RemoveScreenshot.Command { ProjectId = id, ScreenshotId = screenshotId }));
```

### Application Layer Folder Structure

```
Application/
  Projects/
    DTOs/
      ProjectSummaryDto.cs
      ProjectDetailDto.cs
      ProjectTechStackDto.cs
      ProjectFeatureDto.cs
      ProjectScreenshotDto.cs
    Queries/
      GetProjects.cs
      GetProjectBySlug.cs
    Commands/
      CreateProject.cs
      UpdateProject.cs
      DeleteProject.cs
      AddTechStack.cs
      RemoveTechStack.cs
      AddFeature.cs
      RemoveFeature.cs
      AddScreenshot.cs
      RemoveScreenshot.cs
    Validators/
      CreateProjectValidator.cs
      UpdateProjectValidator.cs
      AddTechStackValidator.cs
      AddFeatureValidator.cs
```

### AutoMapper Configuration
Add to the existing `MappingProfiles.cs`:

```csharp
CreateMap<Project, ProjectSummaryDto>()
    .ForMember(d => d.HeroScreenshotUrl, o => o.MapFrom(s =>
        s.Screenshots.OrderBy(sc => sc.DisplayOrder).Select(sc => sc.Url).FirstOrDefault()));

CreateMap<Project, ProjectDetailDto>();
CreateMap<ProjectTechStack, ProjectTechStackDto>();
CreateMap<ProjectFeature, ProjectFeatureDto>();
CreateMap<ProjectScreenshot, ProjectScreenshotDto>();
```

### Slug Generation Logic (in `CreateProject.Handler`)

```csharp
private static string GenerateSlug(string title)
{
    var slug = title.ToLowerInvariant();
    slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
    slug = Regex.Replace(slug, @"\s+", "-");
    slug = slug.Trim('-');
    return slug;
}

// Uniqueness check with numeric suffix:
var slug = GenerateSlug(request.Title);
var existingSlugs = await context.Projects
    .Where(p => p.Slug.StartsWith(slug))
    .Select(p => p.Slug)
    .ToListAsync(cancellationToken);

if (existingSlugs.Contains(slug))
{
    int suffix = 2;
    while (existingSlugs.Contains($"{slug}-{suffix}")) suffix++;
    slug = $"{slug}-{suffix}";
}
```

---

## 14. Timeline & Milestones

| Milestone | Scope | Estimated Effort |
|---|---|---|
| M1: Domain & Database | New entities, EF migration, AppDbContext update | 0.5 day |
| M2: Backend — Read Operations | GetProjects + GetProjectBySlug handlers, controller, AutoMapper | 0.5 day |
| M3: Backend — Write Operations | Create, Update, Delete project handlers + validators | 0.5 day |
| M4: Backend — Child Entity Operations | TechStack, Feature, Screenshot add/remove handlers | 1 day |
| M5: Frontend — Types, Schema, Hook | Types, Zod schemas, useProjects hook | 0.5 day |
| M6: Frontend — List & Detail Pages | ProjectListPage, ProjectDetailPage, all display components | 1 day |
| M7: Frontend — CRUD Pages | CreateProjectPage, EditProjectPage, all form components | 1 day |
| M8: Frontend — Screenshot Management | Upload, display, delete, lightbox | 0.5 day |
| M9: NavBar & Routes | Add Projects nav link, register new routes | 0.25 day |
| M10: QA & Polish | End-to-end testing, responsive checks, accessibility | 0.5 day |
| **Total** | | **~6 days** |

---

## 15. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Cloudinary upload fails for large screenshots | Medium | Medium | Enforce max file size on frontend (e.g., 5MB) and return clear error message |
| Slug collision on create | Low | Low | Numeric suffix logic handles this automatically |
| Cascade delete misses Cloudinary cleanup | Medium | Medium | DeleteProject handler explicitly fetches all screenshot PublicIds and calls IPhotoService.DeletePhoto before EF delete |
| Dark overlay conflicts with existing bg-gray-100 shell | Low | Low | Wrap all Projects pages in a self-contained div with bg-gray-950 min-h-screen |
| EF migration breaks existing data | Low | High | Run migration in development first, verify existing tables unaffected before applying to production |

---

## 16. Out of Scope (V1)

- GitHub repository link per project
- Live demo link or iframe embedding
- Filtering or searching the project list by tech stack or category
- Visitor-facing comments or ratings
- Public sharing / social metadata (Open Graph tags)
- Project versioning or changelog
- Drag-and-drop screenshot reordering (DisplayOrder is set manually via number input)
- Multiple portfolio owners / multi-user access control
- Mobile-specific swipe carousel for screenshots (grid is used instead)
- Video uploads or embeds

---

## 17. Open Questions

| # | Question | Owner | Resolution |
|---|---|---|---|
| 1 | Should the project list page be visible in the NavBar for unauthenticated visitors? | Owner | Assumed yes — add NavLink visible to all users |
| 2 | Is there a maximum number of screenshots per project? | Owner | No limit enforced in v1 |
| 3 | Should DisplayOrder on the project list be auto-incremented or always manually set? | Owner | Manually set by the owner via form input |
| 4 | Should the existing `PhotoUploadWidget.tsx` be reused for screenshot upload or should a simpler file input be used? | Developer | Decision deferred to implementation — either is acceptable |
| 5 | Should screenshots have a minimum DisplayOrder of 0 or 1? | Developer | 0 is acceptable; the hero is simply the one with the lowest value |

---

## 18. Appendix

### Glossary

| Term | Definition |
|---|---|
| Hero Screenshot | The screenshot with the lowest DisplayOrder for a project; displayed full-width at the top of the detail page |
| Slug | A URL-safe identifier derived from the project title (e.g., "info-portal") |
| CQRS | Command Query Responsibility Segregation — the pattern used for all MediatR handlers in this application |
| DisplayOrder | An integer field used to control the sort order of cards, screenshots, features, and tech stack items |

### Existing File Paths Referenced

| File | Purpose |
|---|---|
| `client/src/app/router/Routes.tsx` | Add new project routes here |
| `client/src/app/layout/NavBar.tsx` | Add Projects NavLink here |
| `client/src/lib/types/index.d.ts` | Add new TypeScript types here |
| `client/src/lib/api/agent.ts` | Axios instance — no changes needed |
| `Application/Core/MappingProfiles.cs` | Add new AutoMapper mappings here |
| `Persistence/AppDbContext.cs` | Add new DbSet properties and model config here |
| `API/Program.cs` | No changes needed |
| `API/Controllers/BaseApiController.cs` | Inherit from this for new ProjectsController |
| `Infrastructure/Photos/PhotoService.cs` | Reuse IPhotoService for screenshot upload/delete |
