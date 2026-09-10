import { NextResponse } from 'next/server'
import { getPackages } from '@/lib/repositories/packages.repo'

export async function GET() {
  try {
    const packages = await getPackages(true)
    return NextResponse.json({
      success: true,
      data: packages,
    })
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
