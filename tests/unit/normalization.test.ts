import { describe, it, expect } from 'vitest'
import { normalizeHotelName } from '../../src/lib/normalization/hotel'
import { normalizeNumberPlate } from '../../src/lib/normalization/vehicle'

describe('Hotel Name Normalization Engine', () => {
  it('normalizes uppercase, leading/trailing spaces, and repeated spaces', () => {
    const raw1 = '  Mountain View Resort  '
    const raw2 = 'mountain view resort'
    const raw3 = 'MOUNTAIN VIEW RESORT'
    const raw4 = 'Mountain   View    Resort'

    const norm1 = normalizeHotelName(raw1)
    const norm2 = normalizeHotelName(raw2)
    const norm3 = normalizeHotelName(raw3)
    const norm4 = normalizeHotelName(raw4)

    expect(norm1).toBe('mountain view resort')
    expect(norm2).toBe('mountain view resort')
    expect(norm3).toBe('mountain view resort')
    expect(norm4).toBe('mountain view resort')
    expect(norm1).toBe(norm2)
    expect(norm2).toBe(norm3)
  })

  it('normalizes punctuation and dashes consistently', () => {
    expect(normalizeHotelName('The Coffee-Bungalow!')).toBe('the coffee bungalow')
    expect(normalizeHotelName('Valley & View Homestay')).toBe('valley view homestay')
    expect(normalizeHotelName('Darjeeling Manor, 5-Star')).toBe('darjeeling manor 5 star')
  })

  it('handles empty or non-string inputs safely', () => {
    expect(normalizeHotelName('')).toBe('')
    // @ts-expect-error test undefined
    expect(normalizeHotelName(undefined)).toBe('')
  })
})

describe('Vehicle Number Plate Normalization Engine', () => {
  it('normalizes spaces, lowercase, and hyphens into standard identity', () => {
    const p1 = 'TN 01 AB 1234'
    const p2 = 'tn01ab1234'
    const p3 = 'TN-01-AB-1234'
    const p4 = '  tn - 01 - ab - 1234  '

    const norm1 = normalizeNumberPlate(p1)
    const norm2 = normalizeNumberPlate(p2)
    const norm3 = normalizeNumberPlate(p3)
    const norm4 = normalizeNumberPlate(p4)

    expect(norm1).toBe('TN01AB1234')
    expect(norm2).toBe('TN01AB1234')
    expect(norm3).toBe('TN01AB1234')
    expect(norm4).toBe('TN01AB1234')
  })

  it('handles empty or special character variations gracefully', () => {
    expect(normalizeNumberPlate('')).toBe('')
    expect(normalizeNumberPlate('KL.07.CD.9999')).toBe('KL07CD9999')
  })
})
