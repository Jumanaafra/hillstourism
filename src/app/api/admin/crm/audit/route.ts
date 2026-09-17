import { NextRequest } from 'next/server'
import { verifyAdminAuth, adminJsonResponse } from '@/lib/auth/adminAuth'
import { getAuditLogs } from '@/lib/repositories/audit.repo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/admin/crm/audit — Retrieve recent administrative audit logs.
 */
export async function GET(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return adminJsonResponse(
      { success: false, error: { code: 'UNAUTHORIZED', message: auth.error } },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(req.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    const enquiryId = searchParams.get('enquiryId') || undefined
    const action = searchParams.get('action') || undefined

    const logs = await getAuditLogs({ limit, enquiryId, action })

    return adminJsonResponse({
      success: true,
      data: logs,
    })
  } catch (err: any) {
    console.error('[CRM Audit API] Error:', err)
    return adminJsonResponse(
      { success: false, error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to fetch audit logs.' } },
      { status: 500 }
    )
  }
}
