import { NextRequest, NextResponse } from 'next/server'
import {
  validateAdminToken,
  validateAdminCredentials,
  getAdminSessionToken,
  verifyAdminAuth,
  adminJsonResponse,
} from '@/lib/auth/adminAuth'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/auth — Admin Login
 * Validates admin credentials (email & password or access token)
 * and sets a hardened HttpOnly session cookie.
 */
export async function POST(req: NextRequest) {
  try {
    let body: any
    try {
      body = await req.json()
    } catch {
      return adminJsonResponse(
        { success: false, error: 'Malformed JSON payload.' },
        { status: 400 }
      )
    }

    const email = body?.email
    const password = body?.password
    const token = body?.token

    let authResult: any
    let sessionToken: string = ''

    // A. Authenticate with Email & Password
    if (email && password) {
      if (typeof email !== 'string' || typeof password !== 'string') {
        return adminJsonResponse(
          { success: false, error: 'Email and password must be valid strings.' },
          { status: 400 }
        )
      }
      authResult = await validateAdminCredentials(email, password)
      sessionToken = getAdminSessionToken()
    }
    // B. Authenticate with Direct Access Token (backward compatibility)
    else if (token) {
      if (typeof token !== 'string') {
        return adminJsonResponse(
          { success: false, error: 'Admin access token must be a string.' },
          { status: 400 }
        )
      }
      authResult = await validateAdminToken(token)
      sessionToken = token.trim()
    } else {
      return adminJsonResponse(
        { success: false, error: 'Please enter your admin email and password.' },
        { status: 400 }
      )
    }

    if (!authResult.authenticated) {
      return adminJsonResponse(
        { success: false, error: authResult.error || 'Invalid admin credentials.' },
        { status: 401 }
      )
    }

    // Prepare response with HttpOnly cookie
    const response = adminJsonResponse({
      success: true,
      message: 'Admin session authenticated successfully.',
      user: {
        email: authResult.email,
        role: authResult.role,
      },
    })

    // Set hardened HttpOnly cookie (inaccessible to JavaScript)
    response.cookies.set({
      name: 'admin_token',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (err: any) {
    console.error('[Admin Auth API] Login error:', err)
    return adminJsonResponse(
      { success: false, error: 'Authentication service internal error.' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/auth — Admin Logout
 * Clears the HttpOnly admin_token session cookie.
 */
export async function DELETE() {
  const response = adminJsonResponse({
    success: true,
    message: 'Admin session terminated.',
  })

  response.cookies.set({
    name: 'admin_token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })

  return response
}

/**
 * GET /api/admin/auth — Session Status Check
 * Checks if current request is authenticated via Bearer header or HttpOnly cookie.
 */
export async function GET(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return adminJsonResponse(
      { success: false, authenticated: false, error: auth.error },
      { status: 401 }
    )
  }

  return adminJsonResponse({
    success: true,
    authenticated: true,
    user: {
      email: auth.email,
      role: auth.role,
    },
  })
}
