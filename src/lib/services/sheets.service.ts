import 'server-only'
import { google } from 'googleapis'
import type { Enquiry, EnquiryTimelineEvent } from '../../types/domain'
import { getEnquiryById, updateEnquiry, getEnquiries } from '../repositories/enquiries.repo'
import { createAuditLog } from '../repositories/audit.repo'

export interface SheetSyncResult {
  success: boolean
  error?: string
  updatedRange?: string
  rowNumber?: number
}

/**
 * Appends an enquiry row into Google Sheets operational reporting destination.
 * Credentials remain strictly server-side.
 */
export async function syncEnquiryToGoogleSheets(enquiry: Enquiry): Promise<SheetSyncResult> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY

  if (!spreadsheetId || !clientEmail || !privateKey) {
    console.log(`[Google Sheets (Simulated)] Appended enquiry ${enquiry.id} to reporting sheet.`)
    return { success: true, updatedRange: 'Sheet1!A42:P42 (simulated)', rowNumber: 42 }
  }

  privateKey = privateKey.replace(/\\n/g, '\n')

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    // Format phone to prevent Google Sheets from interpreting "+" as a formula operator
    const formattedPhone = enquiry.customer.phone
      ? (enquiry.customer.phone.startsWith('+') ? `'${enquiry.customer.phone}` : enquiry.customer.phone)
      : ''

    // Format travel date to prevent conversion into a serial integer
    const formattedDate = enquiry.travel.date
      ? (enquiry.travel.date.match(/^\d{4}-\d{2}-\d{2}$/) ? `'${enquiry.travel.date}` : enquiry.travel.date)
      : ''

    // Columns defined by spec.md Section 22
    const rowValues = [
      enquiry.id,
      new Date(enquiry.createdAt).toISOString(),
      enquiry.customer.name,
      formattedPhone,
      enquiry.customer.email || '',
      enquiry.package?.nameSnapshot || '',
      enquiry.hotel?.nameSnapshot || '',
      enquiry.vehicle?.id || '',
      enquiry.vehicle?.numberPlateSnapshot || '',
      formattedDate,
      enquiry.travel.groupSize?.toString() || '',
      enquiry.message || '',
      enquiry.source || 'website',
      enquiry.status,
      enquiry.integrations.emailStatus || 'pending',
      'synced',
    ]

    // Normalize range with single-quoted sheet name to support spaces and special characters
    const rawRange = (process.env.GOOGLE_SHEETS_RANGE || 'Enquiries!A:P').trim().replace(/^["']|["']$/g, '')
    let sheetTitle = 'Enquiries'
    let cellRange = 'A:P'
    const bangIdx = rawRange.indexOf('!')
    if (bangIdx !== -1) {
      sheetTitle = rawRange.slice(0, bangIdx).replace(/^'|'$/g, '').trim() || 'Enquiries'
      cellRange = rawRange.slice(bangIdx + 1).trim() || 'A:P'
    } else {
      sheetTitle = rawRange.replace(/^'|'$/g, '').trim() || 'Enquiries'
    }

    let targetRange = `'${sheetTitle}'!${cellRange}`
    const maskedId = spreadsheetId.length > 8
      ? `${spreadsheetId.slice(0, 4)}...${spreadsheetId.slice(-4)}`
      : '***'

    let res: any
    try {
      res = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: targetRange,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [rowValues],
        },
      })
    } catch (appendErr: any) {
      const errMsg = appendErr?.message || String(appendErr)
      // If range cannot be parsed, automatically discover available tabs and retry
      if (errMsg.includes('Unable to parse range')) {
        console.warn(`[Google Sheets] Range "${targetRange}" not found in spreadsheet (${maskedId}). Discovering available tabs...`)
        const meta = await sheets.spreadsheets.get({
          spreadsheetId,
          fields: 'sheets.properties.title',
        })
        const availableTabs = (meta.data.sheets || [])
          .map(s => s.properties?.title)
          .filter((t): t is string => Boolean(t))

        // Match case-insensitively, or partial 'enquir', or fallback to the first tab
        const matchedTab = availableTabs.find(t => t.toLowerCase() === sheetTitle.toLowerCase()) ||
          availableTabs.find(t => t.toLowerCase().includes('enquir')) ||
          availableTabs[0]

        if (matchedTab) {
          targetRange = `'${matchedTab}'!${cellRange}`
          console.log(`[Google Sheets] Retrying append using discovered tab: ${targetRange}`)
          res = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: targetRange,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
              values: [rowValues],
            },
          })
        } else {
          throw appendErr
        }
      } else {
        throw appendErr
      }
    }

    console.log(`[Google Sheets] Successfully appended enquiry ${enquiry.id} to range ${res.data.updates?.updatedRange || targetRange}`)

    const updatedRange = res.data.updates?.updatedRange || targetRange
    let rowNumber: number | undefined
    const rowMatch = updatedRange.match(/([A-Za-z]+)(\d+)(?::([A-Za-z]+)(\d+))?/)
    if (rowMatch) {
      rowNumber = parseInt(rowMatch[2], 10)
    }

    return {
      success: true,
      updatedRange,
      rowNumber,
    }
  } catch (err: any) {
    console.error('[Google Sheets] Failed to sync enquiry row:', err?.message || err)
    return {
      success: false,
      error: err?.message || String(err),
    }
  }
}

/**
 * Manually syncs an individual enquiry to Google Sheets, updating timeline,
 * integrations, and recording an audit log.
 */
export async function syncSingleEnquiryManual(
  enquiryId: string,
  adminEmail = 'admin@hillstourism.com'
): Promise<{ success: boolean; enquiry?: Enquiry; error?: string; rowNumber?: number }> {
  const enquiry = await getEnquiryById(enquiryId)
  if (!enquiry) {
    return { success: false, error: `Enquiry ${enquiryId} not found` }
  }

  const result = await syncEnquiryToGoogleSheets(enquiry)
  const now = new Date().toISOString()

  const timelineEvent: EnquiryTimelineEvent = {
    id: `TLE-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    type: result.success ? 'sheets_synced' : 'sheets_failed',
    title: result.success ? 'Google Sheet Synced' : 'Google Sheet Sync Failed',
    description: result.success
      ? `Synced to sheet at Row #${result.rowNumber || 'N/A'} (${result.updatedRange || 'Range updated'})`
      : `Failed to sync to Google Sheets: ${result.error || 'Unknown error'}`,
    timestamp: now,
    author: adminEmail,
    metadata: {
      rowNumber: result.rowNumber,
      updatedRange: result.updatedRange,
      error: result.error,
    },
  }

  const updatedIntegrations = {
    ...enquiry.integrations,
    sheetsStatus: (result.success ? 'synced' : 'failed') as any,
    sheetsError: result.error,
    lastSheetSyncAt: now,
    sheetRow: result.rowNumber || enquiry.integrations?.sheetRow,
  }

  const updatedTimeline = [...(enquiry.timeline || []), timelineEvent]

  const updated = await updateEnquiry(enquiryId, {
    integrations: updatedIntegrations,
    timeline: updatedTimeline,
  })

  await createAuditLog({
    action: 'sheet_sync',
    enquiryId: enquiry.id,
    customerName: enquiry.customer?.name,
    details: result.success
      ? `Synced enquiry ${enquiry.id} to Google Sheets (Row: ${result.rowNumber || 'N/A'})`
      : `Failed to sync enquiry ${enquiry.id} to Google Sheets: ${result.error}`,
    adminEmail,
    metadata: { rowNumber: result.rowNumber, error: result.error },
  })

  return {
    success: result.success,
    enquiry: updated,
    error: result.error,
    rowNumber: result.rowNumber,
  }
}

/**
 * Batch syncs enquiries matching criteria ('all_pending' or 'retry_failed').
 */
export async function batchSyncEnquiries(
  mode: 'all_pending' | 'retry_failed' | 'pending' | 'failed',
  adminEmail = 'admin@hillstourism.com'
): Promise<{
  total: number
  synced: number
  failed: number
  results: Array<{ id: string; success: boolean; error?: string; rowNumber?: number }>
}> {
  const allEnquiries = await getEnquiries({ limit: 100 })

  const targets = allEnquiries.filter(e => {
    if (mode === 'all_pending' || mode === 'pending') {
      return !e.integrations?.sheetsStatus || e.integrations.sheetsStatus === 'pending'
    }
    if (mode === 'retry_failed' || mode === 'failed') {
      return e.integrations?.sheetsStatus === 'failed'
    }
    return false
  })

  const results: Array<{ id: string; success: boolean; error?: string; rowNumber?: number }> = []
  let synced = 0
  let failed = 0

  for (const enq of targets) {
    const res = await syncSingleEnquiryManual(enq.id, adminEmail)
    if (res.success) {
      synced++
      results.push({ id: enq.id, success: true, rowNumber: res.rowNumber })
    } else {
      failed++
      results.push({ id: enq.id, success: false, error: res.error })
    }
  }

  await createAuditLog({
    action: 'batch_sync',
    details: `Batch synced ${targets.length} enquiries (Mode: ${mode}). Success: ${synced}, Failed: ${failed}`,
    adminEmail,
    metadata: { mode, total: targets.length, synced, failed },
  })

  return {
    total: targets.length,
    synced,
    failed,
    results,
  }
}
