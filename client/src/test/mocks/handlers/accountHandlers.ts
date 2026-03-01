import { http, HttpResponse } from 'msw'

const BASE = 'http://localhost:5001/api'

// Return 401 for user-info so useAccount does not blow up in tests that
// don't care about authentication state.
export const accountHandlers = [
  http.get(`${BASE}/account/user-info`, () =>
    new HttpResponse(null, { status: 401 })
  ),
]
