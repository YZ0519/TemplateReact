# tester-expert Memory

## Project Startup
- API: `cd API && dotnet run` → http://localhost:5000 (or 5001 for HTTPS)
- Client: `cd client && npm run dev` → http://localhost:3000
- Launch config reference: `.vscode/launch.json`

## Bug Escalation Flow
tester-expert → project-manager → (dotnet-expert | react-expert) → tester-expert (re-verify)

## Test Stack
- Framework: **Vitest + React Testing Library + MSW** (NOT Playwright — no Playwright installed)
- Test runner command: `cd /d/GitHub/DemoClaude/client && npx vitest run --reporter=verbose`
- Setup file: `client/src/test/setup.ts`
- Render helper: `client/src/test/utils/renderWithProviders.tsx`
- MSW server: `client/src/test/mocks/server.ts`
- MSW handlers: `client/src/test/mocks/handlers/{projectHandlers,accountHandlers}.ts`
- Test environment: `jsdom` (configured in `vite.config.ts` under `test:`)
- MSW base URL: `http://localhost:5001/api` (from `.env.test`)
- Vitest globals enabled (`vitest/globals` in tsconfig.app.json types)

## Key Setup Mocks (setup.ts)
- `../lib/stores/store` → `{ store: { uiStore: { isBusy: vi.fn(), isIdle: vi.fn() } } }`
- `../app/router/Routes` → `{ router: { navigate: vi.fn() } }`
- MSW server runs `beforeAll` / `afterAll`, resets `afterEach`

## Critical: Agent Timing
- `agent.ts` has `await sleep(1000)` in BOTH success and error response interceptors
- All API responses take at least 1000ms in tests
- Always use `waitFor(..., { timeout: 3000 })` for tests waiting for MSW data via agent.ts
- See `client/src/features/home/__tests__/HomePage.test.tsx` for the working pattern

## QueryClient Singleton Pattern
- `client/src/lib/queryClient.ts` exports the app-wide singleton `queryClient`
- `agent.ts` imports this singleton for the 401 interceptor logic
- `renderWithProviders.tsx` creates its OWN QueryClient per test (isolated from singleton)
- For agent.ts interceptor tests: import `queryClient` from `../../queryClient`, seed with
  `queryClient.setQueryData(...)`, and clear with `queryClient.clear()` in `beforeEach`

## Test File Locations
- Feature component tests: `client/src/features/{feature}/__tests__/{Component}.test.tsx`
- API/interceptor tests: `client/src/lib/api/__tests__/{file}.test.ts`
- Schema tests: `client/src/lib/schemas/__tests__/{schema}.test.ts`

## MSW Handler Defaults (test data reference)
- `GET /projects` → 1 project: title "Test Project", slug "test-project",
  id "proj-1", techStacks: [{ name: "React", category: "Frontend" }]
- `GET /account/user-info` → always 401 (anonymous baseline)

## Known Pre-existing Failures
- `ProjectDeleteButton.test.tsx` > "shows confirmation UI after clicking Delete Project"
  - Component renders `"Are you sure?"` but test expects `"Are you sure? This cannot be undone."`
  - File: `client/src/features/projects/components/ProjectDeleteButton.tsx` line 32
  - Classification: **Frontend bug** — route to react-expert

## Tests Written for Homepage Enhancements (PRD v1.0)
- `client/src/features/home/__tests__/HomeStat.test.tsx` — 11 tests (AC2.1–2.7, NFR-A1, NFR-A3)
- `client/src/features/home/__tests__/ProjectShowcase.test.tsx` — 17 tests (AC3.1–3.9, NFR-A2, NFR-S1)
- `client/src/features/home/__tests__/HomePage.test.tsx` — 13 tests (AC1.1–1.6, AC2.x, AC3.x integration)
- `client/src/lib/api/__tests__/agent401.test.ts` — 10 tests (AC4.1–4.3, AC4.5)
