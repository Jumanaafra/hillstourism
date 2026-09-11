import { NextRequest } from 'next/server'
import { verifyAdminAuth, adminJsonResponse } from '@/lib/auth/adminAuth'
import { deleteCloudinaryAsset, isCloudinaryConfigured } from '@/lib/cloudinary'

export const dynamic = 'force-dynamic'


export async function POST(req: NextRequest) {
  // 1. Strict admin authentication check
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return adminJsonResponse(
      { success: false, error: { code: 'UNAUTHORIZED', message: auth.error || 'Admin authentication required.' } },
      { status: 401 }
    )
  }

  try {
    const body = await req.json()
    const publicId = body?.publicId

    if (!publicId || typeof publicId !== 'string') {
      return adminJsonResponse(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'A valid publicId string is required.' } },
        { status: 400 }
      )
    }

    if (!isCloudinaryConfigured()) {
      return adminJsonResponse(
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
      return adminJsonResponse(
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

    return adminJsonResponse({
      success: true,
      data: deleteResult,
    })
  } catch (err: any) {
    console.error('[Admin Cloudinary Delete API] Error:', err)
    return adminJsonResponse(
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
