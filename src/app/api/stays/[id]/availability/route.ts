import { NextRequest, NextResponse } from 'next/server'
import { calculateStayAvailability } from '@/lib/services/availability.service'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const checkIn = searchParams.get('checkIn') || undefined
    const checkOut = searchParams.get('checkOut') || undefined

    if (checkIn && checkOut) {
      const dIn = new Date(checkIn)
      const dOut = new Date(checkOut)
      if (isNaN(dIn.getTime()) || isNaN(dOut.getTime())) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_DATES', message: 'Invalid date formats provided.' } },
          { status: 400 }
        )
      }
      if (dIn >= dOut) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_RANGE', message: 'Check-in date must be before check-out date.' } },
          { status: 400 }
        )
      }
    }

    const availability = await calculateStayAvailability(params.id, checkIn, checkOut)

    return NextResponse.json({
      success: true,
      data: availability,
    })
  } catch (err: any) {
    console.error(`[Availability API] Error for stay ${params.id}:`, err)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'AVAILABILITY_ERROR',
          message: err?.message || 'Failed to calculate room availability.',
        },
      },
      { status: 500 }
    )
  }
}
