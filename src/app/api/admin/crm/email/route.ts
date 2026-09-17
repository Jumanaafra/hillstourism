import { NextRequest } from 'next/server'
import { verifyAdminAuth, adminJsonResponse } from '@/lib/auth/adminAuth'
import { getEnquiryById } from '@/lib/repositories/enquiries.repo'
import { sendCrmEmail } from '@/lib/services/crm-email.service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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
    const { enquiryId, templateKey, subject, message, customTo } = body

    if (!enquiryId) {
      return adminJsonResponse(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'enquiryId is required.' } },
        { status: 400 }
      )
    }

    if (!subject || !subject.trim()) {
      return adminJsonResponse(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Email subject is required.' } },
        { status: 400 }
      )
    }

    if (!message || !message.trim()) {
      return adminJsonResponse(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Email message body is required.' } },
        { status: 400 }
      )
    }

    const enquiry = await getEnquiryById(enquiryId)
    if (!enquiry) {
      return adminJsonResponse(
        { success: false, error: { code: 'NOT_FOUND', message: `Enquiry ${enquiryId} not found.` } },
        { status: 404 }
      )
    }

    const result = await sendCrmEmail({
      enquiry,
      templateKey: templateKey || 'custom',
      subject,
      message,
      customTo,
      adminEmail: auth.email || 'admin@hillstourism.com',
    })

    if (!result.success) {
      return adminJsonResponse(
        {
          success: false,
          error: {
            code: 'EMAIL_SEND_FAILED',
            message: result.error || 'Failed to dispatch email.',
          },
        },
        { status: 400 }
      )
    }

    // Return the updated enquiry
    const updated = await getEnquiryById(enquiryId)

    return adminJsonResponse({
      success: true,
      data: {
        messageId: result.messageId,
        emailRecord: result.emailRecord,
        enquiry: updated,
      },
    })
  } catch (err: any) {
    console.error('[CRM Email API] Error:', err)
    return adminJsonResponse(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: err?.message || 'Internal server error while sending email.',
        },
      },
      { status: 500 }
    )
  }
}
