import { NextRequest } from 'next/server'
import { verifyAdminAuth, adminJsonResponse } from '@/lib/auth/adminAuth'

import {
  getAllPageSEO,
  getSeoByRoute,
  savePageSEO,
  resetPageSEO,
} from '@/lib/repositories/seo.repo'
import { triggerTargetedRevalidation } from '@/lib/cache/revalidate'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/seo — Retrieve all page SEO configs or a specific route's config
 */
export async function GET(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return adminJsonResponse({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const route = searchParams.get('route')

    if (route) {
      const pageSeo = await getSeoByRoute(route)
      return adminJsonResponse({ success: true, data: pageSeo })
    }

    const allSeo = await getAllPageSEO()
    return adminJsonResponse({ success: true, data: allSeo })
  } catch (err: any) {
    return adminJsonResponse(
      { success: false, error: { code: 'FETCH_ERROR', message: err?.message || 'Failed to fetch SEO data.' } },
      { status: 500 }
    )
  }
}

/**
 * POST / PUT /api/admin/seo — Save / update SEO for a route
 */
export async function POST(req: NextRequest) {
  return handleSaveSEO(req)
}

export async function PUT(req: NextRequest) {
  return handleSaveSEO(req)
}

async function handleSaveSEO(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return adminJsonResponse({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  try {
    const body = await req.json()
    if (!body.route) {
      return adminJsonResponse(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Route is required to configure SEO.' } },
        { status: 400 }
      )
    }

    const saved = await savePageSEO(body)
    triggerTargetedRevalidation('seo', saved.route)
    return adminJsonResponse({ success: true, data: saved })
  } catch (err: any) {
    return adminJsonResponse(
      { success: false, error: { code: 'VALIDATION_ERROR', message: err?.message || 'Failed to save SEO.' } },
      { status: 400 }
    )
  }
}

/**
 * DELETE /api/admin/seo — Reset a page's SEO back to application defaults
 */
export async function DELETE(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return adminJsonResponse({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    let route = searchParams.get('route') || searchParams.get('id')

    if (!route) {
      try {
        const body = await req.json()
        route = body?.route || body?.id
      } catch {
        // body not json
      }
    }

    if (!route) {
      return adminJsonResponse(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Route or ID is required to reset SEO.' } },
        { status: 400 }
      )
    }

    const reset = await resetPageSEO(route)
    triggerTargetedRevalidation('seo', reset.route)
    return adminJsonResponse({ success: true, data: reset })
  } catch (err: any) {
    return adminJsonResponse(
      { success: false, error: { code: 'RESET_ERROR', message: err?.message || 'Failed to reset SEO.' } },
      { status: 400 }
    )
  }
}
