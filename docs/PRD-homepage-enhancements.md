# Product Requirements Document
**Project Name:** DemoClaude — Homepage Enhancements
**Version:** 1.0
**Date:** 2026-03-01
**Author:** PM Agent + User collaboration
**Status:** Draft

---

## 1. Executive Summary

This PRD covers four targeted enhancements to the DemoClaude fullstack application's homepage and authentication experience. The application is a portfolio/project-showcase platform built on a .NET 8 Clean Architecture backend and a React 19 + TypeScript frontend. Its current homepage is a placeholder — a single centered heading with no content or visual identity.

These enhancements transform the homepage into a meaningful landing experience by introducing a branded hero section, a live project count stat card, and a rotating spotlight showcasing a randomly selected project. In parallel, a long-standing UX defect in the authentication error handling is resolved: expired session 401 responses will now trigger an automatic logout and redirect rather than silently toasting an "Unauthorised" message that is meaningless to the user.

The changes are entirely frontend-driven (no new backend endpoints required) and are isolated to three files at their core: `HomePage.tsx`, `agent.ts`, and a new `ProjectShowcase` component within the home feature.

---

## 2. Problem Statement

### 2.1 Homepage is a Dead End
The current homepage (`client/src/features/home/HomePage.tsx`) renders a single `<h1>` tag with "Welcome to Home Page!". Any visitor — authenticated or not — lands on a page with zero content, zero calls to action, and no indication of what the application contains. This is a missed opportunity to communicate the app's purpose and direct users toward the Projects section.

### 2.2 No At-a-Glance Statistics
There is no way for a visitor to immediately understand the scale or activity of the project portfolio. A simple projects count would provide instant context.

### 2.3 No Entry Point into Project Content
The only path to project content is navigating to `/projects` via the navbar. There is no passive discovery mechanism — no featured project, no preview, no reason for a visitor to explore further from the homepage.

### 2.4 Broken Authentication Error UX
The Axios interceptor in `client/src/lib/api/agent.ts` (line 50) fires `toast.error("Unauthorised")` on every HTTP 401 response globally. This means:
- An anonymous visitor who loads any public page that internally triggers an auth-guarded API call sees a confusing red toast saying "Unauthorised" — with no context or action.
- A logged-in user whose session cookie has expired mid-session also receives only a toast, with no automatic recovery path (they must manually navigate to `/login`).

Neither scenario is handled correctly. The fix must distinguish between these two cases and handle them appropriately.

---

## 3. Goals and Objectives

### Business Goals
- Increase time-on-site by giving visitors meaningful content on the first page they see.
- Reduce bounce rate from the homepage by providing a clear call-to-action to the Projects section.
- Eliminate a confusing auth error UX that erodes trust.

### User Goals
- Visitors can immediately understand what the application showcases.
- Visitors can see how many projects exist without clicking away.
- Visitors can preview a featured project directly from the homepage and navigate to its detail page in one click.
- Logged-in users whose sessions expire are automatically returned to login without confusion.
- Anonymous visitors on public pages are never shown spurious "Unauthorised" error messages.

### Non-Goals
- No new backend API endpoints are in scope.
- No changes to the Projects list page (`ProjectListPage.tsx`) or detail page (`ProjectDetailPage.tsx`).
- No changes to the NavBar, routing structure, or authentication flow beyond the 401 interceptor behavior.
- No server-side rendering or SEO optimization.
- No pagination or filtering on the homepage showcase.
- The showcase does not pin a specific project — randomization is intentional and changes on each page load.

---

## 4. Success Metrics

| Metric | Measurement Method | Target |
|---|---|---|
| Homepage is no longer a blank placeholder | Manual QA: homepage renders hero + stat + showcase | 100% pass |
| Projects count displays correctly | QA: matches actual row count in the database | Exact match |
| Random showcase renders a different project across reloads | QA: reload homepage 5 times, verify variety | At least 2 unique projects shown across 5 reloads (assuming 2+ projects exist) |
| "More" button opens correct project detail in new tab | QA: click "More", verify URL is `/projects/{slug}` in new tab | 100% pass |
| Anonymous visitors see zero "Unauthorised" toasts | QA: browse public pages without logging in | 0 toasts |
| Session expiry redirects to login | QA: expire cookie manually, trigger an auth-guarded action | Redirect to `/login` with no toast |
| No regression on existing Projects pages | Run existing Vitest component test suite | All tests pass |

---

## 5. User Personas and Stakeholders

### Primary User: Anonymous Visitor
A recruiter, colleague, or developer who arrives at the application without an account. They are evaluating the portfolio's content. They should be able to:
- Understand the app's purpose within 3 seconds of landing.
- See live statistics and a featured project without logging in.
- Never encounter an "Unauthorised" error during normal browsing.

### Secondary User: Authenticated Owner
The developer who owns and manages this portfolio application. They log in to create, edit, and delete projects. They should:
- Not be disrupted by spurious auth errors.
- Be automatically redirected to login when their session expires, with their state cleanly cleared.

### Stakeholders
- Developer/Owner: sole decision-maker and implementer for this project.

---

## 6. Assumptions and Constraints

### Technical Constraints
- The frontend stack is React 19, TypeScript, TanStack Query v5, MobX, React Hook Form, Zod, Tailwind CSS v4, Vite, and React Router v7. No new libraries may be introduced for these features.
- The backend uses .NET 8 Identity cookie authentication (`api/login?useCookies=true`). Session expiry manifests as a 401 on any authenticated API call.
- `GET /projects` and `GET /projects/{slug}` are already `[AllowAnonymous]` on the backend — no backend changes are needed for the homepage to fetch project data without authentication.
- The global Axios interceptor in `agent.ts` is the single point responsible for all HTTP error handling and is the correct place to fix the 401 behavior.
- There is no dedicated "session check" mechanism beyond the `useAccount` hook's `GET /account/user-info` query. The user's auth state lives in the TanStack Query cache under the `["user"]` query key.

### Key Assumptions
- The `useProjectList()` hook (which calls `GET /projects`) can be called safely from `HomePage.tsx` for unauthenticated users because the endpoint is `[AllowAnonymous]`. This will not trigger a 401.
- Randomization on the frontend (selecting a random index from the fetched projects array) is acceptable. The showcase changes on each full page load, not on a timer.
- "Frontend randomization" means: after `useProjectList()` resolves, compute `Math.floor(Math.random() * projects.length)` once, derived from the fetched data. Because TanStack Query caches the result for 5 minutes (`staleTime: STALE_5_MINUTES`), the same random pick will persist across in-session navigations back to the homepage unless the cache expires. This is acceptable behavior.
- The existing `logoutUser` mutation in `useAccount.ts` correctly clears the `["user"]` query cache and navigates to `/`. The 401 fix will programmatically invoke equivalent cleanup — clearing the `["user"]` query and navigating to `/login`.
- The `queryClient` is not directly accessible inside `agent.ts` (which is a plain Axios instance, not a React component). The 401 cleanup will therefore call `queryClient.removeQueries({ queryKey: ["user"] })` via a mechanism that bridges the interceptor to React Query — specifically by calling the `store`'s queryClient reference or by importing the router for navigation and using `queryClient` obtained from a module-level singleton pattern consistent with how `router` is already imported in `agent.ts`.

### Dependencies
- The `ProjectCard` component at `client/src/features/projects/components/ProjectCard.tsx` must be reused as-is for the showcase card. No modifications to `ProjectCard` are in scope.
- The `useProjectList` hook at `client/src/lib/hooks/useProjects.ts` is reused without modification.
- The `lucide-react` icon library is already installed and used throughout the app (e.g., `Users` icon in NavBar). It should be used for the stat card icon.

---

## 7. Feature Requirements

---

### Feature 1: Homepage Hero Section

**Priority:** P1 — High

**Description:**
Replace the current single-`<h1>` `HomePage.tsx` with a structured layout containing a branded hero section at the top. The hero visually anchors the page and communicates the app's purpose.

**User Story:**
As an anonymous visitor, I want to see a visually polished hero section when I land on the homepage, so that I immediately understand what this application is about and feel engaged to explore further.

**Acceptance Criteria:**
- AC1.1: The hero section uses a gradient background matching the NavBar palette: `from-[#182a73] via-[#218aac] to-[#20a7ac]` (left to right), applied as a full-width band.
- AC1.2: The hero section contains at minimum: a headline (e.g., a title for the portfolio), and a short subtitle describing the application's purpose.
- AC1.3: The hero section renders correctly on mobile (single column) and desktop (full width). It must not overflow the viewport horizontally.
- AC1.4: Text inside the hero section is white and legible against the gradient background.
- AC1.5: The hero section sits below the fixed NavBar (which has `h-16` / 64px height). The existing `pt-20` on the `App.tsx` content wrapper already handles this offset — the hero must not add additional unwanted top padding.
- AC1.6: The overall `HomePage.tsx` layout stacks vertically: Hero section → Stat card row → Random showcase section. Each section has appropriate vertical spacing (e.g., `py-8` or `py-10` between sections).

**Technical Notes:**
- `HomePage.tsx` is the only file that changes for this feature.
- The `App.tsx` content wrapper (`max-w-screen-xl mx-auto px-4 pt-20`) constrains content width. The hero gradient should visually break out of this or be designed to work within it — confirm with the implementer which approach is preferred. If full-bleed is desired, the hero must be placed outside the `max-w-screen-xl` div (i.e., rendered above the content wrapper in `App.tsx`) or use negative margins. If contained, the gradient simply fills the card/section within the max-width. **Given that `App.tsx` is out of scope for modification, the hero gradient will be a contained section within the existing content wrapper.**
- No new dependencies required.

---

### Feature 2: Total Projects Count Stat Card

**Priority:** P1 — High

**Description:**
Display the total number of projects as a stat card on the homepage. The card includes an icon, a large numeric count, a label, and is clickable — linking to the `/projects` page.

**User Story:**
As a visitor, I want to see the total number of projects at a glance on the homepage, so that I can immediately understand the scale of this portfolio without navigating away.

**Acceptance Criteria:**
- AC2.1: The stat card displays the current total count of projects as a prominent number.
- AC2.2: The card includes a recognizable icon (suggested: `FolderOpen` or `Layers` from `lucide-react`) rendered alongside or above the number.
- AC2.3: The card includes a text label beneath the number, e.g., "Projects".
- AC2.4: The entire card is clickable and navigates the user to `/projects` (same tab, using React Router `Link` or `useNavigate`).
- AC2.5: While projects are loading (`loadingProjects === true`), the count area displays a loading skeleton or spinner — not `0` or `undefined`.
- AC2.6: If there are zero projects, the card displays `0` — it does not hide itself.
- AC2.7: The card styling is consistent with the app's design language (white card, subtle border, hover state, rounded corners — consistent with `ProjectCard`'s `bg-white border border-gray-200 hover:border-[#218aac] hover:shadow-md` pattern).

**Technical Notes:**
- Data source: `useProjectList()` from `client/src/lib/hooks/useProjects.ts`. The count is `projects?.length ?? 0`.
- No new API call is needed — the projects list is fetched once and shared between the stat card and the showcase (TanStack Query deduplicates the request).
- The stat card can be implemented as an inline section within `HomePage.tsx` or extracted to a `HomeStat.tsx` component within `client/src/features/home/`. Prefer extraction if the component exceeds ~20 lines of JSX.

---

### Feature 3: Random Project Showcase

**Priority:** P1 — High

**Description:**
Display a single randomly selected project as a featured "spotlight" card on the homepage. The card shows the project's full `ProjectCard` presentation (hero image, title, truncated description, tech stack badges) plus a "More" button that opens the project's detail page in a new browser tab.

**User Story:**
As a visitor, I want to see a randomly featured project on the homepage, so that I can discover the portfolio's content without having to browse through the full projects list.

**Acceptance Criteria:**
- AC3.1: One project is selected at random from the list returned by `useProjectList()`. Selection uses `Math.floor(Math.random() * projects.length)` evaluated once when the data resolves.
- AC3.2: The showcase renders the selected project using the existing `ProjectCard` component. `ProjectCard` must not be modified.
- AC3.3: A "More" button is rendered below or overlaid on the `ProjectCard`. Clicking it opens `/projects/{slug}` in a **new browser tab** (using `target="_blank"` with `rel="noopener noreferrer"`).
- AC3.4: The "More" button is labeled exactly "More".
- AC3.5: While projects are loading, the showcase area displays a loading spinner consistent with the spinner style used elsewhere in the app (`inline-block w-8 h-8 border-4 border-[#20a7ac] border-t-transparent rounded-full animate-spin`).
- AC3.6: If the projects list is empty (zero projects), the showcase section is not rendered — it is hidden entirely. No empty state message is required for this section.
- AC3.7: If only one project exists, it is always shown (no randomization needed, but the same code path handles it correctly).
- AC3.8: The showcase section has a visible section heading, e.g., "Featured Project", rendered above the card.
- AC3.9: The `ProjectCard`'s built-in click handler (which navigates to the project detail page in the same tab) remains functional. The "More" button is an additional affordance for new-tab navigation and does not replace the card's own click behavior.

**Technical Notes:**
- Implementation lives in `client/src/features/home/`. Extract to a `ProjectShowcase.tsx` component within that directory.
- The `ProjectCard` component is imported from `client/src/features/projects/components/ProjectCard.tsx`. Import path: `../../features/projects/components/ProjectCard` (relative from the home feature).
- The random index must be computed inside the component using `useMemo` to avoid recomputing on every render: `const showcaseProject = useMemo(() => projects && projects.length > 0 ? projects[Math.floor(Math.random() * projects.length)] : null, [projects]);`
- The "More" button must use an `<a>` tag (not `Link`) with `href={/projects/${project.slug}}`, `target="_blank"`, and `rel="noopener noreferrer"` to correctly open in a new tab.
- Style the "More" button consistently with `StyledButton` from `client/src/app/shared/components/StyledButton.tsx`, or apply equivalent Tailwind classes manually.

---

### Feature 4: Login 401 Fix — Session Expiry Handling

**Priority:** P0 — Critical

**Description:**
Fix the Axios response interceptor in `agent.ts` so that HTTP 401 responses are handled correctly based on context:
- If the user is currently authenticated (has an active session) and receives a 401, their session has expired. The app must clear their auth state and redirect them to `/login` automatically.
- If the user is not authenticated and receives a 401 (e.g., the app internally calls an auth-guarded endpoint that happens to return 401 for anonymous users), nothing should happen visually — no toast, no redirect.

**User Story:**
As a logged-in user whose session has expired, I want to be automatically redirected to the login page with my session cleanly cleared, so that I can re-authenticate without confusion.

As an anonymous visitor, I want to browse public pages without seeing any error messages related to authentication, so that my experience is clean and professional.

**Acceptance Criteria:**
- AC4.1: When a 401 response is received and the current TanStack Query cache contains user data (i.e., `queryClient.getQueryData(["user"])` is truthy), the interceptor clears the `["user"]` query cache (equivalent to `queryClient.removeQueries({ queryKey: ["user"] })`) and navigates to `/login`.
- AC4.2: When a 401 response is received and there is no user data in cache (anonymous visitor), the interceptor takes no visible action — no toast, no redirect, no console error shown to the user.
- AC4.3: The existing `toast.error("Unauthorised")` call on line 50 of `agent.ts` is removed entirely. It must not fire under any circumstances.
- AC4.4: After the session-expiry redirect (AC4.1), the user lands on `/login`. No stale user data remains in the query cache. A successful login after this redirects them to `/` (the existing behavior of `LoginForm.tsx` using `location.state?.from || "/"`).
- AC4.5: The fix does not affect the handling of any other HTTP status codes (400, 404, 500) — those remain unchanged.
- AC4.6: Anonymous visitors can load the homepage (which calls `GET /projects`) without any 401-related side effects. This is already the case at the API level (`[AllowAnonymous]`), but the fix must not introduce new issues for other anonymous API calls that legitimately return 401.

**Technical Notes:**
- The challenge: `agent.ts` is a plain module (not a React component), so it cannot call React hooks or use `useQueryClient()`. Access to the TanStack Query client must come from the module-level `queryClient` instance.
- The `queryClient` is created at the React app's root (typically in `main.tsx`). To make it accessible in `agent.ts`, it must be exported from the module where it is instantiated (e.g., `export const queryClient = new QueryClient(...)` in `main.tsx` or a dedicated `queryClient.ts` file) so that `agent.ts` can import it directly.
- The `router` is already imported in `agent.ts` from `../../app/router/Routes` and used for `router.navigate("/not-found")` and `router.navigate("/server-error", ...)`. The same pattern (`router.navigate("/login")`) is used for the 401 redirect.
- The revised 401 handler in the interceptor:
  ```typescript
  case 401:
    if (queryClient.getQueryData(["user"])) {
      queryClient.removeQueries({ queryKey: ["user"] });
      router.navigate("/login");
    }
    // else: anonymous user on a public page — do nothing
    break;
  ```
- If `queryClient` is not yet exported from a shared location, a new file `client/src/lib/queryClient.ts` should be created to export the singleton instance, and `main.tsx` should import from it rather than instantiating inline.
- Files that change for this feature: `client/src/lib/api/agent.ts`, and potentially `client/src/main.tsx` + a new `client/src/lib/queryClient.ts`.

---

## 8. Non-Functional Requirements

### Performance
- NFR-P1: The homepage must not introduce any additional network requests beyond what `useProjectList()` already makes. The single `GET /projects` call serves both the stat card and the showcase — TanStack Query's request deduplication ensures it is fetched once.
- NFR-P2: Homepage initial render (excluding data fetch) must not introduce perceptible jank. No heavy computations outside of `useMemo`.
- NFR-P3: The `ProjectCard` component already uses lazy image loading via native `<img>` — no changes needed.

### Security
- NFR-S1: The "More" button must include `rel="noopener noreferrer"` on any `target="_blank"` anchor to prevent reverse tabnapping.
- NFR-S2: Clearing the user's session on 401 (Feature 4) must remove all query cache entries that could expose user identity — at minimum the `["user"]` query key. Any other user-specific query keys should also be considered (e.g., profile data under `["profile", ...]`).
- NFR-S3: No user credentials, tokens, or PII are logged to the browser console.

### Accessibility
- NFR-A1: The stat card must be keyboard-navigable and have a descriptive `aria-label` (e.g., `aria-label="View all projects"`).
- NFR-A2: The "More" button must have an accessible label. Since the visible text is "More", add `aria-label="View {project.title} in new tab"` to provide full context to screen reader users.
- NFR-A3: Loading states (spinners) must include `role="status"` and `aria-label="Loading"` for screen reader compatibility.
- NFR-A4: Color contrast between white text and the hero gradient must meet WCAG 2.1 AA (minimum 4.5:1 ratio for normal text). The existing NavBar uses this gradient with white text and is already used in production — treat as passing.

### Maintainability
- NFR-M1: New components introduced for the homepage (`ProjectShowcase.tsx`, optionally `HomeStat.tsx`) must live inside `client/src/features/home/` — not in shared components — as they are page-specific.
- NFR-M2: No inline styles. All styling must use Tailwind CSS utility classes.
- NFR-M3: All new TypeScript code must be strictly typed — no `any` types introduced.

---

## 9. User Flows and Journeys

### Flow 1: Anonymous Visitor — Homepage Browse
1. Visitor navigates to `/` (root).
2. `HomePage.tsx` renders immediately with the hero section visible (no data needed).
3. While `useProjectList()` is loading, the stat card shows a spinner and the showcase area shows a spinner.
4. Data resolves. Stat card updates to show `N Projects` with icon. Showcase renders a random `ProjectCard`.
5. Visitor reads the stat card, clicks it — navigates to `/projects` (same tab).
6. Visitor returns to homepage, clicks "More" on the showcase card — `/projects/{slug}` opens in a new tab.
7. At no point does the visitor see an "Unauthorised" toast.

### Flow 2: Anonymous Visitor — Session Never Established
1. Visitor loads the app. `GET /account/user-info` returns 401 (no cookie).
2. The 401 interceptor checks `queryClient.getQueryData(["user"])` — returns `undefined` (no cached user).
3. Interceptor does nothing. No toast. No redirect.
4. `useAccount`'s `currentUser` remains `undefined`. NavBar shows Login/Register links.
5. Visitor browses normally.

### Flow 3: Authenticated User — Session Expires Mid-Session
1. User is logged in. `["user"]` cache contains their `User` object.
2. User performs an action that triggers an auth-guarded API call. Cookie has expired on the server.
3. Server returns 401.
4. Interceptor fires. `queryClient.getQueryData(["user"])` returns the stale `User` object (truthy).
5. Interceptor calls `queryClient.removeQueries({ queryKey: ["user"] })`.
6. Interceptor calls `router.navigate("/login")`.
7. User is on the login page. Their session is cleared. NavBar now shows Login/Register.
8. User logs in successfully. Redirected to `/` (or the page they were on, via `location.state?.from`).

### Flow 4: Authenticated User — Normal Homepage Visit
1. User is logged in. Visits `/`.
2. Same as Flow 1 for homepage rendering.
3. `ProjectCard` renders with the card's own click handler navigating to project detail in same tab.
4. "More" button opens detail in new tab.

---

## 10. Timeline and Milestones

This is a single-developer project with four tightly scoped features. No backend work is required.

| Milestone | Scope | Estimated Effort |
|---|---|---|
| M1: 401 Fix (Feature 4) | Modify `agent.ts`, extract `queryClient.ts` if needed, update `main.tsx` | 1–2 hours |
| M2: Homepage Scaffold (Feature 1) | Replace `HomePage.tsx` content with hero + layout structure | 1–2 hours |
| M3: Stat Card (Feature 2) | Add stat card component/section to `HomePage.tsx` | 1 hour |
| M4: Project Showcase (Feature 3) | Create `ProjectShowcase.tsx`, wire into `HomePage.tsx` | 1–2 hours |
| M5: QA and Polish | Manual testing of all acceptance criteria, cross-browser spot check | 1 hour |

**Suggested implementation order:** M1 first (lowest risk, isolated change, unblocks cleaner testing of the rest), then M2 → M3 → M4 → M5.

**Total estimated effort:** 5–8 hours of focused development.

---

## 11. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `queryClient` singleton pattern causes circular imports between `agent.ts`, `queryClient.ts`, and `main.tsx` | Medium | Medium | Create `client/src/lib/queryClient.ts` as a dedicated export file with no imports from the app layer. Both `main.tsx` and `agent.ts` import from it. |
| `useProjectList()` called from `HomePage` while user is anonymous returns 401 (if endpoint auth is misconfigured) | Low | High | Confirmed: `GET /projects` is decorated `[AllowAnonymous]` in `ProjectsController.cs`. No risk. Verify in QA. |
| Random showcase always shows the same project (TanStack Query cache hit) | Low | Low | Acceptable per assumptions. `Math.random()` runs once per cache resolution, not per render. Behavior is documented in Section 6. |
| `ProjectCard`'s own click handler and the "More" button conflict (double navigation) | Low | Low | They are independent. The card navigates same-tab; the "More" button opens a new tab. No conflict. Verified against `ProjectCard.tsx` implementation. |
| `queryClient.removeQueries` in the 401 interceptor fires during a non-expired 401 (e.g., a permission error for an admin-only route) | Low | Medium | The app currently has no admin-only routes — all auth-guarded routes use `[Authorize]` without role restrictions. Risk is theoretical for the current scope. |
| CSS layout regression: hero gradient overflows or conflicts with `App.tsx` content wrapper | Low | Low | Hero is a contained section within the existing `max-w-screen-xl` wrapper. No negative margins or breakout layout needed. |

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| OQ1 | Should the homepage hero section include a CTA button (e.g., "Browse Projects") linking to `/projects`? This was not explicitly specified. | Developer | Open — implement if it feels natural during M2; the stat card already provides this link. |
| OQ2 | Should the `logoutUser` mutation in `useAccount.ts` also be updated to clear additional query keys (e.g., profile data) for consistency with the 401 fix behavior? | Developer | Open — out of scope for this PRD but recommended as a follow-up. |
| OQ3 | The `logoutUser.onSuccess` in `useAccount.ts` calls `queryClient.removeQueries({})` with an empty predicate (line 41-43 appears to be a bug — empty object). Should this be fixed as part of M1? | Developer | Open — review during M1 implementation. If it is a bug, fix it as part of the same commit for hygiene. |
| OQ4 | Should the showcase section refresh its random pick on a timer (e.g., every 60 seconds) or only on page load? | Developer | Closed — page load only, per confirmed requirements. |
| OQ5 | If there is exactly one project, should the "Featured Project" heading still appear? | Developer | Open — yes, per AC3.7. But confirm the heading copy ("Featured Project") or whether it should say something else when there is only one. |

---

## 13. Appendix

### A. File Map — Files Expected to Change

| File | Change Type | Feature |
|---|---|---|
| `client/src/features/home/HomePage.tsx` | Rewrite | F1, F2, F3 |
| `client/src/features/home/ProjectShowcase.tsx` | New file | F3 |
| `client/src/features/home/HomeStat.tsx` | New file (optional, if extracted) | F2 |
| `client/src/lib/api/agent.ts` | Modify (401 handler) | F4 |
| `client/src/lib/queryClient.ts` | New file (if queryClient extracted) | F4 |
| `client/src/main.tsx` | Modify (import queryClient from shared file) | F4 |

### B. Files Confirmed Read-Only (No Changes)

| File | Reason |
|---|---|
| `client/src/features/projects/components/ProjectCard.tsx` | Reused as-is |
| `client/src/lib/hooks/useProjects.ts` | Reused as-is |
| `client/src/app/router/Routes.tsx` | No routing changes needed |
| `client/src/app/layout/NavBar.tsx` | No nav changes needed |
| `client/src/app/layout/App.tsx` | Hero contained within existing wrapper |
| `API/Controllers/ProjectsController.cs` | No backend changes needed |
| `Application/Projects/**` | No backend changes needed |

### C. Key Existing Components Referenced

| Component | Path | Used By |
|---|---|---|
| `ProjectCard` | `client/src/features/projects/components/ProjectCard.tsx` | Feature 3 (showcase card) |
| `TechStackList` | `client/src/features/projects/components/TechStackList.tsx` | Rendered inside ProjectCard |
| `StyledButton` | `client/src/app/shared/components/StyledButton.tsx` | Feature 3 ("More" button) |
| `useProjectList` | `client/src/lib/hooks/useProjects.ts` | Features 2 and 3 |
| `useAccount` | `client/src/lib/hooks/useAccount.ts` | Referenced for auth state context |

### D. Color Palette Reference

| Token | Value | Used In |
|---|---|---|
| Gradient start | `#182a73` | NavBar, Hero section |
| Gradient mid | `#218aac` | NavBar, Hero section |
| Gradient end | `#20a7ac` | NavBar, Hero section, spinner accent |
| Card border hover | `#218aac` | ProjectCard, stat card |
| Text primary | `text-gray-900` | Section headings |
| Text secondary | `text-gray-600` | Descriptions |
| Text muted | `text-gray-500` | Labels, captions |

### E. TanStack Query Key Reference

| Key | Data | Managed By |
|---|---|---|
| `["user"]` | Authenticated `User` object | `useAccount` |
| `["projects"]` | `ProjectSummary[]` list | `useProjectList` |
| `["project", slug]` | `ProjectDetail` for one project | `useProject` |
