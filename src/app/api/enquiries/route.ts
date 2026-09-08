import { NextRequest, NextResponse } from 'next/server'
import { EnquiryInputSchema } from '@/lib/validation/enquiry.schema'
import { checkRateLimit } from '@/lib/security/rateLimit'
import {
  createEnquiry,
  isRecentDuplicateEnquiry,
  updateEnquiryIntegrations,
  getEnquiries,
} from '@/lib/repositories/enquiries.repo'
import { getPackageById } from '@/lib/repositories/packages.repo'
import { getHotelById } from '@/lib/repositories/hotels.repo'
import { getVehicleById } from '@/lib/repositories/vehicles.repo'
import { sendEnquiryEmails } from '@/lib/services/email.service'
import { syncEnquiryToGoogleSheets } from '@/lib/services/sheets.service'
import type { EnquiryStatus } from '@/types/domain'

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting (per client IP or forwarded header)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1'
    const rateCheck = checkRateLimit(`enquiry_${ip}`, { intervalMs: 60000, maxRequests: 5 })
    if (!rateCheck.allowed) {
      return NextResponse.json(
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
      return NextResponse.json(
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
      return NextResponse.json(
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
    if (data._hp && data._hp.length > 0) {
      console.warn(`[Anti-Spam] Bot submission blocked from IP: ${ip}`)
      // Silently accept spam or reject with generic message
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SPAM_DETECTED',
            message: 'Invalid submission.',
          },
        },
        { status: 400 }
      )
    }

    // 4. Idempotency / Duplicate Check
    const isDuplicate = await isRecentDuplicateEnquiry(data.phone, data.name, 60)
    if (isDuplicate) {
      return NextResponse.json(
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
      if (pkg) {
        packageSnapshot = { id: pkg.id, nameSnapshot: pkg.name }
      }
    }

    let hotelSnapshot: { id: string; nameSnapshot?: string } | undefined
    if (data.hotelId) {
      const hotel = await getHotelById(data.hotelId)
      if (hotel) {
        hotelSnapshot = { id: hotel.id, nameSnapshot: hotel.name }
      }
    }

    let vehicleSnapshot: { id: string; numberPlateSnapshot?: string } | undefined
    if (data.vehicleId) {
      const vehicle = await getVehicleById(data.vehicleId)
      if (vehicle) {
        vehicleSnapshot = { id: vehicle.id, numberPlateSnapshot: vehicle.numberPlate }
      }
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

    return NextResponse.json(
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
    return NextResponse.json(
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = (searchParams.get('status') as EnquiryStatus) || undefined
    const search = searchParams.get('search') || undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    const list = await getEnquiries({ status, search, limit })
    return NextResponse.json({
      success: true,
      data: list,
    })
  } catch (err: any) {
    return NextResponse.json(
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
