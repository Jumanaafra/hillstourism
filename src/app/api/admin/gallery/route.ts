import { NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { verifyAdminAuth, adminJsonResponse } from '@/lib/auth/adminAuth'

export const dynamic = 'force-dynamic'

import {
  getGalleryPhotos,
  createGalleryPhoto,
  updateGalleryPhoto,
  deleteGalleryPhoto,
  getGalleryPhotoById,
} from '@/lib/repositories/gallery.repo'

function safeRevalidate() {
  try {
    revalidatePath('/gallery')
    revalidatePath('/')
  } catch (err) {
    console.warn('[Admin Gallery] Revalidation error (non-fatal):', err)
  }
}

/** Validates an image src URL — must be http(s) or a relative path. No js: or data: URIs. */
function validateImageSrc(src: string): { valid: boolean; error?: string } {
  if (!src || typeof src !== 'string' || !src.trim()) {
    return { valid: false, error: 'Image URL (src) is required.' }
  }
  const trimmed = src.trim()
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:')) {
    return { valid: false, error: 'Image URL must not use javascript: or data: protocol.' }
  }
  return { valid: true }
}

/** Builds a safe GalleryPhoto update payload — only known fields are allowed. */
function buildGalleryUpdatePayload(body: Record<string, any>) {
  const allowed: Record<string, any> = {}

  if (body.src !== undefined)           allowed.src = String(body.src).trim()
  if (body.alt !== undefined)           allowed.alt = String(body.alt || '').trim()
  if (body.category !== undefined)      allowed.category = String(body.category).trim()
  if (body.displayOrder !== undefined)  allowed.displayOrder = typeof body.displayOrder === 'number' ? body.displayOrder : parseInt(body.displayOrder, 10)
  if (body.active !== undefined)        allowed.active = Boolean(body.active)
  if (body.cloudinaryPublicId !== undefined) allowed.cloudinaryPublicId = String(body.cloudinaryPublicId || '').trim()
  if (body.width !== undefined)         allowed.width = typeof body.width === 'number' ? body.width : parseInt(body.width, 10)
  if (body.height !== undefined)        allowed.height = typeof body.height === 'number' ? body.height : parseInt(body.height, 10)
  if (body.format !== undefined)        allowed.format = String(body.format || '').trim()

  return allowed
}

export async function GET(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return adminJsonResponse({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  const photos = await getGalleryPhotos(false)
  return adminJsonResponse({ success: true, data: photos })
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return adminJsonResponse({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  try {
    const body = await req.json()

    const srcCheck = validateImageSrc(body.src)
    if (!srcCheck.valid) {
      return adminJsonResponse(
        { success: false, error: { code: 'VALIDATION_ERROR', message: srcCheck.error } },
        { status: 400 }
      )
    }

    const photo = await createGalleryPhoto({
      src: body.src.trim(),
      alt: body.alt?.trim() || '',
      category: body.category || 'General',
      displayOrder: typeof body.displayOrder === 'number' ? body.displayOrder : 99,
      active: body.active !== undefined ? Boolean(body.active) : true,
      ...(body.cloudinaryPublicId ? { cloudinaryPublicId: String(body.cloudinaryPublicId).trim() } : {}),
      ...(body.width ? { width: typeof body.width === 'number' ? body.width : parseInt(body.width, 10) } : {}),
      ...(body.height ? { height: typeof body.height === 'number' ? body.height : parseInt(body.height, 10) } : {}),
      ...(body.format ? { format: String(body.format).trim() } : {}),
    })

    safeRevalidate()
    return adminJsonResponse({ success: true, data: photo }, { status: 201 })
  } catch (err: any) {
    return adminJsonResponse(
      { success: false, error: { code: 'OPERATION_FAILED', message: err?.message || 'Failed to create gallery photo.' } },
      { status: 500 }
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
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Photo ID is required.' } },
        { status: 400 }
      )
    }

    // Validate src if being updated
    if (body.src !== undefined) {
      const srcCheck = validateImageSrc(body.src)
      if (!srcCheck.valid) {
        return adminJsonResponse(
          { success: false, error: { code: 'VALIDATION_ERROR', message: srcCheck.error } },
          { status: 400 }
        )
      }
    }

    // Verify existence
    const existing = await getGalleryPhotoById(id)
    if (!existing) {
      return adminJsonResponse(
        { success: false, error: { code: 'NOT_FOUND', message: `Gallery photo ${id} not found.` } },
        { status: 404 }
      )
    }

    const updates = buildGalleryUpdatePayload(body)
    const updated = await updateGalleryPhoto(id, updates)

    safeRevalidate()
    return adminJsonResponse({ success: true, data: updated })
  } catch (err: any) {
    return adminJsonResponse(
      { success: false, error: { code: 'OPERATION_FAILED', message: err?.message || 'Failed to update gallery photo.' } },
      { status: 500 }
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
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Photo ID is required.' } },
        { status: 400 }
      )
    }

    const existing = await getGalleryPhotoById(id)
    if (!existing) {
      return adminJsonResponse(
        { success: false, error: { code: 'NOT_FOUND', message: `Gallery photo ${id} not found.` } },
        { status: 404 }
      )
    }

    await deleteGalleryPhoto(id)
    safeRevalidate()
    return adminJsonResponse({ success: true, data: { deleted: true, id } })
  } catch (err: any) {
    return adminJsonResponse(
      { success: false, error: { code: 'OPERATION_FAILED', message: err?.message || 'Failed to delete gallery photo.' } },
      { status: 500 }
    )
  }
}
