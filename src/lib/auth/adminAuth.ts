import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseAdmin } from '../firebase/admin'

export interface AdminAuthResult {
  authenticated: boolean
  uid?: string
  email?: string
  role?: string
  error?: string
}

/**
 * Standard HTTP headers to prevent CDN, proxy, and browser caching
 * for private, administrative, and sensitive mutation endpoints.
 */
export const NO_CACHE_HEADERS: Record<string, string> = {
  'Cache-Control': 'private, no-store, no-cache, must-revalidate',
  'X-Robots-Tag': 'noindex, nofollow',
}

/**
 * Helper to generate a standardized JSON response with hardened no-cache headers.
 */
export function adminJsonResponse(data: any, init?: ResponseInit) {
  const headers = new Headers(init?.headers)
  for (const [key, value] of Object.entries(NO_CACHE_HEADERS)) {
    headers.set(key, value)
  }
  return NextResponse.json(data, { ...init, headers })
}

/**
 * Validates an admin credential token string against configured environment tokens or Firebase Admin.
 */
export async function validateAdminToken(token: string): Promise<AdminAuthResult> {
  if (!token || typeof token !== 'string') {
    return {
      authenticated: false,
      error: 'Missing or empty authorization token.',
    }
  }

  const cleanToken = token.trim()

  // 1. Check for configured server-side admin access token or secret key
  const serverAdminToken = process.env.ADMIN_ACCESS_TOKEN || process.env.ADMIN_SECRET_KEY
  if (serverAdminToken && cleanToken === serverAdminToken) {
    return {
      authenticated: true,
      uid: 'admin-token-user',
      email: 'admin@hillstourism.com',
      role: 'admin',
    }
  }

  // Accept test/dev secret when running in non-production environments (e.g. vitest or local dev)
  if (process.env.NODE_ENV !== 'production' && cleanToken === 'hillstourism-admin-secret') {
    return {
      authenticated: true,
      uid: 'dev-admin-uid',
      email: 'admin@hillstourism.com',
      role: 'admin',
    }
  }

  // 2. Verify with Firebase Admin Auth if live credentials exist
  const adminApp = getFirebaseAdmin()
  if (adminApp) {
    try {
      const decoded = await adminApp.auth().verifyIdToken(cleanToken)
      // Verify admin role via custom claims or adminUsers collection
      const isAdmin = decoded.admin === true || decoded.role === 'admin' || decoded.email?.endsWith('@hillstourism.com')
      if (!isAdmin) {
        return {
          authenticated: false,
          error: 'Forbidden: User does not possess administrator privileges.',
        }
      }

      return {
        authenticated: true,
        uid: decoded.uid,
        email: decoded.email,
        role: (decoded.role as string) || 'admin',
      }
    } catch (err: any) {
      return {
        authenticated: false,
        error: `Invalid or expired authorization token: ${err.message}`,
      }
    }
  }

  return {
    authenticated: false,
    error: 'Authentication service unavailable and invalid secret token.',
  }
}

/**
 * Server-side authorization verifier for protected admin API endpoints.
 * Inspects 'Authorization: Bearer <token>' header first, then falls back to HttpOnly 'admin_token' cookie.
 */
export async function verifyAdminAuth(req: NextRequest): Promise<AdminAuthResult> {
  let token: string | undefined

  // 1. Prioritize Authorization header (Bearer token)
  const authHeader = req.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split('Bearer ')[1].trim()
  }

  // 2. Fall back to secure HttpOnly admin_token cookie
  if (!token) {
    token = req.cookies?.get?.('admin_token')?.value
  }

  if (!token) {
    return {
      authenticated: false,
      error: 'Missing or malformed Authorization credentials.',
    }
  }

  return validateAdminToken(token)
}

