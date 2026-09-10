import { NextResponse } from 'next/server'
import { getVehicles } from '@/lib/repositories/vehicles.repo'

export async function GET() {
  try {
    const vehicles = await getVehicles(true)
    return NextResponse.json({
      success: true,
      data: vehicles,
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Unable to fetch vehicles.',
        },
      },
      { status: 500 }
    )
  }
}
