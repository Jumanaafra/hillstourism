import { NextResponse } from 'next/server'
import { getHotels } from '@/lib/repositories/hotels.repo'

export async function GET() {
  try {
    const hotels = await getHotels(true)
    return NextResponse.json({
      success: true,
      data: hotels,
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Unable to fetch hotels.',
        },
      },
      { status: 500 }
    )
  }
}
