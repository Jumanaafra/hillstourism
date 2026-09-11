import { NextRequest, NextResponse } from 'next/server'

/**
 * Next.js Middleware — protects /admin routes and enforces strict no-cache/no-index
 * headers across administrative pages, sensitive APIs, chat, and enquiries.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1. Admin Page Routes (/admin/*)
  if (pathname.startsWith('/admin')) {
    const adminToken = req.cookies.get('admin_token')?.value

    // If already logged in and visiting login page, redirect to dashboard
    if (pathname === '/admin/login') {
      if (adminToken) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url))
      }
      const response = NextResponse.next()
      response.headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate')
      response.headers.set('X-Robots-Tag', 'noindex, nofollow')
      return response
    }

    // Unauthenticated access to admin pages -> redirect to login
    if (!adminToken) {
      const loginUrl = new URL('/admin/login', req.url)
      return NextResponse.redirect(loginUrl)
    }

    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate')
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return response
  }

  // 2. Sensitive / Mutation / Private API Routes
  if (
    pathname.startsWith('/api/admin') ||
    pathname === '/api/chat' ||
    pathname.startsWith('/api/enquiries') ||
    pathname === '/api/revalidate'
  ) {
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate')
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/chat',
    '/api/enquiries/:path*',
    '/api/revalidate',
  ],
}

