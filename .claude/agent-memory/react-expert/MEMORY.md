# React Expert Agent Memory — DemoClaude

## Project Overview
- Full-stack app: .NET 9 API backend + React 19 frontend in `client/`
- Build tool: Vite 7 with `@vitejs/plugin-react-swc`, `vite-plugin-mkcert` (HTTPS), `@tailwindcss/vite`
- Dev server: port 3000, HTTPS via mkcert

## Tech Stack (Frontend)
- **React 19** (NOT 18 — use React 19 APIs where relevant)
- **React Router v7** (`react-router` package, `createBrowserRouter`)
- **TanStack Query v5** for ALL server/async state
- **MobX + mobx-react-lite** for lightweight UI-only state (loading indicator)
- **Tailwind CSS v4** (imported via `@import "tailwindcss"` in index.css — no config file)
- **React Hook Form + Zod + @hookform/resolvers** for all forms
- **Axios** for HTTP with request/response interceptors in `src/lib/api/agent.ts`
- **react-toastify** for notifications
- **lucide-react** for icons
- **react-dropzone + react-cropper** for photo upload widget

## Project Structure
Matches the canonical structure defined in the system prompt exactly:
```
client/src/
  main.tsx
  index.css
  app/
    layout/          App.tsx, NavBar.tsx, UserMenu.tsx
    router/          Routes.tsx, RequireAuth.tsx
    shared/
      components/    TextInput, SelectInput, StyledButton, MenuItemLink,
                     PhotoUploadWidget, StarButton, DeleteButton, AvatarPopover
  features/
    account/         LoginForm.tsx, RegisterForm.tsx
    errors/          NotFound.tsx, ServerError.tsx, TestErrors.tsx
    home/            HomePage.tsx
    profiles/        ProfilePage, ProfileHeader, ProfileContent, ProfileAbout,
                     ProfilePhotos, ProfileEdit, ProfileFollowings, ProfileCard
    projects/        ProjectListPage, ProjectDetailPage, CreateProjectPage, EditProjectPage
                     components/ (TechStackBadge, TechStackList, FeatureList,
                     ScreenshotHero, ScreenshotGrid, ScreenshotLightbox,
                     ProjectCard, ProjectDeleteButton, TechStackForm,
                     FeatureForm, ScreenshotUploadForm)
  lib/
    api/             agent.ts (Axios instance + interceptors)
    hooks/           useStore.ts, useAccount.ts, useProfile.ts, useProjects.ts
    schemas/         loginSchema.ts, registerSchema.ts, editProfileSchema.ts,
                     createProjectSchema.ts, editProjectSchema.ts,
                     addTechStackSchema.ts, addFeatureSchema.ts
    stores/          store.ts (StoreContext), uiStore.ts (MobX)
    types/           index.d.ts (Profile, Photo, User, ProjectSummary, ProjectDetail,
                     TechStackItem, ProjectFeature, ProjectScreenshot)
    util/            util.ts (requiredString Zod helper)
```

## Key Patterns
- **Schemas live in `src/lib/schemas/`** (not per-feature) — deviation from canonical; all schemas are global
- **Hooks live in `src/lib/hooks/`** (not per-feature) — useAccount, useProfile, useProjects are all global
- **Types in `src/lib/types/index.d.ts`** — all types in one file, exported as named types
- **MobX only used for `uiStore.isLoading`** — a global loading flag toggled by Axios interceptors
- **TanStack Query query keys**: `["user"]`, `["profile", id]`, `["photos", id]`, `["followings", id, predicate]`, `["projects"]`, `["project", slug]`
- **Auth**: cookie-based (`withCredentials: true`), no JWT tokens in localStorage
- **API base URL**: `import.meta.env.VITE_API_URL`
- **Error handling**: Axios response interceptor handles 400/401/404/500 globally; navigates programmatically via `router.navigate()`
- **Tailwind v4**: no `tailwind.config.js`; uses `@import "tailwindcss"` directly in CSS
- **`requiredString` helper** in `src/lib/util/util.ts` — reusable Zod string validator
- **`z.coerce.number()`** for numeric form fields (displayOrder) — HTML inputs return strings, coerce converts them
- **Dark page override**: Projects pages use `bg-gray-950 min-h-screen pt-20 px-4` on root div — overrides global `bg-gray-100` App shell without modifying it
- **Multi-resource hook pattern**: useProjects exports named functions per concern (`useProjectList`, `useProject`, `useCreateProject`, etc.) rather than one monolithic hook
- **Child mutation invalidation**: use `exact: false` on a query key prefix to invalidate all queries sharing that prefix (e.g., all `["project", *]` entries)
- **Route conflict prevention**: protected routes (RequireAuth block) are evaluated before public dynamic routes — `projects/create` inside RequireAuth avoids conflict with `projects/:slug`

## Shared Component Inventory
| Component | Location | Purpose |
|---|---|---|
| TextInput | shared/components | RHF-controlled input/textarea |
| SelectInput | shared/components | RHF-controlled select (items: {text, value}[]) |
| StyledButton | shared/components | Variant button (contained/outlined/text) |
| MenuItemLink | shared/components | NavLink with active styling for nav |
| PhotoUploadWidget | shared/components | Dropzone + Cropper + upload flow |
| StarButton | shared/components | Set-main-photo toggle |
| DeleteButton | shared/components | Trash icon delete |
| AvatarPopover | shared/components | Hover card over avatar linking to profile |

## Routes
| Path | Component | Auth Required |
|---|---|---|
| / | HomePage | No |
| /login | LoginForm | No |
| /register | RegisterForm | No |
| /errors | TestErrors | No |
| /not-found | NotFound | No |
| /server-error | ServerError | No |
| /profiles/:id | ProfilePage | Yes (RequireAuth) |
| /projects | ProjectListPage | No |
| /projects/create | CreateProjectPage | Yes (RequireAuth) |
| /projects/:slug | ProjectDetailPage | No |
| /projects/:slug/edit | EditProjectPage | Yes (RequireAuth) |
| * | redirect /not-found | — |

## Known Issues / Notes
- `logoutUser` mutation has an empty `removeQueries({})` call (line 42 of useAccount.ts) — likely a bug
- `AvatarPopover` (shared) imports `ProfileCard` (feature) — acceptable since AvatarPopover is tightly coupled to profiles
- `uiStore.isLoading` is toggled by ALL axios requests; no per-request granularity
- Schemas and hooks are kept global (`src/lib/`) rather than per-feature — intentional project convention
