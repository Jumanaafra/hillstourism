import { NextResponse } from 'next/server'
import { getGalleryPhotos } from '@/lib/repositories/gallery.repo'

export const dynamic = 'force-dynamic'


export async function GET() {
  try {
    const photos = await getGalleryPhotos(true)
    return NextResponse.json(
      {
        success: true,
        data: photos,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    )
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Unable to fetch gallery photos.',
        },
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  }
}
