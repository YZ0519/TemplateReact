import { setupServer } from 'msw/node'
import { projectHandlers } from './handlers/projectHandlers'
import { accountHandlers } from './handlers/accountHandlers'

export const server = setupServer(...projectHandlers, ...accountHandlers)
