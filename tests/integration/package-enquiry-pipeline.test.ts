import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '../../src/app/api/enquiries/route'
import { _resetMemoryEnquiries, getEnquiries } from '../../src/lib/repositories/enquiries.repo'
import { _resetMemoryPackages } from '../../src/lib/repositories/packages.repo'
import { _resetMemoryHotels } from '../../src/lib/repositories/hotels.repo'
import { _resetMemoryVehicles } from '../../src/lib/repositories/vehicles.repo'
import * as emailService from '../../src/lib/services/email.service'
import * as sheetsService from '../../src/lib/services/sheets.service'

describe('End-to-End Package Enquiry Pipeline (Package -> Stay -> Fleet -> Enquiry)', () => {
  beforeEach(() => {
    _resetMemoryEnquiries()
    _resetMemoryPackages()
    _resetMemoryHotels()
    _resetMemoryVehicles()
    vi.restoreAllMocks()

    // Mock background email and sheets integrations to resolve successfully
    vi.spyOn(emailService, 'sendEnquiryEmails').mockResolvedValue({
      customer: { success: true },
      internal: { success: true },
    })
    vi.spyOn(sheetsService, 'syncEnquiryToGoogleSheets').mockResolvedValue({
      success: true,
    })
  })

  function createRequest(body: any): NextRequest {
    return new NextRequest(new URL('/api/enquiries', 'http://localhost:3000'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.1.100',
      },
      body: JSON.stringify(body),
    } as any)
  }

  it('submits an enquiry with attached package, hotel, and vehicle selections', async () => {
    const payload = {
      name: 'Rohan Deshmukh',
      phone: '9820098200',
      email: 'rohan.d@example.com',
      travelDate: '2026-11-15',
      groupSize: 2,
      tripType: 'Couple',
      packageId: 'munnar-escape',
      hotelId: 'valley-view-homestay',
      vehicleId: 'innova-crysta',
      message: 'Interested in early sunrise safari at Kolukkumalai.',
      source: 'package-detail',
      _hp: '',
    }

    const req = createRequest(payload)
    const res = await POST(req)

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.enquiryId).toMatch(/^(ENQ|HT)-/)

    // Verify stored enquiry has snapshots of package, hotel, and vehicle
    const allEnquiries = await getEnquiries()
    expect(allEnquiries.length).toBe(1)
    const stored = allEnquiries[0]

    expect(stored.customer.name).toBe('Rohan Deshmukh')
    expect(stored.package).toBeDefined()
    expect(stored.package?.id).toBe('munnar-escape')
    expect(stored.package?.nameSnapshot).toContain('Munnar')

    expect(stored.hotel).toBeDefined()
    expect(stored.hotel?.id).toBe('valley-view-homestay')

    expect(stored.vehicle).toBeDefined()
    expect(stored.vehicle?.id).toBe('innova-crysta')

    // Verify purely enquiry-based: no booking or payment fields exist
    expect((stored as any).bookingId).toBeUndefined()
    expect((stored as any).paymentStatus).toBeUndefined()
    expect((stored as any).creditCard).toBeUndefined()
    expect((stored as any).upiTransactionId).toBeUndefined()
  })

  it('handles package-only enquiry without hotel or vehicle selections', async () => {
    const payload = {
      name: 'Ananya Sen',
      phone: '9830098300',
      email: 'ananya.s@example.com',
      packageId: 'coorg-trails',
      tripType: 'Family',
      groupSize: 4,
      _hp: '',
    }

    const req = createRequest(payload)
    const res = await POST(req)

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)

    const allEnquiries = await getEnquiries()
    expect(allEnquiries.length).toBe(1)
    const stored = allEnquiries[0]
    expect(stored.package?.id).toBe('coorg-trails')
    expect(stored.hotel).toBeUndefined()
    expect(stored.vehicle).toBeUndefined()
  })

  it('rejects enquiry if invalid/inactive package ID is specified', async () => {
    const payload = {
      name: 'Bad Request User',
      phone: '9811198111',
      packageId: 'completely-bogus-package-xyz',
      _hp: '',
    }

    const req = createRequest(payload)
    const res = await POST(req)

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.error.message).toContain('Selected package not found')
  })
})
