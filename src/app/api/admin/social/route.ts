import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth/adminAuth'
import {
  getSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  ALLOWED_SOCIAL_PLATFORMS,
} from '@/lib/repositories/social.repo'
import { triggerTargetedRevalidation } from '@/lib/cache/revalidate'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/social — Retrieve all social links (including inactive) for Admin
 */
export async function GET(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  try {
    const links = await getSocialLinks(false)
    return NextResponse.json({ success: true, data: links, allowedPlatforms: ALLOWED_SOCIAL_PLATFORMS })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: err?.message || 'Failed to fetch social links.' } },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/social — Create a new social link
 */
export async function POST(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  try {
    const body = await req.json()
    const created = await createSocialLink(body)
    triggerTargetedRevalidation('social')
    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: err?.message || 'Failed to create social link.' } },
      { status: 400 }
    )
  }
}

/**
 * PUT /api/admin/social — Update an existing social link
 */
export async function PUT(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Social link ID is required.' } },
        { status: 400 }
      )
    }

    const updated = await updateSocialLink(id, updates)
    triggerTargetedRevalidation('social')
    return NextResponse.json({ success: true, data: updated })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_ERROR', message: err?.message || 'Failed to update social link.' } },
      { status: 400 }
    )
  }
}

/**
 * DELETE /api/admin/social — Delete a social link
 */
export async function DELETE(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    let id = searchParams.get('id')

    if (!id) {
      try {
        const body = await req.json()
        id = body?.id
      } catch {
        // body wasn't json
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'ID is required to delete social link.' } },
        { status: 400 }
      )
    }

    const deleted = await deleteSocialLink(id)
    triggerTargetedRevalidation('social')
    return NextResponse.json({ success: true, data: { id, deleted } })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'DELETE_ERROR', message: err?.message || 'Failed to delete social link.' } },
      { status: 500 }
    )
  }
}
