import { NextRequest, NextResponse } from 'next/server'
import { EnquiryInputSchema } from '@/lib/validation/enquiry.schema'
import { checkRateLimit } from '@/lib/security/rateLimit'
import { verifyAdminAuth } from '@/lib/auth/adminAuth'
import {
  createEnquiry,
  isRecentDuplicateEnquiry,
  updateEnquiryIntegrations,
  updateEnquiry,
  getEnquiries,
  getEnquiryById,
} from '@/lib/repositories/enquiries.repo'
import { getPackageById } from '@/lib/repositories/packages.repo'
import { getHotelById } from '@/lib/repositories/hotels.repo'
import { getVehicleById } from '@/lib/repositories/vehicles.repo'
import { sendEnquiryEmails } from '@/lib/services/email.service'
import { syncEnquiryToGoogleSheets } from '@/lib/services/sheets.service'
import type { EnquiryStatus } from '@/types/domain'

export const dynamic = 'force-dynamic'

function enquiryResponse(data: any, init?: ResponseInit) {
  const headers = new Headers(init?.headers)
  headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate')
  headers.set('X-Robots-Tag', 'noindex, nofollow')
  return NextResponse.json(data, { ...init, headers })
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting (per client IP or forwarded header)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1'
    const rateCheck = checkRateLimit(`enquiry_${ip}`, { intervalMs: 60000, maxRequests: 5 })
    if (!rateCheck.allowed) {
      return enquiryResponse(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many enquiry attempts. Please wait a moment before trying again.',
          },
        },
        { status: 429 }
      )
    }

    // 2. Parse & Validate Input Body
    let body: any
    try {
      body = await req.json()
    } catch {
      return enquiryResponse(
        {
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'Malformed JSON payload.',
          },
        },
        { status: 400 }
      )
    }

    const parseResult = EnquiryInputSchema.safeParse(body)
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Validation error'
      return enquiryResponse(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: firstError,
            details: parseResult.error.flatten(),
          },
        },
        { status: 400 }
      )
    }

    const data = parseResult.data

    // 3. Anti-Spam Honeypot Verification
    // Return mock success to fool bots (spec §18)
    if (data._hp && data._hp.length > 0) {
      console.warn(`[Anti-Spam] Bot submission blocked from IP: ${ip}`)
      return enquiryResponse(
        {
          success: true,
          data: {
            enquiryId: `HT-${Date.now()}`,
            message: 'Thank you! Your trip enquiry has been received.',
          },
        },
        { status: 200 }
      )
    }

    // 4. Idempotency / Duplicate Check
    const isDuplicate = await isRecentDuplicateEnquiry(data.phone, data.name, 60)
    if (isDuplicate) {
      return enquiryResponse(
        {
          success: true,
          data: {
            message: 'Your enquiry was already received! Our team will contact you shortly.',
            duplicatePrevented: true,
          },
        },
        { status: 200 }
      )
    }

    // 5. Validate and Snapshot Referenced Entities (Package, Hotel, Vehicle)
    let packageSnapshot: { id: string; nameSnapshot?: string } | undefined
    if (data.packageId) {
      const pkg = await getPackageById(data.packageId)
      if (!pkg) {
        return enquiryResponse(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Selected package not found.' } },
          { status: 400 }
        )
      }
      if (!pkg.active) {
        return enquiryResponse(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Selected package is no longer available.' } },
          { status: 400 }
        )
      }
      packageSnapshot = { id: pkg.id, nameSnapshot: pkg.name }
    }

    let hotelSnapshot: { id: string; nameSnapshot?: string } | undefined
    if (data.hotelId) {
      const hotel = await getHotelById(data.hotelId)
      if (!hotel) {
        return enquiryResponse(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Selected hotel not found.' } },
          { status: 400 }
        )
      }
      if (!hotel.active) {
        return enquiryResponse(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Selected hotel is no longer available.' } },
          { status: 400 }
        )
      }
      hotelSnapshot = { id: hotel.id, nameSnapshot: hotel.name }
    }

    let vehicleSnapshot: { id: string; numberPlateSnapshot?: string } | undefined
    if (data.vehicleId) {
      const vehicle = await getVehicleById(data.vehicleId)
      if (!vehicle) {
        return enquiryResponse(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Selected vehicle not found.' } },
          { status: 400 }
        )
      }
      if (!vehicle.active) {
        return enquiryResponse(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Selected vehicle is no longer available.' } },
          { status: 400 }
        )
      }
      vehicleSnapshot = { id: vehicle.id, numberPlateSnapshot: vehicle.numberPlate }
    }

    // 6. Create Firestore Enquiry Record (Primary Source of Truth)
    const createdEnquiry = await createEnquiry({
      customer: {
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
      },
      package: packageSnapshot,
      hotel: hotelSnapshot,
      vehicle: vehicleSnapshot,
      travel: {
        date: data.travelDate || undefined,
        groupSize: typeof data.groupSize === 'number' ? data.groupSize : undefined,
        tripType: data.tripType || undefined,
      },
      message: data.message || undefined,
      source: data.source || 'website',
      status: 'new',
      integrations: {
        emailStatus: 'pending',
        sheetsStatus: 'pending',
      },
    })

    // 7. Resilient External Integrations (Failure Rule Guarantee)
    // Email and Sheets failures MUST NOT delete or report failure to customer!
    const emailPromise = sendEnquiryEmails(createdEnquiry)
      .then(result => {
        const isOverallSuccess = result.internal.success
        return updateEnquiryIntegrations(createdEnquiry.id, {
          emailStatus: isOverallSuccess ? 'sent' : 'failed',
          emailError: !isOverallSuccess ? (result.internal.error || 'Failed to send') : undefined,
        })
      })
      .catch(err => {
        console.error('[Enquiry API] Email integration error:', err)
        return updateEnquiryIntegrations(createdEnquiry.id, {
          emailStatus: 'failed',
          emailError: err?.message || String(err),
        })
      })

    const sheetsPromise = syncEnquiryToGoogleSheets(createdEnquiry)
      .then(result => {
        return updateEnquiryIntegrations(createdEnquiry.id, {
          sheetsStatus: result.success ? 'synced' : 'failed',
          sheetsError: !result.success ? result.error : undefined,
        })
      })
      .catch(err => {
        console.error('[Enquiry API] Sheets integration error:', err)
        return updateEnquiryIntegrations(createdEnquiry.id, {
          sheetsStatus: 'failed',
          sheetsError: err?.message || String(err),
        })
      })

    // Await background tasks without blocking customer on unexpected network hangs
    await Promise.allSettled([emailPromise, sheetsPromise])

    return enquiryResponse(
      {
        success: true,
        data: {
          enquiryId: createdEnquiry.id,
          message: 'Thank you! Your trip enquiry has been received. Our team will contact you within 2 hours.',
        },
      },
      { status: 201 }
    )
  } catch (err: any) {
    console.error('[Enquiry API] Unexpected internal error:', err)
    return enquiryResponse(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred while processing your enquiry. Please try again or WhatsApp us directly.',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/enquiries — Admin only. Returns enquiry list with optional filters.
 */
export async function GET(req: NextRequest) {
  // Require admin auth to read enquiries (spec §27 — every protected API independently verifies)
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return enquiryResponse(
      { success: false, error: { code: 'UNAUTHORIZED', message: auth.error } },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(req.url)
    const status = (searchParams.get('status') as EnquiryStatus) || undefined
    const search = searchParams.get('search') || undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    const list = await getEnquiries({ status, search, limit })
    return enquiryResponse({
      success: true,
      data: list,
    })
  } catch (err: any) {
    return enquiryResponse(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to retrieve enquiries.',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/enquiries — Update enquiry status (Admin only).
 * Body: { id: string, status?: EnquiryStatus, ... }
 */
export async function PATCH(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return enquiryResponse(
      { success: false, error: { code: 'UNAUTHORIZED', message: auth.error } },
      { status: 401 }
    )
  }

  try {
    const body = await req.json()
    const { id, ...updates } = body

    if (!id) {
      return enquiryResponse(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Enquiry ID is required.' } },
        { status: 400 }
      )
    }

    // Validate status if provided
    const validStatuses: EnquiryStatus[] = ['new', 'contacted', 'in_progress', 'closed', 'spam']
    if (updates.status && !validStatuses.includes(updates.status)) {
      return enquiryResponse(
        { success: false, error: { code: 'VALIDATION_ERROR', message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` } },
        { status: 400 }
      )
    }

    const existing = await getEnquiryById(id)
    if (!existing) {
      return enquiryResponse(
        { success: false, error: { code: 'NOT_FOUND', message: `Enquiry ${id} not found.` } },
        { status: 404 }
      )
    }

    // Only allow safe fields to be updated
    const safeUpdates: Record<string, any> = {}
    if (updates.status) safeUpdates.status = updates.status
    if (updates.notes !== undefined) safeUpdates.notes = updates.notes

    const updated = await updateEnquiry(id, safeUpdates)
    return enquiryResponse({ success: true, data: updated })
  } catch (err: any) {
    return enquiryResponse(
      { success: false, error: { code: 'OPERATION_FAILED', message: err?.message || 'Failed to update enquiry.' } },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/enquiries — Archive/delete an enquiry (Admin only).
 * Query: ?id=enquiry-id
 */
export async function DELETE(req: NextRequest) {
  const auth = await verifyAdminAuth(req)
  if (!auth.authenticated) {
    return enquiryResponse(
      { success: false, error: { code: 'UNAUTHORIZED', message: auth.error } },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return enquiryResponse(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Enquiry ID is required.' } },
      { status: 400 }
    )
  }

  const existing = await getEnquiryById(id)
  if (!existing) {
    return enquiryResponse(
      { success: false, error: { code: 'NOT_FOUND', message: `Enquiry ${id} not found.` } },
      { status: 404 }
    )
  }

  // Soft-delete by marking status as 'spam' / archived
  await updateEnquiry(id, { status: 'spam' })
  return enquiryResponse({ success: true, data: { archived: true } })
}
