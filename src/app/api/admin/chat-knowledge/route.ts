import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth/adminAuth'
import { getChatKnowledge, createChatKnowledge } from '@/lib/repositories/content.repo'

/**
 * GET /api/admin/chat-knowledge — Fetch all chat knowledge entries
 */
export async function GET(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  try {
    const knowledge = await getChatKnowledge(false) // Include inactive for admin
    return NextResponse.json({ success: true, data: knowledge })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to retrieve chat knowledge.' } },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/chat-knowledge — Create new knowledge entry
 */
export async function POST(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  try {
    const body = await req.json()

    if (!body.title || !body.content) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Title and content are required.' } },
        { status: 400 }
      )
    }

    const item = await createChatKnowledge({
      title: body.title.trim(),
      category: body.category || 'general',
      content: body.content.trim(),
      keywords: Array.isArray(body.keywords) ? body.keywords : (body.keywords || '').split(',').map((k: string) => k.trim()).filter(Boolean),
      active: body.active !== undefined ? body.active : true,
    })

    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'OPERATION_FAILED', message: err?.message || 'Failed to create knowledge entry.' } },
      { status: 500 }
    )
  }
}
