import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { NO_CACHE_HEADERS } from '@/lib/auth/adminAuth'

export const dynamic = 'force-dynamic'

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

function revalidateResponse(data: any, init?: ResponseInit) {
  const headers = new Headers(init?.headers)
  for (const [k, v] of Object.entries(NO_CACHE_HEADERS)) {
    headers.set(k, v)
  }
  return NextResponse.json(data, { ...init, headers })
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret') || req.nextUrl.searchParams.get('secret')
  const expectedSecret = process.env.REVALIDATE_SECRET || 'hillstourism-cache-secret'

  if (secret !== expectedSecret) {
    return revalidateResponse({ success: false, error: 'Unauthorized revalidation request' }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const rawPath = body?.path || req.nextUrl.searchParams.get('path')
    const rawTag = body?.tag || req.nextUrl.searchParams.get('tag')

    let sanitizedPath: string | undefined
    let sanitizedTag: string | undefined

    // 1. Validate & sanitize tag if supplied
    if (rawTag !== undefined && rawTag !== null) {
      if (typeof rawTag !== 'string' || !/^[a-zA-Z0-9_\-]{1,64}$/.test(rawTag)) {
        return revalidateResponse(
          { success: false, error: 'Invalid tag parameter. Must be alphanumeric (1-64 chars).' },
          { status: 400 }
        )
      }
      sanitizedTag = rawTag
      revalidateTag(sanitizedTag)
    }

    // 2. Validate & sanitize path if supplied (Prevent cache poisoning / arbitrary path traversal)
    if (rawPath !== undefined && rawPath !== null) {
      if (typeof rawPath !== 'string' || !rawPath.startsWith('/') || rawPath.length > 256) {
        return revalidateResponse(
          { success: false, error: 'Invalid path parameter. Must be an absolute path starting with /.' },
          { status: 400 }
        )
      }

      // Check for directory traversal, double slashes, or illegal characters
      if (rawPath.includes('..') || rawPath.includes('//') || !/^\/[a-zA-Z0-9_\-\/]*$/.test(rawPath)) {
        return revalidateResponse(
          { success: false, error: 'Illegal characters or traversal detected in path.' },
          { status: 400 }
        )
      }

      // Allowlist verification of top-level route
      const clean = rawPath.replace(/\/+$/, '') || '/'
      const rootSegment = clean === '/' ? '' : clean.split('/')[1]
      if (!ALLOWED_ROOT_ROUTES.has(rootSegment)) {
        return revalidateResponse(
          { success: false, error: `Disallowed revalidation route: /${rootSegment}` },
          { status: 400 }
        )
      }

      sanitizedPath = clean
      revalidatePath(sanitizedPath)
    } else if (!sanitizedTag) {
      // Bulk revalidation — invalidate all major public cached pages
      revalidatePath('/')
      revalidatePath('/packages')
      revalidatePath('/stays')
      revalidatePath('/vehicles')
      revalidatePath('/gallery')
      revalidatePath('/experiences')
      revalidatePath('/about')
    }

    return revalidateResponse({
      success: true,
      revalidated: true,
      target: { path: sanitizedPath, tag: sanitizedTag },
      now: Date.now(),
    })
  } catch (err: any) {
    return revalidateResponse({ success: false, error: err?.message || 'Revalidation failed' }, { status: 500 })
  }
}

