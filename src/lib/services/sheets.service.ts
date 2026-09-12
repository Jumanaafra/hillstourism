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

    return {
      success: true,
      updatedRange: res.data.updates?.updatedRange || targetRange,
    }
  } catch (err: any) {
    console.error('[Google Sheets] Failed to sync enquiry row:', err?.message || err)
    return {
      success: false,
      error: err?.message || String(err),
    }
  }
}
