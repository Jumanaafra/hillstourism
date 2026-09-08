import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth/adminAuth'
import { createPackage, updatePackage, deletePackage, getPackages } from '@/lib/repositories/packages.repo'

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

    const pkg = await createPackage({
      name: body.name.trim(),
      slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      destination: body.destination.trim(),
      category: body.category || 'Couple',
      duration: body.duration || '3 Days / 2 Nights',
      price: body.price || '₹9,999',
      priceNote: body.priceNote || 'per person',
      tag: body.tag || 'Popular',
      description: body.description || '',
      highlights: Array.isArray(body.highlights) ? body.highlights : [],
      image: body.image || '',
      active: body.active !== undefined ? body.active : true,
    })

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

    const updated = await updatePackage(id, updates)
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

  await deletePackage(id)
  return NextResponse.json({ success: true, data: { deleted: true } })
}
