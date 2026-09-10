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
import type { Category, Experience, Testimonial, SiteSettings } from '@/types/domain'

/** Whitelist category fields from request body. */
function buildCategoryPayload(data: Record<string, any>): Omit<Category, 'id'> {
  return {
    title: String(data.title || '').trim(),
    slug: data.slug ? String(data.slug).trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-') : undefined,
    subtitle: data.subtitle ? String(data.subtitle).trim() : undefined,
    description: data.description ? String(data.description).trim() : undefined,
    image: data.image ? String(data.image).trim() : undefined,
    badge: data.badge ? String(data.badge).trim() : undefined,
    color: data.color ? String(data.color).trim() : undefined,
    order: data.order !== undefined ? Number(data.order) : undefined,
    active: data.active !== undefined ? Boolean(data.active) : true,
  }
}

/** Whitelist experience fields from request body. */
function buildExperiencePayload(data: Record<string, any>): Omit<Experience, 'id'> {
  return {
    title: String(data.title || '').trim(),
    subtitle: String(data.subtitle || '').trim(),
    description: String(data.description || '').trim(),
    image: String(data.image || '').trim(),
    duration: String(data.duration || '').trim(),
    difficulty: data.difficulty || 'Easy',
    location: String(data.location || '').trim(),
    icon: String(data.icon || '').trim(),
    highlights: Array.isArray(data.highlights) ? data.highlights : [],
    active: data.active !== undefined ? Boolean(data.active) : true,
  }
}

/** Whitelist testimonial fields from request body. */
function buildTestimonialPayload(data: Record<string, any>): Omit<Testimonial, 'id'> {
  return {
    name: String(data.name || '').trim(),
    trip: String(data.trip || '').trim(),
    location: String(data.location || '').trim(),
    rating: typeof data.rating === 'number' ? Math.min(5, Math.max(1, data.rating)) : 5,
    review: String(data.review || '').trim(),
    avatar: String(data.avatar || '').trim(),
    initials: String(data.initials || '').trim(),
    active: data.active !== undefined ? Boolean(data.active) : true,
  }
}

/** Whitelist site settings fields from request body. */
function buildSettingsPayload(data: Record<string, any>): Partial<SiteSettings> {
  const allowed: Partial<SiteSettings> = {}
  if (data.siteName !== undefined)               allowed.siteName = String(data.siteName).trim()
  if (data.tagline !== undefined)                allowed.tagline = String(data.tagline).trim()
  if (data.contactPhone !== undefined)           allowed.contactPhone = String(data.contactPhone).trim()
  if (data.contactEmail !== undefined)           allowed.contactEmail = String(data.contactEmail).trim()
  if (data.whatsappNumber !== undefined)         allowed.whatsappNumber = String(data.whatsappNumber).trim()
  if (data.address !== undefined)                allowed.address = String(data.address).trim()
  if (data.operationalHours !== undefined)       allowed.operationalHours = String(data.operationalHours).trim()
  if (data.totalTravelersMetric !== undefined)   allowed.totalTravelersMetric = String(data.totalTravelersMetric).trim()
  if (data.routesCountMetric !== undefined)      allowed.routesCountMetric = String(data.routesCountMetric).trim()
  if (data.averageRatingMetric !== undefined)    allowed.averageRatingMetric = String(data.averageRatingMetric).trim()
  return allowed
}

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

    if (!type || !data || typeof data !== 'object') {
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
      const created = await createCategory(buildCategoryPayload(data))
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
      const created = await createExperience(buildExperiencePayload(data))
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
      const created = await createTestimonial(buildTestimonialPayload(data))
      triggerTargetedRevalidation('content')
      return NextResponse.json({ success: true, data: created }, { status: 201 })
    }

    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: `Unknown content type: "${type}". Allowed: category, experience, testimonial` } },
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
    const { type, id, data } = body

    if (type === 'settings') {
      // Whitelist settings fields — never spread arbitrary request body into Firestore
      const updates = buildSettingsPayload(data && typeof data === 'object' ? data : body)
      const updated = await updateSiteSettings(updates)
      triggerTargetedRevalidation('settings')
      return NextResponse.json({ success: true, data: updated })
    }

    if (!type || !id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Type and id are required for update.' } },
        { status: 400 }
      )
    }

    const payload = data && typeof data === 'object' ? data : body

    if (type === 'category') {
      const updated = await updateCategory(id, buildCategoryPayload(payload))
      triggerTargetedRevalidation('content')
      return NextResponse.json({ success: true, data: updated })
    }

    if (type === 'experience') {
      const updated = await updateExperience(id, buildExperiencePayload(payload))
      triggerTargetedRevalidation('content')
      return NextResponse.json({ success: true, data: updated })
    }

    if (type === 'testimonial') {
      const updated = await updateTestimonial(id, buildTestimonialPayload(payload))
      triggerTargetedRevalidation('content')
      return NextResponse.json({ success: true, data: updated })
    }

    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: `Unknown content type: "${type}". Allowed: category, experience, testimonial, settings` } },
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
        type = type || (body?.type && String(body.type))
        id = id || (body?.id && String(body.id))
      } catch {
        // Body was empty or not JSON
      }
    }

    if (!type || !id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Both "type" and "id" are required to delete content.' } },
        { status: 400 }
      )
    }

    const ALLOWED_DELETE_TYPES = ['category', 'experience', 'testimonial']
    if (!ALLOWED_DELETE_TYPES.includes(type)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: `Cannot delete item of type: "${type}". Allowed: ${ALLOWED_DELETE_TYPES.join(', ')}` } },
        { status: 400 }
      )
    }

    let deleted = false
    if (type === 'category') {
      deleted = await deleteCategory(id)
    } else if (type === 'experience') {
      deleted = await deleteExperience(id)
    } else if (type === 'testimonial') {
      deleted = await deleteTestimonial(id)
    }

    triggerTargetedRevalidation('content')
    return NextResponse.json({ success: true, data: { id, type, deleted } })
  } catch (err: any) {
    console.error('[Admin Content DELETE] Error:', err)
    return NextResponse.json(
      { success: false, error: { code: 'OPERATION_FAILED', message: err?.message || 'Failed to delete item.' } },
      { status: 500 }
    )
  }
}
