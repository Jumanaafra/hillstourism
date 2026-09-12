import { NextResponse } from 'next/server'
import { getVehicles } from '@/lib/repositories/vehicles.repo'

export const dynamic = 'force-dynamic'


export async function GET() {
  try {
    const vehicles = await getVehicles(true)
    return NextResponse.json(
      {
        success: true,
        data: vehicles,
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
          message: 'Unable to fetch vehicles.',
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
