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
    home/            HomePage.tsx, HomeStat.tsx, ProjectShowcase.tsx
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
    queryClient.ts   Singleton QueryClient — imported by main.tsx AND agent.ts
    schemas/         loginSchema.ts, registerSchema.ts, editProfileSchema.ts,
                     createProjectSchema.ts, editProjectSchema.ts,
                     addTechStackSchema.ts, addFeatureSchema.ts
    stores/          store.ts (StoreContext), uiStore.ts (MobX)
    types/           index.d.ts (all shared types)
    util/            util.ts (requiredString Zod helper)
```

## Key Patterns
- **Schemas live in `src/lib/schemas/`** (not per-feature) — intentional project convention
- **Hooks live in `src/lib/hooks/`** (not per-feature) — useAccount, useProfile, useProjects are all global
- **Types in `src/lib/types/index.d.ts`** — all types in one file
- **MobX only for `uiStore.isLoading`** — toggled by Axios interceptors
- **TanStack Query query keys**: `["user"]`, `["profile", id]`, `["photos", id]`, `["followings", id, predicate]`, `["projects"]`, `["project", slug]`
- **Auth**: cookie-based (`withCredentials: true`), no JWT tokens in localStorage
- **API base URL**: `import.meta.env.VITE_API_URL`
- **Error handling**: Axios response interceptor handles 400/401/404/500 globally via `router.navigate()`
- **Tailwind v4**: no `tailwind.config.js`; uses `@import "tailwindcss"` directly in CSS
- **`z.coerce.number()`** for numeric form fields — HTML inputs return strings, coerce converts them
- **Dark page override**: Projects pages use `bg-gray-950 min-h-screen pt-20 px-4` to override global `bg-gray-100` without modifying App.tsx
- **Multi-resource hook pattern**: useProjects exports named functions per concern
- **`exact: false` invalidation**: use on query key prefix to invalidate all matching queries
- **Route conflict prevention**: protected routes inside RequireAuth evaluated before public dynamic routes
- **QueryClient singleton**: `src/lib/queryClient.ts` exports the singleton — prevents circular imports between `agent.ts` and `main.tsx`. Agent.ts is a plain module (not React), so it imports queryClient directly instead of using `useQueryClient()`
- **401 handler**: checks `queryClient.getQueryData(["user"])` — truthy = session expired, removes `["user"]` and navigates `/login`; falsy = anonymous, do nothing. No toast on 401.
- **Spinner style**: `inline-block w-8 h-8 border-4 border-[#20a7ac] border-t-transparent rounded-full animate-spin` with `role="status"` `aria-label="Loading"`
- **StyledButton only renders `<button>`** — for `target="_blank"` links, apply equivalent Tailwind manually on an `<a>` tag instead of wrapping StyledButton

## Home Feature Components
| Component | Purpose |
|---|---|
| `features/home/HomePage.tsx` | Page root: Hero section + stat row + showcase |
| `features/home/HomeStat.tsx` | Projects count card (FolderOpen icon), full card links to /projects via React Router Link |
| `features/home/ProjectShowcase.tsx` | Random project spotlight — useMemo for random pick, ProjectCard + "More" `<a target="_blank">` |

## Shared Component Inventory
| Component | Location | Purpose |
|---|---|---|
| TextInput | shared/components | RHF-controlled input/textarea |
| SelectInput | shared/components | RHF-controlled select |
| StyledButton | shared/components | Variant button (contained/outlined/text) — button element only |
| MenuItemLink | shared/components | NavLink with active styling |
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
| /profiles/:id | ProfilePage | Yes |
| /projects | ProjectListPage | No |
| /projects/create | CreateProjectPage | Yes |
| /projects/:slug | ProjectDetailPage | No |
| /projects/:slug/edit | EditProjectPage | Yes |
| * | redirect /not-found | — |

## Known Issues / Notes
- `AvatarPopover` (shared) imports `ProfileCard` (feature) — acceptable coupling
- `uiStore.isLoading` toggled by ALL axios requests; no per-request granularity
- The empty `removeQueries({})` bug in `logoutUser.onSuccess` (useAccount.ts) has been fixed
