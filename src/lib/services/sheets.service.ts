import 'server-only'
import { google } from 'googleapis'
import type { Enquiry } from '../../types/domain'

export interface SheetSyncResult {
  success: boolean
  error?: string
  updatedRange?: string
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
    return { success: true, updatedRange: 'Sheet1!A:P (simulated)' }
  }

  privateKey = privateKey.replace(/\\n/g, '\n')

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    // Columns defined by spec.md Section 22
    const rowValues = [
      enquiry.id,
      new Date(enquiry.createdAt).toISOString(),
      enquiry.customer.name,
      enquiry.customer.phone,
      enquiry.customer.email || '',
      enquiry.package?.nameSnapshot || '',
      enquiry.hotel?.nameSnapshot || '',
      enquiry.vehicle?.id || '',
      enquiry.vehicle?.numberPlateSnapshot || '',
      enquiry.travel.date || '',
      enquiry.travel.groupSize?.toString() || '',
      enquiry.message || '',
      enquiry.source || 'website',
      enquiry.status,
      enquiry.integrations.emailStatus || 'pending',
      'synced',
    ]

    const range = process.env.GOOGLE_SHEETS_RANGE || 'Enquiries!A:P'

    const res = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowValues],
      },
    })

    return {
      success: true,
      updatedRange: res.data.updates?.updatedRange || 'appended',
    }
  } catch (err: any) {
    console.error('[Google Sheets] Failed to sync enquiry row:', err)
    return {
      success: false,
      error: err?.message || String(err),
    }
  }
}
