import { describe, it, expect, beforeEach } from 'vitest'
import { checkDateOverlap, calculateNights, calculateStayAvailability } from '../../src/lib/services/availability.service'
import { createHotel, getHotelById, _resetMemoryHotels } from '../../src/lib/repositories/hotels.repo'
import { createEnquiry, _resetMemoryEnquiries } from '../../src/lib/repositories/enquiries.repo'

describe('Room Availability & Date Overlap Algorithm (Step 4 & 8)', () => {
  it('correctly calculates number of nights between check-in and check-out', () => {
    expect(calculateNights('2026-09-20', '2026-09-23')).toBe(3)
    expect(calculateNights('2026-09-20', '2026-09-21')).toBe(1)
    expect(calculateNights('2026-09-20', '2026-09-20')).toBe(0)
    expect(calculateNights('2026-09-23', '2026-09-20')).toBe(0)
  })

  describe('Prompt Required Overlap Test Cases (Case 1 to Case 5)', () => {
    const existingCheckIn = '2026-09-20'
    const existingCheckOut = '2026-09-23'

    it('Case 1: Requested Sep 23 -> Sep 25 (Adjacent after) => AVAILABLE', () => {
      const isOverlap = checkDateOverlap(existingCheckIn, existingCheckOut, '2026-09-23', '2026-09-25')
      expect(isOverlap).toBe(false)
    })

    it('Case 2: Requested Sep 22 -> Sep 25 (Overlaps end) => UNAVAILABLE', () => {
      const isOverlap = checkDateOverlap(existingCheckIn, existingCheckOut, '2026-09-22', '2026-09-25')
      expect(isOverlap).toBe(true)
    })

    it('Case 3: Requested Sep 18 -> Sep 20 (Adjacent before) => AVAILABLE', () => {
      const isOverlap = checkDateOverlap(existingCheckIn, existingCheckOut, '2026-09-18', '2026-09-20')
      expect(isOverlap).toBe(false)
    })

    it('Case 4: Requested Sep 20 -> Sep 23 (Exact match) => UNAVAILABLE', () => {
      const isOverlap = checkDateOverlap(existingCheckIn, existingCheckOut, '2026-09-20', '2026-09-23')
      expect(isOverlap).toBe(true)
    })

    it('Case 5: Requested Sep 21 -> Sep 22 (Enclosed inside) => UNAVAILABLE', () => {
      const isOverlap = checkDateOverlap(existingCheckIn, existingCheckOut, '2026-09-21', '2026-09-22')
      expect(isOverlap).toBe(true)
    })
  })
})

describe('End-to-End Hotel Room Management & Availability Calculation', () => {
  beforeEach(() => {
    _resetMemoryHotels([])
    _resetMemoryEnquiries()
  })

  it('calculates room availability against active booked enquiries', async () => {
    const hotel = await createHotel({
      name: 'The Plantation Hill Resort',
      location: 'Coorg',
      category: 'Premium',
      amenities: ['Pool'],
      active: true,
      rooms: [
        { id: 'room-c01', roomNumber: 'C01', name: 'Premium Cottage', category: 'Premium', capacity: 2, pricePerNight: 4500, status: 'available', layoutOrder: 1, row: 1, column: 1 },
        { id: 'room-c02', roomNumber: 'C02', name: 'Deluxe Cottage', category: 'Deluxe', capacity: 2, pricePerNight: 5000, status: 'available', layoutOrder: 2, row: 1, column: 2 },
        { id: 'room-c03', roomNumber: 'C03', name: 'Maintenance Room', category: 'Normal', capacity: 2, pricePerNight: 3000, status: 'maintenance', layoutOrder: 3, row: 2, column: 1 },
      ],
    })

    // Create an active enquiry for C01 for Sep 20 -> Sep 23
    await createEnquiry({
      customer: { name: 'Anand Kumar', phone: '+919876543210' },
      hotel: { id: hotel.id, nameSnapshot: hotel.name },
      travel: { date: '2026-09-20', groupSize: 2 },
      bookingDetails: {
        checkIn: '2026-09-20',
        checkOut: '2026-09-23',
        nights: 3,
        selectedRooms: [
          { roomId: 'room-c01', roomNumber: 'C01', name: 'Premium Cottage', category: 'Premium', capacity: 2, pricePerNight: 4500 }
        ],
        roomCount: 1,
        categorySummary: { Premium: 1 },
        estimatedAmount: 13500,
      },
      status: 'confirmed',
      integrations: { emailStatus: 'sent', sheetsStatus: 'synced' },
    })

    // Check availability for Sep 21 -> Sep 24
    const res = await calculateStayAvailability(hotel.id, '2026-09-21', '2026-09-24')

    expect(res.rooms.length).toBe(3)

    const c01 = res.rooms.find(r => r.id === 'room-c01')
    expect(c01?.computedStatus).toBe('booked')
    expect(c01?.isAvailable).toBe(false)

    const c02 = res.rooms.find(r => r.id === 'room-c02')
    expect(c02?.computedStatus).toBe('available')
    expect(c02?.isAvailable).toBe(true)

    const c03 = res.rooms.find(r => r.id === 'room-c03')
    expect(c03?.computedStatus).toBe('maintenance')
    expect(c03?.isAvailable).toBe(false)
  })

  it('does NOT block availability for cancelled or spam enquiries', async () => {
    const hotel = await createHotel({
      name: 'Sunset Heights Villa',
      location: 'Munnar',
      category: 'Normal',
      amenities: [],
      active: true,
      rooms: [
        { id: 'room-c01', roomNumber: 'C01', name: 'Cottage 1', category: 'Normal', capacity: 2, pricePerNight: 3500, status: 'available', layoutOrder: 1, row: 1, column: 1 },
      ],
    })

    // Create a CANCELLED enquiry for C01 for Sep 20 -> Sep 23
    await createEnquiry({
      customer: { name: 'Cancelled Guest', phone: '+919876543210' },
      hotel: { id: hotel.id, nameSnapshot: hotel.name },
      travel: { date: '2026-09-20' },
      bookingDetails: {
        checkIn: '2026-09-20',
        checkOut: '2026-09-23',
        nights: 3,
        selectedRooms: [
          { roomId: 'room-c01', roomNumber: 'C01', name: 'Cottage 1', category: 'Normal', capacity: 2, pricePerNight: 3500 }
        ],
        roomCount: 1,
        categorySummary: { Normal: 1 },
        estimatedAmount: 10500,
      },
      status: 'cancelled',
      integrations: {},
    })

    // Check availability for Sep 21 -> Sep 22
    const res = await calculateStayAvailability(hotel.id, '2026-09-21', '2026-09-22')
    const c01 = res.rooms.find(r => r.id === 'room-c01')
    expect(c01?.computedStatus).toBe('available')
    expect(c01?.isAvailable).toBe(true)
  })
})
