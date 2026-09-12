import { describe, it, expect, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { POST as handleUpload } from '../../src/app/api/admin/upload/route'

describe('Admin Image Upload API Route', () => {
  it('returns 401 when authorization header is missing', async () => {
    const fakeRequest = new Request('http://localhost:3000/api/admin/upload', {
      method: 'POST',
    })

    const response = await handleUpload(fakeRequest as any)
    expect(response.status).toBe(401)
    const json = await response.json()
    expect(json.success).toBe(false)
    expect(json.error?.code).toBe('UNAUTHORIZED')
  })

  it('returns 401 when authorization token is invalid', async () => {
    const fakeRequest = new Request('http://localhost:3000/api/admin/upload', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer invalid-token-xyz',
      },
    })

    const response = await handleUpload(fakeRequest as any)
    expect(response.status).toBe(401)
  })

  it('returns 400 when no file is uploaded', async () => {
    const validToken = 'hillstourism-admin-secret'
    const formData = new FormData()
    formData.append('folder', 'hills-tourism/packages')

    const fakeRequest = new Request('http://localhost:3000/api/admin/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
      body: formData,
    })

    const response = await handleUpload(fakeRequest as any)
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.success).toBe(false)
    expect(json.error?.message).toContain('No image file was provided')
  })
})
