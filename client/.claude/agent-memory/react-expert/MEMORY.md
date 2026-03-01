# React Expert Agent Memory — DemoClaude/client

## Project Structure Confirmed
- App shell: `src/app/layout/App.tsx` — wraps all routes in `bg-gray-100 min-h-screen`, `max-w-screen-xl mx-auto px-4 pt-20`
- Page components must NOT set their own `min-h-screen`, `pt-20`, `px-4`, or background color (shell handles all of this)
- Types: `src/lib/types/index.d.ts`
- Hooks: `src/lib/hooks/useProjects.ts` (all project query/mutation hooks)
- API client: `src/lib/api/agent.ts` (axios instance with interceptors)

## Site Color Theme (Light)
- Page background: `bg-gray-100` (set by App shell)
- Cards/form panels: `bg-white shadow rounded-lg p-8`
- Section/list item panels: `bg-gray-50 border border-gray-200 rounded-lg`
- Heading text: `text-gray-900`
- Body/secondary text: `text-gray-600`
- Muted/meta text: `text-gray-500`
- Brand accent: `#182a73` (dark blue), `#218aac` / `#20a7ac` (teal)
- NavBar gradient: `from-[#182a73] via-[#218aac] to-[#20a7ac]`
- TechStackBadge on light bg: `bg-[#182a73]/10 text-[#182a73] border border-[#182a73]/30`
- Spinner: `border-[#20a7ac] border-t-transparent`

## API / Data Shape Notes
- C# DTOs use PascalCase which serializes to camelCase in JSON
- `TechStacks` (C#) → `techStacks` in JSON → TypeScript type field is `techStacks`
- Both `ProjectSummary` and `ProjectDetail` have `techStacks: TechStackItem[]`

## Query Key Conventions (TanStack Query)
- Project list: `["projects"]`
- Single project: `["project", slug]`
- Invalidate all individual projects (non-exact): `{ queryKey: ["project"], exact: false }`

## Established Patterns
- 404 redirect pattern: `useEffect(() => { if (!loading && !data) navigate("/not-found"); }, [loading, data, navigate])`
- Network error guard in axios interceptor: `if (!error.response) return Promise.reject(error);` placed after `store.uiStore.isIdle()` and before response destructure
- Loading spinner for pages (no background wrapper): `<div className="flex justify-center items-center py-20"><span .../></div>`

## Shared Components Available
- `src/app/shared/components/TextInput` — React Hook Form controlled input
- `src/app/shared/components/SelectInput` — React Hook Form controlled select
- `src/app/shared/components/StyledButton` — variants: `contained`, `outlined`, `text`; sizes: `small`, `medium`; props: `loading`, `disabled`

## Details File
See `patterns.md` for extended notes.
