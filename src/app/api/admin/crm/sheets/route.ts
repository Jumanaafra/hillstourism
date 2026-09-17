import { NextRequest } from 'next/server'
import { verifyAdminAuth, adminJsonResponse } from '@/lib/auth/adminAuth'
import { syncSingleEnquiryManual, batchSyncEnquiries } from '@/lib/services/sheets.service'

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
    const { action, enquiryId, mode } = body
    const adminEmail = auth.email || 'admin@hillstourism.com'

    if (action === 'sync_single') {
      if (!enquiryId) {
        return adminJsonResponse(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'enquiryId is required for sync_single.' } },
          { status: 400 }
        )
      }

      const result = await syncSingleEnquiryManual(enquiryId, adminEmail)
      if (!result.success) {
        return adminJsonResponse(
          {
            success: false,
            error: {
              code: 'SHEETS_SYNC_FAILED',
              message: result.error || 'Failed to sync enquiry to Google Sheets.',
            },
            data: { enquiry: result.enquiry },
          },
          { status: 400 }
        )
      }

      return adminJsonResponse({
        success: true,
        data: {
          enquiry: result.enquiry,
          rowNumber: result.rowNumber,
        },
      })
    }

    if (action === 'batch_sync') {
      const syncMode = mode === 'retry_failed' ? 'retry_failed' : 'all_pending'
      const batchResult = await batchSyncEnquiries(syncMode, adminEmail)

      return adminJsonResponse({
        success: true,
        data: batchResult,
      })
    }

    return adminJsonResponse(
      {
        success: false,
        error: {
          code: 'INVALID_ACTION',
          message: 'Invalid action. Must be "sync_single" or "batch_sync".',
        },
      },
      { status: 400 }
    )
  } catch (err: any) {
    console.error('[CRM Sheets API] Error:', err)
    return adminJsonResponse(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: err?.message || 'Internal server error while processing Google Sheets sync.',
        },
      },
      { status: 500 }
    )
  }
}
