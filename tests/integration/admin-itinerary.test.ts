import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST, PATCH, DELETE, GET } from '../../src/app/api/admin/packages/route'
import { _resetMemoryPackages, getPackageById } from '../../src/lib/repositories/packages.repo'

// Mock next/cache revalidatePath so it doesn't fail in node environment
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Admin Packages & Itinerary API Integration Tests', () => {
  const adminSecret = 'hillstourism-admin-secret'
  const validAuthHeader = `Bearer ${adminSecret}`

  beforeEach(() => {
    _resetMemoryPackages()
    vi.clearAllMocks()
  })

  function createRequest(url: string, method: string, body?: any, authHeader?: string): NextRequest {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (authHeader) {
      headers['authorization'] = authHeader
    }

    const init: RequestInit = {
      method,
      headers,
    }
    if (body) {
      init.body = JSON.stringify(body)
    }

    return new NextRequest(new URL(url, 'http://localhost:3000'), init as any)
  }

  it('rejects unauthenticated requests with 401', async () => {
    const req = createRequest('/api/admin/packages', 'POST', { name: 'Test', destination: 'Munnar' })
    const res = await POST(req)
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('UNAUTHORIZED')
  })

  it('creates package with valid day-wise itinerary and sorts days ascending', async () => {
    const payload = {
      name: 'Wayanad Wilderness Trail',
      destination: 'Wayanad, Kerala',
      category: 'Adventure',
      duration: '3 Days / 2 Nights',
      nights: 2,
      price: '₹14,999',
      itinerary: [
        {
          day: 2,
          title: 'Chembra Peak Trek & Heart Lake',
          description: 'High altitude trek through dense shola forests to the mist-covered heart lake.',
          locations: ['Chembra Peak', 'Meppadi'],
          activities: ['Guided trek', 'Forest permits', 'Packed trail lunch'],
          meals: ['Breakfast', 'Trail Lunch'],
        },
        {
          day: 1,
          title: 'Arrival & Bamboo Rafting',
          description: 'Arrive at Kalpetta base resort followed by calm river bamboo rafting.',
          locations: ['Calicut', 'Kalpetta'],
          activities: ['Kuruva Island bamboo raft', 'Spice walk'],
          meals: ['Dinner'],
          accommodation: 'Rainforest Treehouse Resort',
        },
      ],
      inclusions: ['All forest permits', 'Expert naturalist guide'],
      exclusions: ['Personal camera fees'],
    }

    const req = createRequest('/api/admin/packages', 'POST', payload, validAuthHeader)
    const res = await POST(req)

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.id).toBeDefined()
    expect(json.data.slug).toBe('wayanad-wilderness-trail')

    // Itinerary days must be sorted in ascending order (Day 1 before Day 2)
    expect(json.data.itinerary).toHaveLength(2)
    expect(json.data.itinerary[0].day).toBe(1)
    expect(json.data.itinerary[0].title).toBe('Arrival & Bamboo Rafting')
    expect(json.data.itinerary[1].day).toBe(2)
    expect(json.data.itinerary[1].title).toBe('Chembra Peak Trek & Heart Lake')
  })

  it('rejects package creation with duplicate day numbers (HTTP 400)', async () => {
    const invalidPayload = {
      name: 'Duplicate Day Tour',
      destination: 'Ooty',
      itinerary: [
        { day: 1, title: 'Day 1 Arrival', description: 'Arrive at Ooty' },
        { day: 1, title: 'Day 1 Duplicate', description: 'Another Day 1' },
      ],
    }

    const req = createRequest('/api/admin/packages', 'POST', invalidPayload, validAuthHeader)
    const res = await POST(req)

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('VALIDATION_ERROR')
    expect(json.error.message).toContain('Duplicate day number detected')
  })

  it('rejects package creation with invalid day numbers (< 1) (HTTP 400)', async () => {
    const invalidPayload = {
      name: 'Invalid Day Zero Tour',
      destination: 'Kodaikanal',
      itinerary: [
        { day: 0, title: 'Day Zero', description: 'Invalid day number' },
      ],
    }

    const req = createRequest('/api/admin/packages', 'POST', invalidPayload, validAuthHeader)
    const res = await POST(req)

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.error.message).toContain('Day must be an integer >= 1')
  })

  it('rejects package creation when day title or description is missing (HTTP 400)', async () => {
    const missingTitlePayload = {
      name: 'Missing Title Tour',
      destination: 'Coorg',
      itinerary: [
        { day: 1, title: '   ', description: 'Valid description' },
      ],
    }

    const req = createRequest('/api/admin/packages', 'POST', missingTitlePayload, validAuthHeader)
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error.message).toContain('Day 1 must have a title')
  })

  it('updates package itinerary via PATCH and ensures day ordering', async () => {
    // 1. Create initial package
    const initial = {
      name: 'Chikmagalur Coffee Trail',
      destination: 'Chikmagalur, Karnataka',
      itinerary: [
        { day: 1, title: 'Estate Check-in', description: 'Arrive in coffee estate' },
      ],
    }
    const createReq = createRequest('/api/admin/packages', 'POST', initial, validAuthHeader)
    const createRes = await POST(createReq)
    const created = await createRes.json()
    const pkgId = created.data.id

    // 2. Patch with updated days in reverse order
    const patchPayload = {
      id: pkgId,
      itinerary: [
        { day: 2, title: 'Mullayanagiri Peak', description: 'Highest peak in Karnataka' },
        { day: 1, title: 'Estate Check-in & Roasting', description: 'Updated Day 1 with coffee tasting' },
      ],
    }
    const patchReq = createRequest('/api/admin/packages', 'PATCH', patchPayload, validAuthHeader)
    const patchRes = await PATCH(patchReq)

    expect(patchRes.status).toBe(200)
    const patchJson = await patchRes.json()
    expect(patchJson.success).toBe(true)
    expect(patchJson.data.itinerary[0].day).toBe(1)
    expect(patchJson.data.itinerary[0].title).toBe('Estate Check-in & Roasting')
    expect(patchJson.data.itinerary[1].day).toBe(2)
    expect(patchJson.data.itinerary[1].title).toBe('Mullayanagiri Peak')
  })

  it('deletes package successfully via DELETE', async () => {
    // 1. Create a package to delete
    const payload = {
      name: 'Temporary Package',
      destination: 'Valparai',
    }
    const createReq = createRequest('/api/admin/packages', 'POST', payload, validAuthHeader)
    const createRes = await POST(createReq)
    const created = await createRes.json()
    const pkgId = created.data.id

    // 2. Delete it
    const deleteReq = createRequest(`/api/admin/packages?id=${pkgId}`, 'DELETE', undefined, validAuthHeader)
    const deleteRes = await DELETE(deleteReq)

    expect(deleteRes.status).toBe(200)
    const deleteJson = await deleteRes.json()
    expect(deleteJson.success).toBe(true)
    expect(deleteJson.data.deleted).toBe(true)

    // Verify it no longer exists
    const fetched = await getPackageById(pkgId)
    expect(fetched).toBeNull()
  })
})
