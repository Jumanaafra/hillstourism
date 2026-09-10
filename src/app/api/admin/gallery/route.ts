import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { verifyAdminAuth } from '@/lib/auth/adminAuth'
import {
  getGalleryPhotos,
  createGalleryPhoto,
  updateGalleryPhoto,
  deleteGalleryPhoto,
} from '@/lib/repositories/gallery.repo'

function safeRevalidate() {
  try {
    revalidatePath('/gallery')
    revalidatePath('/')
  } catch (err) {
    console.warn('[Admin Gallery] Revalidation error:', err)
  }
}


export async function GET(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  const photos = await getGalleryPhotos(false)
  return NextResponse.json({ success: true, data: photos })
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  try {
    const body = await req.json()
    if (!body.src || typeof body.src !== 'string' || !body.src.trim()) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Image URL (src) is required.' } },
        { status: 400 }
      )
    }

    const photo = await createGalleryPhoto({
      src: body.src.trim(),
      alt: body.alt?.trim() || '',
      category: body.category || 'General',
      displayOrder: typeof body.displayOrder === 'number' ? body.displayOrder : 99,
      active: body.active !== undefined ? body.active : true,
    })

    safeRevalidate()
    return NextResponse.json({ success: true, data: photo }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'OPERATION_FAILED', message: err?.message || 'Failed to create gallery photo.' } },
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
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Photo ID is required.' } },
        { status: 400 }
      )
    }

    const updated = await updateGalleryPhoto(id, updates)
    safeRevalidate()
    return NextResponse.json({ success: true, data: updated })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'OPERATION_FAILED', message: err?.message || 'Failed to update gallery photo.' } },
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
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Photo ID is required.' } },
      { status: 400 }
    )
  }

  await deleteGalleryPhoto(id)
  safeRevalidate()
  return NextResponse.json({ success: true, data: { deleted: true } })
}
