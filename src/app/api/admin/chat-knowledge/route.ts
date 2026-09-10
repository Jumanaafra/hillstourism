import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth/adminAuth'
import {
  getChatKnowledge,
  createChatKnowledge,
  updateChatKnowledge,
  deleteChatKnowledge,
} from '@/lib/repositories/content.repo'
import type { ChatKnowledge } from '@/types/domain'

const ALLOWED_CATEGORIES: ChatKnowledge['category'][] = [
  'company', 'package', 'hotel', 'vehicle', 'policy', 'faq', 'general',
]

/** Builds a safe ChatKnowledge payload — only known fields accepted. */
function buildKnowledgePayload(data: Record<string, any>): Omit<ChatKnowledge, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    title: String(data.title || '').trim(),
    category: ALLOWED_CATEGORIES.includes(data.category) ? data.category : 'general',
    content: String(data.content || '').trim(),
    keywords: Array.isArray(data.keywords)
      ? data.keywords.map((k: unknown) => String(k).trim()).filter(Boolean)
      : typeof data.keywords === 'string'
        ? data.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
        : [],
    active: data.active !== undefined ? Boolean(data.active) : true,
  }
}

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

    if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Title is required.' } },
        { status: 400 }
      )
    }
    if (!body.content || typeof body.content !== 'string' || !body.content.trim()) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Content is required.' } },
        { status: 400 }
      )
    }

    const item = await createChatKnowledge(buildKnowledgePayload(body))
    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'OPERATION_FAILED', message: err?.message || 'Failed to create knowledge entry.' } },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/chat-knowledge — Update an existing knowledge entry
 */
export async function PATCH(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id } = body
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Knowledge entry ID is required.' } },
        { status: 400 }
      )
    }

    // Build a whitelisted partial update — only pass defined fields
    const updates: Partial<ChatKnowledge> = {}
    if (body.title !== undefined)    updates.title = String(body.title).trim()
    if (body.content !== undefined)  updates.content = String(body.content).trim()
    if (body.category !== undefined) updates.category = ALLOWED_CATEGORIES.includes(body.category) ? body.category : 'general'
    if (body.keywords !== undefined) {
      updates.keywords = Array.isArray(body.keywords)
        ? body.keywords.map((k: unknown) => String(k).trim()).filter(Boolean)
        : String(body.keywords).split(',').map((k: string) => k.trim()).filter(Boolean)
    }
    if (body.active !== undefined) updates.active = Boolean(body.active)

    const updated = await updateChatKnowledge(id, updates)
    return NextResponse.json({ success: true, data: updated })
  } catch (err: any) {
    const isNotFound = err?.message?.includes('not found')
    return NextResponse.json(
      { success: false, error: { code: isNotFound ? 'NOT_FOUND' : 'OPERATION_FAILED', message: err?.message || 'Failed to update knowledge entry.' } },
      { status: isNotFound ? 404 : 500 }
    )
  }
}

/**
 * DELETE /api/admin/chat-knowledge — Delete a knowledge entry by ID
 */
export async function DELETE(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error } }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    let id = searchParams.get('id')

    if (!id) {
      try {
        const body = await req.json()
        id = body?.id ? String(body.id) : null
      } catch {
        // No body
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Knowledge entry ID is required.' } },
        { status: 400 }
      )
    }

    await deleteChatKnowledge(id)
    return NextResponse.json({ success: true, data: { deleted: true, id } })
  } catch (err: any) {
    const isNotFound = err?.message?.includes('not found')
    return NextResponse.json(
      { success: false, error: { code: isNotFound ? 'NOT_FOUND' : 'OPERATION_FAILED', message: err?.message || 'Failed to delete knowledge entry.' } },
      { status: isNotFound ? 404 : 500 }
    )
  }
}
