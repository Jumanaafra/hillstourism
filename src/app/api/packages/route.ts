import { NextResponse } from 'next/server'
import { getPackages } from '@/lib/repositories/packages.repo'

export async function GET() {
  try {
    const packages = await getPackages(true)
    return NextResponse.json(
      {
        success: true,
        data: packages,
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
          message: 'Unable to fetch packages.',
        },
      },
      { status: 500 }
    )
  }
}
