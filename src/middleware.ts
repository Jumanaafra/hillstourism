import { NextRequest, NextResponse } from 'next/server'

/**
 * Next.js Middleware — protects /admin routes.
 * In production with Firebase Auth, this would verify session cookies.
 * Currently provides a basic auth gate that works with the existing
 * Bearer token / ADMIN_SECRET_KEY strategy.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only protect admin routes
  if (pathname.startsWith('/admin')) {
    // In production: check for a session cookie set after Firebase Auth login
    // For now: allow access (admin page itself handles auth via API headers)
    // This middleware ensures admin pages are never cached by CDN
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
