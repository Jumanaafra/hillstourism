import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { verifyAdminAuth } from '@/lib/auth/adminAuth'
import { createHotel, updateHotel, deleteHotel, getHotels, getHotelById } from '@/lib/repositories/hotels.repo'

function safeRevalidate(slug?: string) {
  try {
    revalidatePath('/stays')
    revalidatePath('/')
    if (slug) revalidatePath(`/hotels/${slug}`)
  } catch (err) {
    console.warn('[Admin Hotels] Revalidation error:', err)
  }
}


export async function GET(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  const hotels = await getHotels(false)
  return NextResponse.json({ success: true, data: hotels })
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
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Hotel name is required.' } },
        { status: 400 }
      )
    }

    const hotel = await createHotel({
      name: body.name.trim(),
      slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      location: body.location || '',
      category: body.category || 'Normal',
      rating: typeof body.rating === 'number' ? body.rating : 4.5,
      pricePerNight: body.pricePerNight || '₹3,500',
      description: body.description || '',
      amenities: Array.isArray(body.amenities) ? body.amenities : [],
      image: body.image || '',
      active: body.active !== undefined ? body.active : true,
    })

    safeRevalidate(hotel.slug)
    return NextResponse.json({ success: true, data: hotel }, { status: 201 })
  } catch (err: any) {
    const isConflict = err?.message?.includes('already exists')
    return NextResponse.json(
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
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Hotel ID is required.' } },
        { status: 400 }
      )
    }

    const updated = await updateHotel(id, updates)
    safeRevalidate(updated.slug)
    return NextResponse.json({ success: true, data: updated })
  } catch (err: any) {
    const isConflict = err?.message?.includes('already exists')
    return NextResponse.json(
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
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Hotel ID is required.' } },
      { status: 400 }
    )
  }

  const existing = await getHotelById(id).catch(() => null)
  await deleteHotel(id)
  if (existing?.slug) {
    safeRevalidate(existing.slug)
  }
  return NextResponse.json({ success: true, data: { deleted: true } })
}
