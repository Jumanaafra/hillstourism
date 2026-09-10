import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth/adminAuth'
import { deleteCloudinaryAsset, isCloudinaryConfigured } from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  // 1. Strict admin authentication check
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: auth.error || 'Admin authentication required.' } },
      { status: 401 }
    )
  }

  try {
    const body = await req.json()
    const publicId = body?.publicId

    if (!publicId || typeof publicId !== 'string') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'A valid publicId string is required.' } },
        { status: 400 }
      )
    }

    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CLOUDINARY_NOT_CONFIGURED',
            message: 'Cloudinary credentials are not configured.',
          },
        },
        { status: 503 }
      )
    }

    const deleteResult = await deleteCloudinaryAsset(publicId)

    if (!deleteResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DELETE_FAILED',
            message: deleteResult.error || 'Failed to delete asset from Cloudinary.',
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: deleteResult,
    })
  } catch (err: any) {
    console.error('[Admin Cloudinary Delete API] Error:', err)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'OPERATION_FAILED',
          message: err?.message || 'An error occurred while deleting the asset.',
        },
      },
      { status: 500 }
    )
  }
}
