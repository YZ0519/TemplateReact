import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './mocks/server'

// Mock the MobX store so that agent.ts interceptors don't crash in jsdom
vi.mock('../lib/stores/store', () => ({
  store: { uiStore: { isBusy: vi.fn(), isIdle: vi.fn() } },
}))

// Mock the router so that agent.ts error handlers don't crash in jsdom
vi.mock('../app/router/Routes', () => ({
  router: { navigate: vi.fn() },
}))

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => { server.resetHandlers(); cleanup() })
afterAll(() => server.close())
