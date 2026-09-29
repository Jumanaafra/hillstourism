import { describe, expect, it } from 'vitest'
import { parsePerPersonPrice } from '../../src/lib/itineraryPricing'

describe('itinerary price editing', () => {
  it('accepts one edited per-person amount', () => {
    expect(parsePerPersonPrice('₹4,567')).toBe(4567)
    expect(parsePerPersonPrice('Rs 2,299 onwards')).toBe(2299)
  })

  it('requires staff to choose a rate when a package advertises multiple options', () => {
    expect(parsePerPersonPrice('₹1,800 tent / ₹2,800 A-Frame')).toBeNull()
    expect(parsePerPersonPrice('')).toBeNull()
  })
})
