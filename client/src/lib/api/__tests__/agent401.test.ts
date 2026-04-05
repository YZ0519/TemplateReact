/**
 * Tests for Feature 4 — 401 interceptor behavior in agent.ts
 *
 * AC4.1: Authenticated user (["user"] in cache) → cache cleared + navigate("/login")
 * AC4.2: Anonymous user (no ["user"] cache) → no action taken
 * AC4.3: toast.error("Unauthorised") never fires
 * AC4.5: Other status codes (400, 404, 500) not affected by the 401 fix
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../../test/mocks/server'
import { queryClient } from '../../queryClient'
import agent from '../agent'
import { router } from '../../../app/router/Routes'

// toast is used in agent.ts for 400 errors; we mock it so we can assert it is
// NOT called with "Unauthorised" on 401.
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
  ToastContainer: () => null,
}))

const BASE = 'http://localhost:5001/api'

describe('agent.ts — 401 interceptor (Feature 4)', () => {
  beforeEach(() => {
    // Clear query cache and all mocked function call history before each test
    queryClient.clear()
    vi.clearAllMocks()
  })

  // --- AC4.2: Anonymous visitor — no user in cache ---

  describe('AC4.2 — anonymous visitor receives 401', () => {
    it('does not navigate to /login when there is no user in cache', async () => {
      expect(queryClient.getQueryData(['user'])).toBeUndefined()

      server.use(
        http.get(`${BASE}/anon-protected`, () => new HttpResponse(null, { status: 401 }))
      )

      await agent.get('/anon-protected').catch(() => {})

      expect(router.navigate).not.toHaveBeenCalledWith('/login')
    })

    it('does not call removeQueries for ["user"] when no user is cached', async () => {
      const removeSpy = vi.spyOn(queryClient, 'removeQueries')
      expect(queryClient.getQueryData(['user'])).toBeUndefined()

      server.use(
        http.get(`${BASE}/anon-protected-2`, () => new HttpResponse(null, { status: 401 }))
      )

      await agent.get('/anon-protected-2').catch(() => {})

      const userKeyRemoved = removeSpy.mock.calls.some((args) => {
        const opts = args[0] as { queryKey?: unknown[] } | undefined
        return opts?.queryKey?.[0] === 'user'
      })
      expect(userKeyRemoved).toBe(false)
    })
  })

  // --- AC4.3: toast.error("Unauthorised") never fires ---

  describe('AC4.3 — toast.error("Unauthorised") is never called', () => {
    it('does not call toast.error with "Unauthorised" for anonymous 401', async () => {
      const { toast } = await import('react-toastify')

      server.use(
        http.get(`${BASE}/anon-401-toast`, () => new HttpResponse(null, { status: 401 }))
      )

      await agent.get('/anon-401-toast').catch(() => {})

      expect(toast.error).not.toHaveBeenCalledWith('Unauthorised')
    })

    it('does not call toast.error with "Unauthorised" for authenticated 401', async () => {
      const { toast } = await import('react-toastify')

      queryClient.setQueryData(['user'], {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
      })

      server.use(
        http.get(`${BASE}/auth-401-toast`, () => new HttpResponse(null, { status: 401 }))
      )

      await agent.get('/auth-401-toast').catch(() => {})

      expect(toast.error).not.toHaveBeenCalledWith('Unauthorised')
    })
  })

  // --- AC4.1: Authenticated user — session expired ---

  describe('AC4.1 — authenticated user receives 401 (session expired)', () => {
    it('clears the ["user"] query cache', async () => {
      queryClient.setQueryData(['user'], {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
      })
      expect(queryClient.getQueryData(['user'])).toBeTruthy()

      server.use(
        http.get(`${BASE}/auth-expired-1`, () => new HttpResponse(null, { status: 401 }))
      )

      await agent.get('/auth-expired-1').catch(() => {})

      expect(queryClient.getQueryData(['user'])).toBeUndefined()
    })

    it('navigates to /login', async () => {
      queryClient.setQueryData(['user'], {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
      })

      server.use(
        http.get(`${BASE}/auth-expired-2`, () => new HttpResponse(null, { status: 401 }))
      )

      await agent.get('/auth-expired-2').catch(() => {})

      expect(router.navigate).toHaveBeenCalledWith('/login')
    })

    it('calls removeQueries with queryKey: ["user"]', async () => {
      const removeSpy = vi.spyOn(queryClient, 'removeQueries')

      queryClient.setQueryData(['user'], {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
      })

      server.use(
        http.get(`${BASE}/auth-expired-3`, () => new HttpResponse(null, { status: 401 }))
      )

      await agent.get('/auth-expired-3').catch(() => {})

      const userKeyRemoved = removeSpy.mock.calls.some((args) => {
        const opts = args[0] as { queryKey?: unknown[] } | undefined
        return opts?.queryKey?.[0] === 'user'
      })
      expect(userKeyRemoved).toBe(true)
    })
  })

  // --- AC4.5: Other status codes not affected ---

  describe('AC4.5 — other status codes behave normally', () => {
    it('404 still navigates to /not-found', async () => {
      server.use(
        http.get(`${BASE}/test-not-found`, () => new HttpResponse(null, { status: 404 }))
      )

      await agent.get('/test-not-found').catch(() => {})

      expect(router.navigate).toHaveBeenCalledWith('/not-found')
    })

    it('401 fix does not interfere with 400 (bad request) handling', async () => {
      server.use(
        http.get(`${BASE}/test-bad-request`, () =>
          HttpResponse.json({ message: 'Bad Request' }, { status: 400 })
        )
      )

      await agent.get('/test-bad-request').catch(() => {})

      // Should not navigate to /login on a 400
      expect(router.navigate).not.toHaveBeenCalledWith('/login')
    })
  })
})
