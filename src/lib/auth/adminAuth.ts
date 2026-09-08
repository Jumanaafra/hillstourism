import { NextRequest } from 'next/server'
import { getFirebaseAdmin } from '../firebase/admin'

export interface AdminAuthResult {
  authenticated: boolean
  uid?: string
  email?: string
  role?: string
  error?: string
}

/**
 * Server-side authorization verifier for protected admin API endpoints.
 * Never trusts client localStorage, client flags, or cookies alone.
 */
export async function verifyAdminAuth(req: NextRequest): Promise<AdminAuthResult> {
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      error: 'Missing or malformed Authorization header.',
    }
  }

  const token = authHeader.split('Bearer ')[1].trim()

  // 1. Check for configured development admin secret key
  const devSecret = process.env.ADMIN_SECRET_KEY || 'hillstourism-admin-secret'
  if (token === devSecret) {
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
      const decoded = await adminApp.auth().verifyIdToken(token)
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
