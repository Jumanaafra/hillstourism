import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { verifyAdminAuth } from '@/lib/auth/adminAuth'
import { createPackage, updatePackage, deletePackage, getPackages, getPackageById } from '@/lib/repositories/packages.repo'
import { validateItinerary, sortItineraryDays } from '@/lib/validation/itinerary'

function safeRevalidate(slug?: string) {
  try {
    if (slug) revalidatePath(`/packages/${slug}`)
    revalidatePath('/packages')
    revalidatePath('/')
  } catch (err) {
    console.warn('[Admin Packages] Revalidation error:', err)
  }
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
    if (!body.name || !body.destination) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Package name and destination are required.' } },
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

    const pkg = await createPackage({
      name: body.name.trim(),
      slug: body.slug ? body.slug.trim().toLowerCase() : body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      destination: body.destination.trim(),
      category: body.category || 'Couple',
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
      seo: body.seo || {},
      active: body.active !== undefined ? body.active : true,
    })

    safeRevalidate(pkg.slug)
    return NextResponse.json({ success: true, data: pkg }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'OPERATION_FAILED', message: err?.message || 'Failed to create package.' } },
      { status: 500 }
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
    const { id, ...updates } = body
    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Package ID is required.' } },
        { status: 400 }
      )
    }

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
    safeRevalidate(updated.slug)
    return NextResponse.json({ success: true, data: updated })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'OPERATION_FAILED', message: err?.message || 'Failed to update package.' } },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Package ID is required.' } },
      { status: 400 }
    )
  }

  const existing = await getPackageById(id)
  await deletePackage(id)
  if (existing?.slug) {
    safeRevalidate(existing.slug)
  }

  return NextResponse.json({ success: true, data: { deleted: true } })
}
