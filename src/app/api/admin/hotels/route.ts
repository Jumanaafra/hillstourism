import { NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { verifyAdminAuth, adminJsonResponse } from '@/lib/auth/adminAuth'

export const dynamic = 'force-dynamic'

import { createHotel, updateHotel, deleteHotel, getHotels, getHotelById } from '@/lib/repositories/hotels.repo'

/**
 * Revalidates hotel-related public pages after a successful Firestore mutation.
 * Always called AFTER the mutation succeeds — never before.
 * Accepts both old and new slugs to handle slug-change scenarios.
 */
function safeRevalidate(newSlug?: string, oldSlug?: string) {
  try {
    revalidatePath('/stays')
    revalidatePath('/')
    if (newSlug) revalidatePath(`/hotels/${newSlug}`)
    // If slug changed, also invalidate the old route so it becomes a 404 on next visit
    if (oldSlug && oldSlug !== newSlug) {
      revalidatePath(`/hotels/${oldSlug}`)
    }
  } catch (err) {
    console.warn('[Admin Hotels] Revalidation error (non-fatal):', err)
  }
}

/** Builds a safe Hotel update payload — only known Hotel fields are allowed. */
function buildHotelUpdatePayload(body: Record<string, any>) {
  const allowed: Record<string, any> = {}

  if (body.name !== undefined)          allowed.name = String(body.name).trim()
  if (body.slug !== undefined)          allowed.slug = String(body.slug).trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)/g, '')
  if (body.location !== undefined)      allowed.location = String(body.location).trim()
  if (body.category !== undefined)      allowed.category = String(body.category).trim()
  if (body.rating !== undefined)        allowed.rating = typeof body.rating === 'number' ? body.rating : parseFloat(body.rating)
  if (body.pricePerNight !== undefined) allowed.pricePerNight = String(body.pricePerNight).trim()
  if (body.description !== undefined)   allowed.description = String(body.description).trim()
  if (body.amenities !== undefined)     allowed.amenities = Array.isArray(body.amenities) ? body.amenities : []
  if (body.image !== undefined)         allowed.image = String(body.image).trim()
  if (body.media !== undefined)         allowed.media = Array.isArray(body.media) ? body.media : []
  if (body.active !== undefined)        allowed.active = Boolean(body.active)
  if (body.seo !== undefined && typeof body.seo === 'object') {
    allowed.seo = {
      title: body.seo.title ?? undefined,
      description: body.seo.description ?? undefined,
      canonicalUrl: body.seo.canonicalUrl ?? undefined,
      ogImage: body.seo.ogImage ?? undefined,
      keywords: Array.isArray(body.seo.keywords) ? body.seo.keywords : undefined,
    }
  }

  return allowed
}

export async function GET(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return adminJsonResponse({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  const hotels = await getHotels(false)
  return adminJsonResponse({ success: true, data: hotels })
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return adminJsonResponse({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  try {
    const body = await req.json()
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return adminJsonResponse(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Hotel name is required.' } },
        { status: 400 }
      )
    }

    const hotel = await createHotel({
      name: body.name.trim(),
      slug: body.slug ? String(body.slug).trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)/g, '') : undefined,
      location: body.location || '',
      category: body.category || 'Normal',
      rating: typeof body.rating === 'number' ? body.rating : 4.5,
      pricePerNight: body.pricePerNight || '₹3,500',
      description: body.description || '',
      amenities: Array.isArray(body.amenities) ? body.amenities : [],
      image: body.image || '',
      active: body.active !== undefined ? Boolean(body.active) : true,
    })

    safeRevalidate(hotel.slug)
    return adminJsonResponse({ success: true, data: hotel }, { status: 201 })
  } catch (err: any) {
    const isConflict = err?.message?.includes('already exists')
    return adminJsonResponse(
      {
        success: false,
        error: {
          code: isConflict ? 'DUPLICATE_HOTEL' : 'OPERATION_FAILED',
          message: err?.message || 'Failed to create hotel.',
        },
      },
      { status: isConflict ? 409 : 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return adminJsonResponse({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id } = body
    if (!id || typeof id !== 'string') {
      return adminJsonResponse(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Hotel ID is required.' } },
        { status: 400 }
      )
    }

    // Fetch current record to capture old slug BEFORE updating
    const existing = await getHotelById(id)
    if (!existing) {
      return adminJsonResponse(
        { success: false, error: { code: 'NOT_FOUND', message: `Hotel ${id} not found.` } },
        { status: 404 }
      )
    }
    const oldSlug = existing.slug

    // Build whitelisted payload
    const updates = buildHotelUpdatePayload(body)

    const updated = await updateHotel(id, updates)

    // Revalidate both old and new slug if slug changed
    safeRevalidate(updated.slug, oldSlug)
    return adminJsonResponse({ success: true, data: updated })
  } catch (err: any) {
    const isConflict = err?.message?.includes('already exists')
    return adminJsonResponse(
      {
        success: false,
        error: {
          code: isConflict ? 'DUPLICATE_HOTEL' : 'OPERATION_FAILED',
          message: err?.message || 'Failed to update hotel.',
        },
      },
      { status: isConflict ? 409 : 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return adminJsonResponse({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return adminJsonResponse(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Hotel ID is required.' } },
        { status: 400 }
      )
    }

    // Fetch before delete to capture slug for revalidation
    const existing = await getHotelById(id)
    if (!existing) {
      return adminJsonResponse(
        { success: false, error: { code: 'NOT_FOUND', message: `Hotel ${id} not found.` } },
        { status: 404 }
      )
    }

    await deleteHotel(id)
    safeRevalidate(existing.slug)
    return adminJsonResponse({ success: true, data: { deleted: true, id } })
  } catch (err: any) {
    return adminJsonResponse(
      { success: false, error: { code: 'OPERATION_FAILED', message: err?.message || 'Failed to delete hotel.' } },
      { status: 500 }
    )
  }
}
