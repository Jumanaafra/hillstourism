import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth/adminAuth'
import { uploadImageBuffer, isCloudinaryConfigured, validateImageFile } from '@/lib/cloudinary'

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
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'content'
    const alt = (formData.get('alt') as string) || ''

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_FILE', message: 'No image file was provided in the upload.' } },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const mimeType = file.type || 'image/jpeg'

    // 2. Validate file integrity and size
    const validation = validateImageFile(buffer, mimeType)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: validation.error } },
        { status: 400 }
      )
    }

    // 3. Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CLOUDINARY_NOT_CONFIGURED',
            message: 'Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not configured in environment variables.',
          },
        },
        { status: 503 }
      )
    }

    // 4. Upload to Cloudinary
    const result = await uploadImageBuffer(buffer, mimeType, {
      folder: `hills-tourism/${folder.replace(/^hills-tourism\/?/, '')}`,
      alt,
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (err: any) {
    console.error('[Admin Upload API] Error uploading file:', err)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: err?.message || 'An error occurred while uploading the image to Cloudinary.',
        },
      },
      { status: 500 }
    )
  }
}
