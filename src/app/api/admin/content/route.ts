import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth/adminAuth'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getSiteSettings,
  updateSiteSettings,
} from '@/lib/repositories/content.repo'
import { triggerTargetedRevalidation } from '@/lib/cache/revalidate'

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
      getCategories(false),
      getTestimonials(false),
      getExperiences(false),
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
 * POST /api/admin/content — Create category, experience, or testimonial
 */
export async function POST(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Type and data payload are required.' } },
        { status: 400 }
      )
    }

    if (type === 'category') {
      if (!data.title?.trim()) {
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Category title is required.' } },
          { status: 400 }
        )
      }
      const created = await createCategory(data)
      triggerTargetedRevalidation('content')
      return NextResponse.json({ success: true, data: created }, { status: 201 })
    }

    if (type === 'experience') {
      if (!data.title?.trim() || !data.description?.trim()) {
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Experience title and description are required.' } },
          { status: 400 }
        )
      }
      const created = await createExperience(data)
      triggerTargetedRevalidation('content')
      return NextResponse.json({ success: true, data: created }, { status: 201 })
    }

    if (type === 'testimonial') {
      if (!data.name?.trim() || !data.review?.trim()) {
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Testimonial author name and review are required.' } },
          { status: 400 }
        )
      }
      const created = await createTestimonial(data)
      triggerTargetedRevalidation('content')
      return NextResponse.json({ success: true, data: created }, { status: 201 })
    }

    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: `Unknown content type: ${type}` } },
      { status: 400 }
    )
  } catch (err: any) {
    console.error('[Admin Content POST] Error:', err)
    return NextResponse.json(
      { success: false, error: { code: 'OPERATION_FAILED', message: err?.message || 'Failed to create item.' } },
      { status: 500 }
    )
  }
}

/**
 * PUT / PATCH /api/admin/content — Update category, experience, testimonial, or site settings
 */
export async function PUT(req: NextRequest) {
  return handleUpdate(req)
}

export async function PATCH(req: NextRequest) {
  return handleUpdate(req)
}

async function handleUpdate(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { type, id, data, ...directUpdates } = body

    if (type === 'settings') {
      const updates = data || directUpdates
      const updated = await updateSiteSettings(updates)
      triggerTargetedRevalidation('settings')
      return NextResponse.json({ success: true, data: updated })
    }

    if (!type || !id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Type and id are required for update.' } },
        { status: 400 }
      )
    }

    const payload = data || directUpdates

    if (type === 'category') {
      const updated = await updateCategory(id, payload)
      triggerTargetedRevalidation('content')
      return NextResponse.json({ success: true, data: updated })
    }

    if (type === 'experience') {
      const updated = await updateExperience(id, payload)
      triggerTargetedRevalidation('content')
      return NextResponse.json({ success: true, data: updated })
    }

    if (type === 'testimonial') {
      const updated = await updateTestimonial(id, payload)
      triggerTargetedRevalidation('content')
      return NextResponse.json({ success: true, data: updated })
    }

    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: `Unknown content type: ${type}` } },
      { status: 400 }
    )
  } catch (err: any) {
    console.error('[Admin Content Update] Error:', err)
    return NextResponse.json(
      { success: false, error: { code: 'OPERATION_FAILED', message: err?.message || 'Failed to update content.' } },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/content — Delete category, experience, or testimonial
 */
export async function DELETE(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    let type = searchParams.get('type')
    let id = searchParams.get('id')

    if (!type || !id) {
      try {
        const body = await req.json()
        type = type || body?.type
        id = id || body?.id
      } catch {
        // Body was empty or not json
      }
    }

    if (!type || !id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Both "type" and "id" are required to delete content.' } },
        { status: 400 }
      )
    }

    let deleted = false
    if (type === 'category') {
      deleted = await deleteCategory(id)
      triggerTargetedRevalidation('content')
    } else if (type === 'experience') {
      deleted = await deleteExperience(id)
      triggerTargetedRevalidation('content')
    } else if (type === 'testimonial') {
      deleted = await deleteTestimonial(id)
      triggerTargetedRevalidation('content')
    } else {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: `Cannot delete item of type: ${type}` } },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, data: { id, type, deleted } })
  } catch (err: any) {
    console.error('[Admin Content DELETE] Error:', err)
    return NextResponse.json(
      { success: false, error: { code: 'OPERATION_FAILED', message: err?.message || 'Failed to delete item.' } },
      { status: 500 }
    )
  }
}
