import { NextRequest } from 'next/server'
import { verifyAdminAuth, adminJsonResponse } from '@/lib/auth/adminAuth'
import { addEnquiryNote, updateEnquiryNote, deleteEnquiryNote } from '@/lib/repositories/enquiries.repo'
import { createAuditLog } from '@/lib/repositories/audit.repo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * POST /api/admin/crm/notes — Add internal note to an enquiry.
 */
export async function POST(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return adminJsonResponse(
      { success: false, error: { code: 'UNAUTHORIZED', message: auth.error } },
      { status: 401 }
    )
  }

  try {
    const body = await req.json()
    const { enquiryId, content } = body

    if (!enquiryId || !content || !content.trim()) {
      return adminJsonResponse(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'enquiryId and note content are required.' } },
        { status: 400 }
      )
    }

    const adminEmail = auth.email || 'admin@hillstourism.com'
    const result = await addEnquiryNote(enquiryId, {
      content: content.trim(),
      author: adminEmail,
    })

    await createAuditLog({
      action: 'note_added',
      enquiryId,
      customerName: result.enquiry.customer?.name,
      details: `Added note: "${content.trim().slice(0, 80)}${content.trim().length > 80 ? '...' : ''}"`,
      adminEmail,
      metadata: { noteId: result.note.id },
    })

    return adminJsonResponse({
      success: true,
      data: {
        note: result.note,
        enquiry: result.enquiry,
      },
    })
  } catch (err: any) {
    console.error('[CRM Notes API] POST Error:', err)
    return adminJsonResponse(
      { success: false, error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to add note.' } },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/crm/notes — Edit existing note.
 */
export async function PATCH(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return adminJsonResponse(
      { success: false, error: { code: 'UNAUTHORIZED', message: auth.error } },
      { status: 401 }
    )
  }

  try {
    const body = await req.json()
    const { enquiryId, noteId, content } = body

    if (!enquiryId || !noteId || !content || !content.trim()) {
      return adminJsonResponse(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'enquiryId, noteId, and content are required.' } },
        { status: 400 }
      )
    }

    const result = await updateEnquiryNote(enquiryId, noteId, content.trim())
    return adminJsonResponse({
      success: true,
      data: {
        note: result.note,
        enquiry: result.enquiry,
      },
    })
  } catch (err: any) {
    console.error('[CRM Notes API] PATCH Error:', err)
    return adminJsonResponse(
      { success: false, error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to update note.' } },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/crm/notes — Delete a note.
 */
export async function DELETE(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return adminJsonResponse(
      { success: false, error: { code: 'UNAUTHORIZED', message: auth.error } },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(req.url)
    const enquiryId = searchParams.get('enquiryId')
    const noteId = searchParams.get('noteId')

    if (!enquiryId || !noteId) {
      return adminJsonResponse(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'enquiryId and noteId query parameters are required.' } },
        { status: 400 }
      )
    }

    const updated = await deleteEnquiryNote(enquiryId, noteId)
    return adminJsonResponse({
      success: true,
      data: {
        enquiry: updated,
      },
    })
  } catch (err: any) {
    console.error('[CRM Notes API] DELETE Error:', err)
    return adminJsonResponse(
      { success: false, error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to delete note.' } },
      { status: 500 }
    )
  }
}
