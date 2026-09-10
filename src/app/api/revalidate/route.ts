import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret') || req.nextUrl.searchParams.get('secret')
  const expectedSecret = process.env.REVALIDATE_SECRET || 'hillstourism-cache-secret'

  if (secret !== expectedSecret) {
    return NextResponse.json({ success: false, error: 'Unauthorized revalidation request' }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const path = body?.path || req.nextUrl.searchParams.get('path')
    const tag = body?.tag || req.nextUrl.searchParams.get('tag')

    if (tag) {
      revalidateTag(tag)
    }

    if (path) {
      revalidatePath(path)
    } else {
      // Bulk revalidation — invalidate all major public cached pages
      revalidatePath('/')
      revalidatePath('/packages')
      revalidatePath('/stays')
      revalidatePath('/vehicles')
      revalidatePath('/gallery')
    }

    return NextResponse.json({
      success: true,
      revalidated: true,
      target: { path, tag },
      now: Date.now(),
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Revalidation failed' }, { status: 500 })
  }
}
