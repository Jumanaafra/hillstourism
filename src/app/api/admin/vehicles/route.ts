import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { verifyAdminAuth } from '@/lib/auth/adminAuth'
import { createVehicle, updateVehicle, deleteVehicle, getVehicles } from '@/lib/repositories/vehicles.repo'

function safeRevalidate() {
  try {
    revalidatePath('/vehicles')
    revalidatePath('/')
  } catch (err) {
    console.warn('[Admin Vehicles] Revalidation error:', err)
  }
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
    if (!body.name || !body.numberPlate) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Vehicle name and number plate are required.' } },
        { status: 400 }
      )
    }

    const vehicle = await createVehicle({
      name: body.name.trim(),
      numberPlate: body.numberPlate.trim(),
      type: body.type || 'SUV',
      capacity: typeof body.capacity === 'number' ? body.capacity : 6,
      luggage: body.luggage || '3 Bags',
      driverAvailable: body.driverAvailable !== undefined ? body.driverAvailable : true,
      localRoutes: body.localRoutes !== undefined ? body.localRoutes : true,
      flexiblePickup: body.flexiblePickup !== undefined ? body.flexiblePickup : true,
      features: Array.isArray(body.features) ? body.features : ['AC'],
      idealFor: body.idealFor || 'Couples & Small Families',
      priceNote: body.priceNote || 'Starting ₹2,500/day',
      image: body.image || '',
      active: body.active !== undefined ? body.active : true,
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
    const { id, ...updates } = body
    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Vehicle ID is required.' } },
        { status: 400 }
      )
    }

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

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Vehicle ID is required.' } },
      { status: 400 }
    )
  }

  await deleteVehicle(id)
  safeRevalidate()
  return NextResponse.json({ success: true, data: { deleted: true } })
}
