import { http, HttpResponse } from 'msw'

const BASE = 'http://localhost:5001/api'

export const projectHandlers = [
  http.get(`${BASE}/projects`, () =>
    HttpResponse.json([
      {
        id: 'proj-1',
        title: 'Test Project',
        slug: 'test-project',
        description: 'A test project description that is long enough',
        displayOrder: 0,
        techStacks: [
          { id: 'ts-1', name: 'React', category: 'Frontend', displayOrder: 0 },
        ],
        heroScreenshotUrl: null,
      },
    ])
  ),

  http.get(`${BASE}/projects/:slug`, ({ params }) => {
    if (params.slug === 'not-found-slug')
      return new HttpResponse(null, { status: 404 })

    return HttpResponse.json({
      id: 'proj-1',
      title: 'Test Project',
      slug: params.slug,
      description: 'A test project description that is long enough',
      displayOrder: 0,
      techStacks: [
        { id: 'ts-1', name: 'React', category: 'Frontend', displayOrder: 0 },
      ],
      features: [
        { id: 'f-1', description: 'Feature one', displayOrder: 0 },
      ],
      screenshots: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    })
  }),

  http.post(`${BASE}/projects`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      id: 'new-proj-id',
      title: body['title'],
      slug: String(body['title']).toLowerCase().replace(/\s+/g, '-'),
      description: body['description'],
      displayOrder: body['displayOrder'] ?? 0,
      techStacks: [],
      features: [],
      screenshots: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }),

  http.put(`${BASE}/projects/:id`, () => new HttpResponse(null, { status: 200 })),

  http.delete(`${BASE}/projects/:id`, () => new HttpResponse(null, { status: 200 })),

  http.post(`${BASE}/projects/:id/tech-stack`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      id: 'ts-new',
      name: body['name'],
      category: body['category'],
      displayOrder: 0,
    })
  }),

  http.delete(
    `${BASE}/projects/:id/tech-stack/:itemId`,
    () => new HttpResponse(null, { status: 200 })
  ),

  http.post(`${BASE}/projects/:id/features`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      id: 'feat-new',
      description: body['description'],
      displayOrder: body['displayOrder'] ?? 0,
    })
  }),

  http.delete(
    `${BASE}/projects/:id/features/:featureId`,
    () => new HttpResponse(null, { status: 200 })
  ),
]
