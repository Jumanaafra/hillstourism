import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth/adminAuth'
import {
  getCategories,
  getExperiences,
  getTestimonials,
  getSiteSettings,
  updateSiteSettings,
} from '@/lib/repositories/content.repo'

/**
 * GET /api/admin/content — Fetch all content (categories, testimonials, experiences, settings)
 */
export async function GET(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  try {
    const [categories, testimonials, experiences, settings] = await Promise.all([
      getCategories(),
      getTestimonials(),
      getExperiences(),
      getSiteSettings(),
    ])

    return NextResponse.json({
      success: true,
      data: { categories, testimonials, experiences, settings },
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to retrieve content.' } },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/content — Update site settings
 */
export async function PATCH(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { type, ...updates } = body

    if (type === 'settings') {
      const updated = await updateSiteSettings(updates)
      return NextResponse.json({ success: true, data: updated })
    }

    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Unknown content type.' } },
      { status: 400 }
    )
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'OPERATION_FAILED', message: err?.message || 'Failed to update content.' } },
      { status: 500 }
    )
  }
}
