import { getHotelById } from '../repositories/hotels.repo'
import { getEnquiries } from '../repositories/enquiries.repo'
import type { Room, RoomStatus } from '../../types/domain'

export interface ComputedRoomStatus extends Room {
  computedStatus: 'available' | 'selected' | 'booked' | 'maintenance' | 'unselected'
  isAvailable: boolean
  unavailableReason?: string
}

export interface AvailabilityResult {
  stayId: string
  stayName: string
  checkIn?: string
  checkOut?: string
  nights: number
  rooms: ComputedRoomStatus[]
}

/**
 * Checks whether two YYYY-MM-DD date ranges overlap.
 * Rule: existingCheckIn < requestedCheckOut AND existingCheckOut > requestedCheckIn
 */
export function checkDateOverlap(
  existingCheckIn: string,
  existingCheckOut: string,
  requestedCheckIn: string,
  requestedCheckOut: string
): boolean {
  if (!existingCheckIn || !existingCheckOut || !requestedCheckIn || !requestedCheckOut) {
    return false
  }
  const eIn = new Date(existingCheckIn).getTime()
  const eOut = new Date(existingCheckOut).getTime()
  const rIn = new Date(requestedCheckIn).getTime()
  const rOut = new Date(requestedCheckOut).getTime()

  if (isNaN(eIn) || isNaN(eOut) || isNaN(rIn) || isNaN(rOut)) {
    return false
  }

  return eIn < rOut && eOut > rIn
}

/**
 * Calculates number of nights between check-in and check-out dates.
 */
export function calculateNights(checkInStr: string, checkOutStr: string): number {
  if (!checkInStr || !checkOutStr) return 0
  const dIn = new Date(checkInStr)
  const dOut = new Date(checkOutStr)
  const diffTime = dOut.getTime() - dIn.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

/**
 * Server-side calculation of room availability for a stay within a requested date range.
 */
export async function calculateStayAvailability(
  stayId: string,
  checkIn?: string,
  checkOut?: string
): Promise<AvailabilityResult> {
  const hotel = await getHotelById(stayId)
  if (!hotel) {
    throw new Error(`Stay with ID or slug "${stayId}" not found`)
  }

  const allRooms: Room[] = (hotel.rooms || []).filter(r => r.status !== 'hidden')
  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0

  // Fetch enquiries for this stay to check booked date overlaps
  const blockingEnquiries = await getEnquiries().catch(() => [])

  // Filter enquiries relevant to this stay with non-cancelled statuses
  const activeBookings = blockingEnquiries.filter(e => {
    // Exclude cancelled or spam
    if (e.status === 'cancelled' || e.status === 'spam') {
      return false
    }
    // Match hotel ID or hotel snapshot ID
    const isHotelMatch = e.hotel?.id === hotel.id || e.hotel?.id === stayId
    if (!isHotelMatch) return false

    // Check if enquiry has dates & room booking details
    const eCheckIn = e.bookingDetails?.checkIn || e.travel?.date
    const eCheckOut = e.bookingDetails?.checkOut
    if (!eCheckIn || !eCheckOut || !checkIn || !checkOut) return false

    return checkDateOverlap(eCheckIn, eCheckOut, checkIn, checkOut)
  })

  // Set of room IDs that have booked date overlaps
  const bookedRoomIds = new Set<string>()
  activeBookings.forEach(b => {
    if (b.bookingDetails?.selectedRooms) {
      b.bookingDetails.selectedRooms.forEach(sr => bookedRoomIds.add(sr.roomId))
    }
  })

  const computedRooms: ComputedRoomStatus[] = allRooms.map(room => {
    if (room.status === 'maintenance') {
      return {
        ...room,
        computedStatus: 'maintenance',
        isAvailable: false,
        unavailableReason: 'Under maintenance',
      }
    }

    const isBooked = bookedRoomIds.has(room.id)
    if (isBooked) {
      return {
        ...room,
        computedStatus: 'booked',
        isAvailable: false,
        unavailableReason: 'Booked for selected dates',
      }
    }

    return {
      ...room,
      computedStatus: 'available',
      isAvailable: true,
    }
  })

  return {
    stayId: hotel.id,
    stayName: hotel.name,
    checkIn,
    checkOut,
    nights,
    rooms: computedRooms,
  }
}
