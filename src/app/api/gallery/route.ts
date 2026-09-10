import { NextResponse } from 'next/server'
import { getGalleryPhotos } from '@/lib/repositories/gallery.repo'

export async function GET() {
  try {
    const photos = await getGalleryPhotos(true)
    return NextResponse.json({
      success: true,
      data: photos,
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Unable to fetch gallery photos.',
        },
      },
      { status: 500 }
    )
  }
}
