import { NextResponse } from 'next/server'
import { getSocialLinks } from '@/lib/repositories/social.repo'

export const dynamic = 'force-dynamic'

/**
 * GET /api/social-links — Public endpoint to retrieve active social links for Navbar, Footer, etc.
 */
export async function GET() {
  try {
    const links = await getSocialLinks(true)
    return NextResponse.json(
      { success: true, data: links },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    )
  } catch (err: any) {
    console.error('[Public Social Links API] Error:', err)
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch social links.' } },
      { status: 500 }
    )
  }
}
