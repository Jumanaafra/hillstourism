import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { verifyAdminAuth } from '@/lib/auth/adminAuth'
import { createVehicle, updateVehicle, deleteVehicle, getVehicles, getVehicleById } from '@/lib/repositories/vehicles.repo'

function safeRevalidate() {
  try {
    revalidatePath('/vehicles')
    revalidatePath('/')
  } catch (err) {
    console.warn('[Admin Vehicles] Revalidation error (non-fatal):', err)
  }
}

/** Builds a safe Vehicle update payload — only known Vehicle fields are allowed. */
function buildVehicleUpdatePayload(body: Record<string, any>) {
  const allowed: Record<string, any> = {}

  if (body.name !== undefined)           allowed.name = String(body.name).trim()
  if (body.numberPlate !== undefined)    allowed.numberPlate = String(body.numberPlate).trim()
  if (body.type !== undefined)           allowed.type = String(body.type).trim()
  if (body.model !== undefined)          allowed.model = String(body.model).trim()
  if (body.capacity !== undefined)       allowed.capacity = typeof body.capacity === 'number' ? body.capacity : parseInt(body.capacity, 10)
  if (body.luggage !== undefined)        allowed.luggage = String(body.luggage).trim()
  if (body.driverAvailable !== undefined) allowed.driverAvailable = Boolean(body.driverAvailable)
  if (body.localRoutes !== undefined)    allowed.localRoutes = Boolean(body.localRoutes)
  if (body.flexiblePickup !== undefined) allowed.flexiblePickup = Boolean(body.flexiblePickup)
  if (body.features !== undefined)       allowed.features = Array.isArray(body.features) ? body.features : []
  if (body.idealFor !== undefined)       allowed.idealFor = String(body.idealFor).trim()
  if (body.priceNote !== undefined)      allowed.priceNote = String(body.priceNote).trim()
  if (body.description !== undefined)    allowed.description = String(body.description).trim()
  if (body.image !== undefined)          allowed.image = String(body.image).trim()
  if (body.media !== undefined)          allowed.media = Array.isArray(body.media) ? body.media : []
  if (body.active !== undefined)         allowed.active = Boolean(body.active)

  return allowed
}

export async function GET(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  const vehicles = await getVehicles(false)
  return NextResponse.json({ success: true, data: vehicles })
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
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Vehicle name is required.' } },
        { status: 400 }
      )
    }
    if (!body.numberPlate || typeof body.numberPlate !== 'string' || !body.numberPlate.trim()) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Vehicle number plate is required.' } },
        { status: 400 }
      )
    }

    const vehicle = await createVehicle({
      name: body.name.trim(),
      numberPlate: body.numberPlate.trim(),
      type: body.type || 'SUV',
      model: body.model || undefined,
      capacity: typeof body.capacity === 'number' ? body.capacity : 6,
      luggage: body.luggage || '3 Bags',
      driverAvailable: body.driverAvailable !== undefined ? Boolean(body.driverAvailable) : true,
      localRoutes: body.localRoutes !== undefined ? Boolean(body.localRoutes) : true,
      flexiblePickup: body.flexiblePickup !== undefined ? Boolean(body.flexiblePickup) : true,
      features: Array.isArray(body.features) ? body.features : ['AC'],
      idealFor: body.idealFor || 'Couples & Small Families',
      priceNote: body.priceNote || 'Starting ₹2,500/day',
      image: body.image || '',
      active: body.active !== undefined ? Boolean(body.active) : true,
    })

    safeRevalidate()
    return NextResponse.json({ success: true, data: vehicle }, { status: 201 })
  } catch (err: any) {
    const isConflict = err?.message?.includes('already exists')
    return NextResponse.json(
      {
        success: false,
        error: {
          code: isConflict ? 'DUPLICATE_VEHICLE_PLATE' : 'OPERATION_FAILED',
          message: err?.message || 'Failed to create vehicle.',
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
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Vehicle ID is required.' } },
        { status: 400 }
      )
    }

    // Verify existence before update
    const existing = await getVehicleById(id)
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: `Vehicle ${id} not found.` } },
        { status: 404 }
      )
    }

    const updates = buildVehicleUpdatePayload(body)
    const updated = await updateVehicle(id, updates)

    safeRevalidate()
    return NextResponse.json({ success: true, data: updated })
  } catch (err: any) {
    const isConflict = err?.message?.includes('already exists')
    return NextResponse.json(
      {
        success: false,
        error: {
          code: isConflict ? 'DUPLICATE_VEHICLE_PLATE' : 'OPERATION_FAILED',
          message: err?.message || 'Failed to update vehicle.',
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
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Vehicle ID is required.' } },
        { status: 400 }
      )
    }

    const existing = await getVehicleById(id)
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: `Vehicle ${id} not found.` } },
        { status: 404 }
      )
    }

    await deleteVehicle(id)
    safeRevalidate()
    return NextResponse.json({ success: true, data: { deleted: true, id } })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'OPERATION_FAILED', message: err?.message || 'Failed to delete vehicle.' } },
      { status: 500 }
    )
  }
}
