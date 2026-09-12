import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('server-only', () => ({}))

import {
  validateAdminToken,
  verifyAdminAuth,
  NO_CACHE_HEADERS,
  adminJsonResponse,
} from '@/lib/auth/adminAuth'

describe('Admin Auth & Cookie Hardening', () => {
  it('rejects invalid or empty tokens', async () => {
    const emptyResult = await validateAdminToken('')
    expect(emptyResult.authenticated).toBe(false)

    const invalidResult = await validateAdminToken('fake-invalid-token')
    expect(invalidResult.authenticated).toBe(false)
  })

  it('accepts dev secret in non-production environments', async () => {
    const result = await validateAdminToken('hillstourism-admin-secret')
    expect(result.authenticated).toBe(true)
    expect(result.role).toBe('admin')
    expect(result.email).toBe('admin@hillstourism.com')
  })

  it('authenticates via Bearer Authorization header', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/packages', {
      headers: {
        authorization: 'Bearer hillstourism-admin-secret',
      },
    })
    const auth = await verifyAdminAuth(req)
    expect(auth.authenticated).toBe(true)
  })

  it('authenticates via secure HttpOnly admin_token cookie', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/packages', {
      headers: {
        cookie: 'admin_token=hillstourism-admin-secret',
      },
    })
    const auth = await verifyAdminAuth(req)
    expect(auth.authenticated).toBe(true)
  })

  it('fails when neither Bearer header nor cookie is present', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/packages')
    const auth = await verifyAdminAuth(req)
    expect(auth.authenticated).toBe(false)
  })

  it('adminJsonResponse applies strict private no-store headers', () => {
    const response = adminJsonResponse({ success: true, data: [1, 2, 3] })
    expect(response.headers.get('cache-control')).toBe('private, no-store, no-cache, must-revalidate')
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow')
  })

  it('NO_CACHE_HEADERS constants are correctly defined', () => {
    expect(NO_CACHE_HEADERS['Cache-Control']).toBe('private, no-store, no-cache, must-revalidate')
    expect(NO_CACHE_HEADERS['X-Robots-Tag']).toBe('noindex, nofollow')
  })
})

describe('Revalidation Path Sanitization & Defense', () => {
  const ALLOWED_ROOT_ROUTES = new Set([
    '',
    'packages',
    'stays',
    'hotels',
    'vehicles',
    'gallery',
    'experiences',
    'about',
    'privacy-policy',
    'terms-and-conditions',
  ])

  function isValidRevalidatePath(path: string): boolean {
    if (!path || !path.startsWith('/') || path.length > 256) return false
    if (path.includes('..') || path.includes('//') || !/^\/[a-zA-Z0-9_\-\/]*$/.test(path)) return false
    const clean = path.replace(/\/+$/, '') || '/'
    const rootSegment = clean === '/' ? '' : clean.split('/')[1]
    return ALLOWED_ROOT_ROUTES.has(rootSegment)
  }

  it('accepts valid site paths', () => {
    expect(isValidRevalidatePath('/')).toBe(true)
    expect(isValidRevalidatePath('/packages')).toBe(true)
    expect(isValidRevalidatePath('/packages/kashmir-paradise-tour')).toBe(true)
    expect(isValidRevalidatePath('/hotels/the-grand-munnar')).toBe(true)
    expect(isValidRevalidatePath('/experiences')).toBe(true)
    expect(isValidRevalidatePath('/stays')).toBe(true)
  })

  it('rejects path traversal attacks', () => {
    expect(isValidRevalidatePath('/../etc/passwd')).toBe(false)
    expect(isValidRevalidatePath('/packages/../../secret')).toBe(false)
  })

  it('rejects double slashes or protocol injections', () => {
    expect(isValidRevalidatePath('//malicious.com')).toBe(false)
    expect(isValidRevalidatePath('/packages//extra')).toBe(false)
  })

  it('rejects non-allowlisted routes', () => {
    expect(isValidRevalidatePath('/unknown-route')).toBe(false)
    expect(isValidRevalidatePath('/admin')).toBe(false)
    expect(isValidRevalidatePath('/api/packages')).toBe(false)
  })
})
