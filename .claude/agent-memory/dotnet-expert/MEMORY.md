# DemoClaude .NET Backend - Key Architectural Facts

## Project Overview
- Solution: `Template.sln` targeting **net9.0** (NOT net8 as agent prompt implies)
- Architecture: Clean Architecture with CQRS via MediatR
- Database: SQLite via EF Core 9, db file at `API/template.db`
- Auth: ASP.NET Identity with cookie-based auth (`MapIdentityApi<User>()`)

## Project Dependency Graph
```
Domain  <--  Persistence  <--  Application  <--  Infrastructure
                                    ^                    ^
                                    └──────── API ───────┘
```
- Domain: only `Microsoft.AspNetCore.Identity.EntityFrameworkCore` 9.0.1
- Persistence: only `Microsoft.EntityFrameworkCore.Sqlite` 9.0.11 + Domain
- Application: MediatR 14, AutoMapper 13, FluentValidation 12 + Domain + Persistence (direct DbContext, no repo pattern)
- Infrastructure: CloudinaryDotNet 1.28 + Application
- API: `Microsoft.AspNetCore.OpenApi` 9.0.11 + Application + Infrastructure

## IMPORTANT: No Repository Pattern
Application handlers take `AppDbContext` directly — no IRepository abstraction.

## Domain Entities (Domain/)
- `User : IdentityUser` — DisplayName, Bio, ImageUrl, Photos[], Followings[], Followers[]
- `Photo` — Id (Guid string), Url, PublicId, UserId (FK to User)
- `UserFollowing` — composite PK (ObserverId + TargetId), Observer nav, Target nav
- `Project` — Id (Guid string), Title, Slug (unique indexed), Description, DisplayOrder, CreatedAt, UpdatedAt; nav: Features[], TechStacks[], Screenshots[]
- `ProjectFeature` — Id, ProjectId (FK), Description, DisplayOrder
- `ProjectTechStack` — Id, ProjectId (FK), Name, Category, DisplayOrder
- `ProjectScreenshot` — Id, ProjectId (FK), Url, PublicId, Caption?, DisplayOrder

## AppDbContext (Persistence/AppDbContext.cs)
- Extends `IdentityDbContext<User>`
- DbSets: `Photos`, `UserFollowings`, `Projects`, `ProjectFeatures`, `ProjectTechStacks`, `ProjectScreenshots`
- UserFollowing: composite PK, cascade delete both directions
- Project: unique index on Slug; cascade delete for Features, TechStacks, Screenshots
- Global DateTime UTC value converter applied to all DateTime properties

## Migrations
- `20260227131357_InitialCreate` — ASP.NET Identity tables + Photos + UserFollowings
- `AddProjectsModule` — Projects + ProjectFeatures + ProjectTechStacks + ProjectScreenshots (run: `dotnet ef migrations add AddProjectsModule --project Persistence --startup-project API`)

## Authentication
- Cookie-based via `MapIdentityApi<User>()` mapped at `/api` group
- Global `[Authorize]` filter via `AuthorizeFilter` on all controllers
- No JWT — uses ASP.NET Identity built-in cookie endpoints

## Controllers (API/Controllers/)
- `BaseApiController`: resolves IMediator lazily from HttpContext; `HandleResult<T>` maps Result<T> to HTTP
- `AccountController`: Register (POST), GetUserInfo (GET), Logout (POST) — uses SignInManager directly
- `ProfilesController`: 8 endpoints — all delegate to MediatR (see below)
- `BuggyController`: test/debug error endpoints (not-found, bad-request, server-error, unauthorised)

## API Endpoints Summary
| Method | Route | Auth | Handler |
|--------|-------|------|---------|
| POST | /api/account/register | Anon | SignInManager direct |
| GET | /api/account/user-info | Anon | SignInManager direct |
| POST | /api/account/logout | Auth | SignInManager direct |
| POST | /api/profiles/add-photo | Auth | AddPhoto.Command |
| GET | /api/profiles/{userId}/photos | Auth | GetProfilePhotos.Query |
| DELETE | /api/profiles/{photoId}/photos | Auth | DeletePhoto.Command |
| PUT | /api/profiles/{photoId}/setMain | Auth | SetMainPhoto.Command |
| GET | /api/profiles/{userId} | Auth | GetProfile.Query |
| PUT | /api/profiles | Auth | EditProfile.Command |
| POST | /api/profiles/{userId}/follow | Auth | FollowToggle.Command |
| GET | /api/profiles/{userId}/follow-list | Auth | GetFollowings.Query |
| GET | /api/projects | Anon | GetProjects.Query |
| GET | /api/projects/{slug} | Anon | GetProjectBySlug.Query |
| POST | /api/projects | Auth | CreateProject.Command |
| PUT | /api/projects/{id} | Auth | UpdateProject.Command |
| DELETE | /api/projects/{id} | Auth | DeleteProject.Command |
| POST | /api/projects/{id}/tech-stack | Auth | AddTechStack.Command |
| DELETE | /api/projects/{id}/tech-stack/{itemId} | Auth | RemoveTechStack.Command |
| POST | /api/projects/{id}/features | Auth | AddFeature.Command |
| DELETE | /api/projects/{id}/features/{featureId} | Auth | RemoveFeature.Command |
| POST | /api/projects/{id}/screenshots | Auth | AddScreenshot.Command |
| DELETE | /api/projects/{id}/screenshots/{screenshotId} | Auth | RemoveScreenshot.Command |
| + all MapIdentityApi endpoints at /api/* | | | |

## Application Layer Patterns
- All handlers return `Result<T>` with `IsSuccess`, `Value`, `Error`, `Code` (int for HTTP status)
- `Result<T>.Failure(string, int)` — takes both message AND numeric HTTP code
- `BaseApiController.HandleResult<T>`: 404 -> NotFound, success+value -> Ok, else BadRequest
- ValidationBehavior pipeline: throws `ValidationException` on failure (caught by ExceptionMiddleware)
- Validators: `EditProfileValidator`, `CreateProjectValidator`, `UpdateProjectValidator`, `AddTechStackValidator`, `AddFeatureValidator`
- Slug generation logic lives in `CreateProject.Handler` — strips special chars, replaces spaces with hyphens, appends numeric suffix for uniqueness

## AutoMapper
- Single profile: `MappingProfiles` in `Application/Core/`
- Maps `User -> UserProfile` with FollowersCount, FollowingCount, Following (bool) — uses `currentUser` parameter
- Maps `Project -> ProjectSummaryDto` with HeroScreenshotUrl (first screenshot by DisplayOrder)
- Maps `Project -> ProjectDetailDto`, `ProjectTechStack -> ProjectTechStackDto`, `ProjectFeature -> ProjectFeatureDto`, `ProjectScreenshot -> ProjectScreenshotDto`

## Infrastructure
- `PhotoService`: Cloudinary upload to folder "Template2026", no crop transformation (commented out)
- `UserAccessor`: reads ClaimTypes.NameIdentifier from HttpContext; has GetUserId(), GetUserAsync(), GetUserWithPhotosAsync()
- `CloudinarySettings`: bound from `appsettings.json` section "CloudinarySettings"

## Middleware
- `ExceptionMiddleware : IMiddleware` (registered as Transient) — catches ValidationException (-> 400 ValidationProblemDetails) and general Exception (-> 500 AppException JSON)
- Note: uses legacy `IMiddleware` pattern, NOT `IExceptionHandler` (ASP.NET Core 8+)

## Pagination Infrastructure
- `PagedList<T, TCursor>` — Items + NextCursor (cursor-based pagination, not page-based)
- `PaginationParams<TCursor>` — Cursor + PageSize (default 3, max 50)
- Not yet used by any handler

## CORS
- Allows `http://localhost:3000` and `https://localhost:3000` (React frontend)
- AllowAnyHeader, AllowAnyMethod, AllowCredentials

## Seed Data
- DBInitializer seeds one user: admin@test.com / Pa$$w0rd if no users exist
- Run on startup after MigrateAsync

## Startup (Program.cs)
- No extension methods yet — all DI registration is inline in Program.cs
- OpenAPI (`MapOpenApi()`) in Development only
- API runs on https://localhost:5001

## Naming Conventions
- Handler files: `FeatureName.cs` containing nested `Query`/`Command` + `Handler` classes
- Commands folder: `Application/Profiles/Commands/`
- Queries folder: `Application/Profiles/Queries/`
- DTOs folder: `Application/Profiles/DTOs/`
- Validators folder: `Application/Profiles/Validators/`

## What Does NOT Exist Yet
- No SignalR hubs
- No authorization policies / requirement handlers (IsHostRequirement not implemented)
- No activities or other domain features beyond Users/Profiles/Projects
- No `IExceptionHandler` (uses custom middleware instead)
- Repository pattern is deliberately absent
- No extension methods in API/Extensions/
- `PagedList` / `PaginationParams` defined but unused

## Projects Module (Application/Projects/)
- DTOs: ProjectSummaryDto, ProjectDetailDto, ProjectTechStackDto, ProjectFeatureDto, ProjectScreenshotDto
- Queries: GetProjects (returns ordered list), GetProjectBySlug (404 if not found)
- Commands: CreateProject, UpdateProject, DeleteProject (Cloudinary cleanup before EF delete), AddTechStack, RemoveTechStack, AddFeature, RemoveFeature, AddScreenshot, RemoveScreenshot
- Controller: ProjectsController — GET endpoints [AllowAnonymous], all others use global [Authorize]
- DeleteProject.Handler explicitly loads Screenshots via Include() before removing, to call IPhotoService.DeletePhoto per screenshot
