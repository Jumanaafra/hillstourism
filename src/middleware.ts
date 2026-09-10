import { NextRequest, NextResponse } from 'next/server'

/**
 * Next.js Middleware — protects /admin routes.
 * Checks for an admin_token cookie set during login.
 * The login page itself is excluded so users can authenticate.
 * Admin API routes are separately protected by verifyAdminAuth().
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only protect admin page routes (not API routes — those have their own auth)
  if (pathname.startsWith('/admin')) {
    // Always set no-cache and no-index headers for admin pages
    const headers = new Headers()
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    headers.set('X-Robots-Tag', 'noindex, nofollow')

    // Allow the login page without authentication
    if (pathname === '/admin/login') {
      const response = NextResponse.next()
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
      response.headers.set('X-Robots-Tag', 'noindex, nofollow')
      return response
    }

    // Check for admin_token cookie
    const adminToken = req.cookies.get('admin_token')?.value
    if (!adminToken) {
      // Redirect to login page
      const loginUrl = new URL('/admin/login', req.url)
      return NextResponse.redirect(loginUrl)
    }

    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
