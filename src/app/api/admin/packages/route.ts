import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { verifyAdminAuth } from '@/lib/auth/adminAuth'
import { createPackage, updatePackage, deletePackage, getPackages, getPackageById } from '@/lib/repositories/packages.repo'
import { validateItinerary, sortItineraryDays } from '@/lib/validation/itinerary'

/**
 * Revalidates package-related public pages after a successful Firestore mutation.
 * Always called AFTER the mutation succeeds — never before.
 * Accepts both old and new slugs to handle slug-change scenarios.
 */
function safeRevalidate(newSlug?: string, oldSlug?: string) {
  try {
    revalidatePath('/packages')
    revalidatePath('/')
    if (newSlug) revalidatePath(`/packages/${newSlug}`)
    // If slug changed, also invalidate the old route so it becomes a 404 on next visit
    if (oldSlug && oldSlug !== newSlug) {
      revalidatePath(`/packages/${oldSlug}`)
    }
  } catch (err) {
    console.warn('[Admin Packages] Revalidation error (non-fatal):', err)
  }
}

/** Validates and sanitizes a slug string. */
function sanitizeSlug(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)/g, '')
}

/** Builds a safe Package update payload — only known Package fields are allowed. */
function buildPackageUpdatePayload(body: Record<string, any>) {
  const allowed: Record<string, any> = {}

  if (body.name !== undefined)                    allowed.name = String(body.name).trim()
  if (body.slug !== undefined)                    allowed.slug = sanitizeSlug(String(body.slug))
  if (body.destination !== undefined)             allowed.destination = String(body.destination).trim()
  if (body.category !== undefined)                allowed.category = String(body.category).trim()
  if (body.categoryId !== undefined)              allowed.categoryId = String(body.categoryId).trim()
  if (body.tag !== undefined)                     allowed.tag = String(body.tag).trim()
  if (body.duration !== undefined)                allowed.duration = String(body.duration).trim()
  if (body.nights !== undefined)                  allowed.nights = body.nights
  if (body.price !== undefined)                   allowed.price = String(body.price).trim()
  if (body.priceNote !== undefined)               allowed.priceNote = String(body.priceNote).trim()
  if (body.shortDescription !== undefined)        allowed.shortDescription = String(body.shortDescription).trim()
  if (body.description !== undefined)             allowed.description = String(body.description).trim()
  if (body.highlights !== undefined)              allowed.highlights = Array.isArray(body.highlights) ? body.highlights : []
  if (body.inclusions !== undefined)              allowed.inclusions = Array.isArray(body.inclusions) ? body.inclusions : []
  if (body.exclusions !== undefined)              allowed.exclusions = Array.isArray(body.exclusions) ? body.exclusions : []
  if (body.importantInformation !== undefined)    allowed.importantInformation = Array.isArray(body.importantInformation) ? body.importantInformation : []
  if (body.hotelIds !== undefined)                allowed.hotelIds = Array.isArray(body.hotelIds) ? body.hotelIds : []
  if (body.vehicleIds !== undefined)              allowed.vehicleIds = Array.isArray(body.vehicleIds) ? body.vehicleIds : []
  if (body.image !== undefined)                   allowed.image = String(body.image).trim()
  if (body.coverImage !== undefined)              allowed.coverImage = String(body.coverImage).trim()
  if (body.gallery !== undefined)                 allowed.gallery = Array.isArray(body.gallery) ? body.gallery : []
  if (body.media !== undefined)                   allowed.media = Array.isArray(body.media) ? body.media : []
  if (body.active !== undefined)                  allowed.active = Boolean(body.active)
  if (body.seo !== undefined && typeof body.seo === 'object') {
    allowed.seo = {
      title: body.seo.title ?? undefined,
      description: body.seo.description ?? undefined,
      canonicalUrl: body.seo.canonicalUrl ?? undefined,
      ogImage: body.seo.ogImage ?? undefined,
      keywords: Array.isArray(body.seo.keywords) ? body.seo.keywords : undefined,
    }
  }
  if (body.itinerary !== undefined) allowed.itinerary = body.itinerary

  return allowed
}

export async function GET(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  const packages = await getPackages(false)
  return NextResponse.json({ success: true, data: packages })
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  try {
    const body = await req.json()
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Package name is required.' } },
        { status: 400 }
      )
    }
    if (!body.destination || typeof body.destination !== 'string' || !body.destination.trim()) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Package destination is required.' } },
        { status: 400 }
      )
    }

    if (body.itinerary !== undefined) {
      const vResult = validateItinerary(body.itinerary)
      if (!vResult.valid) {
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: vResult.error } },
          { status: 400 }
        )
      }
    }

    const slug = body.slug ? sanitizeSlug(body.slug) : body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const pkg = await createPackage({
      name: body.name.trim(),
      slug,
      destination: body.destination.trim(),
      category: body.category || 'Couple',
      categoryId: body.categoryId || undefined,
      duration: body.duration || '3 Days / 2 Nights',
      nights: body.nights !== undefined ? body.nights : undefined,
      price: body.price || '₹9,999',
      priceNote: body.priceNote || 'per person',
      tag: body.tag || 'Popular',
      shortDescription: body.shortDescription?.trim() || '',
      description: body.description?.trim() || '',
      highlights: Array.isArray(body.highlights) ? body.highlights : [],
      itinerary: body.itinerary ? sortItineraryDays(body.itinerary) : [],
      inclusions: Array.isArray(body.inclusions) ? body.inclusions : [],
      exclusions: Array.isArray(body.exclusions) ? body.exclusions : [],
      importantInformation: Array.isArray(body.importantInformation) ? body.importantInformation : [],
      hotelIds: Array.isArray(body.hotelIds) ? body.hotelIds : [],
      vehicleIds: Array.isArray(body.vehicleIds) ? body.vehicleIds : [],
      image: body.image || body.coverImage || '',
      coverImage: body.coverImage || body.image || '',
      gallery: Array.isArray(body.gallery) ? body.gallery : [],
      seo: body.seo && typeof body.seo === 'object' ? body.seo : {},
      active: body.active !== undefined ? Boolean(body.active) : true,
    })

    safeRevalidate(pkg.slug)
    return NextResponse.json({ success: true, data: pkg }, { status: 201 })
  } catch (err: any) {
    const isConflict = err?.message?.includes('already exists')
    return NextResponse.json(
      {
        success: false,
        error: {
          code: isConflict ? 'DUPLICATE_SLUG' : 'OPERATION_FAILED',
          message: err?.message || 'Failed to create package.',
        },
      },
      { status: isConflict ? 409 : 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id } = body
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Package ID is required.' } },
        { status: 400 }
      )
    }

    // Fetch current record to capture old slug BEFORE updating
    const existing = await getPackageById(id)
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: `Package ${id} not found.` } },
        { status: 404 }
      )
    }
    const oldSlug = existing.slug

    // Build a whitelisted update payload
    const updates = buildPackageUpdatePayload(body)

    if (updates.itinerary !== undefined) {
      const vResult = validateItinerary(updates.itinerary)
      if (!vResult.valid) {
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: vResult.error } },
          { status: 400 }
        )
      }
      updates.itinerary = sortItineraryDays(updates.itinerary)
    }

    const updated = await updatePackage(id, updates)

    // Revalidate both old and new slug if slug changed
    safeRevalidate(updated.slug, oldSlug)
    return NextResponse.json({ success: true, data: updated })
  } catch (err: any) {
    const isConflict = err?.message?.includes('already exists')
    return NextResponse.json(
      {
        success: false,
        error: {
          code: isConflict ? 'DUPLICATE_SLUG' : 'OPERATION_FAILED',
          message: err?.message || 'Failed to update package.',
        },
      },
      { status: isConflict ? 409 : 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Package ID is required.' } },
        { status: 400 }
      )
    }

    // Fetch before delete to capture slug for revalidation
    const existing = await getPackageById(id)
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: `Package ${id} not found.` } },
        { status: 404 }
      )
    }

    await deletePackage(id)
    safeRevalidate(existing.slug)
    return NextResponse.json({ success: true, data: { deleted: true, id } })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'OPERATION_FAILED', message: err?.message || 'Failed to delete package.' } },
      { status: 500 }
    )
  }
}
